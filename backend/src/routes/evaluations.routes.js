import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { moveApplicationStage, notifyRole, notifyUser, writeAudit } from "../services/records.js";

const router = Router();
router.use(authenticate);

async function assignedApplication(connection, applicationId, evaluatorUserId) {
  const [rows] = await connection.execute(
    `SELECT a.id, a.application_number AS applicationNumber, a.applicant_id AS applicantId,
            a.programme_id AS programmeId, a.qualification, a.status, a.current_stage_code AS currentStage,
            a.submitted_at AS submittedAt, a.created_at AS createdAt,
            u.full_name AS applicantName, u.email AS applicantEmail, u.phone_country_code AS phoneCountryCode,
            u.phone_number AS phone, p.name AS programmeName, p.category AS programmeCategory,
            p.department AS departmentName, ap.gender, ap.date_of_birth AS dateOfBirth,
            ap.address, ap.city, ap.state, ap.postal_code AS postalCode,
            ea.id AS assignmentId, ea.assigned_at AS assignedAt, ea.due_date AS dueDate
     FROM evaluator_assignments ea
     JOIN applications a ON a.id = ea.application_id
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN applicant_profiles ap ON ap.user_id = u.id
     WHERE a.id = ? AND ea.evaluator_user_id = ? AND ea.is_active = 1 LIMIT 1`,
    [applicationId, evaluatorUserId],
  );
  return rows[0] || null;
}

router.get("/assignments", authorize("EVALUATOR"), asyncHandler(async (req, res) => {
  const [assignments] = await pool.execute(
    `SELECT a.id, a.application_number AS applicationNumber, a.status,
            a.current_stage_code AS currentStage, a.submitted_at AS submittedAt,
            u.full_name AS applicantName, p.name AS programmeName, p.category AS programmeCategory,
            ea.id AS assignmentId, ea.college_preference_id AS collegePreferenceId,
            acp.preference_order AS collegePreferenceOrder, c.name AS collegeName,
            ea.assigned_at AS assignedAt, ea.due_date AS dueDate,
            dr.status AS reviewStatus, dr.updated_at AS lastSavedAt
     FROM evaluator_assignments ea
     JOIN applications a ON a.id = ea.application_id
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN application_college_preferences acp ON acp.id = ea.college_preference_id
     LEFT JOIN college_programmes cp ON cp.id = acp.college_programme_id
     LEFT JOIN colleges c ON c.id = cp.college_id
     LEFT JOIN department_reviews dr ON dr.assignment_id = ea.id
     WHERE ea.evaluator_user_id = ? AND ea.is_active = 1
       AND (ea.college_preference_id <=> a.selected_college_preference_id)
     ORDER BY CASE WHEN dr.status = 'SUBMITTED' THEN 1 ELSE 0 END, ea.due_date IS NULL, ea.due_date ASC, ea.assigned_at DESC`,
    [req.auth.userId],
  );
  return sendOk(res, assignments);
}));

