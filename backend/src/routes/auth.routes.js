import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { asyncHandler, HttpError, sendOk, toPublicUser } from "../lib/http.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createOpaqueToken,
  createPublicId,
  hashToken,
  refreshCookieOptions,
  writeAudit,
} from "../services/records.js";
import { normalizeQualification } from "../services/qualifications.js";
import { isSmtpConfigured, sendPasswordResetEmail } from "../services/email.js";

const router = Router();
const googleOAuthClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().date().optional().or(z.literal("")),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  phoneCountryCode: z.string().trim().max(8).default("+91"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits."),
  qualification: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .transform(normalizeQualification),
  programme: z.string().trim().min(2).max(160),
  programmeId: z.coerce.number().int().positive().optional(),
  password: z.string().min(8).max(72),
});
const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1),
  expectedRole: z.string().optional(),
  role: z.string().optional(),
});

function roleCodeFromLabel(value = "") {
  const key = value.toLowerCase().replace(/[^a-z]/g, "");
  return (
    {
      applicant: "APPLICANT",
      admissionofficer: "ADMISSION_OFFICER",
      officer: "ADMISSION_OFFICER",
      evaluator: "EVALUATOR",
      admin: "ADMIN",
      administrator: "ADMIN",
    }[key] || null
  );
}

function signAccessToken(user) {
  return jwt.sign(
    { role: user.role_code, email: user.email, publicId: user.public_id },
    env.JWT_ACCESS_SECRET,
    {
      subject: String(user.id),
      expiresIn: env.JWT_ACCESS_TTL,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );
}

async function issueRefreshSession(connection, userId) {
  const refreshToken = createOpaqueToken();
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );
  await connection.execute(
    `INSERT INTO refresh_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [userId, hashToken(refreshToken), expiresAt],
  );
  return refreshToken;
}

function attachRefreshCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, refreshCookieOptions());
}

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [roleRows] = await connection.execute(
        "SELECT id FROM roles WHERE code = 'APPLICANT' LIMIT 1",
      );
      if (!roleRows[0])
        throw new HttpError(500, "The applicant role has not been seeded.");

      let programmeId = req.body.programmeId || null;
      if (programmeId) {
        const [programmeRows] = await connection.execute(
          "SELECT id FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
          [programmeId],
        );
        programmeId = programmeRows[0]?.id || null;
        if (!programmeId)
          throw new HttpError(
            422,
            "The selected programme is not active or does not exist.",
          );
      } else if (req.body.programme) {
        // Match both canonical catalogue labels (for example, B.Com) and the
        // compact values currently emitted by RegisterPage (for example, BCom).
        const normaliseProgramme = (value) =>
          String(value)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
        const [programmeRows] = await connection.execute(
          "SELECT id, code, short_code, name FROM programmes WHERE is_active = 1",
        );
        const requested = normaliseProgramme(req.body.programme);
        const match = programmeRows.find((item) =>
          [item.code, item.short_code, item.name].some(
            (candidate) => normaliseProgramme(candidate) === requested,
          ),
        );
        programmeId = match?.id || null;
        if (!programmeId)
          throw new HttpError(
            422,
            "The selected programme could not be matched to an active programme in the catalogue.",
          );
      }

      const passwordHash = await bcrypt.hash(req.body.password, 12);
      const publicId = createPublicId();
      const [userResult] = await connection.execute(
        `INSERT INTO users (public_id, role_id, full_name, email, password_hash, phone_country_code, phone_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          publicId,
          roleRows[0].id,
          req.body.fullName,
          req.body.email,
          passwordHash,
          req.body.phoneCountryCode,
          req.body.phone,
        ],
      );
      const userId = userResult.insertId;
      await connection.execute(
        `INSERT INTO applicant_profiles (user_id, date_of_birth, highest_qualification, intended_programme_id)
       VALUES (?, ?, ?, ?)`,
        [
          userId,
          req.body.dateOfBirth || null,
          req.body.qualification,
          programmeId,
        ],
      );
      await writeAudit(connection, {
        actorUserId: userId,
        action: "ACCOUNT_REGISTERED",
        entityType: "USER",
        entityId: userId,
        metadata: { role: "APPLICANT" },
        ipAddress: req.ip,
      });
      await connection.commit();

      const [rows] = await pool.execute(
        `SELECT u.*, r.code AS role_code, r.label AS role_label, NULL AS department
       FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
        [userId],
      );
      const accessToken = signAccessToken(rows[0]);
      const refreshToken = await issueRefreshSession(pool, userId);
      attachRefreshCookie(res, refreshToken);
      return sendOk(
        res,
        { user: toPublicUser(rows[0]), accessToken },
        201,
        "Applicant account created.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT u.*, r.code AS role_code, r.label AS role_label, sp.department
     FROM users u JOIN roles r ON r.id = u.role_id
     LEFT JOIN staff_profiles sp ON sp.user_id = u.id
     WHERE u.email = ? LIMIT 1`,
      [req.body.email],
    );
    const user = rows[0];
    if (
      !user ||
      !(await bcrypt.compare(req.body.password, user.password_hash))
    ) {
      throw new HttpError(401, "Email or password is incorrect.");
    }
    if (user.account_status !== "ACTIVE")
      throw new HttpError(
        403,
        "This account is not active. Contact the administrator.",
      );
    const expectedRole = roleCodeFromLabel(
      req.body.expectedRole || req.body.role || "",
    );
    if (expectedRole && expectedRole !== user.role_code) {
      throw new HttpError(
        403,
        `This account is registered as ${user.role_label}. Select the matching role to sign in.`,
      );
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshSession(pool, user.id);
    await pool.execute(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );
    attachRefreshCookie(res, refreshToken);
    return sendOk(
      res,
      { user: toPublicUser(user), accessToken },
      200,
      "Signed in successfully.",
    );
  }),
);

const forgotPasswordSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
});
const resetPasswordSchema = z.object({
  token: z.string().trim().min(20).max(200),
  password: z.string().min(8).max(72),
});
const googleCredentialSchema = z.object({
  credential: z.string().min(100).max(10000),
  nonce: z.string().min(20).max(200),
});

const PASSWORD_RESET_TTL_MINUTES = 30;
const PASSWORD_RESET_MAX_REQUESTS_PER_15_MINUTES = 3;
const genericResetMessage =
  "If an active CrediFit account matches that email, a password reset link will be sent.";

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    // Check configuration before looking up an account so this response does not
    // disclose whether an email is registered when the mail provider is absent.
    if (!isSmtpConfigured()) {
      throw new HttpError(
        503,
        "Password reset email is temporarily unavailable. Please contact the administrator.",
      );
    }

    const [users] = await pool.execute(
      `SELECT id, full_name, email FROM users
     WHERE email = ? AND account_status = 'ACTIVE' LIMIT 1`,
      [req.body.email],
    );
    const user = users[0];
    if (!user) return sendOk(res, null, 200, genericResetMessage);

    const [recentRows] = await pool.execute(
      `SELECT COUNT(*) AS request_count FROM password_reset_tokens
     WHERE user_id = ? AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)`,
      [user.id],
    );
    if (
      Number(recentRows[0]?.request_count || 0) >=
      PASSWORD_RESET_MAX_REQUESTS_PER_15_MINUTES
    ) {
      return sendOk(res, null, 200, genericResetMessage);
    }

    const rawToken = createOpaqueToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
    );
    await pool.execute(
      `UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP()
     WHERE user_id = ? AND used_at IS NULL`,
      [user.id],
    );
    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, requested_ip)
     VALUES (?, ?, ?, ?)`,
      [user.id, tokenHash, expiresAt, req.ip || null],
    );

    const resetUrl = new URL("/reset-password", env.CLIENT_APP_URL);
    resetUrl.searchParams.set("token", rawToken);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        resetUrl: resetUrl.toString(),
        expiresMinutes: PASSWORD_RESET_TTL_MINUTES,
      });
    } catch (error) {
      await pool.execute(
        `UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE token_hash = ? AND used_at IS NULL`,
        [tokenHash],
      );
      // Never log the reset token, full reset URL, or account email.
      console.error(
        "[AUTH] Password reset email delivery failed:",
        error.message,
      );
      return sendOk(res, null, 200, genericResetMessage);
    }

    try {
      await writeAudit(pool, {
        actorUserId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "USER",
        entityId: user.id,
        metadata: { channel: "EMAIL" },
        ipAddress: req.ip,
      });
    } catch (auditError) {
      // Audit failure must not invalidate a reset email that has already been sent.
      console.error(
        "[AUTH] Could not write password-reset audit event:",
        auditError.message,
      );
    }

    return sendOk(res, null, 200, genericResetMessage);
  }),
);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        `SELECT prt.id AS reset_id, prt.user_id, prt.expires_at, prt.used_at,
              u.account_status
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = ?
       LIMIT 1 FOR UPDATE`,
        [hashToken(req.body.token)],
      );
      const reset = rows[0];
      if (
        !reset ||
        reset.used_at ||
        new Date(reset.expires_at) <= new Date() ||
        reset.account_status !== "ACTIVE"
      ) {
        throw new HttpError(
          400,
          "This password reset link is invalid or has expired. Request a new link.",
        );
      }

      const passwordHash = await bcrypt.hash(req.body.password, 12);
      await connection.execute(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [passwordHash, reset.user_id],
      );
      await connection.execute(
        "UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE id = ?",
        [reset.reset_id],
      );
      await connection.execute(
        "UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND used_at IS NULL",
        [reset.user_id],
      );
      await connection.execute(
        "UPDATE refresh_sessions SET revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND revoked_at IS NULL",
        [reset.user_id],
      );
      await writeAudit(connection, {
        actorUserId: reset.user_id,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "USER",
        entityId: reset.user_id,
        metadata: { sessionsRevoked: true },
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        null,
        200,
        "Password updated. Please sign in with your new password.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/google",
  validateBody(googleCredentialSchema),
  asyncHandler(async (req, res) => {
    if (!googleOAuthClient || !env.GOOGLE_CLIENT_ID) {
      throw new HttpError(
        503,
        "Google sign-in is not configured yet. Contact the administrator.",
      );
    }

    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: req.body.credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(
        401,
        "Google could not verify this sign-in. Please try again.",
      );
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new HttpError(
        401,
        "Use a Google account with a verified email address.",
      );
    }
    if (!payload.nonce || payload.nonce !== req.body.nonce) {
      throw new HttpError(
        401,
        "Google sign-in could not be verified. Please try again.",
      );
    }

    const email = String(payload.email).trim().toLowerCase();
    const googleSubject = String(payload.sub);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      let user;
      let createdAccount = false;

      const [identityRows] = await connection.execute(
        `SELECT u.*, r.code AS role_code, r.label AS role_label, sp.department
       FROM auth_identities ai
       JOIN users u ON u.id = ai.user_id
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE ai.provider = 'GOOGLE' AND ai.provider_subject = ?
       LIMIT 1 FOR UPDATE`,
        [googleSubject],
      );

      if (identityRows[0]) {
        user = identityRows[0];
        await connection.execute(
          `UPDATE auth_identities SET provider_email = ?
         WHERE provider = 'GOOGLE' AND provider_subject = ?`,
          [email, googleSubject],
        );
      } else {
        const [emailRows] = await connection.execute(
          `SELECT u.*, r.code AS role_code, r.label AS role_label, sp.department
         FROM users u
         JOIN roles r ON r.id = u.role_id
         LEFT JOIN staff_profiles sp ON sp.user_id = u.id
         WHERE u.email = ? LIMIT 1 FOR UPDATE`,
          [email],
        );
        user = emailRows[0];

        if (user) {
          const [linkedRows] = await connection.execute(
            `SELECT id FROM auth_identities WHERE user_id = ? AND provider = 'GOOGLE' LIMIT 1 FOR UPDATE`,
            [user.id],
          );
          if (linkedRows[0]) {
            throw new HttpError(
              409,
              "A different Google account is already linked to this CrediFit account.",
            );
          }
        }

        if (!user) {
          const [roleRows] = await connection.execute(
            "SELECT id FROM roles WHERE code = 'APPLICANT' LIMIT 1",
          );
          if (!roleRows[0])
            throw new HttpError(500, "The applicant role has not been seeded.");
          const randomPasswordHash = await bcrypt.hash(createOpaqueToken(), 12);
          const displayName =
            String(payload.name || email.split("@")[0])
              .trim()
              .slice(0, 120) || "Applicant";
          const [insertResult] = await connection.execute(
            `INSERT INTO users
             (public_id, role_id, full_name, email, password_hash, email_verified_at)
           VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
            [
              createPublicId(),
              roleRows[0].id,
              displayName,
              email,
              randomPasswordHash,
            ],
          );
          const newUserId = insertResult.insertId;
          await connection.execute(
            `INSERT INTO applicant_profiles (user_id, country) VALUES (?, 'India')`,
            [newUserId],
          );
          const [createdRows] = await connection.execute(
            `SELECT u.*, r.code AS role_code, r.label AS role_label, NULL AS department
           FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1`,
            [newUserId],
          );
          user = createdRows[0];
          createdAccount = true;
        } else {
          if (user.account_status !== "ACTIVE") {
            throw new HttpError(
              403,
              "This account is not active. Contact the administrator.",
            );
          }
          await connection.execute(
            "UPDATE users SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP()) WHERE id = ?",
            [user.id],
          );
        }

        await connection.execute(
          `INSERT INTO auth_identities (user_id, provider, provider_subject, provider_email)
         VALUES (?, 'GOOGLE', ?, ?)`,
          [user.id, googleSubject, email],
        );
      }

      if (!user || user.account_status !== "ACTIVE") {
        throw new HttpError(
          403,
          "This account is not active. Contact the administrator.",
        );
      }

      await connection.execute(
        "UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?",
        [user.id],
      );
      await writeAudit(connection, {
        actorUserId: user.id,
        action: createdAccount ? "GOOGLE_ACCOUNT_CREATED" : "GOOGLE_SIGN_IN",
        entityType: "USER",
        entityId: user.id,
        metadata: { provider: "GOOGLE", createdAccount },
        ipAddress: req.ip,
      });
      const refreshToken = await issueRefreshSession(connection, user.id);
      await connection.commit();

      attachRefreshCookie(res, refreshToken);
      return sendOk(
        res,
        {
          user: toPublicUser(user),
          accessToken: signAccessToken(user),
          isNewAccount: createdAccount,
        },
        200,
        createdAccount
          ? "Your Applicant account was created with Google."
          : "Signed in with Google.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const rawToken = req.cookies?.[env.COOKIE_NAME];
    if (!rawToken)
      throw new HttpError(
        401,
        "Your refresh session is missing. Please sign in again.",
      );

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [sessions] = await connection.execute(
        `SELECT rs.id AS session_id, rs.user_id, rs.expires_at, rs.revoked_at,
              u.id, u.public_id, u.email, u.account_status, r.code AS role_code,
              r.label AS role_label, u.full_name, u.phone_country_code, u.phone_number,
              sp.department
       FROM refresh_sessions rs
       JOIN users u ON u.id = rs.user_id
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN staff_profiles sp ON sp.user_id = u.id
       WHERE rs.token_hash = ? FOR UPDATE`,
        [hashToken(rawToken)],
      );
      const session = sessions[0];
      if (
        !session ||
        session.revoked_at ||
        new Date(session.expires_at) <= new Date() ||
        session.account_status !== "ACTIVE"
      ) {
        throw new HttpError(
          401,
          "Your session is no longer valid. Please sign in again.",
        );
      }

      await connection.execute(
        "UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?",
        [session.session_id],
      );
      const newRefreshToken = await issueRefreshSession(
        connection,
        session.user_id,
      );
      await connection.commit();
      attachRefreshCookie(res, newRefreshToken);
      return sendOk(
        res,
        {
          user: toPublicUser(session),
          accessToken: signAccessToken(session),
        },
        200,
        "Session refreshed.",
      );
    } catch (error) {
      await connection.rollback();
      res.clearCookie(env.COOKIE_NAME, {
        ...refreshCookieOptions(),
        maxAge: undefined,
      });
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const rawToken = req.cookies?.[env.COOKIE_NAME];
    if (rawToken) {
      await pool.execute(
        "UPDATE refresh_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL",
        [hashToken(rawToken)],
      );
    }
    res.clearCookie(env.COOKIE_NAME, {
      ...refreshCookieOptions(),
      maxAge: undefined,
    });
    return sendOk(res, null, 200, "Signed out.");
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT u.*, r.code AS role_code, r.label AS role_label, sp.department,
            ap.date_of_birth, ap.gender, ap.address, ap.city, ap.state, ap.postal_code,
            ap.country, ap.highest_qualification, ap.institution_name, ap.profile_photo_path,
            p.name AS intended_programme
     FROM users u JOIN roles r ON r.id = u.role_id
     LEFT JOIN staff_profiles sp ON sp.user_id = u.id
     LEFT JOIN applicant_profiles ap ON ap.user_id = u.id
     LEFT JOIN programmes p ON p.id = ap.intended_programme_id
     WHERE u.id = ? LIMIT 1`,
      [req.auth.userId],
    );
    if (!rows[0]) throw new HttpError(404, "Account not found.");
    const row = rows[0];
    return sendOk(res, {
      ...toPublicUser(row),
      profile: {
        dateOfBirth: row.date_of_birth,
        gender: row.gender,
        address: row.address,
        city: row.city,
        state: row.state,
        postalCode: row.postal_code,
        country: row.country,
        qualification: row.highest_qualification,
        institution: row.institution_name,
        profilePhotoPath: row.profile_photo_path,
        programme: row.intended_programme,
      },
    });
  }),
);

export default router;
