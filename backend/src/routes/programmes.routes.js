import { Router } from "express";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { normalizeQualification } from "../services/qualifications.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const level = String(req.query.level || "").trim();
    const values = [];
    let where = "WHERE p.is_active = 1";
    if (search) {
      where +=
        " AND (p.name LIKE ? OR p.short_code LIKE ? OR p.department LIKE ? OR p.category LIKE ?)";
      values.push(...Array(4).fill(`%${search}%`));
    }
    if (category) {
      where += " AND p.category = ?";
      values.push(category);
    }
    if (level) {
      where += " AND p.level = ?";
      values.push(level);
    }
    const [rows] = await pool.execute(
      `SELECT p.id, p.code, p.name, p.short_code AS short, p.category, p.level,
            p.duration, p.description, p.department, p.intake_capacity AS intakeCapacity
     FROM programmes p ${where} ORDER BY p.category, p.name`,
      values,
    );
    return sendOk(res, rows);
  }),
);

// Active colleges offering a programme. College minimum percentage is independent
// from the programme-level eligibility rule.
router.get(
  "/college-offerings",
  asyncHandler(async (req, res) => {
    const programmeId = Number(req.query.programmeId);
    if (!Number.isSafeInteger(programmeId) || programmeId <= 0) {
      throw new HttpError(422, "Provide a valid programmeId.");
    }
    const [rows] = await pool.execute(
      `SELECT cp.id AS collegeProgrammeId, c.id AS collegeId, c.code AS collegeCode,
              c.name AS collegeName, c.address, c.city, c.state,
              cp.programme_id AS programmeId,
              cp.minimum_percentage AS minimumPercentage,
              cp.intake_capacity AS intakeCapacity,
              CASE WHEN cp.intake_capacity IS NULL THEN NULL ELSE GREATEST(
                cp.intake_capacity - (
                  SELECT COUNT(*) FROM application_college_preferences admitted
                  WHERE admitted.college_programme_id = cp.id
                    AND admitted.final_decision = 'ADMITTED'
                    AND EXISTS (
                      SELECT 1 FROM applications counted_app
                      WHERE counted_app.id = admitted.application_id
                        AND counted_app.admission_cycle_id = (
                          SELECT active_cycle.id FROM admission_cycles active_cycle
                          WHERE active_cycle.is_active = 1
                            AND active_cycle.start_date <= CURDATE()
                            AND active_cycle.end_date >= CURDATE()
                          ORDER BY active_cycle.start_date DESC LIMIT 1
                        )
                    )
                ), 0
              ) END AS seatsAvailable
       FROM college_programmes cp
       JOIN colleges c ON c.id = cp.college_id
       JOIN programmes p ON p.id = cp.programme_id
       WHERE cp.programme_id = ? AND cp.is_active = 1
         AND c.is_active = 1 AND p.is_active = 1
       ORDER BY c.name`,
      [programmeId],
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/:programmeId/document-requirements",
  asyncHandler(async (req, res) => {
    const [programmeRows] = await pool.execute(
      "SELECT id FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
      [req.params.programmeId],
    );
    if (!programmeRows[0]) throw new HttpError(404, "Programme not found.");
    const qualification = req.query.qualification
      ? normalizeQualification(String(req.query.qualification))
      : "*";
    const [rows] = await pool.execute(
      `SELECT dt.id AS documentTypeId, dt.code, dt.name, dt.description,
          pdr.qualification, pdr.is_mandatory AS isMandatory,
          pdr.display_order AS displayOrder
   FROM programme_document_requirements pdr
   JOIN programmes p ON p.id = pdr.programme_id
   JOIN document_types dt ON dt.id = pdr.document_type_id
   WHERE pdr.programme_id = ?
     AND pdr.is_active = 1
     AND (pdr.qualification = '*' OR LOWER(pdr.qualification) = LOWER(?))
     AND (
       LOWER(dt.name) <> 'degree certificate'
       OR (
         LOWER(p.level) = 'postgraduate'
         AND LOWER(?) = 'degree'
       )
     )
   ORDER BY pdr.is_mandatory DESC, pdr.display_order, dt.name`,
      [req.params.programmeId, qualification, qualification],
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/:programmeId",
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT p.id, p.code, p.name, p.short_code AS short, p.category, p.level,
            p.duration, p.description, p.department, p.intake_capacity AS intakeCapacity
     FROM programmes p WHERE p.id = ? AND p.is_active = 1 LIMIT 1`,
      [req.params.programmeId],
    );
    if (!rows[0]) throw new HttpError(404, "Programme not found.");
    return sendOk(res, rows[0]);
  }),
);

export default router;
