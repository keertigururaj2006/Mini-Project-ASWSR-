import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createPublicId,
  moveApplicationStage,
  notifyRole,
  notifyUser,
  writeAudit,
} from "../services/records.js";
import { normalizeQualification } from "../services/qualifications.js";

const router = Router();
const createSchema = z.object({
  programmeId: z.coerce.number().int().positive(),
  qualification: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .transform(normalizeQualification),
  personalStatement: z.string().trim().max(3000).optional().default(""),
});
const updateSchema = z.object({
  qualification: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .transform((value) =>
      value === undefined ? value : normalizeQualification(value),
    ),
  personalStatement: z.string().trim().max(3000).optional(),
});

router.use(authenticate);

async function getApplication(connection, applicationId) {
  const [rows] = await connection.execute(
    `SELECT a.id, a.application_number AS applicationNumber, a.applicant_id AS applicantId,
            a.programme_id AS programmeId, a.admission_cycle_id AS admissionCycleId,
            a.qualification, a.personal_statement AS personalStatement,
            a.status, a.current_stage_code AS currentStage, a.submitted_at AS submittedAt,
            a.selected_college_preference_id AS selectedCollegePreferenceId,
            a.created_at AS createdAt, a.updated_at AS updatedAt,
            u.public_id AS applicantUserId, u.full_name AS applicantName, u.email AS applicantEmail,
            p.name AS programmeName, p.short_code AS programmeShortCode, p.category AS programmeCategory,
            p.department AS departmentName, c.name AS admissionCycle,
            selected_pref.preference_order AS selectedCollegePreferenceOrder,
            selected_college.name AS collegeName,
            selected_offering.minimum_percentage AS collegeMinimumPercentage,
            ee.status AS eligibilityStatus, ee.percentage AS eligibilityPercentage,
            ee.evaluated_at AS eligibilityEvaluatedAt
     FROM applications a
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN admission_cycles c ON c.id = a.admission_cycle_id
     LEFT JOIN application_college_preferences selected_pref ON selected_pref.id = a.selected_college_preference_id
     LEFT JOIN college_programmes selected_offering ON selected_offering.id = selected_pref.college_programme_id
     LEFT JOIN colleges selected_college ON selected_college.id = selected_offering.college_id
     LEFT JOIN eligibility_evaluations ee ON ee.id = (
       SELECT MAX(ee2.id) FROM eligibility_evaluations ee2 WHERE ee2.application_id = a.id
     )
     WHERE a.id = ? LIMIT 1`,
    [applicationId],
  );
  return rows[0] || null;
}

async function canAccessApplication(connection, application, auth) {
  if (!application) throw new HttpError(404, "Application not found.");
  if (auth.role === "ADMIN" || auth.role === "ADMISSION_OFFICER") return true;
  if (auth.role === "APPLICANT")
    return String(application.applicantId) === auth.userId;
  if (auth.role === "EVALUATOR") {
    const [assignments] = await connection.execute(
      `SELECT id FROM evaluator_assignments WHERE application_id = ? AND evaluator_user_id = ? AND is_active = 1 LIMIT 1`,
      [application.id, auth.userId],
    );
    return Boolean(assignments[0]);
  }
  return false;
}

const collegePreferencesSchema = z.object({
  collegeProgrammeIds: z.array(z.coerce.number().int().positive()).min(1).max(20),
});

router.get(
  "/:applicationId/college-preferences",
  asyncHandler(async (req, res) => {
    const application = await getApplication(pool, req.params.applicationId);
    if (!(await canAccessApplication(pool, application, req.auth))) {
      throw new HttpError(403, "You do not have access to this application.");
    }
    const [rows] = await pool.execute(
      `SELECT acp.id AS collegePreferenceId, acp.preference_order AS preferenceOrder,
              acp.overall_eligibility_status AS eligibilityStatus,
              acp.college_percentage_pass AS collegePercentagePass,
              acp.programme_percentage_pass AS programmePercentagePass,
              acp.document_check_pass AS documentCheckPass,
              acp.review_status AS reviewStatus, acp.final_decision AS finalDecision,
              acp.final_decision_remarks AS finalDecisionRemarks,
              acp.eligibility_checks AS eligibilityChecks,
              acp.is_current AS isCurrent,
              cp.id AS collegeProgrammeId, cp.minimum_percentage AS collegeMinimumPercentage,
              cp.intake_capacity AS intakeCapacity,
              c.id AS collegeId, c.name AS collegeName, c.city, c.state,
              p.id AS programmeId, p.name AS programmeName
       FROM application_college_preferences acp
       JOIN college_programmes cp ON cp.id = acp.college_programme_id
       JOIN colleges c ON c.id = cp.college_id
       JOIN programmes p ON p.id = cp.programme_id
       WHERE acp.application_id = ?
       ORDER BY acp.preference_order`,
      [req.params.applicationId],
    );
    return sendOk(res, rows);
  }),
);

