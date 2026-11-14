const EVENT_NAME = "credifit:notifications-updated";

export function normalizeRole(role = "applicant") {
  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "applicant";
}

export function notificationStorageKey(role, userId) {
  return `credifit:notifications:${normalizeRole(role)}:${String(userId || "preview-user")}`;
}

export function readStoredNotifications(role, userId) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(notificationStorageKey(role, userId)) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredNotifications(role, userId, items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      notificationStorageKey(role, userId),
      JSON.stringify(items),
    );
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { key: notificationStorageKey(role, userId) },
      }),
    );
  } catch (error) {
    // Storage can be unavailable in private browsing or restricted environments.
    console.warn("CrediFit could not persist notifications in this browser.", error);
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Frontend-preview notification publisher. This writes to the recipient's
 * browser-local inbox. Replace server-side workflow calls with the API service
 * when the Express/MySQL notification endpoints are ready.
 */
export function publishLocalNotification({
  role,
  userId,
  title,
  message,
  type = "system",
  applicationId = "",
  route = "",
  createdAt = new Date().toISOString(),
}) {
  if (!role || !title || !message) {
    throw new Error("A recipient role, title and message are required.");
  }
  const current = readStoredNotifications(role, userId);
  const item = {
    id: makeId(),
    title,
    message,
    type,
    applicationId,
    route,
    createdAt,
    read: false,
  };
  writeStoredNotifications(role, userId, [item, ...current]);
  return item;
}

export function replaceStoredNotifications(role, userId, items) {
  writeStoredNotifications(role, userId, Array.isArray(items) ? items : []);
}

export { EVENT_NAME as NOTIFICATION_UPDATE_EVENT };
