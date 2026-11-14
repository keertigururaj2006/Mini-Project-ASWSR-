import { Router } from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  moveApplicationStage,
  notifyRole,
  notifyUser,
  writeAudit,
} from "../services/records.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
    if (!allowed.has(file.mimetype))
      return callback(
        new HttpError(415, "Only PDF, JPG and PNG files are accepted."),
      );
    callback(null, true);
  },
});

const reviewSchema = z.object({
  decision: z.enum(["VERIFIED", "CLARIFICATION_REQUESTED", "REJECTED"]),
  reason: z.string().trim().max(1500).optional().default(""),
  notes: z.string().trim().max(1500).optional().default(""),
});

router.use(authenticate);

function canonicalDocumentName(value) {
  const key = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const aliases = {
    "10thmarkscard": "10th Standard Marks Card",
    "10thmarksheet": "10th Standard Marks Card",
    "10thstandardmarkscard": "10th Standard Marks Card",
    "12thmarkscard": "12th / PUC Marks Card",
    "12thmarksheet": "12th / PUC Marks Card",
    "12thpucmarkscard": "12th / PUC Marks Card",
    leavingcertificate: "Leaving Certificate",
    degreecertificate: "Degree Certificate",
    degreemarkscards: "Degree Certificate",
    hostelapplication: "Hostel Application",
    messapplication: "Mess Application",
  };
  return aliases[key] || String(value).trim();
}

function isAllowedFile(file) {
  const buffer = file.buffer;
  if (file.mimetype === "application/pdf")
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (file.mimetype === "image/png")
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === "image/jpeg")
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return false;
}

async function assertApplicationAccess(
  connection,
  applicationId,
  auth,
  applicantOnly = false,
) {
  const [rows] = await connection.execute(
    "SELECT id, application_number, applicant_id, status, current_stage_code FROM applications WHERE id = ? LIMIT 1",
    [applicationId],
  );
  const application = rows[0];
  if (!application) throw new HttpError(404, "Application not found.");
  if (auth.role === "APPLICANT") {
    if (String(application.applicant_id) !== auth.userId)
      throw new HttpError(404, "Application not found.");
  } else if (
    applicantOnly ||
    !["ADMIN", "ADMISSION_OFFICER", "EVALUATOR"].includes(auth.role)
  ) {
    throw new HttpError(403, "You do not have access to this application.");
  } else if (auth.role === "EVALUATOR") {
    const [assignments] = await connection.execute(
      "SELECT id FROM evaluator_assignments WHERE application_id = ? AND evaluator_user_id = ? AND is_active = 1 LIMIT 1",
      [applicationId, auth.userId],
    );
    if (!assignments[0])
      throw new HttpError(403, "This application is not assigned to you.");
  }
  return application;
}

