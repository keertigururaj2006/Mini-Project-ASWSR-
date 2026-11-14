import { Router } from "express";
import { pool } from "../config/db.js";
import { asyncHandler, sendOk } from "../lib/http.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/summary", asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  if (req.auth.role === "APPLICANT") {
    const [[counts]] = await pool.execute(
      `SELECT COUNT(*) AS totalApplications,
       COALESCE(SUM(status IN ('DRAFT','SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','DECISION_PENDING')), 0) AS inProgress,
       COALESCE(SUM(status = 'ADMITTED'), 0) AS admitted,
       COALESCE(SUM(status = 'REJECTED'), 0) AS rejected
       FROM applications WHERE applicant_id = ?`,
      [userId],
    );
    const [latest] = await pool.execute(
      `SELECT a.id, a.application_number AS applicationNumber, a.status, a.current_stage_code AS currentStage,
              a.submitted_at AS submittedAt, p.name AS programmeName,
              c.name AS collegeName
       FROM applications a JOIN programmes p ON p.id = a.programme_id
       LEFT JOIN application_college_preferences selected_pref ON selected_pref.id = a.selected_college_preference_id
       LEFT JOIN college_programmes cp ON cp.id = selected_pref.college_programme_id
       LEFT JOIN colleges c ON c.id = cp.college_id
       WHERE a.applicant_id = ? ORDER BY a.updated_at DESC LIMIT 5`,
      [userId],
    );
    const [unread] = await pool.execute("SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id = ? AND is_read = 0", [userId]);
    return sendOk(res, { ...counts, latestApplications: latest, unreadNotifications: unread[0].count });
  }

  if (req.auth.role === "ADMISSION_OFFICER") {
    const [[documents]] = await pool.query(
      `SELECT COUNT(*) AS total,
       COALESCE(SUM(ad.status = 'PENDING'), 0) AS pending,
       COALESCE(SUM(ad.status = 'VERIFIED'), 0) AS verified,
       COALESCE(SUM(ad.status IN ('CLARIFICATION_REQUESTED','REJECTED')), 0) AS attention
       FROM application_documents ad JOIN applications a ON a.id = ad.application_id
       WHERE ad.is_latest = 1 AND a.status IN ('SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING')`,
    );
    const [[applications]] = await pool.query("SELECT COUNT(*) AS assignedApplications FROM applications WHERE status IN ('SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING')");
    const [clarifications] = await pool.execute("SELECT COUNT(*) AS count FROM clarification_requests WHERE status IN ('OPEN_FOR_OFFICER','RESPONSE_RECEIVED','READY_FOR_REVIEW')");
    return sendOk(res, { ...documents, assignedApplications: applications.assignedApplications, clarifications: clarifications[0].count });
  }

  if (req.auth.role === "EVALUATOR") {
    const [[counts]] = await pool.execute(
      `SELECT COUNT(*) AS assignedApplications,
       COALESCE(SUM(COALESCE(dr.status, 'PENDING') = 'PENDING'), 0) AS awaitingReview,
       COALESCE(SUM(dr.status = 'DRAFT'), 0) AS inProgressReviews,
       COALESCE(SUM(dr.status = 'SUBMITTED'), 0) AS submittedReviews
       FROM evaluator_assignments ea LEFT JOIN department_reviews dr ON dr.assignment_id = ea.id
       WHERE ea.evaluator_user_id = ? AND ea.is_active = 1`,
      [userId],
    );
    const [deadlines] = await pool.execute(
      `SELECT a.application_number AS applicationNumber, p.name AS programmeName, ea.due_date AS dueDate
       FROM evaluator_assignments ea JOIN applications a ON a.id = ea.application_id
       JOIN programmes p ON p.id = a.programme_id
       WHERE ea.evaluator_user_id = ? AND ea.is_active = 1 AND ea.due_date IS NOT NULL
       ORDER BY ea.due_date LIMIT 5`,
      [userId],
    );
    return sendOk(res, { ...counts, upcomingDeadlines: deadlines });
  }

  const [[applications]] = await pool.query(
    `SELECT COUNT(*) AS totalApplications,
     COALESCE(SUM(status IN ('DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','DECISION_PENDING')), 0) AS underReview,
     COALESCE(SUM(status = 'DECISION_PENDING'), 0) AS awaitingFinalDecision,
     COALESCE(SUM(status = 'ADMITTED'), 0) AS admitted
     FROM applications`,
  );
  const [[users]] = await pool.query("SELECT COUNT(*) AS activeUsers FROM users WHERE account_status = 'ACTIVE'");
  return sendOk(res, { ...applications, activeUsers: users.activeUsers });
}));

export default router;
