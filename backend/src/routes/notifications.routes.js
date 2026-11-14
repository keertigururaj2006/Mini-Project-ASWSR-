import { Router } from "express";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const unreadOnly = String(req.query.unreadOnly || "false") === "true";
  const [rows] = await pool.execute(
    `SELECT n.id, n.title, n.message, n.type, n.application_id AS applicationId,
            a.application_number AS applicationNumber, n.route, n.is_read AS isRead,
            n.created_at AS createdAt
     FROM notifications n LEFT JOIN applications a ON a.id = n.application_id
     WHERE n.recipient_user_id = ? ${unreadOnly ? "AND n.is_read = 0" : ""}
     ORDER BY n.created_at DESC LIMIT ${limit}`,
    [req.auth.userId],
  );
  const [[unread]] = await pool.execute(
    "SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id = ? AND is_read = 0",
    [req.auth.userId],
  );
  const items = rows.map(({ isRead, ...item }) => ({ ...item, read: Boolean(isRead) }));
  return sendOk(res, { items, unreadCount: unread.count });
}));

router.patch("/:notificationId/read", asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_user_id = ?",
    [req.params.notificationId, req.auth.userId],
  );
  if (!result.affectedRows) throw new HttpError(404, "Notification not found.");
  return sendOk(res, { updated: true }, 200, "Notification marked as read.");
}));

router.patch("/read-all", asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    "UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE recipient_user_id = ? AND is_read = 0",
    [req.auth.userId],
  );
  return sendOk(res, { updatedCount: result.affectedRows }, 200, "All notifications marked as read.");
}));

router.delete("/:notificationId", asyncHandler(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM notifications WHERE id = ? AND recipient_user_id = ?", [req.params.notificationId, req.auth.userId]);
  if (!result.affectedRows) throw new HttpError(404, "Notification not found.");
  return sendOk(res, null, 200, "Notification deleted.");
}));

router.delete("/", asyncHandler(async (req, res) => {
  const [result] = await pool.execute("DELETE FROM notifications WHERE recipient_user_id = ?", [req.auth.userId]);
  return sendOk(res, { deletedCount: result.affectedRows }, 200, "Notification centre cleared.");
}));

export default router;