router.get("/applications/:applicationId", authorize("EVALUATOR"), asyncHandler(async (req, res) => {
  const application = await assignedApplication(pool, req.params.applicationId, req.auth.userId);
  if (!application) throw new HttpError(404, "Assigned application not found.");
  const [academics] = await pool.execute(
    `SELECT id, qualification AS level, institution_name AS institution, board,
            year_of_passing AS yearOfPassing, marks_obtained AS marksObtained,
            maximum_marks AS maximumMarks, percentage
     FROM education_records WHERE user_id = ? ORDER BY year_of_passing DESC`,
    [application.applicantId],
  );
  const [documents] = await pool.execute(
    `SELECT ad.id, dt.name AS documentType, ad.status AS verificationStatus,
            ad.uploaded_at AS uploadedAt, ad.original_filename AS fileName
     FROM application_documents ad JOIN document_types dt ON dt.id = ad.document_type_id
     WHERE ad.application_id = ? AND ad.is_latest = 1 ORDER BY dt.name`,
    [application.id],
  );
  const [eligibilityRows] = await pool.execute(
    `SELECT id, status, percentage, summary, evaluated_at AS evaluatedAt
     FROM eligibility_evaluations WHERE application_id = ? ORDER BY id DESC LIMIT 1`,
    [application.id],
  );
  const eligibility = eligibilityRows[0] || null;
  if (eligibility) {
    const [checks] = await pool.execute(
      `SELECT criterion, result, explanation FROM eligibility_evaluation_checks WHERE evaluation_id = ? ORDER BY id`,
      [eligibility.id],
    );
    eligibility.criteria = checks;
  }
  const [history] = await pool.execute(
    `SELECT to_stage_code AS stageName, reason AS description, created_at AS timestamp
     FROM application_stage_history WHERE application_id = ? ORDER BY id`,
    [application.id],
  );
  const [rubrics] = await pool.execute(
    `SELECT r.id, r.name FROM evaluation_rubrics r
     WHERE r.is_active = 1 AND (r.programme_id = ? OR r.programme_id IS NULL)
     ORDER BY r.programme_id IS NULL, r.id DESC LIMIT 1`,
    [application.programmeId],
  );
  let rubric = [];
  if (rubrics[0]) {
    const [criteria] = await pool.execute(
      `SELECT id, name AS title, description, weight, max_score AS maxScore
       FROM rubric_criteria WHERE rubric_id = ? AND is_active = 1 ORDER BY display_order, id`,
      [rubrics[0].id],
    );
    rubric = criteria;
  }
  const [saved] = await pool.execute(
    `SELECT id, status, recommendation, remarks, conflict_confirmed AS conflictConfirmed,
            updated_at AS updatedAt
     FROM department_reviews WHERE assignment_id = ? LIMIT 1`,
    [application.assignmentId],
  );
  if (saved[0]) {
    const [scores] = await pool.execute(
      `SELECT criterion_id AS criterionId, criterion_name AS criterion, weight, score, max_score AS maxScore,
              evidence, evidence_source AS evidenceSource
       FROM department_review_scores WHERE review_id = ? ORDER BY id`,
      [saved[0].id],
    );
    saved[0].scores = scores;
  }
  return sendOk(res, {
    ...application,
    applicant: {
      fullName: application.applicantName,
      email: application.applicantEmail,
      phone: `${application.phoneCountryCode || ""} ${application.phone || ""}`.trim(),
      gender: application.gender,
      dateOfBirth: application.dateOfBirth,
      address: application.address,
      city: application.city,
      state: application.state,
      postalCode: application.postalCode,
    },
    academicRecords: academics,
    verifiedDocuments: documents,
    eligibilitySnapshot: eligibility,
    stageHistory: history,
    rubric,
    savedReview: saved[0] || null,
  });
}));

const reviewSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED"]),
  recommendation: z.enum(["RECOMMEND", "DO_NOT_RECOMMEND", "CLARIFICATION_REQUIRED"]),
  remarks: z.string().trim().max(4000).optional().default(""),
  conflictConfirmed: z.boolean(),
  scores: z.array(z.object({
    criterionId: z.coerce.number().int().positive().optional(),
    criterion: z.string().trim().min(1).max(160),
    weight: z.coerce.number().min(0).max(100),
    score: z.coerce.number().min(0),
    maxScore: z.coerce.number().positive(),
    evidence: z.string().trim().max(2000).optional().default(""),
    evidenceSource: z.string().trim().max(500).optional().default(""),
  })).max(20),
});

