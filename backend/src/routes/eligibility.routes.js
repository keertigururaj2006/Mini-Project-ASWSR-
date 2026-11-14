import { Router } from "express";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  moveApplicationStage,
  notifyUser,
  writeAudit,
} from "../services/records.js";

const router = Router();
router.use(authenticate);

function normalizeDocumentKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseDocumentList(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function requiredDocumentsFor(application, rule) {
  const configured = parseDocumentList(rule.required_documents);
  const level = String(application.programme_level || "").toLowerCase().replace(/[^a-z]/g, "");
  const qualification = String(application.qualification || "").toLowerCase().replace(/[^a-z]/g, "");
  const needsDegreeCertificate = level === "postgraduate" && qualification === "degree";
  const isDegreeCertificate = (name) => normalizeDocumentKey(name).startsWith("degree");
  const required = configured.filter((name) => !isDegreeCertificate(name) || needsDegreeCertificate);
  if (needsDegreeCertificate && !required.some(isDegreeCertificate)) {
    required.push("Degree Certificate");
  }
  return required;
}

function makeCheck(criterion, result, explanation, actualValue = null, expectedValue = null) {
  return { criterion, result, explanation, actualValue, expectedValue };
}

router.post(
  "/applications/:applicationId/evaluate",
  authorize("ADMIN", "ADMISSION_OFFICER"),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [applications] = await connection.execute(
        `SELECT a.id, a.application_number, a.applicant_id, a.programme_id,
                a.admission_cycle_id, a.qualification, a.status, a.selected_college_preference_id,
                u.full_name AS applicant_name, p.name AS programme_name,
                p.level AS programme_level
         FROM applications a
         JOIN users u ON u.id = a.applicant_id
         JOIN programmes p ON p.id = a.programme_id
         WHERE a.id = ? FOR UPDATE`,
        [req.params.applicationId],
      );
      const application = applications[0];
      if (!application) throw new HttpError(404, "Application not found.");
      if (application.status !== "ELIGIBILITY_SCREENING") {
        throw new HttpError(409, "This application is not at the eligibility screening stage.");
      }

      const [ruleRows] = await connection.execute(
        `SELECT id, minimum_percentage, required_documents, optional_documents, remarks
         FROM eligibility_rules
         WHERE programme_id = ? AND LOWER(qualification) = LOWER(?) AND is_active = 1
         ORDER BY updated_at DESC LIMIT 1`,
        [application.programme_id, application.qualification],
      );
      const rule = ruleRows[0];
      if (!rule) {
        throw new HttpError(
          409,
          "No active programme eligibility rule matches this programme and qualification. Ask the Admin to configure one.",
        );
      }

      const [academicRows] = await connection.execute(
        `SELECT percentage, qualification
         FROM education_records
         WHERE user_id = ? AND LOWER(qualification) = LOWER(?)
         ORDER BY year_of_passing DESC, id DESC LIMIT 1`,
        [application.applicant_id, application.qualification],
      );
      const academic = academicRows[0] || null;
      const [verifiedDocs] = await connection.execute(
        `SELECT dt.name
         FROM application_documents ad
         JOIN document_types dt ON dt.id = ad.document_type_id
         WHERE ad.application_id = ? AND ad.is_latest = 1 AND ad.status = 'VERIFIED'`,
        [application.id],
      );
      const verifiedNames = new Set(verifiedDocs.map((item) => normalizeDocumentKey(item.name)));
      const requiredDocuments = requiredDocumentsFor(application, rule);

      const [preferenceRows] = await connection.execute(
        `SELECT acp.id AS preference_id, acp.preference_order,
                cp.id AS college_programme_id, cp.minimum_percentage AS college_minimum_percentage,
                cp.intake_capacity, c.id AS college_id, c.name AS college_name,
                c.is_active AS college_active, cp.is_active AS offering_active,
                CASE WHEN cp.intake_capacity IS NULL THEN 1
                     WHEN cp.intake_capacity > (
                       SELECT COUNT(*) FROM application_college_preferences admitted
                       JOIN applications admitted_app ON admitted_app.id = admitted.application_id
                       WHERE admitted.college_programme_id = cp.id
                         AND admitted.final_decision = 'ADMITTED'
                         AND admitted_app.admission_cycle_id = ?
                     ) THEN 1 ELSE 0 END AS seats_available
         FROM application_college_preferences acp
         JOIN college_programmes cp ON cp.id = acp.college_programme_id
         JOIN colleges c ON c.id = cp.college_id
         WHERE acp.application_id = ?
         ORDER BY acp.preference_order`,
        [application.admission_cycle_id, application.id],
      );

      let checks = [];
      let resultStatus = "INCOMPLETE";
      let summary = "Eligibility screening is incomplete because required information or document verification is pending.";
      let selectedPreference = null;

      if (preferenceRows.length) {
        const preferenceResults = [];
        for (const preference of preferenceRows) {
          const preferenceChecks = [];
          const collegeActive = Number(preference.college_active) === 1 && Number(preference.offering_active) === 1;

          if (academic) {
            const passed = Number(academic.percentage) >= Number(preference.college_minimum_percentage);
            preferenceChecks.push(makeCheck(
              "College minimum academic percentage",
              passed ? "PASS" : "FAIL",
              passed
                ? `${academic.percentage}% meets ${preference.college_name}'s minimum ${preference.college_minimum_percentage}%.`
                : `${academic.percentage}% is below ${preference.college_name}'s minimum ${preference.college_minimum_percentage}%.`,
              Number(academic.percentage),
              Number(preference.college_minimum_percentage),
            ));
            const programmePassed = Number(academic.percentage) >= Number(rule.minimum_percentage);
            preferenceChecks.push(makeCheck(
              "Programme minimum academic percentage",
              programmePassed ? "PASS" : "FAIL",
              programmePassed
                ? `${academic.percentage}% meets the ${application.programme_name} minimum ${rule.minimum_percentage}%.`
                : `${academic.percentage}% is below the ${application.programme_name} minimum ${rule.minimum_percentage}%.`,
              Number(academic.percentage),
              Number(rule.minimum_percentage),
            ));
          } else {
            preferenceChecks.push(makeCheck(
              "College minimum academic percentage",
              "PENDING",
              "No academic percentage has been recorded for this qualification.",
              null,
              Number(preference.college_minimum_percentage),
            ));
            preferenceChecks.push(makeCheck(
              "Programme minimum academic percentage",
              "PENDING",
              "No academic percentage has been recorded for this qualification.",
              null,
              Number(rule.minimum_percentage),
            ));
          }

          for (const documentName of requiredDocuments) {
            const passed = verifiedNames.has(normalizeDocumentKey(documentName));
            preferenceChecks.push(makeCheck(
              `Required document: ${documentName}`,
              passed ? "PASS" : "PENDING",
              passed ? `${documentName} has been verified.` : `${documentName} is not yet verified.`,
              passed ? "Verified" : "Not verified",
              "Verified",
            ));
          }

          const seatsAvailable = Number(preference.seats_available) === 1;
          preferenceChecks.push(makeCheck(
            "College seat availability",
            seatsAvailable ? "PASS" : "FAIL",
            seatsAvailable
              ? `${preference.college_name} currently has intake capacity available for this programme.`
              : `${preference.college_name} has reached its configured intake capacity for this programme.`,
            seatsAvailable ? "Available" : "Full",
            "Available",
          ));

          if (!collegeActive) {
            preferenceChecks.push(makeCheck(
              "College programme availability",
              "FAIL",
              `${preference.college_name} is inactive or no longer offers this programme.`,
              "Inactive",
              "Active",
            ));
          } else {
            preferenceChecks.push(makeCheck(
              "College programme availability",
              "PASS",
              `${preference.college_name} is actively offering ${application.programme_name}.`,
              "Active",
              "Active",
            ));
          }

          const hasFailure = preferenceChecks.some((item) => item.result === "FAIL");
          const hasPending = preferenceChecks.some((item) => item.result === "PENDING");
          const preferenceStatus = hasFailure ? "NOT_ELIGIBLE" : hasPending ? "INCOMPLETE" : "ELIGIBLE";
          const collegePercentageCheck = preferenceChecks.find((item) => item.criterion === "College minimum academic percentage");
          const programmePercentageCheck = preferenceChecks.find((item) => item.criterion === "Programme minimum academic percentage");
          const documentChecks = preferenceChecks.filter((item) => item.criterion.startsWith("Required document:"));
          const documentsPass = documentChecks.every((item) => item.result === "PASS");

          await connection.execute(
            `UPDATE application_college_preferences
             SET college_percentage_pass = ?, programme_percentage_pass = ?,
                 document_check_pass = ?, overall_eligibility_status = ?,
                 eligibility_checks = ?, evaluated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND application_id = ?`,
            [
              collegePercentageCheck?.result === "PENDING" ? null : collegePercentageCheck?.result === "PASS" ? 1 : 0,
              programmePercentageCheck?.result === "PENDING" ? null : programmePercentageCheck?.result === "PASS" ? 1 : 0,
              documentChecks.some((item) => item.result === "PENDING") ? null : (documentsPass ? 1 : 0),
              preferenceStatus,
              JSON.stringify(preferenceChecks),
              preference.preference_id,
              application.id,
            ],
          );
          preferenceResults.push({
            collegePreferenceId: preference.preference_id,
            preferenceOrder: Number(preference.preference_order),
            collegeId: preference.college_id,
            collegeName: preference.college_name,
            collegeMinimumPercentage: Number(preference.college_minimum_percentage),
            programmeMinimumPercentage: Number(rule.minimum_percentage),
            seatsAvailable: seatsAvailable,
            status: preferenceStatus,
            checks: preferenceChecks,
          });
          checks.push(...preferenceChecks.map((item) => ({
            ...item,
            criterion: `${preference.college_name} — ${item.criterion}`,
          })));
        }

        selectedPreference = preferenceRows.find((preference) =>
          preferenceResults.some((result) =>
            String(result.collegePreferenceId) === String(preference.preference_id) && result.status === "ELIGIBLE",
          ),
        ) || null;
        const eligibleCount = preferenceResults.filter((item) => item.status === "ELIGIBLE").length;
        const incompleteCount = preferenceResults.filter((item) => item.status === "INCOMPLETE").length;
        resultStatus = eligibleCount ? "ELIGIBLE" : incompleteCount ? "INCOMPLETE" : "NOT_ELIGIBLE";
        summary = eligibleCount
          ? `${eligibleCount} college preference(s) passed both the college and programme eligibility requirements. The first eligible preference is ${selectedPreference ? preferenceResults.find((item) => String(item.collegePreferenceId) === String(selectedPreference.preference_id))?.collegeName : "ready for review"}.`
          : incompleteCount
            ? "No college preference has passed yet. One or more preferences still need academic information or document verification."
            : "The applicant does not meet both the college and programme percentage requirements for any selected college preference.";
      } else {
        // Backwards compatibility for applications created before college preferences were added.
        if (academic) {
          const passed = Number(academic.percentage) >= Number(rule.minimum_percentage);
          checks.push(makeCheck(
            "Minimum academic percentage",
            passed ? "PASS" : "FAIL",
            passed
              ? `Recorded percentage ${academic.percentage}% meets the minimum ${rule.minimum_percentage}%.`
              : `Recorded percentage ${academic.percentage}% is below the minimum ${rule.minimum_percentage}%.`,
            Number(academic.percentage),
            Number(rule.minimum_percentage),
          ));
        } else {
          checks.push(makeCheck(
            "Minimum academic percentage", "PENDING",
            "No academic percentage has been recorded for this qualification.",
            null, Number(rule.minimum_percentage),
          ));
        }
        for (const documentName of requiredDocuments) {
          const passed = verifiedNames.has(normalizeDocumentKey(documentName));
          checks.push(makeCheck(
            `Required document: ${documentName}`,
            passed ? "PASS" : "PENDING",
            passed ? `${documentName} has been verified.` : `${documentName} is not yet verified.`,
            passed ? "Verified" : "Not verified", "Verified",
          ));
        }
        const hasFailure = checks.some((item) => item.result === "FAIL");
        const hasPending = checks.some((item) => item.result === "PENDING");
        resultStatus = hasFailure ? "NOT_ELIGIBLE" : hasPending ? "INCOMPLETE" : "ELIGIBLE";
        summary = resultStatus === "ELIGIBLE"
          ? "The applicant meets the configured eligibility criteria."
          : resultStatus === "NOT_ELIGIBLE"
            ? "One or more configured eligibility criteria were not met."
            : "Eligibility screening is incomplete because required information or document verification is pending.";
      }

      const percentage = academic ? Number(academic.percentage) : null;
      const [evaluationInsert] = await connection.execute(
        `INSERT INTO eligibility_evaluations
         (application_id, rule_id, evaluated_by_user_id, status, percentage, summary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [application.id, rule.id, req.auth.userId, resultStatus, percentage, summary],
      );
      for (const item of checks) {
        await connection.execute(
          `INSERT INTO eligibility_evaluation_checks
           (evaluation_id, criterion, result, explanation, actual_value, expected_value)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            evaluationInsert.insertId,
            item.criterion,
            item.result,
            item.explanation,
            item.actualValue === null ? null : String(item.actualValue),
            item.expectedValue === null ? null : String(item.expectedValue),
          ],
        );
      }

      if (resultStatus === "ELIGIBLE" && selectedPreference) {
        await connection.execute(
          "UPDATE application_college_preferences SET is_current = 0 WHERE application_id = ?",
          [application.id],
        );
        await connection.execute(
          `UPDATE application_college_preferences
           SET is_current = 1, review_status = 'IN_REVIEW'
           WHERE id = ?`,
          [selectedPreference.preference_id],
        );
        await connection.execute(
          `UPDATE applications SET selected_college_preference_id = ?
           WHERE id = ?`,
          [selectedPreference.preference_id, application.id],
        );
        await moveApplicationStage(connection, {
          applicationId: application.id,
          actorUserId: req.auth.userId,
          stageCode: "DEPARTMENT_REVIEW",
          status: "DEPARTMENT_REVIEW",
          reason: `The applicant passed both college and programme eligibility checks for ${selectedPreference.college_name}.`,
        });
      } else if (resultStatus === "ELIGIBLE") {
        await moveApplicationStage(connection, {
          applicationId: application.id,
          actorUserId: req.auth.userId,
          stageCode: "DEPARTMENT_REVIEW",
          status: "DEPARTMENT_REVIEW",
          reason: "The applicant passed all configured programme eligibility checks.",
        });
      }

      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "ELIGIBILITY_EVALUATED",
        entityType: "APPLICATION",
        entityId: application.id,
        metadata: {
          evaluationId: evaluationInsert.insertId,
          status: resultStatus,
          selectedCollegePreferenceId: selectedPreference?.preference_id || null,
          checks,
        },
        ipAddress: req.ip,
      });
      await notifyUser(connection, {
        recipientUserId: application.applicant_id,
        actorUserId: req.auth.userId,
        title: resultStatus === "ELIGIBLE" ? "Eligibility screening completed" : "Eligibility screening updated",
        message: summary,
        type: "ELIGIBILITY",
        applicationId: application.id,
        route: "/applicant/dashboard",
      });
      await connection.commit();
      return sendOk(
        res,
        {
          id: evaluationInsert.insertId,
          status: resultStatus,
          percentage,
          summary,
          selectedCollegePreferenceId: selectedPreference?.preference_id || null,
          selectedCollegeName: selectedPreference?.college_name || null,
          checks,
        },
        201,
        "Eligibility evaluation recorded.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/applications/:applicationId",
  asyncHandler(async (req, res) => {
    const [apps] = await pool.execute(
      "SELECT id, applicant_id FROM applications WHERE id = ? LIMIT 1",
      [req.params.applicationId],
    );
    const app = apps[0];
    if (!app) throw new HttpError(404, "Application not found.");
    if (req.auth.role === "APPLICANT" && String(app.applicant_id) !== req.auth.userId) {
      throw new HttpError(404, "Application not found.");
    }
    if (req.auth.role === "EVALUATOR") {
      const [assigned] = await pool.execute(
        `SELECT id FROM evaluator_assignments
         WHERE application_id = ? AND evaluator_user_id = ? AND is_active = 1`,
        [app.id, req.auth.userId],
      );
      if (!assigned[0]) throw new HttpError(403, "This application is not assigned to you.");
    }
    const [rows] = await pool.execute(
      `SELECT ee.id, ee.status, ee.percentage, ee.summary, ee.evaluated_at AS evaluatedAt,
              u.full_name AS evaluatedBy
       FROM eligibility_evaluations ee
       LEFT JOIN users u ON u.id = ee.evaluated_by_user_id
       WHERE ee.application_id = ? ORDER BY ee.id DESC LIMIT 1`,
      [app.id],
    );
    const [preferences] = await pool.execute(
      `SELECT acp.id AS collegePreferenceId, acp.preference_order AS preferenceOrder,
              acp.overall_eligibility_status AS eligibilityStatus,
              acp.college_percentage_pass AS collegePercentagePass,
              acp.programme_percentage_pass AS programmePercentagePass,
              acp.document_check_pass AS documentCheckPass,
              acp.review_status AS reviewStatus, acp.final_decision AS finalDecision,
              acp.final_decision_remarks AS finalDecisionRemarks,
              acp.eligibility_checks AS eligibilityChecks,
              acp.is_current AS isCurrent,
              cp.minimum_percentage AS collegeMinimumPercentage,
              cp.intake_capacity AS intakeCapacity,
              c.name AS collegeName
       FROM application_college_preferences acp
       JOIN college_programmes cp ON cp.id = acp.college_programme_id
       JOIN colleges c ON c.id = cp.college_id
       WHERE acp.application_id = ? ORDER BY acp.preference_order`,
      [app.id],
    );
    if (!rows[0]) return sendOk(res, { evaluation: null, collegePreferences: preferences });
    const [checks] = await pool.execute(
      `SELECT criterion, result, explanation, actual_value AS actualValue,
              expected_value AS expectedValue
       FROM eligibility_evaluation_checks WHERE evaluation_id = ? ORDER BY id`,
      [rows[0].id],
    );
    return sendOk(res, { ...rows[0], checks, collegePreferences: preferences });
  }),
);

export default router;
