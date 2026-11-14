import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Inbox,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const themeStyles = {
  wine: {
    eyebrow: "text-[#78364d]",
    accent: "bg-[#78364d]",
    active: "bg-[#f8eef1] text-[#71364a] border-[#ead1d9]",
    unread: "bg-[#fcf5f6]",
    link: "text-[#78364d]",
  },
  amber: {
    eyebrow: "text-amber-800",
    accent: "bg-amber-700",
    active: "bg-amber-50 text-amber-900 border-amber-200",
    unread: "bg-amber-50/60",
    link: "text-amber-800",
  },
  teal: {
    eyebrow: "text-teal-800",
    accent: "bg-teal-700",
    active: "bg-teal-50 text-teal-900 border-teal-200",
    unread: "bg-teal-50/60",
    link: "text-teal-800",
  },
  indigo: {
    eyebrow: "text-indigo-800",
    accent: "bg-indigo-700",
    active: "bg-indigo-50 text-indigo-900 border-indigo-200",
    unread: "bg-indigo-50/60",
    link: "text-indigo-800",
  },
  blue: {
    eyebrow: "text-blue-800",
    accent: "bg-blue-700",
    active: "bg-blue-50 text-blue-900 border-blue-200",
    unread: "bg-blue-50/60",
    link: "text-blue-800",
  },
};

function typeIcon(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("document")) return FileCheck2;
  if (key.includes("review") || key.includes("department"))
    return GraduationCap;
  if (key.includes("eligibility") || key.includes("decision"))
    return ShieldCheck;
  return Bell;
}

function formattedDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function NotificationCenterPage({
  role = "applicant",
  notifications = [],
  unreadCount = 0,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onRemove = () => {},
  onClearAll = () => {},
  onNotificationOpen = () => {},
  tone = "wine",
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const theme = themeStyles[tone] || themeStyles.wine;
  const roleTitle = String(role).replace(/[-_]/g, " ");
  const readCount = notifications.length - unreadCount;

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesText =
        `${item.title || ""} ${item.message || ""} ${item.applicationId || ""} ${item.type || ""}`
          .toLowerCase()
          .includes(search);
      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" ? !item.read : Boolean(item.read));
      return matchesText && matchesFilter;
    });
  }, [notifications, query, filter]);

  const openItem = (item) => {
    if (!item.read) onMarkAsRead(item.id);
    onNotificationOpen(item);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className={`text-[10px] font-extrabold uppercase tracking-[0.2em] ${theme.eyebrow}`}
          >
            Communication centre · {roleTitle}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Stay informed about application activity, document updates and
            admission workflow actions assigned to your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <CheckCheck size={15} /> Mark all as read
            </button>
          ) : null}
          {notifications.length > 0 ? (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 size={14} /> Clear inbox
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total notifications"
          value={notifications.length}
          hint="All updates in your inbox"
          icon={Bell}
        />
        <Stat
          label="Unread"
          value={unreadCount}
          hint="Updates not opened yet"
          icon={Inbox}
          highlighted
        />
        <Stat
          label="Read"
          value={readCount}
          hint="Previously reviewed updates"
          icon={CheckCircle2}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_35px_-28px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Your inbox
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Search by title, message, notification type or application ID.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notifications..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </label>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {["All", "Unread", "Read"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`min-h-8 rounded-lg border px-3 text-[10px] font-bold transition ${filter === item ? theme.active : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  {item}
                  {item === "Unread" && unreadCount > 0 ? (
                    <span className="ml-1.5">{unreadCount}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center sm:py-16">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox size={24} />
            </span>
            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
              {notifications.length === 0
                ? "You're all caught up"
                : "No matching notifications"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              {notifications.length === 0
                ? "There are no updates in this inbox yet. New notifications will appear when relevant admission workflow events occur."
                : "Try another search phrase or switch the notification filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const Icon = typeIcon(item.type);
              return (
                <article
                  key={item.id}
                  className={`flex flex-col gap-3 p-4 transition sm:flex-row sm:items-start sm:p-5 ${!item.read ? theme.unread : "hover:bg-slate-50/70"}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xs font-extrabold text-slate-800">
                        {item.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.read ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-700"}`}
                      >
                        {item.read ? "Read" : "Unread"}
                      </span>
                      {item.type ? (
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-semibold capitalize text-slate-500">
                          {String(item.type).replace(/[-_]/g, " ")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      {item.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      <span>{formattedDate(item.createdAt)}</span>
                      {item.applicationId ? (
                        <span>Application: {item.applicationId}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    {item.route || item.applicationId ? (
                      <button
                        type="button"
                        onClick={() => openItem(item)}
                        className={`min-h-8 rounded-lg px-3 text-[10px] font-extrabold transition ${theme.link} hover:bg-white`}
                      >
                        Open update
                      </button>
                    ) : null}
                    {!item.read ? (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(item.id)}
                        className="min-h-8 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                      >
                        Mark read
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove notification"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400 sm:px-5">
          <span>
            {filtered.length} of {notifications.length} notifications
          </span>
          <span>Inbox scoped to your signed-in account</span>
        </div>
      </div>
      <p className="text-[10px] leading-5 text-slate-400">
        Frontend preview: notifications are stored in this browser and are not
        yet synchronized with the server. Connect the notification API before
        production use.
      </p>
    </section>
  );
}

function Stat({ label, value, hint, icon: Icon, highlighted = false }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_28px_-26px_rgba(15,23,42,0.3)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
        </div>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${highlighted ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-500"}`}
        >
          <Icon size={17} />
        </span>
      </div>
    </div>
  );
}