router.get(
  "/applications/:applicationId",
  asyncHandler(async (req, res) => {
    await assertApplicationAccess(pool, req.params.applicationId, req.auth);
    const [rows] = await pool.execute(
      `SELECT ad.id, ad.document_type_id AS documentTypeId, dt.name AS documentType,
            dt.code AS documentTypeCode, ad.original_filename AS fileName,
            ad.mime_type AS mimeType, ad.size_bytes AS sizeBytes, ad.status,
            ad.version_number AS version, ad.is_latest AS isLatest, ad.uploaded_at AS uploadedAt,
            dr.reason AS latestReason, dr.notes AS latestNotes, dr.reviewed_at AS reviewedAt,
            reviewer.full_name AS reviewedBy
     FROM application_documents ad
     JOIN document_types dt ON dt.id = ad.document_type_id
     LEFT JOIN document_reviews dr ON dr.id = (
       SELECT MAX(dr2.id) FROM document_reviews dr2 WHERE dr2.application_document_id = ad.id
     )
     LEFT JOIN users reviewer ON reviewer.id = dr.reviewer_user_id
     WHERE ad.application_id = ? AND ad.is_latest = 1 ORDER BY dt.name`,
      [req.params.applicationId],
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/applications/:applicationId",
  authorize("APPLICANT"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file)
      throw new HttpError(400, "Choose a document file to upload.");
    if (!isAllowedFile(req.file))
      throw new HttpError(
        415,
        "The file content does not match its declared PDF, JPG or PNG format.",
      );
    const documentTypeName = canonicalDocumentName(req.body.documentType || "");
    if (!documentTypeName)
      throw new HttpError(
        422,
        "Choose the type of document you are uploading.",
      );
    const connection = await pool.getConnection();
    let savedPath = null;
    try {
      await connection.beginTransaction();
      const application = await assertApplicationAccess(
        connection,
        req.params.applicationId,
        req.auth,
        true,
      );
      if (!["DRAFT", "DOCUMENT_VERIFICATION"].includes(application.status)) {
        throw new HttpError(
          409,
          "Documents cannot be uploaded at this application stage.",
        );
      }
      const [types] = await connection.execute(
        `SELECT id, name FROM document_types WHERE LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?) LIMIT 1`,
        [
          documentTypeName,
          documentTypeName.replace(/[^a-z0-9]+/gi, "_").toUpperCase(),
        ],
      );
      if (!types[0])
        throw new HttpError(
          422,
          "This document type is not configured. Contact the admission office.",
        );

      const [versions] = await connection.execute(
        `SELECT COALESCE(MAX(version_number), 0) AS latestVersion FROM application_documents
       WHERE application_id = ? AND document_type_id = ?`,
        [application.id, types[0].id],
      );
      const version = Number(versions[0].latestVersion || 0) + 1;
      const extension =
        req.file.mimetype === "application/pdf"
          ? ".pdf"
          : req.file.mimetype === "image/png"
            ? ".png"
            : ".jpg";
      await fs.mkdir(env.uploadDirectory, { recursive: true });
      const storedName = `${crypto.randomUUID()}${extension}`;
      savedPath = path.join(env.uploadDirectory, storedName);
      await fs.writeFile(savedPath, req.file.buffer, {
        flag: "wx",
        mode: 0o600,
      });

      await connection.execute(
        "UPDATE application_documents SET is_latest = 0 WHERE application_id = ? AND document_type_id = ? AND is_latest = 1",
        [application.id, types[0].id],
      );
      const [insert] = await connection.execute(
        `INSERT INTO application_documents
       (application_id, document_type_id, original_filename, stored_filename, storage_path, mime_type, size_bytes, status, version_number, is_latest, uploaded_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 1, ?)`,
        [
          application.id,
          types[0].id,
          req.file.originalname,
          storedName,
          savedPath,
          req.file.mimetype,
          req.file.size,
          version,
          req.auth.userId,
        ],
      );
      await connection.execute(
        `UPDATE clarification_requests SET status = 'RESPONSE_RECEIVED', updated_at = CURRENT_TIMESTAMP
       WHERE application_id = ? AND application_document_id IN (
         SELECT id FROM application_documents WHERE application_id = ? AND document_type_id = ? AND id <> ?
       ) AND status = 'WAITING_FOR_APPLICANT'`,
        [application.id, application.id, types[0].id, insert.insertId],
      );
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "APPLICATION_DOCUMENT_UPLOADED",
        entityType: "APPLICATION_DOCUMENT",
        entityId: insert.insertId,
        metadata: {
          applicationId: application.id,
          documentType: types[0].name,
          version,
          fileName: req.file.originalname,
        },
        ipAddress: req.ip,
      });
      await notifyUser(connection, {
        recipientUserId: application.applicant_id,
        actorUserId: req.auth.userId,
        title: "Document uploaded",
        message: `${types[0].name} was uploaded to your application and is waiting for verification.`,
        type: "DOCUMENT",
        applicationId: application.id,
        route: "/applicant/dashboard",
      });
      if (application.status === "DOCUMENT_VERIFICATION") {
        await notifyRole(connection, "ADMISSION_OFFICER", {
          actorUserId: req.auth.userId,
          title: "Applicant document uploaded",
          message: `${types[0].name} was uploaded or resubmitted for ${application.application_number}.`,
          type: "DOCUMENT",
          applicationId: application.id,
          route: "/admission-officer/dashboard",
        });
      }
      await connection.commit();
      return sendOk(
        res,
        {
          id: insert.insertId,
          documentType: types[0].name,
          fileName: req.file.originalname,
          status: "PENDING",
          version,
        },
        201,
        "Document uploaded.",
      );
    } catch (error) {
      await connection.rollback();
      if (savedPath) await fs.rm(savedPath, { force: true }).catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/:documentId/download",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT ad.id, ad.storage_path, ad.original_filename, ad.mime_type, ad.application_id
     FROM application_documents ad WHERE ad.id = ? LIMIT 1`,
      [req.params.documentId],
    );
    const document = rows[0];
    if (!document) throw new HttpError(404, "Document not found.");
    await assertApplicationAccess(pool, document.application_id, req.auth);
    res.setHeader("Content-Type", document.mime_type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(document.original_filename)}`,
    );
    return res.sendFile(path.resolve(document.storage_path));
  }),
);

