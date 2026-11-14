import { Router } from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { writeAudit } from "../services/records.js";
import { normalizeQualification } from "../services/qualifications.js";

const router = Router();
const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.email().transform((value) => value.trim().toLowerCase()).optional(),
  phoneCountryCode: z.string().trim().max(8).optional(),
  phone: z.string().trim().max(20).optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  gender: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  qualification: z.string().trim().max(100).nullable().optional().transform(normalizeQualification),
  institution: z.string().trim().max(180).nullable().optional(),
  programmeId: z.coerce.number().int().positive().nullable().optional(),
});

router.use(authenticate);

router.get("/me", asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.public_id AS userId, u.full_name AS fullName, u.email,
            u.phone_country_code AS phoneCountryCode, u.phone_number AS phone,
            u.account_status AS accountStatus, r.code AS roleCode, r.label AS role,
            ap.date_of_birth AS dateOfBirth, ap.gender, ap.address, ap.city, ap.state,
            ap.postal_code AS postalCode, ap.country, ap.highest_qualification AS qualification,
            ap.institution_name AS institution, ap.profile_photo_path AS profilePhotoPath,
            ap.intended_programme_id AS programmeId, p.name AS programme
     FROM users u JOIN roles r ON r.id = u.role_id
     LEFT JOIN applicant_profiles ap ON ap.user_id = u.id
     LEFT JOIN programmes p ON p.id = ap.intended_programme_id
     WHERE u.id = ? LIMIT 1`,
    [req.auth.userId],
  );
  if (!rows[0]) throw new HttpError(404, "Profile not found.");
  return sendOk(res, rows[0]);
}));

router.patch("/me", authorize("APPLICANT"), validateBody(profileSchema), asyncHandler(async (req, res) => {
  const body = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userFields = [];
    const userValues = [];
    if (body.fullName !== undefined) { userFields.push("full_name = ?"); userValues.push(body.fullName); }
    if (body.email !== undefined) { userFields.push("email = ?"); userValues.push(body.email); }
    if (body.phoneCountryCode !== undefined) { userFields.push("phone_country_code = ?"); userValues.push(body.phoneCountryCode); }
    if (body.phone !== undefined) { userFields.push("phone_number = ?"); userValues.push(body.phone); }
    if (userFields.length) {
      userValues.push(req.auth.userId);
      await connection.execute(`UPDATE users SET ${userFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, userValues);
    }

    const profileFields = {
      dateOfBirth: "date_of_birth",
      gender: "gender",
      address: "address",
      city: "city",
      state: "state",
      postalCode: "postal_code",
      country: "country",
      qualification: "highest_qualification",
      institution: "institution_name",
      programmeId: "intended_programme_id",
    };
    const setClauses = [];
    const values = [];
    for (const [field, column] of Object.entries(profileFields)) {
      if (body[field] !== undefined) {
        setClauses.push(`${column} = ?`);
        values.push(body[field] === "" ? null : body[field]);
      }
    }
    if (setClauses.length) {
      values.push(req.auth.userId);
      await connection.execute(
        `INSERT INTO applicant_profiles (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)`,
        [req.auth.userId],
      );
      await connection.execute(`UPDATE applicant_profiles SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`, values);
    }
    await writeAudit(connection, {
      actorUserId: req.auth.userId,
      action: "PROFILE_UPDATED",
      entityType: "USER",
      entityId: req.auth.userId,
      metadata: { updatedFields: Object.keys(body) },
      ipAddress: req.ip,
    });
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return sendOk(res, { updated: true }, 200, "Profile updated.");
}));

router.get("/education-records", authorize("APPLICANT"), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, qualification, institution_name AS institution, board, year_of_passing AS yearOfPassing,
            marks_obtained AS marksObtained, maximum_marks AS maximumMarks,
            percentage, created_at AS createdAt
     FROM education_records WHERE user_id = ? ORDER BY year_of_passing DESC, id DESC`,
    [req.auth.userId],
  );
  return sendOk(res, rows);
}));

router.post("/education-records", authorize("APPLICANT"), validateBody(z.object({
  qualification: z.string().trim().min(2).max(100).transform(normalizeQualification),
  institution: z.string().trim().min(2).max(180),
  board: z.string().trim().max(180).optional().nullable(),
  yearOfPassing: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  marksObtained: z.coerce.number().nonnegative(),
  maximumMarks: z.coerce.number().positive(),
})), asyncHandler(async (req, res) => {
  if (req.body.marksObtained > req.body.maximumMarks) throw new HttpError(422, "Marks obtained cannot exceed maximum marks.");
  const percentage = Number(((req.body.marksObtained / req.body.maximumMarks) * 100).toFixed(2));
  const [result] = await pool.execute(
    `INSERT INTO education_records (user_id, qualification, institution_name, board, year_of_passing, marks_obtained, maximum_marks, percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.auth.userId, req.body.qualification, req.body.institution, req.body.board || null, req.body.yearOfPassing, req.body.marksObtained, req.body.maximumMarks, percentage],
  );
  return sendOk(res, { id: result.insertId, percentage }, 201, "Academic record saved.");
}));

router.delete("/education-records/:recordId", authorize("APPLICANT"), asyncHandler(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM education_records WHERE id = ? AND user_id = ?", [req.params.recordId, req.auth.userId]);
  if (!result.affectedRows) throw new HttpError(404, "Academic record not found.");
  return sendOk(res, null, 200, "Academic record deleted.");
}));

export default router;
