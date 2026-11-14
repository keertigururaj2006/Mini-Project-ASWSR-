import crypto from "node:crypto";
import { env } from "../config/env.js";

export async function writeAudit(connection, {
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  metadata = null,
  ipAddress = null,
}) {
  await connection.execute(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [actorUserId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null, ipAddress],
  );
}

export async function notifyUser(connection, {
  recipientUserId,
  actorUserId = null,
  title,
  message,
  type = "SYSTEM",
  applicationId = null,
  route = null,
}) {
  if (!recipientUserId) return;
  await connection.execute(
    `INSERT INTO notifications (recipient_user_id, actor_user_id, title, message, type, application_id, route)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recipientUserId, actorUserId, title, message, type, applicationId, route],
  );
}

export async function notifyRole(connection, roleCode, payload) {
  const [users] = await connection.execute(
    `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
     WHERE r.code = ? AND u.account_status = 'ACTIVE'`,
    [roleCode],
  );
  for (const user of users) {
    await notifyUser(connection, { ...payload, recipientUserId: user.id });
  }
}

export async function moveApplicationStage(connection, {
  applicationId,
  actorUserId = null,
  stageCode,
  status,
  reason = "",
}) {
  const [rows] = await connection.execute(
    `SELECT current_stage_code, status FROM applications WHERE id = ? FOR UPDATE`,
    [applicationId],
  );
  const application = rows[0];
  if (!application) return;

  await connection.execute(
    `UPDATE applications SET current_stage_code = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [stageCode, status, applicationId],
  );
  await connection.execute(
    `INSERT INTO application_stage_history
      (application_id, from_stage_code, to_stage_code, from_status, to_status, actor_user_id, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [applicationId, application.current_stage_code, stageCode, application.status, status, actorUserId, reason || null],
  );
}

export function createPublicId(prefix = "CF") {
  return `${prefix}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

export function createOpaqueToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  };
}