router.put(
  "/:applicationId/college-preferences",
  authorize("APPLICANT"),
  validateBody(collegePreferencesSchema),
  asyncHandler(async (req, res) => {
    const ids = req.body.collegeProgrammeIds;
    if (new Set(ids).size !== ids.length) {
      throw new HttpError(422, "Choose each college only once.");
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [applicationRows] = await connection.execute(
        `SELECT id, applicant_id, programme_id, status
         FROM applications WHERE id = ? FOR UPDATE`,
        [req.params.applicationId],
      );
      const application = applicationRows[0];
      if (!application || String(application.applicant_id) !== req.auth.userId) {
        throw new HttpError(404, "Application not found.");
      }
      if (!["DRAFT", "ELIGIBILITY_SCREENING"].includes(application.status)) {
        throw new HttpError(409, "College preferences can only be changed before a college enters department review.");
      }
      const placeholders = ids.map(() => "?").join(",");
      const [offerings] = await connection.execute(
        `SELECT cp.id, cp.college_id, cp.programme_id
         FROM college_programmes cp
         JOIN colleges c ON c.id = cp.college_id
         JOIN programmes p ON p.id = cp.programme_id
         WHERE cp.id IN (${placeholders})
           AND cp.programme_id = ? AND cp.is_active = 1
           AND c.is_active = 1 AND p.is_active = 1`,
        [...ids, application.programme_id],
      );
      if (offerings.length !== ids.length) {
        throw new HttpError(422, "One or more selected colleges do not actively offer this programme.");
      }

      await connection.execute(
        "UPDATE applications SET selected_college_preference_id = NULL WHERE id = ?",
        [application.id],
      );
      await connection.execute(
        "DELETE FROM application_college_preferences WHERE application_id = ?",
        [application.id],
      );
      let firstPreferenceId = null;
      for (const [index, collegeProgrammeId] of ids.entries()) {
        const [insert] = await connection.execute(
          `INSERT INTO application_college_preferences
           (application_id, college_programme_id, preference_order, overall_eligibility_status,
            review_status, final_decision, is_current)
           VALUES (?, ?, ?, 'PENDING', 'NOT_STARTED', 'PENDING', 0)`,
          [application.id, collegeProgrammeId, index + 1],
        );
        if (index === 0) firstPreferenceId = insert.insertId;
      }
      await connection.execute(
        `UPDATE applications SET selected_college_preference_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstPreferenceId, application.id],
      );
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "APPLICATION_COLLEGE_PREFERENCES_SAVED",
        entityType: "APPLICATION",
        entityId: application.id,
        metadata: { collegeProgrammeIds: ids },
        ipAddress: req.ip,
      });
      await connection.commit();
      const [rows] = await pool.execute(
        `SELECT acp.id AS collegePreferenceId, acp.preference_order AS preferenceOrder,
                c.name AS collegeName, cp.minimum_percentage AS collegeMinimumPercentage,
                cp.intake_capacity AS intakeCapacity
         FROM application_college_preferences acp
         JOIN college_programmes cp ON cp.id = acp.college_programme_id
         JOIN colleges c ON c.id = cp.college_id
         WHERE acp.application_id = ? ORDER BY acp.preference_order`,
        [application.id],
      );
      return sendOk(res, rows, 200, "College preferences saved.");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    let where = "1 = 1";
    const values = [];
    if (req.auth.role === "APPLICANT") {
      where += " AND a.applicant_id = ?";
      values.push(req.auth.userId);
    } else if (req.auth.role === "EVALUATOR") {
      where +=
        " AND EXISTS (SELECT 1 FROM evaluator_assignments ea WHERE ea.application_id = a.id AND ea.evaluator_user_id = ? AND ea.is_active = 1 AND (ea.college_preference_id <=> a.selected_college_preference_id))";
      values.push(req.auth.userId);
    } else if (req.auth.role === "ADMISSION_OFFICER") {
      where +=
        " AND a.status IN ('SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING')";
    } else if (req.auth.role !== "ADMIN") {
      throw new HttpError(403, "You cannot view applications.");
    }
    if (req.query.status) {
      where += " AND a.status = ?";
      values.push(String(req.query.status).toUpperCase());
    }
    if (req.query.stage) {
      where += " AND a.current_stage_code = ?";
      values.push(String(req.query.stage).toUpperCase());
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const [rows] = await pool.execute(
      `SELECT a.id, a.application_number AS applicationNumber, a.status,
            a.current_stage_code AS currentStage, a.qualification,
            a.submitted_at AS submittedAt, a.created_at AS createdAt,
            u.full_name AS applicantName, u.email AS applicantEmail,
            p.id AS programmeId, p.name AS programmeName, p.short_code AS programmeShortCode,
            selected_college.name AS collegeName,
            selected_pref.preference_order AS collegePreferenceOrder,
            ee.status AS eligibilityStatus
     FROM applications a
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN application_college_preferences selected_pref ON selected_pref.id = a.selected_college_preference_id
     LEFT JOIN college_programmes selected_offering ON selected_offering.id = selected_pref.college_programme_id
     LEFT JOIN colleges selected_college ON selected_college.id = selected_offering.college_id
     LEFT JOIN eligibility_evaluations ee ON ee.id = (
       SELECT MAX(ee2.id) FROM eligibility_evaluations ee2 WHERE ee2.application_id = a.id
     )
     WHERE ${where}
     ORDER BY a.updated_at DESC LIMIT ${limit}`,
      values,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/",
  authorize("APPLICANT"),
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [programmes] = await connection.execute(
        "SELECT id, name FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
        [req.body.programmeId],
      );
      if (!programmes[0])
        throw new HttpError(422, "Select an active programme.");
      const [cycles] = await connection.execute(
        `SELECT id FROM admission_cycles WHERE is_active = 1 AND start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY start_date DESC LIMIT 1`,
      );
      if (!cycles[0])
        throw new HttpError(
          409,
          "There is no active admission cycle. Ask the administrator to configure one.",
        );

      const [existing] = await connection.execute(
        `SELECT id, status FROM applications WHERE applicant_id = ? AND programme_id = ? AND admission_cycle_id = ?
       AND status NOT IN ('WITHDRAWN','REJECTED') LIMIT 1 FOR UPDATE`,
        [req.auth.userId, req.body.programmeId, cycles[0].id],
      );
      if (existing[0])
        throw new HttpError(
          409,
          `You already have an application for this programme in the active cycle (${existing[0].status}).`,
        );

      const number = createPublicId("APP");
      const [result] = await connection.execute(
        `INSERT INTO applications
       (application_number, applicant_id, programme_id, admission_cycle_id, qualification, personal_statement,
        status, current_stage_code)
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', 'APPLICATION_SUBMISSION')`,
        [
          number,
          req.auth.userId,
          req.body.programmeId,
          cycles[0].id,
          req.body.qualification,
          req.body.personalStatement,
        ],
      );
      await connection.execute(
        `INSERT INTO application_stage_history (application_id, from_stage_code, to_stage_code, from_status, to_status, actor_user_id, reason)
       VALUES (?, NULL, 'APPLICATION_SUBMISSION', NULL, 'DRAFT', ?, 'Application draft created')`,
        [result.insertId, req.auth.userId],
      );
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "APPLICATION_DRAFT_CREATED",
        entityType: "APPLICATION",
        entityId: result.insertId,
        metadata: {
          programmeId: req.body.programmeId,
          applicationNumber: number,
        },
        ipAddress: req.ip,
      });
      await connection.commit();
      const application = await getApplication(pool, result.insertId);
      return sendOk(res, application, 201, "Application draft created.");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/:applicationId",
  asyncHandler(async (req, res) => {
    const application = await getApplication(pool, req.params.applicationId);
    if (!(await canAccessApplication(pool, application, req.auth)))
      throw new HttpError(403, "You do not have access to this application.");
    const [stageHistory] = await pool.execute(
      `SELECT h.id, h.from_stage_code AS fromStage, h.to_stage_code AS toStage,
            h.from_status AS fromStatus, h.to_status AS toStatus,
            h.reason, h.created_at AS createdAt, u.full_name AS actorName
     FROM application_stage_history h LEFT JOIN users u ON u.id = h.actor_user_id
     WHERE h.application_id = ? ORDER BY h.created_at, h.id`,
      [req.params.applicationId],
    );
    const [documents] = await pool.execute(
      `SELECT ad.id, dt.name AS documentType, ad.original_filename AS fileName,
            ad.status, ad.version_number AS version, ad.uploaded_at AS uploadedAt,
            dr.reason AS latestReason
     FROM application_documents ad JOIN document_types dt ON dt.id = ad.document_type_id
     LEFT JOIN document_reviews dr ON dr.id = (
       SELECT MAX(dr2.id) FROM document_reviews dr2 WHERE dr2.application_document_id = ad.id
     )
     WHERE ad.application_id = ? AND ad.is_latest = 1 ORDER BY dt.name`,
      [req.params.applicationId],
    );
    return sendOk(res, { ...application, stageHistory, documents });
  }),
);

router.patch(
  "/:applicationId",
  authorize("APPLICANT"),
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      "SELECT id, applicant_id, status FROM applications WHERE id = ? LIMIT 1",
      [req.params.applicationId],
    );
    const application = rows[0];
    if (!application || String(application.applicant_id) !== req.auth.userId)
      throw new HttpError(404, "Application not found.");
    if (application.status !== "DRAFT") {
      throw new HttpError(
        409,
        "This application is locked because it has already been submitted.",
      );
    }
    const fields = [];
    const values = [];
    if (req.body.qualification !== undefined) {
      fields.push("qualification = ?");
      values.push(req.body.qualification);
    }
    if (req.body.personalStatement !== undefined) {
      fields.push("personal_statement = ?");
      values.push(req.body.personalStatement);
    }
    if (fields.length) {
      values.push(application.id);
      await pool.execute(
        `UPDATE applications SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
      );
      await pool.execute(
        "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, 'APPLICATION_UPDATED', 'APPLICATION', ?, ?, ?)",
        [
          req.auth.userId,
          application.id,
          JSON.stringify({ fields: Object.keys(req.body) }),
          req.ip,
        ],
      );
    }
    return sendOk(res, { updated: true }, 200, "Application updated.");
  }),
);

router.post(
  "/:applicationId/submit",
  authorize("APPLICANT"),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        `SELECT a.id, a.application_number, a.applicant_id, a.status, a.current_stage_code,
              a.programme_id, a.qualification, u.full_name
       FROM applications a JOIN users u ON u.id = a.applicant_id
       WHERE a.id = ? FOR UPDATE`,
        [req.params.applicationId],
      );
      const application = rows[0];
      if (!application || String(application.applicant_id) !== req.auth.userId)
        throw new HttpError(404, "Application not found.");
      if (application.status !== "DRAFT")
        throw new HttpError(409, "Only a draft application can be submitted.");

      const [profileRows] = await connection.execute(
        "SELECT u.phone_number FROM users u WHERE u.id = ? LIMIT 1",
        [req.auth.userId],
      );
      if (!profileRows[0]?.phone_number) {
        throw new HttpError(
          422,
          "Add a contact phone number before submitting the application.",
        );
      }
      const [requirements] = await connection.execute(
        `SELECT DISTINCT dt.id, dt.name
   FROM programme_document_requirements pdr
   JOIN programmes p ON p.id = pdr.programme_id
   JOIN document_types dt ON dt.id = pdr.document_type_id
   WHERE pdr.programme_id = ?
     AND pdr.is_active = 1
     AND pdr.is_mandatory = 1
     AND (pdr.qualification = '*' OR LOWER(pdr.qualification) = LOWER(?))
     AND (
       LOWER(dt.name) <> 'degree certificate'
       OR (
         LOWER(p.level) = 'postgraduate'
         AND LOWER(?) = 'degree'
       )
     )
   ORDER BY dt.name`,
        [
          application.programme_id,
          application.qualification,
          application.qualification,
        ],
      );

      if (!requirements.length) {
        throw new HttpError(
          409,
          "Mandatory document requirements are not configured for this programme. Contact the admission office.",
        );
      }

      const [uploadedRows] = await connection.execute(
        `SELECT DISTINCT document_type_id
       FROM application_documents
       WHERE application_id = ? AND is_latest = 1`,
        [application.id],
      );
      const uploadedTypeIds = new Set(
        uploadedRows.map((row) => Number(row.document_type_id)),
      );
      const missingDocuments = requirements
        .filter((requirement) => !uploadedTypeIds.has(Number(requirement.id)))
        .map((requirement) => requirement.name);

      if (missingDocuments.length) {
        throw new HttpError(
          422,
          `Upload all mandatory documents before submitting: ${missingDocuments.join(", ")}.`,
        );
      }

      await connection.execute(
        "UPDATE applications SET submitted_at = CURRENT_TIMESTAMP WHERE id = ?",
        [application.id],
      );
      await moveApplicationStage(connection, {
        applicationId: application.id,
        actorUserId: req.auth.userId,
        stageCode: "DOCUMENT_VERIFICATION",
        status: "DOCUMENT_VERIFICATION",
        reason: "Applicant submitted the application.",
      });
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "APPLICATION_SUBMITTED",
        entityType: "APPLICATION",
        entityId: application.id,
        metadata: { applicationNumber: application.application_number },
        ipAddress: req.ip,
      });
      await notifyRole(connection, "ADMISSION_OFFICER", {
        actorUserId: req.auth.userId,
        title: "New application submitted",
        message: `${application.full_name} submitted ${application.application_number} for document verification.`,
        type: "APPLICATION",
        applicationId: application.id,
        route: "/admission-officer/dashboard",
      });
      await connection.commit();
      return sendOk(
        res,
        { submitted: true, applicationNumber: application.application_number },
        200,
        "Application submitted for document verification.",
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
