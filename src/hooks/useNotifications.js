import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NOTIFICATION_UPDATE_EVENT,
  notificationStorageKey,
  publishLocalNotification,
  readStoredNotifications,
  replaceStoredNotifications,
} from "../utils/notificationStorage";

/**
 * Shared notification inbox for Applicant, Admission Officer, Evaluator and Admin.
 * Data is isolated by role + userId and stored in localStorage for frontend preview.
 * Use the matching authenticated user ID; never use a role name as a production ID.
 */
export function useNotifications({ role, userId = "preview-user" }) {
  const storageKey = useMemo(
    () => notificationStorageKey(role, userId),
    [role, userId],
  );
  const [notifications, setNotifications] = useState(() =>
    readStoredNotifications(role, userId),
  );

  useEffect(() => {
    const sync = (event) => {
      if (!event?.detail?.key || event.detail.key === storageKey) {
        setNotifications(readStoredNotifications(role, userId));
      }
    };
    const syncStorage = (event) => {
      if (!event.key || event.key === storageKey) {
        setNotifications(readStoredNotifications(role, userId));
      }
    };
    window.addEventListener(NOTIFICATION_UPDATE_EVENT, sync);
    window.addEventListener("storage", syncStorage);
    setNotifications(readStoredNotifications(role, userId));
    return () => {
      window.removeEventListener(NOTIFICATION_UPDATE_EVENT, sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, [role, userId, storageKey]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const addNotification = useCallback(
    (item) => publishLocalNotification({ ...item, role, userId }),
    [role, userId],
  );

  const markAsRead = useCallback(
    (id) => {
      const next = readStoredNotifications(role, userId).map((item) =>
        item.id === id ? { ...item, read: true } : item,
      );
      replaceStoredNotifications(role, userId, next);
      setNotifications(next);
    },
    [role, userId],
  );

  const markAllAsRead = useCallback(() => {
    const next = readStoredNotifications(role, userId).map((item) => ({
      ...item,
      read: true,
    }));
    replaceStoredNotifications(role, userId, next);
    setNotifications(next);
  }, [role, userId]);

  const removeNotification = useCallback(
    (id) => {
      const next = readStoredNotifications(role, userId).filter(
        (item) => item.id !== id,
      );
      replaceStoredNotifications(role, userId, next);
      setNotifications(next);
    },
    [role, userId],
  );

  const clearAll = useCallback(() => {
    replaceStoredNotifications(role, userId, []);
    setNotifications([]);
  }, [role, userId]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}
