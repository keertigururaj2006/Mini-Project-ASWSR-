import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { notifyRole, notifyUser, writeAudit } from "../services/records.js";

const router = Router();
router.use(authenticate);

router.get("/officer/queue", authorize("ADMISSION_OFFICER", "ADMIN"), asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, a.application_number AS applicationNumber, a.status,
            a.current_stage_code AS currentStage, a.submitted_at AS submittedAt,
            u.full_name AS applicantName, u.email AS applicantEmail,
            p.name AS programmeName, p.short_code AS programmeShortCode,
            c.name AS collegeName,
            COUNT(DISTINCT CASE WHEN ad.is_latest = 1 THEN ad.id END) AS documentCount,
            COALESCE(SUM(ad.is_latest = 1 AND ad.status = 'PENDING'), 0) AS pendingDocuments,
            COALESCE(SUM(ad.is_latest = 1 AND ad.status = 'VERIFIED'), 0) AS verifiedDocuments,
            COALESCE(SUM(ad.is_latest = 1 AND ad.status IN ('CLARIFICATION_REQUESTED','REJECTED')), 0) AS documentsNeedingAttention
     FROM applications a JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN application_college_preferences selected_pref ON selected_pref.id = a.selected_college_preference_id
     LEFT JOIN college_programmes cp ON cp.id = selected_pref.college_programme_id
     LEFT JOIN colleges c ON c.id = cp.college_id
     LEFT JOIN application_documents ad ON ad.application_id = a.id
     WHERE a.status IN ('SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING')
     GROUP BY a.id ORDER BY a.submitted_at ASC`,
  );
  return sendOk(res, rows);
}));

router.get("/officer/history", authorize("ADMISSION_OFFICER", "ADMIN"), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT dr.id, dr.decision, dr.reason, dr.notes, dr.reviewed_at AS reviewedAt,
            dt.name AS documentType, ad.original_filename AS fileName,
            a.id AS applicationId, a.application_number AS applicationNumber,
            applicant.full_name AS applicantName, reviewer.full_name AS reviewedBy
     FROM document_reviews dr
     JOIN application_documents ad ON ad.id = dr.application_document_id
     JOIN document_types dt ON dt.id = ad.document_type_id
     JOIN applications a ON a.id = ad.application_id
     JOIN users applicant ON applicant.id = a.applicant_id
     JOIN users reviewer ON reviewer.id = dr.reviewer_user_id
     WHERE (? = 'ADMIN' OR dr.reviewer_user_id = ?)
     ORDER BY dr.reviewed_at DESC LIMIT 250`,
    [req.auth.role, req.auth.userId],
  );
  return sendOk(res, rows);
}));

router.get("/officer/clarifications", authorize("ADMISSION_OFFICER", "ADMIN"), asyncHandler(async (req, res) => {
  const status = String(req.query.status || "").trim();
  const values = [req.auth.role, req.auth.userId];
  let where = "(? = 'ADMIN' OR cr.created_by_user_id = ? OR cr.status IN ('OPEN_FOR_OFFICER','RESPONSE_RECEIVED','READY_FOR_REVIEW','WAITING_FOR_APPLICANT'))";
  if (status) { where += " AND cr.status = ?"; values.push(status); }
  const [rows] = await pool.execute(
    `SELECT cr.id, cr.application_id AS applicationId, a.application_number AS applicationNumber,
            applicant.full_name AS applicantName, p.name AS programmeName,
            dt.name AS document, cr.category, cr.subject, cr.description AS reason,
            cr.applicant_instruction AS instruction, cr.applicant_response AS applicantResponse,
            cr.priority, cr.status, cr.created_at AS createdAt, cr.updated_at AS updatedAt
     FROM clarification_requests cr JOIN applications a ON a.id = cr.application_id
     JOIN users applicant ON applicant.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN application_documents ad ON ad.id = cr.application_document_id
     LEFT JOIN document_types dt ON dt.id = ad.document_type_id
     WHERE ${where} ORDER BY cr.created_at DESC LIMIT 250`,
    values,
  );
  return sendOk(res, rows);
}));