router.post(
  "/:documentId/reviews",
  authorize("ADMISSION_OFFICER", "ADMIN"),
  validateBody(reviewSchema),
  asyncHandler(async (req, res) => {
    const { decision, reason, notes } = req.body;
    if (
      ["CLARIFICATION_REQUESTED", "REJECTED"].includes(decision) &&
      reason.trim().length < 5
    ) {
      throw new HttpError(
        422,
        "Provide an applicant-visible reason of at least 5 characters.",
      );
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        `SELECT ad.id, ad.application_id, ad.document_type_id, ad.status,
              a.applicant_id, a.application_number, a.status AS application_status,
              dt.name AS document_name, u.full_name AS applicant_name
       FROM application_documents ad
       JOIN applications a ON a.id = ad.application_id
       JOIN document_types dt ON dt.id = ad.document_type_id
       JOIN users u ON u.id = a.applicant_id
       WHERE ad.id = ? AND ad.is_latest = 1 FOR UPDATE`,
        [req.params.documentId],
      );
      const document = rows[0];
      if (!document)
        throw new HttpError(404, "Current document version not found.");
      if (
        !["DOCUMENT_VERIFICATION", "SUBMITTED"].includes(
          document.application_status,
        )
      ) {
        throw new HttpError(
          409,
          "This application is not in document verification.",
        );
      }
      await connection.execute(
        "UPDATE application_documents SET status = ? WHERE id = ?",
        [decision, document.id],
      );
      await connection.execute(
        `INSERT INTO document_reviews (application_document_id, reviewer_user_id, decision, reason, notes)
       VALUES (?, ?, ?, ?, ?)`,
        [document.id, req.auth.userId, decision, reason || null, notes || null],
      );
      if (decision !== "VERIFIED") {
        await connection.execute(
          `INSERT INTO clarification_requests
         (application_id, application_document_id, created_by_user_id, category, subject, description, applicant_instruction, status)
         VALUES (?, ?, ?, 'DOCUMENT', ?, ?, ?, 'WAITING_FOR_APPLICANT')`,
          [
            document.application_id,
            document.id,
            req.auth.userId,
            `${document.document_name} requires attention`,
            reason,
            notes || `Please upload a corrected ${document.document_name}.`,
          ],
        );
      }

      let movedToEligibility = false;
      if (decision === "VERIFIED") {
        const [requirements] = await connection.execute(
          `SELECT dt.id, dt.name
   FROM programme_document_requirements pdr
   JOIN applications a ON a.programme_id = pdr.programme_id
   JOIN programmes p ON p.id = a.programme_id
   JOIN document_types dt ON dt.id = pdr.document_type_id
   WHERE a.id = ?
     AND pdr.is_mandatory = 1
     AND pdr.is_active = 1
     AND (
       pdr.qualification = '*'
       OR LOWER(pdr.qualification) = LOWER(a.qualification)
     )
     AND (
       LOWER(dt.name) <> 'degree certificate'
       OR (
         LOWER(p.level) = 'postgraduate'
         AND LOWER(a.qualification) = 'degree'
       )
     )`,
          [document.application_id],
        );
        const [verified] = await connection.execute(
          `SELECT DISTINCT document_type_id FROM application_documents
         WHERE application_id = ? AND is_latest = 1 AND status = 'VERIFIED'`,
          [document.application_id],
        );
        const verifiedIds = new Set(
          verified.map((item) => Number(item.document_type_id)),
        );
        const allRequiredVerified =
          requirements.length > 0 &&
          requirements.every((item) => verifiedIds.has(Number(item.id)));
        if (allRequiredVerified) {
          await moveApplicationStage(connection, {
            applicationId: document.application_id,
            actorUserId: req.auth.userId,
            stageCode: "ELIGIBILITY_SCREENING",
            status: "ELIGIBILITY_SCREENING",
            reason: "All mandatory programme documents have been verified.",
          });
          movedToEligibility = true;
        }
      }

      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: `DOCUMENT_${decision}`,
        entityType: "APPLICATION_DOCUMENT",
        entityId: document.id,
        metadata: {
          applicationId: document.application_id,
          reason: reason || null,
          notes: notes || null,
        },
        ipAddress: req.ip,
      });
      await notifyUser(connection, {
        recipientUserId: document.applicant_id,
        actorUserId: req.auth.userId,
        title:
          decision === "VERIFIED"
            ? "Document verified"
            : decision === "REJECTED"
              ? "Document rejected"
              : "Document clarification requested",
        message:
          decision === "VERIFIED"
            ? `${document.document_name} has been verified.`
            : `${document.document_name}: ${reason}`,
        type: "DOCUMENT",
        applicationId: document.application_id,
        route: "/applicant/dashboard",
      });
      if (movedToEligibility) {
        await notifyUser(connection, {
          recipientUserId: document.applicant_id,
          actorUserId: req.auth.userId,
          title: "Document verification completed",
          message:
            "Your mandatory documents are verified. Your application has moved to eligibility screening.",
          type: "ELIGIBILITY",
          applicationId: document.application_id,
          route: "/applicant/dashboard",
        });
      }
      await connection.commit();
      return sendOk(
        res,
        { documentId: document.id, decision, movedToEligibility },
        200,
        "Document review saved.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

export default router;
