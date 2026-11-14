import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  Inbox,
  ShieldCheck,
  X,
} from "lucide-react";

const toneStyles = {
  wine: {
    button:
      "hover:bg-[#f8eef1] hover:text-[#71364a] focus-visible:ring-[#e9cbd4]",
    dot: "bg-[#78364d]",
    unread: "bg-[#fbf2f4]",
    link: "text-[#78364d] hover:text-[#512338]",
  },
  amber: {
    button:
      "hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-200",
    dot: "bg-amber-600",
    unread: "bg-amber-50/70",
    link: "text-amber-800 hover:text-amber-950",
  },
  teal: {
    button: "hover:bg-teal-50 hover:text-teal-800 focus-visible:ring-teal-200",
    dot: "bg-teal-600",
    unread: "bg-teal-50/70",
    link: "text-teal-800 hover:text-teal-950",
  },
  blue: {
    button: "hover:bg-blue-50 hover:text-blue-800 focus-visible:ring-blue-200",
    dot: "bg-blue-600",
    unread: "bg-blue-50/70",
    link: "text-blue-800 hover:text-blue-950",
  },
  indigo: {
    button:
      "hover:bg-indigo-50 hover:text-indigo-800 focus-visible:ring-indigo-200",
    dot: "bg-indigo-600",
    unread: "bg-indigo-50/70",
    link: "text-indigo-800 hover:text-indigo-950",
  },

  gold: {
    button:
      "hover:bg-amber-50 hover:text-amber-800 focus-visible:ring-amber-200",
    dot: "bg-amber-600",
    unread: "bg-amber-50/70",
    link: "text-amber-500 hover:text-amber-800",
  },
};

function getTypeIcon(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("document")) return FileCheck2;
  if (key.includes("review") || key.includes("department"))
    return GraduationCap;
  if (key.includes("eligibility") || key.includes("decision"))
    return ShieldCheck;
  return Bell;
}

function timeLabel(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const delta = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onViewAll = () => {},
  onNotificationOpen = () => {},
  tone = "wine",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const styles = toneStyles[tone] || toneStyles.wine;
  const latest = notifications.slice(0, 4);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openNotification = (item) => {
    if (!item.read) onMarkAsRead(item.id);
    setOpen(false);
    onNotificationOpen(item);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 outline-none transition focus-visible:ring-2 ${styles.button}`}
      >
        <Bell size={19} />
        {unreadCount > 0 ? (
          <>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[min(370px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.38)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                Notifications
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          {latest.length ? (
            <div className="max-h-[360px] overflow-y-auto p-2">
              {latest.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${!item.read ? styles.unread : ""}`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <TypeIcon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-xs font-bold text-slate-800">
                          {item.title}
                        </span>
                        {!item.read ? (
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                          />
                        ) : null}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-slate-500">
                        {item.message}
                      </span>
                      <span className="mt-1.5 block text-[10px] text-slate-400">
                        {timeLabel(item.createdAt)}
                        {item.applicationId ? ` · ${item.applicationId}` : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-9 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={20} />
              </span>
              <p className="mt-3 text-xs font-bold text-slate-700">
                You're all caught up
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                New updates will appear here when an admission workflow event
                occurs.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 transition hover:text-slate-900"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">
                No unread updates
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onViewAll();
              }}
              className={`inline-flex items-center gap-1 text-[10px] font-extrabold transition ${styles.link}`}
            >
              View notification centre <ChevronRight size={13} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