router.patch("/officer/clarifications/:clarificationId", authorize("ADMISSION_OFFICER", "ADMIN"), validateBody(z.object({
  status: z.enum(["WAITING_FOR_APPLICANT", "READY_FOR_REVIEW", "RESOLVED", "CLOSED"]),
  instruction: z.string().trim().max(1500).optional(),
})), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT cr.id, cr.application_id, cr.status, a.applicant_id, a.application_number
       FROM clarification_requests cr JOIN applications a ON a.id = cr.application_id
       WHERE cr.id = ? FOR UPDATE`,
      [req.params.clarificationId],
    );
    const item = rows[0];
    if (!item) throw new HttpError(404, "Clarification request not found.");
    await connection.execute(
      `UPDATE clarification_requests SET status = ?,
       applicant_instruction = COALESCE(?, applicant_instruction),
       resolved_by_user_id = IF(? IN ('RESOLVED','CLOSED'), ?, resolved_by_user_id),
       resolved_at = IF(? IN ('RESOLVED','CLOSED'), CURRENT_TIMESTAMP, resolved_at),
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [req.body.status, req.body.instruction ?? null, req.body.status, req.auth.userId, req.body.status, item.id],
    );
    await writeAudit(connection, {
      actorUserId: req.auth.userId,
      action: "CLARIFICATION_STATUS_UPDATED",
      entityType: "CLARIFICATION_REQUEST",
      entityId: item.id,
      metadata: req.body,
      ipAddress: req.ip,
    });
    if (req.body.status === "WAITING_FOR_APPLICANT") {
      await notifyUser(connection, {
        recipientUserId: item.applicant_id,
        actorUserId: req.auth.userId,
        title: "Additional information required",
        message: req.body.instruction || `Please respond to the clarification request for ${item.application_number}.`,
        type: "CLARIFICATION",
        applicationId: item.application_id,
        route: "/applicant/dashboard",
      });
    }
    await connection.commit();
    return sendOk(res, { updated: true }, 200, "Clarification status updated.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

router.get("/applicant/clarifications", authorize("APPLICANT"), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT cr.id, cr.application_id AS applicationId, a.application_number AS applicationNumber,
            dt.name AS document, cr.category, cr.subject, cr.description AS reason,
            cr.applicant_instruction AS instruction, cr.applicant_response AS applicantResponse,
            cr.status, cr.created_at AS createdAt, cr.updated_at AS updatedAt
     FROM clarification_requests cr JOIN applications a ON a.id = cr.application_id
     LEFT JOIN application_documents ad ON ad.id = cr.application_document_id
     LEFT JOIN document_types dt ON dt.id = ad.document_type_id
     WHERE a.applicant_id = ? ORDER BY cr.created_at DESC`,
    [req.auth.userId],
  );
  return sendOk(res, rows);
}));

router.post("/applicant/clarifications/:clarificationId/respond", authorize("APPLICANT"), validateBody(z.object({ response: z.string().trim().min(5).max(2000) })), asyncHandler(async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT cr.id, cr.application_id, cr.status, a.applicant_id, a.application_number
       FROM clarification_requests cr JOIN applications a ON a.id = cr.application_id
       WHERE cr.id = ? FOR UPDATE`,
      [req.params.clarificationId],
    );
    const item = rows[0];
    if (!item || String(item.applicant_id) !== req.auth.userId) throw new HttpError(404, "Clarification request not found.");
    if (item.status !== "WAITING_FOR_APPLICANT") throw new HttpError(409, "This clarification request is not waiting for your response.");
    await connection.execute(
      "UPDATE clarification_requests SET applicant_response = ?, status = 'RESPONSE_RECEIVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.body.response, item.id],
    );
    await writeAudit(connection, {
      actorUserId: req.auth.userId,
      action: "APPLICANT_CLARIFICATION_RESPONSE_SUBMITTED",
      entityType: "CLARIFICATION_REQUEST",
      entityId: item.id,
      metadata: { applicationId: item.application_id },
      ipAddress: req.ip,
    });
    await notifyRole(connection, "ADMISSION_OFFICER", {
      actorUserId: req.auth.userId,
      title: "Applicant clarification response received",
      message: `A response was received for ${item.application_number}.`,
      type: "CLARIFICATION",
      applicationId: item.application_id,
      route: "/admission-officer/dashboard",
    });
    await connection.commit();
    return sendOk(res, { updated: true }, 200, "Clarification response submitted.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

export default router;