router.post("/applications/:applicationId/reviews", authorize("EVALUATOR"), validateBody(reviewSchema), asyncHandler(async (req, res) => {
  const body = req.body;
  if (body.status === "SUBMITTED") {
    if (!body.conflictConfirmed) throw new HttpError(422, "Confirm the evaluator declaration before submitting the assessment.");
    if (!body.remarks.trim()) throw new HttpError(422, "Add overall evaluation remarks before submission.");
    if (!body.scores.length) throw new HttpError(422, "Score the approved evaluation rubric before submitting.");
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const application = await assignedApplication(connection, req.params.applicationId, req.auth.userId);
    if (!application) throw new HttpError(404, "Assigned application not found.");
    if (application.status !== "DEPARTMENT_REVIEW") throw new HttpError(409, "This application is no longer open for department review.");

    const [rubricRows] = await connection.execute(
      `SELECT r.id, rc.id AS criterionId, rc.name AS criterionName,
              rc.weight, rc.max_score AS maxScore, rc.is_active AS criterionActive
       FROM evaluation_rubrics r
       JOIN rubric_criteria rc ON rc.rubric_id = r.id
       WHERE r.is_active = 1 AND rc.is_active = 1
         AND (r.programme_id = ? OR r.programme_id IS NULL)
       ORDER BY r.programme_id IS NULL, r.id DESC, rc.display_order, rc.id`,
      [application.programmeId],
    );
    const selectedRubricId = rubricRows[0]?.id;
    const approvedCriteria = rubricRows
      .filter((row) => String(row.id) === String(selectedRubricId))
      .map((row) => ({
        id: Number(row.criterionId),
        name: row.criterionName,
        weight: Number(row.weight),
        maxScore: Number(row.maxScore),
      }));

    const canonicalScores = body.scores.map((item) => {
      const criterion = approvedCriteria.find((candidate) =>
        (item.criterionId && candidate.id === Number(item.criterionId)) || candidate.name === item.criterion,
      );
      if (!criterion) throw new HttpError(422, `The submitted criterion is not part of the active programme rubric: ${item.criterion}`);
      if (item.score > criterion.maxScore) throw new HttpError(422, `The score for ${criterion.name} cannot exceed ${criterion.maxScore}.`);
      return { ...item, criterionId: criterion.id, criterion: criterion.name, weight: criterion.weight, maxScore: criterion.maxScore };
    });
    if (new Set(canonicalScores.map((item) => item.criterionId)).size !== canonicalScores.length) {
      throw new HttpError(422, "A rubric criterion cannot be scored more than once.");
    }
    if (body.status === "SUBMITTED") {
      if (!approvedCriteria.length) throw new HttpError(409, "There is no active evaluation rubric for this programme. Ask the Admin to configure one.");
      if (canonicalScores.length !== approvedCriteria.length) throw new HttpError(422, "Score every criterion in the active programme rubric before submitting.");
    }

    const [existing] = await connection.execute("SELECT id, status FROM department_reviews WHERE assignment_id = ? FOR UPDATE", [application.assignmentId]);
    if (existing[0]?.status === "SUBMITTED") throw new HttpError(409, "This assessment has already been submitted and cannot be changed.");

    let reviewId = existing[0]?.id;
    if (reviewId) {
      await connection.execute(
        `UPDATE department_reviews SET status = ?, recommendation = ?, remarks = ?, conflict_confirmed = ?,
         submitted_at = IF(? = 'SUBMITTED', CURRENT_TIMESTAMP, submitted_at), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [body.status, body.recommendation, body.remarks || null, body.conflictConfirmed ? 1 : 0, body.status, reviewId],
      );
      await connection.execute("DELETE FROM department_review_scores WHERE review_id = ?", [reviewId]);
    } else {
      const [insert] = await connection.execute(
        `INSERT INTO department_reviews
         (application_id, assignment_id, evaluator_user_id, status, recommendation, remarks, conflict_confirmed, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, IF(? = 'SUBMITTED', CURRENT_TIMESTAMP, NULL))`,
        [application.id, application.assignmentId, req.auth.userId, body.status, body.recommendation, body.remarks || null, body.conflictConfirmed ? 1 : 0, body.status],
      );
      reviewId = insert.insertId;
    }
    for (const item of canonicalScores) {
      await connection.execute(
        `INSERT INTO department_review_scores
         (review_id, criterion_id, criterion_name, weight, score, max_score, evidence, evidence_source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [reviewId, item.criterionId, item.criterion, item.weight, item.score, item.maxScore, item.evidence || null, item.evidenceSource || null],
      );
    }
    if (body.status === "SUBMITTED") {
      if (application.collegePreferenceId) {
        await connection.execute(
          `UPDATE application_college_preferences
           SET review_status = 'DECISION_PENDING' WHERE id = ? AND application_id = ?`,
          [application.collegePreferenceId, application.id],
        );
      }
      await moveApplicationStage(connection, {
        applicationId: application.id,
        actorUserId: req.auth.userId,
        stageCode: "FINAL_ADMISSION_DECISION",
        status: "DECISION_PENDING",
        reason: "Evaluator submitted the department assessment.",
      });
      await notifyRole(connection, "ADMIN", {
        actorUserId: req.auth.userId,
        title: "Application ready for final decision",
        message: `${application.applicationNumber} has a submitted department assessment and is waiting for an Admin decision.`,
        type: "DECISION",
        applicationId: application.id,
        route: "/admin/dashboard",
      });
      await notifyUser(connection, {
        recipientUserId: application.applicantId,
        actorUserId: req.auth.userId,
        title: "Department review completed",
        message: "Your application has completed department review and is awaiting the final admission decision.",
        type: "REVIEW",
        applicationId: application.id,
        route: "/applicant/dashboard",
      });
    }
    await writeAudit(connection, {
      actorUserId: req.auth.userId,
      action: body.status === "SUBMITTED" ? "DEPARTMENT_REVIEW_SUBMITTED" : "DEPARTMENT_REVIEW_DRAFT_SAVED",
      entityType: "DEPARTMENT_REVIEW",
      entityId: reviewId,
      metadata: { applicationId: application.id, recommendation: body.recommendation, scoreCount: body.scores.length },
      ipAddress: req.ip,
    });
    await connection.commit();
    return sendOk(res, { reviewId, status: body.status }, body.status === "SUBMITTED" ? 201 : 200,
      body.status === "SUBMITTED" ? "Assessment submitted." : "Assessment draft saved.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

const clarificationSchema = z.object({
  category: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(3).max(180),
  description: z.string().trim().min(5).max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
});
router.post("/applications/:applicationId/clarifications", authorize("EVALUATOR"), validateBody(clarificationSchema), asyncHandler(async (req, res) => {
  const application = await assignedApplication(pool, req.params.applicationId, req.auth.userId);
  if (!application) throw new HttpError(404, "Assigned application not found.");
  const [result] = await pool.execute(
    `INSERT INTO clarification_requests
     (application_id, created_by_user_id, category, subject, description, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, 'OPEN_FOR_OFFICER')`,
    [application.id, req.auth.userId, req.body.category, req.body.subject, req.body.description, req.body.priority],
  );
  await pool.execute("INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, 'EVALUATOR_CLARIFICATION_CREATED', 'CLARIFICATION_REQUEST', ?, ?, ?)", [req.auth.userId, result.insertId, JSON.stringify({ applicationId: application.id }), req.ip]);
  await notifyRole(pool, "ADMISSION_OFFICER", {
    actorUserId: req.auth.userId,
    title: "Evaluator clarification request",
    message: `${application.applicationNumber} needs an admission-office clarification review: ${req.body.subject}`,
    type: "CLARIFICATION",
    applicationId: application.id,
    route: "/admission-officer/dashboard",
  });
  return sendOk(res, { id: result.insertId }, 201, "Clarification request sent to Admission Officers.");
}));

router.get("/clarifications", authorize("EVALUATOR"), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT cr.id, cr.application_id AS applicationId, a.application_number AS applicationNumber,
            u.full_name AS applicantName, p.name AS programmeName,
            cr.category, cr.subject, cr.description, cr.priority, cr.status,
            cr.created_at AS createdAt, cr.updated_at AS updatedAt
     FROM clarification_requests cr
     JOIN applications a ON a.id = cr.application_id
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     WHERE cr.created_by_user_id = ? ORDER BY cr.created_at DESC`,
    [req.auth.userId],
  );

  if (!rows.length) return sendOk(res, []);

  const clarificationIds = rows.map((item) => String(item.id));
  const placeholders = clarificationIds.map(() => "?").join(",");
  const [historyRows] = await pool.execute(
    `SELECT al.entity_id AS clarificationId, al.action,
            COALESCE(actor.full_name, 'System') AS actor, al.created_at AS timestamp
     FROM audit_logs al
     LEFT JOIN users actor ON actor.id = al.actor_user_id
     WHERE al.entity_type = 'CLARIFICATION_REQUEST'
       AND al.entity_id IN (${placeholders})
     ORDER BY al.created_at DESC`,
    clarificationIds,
  );

  const historyByClarification = new Map();
  for (const entry of historyRows) {
    const id = String(entry.clarificationId);
    if (!historyByClarification.has(id)) historyByClarification.set(id, []);
    historyByClarification.get(id).push({
      action: String(entry.action || '').replace(/_/g, ' ').toLowerCase(),
      actor: entry.actor,
      timestamp: entry.timestamp,
    });
  }

  return sendOk(res, rows.map((item) => ({
    ...item,
    history: historyByClarification.get(String(item.id)) || [],
  })));
}));

router.get("/reviews", authorize("EVALUATOR"), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT dr.id, dr.application_id AS applicationId, a.application_number AS applicationNumber,
            p.name AS programmeName, u.full_name AS applicantName,
            dr.status, dr.recommendation, dr.remarks, dr.conflict_confirmed AS conflictConfirmed,
            dr.submitted_at AS submittedAt, dr.updated_at AS updatedAt
     FROM department_reviews dr
     JOIN applications a ON a.id = dr.application_id
     JOIN programmes p ON p.id = a.programme_id
     JOIN users u ON u.id = a.applicant_id
     WHERE dr.evaluator_user_id = ? ORDER BY dr.updated_at DESC`,
    [req.auth.userId],
  );

  if (!rows.length) return sendOk(res, []);

  const reviewIds = rows.map((review) => review.id);
  const reviewPlaceholders = reviewIds.map(() => "?").join(",");
  const applicationIds = [...new Set(rows.map((review) => review.applicationId))];
  const applicationPlaceholders = applicationIds.map(() => "?").join(",");
  const [scoreRows] = await pool.execute(
    `SELECT review_id AS reviewId, criterion_id AS criterionId,
            criterion_name AS criterion, weight, score, max_score AS maxScore,
            evidence, evidence_source AS evidenceSource
     FROM department_review_scores
     WHERE review_id IN (${reviewPlaceholders})
     ORDER BY review_id, id`,
    reviewIds,
  );
  const [documentRows] = await pool.execute(
    `SELECT ad.application_id AS applicationId, ad.id, dt.name AS documentType,
            ad.original_filename AS fileName, ad.status AS verificationStatus,
            ad.uploaded_at AS uploadedAt
     FROM application_documents ad
     JOIN document_types dt ON dt.id = ad.document_type_id
     WHERE ad.application_id IN (${applicationPlaceholders}) AND ad.status = 'VERIFIED'
     ORDER BY ad.application_id, ad.uploaded_at DESC`,
    applicationIds,
  );

  const documentsByApplication = new Map();
  for (const document of documentRows) {
    const applicationId = String(document.applicationId);
    if (!documentsByApplication.has(applicationId)) documentsByApplication.set(applicationId, []);
    documentsByApplication.get(applicationId).push(document);
  }

  const scoresByReview = new Map();
  for (const score of scoreRows) {
    const reviewId = String(score.reviewId);
    if (!scoresByReview.has(reviewId)) scoresByReview.set(reviewId, []);
    scoresByReview.get(reviewId).push({
      ...score,
      criterionId: score.criterionId === null ? null : Number(score.criterionId),
      weight: Number(score.weight),
      score: Number(score.score),
      maxScore: Number(score.maxScore),
    });
  }

  const reviews = rows.map((review) => {
    const scoreDetails = scoresByReview.get(String(review.id)) || [];
    const totalWeight = scoreDetails.reduce((total, item) => total + item.weight, 0);
    const weightedPoints = scoreDetails.reduce((total, item) => {
      if (!item.maxScore || !Number.isFinite(item.score)) return total;
      return total + (item.score / item.maxScore) * item.weight;
    }, 0);
    const rubric = scoreDetails.map((item) => ({
      id: item.criterionId ?? item.criterion,
      title: item.criterion,
      weight: item.weight,
      maxScore: item.maxScore,
    }));
    const scoreMap = Object.fromEntries(
      scoreDetails.map((item) => [String(item.criterionId ?? item.criterion), item.score]),
    );
    const evidence = Object.fromEntries(
      scoreDetails.map((item) => [String(item.criterionId ?? item.criterion), item.evidence || ""]),
    );
    const evidenceSources = Object.fromEntries(
      scoreDetails.map((item) => [String(item.criterionId ?? item.criterion), item.evidenceSource || ""]),
    );

    return {
      ...review,
      overallRemarks: review.remarks || "",
      rubric,
      scores: scoreMap,
      evidence,
      evidenceSources,
      verifiedDocuments: documentsByApplication.get(String(review.applicationId)) || [],
      scoreDetails,
      weightedPercentage: totalWeight > 0 ? Number(((weightedPoints / totalWeight) * 100).toFixed(2)) : null,
    };
  });

  return sendOk(res, reviews);
}));

export default router;
