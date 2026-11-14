import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileSearch,
  Filter,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  Workflow,
  X,
  XCircle,
} from "lucide-react";

import ProfileMenu from "../../components/Profile/ProfileMenu";
import usePersistedDashboardSection from "../../hooks/usePersistedDashboardSection.js";

/*
 * CrediFit — Officer Workspace
 * Frontend-only shell. Replace the empty collections below with API data
 * and connect the action handlers to the Node.js/MySQL backend.
 * No demo applicants or fabricated workflow counts are displayed.
 */
const applications = [];
const documents = [];
const eligibilityCases = [];
const notifications = [];

const navigation = [
  { label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { label: "Applications", icon: Users, group: "Workspace" },
  { label: "Document Verification", icon: FileCheck2, group: "Screening" },
  { label: "Eligibility Review", icon: ShieldCheck, group: "Screening" },
  { label: "Admission Workflow", icon: Workflow, group: "Screening" },
  { label: "Notifications", icon: Bell, group: "Communication" },
  { label: "Reports", icon: ChartNoAxesCombined, group: "Insights" },
];

const workflowStages = [
  {
    title: "Application submission",
    description: "Application details are submitted by the applicant.",
    owner: "Applicant",
    icon: ClipboardList,
    checks: [
      "Applicant completes required personal and academic details",
      "Mandatory documents are uploaded",
      "Applicant confirms the application before submission",
    ],
    officerActions: [],
    nextOwner: "Admission Office",
  },
  {
    title: "Document verification",
    description:
      "The admission team checks the authenticity and completeness of documents.",
    owner: "Admission Officer",
    icon: FileCheck2,
    checks: [
      "Every required document is present",
      "Scans are readable, complete, and correctly oriented",
      "Names, dates, and academic details are consistent",
      "Rejected or returned documents include a specific correction reason",
    ],
    officerActions: [
      "Mark document verification complete",
      "Return application for document resubmission",
    ],
    nextOwner: "Eligibility Screening",
  },
  {
    title: "Eligibility screening",
    description:
      "Submitted academic details are checked against approved programme rules.",
    owner: "Admission Officer",
    icon: ShieldCheck,
    checks: [
      "Programme rules have been evaluated by the configured rule engine",
      "Academic evidence supports the recorded applicant details",
      "Any mismatch has an evidence reference and officer remark",
      "Officer recommendation is recorded separately from the rule-engine result",
    ],
    officerActions: [
      "Record eligibility review complete",
      "Request eligibility clarification",
    ],
    nextOwner: "Assigned Evaluator / Department Review",
  },
  {
    title: "Department review",
    description:
      "The application is routed for any required department-level assessment.",
    owner: "Assigned Evaluator",
    icon: GraduationCap,
    checks: [
      "The assigned evaluator reviews the relevant department criteria",
      "Assessment outcome and remarks are recorded",
      "Any required follow-up is sent to the responsible team",
    ],
    officerActions: [],
    nextOwner: "Authorized Administrator",
  },
  {
    title: "Final admission decision",
    description:
      "The authorized institutional authority records the final outcome.",
    owner: "Authorized Admin",
    icon: CheckCircle2,
    checks: [
      "All required screening and department stages are complete",
      "The decision is made by an authorized administrator",
      "The final outcome and decision date are recorded",
    ],
    officerActions: [],
    nextOwner: "Applicant notification",
  },
];

const cx = (...classes) => classes.filter(Boolean).join(" ");

function csvCell(value) {
  const rawValue = String(value ?? "");
  // Prefix spreadsheet formula-leading text so exported user content is not executed as a formula.
  const safeValue = /^[\s]*[=+\-@]/.test(rawValue) ? `'${rawValue}` : rawValue;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function matchesReportPeriod(value, period) {
  if (period === "All time") return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (period === "Last 30 days") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 30);
    return date >= cutoff && date <= now;
  }
  if (period === "This year") return date.getFullYear() === now.getFullYear();
  return true;
}

function PageHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#78364d]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#351b27] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={cx(
        "min-w-0 rounded-2xl border border-[#ebe2dc] bg-[#fffefd] shadow-[0_8px_30px_-24px_rgba(53,27,39,0.24)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function PanelTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#f0e8e2] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78364d]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-base font-extrabold text-[#351b27] sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  compact = false,
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center px-5 text-center",
        compact ? "py-8" : "py-12 sm:py-16",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f2ee] text-[#9d8790] ring-1 ring-[#eee5df]">
        <Icon size={25} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#351b27]">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-[#f8eef1] text-[#71364a] ring-[#ead6dc]",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-[#f5f0e8] text-[#927248] ring-[#e9dfcc]",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 rounded-2xl border border-[#ebe2dc] bg-[#fffefd] p-4 shadow-[0_8px_30px_-24px_rgba(53,27,39,0.24)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-[#351b27]">
            {value}
          </p>
        </div>
        <div className={cx("rounded-xl p-3 ring-1", tones[tone])}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-400">{description}</p>
    </motion.div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    "Under Review": "bg-[#f8eef1] text-[#71364a] ring-[#e6cbd3]",
    Verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    "Resubmission Required": "bg-orange-50 text-orange-700 ring-orange-200",
    Eligible: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Not Eligible": "bg-rose-50 text-rose-700 ring-rose-200",
    Upcoming: "bg-slate-100 text-slate-600 ring-slate-200",
    Reviewed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Follow-up Required": "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span
      className={cx(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset",
        styles[status] || styles.Upcoming,
      )}
    >
      {status || "Upcoming"}
    </span>
  );
}

function SearchBox({ value, onChange, placeholder = "Search records..." }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-[#e8ded8] bg-[#faf7f4] pl-10 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#b9788c] focus:bg-[#fffefd] focus:ring-4 focus:ring-[#f7edf0]"
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options, label, placeholder }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cx(
          "flex h-11 w-full min-w-[144px] items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-left text-xs font-semibold text-slate-700 shadow-sm outline-none transition",
          open
            ? "border-[#b9788c] ring-4 ring-[#f7edf0]"
            : "border-slate-300 hover:border-[#d8b2bd] hover:bg-slate-50/70",
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label || placeholder || value || "Select an option"}
        </span>
        <ChevronDown
          size={15}
          className={cx(
            "shrink-0 text-slate-400 transition-transform",
            open && "rotate-180 text-[#78364d]",
          )}
        />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[60] max-h-64 w-full min-w-[210px] overflow-y-auto rounded-xl border border-[#e8ded8] bg-[#fffefd] p-1.5 shadow-[0_18px_45px_-18px_rgba(53,27,39,0.28)] ring-1 ring-[#351b27]/5"
          role="listbox"
          aria-label={label}
        >
          {normalizedOptions.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cx(
                  "flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition",
                  selected
                    ? "bg-[#f8eef1] font-bold text-[#69364a]"
                    : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <span className="min-w-0">{option.label}</span>
                {selected ? (
                  <CheckCircle2 size={14} className="shrink-0 text-[#78364d]" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PermissionCard({ compact = false }) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-[#351b27] text-white",
        compact ? "p-4" : "p-5 sm:p-6",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-white/10 p-2 text-[#e8cbd3]">
          <ShieldCheck size={18} />
        </div>
        <h3 className="text-sm font-bold">Officer authority</h3>
      </div>
      <p className="mt-3 text-xs leading-6 text-[#f4e4e8]">
        Review assigned applications, verify or return documents, record
        screening remarks, and advance permitted workflow stages. Final
        admission decisions, user management, and programme rule changes remain
        restricted to authorized administrators.
      </p>
    </div>
  );
}

function BackendNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#ead6dc] bg-[#f8eef1]/80 p-4">
      <div className="mt-0.5 text-[#78364d]">
        <Activity size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#55283a]">
          Waiting for live institutional data
        </p>
        <p className="mt-1 text-xs leading-5 text-[#704151]/75">
          This frontend workspace is ready for integration. Counts and queues
          will populate after the Node.js/MySQL API is connected; no sample
          applicant records are being shown.
        </p>
      </div>
    </div>
  );
}

function DocumentReviewDialog({ document, onClose, onDecision }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const fileUrl =
    document.fileUrl || document.documentUrl || document.url || "";
  const safeFileUrl = /^https?:\/\//i.test(fileUrl) ? fileUrl : "";
  const fileName =
    document.fileName ||
    document.originalFileName ||
    document.documentName ||
    "Uploaded document";
  const fileType = (document.mimeType || "").toLowerCase();
  const lowerName = fileName.toLowerCase();
  const isPdf = fileType.includes("pdf") || lowerName.endsWith(".pdf");
  const isImage =
    fileType.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(lowerName);

  const submitDecision = (status) => {
    if (status !== "Verified" && !reason.trim()) {
      setError(
        "Please provide a reason so the applicant knows what needs to be corrected.",
      );
      return;
    }
    onDecision(document, status, reason.trim(), notes.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-review-title"
        className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78364d]">
              Document review
            </p>
            <h2
              id="document-review-title"
              className="mt-1 truncate text-lg font-extrabold text-[#351b27]"
            >
              {document.documentName || "Uploaded document"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {document.applicantName || "Applicant"} ·{" "}
              {document.applicationId || "Application ID unavailable"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document review"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
          <div className="min-h-[260px] border-b border-slate-100 bg-slate-50 p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Document preview
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Check legibility, completeness, and document identity.
                </p>
              </div>
              {safeFileUrl ? (
                <a
                  href={safeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-[#71364a] hover:bg-[#f8eef1]"
                >
                  <ArrowUpRight size={13} /> Open original
                </a>
              ) : null}
            </div>
            <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              {safeFileUrl && isPdf ? (
                <iframe
                  title={`Preview of ${fileName}`}
                  src={safeFileUrl}
                  className="h-[52vh] min-h-[300px] w-full"
                />
              ) : null}
              {safeFileUrl && isImage ? (
                <img
                  src={safeFileUrl}
                  alt={fileName}
                  className="max-h-[58vh] w-full object-contain"
                />
              ) : null}
              {!safeFileUrl || (!isPdf && !isImage) ? (
                <div className="max-w-sm px-6 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FileSearch size={22} />
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-700">
                    Preview unavailable
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    A secure PDF or image URL must be supplied by the document
                    service. The review details are still available here.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span className="max-w-full truncate">{fileName}</span>
              <span>Uploaded: {document.uploadedAt || "Date unavailable"}</span>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Applicant and submission
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <dt className="text-[10px] text-slate-400">Applicant</dt>
                  <dd className="mt-1 break-words font-semibold text-slate-700">
                    {document.applicantName || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Application ID</dt>
                  <dd className="mt-1 break-words font-mono font-semibold text-slate-700">
                    {document.applicationId || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">
                    Document category
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-700">
                    {document.documentName || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Current status</dt>
                  <dd className="mt-1">
                    <StatusPill status={document.status} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-[#ead6dc] bg-[#f8eef1]/75 p-3">
              <p className="text-[11px] font-bold text-[#55283a]">
                Review checklist
              </p>
              <ul className="mt-2 space-y-2 text-[10px] leading-4 text-[#633b49]/80">
                <li>• Confirm the document belongs to this applicant.</li>
                <li>
                  • Check all pages, text, stamps, and details are readable.
                </li>
                <li>
                  • Compare names and academic details with the application.
                </li>
                <li>
                  • Give a clear reason whenever a correction is requested or
                  the file is rejected.
                </li>
              </ul>
            </div>

            <div>
              <label
                htmlFor="document-review-reason"
                className="text-xs font-bold text-slate-700"
              >
                Reason for return or rejection{" "}
                <span className="font-normal text-slate-400">
                  (required for these actions)
                </span>
              </label>
              <textarea
                id="document-review-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setError("");
                }}
                rows={3}
                maxLength={1000}
                placeholder="Example: The uploaded marks card is cropped. Please upload a complete, readable copy."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#b9788c] focus:ring-4 focus:ring-[#f7edf0]"
              />
              <div className="mt-1 flex justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  Be specific and applicant-friendly.
                </span>
                <span className="text-[10px] text-slate-400">
                  {reason.length}/1000
                </span>
              </div>
              <label
                htmlFor="document-review-notes"
                className="mt-4 block text-xs font-bold text-slate-700"
              >
                Internal officer notes{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="document-review-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Internal notes for the review history..."
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#b9788c] focus:ring-4 focus:ring-[#f7edf0]"
              />
              {document.reviewHistory?.length ? (
                <div className="mt-4 rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold text-slate-700">
                    Previous review history
                  </p>
                  <div className="mt-2 space-y-3">
                    {[...document.reviewHistory]
                      .slice(-3)
                      .reverse()
                      .map((entry, index) => (
                        <div
                          key={`${entry.reviewedAt || index}-${entry.status}`}
                          className="border-l-2 border-[#ead6dc] pl-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill status={entry.status} />
                            <span className="text-[10px] text-slate-400">
                              {entry.reviewedAt
                                ? new Date(entry.reviewedAt).toLocaleString()
                                : "Previous review"}
                            </span>
                          </div>
                          {entry.reason ? (
                            <p className="mt-1 text-[10px] leading-4 text-slate-600">
                              Reason: {entry.reason}
                            </p>
                          ) : null}
                          {entry.notes ? (
                            <p className="mt-1 text-[10px] leading-4 text-slate-500">
                              Officer note: {entry.notes}
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
              {error ? (
                <p
                  role="alert"
                  className="mt-2 text-[11px] font-semibold text-rose-600"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-[10px] leading-5 text-amber-900/80">
              Frontend preview only: decisions are held in page state and are
              not saved to the institutional database yet. Backend integration
              must persist the decision, reviewer, timestamp, reason, and audit
              history.
            </div>
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => submitDecision("Rejected")}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50"
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              type="button"
              onClick={() => submitDecision("Resubmission Required")}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-200 px-3 text-[11px] font-bold text-amber-700 transition hover:bg-amber-50"
            >
              <AlertCircle size={14} /> Request resubmission
            </button>
            <button
              type="button"
              onClick={() => submitDecision("Verified")}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-[11px] font-bold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 size={14} /> Verify document
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

function EligibilityReviewDialog({ record, onClose, onSave }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const [recommendation, setRecommendation] = useState(
    record.officerRecommendation || "",
  );
  const [remarks, setRemarks] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [error, setError] = useState("");

  const ruleResult = record.ruleResult || record.status || "Pending";
  const criteria = Array.isArray(record.criteriaResults)
    ? record.criteriaResults
    : [];

  const submitReview = () => {
    if (!recommendation) {
      setError(
        "Choose an officer recommendation before submitting the review.",
      );
      return;
    }
    if (!remarks.trim()) {
      setError("Add a short explanation for your recommendation.");
      return;
    }
    onSave(record, recommendation, remarks.trim(), evidenceNotes.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="eligibility-review-title"
        className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78364d]">
              Eligibility assessment
            </p>
            <h2
              id="eligibility-review-title"
              className="mt-1 text-lg font-extrabold text-[#351b27]"
            >
              Review eligibility case
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {record.applicantName || "Applicant"} ·{" "}
              {record.applicationId || "Application ID unavailable"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close eligibility review"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">Applicant</p>
              <p className="mt-1 break-words text-sm font-bold text-slate-700">
                {record.applicantName || "Not provided"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">Programme</p>
              <p className="mt-1 break-words text-sm font-bold text-slate-700">
                {record.programme || "Not provided"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">Application ID</p>
              <p className="mt-1 break-words font-mono text-xs font-bold text-slate-700">
                {record.applicationId || "Not provided"}
              </p>
            </div>
            <div className="rounded-xl border border-[#ead6dc] bg-[#f8eef1]/75 p-4">
              <p className="text-[10px] text-[#71364a]">
                Rule-engine result (read-only)
              </p>
              <div className="mt-2">
                <StatusPill status={ruleResult} />
              </div>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-xs font-extrabold text-[#351b27]">
                Programme eligibility criteria
              </h3>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                These results should be supplied by the institution's configured
                eligibility rule engine.
              </p>
            </div>
            {criteria.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <BookOpen size={21} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  No criterion-level breakdown available
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  The API should provide criteria, expected values, applicant
                  values, and pass/fail outcomes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {criteria.map((criterion, index) => {
                  const passed =
                    criterion.passed === true ||
                    criterion.result === "Met" ||
                    criterion.result === "Pass";
                  const failed =
                    criterion.passed === false ||
                    criterion.result === "Not Met" ||
                    criterion.result === "Fail";
                  return (
                    <div
                      key={criterion.id || criterion.code || index}
                      className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {criterion.label ||
                            criterion.name ||
                            `Criterion ${index + 1}`}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Required:{" "}
                          {criterion.expectedValue ??
                            criterion.required ??
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">
                          Applicant evidence
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-600">
                          {criterion.actualValue ??
                            criterion.applicantValue ??
                            "Not supplied"}
                        </p>
                      </div>
                      <span
                        className={cx(
                          "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold",
                          passed
                            ? "bg-emerald-50 text-emerald-700"
                            : failed
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {criterion.result ||
                          (passed ? "Met" : failed ? "Not met" : "Pending")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <ShieldAlert size={16} />
              <p className="text-xs font-bold">Officer authority boundary</p>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-amber-900/75">
              The rule-engine result is not editable here. Your recommendation
              and remarks are recorded separately for authorized institutional
              review. This screen does not issue the final admission decision or
              change programme eligibility rules.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="eligibility-recommendation"
                className="text-xs font-bold text-slate-700"
              >
                Officer recommendation <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <FilterSelect
                  label="Officer recommendation"
                  value={recommendation}
                  onChange={(value) => {
                    setRecommendation(value);
                    setError("");
                  }}
                  placeholder="Select recommendation"
                  options={[
                    {
                      label: "Recommend proceed to next stage",
                      value: "Recommend Proceed",
                    },
                    {
                      label: "Needs clarification / additional evidence",
                      value: "Needs Clarification",
                    },
                    {
                      label: "Recommend not to proceed",
                      value: "Recommend Not Proceed",
                    },
                  ]}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="eligibility-evidence-notes"
                className="text-xs font-bold text-slate-700"
              >
                Evidence reference{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="eligibility-evidence-notes"
                value={evidenceNotes}
                onChange={(event) => setEvidenceNotes(event.target.value)}
                maxLength={500}
                placeholder="Document name or evidence reference"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#b9788c] focus:ring-4 focus:ring-[#f7edf0]"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="eligibility-officer-remarks"
              className="text-xs font-bold text-slate-700"
            >
              Assessment remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="eligibility-officer-remarks"
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                setError("");
              }}
              rows={4}
              maxLength={1500}
              placeholder="Explain the basis for your recommendation, including any discrepancy that needs attention..."
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#b9788c] focus:ring-4 focus:ring-[#f7edf0]"
            />
            <div className="mt-1 flex justify-end text-[10px] text-slate-400">
              {remarks.length}/1500
            </div>
          </div>
          {record.reviewHistory?.length ? (
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-700">
                Previous officer review
              </h3>
              <div className="mt-3 space-y-3">
                {[...record.reviewHistory]
                  .slice(-3)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={`${entry.reviewedAt || index}-${entry.recommendation}`}
                      className="border-l-2 border-[#ead6dc] pl-3"
                    >
                      <p className="text-[11px] font-bold text-slate-700">
                        {entry.recommendation || "Review recorded"}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {entry.remarks || "No remarks recorded"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {entry.reviewedAt
                          ? new Date(entry.reviewedAt).toLocaleString()
                          : "Previous review"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-[11px] font-semibold text-rose-600">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitReview}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#351b27] px-4 text-xs font-bold text-white transition hover:bg-[#3b1e2b]"
          >
            <CheckCircle2 size={15} /> Save officer assessment
          </button>
        </footer>
      </section>
    </div>
  );
}

function displayApplicationValue(value) {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  if (Array.isArray(value))
    return value.map((entry) => displayApplicationValue(entry)).join(", ");
  if (typeof value === "object") {
    return (
      Object.entries(value)
        .filter(
          ([, entry]) => entry !== null && entry !== undefined && entry !== "",
        )
        .map(([key, entry]) => `${key}: ${displayApplicationValue(entry)}`)
        .join(" · ") || "Not provided"
    );
  }
  return String(value);
}

function ApplicationReviewDialog({
  application,
  relatedDocuments,
  eligibilityRecord,
  onClose,
  onStartReview,
  onSaveNote,
  onOpenDocument,
  onOpenEligibility,
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const applicantName =
    application.name || application.applicantName || "Applicant";
  const applicationId =
    application.applicationId || application.id || "ID unavailable";
  const applicationStatus = application.status || "Pending";
  const completed = applicationStatus === "Completed";
  const underReview = applicationStatus === "Under Review";
  const canStartReview = !completed && !underReview;

  const academicSource =
    application.academicDetails ||
    application.academicInfo ||
    application.educationDetails ||
    application.education ||
    application.qualifications;
  const academicRows = Array.isArray(academicSource)
    ? academicSource.map((entry, index) => ({
        label:
          entry.level ||
          entry.qualification ||
          entry.exam ||
          `Qualification ${index + 1}`,
        value:
          [
            entry.board || entry.university,
            entry.institution || entry.school || entry.college,
            entry.year || entry.passingYear,
            entry.percentage || entry.marks || entry.grade,
          ]
            .filter(Boolean)
            .join(" · ") || displayApplicationValue(entry),
      }))
    : academicSource && typeof academicSource === "object"
      ? Object.entries(academicSource).map(([key, value]) => ({
          label: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (letter) => letter.toUpperCase()),
          value: displayApplicationValue(value),
        }))
      : [];

  const personalRows = [
    ["Email address", application.email || application.emailAddress],
    [
      "Phone number",
      application.phone || application.phoneNumber || application.mobile,
    ],
    ["Date of birth", application.dateOfBirth || application.dob],
    ["Gender", application.gender],
    ["Address", application.address || application.currentAddress],
    ["Category", application.category || application.admissionCategory],
  ];

  const officerNotes = Array.isArray(application.officerNotes)
    ? [...application.officerNotes].reverse()
    : [];
  const history = Array.isArray(application.reviewHistory)
    ? [...application.reviewHistory].reverse()
    : [];

  const handleSaveNote = () => {
    if (!note.trim()) {
      setError("Enter an internal note before saving.");
      return;
    }
    onSaveNote(application, note.trim());
    setNote("");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-review-title"
        className="flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78364d]">
              Application record · Officer review
            </p>
            <h2
              id="application-review-title"
              className="mt-1 truncate text-lg font-extrabold text-[#351b27] sm:text-xl"
            >
              {applicantName}
            </h2>
            <p className="mt-1 break-all text-xs text-slate-500">
              {applicationId} <span className="px-1.5 text-slate-300">·</span>{" "}
              {application.programme ||
                application.programmeName ||
                "Programme not specified"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application details"
            className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="min-w-0 space-y-5">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Application status
                  </p>
                  <div className="mt-2">
                    <StatusPill status={applicationStatus} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Submitted:{" "}
                    {application.submittedAt ||
                      application.submissionDate ||
                      "Date not available"}
                  </p>
                </div>
                {canStartReview ? (
                  <button
                    type="button"
                    onClick={() => onStartReview(application)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#351b27] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#3b1e2b] focus:outline-none focus:ring-4 focus:ring-[#f0dce2]"
                  >
                    <FileSearch size={15} /> Start officer review
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-600" />{" "}
                    {completed
                      ? "Officer review completed"
                      : "Review in progress"}
                  </span>
                )}
              </div>

              <section>
                <div className="flex items-center gap-2">
                  <Users size={17} className="text-[#78364d]" />
                  <h3 className="text-sm font-extrabold text-[#351b27]">
                    Applicant information
                  </h3>
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {personalRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl border border-slate-100 p-3"
                    >
                      <dt className="text-[10px] font-semibold text-slate-400">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-xs font-semibold leading-5 text-slate-700">
                        {displayApplicationValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <div className="flex items-center gap-2">
                  <GraduationCap size={17} className="text-[#78364d]" />
                  <h3 className="text-sm font-extrabold text-[#351b27]">
                    Academic information
                  </h3>
                </div>
                {academicRows.length ? (
                  <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {academicRows.map((row, index) => (
                      <div
                        key={`${row.label}-${index}`}
                        className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(120px,0.55fr)_minmax(0,1fr)] sm:gap-4"
                      >
                        <p className="text-[11px] font-bold text-slate-500">
                          {row.label}
                        </p>
                        <p className="break-words text-xs leading-5 text-slate-700">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-5 text-xs text-slate-400">
                    Academic details will appear here when the applicant record
                    is supplied by the backend.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={17} className="text-[#78364d]" />
                    <h3 className="text-sm font-extrabold text-[#351b27]">
                      Submitted documents
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {relatedDocuments.length} record(s)
                  </span>
                </div>
                {relatedDocuments.length ? (
                  <div className="mt-3 space-y-2">
                    {relatedDocuments.map((document, index) => (
                      <div
                        key={document.id || `${document.documentName}-${index}`}
                        className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-700">
                            {document.documentName ||
                              document.fileName ||
                              "Applicant document"}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {document.fileName ||
                              document.originalFileName ||
                              "File name unavailable"}
                          </p>
                          <div className="mt-2">
                            <StatusPill status={document.status || "Pending"} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenDocument(document)}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-[#71364a] hover:bg-[#f8eef1]"
                        >
                          <FileSearch size={13} /> Review document
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-5 text-xs text-slate-400">
                    No document records are linked to this application yet.
                  </p>
                )}
              </section>
            </div>

            <aside className="min-w-0 space-y-5">
              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#78364d]" />
                  <h3 className="text-sm font-extrabold text-[#351b27]">
                    Eligibility snapshot
                  </h3>
                </div>
                {eligibilityRecord ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill
                        status={
                          eligibilityRecord.ruleResult ||
                          eligibilityRecord.status ||
                          "Pending"
                        }
                      />
                      <StatusPill
                        status={eligibilityRecord.reviewStatus || "Pending"}
                      />
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-slate-500">
                      Rule-engine result is read-only here. The officer's
                      recommendation is maintained separately.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenEligibility(eligibilityRecord)}
                      className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-[#71364a] hover:bg-[#f8eef1]"
                    >
                      <FileSearch size={13} /> Open eligibility review
                    </button>
                  </>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    No eligibility result is linked to this application yet.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquareText size={17} className="text-[#78364d]" />
                  <h3 className="text-sm font-extrabold text-[#351b27]">
                    Internal officer note
                  </h3>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  Notes are for authorized institutional staff and are not shown
                  to applicants in this frontend preview.
                </p>
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setError("");
                  }}
                  rows={4}
                  maxLength={1200}
                  placeholder="Record a concise screening observation..."
                  className="mt-3 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#b9788c] focus:ring-4 focus:ring-[#f7edf0]"
                />
                {error ? (
                  <p
                    role="alert"
                    className="mt-2 text-[11px] font-semibold text-rose-600"
                  >
                    {error}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#f8eef1] px-3 text-[11px] font-bold text-[#71364a] transition hover:bg-[#f1dfe5]"
                >
                  <MessageSquareText size={13} /> Save internal note
                </button>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Activity size={17} className="text-[#78364d]" />
                  <h3 className="text-sm font-extrabold text-[#351b27]">
                    Officer activity
                  </h3>
                </div>
                {officerNotes.length || history.length ? (
                  <div className="mt-3 max-h-56 space-y-3 overflow-y-auto">
                    {officerNotes.map((entry, index) => (
                      <div
                        key={`note-${index}`}
                        className="border-l-2 border-[#e6cbd3] pl-3"
                      >
                        <p className="text-[11px] leading-5 text-slate-700">
                          {entry.note || entry.text || "Officer note recorded"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString()
                            : "Recorded in this session"}{" "}
                          · {entry.reviewer || "Current officer"}
                        </p>
                      </div>
                    ))}
                    {history.map((entry, index) => (
                      <div
                        key={`history-${index}`}
                        className="border-l-2 border-slate-200 pl-3"
                      >
                        <p className="text-[11px] font-semibold text-slate-700">
                          {entry.action ||
                            entry.status ||
                            entry.recommendation ||
                            "Review activity"}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                          {entry.reason ||
                            entry.remarks ||
                            entry.note ||
                            "No additional detail"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {entry.reviewedAt || entry.createdAt
                            ? new Date(
                                entry.reviewedAt || entry.createdAt,
                              ).toLocaleString()
                            : "Recorded activity"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    No officer activity has been recorded for this application.
                  </p>
                )}
              </section>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <LockKeyhole size={14} />
                  <p className="text-[11px] font-bold">Decision boundary</p>
                </div>
                <p className="mt-1.5 text-[10px] leading-5 text-amber-900/75">
                  Officers can review records and add screening notes. Final
                  admission approval remains with an authorized administrator.
                </p>
              </div>
            </aside>
          </div>
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[10px] leading-4 text-slate-400">
            Frontend preview: changes are temporary until the API is connected.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function OfficerDashboard() {
  const [activeSection, setActiveSection] = usePersistedDashboardSection(
    "credifit_officer_active_section",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [applicationRecords, setApplicationRecords] = useState(applications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("All statuses");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentFilter, setDocumentFilter] = useState("All statuses");
  const [documentRecords, setDocumentRecords] = useState(documents);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [eligibilitySearch, setEligibilitySearch] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("All results");
  const [eligibilityRecords, setEligibilityRecords] =
    useState(eligibilityCases);
  const [selectedEligibility, setSelectedEligibility] = useState(null);
  const [selectedWorkflowStage, setSelectedWorkflowStage] = useState(
    "Document verification",
  );
  const [notificationRecords, setNotificationRecords] = useState(notifications);
  const [notificationFilter, setNotificationFilter] = useState("All");
  const [notificationSearch, setNotificationSearch] = useState("");
  const [reportPeriod, setReportPeriod] = useState("All time");

  useEffect(() => {
    // Each workspace starts at its own top so navigation never inherits the previous section's scroll position.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeSection]);

  const totalApplications = applicationRecords.length;
  const pendingDocuments = documentRecords.filter((item) =>
    ["Pending", "Under Review", "Resubmission Required"].includes(item.status),
  ).length;
  const pendingEligibility = eligibilityRecords.filter(
    (item) => (item.reviewStatus || "Pending") !== "Reviewed",
  ).length;
  const completedReviews =
    documentRecords.filter((item) => item.status === "Verified").length +
    eligibilityRecords.filter((item) => item.reviewStatus === "Reviewed")
      .length;
  const unreadNotifications = notificationRecords.filter(
    (item) => !item.read,
  ).length;

  const filteredNotifications = useMemo(
    () =>
      notificationRecords.filter((item) => {
        const query = notificationSearch.trim().toLowerCase();
        const matchesSearch =
          `${item.title || ""} ${item.message || ""} ${item.applicationId || ""} ${item.type || ""}`
            .toLowerCase()
            .includes(query);
        const matchesFilter =
          notificationFilter === "All" ||
          (notificationFilter === "Unread" ? !item.read : Boolean(item.read));
        return matchesSearch && matchesFilter;
      }),
    [notificationRecords, notificationSearch, notificationFilter],
  );

  const reportApplications = useMemo(
    () =>
      applicationRecords.filter((item) =>
        matchesReportPeriod(item.submittedAt || item.createdAt, reportPeriod),
      ),
    [applicationRecords, reportPeriod],
  );
  const reportDocuments = useMemo(
    () =>
      documentRecords.filter((item) =>
        matchesReportPeriod(
          item.reviewedAt || item.uploadedAt || item.createdAt,
          reportPeriod,
        ),
      ),
    [documentRecords, reportPeriod],
  );
  const reportEligibility = useMemo(
    () =>
      eligibilityRecords.filter((item) =>
        matchesReportPeriod(item.reviewedAt || item.createdAt, reportPeriod),
      ),
    [eligibilityRecords, reportPeriod],
  );

  const markNotificationRead = (notificationId) => {
    setNotificationRecords((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    setNotificationRecords((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  };

  const exportOfficerReport = () => {
    const verifiedDocuments = reportDocuments.filter(
      (item) => item.status === "Verified",
    ).length;
    const returnedDocuments = reportDocuments.filter(
      (item) =>
        item.status === "Resubmission Required" || item.status === "Rejected",
    ).length;
    const reviewedEligibility = reportEligibility.filter(
      (item) => item.reviewStatus === "Reviewed",
    ).length;
    const rows = [
      ["CrediFit Officer Report"],
      ["Generated at", new Date().toISOString()],
      ["Reporting period", reportPeriod],
      [],
      ["Metric", "Count"],
      ["Applications received", reportApplications.length],
      ["Documents reviewed", reportDocuments.length],
      ["Documents verified", verifiedDocuments],
      ["Documents returned or rejected", returnedDocuments],
      ["Eligibility assessments reviewed", reviewedEligibility],
      [],
      ["Application register"],
      ["Application ID", "Applicant", "Programme", "Status", "Submitted at"],
      ...reportApplications.map((item) => [
        item.applicationId || item.id,
        item.name || item.applicantName,
        item.programme,
        item.status,
        item.submittedAt || item.createdAt,
      ]),
      [],
      ["Document outcomes"],
      ["Document", "Application ID", "Applicant", "Status", "Reviewed at"],
      ...reportDocuments.map((item) => [
        item.documentName,
        item.applicationId,
        item.applicantName,
        item.status,
        item.reviewedAt || item.uploadedAt || item.createdAt,
      ]),
      [],
      ["Eligibility reviews"],
      [
        "Application ID",
        "Applicant",
        "Programme",
        "Rule result",
        "Review status",
      ],
      ...reportEligibility.map((item) => [
        item.applicationId || item.id,
        item.applicantName,
        item.programme,
        item.ruleResult || item.status,
        item.reviewStatus,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credifit-officer-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const filteredApplications = useMemo(
    () =>
      applicationRecords.filter((item) => {
        const query = applicationSearch.toLowerCase();
        const matchesSearch =
          `${item.name || ""} ${item.applicationId || ""} ${item.programme || ""}`
            .toLowerCase()
            .includes(query);
        const matchesStatus =
          applicationFilter === "All statuses" ||
          item.status === applicationFilter;
        return matchesSearch && matchesStatus;
      }),
    [applicationRecords, applicationSearch, applicationFilter],
  );

  const filteredDocuments = useMemo(
    () =>
      documentRecords.filter((item) => {
        const query = documentSearch.toLowerCase();
        const matchesSearch =
          `${item.applicantName || ""} ${item.applicationId || ""} ${item.documentName || ""}`
            .toLowerCase()
            .includes(query);
        const matchesStatus =
          documentFilter === "All statuses" || item.status === documentFilter;
        return matchesSearch && matchesStatus;
      }),
    [documentRecords, documentSearch, documentFilter],
  );

  const filteredEligibility = useMemo(
    () =>
      eligibilityRecords.filter((item) => {
        const query = eligibilitySearch.toLowerCase();
        const matchesSearch =
          `${item.applicantName || ""} ${item.applicationId || ""} ${item.programme || ""}`
            .toLowerCase()
            .includes(query);
        const result = item.ruleResult || item.status || "Pending";
        const matchesStatus =
          eligibilityFilter === "All results" || result === eligibilityFilter;
        return matchesSearch && matchesStatus;
      }),
    [eligibilityRecords, eligibilitySearch, eligibilityFilter],
  );

  const navigateTo = (section) => {
    setActiveSection(section);
    if (section === "Admission Workflow") {
      // Always open the configured workflow at its first officer-owned stage.
      setSelectedWorkflowStage("Document verification");
    }
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const applicationKey = (item) => String(item.applicationId || item.id || "");

  const handleStartApplicationReview = (application) => {
    const key = applicationKey(application);
    const reviewedAt = new Date().toISOString();
    const updatedApplication = {
      ...application,
      status: "Under Review",
      reviewStartedAt: reviewedAt,
      reviewHistory: [
        ...(application.reviewHistory || []),
        {
          action: "Officer review started",
          reason: "Application opened for screening review.",
          reviewedAt,
          reviewer: "Current officer",
        },
      ],
    };
    setApplicationRecords((current) =>
      current.map((item) =>
        applicationKey(item) === key ? updatedApplication : item,
      ),
    );
    setSelectedApplication(updatedApplication);
  };

  const handleSaveApplicationNote = (application, note) => {
    const key = applicationKey(application);
    const createdAt = new Date().toISOString();
    const noteEntry = { note, createdAt, reviewer: "Current officer" };
    const updatedApplication = {
      ...application,
      officerNotes: [...(application.officerNotes || []), noteEntry],
      reviewHistory: [
        ...(application.reviewHistory || []),
        {
          action: "Internal note added",
          note,
          reviewedAt: createdAt,
          reviewer: "Current officer",
        },
      ],
    };
    setApplicationRecords((current) =>
      current.map((item) =>
        applicationKey(item) === key ? updatedApplication : item,
      ),
    );
    setSelectedApplication(updatedApplication);
  };

  const openDocumentFromApplication = (document) => {
    setSelectedApplication(null);
    navigateTo("Document Verification");
    setSelectedDocument(document);
  };

  const openEligibilityFromApplication = (record) => {
    setSelectedApplication(null);
    navigateTo("Eligibility Review");
    setSelectedEligibility(record);
  };

  const handleDocumentDecision = (document, status, reason, notes) => {
    const documentKey = (item) =>
      item.id ??
      `${item.applicationId || "application"}::${item.documentName || "document"}`;
    const targetKey = documentKey(document);
    const reviewedAt = new Date().toISOString();

    setDocumentRecords((current) =>
      current.map((item) => {
        if (documentKey(item) !== targetKey) return item;
        const historyEntry = {
          status,
          reason,
          notes,
          reviewedAt,
          reviewer: "Current officer",
        };
        return {
          ...item,
          status,
          reviewReason: reason,
          reviewNotes: notes,
          reviewedAt,
          reviewHistory: [...(item.reviewHistory || []), historyEntry],
        };
      }),
    );
    setSelectedDocument(null);
  };

  const handleEligibilityDecision = (
    record,
    recommendation,
    remarks,
    evidenceNotes,
  ) => {
    const recordKey = (item) => item.id ?? item.applicationId;
    const targetKey = recordKey(record);
    const reviewedAt = new Date().toISOString();

    setEligibilityRecords((current) =>
      current.map((item) => {
        if (recordKey(item) !== targetKey) return item;
        const historyEntry = {
          recommendation,
          remarks,
          evidenceNotes,
          reviewedAt,
          reviewer: "Current officer",
        };
        return {
          ...item,
          reviewStatus:
            recommendation === "Needs Clarification"
              ? "Follow-up Required"
              : "Reviewed",
          officerRecommendation: recommendation,
          officerRemarks: remarks,
          evidenceNotes,
          reviewedAt,
          reviewHistory: [...(item.reviewHistory || []), historyEntry],
        };
      }),
    );
    setSelectedEligibility(null);
  };

  const renderOverview = () => (
    <>
      <section className="relative isolate mb-7 overflow-hidden rounded-[28px] border border-[#c99eaa]/25 bg-[#2c1420] shadow-[0_26px_70px_-35px_rgba(49,20,32,0.65)]">
        {/* Burgundy gradient and ambient lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#713b50] via-[#472333] to-[#26131e]" />
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#e8c99e]/15 bg-[#e8c99e]/10 blur-[2px]" />
        <div className="pointer-events-none absolute right-40 top-20 h-44 w-44 rounded-full bg-[#d5a5b5]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#a76c7d]/20 blur-3xl" />

        <div className="relative z-10 grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_270px] lg:p-10">
          {/* Main hero content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ecd1aa]/25 bg-white/[0.09] px-3 py-1.5 shadow-inner backdrop-blur-xl">
              <ShieldCheck size={13} className="text-[#efd2a7]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0d9bf]">
                CrediFit · Institutional Control Centre
              </span>
            </div>

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#dfb9c2]">
              Admission Management Workspace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#fff8f0] sm:text-4xl lg:text-[42px]">
              Officer Dashboard
              <span className="text-[#e8c69a]">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-6 text-[#ead9dc]/80 sm:text-sm sm:leading-7">
              A single workspace to process applications, verify records, review
              eligibility, and manage assigned admission stages.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo("Applications")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#f5dfc2]/70 bg-gradient-to-r from-[#f1d8b6] to-[#dfbd96] px-5 text-xs font-extrabold text-[#422130] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#e8c69a]/25"
              >
                Open application queue
                <ArrowUpRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => navigateTo("Admission Workflow")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-5 text-xs font-semibold text-[#fff5f0] backdrop-blur-xl transition duration-300 hover:border-[#e8c69a]/50 hover:bg-white/[0.13]"
              >
                <Workflow size={15} className="text-[#e8c69a]" />
                View workflow
              </button>
            </div>
          </div>

          {/* Frosted glass workflow card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.09] p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0d1a6]/70 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8c69a]/25 bg-[#e8c69a]/10 text-[#efd2a7]">
                <Workflow size={19} />
              </div>
              <span className="rounded-full border border-[#e8c69a]/25 bg-[#e8c69a]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#efd2a7]">
                Structured process
              </span>
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#dfbdc5]">
              Admission workflow
            </p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight text-[#fff8f0]">
                {workflowStages.length}
              </span>
              <span className="text-xs font-medium text-[#e6cfd3]">
                defined stages
              </span>
            </div>

            <div className="mt-5 flex gap-1.5">
              {workflowStages.map((stage, index) => (
                <div
                  key={stage.title}
                  title={stage.title}
                  className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-[#e8c69a] to-[#c58e9e]"
                />
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 border-t border-white/15 pt-4">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#e8c69a]"
              />
              <p className="text-[10px] leading-5 text-[#ead9dc]/80">
                Role-based screening with defined responsibilities at every
                stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BackendNotice />
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total applications"
          value={totalApplications}
          description="Applications received by the institution"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Pending verification"
          value={pendingDocuments}
          description="Documents awaiting officer review"
          icon={FileCheck2}
          tone="amber"
        />
        <StatCard
          title="Eligibility review"
          value={pendingEligibility}
          description="Cases awaiting screening assessment"
          icon={ShieldCheck}
          tone="violet"
        />
        <StatCard
          title="Completed reviews"
          value={completedReviews}
          description="Document and eligibility reviews recorded"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid items-start gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <Panel>
            <PanelTitle
              eyebrow="Your work"
              title="Priority review queue"
              description="Applications and screening tasks assigned to your officer account."
              action={
                <button
                  type="button"
                  onClick={() => navigateTo("Applications")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#78364d] hover:text-[#69364a]"
                >
                  Open queue <ChevronRight size={14} />
                </button>
              }
            />
            <EmptyState
              icon={ClipboardCheck}
              title="No assigned reviews yet"
              description="When applications or screening tasks are assigned to your account, they will appear here with their current stage and due status."
            />
          </Panel>
          <Panel>
            <PanelTitle
              eyebrow="Admission process"
              title="Stage overview"
              description="Institutional stages and their primary responsibility owners."
            />
            <div className="divide-y divide-slate-100 px-5 sm:px-6">
              {workflowStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.title} className="flex gap-3 py-4 sm:gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-slate-700">
                          {index + 1}. {stage.title}
                        </p>
                        <StatusPill status="Upcoming" />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {stage.description}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold text-slate-500">
                        Responsible: {stage.owner}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel>
            <PanelTitle
              eyebrow="Officer tools"
              title="Screening workspaces"
              description="Jump directly to the task you need to handle."
            />
            <div className="space-y-1 p-3 sm:p-4">
              {[
                {
                  label: "Application management",
                  description: "Search and inspect submitted applications",
                  icon: Users,
                  target: "Applications",
                },
                {
                  label: "Document verification",
                  description: "Verify, reject, or request resubmission",
                  icon: FileCheck2,
                  target: "Document Verification",
                },
                {
                  label: "Eligibility assessment",
                  description: "Review programme rule evaluation",
                  icon: ShieldCheck,
                  target: "Eligibility Review",
                },
                {
                  label: "Admission workflow",
                  description: "Track stage ownership and progression",
                  icon: Workflow,
                  target: "Admission Workflow",
                },
                {
                  label: "Reports and insights",
                  description: "View screening and processing summaries",
                  icon: ChartNoAxesCombined,
                  target: "Reports",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.target}
                    onClick={() => navigateTo(item.target)}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#f8eef1] focus:outline-none focus:ring-2 focus:ring-[#f0dce2]"
                  >
                    <span className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition group-hover:bg-[#f1dfe5] group-hover:text-[#71364a]">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-700">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-slate-400">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#78364d]"
                    />
                  </button>
                );
              })}
            </div>
          </Panel>
          <PermissionCard compact />
        </div>
      </div>
    </>
  );

  const renderApplications = () => (
    <>
      <PageHeading
        eyebrow="Applicant records"
        title="Applications"
        description="Find submitted applications, inspect applicant details, and monitor the current screening status."
      />
      <BackendNotice />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          title="All applications"
          value={totalApplications}
          description="Institution-wide application records"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="In progress"
          value={
            applicationRecords.filter(
              (item) =>
                item.status === "Pending" || item.status === "Under Review",
            ).length
          }
          description="Applications moving through screening"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          title="Completed"
          value={
            applicationRecords.filter((item) => item.status === "Completed")
              .length
          }
          description="Applications with completed officer review"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <Panel>
        <PanelTitle
          eyebrow="Application register"
          title="All submitted applications"
          description="Search by applicant name, application ID, or programme. Applicant records are visible according to your assigned access."
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <SearchBox
            value={applicationSearch}
            onChange={setApplicationSearch}
            placeholder="Search name, application ID, programme..."
          />
          <div className="flex items-center gap-2">
            <Filter size={15} className="shrink-0 text-slate-400" />
            <FilterSelect
              label="Application status"
              value={applicationFilter}
              onChange={setApplicationFilter}
              options={[
                "All statuses",
                "Pending",
                "Under Review",
                "Completed",
                "On Hold",
              ]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-5 py-4">Programme</th>
                <th className="px-5 py-4">Application ID</th>
                <th className="px-5 py-4">Submitted</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Search}
                      title={
                        applicationSearch ||
                        applicationFilter !== "All statuses"
                          ? "No matching applications"
                          : "No applications received yet"
                      }
                      description={
                        applicationSearch ||
                        applicationFilter !== "All statuses"
                          ? "Try changing your search phrase or status filter."
                          : "New submissions will appear in this register after the applicant portal is connected to the backend."
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredApplications.map((item) => (
                  <tr
                    key={item.applicationId}
                    className="border-t border-slate-100 text-xs"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.programme}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {item.applicationId}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.submittedAt || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(item)}
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-[#71364a] transition hover:bg-[#f8eef1] focus:outline-none focus:ring-2 focus:ring-[#f0dce2]"
                      >
                        <FileSearch size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-1 border-t border-slate-100 px-5 py-4 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredApplications.length} of {totalApplications}{" "}
            applications
          </span>
          <span>
            Records are loaded from the institutional database when connected
          </span>
        </div>
      </Panel>
    </>
  );

  const renderDocuments = () => (
    <>
      <PageHeading
        eyebrow="Verification desk"
        title="Document Verification"
        description="Inspect applicant-submitted certificates and record a clear verification outcome with a reason when changes are required."
        actions={
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-500">
            <LockKeyhole size={14} /> Assigned records only
          </span>
        }
      />
      <BackendNotice />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Awaiting review"
          value={
            documentRecords.filter((item) => item.status === "Pending").length
          }
          description="Documents not yet opened for review"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          title="Under review"
          value={
            documentRecords.filter((item) => item.status === "Under Review")
              .length
          }
          description="Documents currently being assessed"
          icon={FileSearch}
          tone="blue"
        />
        <StatCard
          title="Verified"
          value={
            documentRecords.filter((item) => item.status === "Verified").length
          }
          description="Documents accepted by an officer"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <Panel>
        <PanelTitle
          eyebrow="Document register"
          title="Verification requests"
          description="Check document type, applicant identity, readability, completeness, and consistency with the application."
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <SearchBox
            value={documentSearch}
            onChange={setDocumentSearch}
            placeholder="Search applicant, application ID, document..."
          />
          <div className="flex items-center gap-2">
            <Filter size={15} className="shrink-0 text-slate-400" />
            <FilterSelect
              label="Document status"
              value={documentFilter}
              onChange={setDocumentFilter}
              options={[
                "All statuses",
                "Pending",
                "Under Review",
                "Verified",
                "Rejected",
                "Resubmission Required",
              ]}
            />
          </div>
        </div>
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title={
              documentSearch || documentFilter !== "All statuses"
                ? "No matching documents"
                : "No documents waiting for verification"
            }
            description={
              documentSearch || documentFilter !== "All statuses"
                ? "Try a different search term or status filter."
                : "Applicant uploads will appear here when document storage and the officer API are connected. No sample certificates are displayed."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Applicant</th>
                  <th className="px-5 py-4">Document</th>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Uploaded</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 text-xs"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.applicantName}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.documentName}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {item.applicationId}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.uploadedAt || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-[#71364a] transition hover:bg-[#f8eef1] focus:outline-none focus:ring-2 focus:ring-[#f0dce2]"
                      >
                        <FileSearch size={14} /> Open review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={18} className="text-[#78364d]" />
            <h2 className="text-sm font-extrabold text-[#351b27]">
              Officer review checklist
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-500">
            <li className="flex gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              Correct applicant and document category
            </li>
            <li className="flex gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              Document is readable, complete, and not cut off
            </li>
            <li className="flex gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              Names, dates, and academic details are consistent
            </li>
            <li className="flex gap-2">
              <CheckCircle2
                size={15}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              Decision includes a reason where rejected or returned
            </li>
          </ul>
        </Panel>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle size={18} />
            <h2 className="text-sm font-extrabold">Important control</h2>
          </div>
          <p className="mt-3 text-xs leading-6 text-amber-900/75">
            A rejected document should include a specific correction reason. The
            applicant should be able to see that reason and upload a
            replacement. Keep the original review history for audit purposes; do
            not silently overwrite a previous decision.
          </p>
        </div>
      </div>
    </>
  );

  const renderEligibility = () => (
    <>
      <PageHeading
        eyebrow="Rule-based screening"
        title="Eligibility Review"
        description="Inspect programme rule outcomes, compare academic evidence, and record a separate officer recommendation for authorized institutional review."
      />
      <BackendNotice />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Awaiting assessment"
          value={
            eligibilityRecords.filter(
              (item) =>
                !item.reviewStatus ||
                item.reviewStatus === "Pending" ||
                item.reviewStatus === "Follow-up Required",
            ).length
          }
          description="Cases requiring officer attention"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          title="Rule result: eligible"
          value={
            eligibilityRecords.filter(
              (item) => (item.ruleResult || item.status) === "Eligible",
            ).length
          }
          description="Cases meeting configured criteria"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          title="Rule result: not eligible"
          value={
            eligibilityRecords.filter(
              (item) => (item.ruleResult || item.status) === "Not Eligible",
            ).length
          }
          description="Cases not meeting configured criteria"
          icon={XCircle}
          tone="violet"
        />
      </div>
      <Panel>
        <PanelTitle
          eyebrow="Eligibility register"
          title="Assessment cases"
          description="Rule-engine results remain read-only. Officer recommendations and remarks are saved separately for audit and administrator review."
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <SearchBox
            value={eligibilitySearch}
            onChange={setEligibilitySearch}
            placeholder="Search applicant, application ID, programme..."
          />
          <div className="flex items-center gap-2">
            <Filter size={15} className="shrink-0 text-slate-400" />
            <FilterSelect
              label="Rule-engine result"
              value={eligibilityFilter}
              onChange={setEligibilityFilter}
              options={["All results", "Pending", "Eligible", "Not Eligible"]}
            />
          </div>
        </div>
        {filteredEligibility.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={
              eligibilitySearch || eligibilityFilter !== "All results"
                ? "No matching eligibility cases"
                : "No eligibility cases to review"
            }
            description={
              eligibilitySearch || eligibilityFilter !== "All results"
                ? "Try changing the search or result filter."
                : "Cases will appear after applications are submitted and the programme eligibility rules have been evaluated by the backend."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Applicant</th>
                  <th className="px-5 py-4">Programme</th>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Rule result</th>
                  <th className="px-5 py-4">Officer review</th>
                  <th className="px-5 py-4">Recommendation</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEligibility.map((item) => (
                  <tr
                    key={item.id || item.applicationId}
                    className="border-t border-slate-100 text-xs"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {item.applicantName}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.programme}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {item.applicationId}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill
                        status={item.ruleResult || item.status || "Pending"}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={item.reviewStatus || "Pending"} />
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-slate-500">
                      {item.officerRecommendation || "Not recorded"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedEligibility(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-[#71364a] transition hover:bg-[#f8eef1] focus:outline-none focus:ring-2 focus:ring-[#f0dce2]"
                      >
                        <FileSearch size={14} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#78364d]" />
            <h2 className="text-sm font-extrabold text-[#351b27]">
              Assessment approach
            </h2>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Compare each configured criterion with verified academic documents.
            Record discrepancies and evidence references. Keep the officer's
            assessment separate from the original rule-engine output.
          </p>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <MessageSquareText size={18} className="text-[#78364d]" />
            <h2 className="text-sm font-extrabold text-[#351b27]">
              Officer recommendation
            </h2>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            Choose whether to recommend progression, request clarification, or
            recommend that the case not proceed. The authorized institutional
            authority retains final admission approval.
          </p>
        </Panel>
      </div>
    </>
  );

  const renderWorkflow = () => {
    const selectedStage =
      workflowStages.find((stage) => stage.title === selectedWorkflowStage) ||
      workflowStages[1];
    const selectedStageIsOfficerOwned =
      selectedStage.owner === "Admission Officer" &&
      selectedStage.officerActions.length > 0;

    return (
      <>
        <PageHeading
          eyebrow="Process supervision"
          title="Admission Workflow"
          description="Inspect the configured admission stages, understand who owns each step, and review the checks required before a stage can progress."
          actions={
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-500">
              <LockKeyhole size={14} /> Role-controlled stages
            </span>
          }
        />
        <BackendNotice />

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            title="Configured stages"
            value={workflowStages.length}
            description="Stages in the current process map"
            icon={Workflow}
            tone="blue"
          />
          <StatCard
            title="Officer-owned stages"
            value={
              workflowStages.filter(
                (stage) => stage.owner === "Admission Officer",
              ).length
            }
            description="Stages within the officer's workflow scope"
            icon={ShieldCheck}
            tone="violet"
          />
          <StatCard
            title="Live workflow records"
            value="0"
            description="Application-specific progress appears after API integration"
            icon={Activity}
            tone="amber"
          />
        </div>

        <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Panel>
            <PanelTitle
              eyebrow="Institutional process"
              title="Stage-wise admission journey"
              description="Select a stage to inspect its checks, owner, and officer permissions."
            />
            <div className="space-y-2 p-4 sm:p-5">
              {workflowStages.map((stage, index) => {
                const Icon = stage.icon;
                const active = selectedStage.title === stage.title;
                const officerOwned = stage.owner === "Admission Officer";
                return (
                  <button
                    key={stage.title}
                    type="button"
                    onClick={() => setSelectedWorkflowStage(stage.title)}
                    aria-pressed={active}
                    className={cx(
                      "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition sm:gap-4 sm:p-4",
                      active
                        ? "border-[#e6cbd3] bg-[#f8eef1]/80 ring-2 ring-[#f7edf0]"
                        : "border-slate-200 bg-white hover:border-[#ead6dc] hover:bg-slate-50",
                    )}
                  >
                    <div
                      className={cx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-[#351b27] text-white"
                          : officerOwned
                            ? "bg-[#f8eef1] text-[#71364a]"
                            : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Stage {index + 1}
                        </span>
                        {officerOwned ? (
                          <span className="rounded-full bg-[#f1dfe5] px-2 py-0.5 text-[9px] font-bold text-[#71364a]">
                            Officer scope
                          </span>
                        ) : null}
                        {stage.owner === "Authorized Admin" ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                            Admin only
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs font-extrabold tracking-tight text-[#351b27] sm:text-sm">
                        {stage.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        {stage.description}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold text-slate-500">
                        Owner: {stage.owner}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cx(
                        "mt-1 shrink-0",
                        active ? "text-[#71364a]" : "text-slate-300",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel>
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78364d]">
                  Selected stage details
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-[#351b27]">
                    {selectedStage.title}
                  </h2>
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold",
                      selectedStageIsOfficerOwned
                        ? "bg-[#f8eef1] text-[#71364a]"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {selectedStageIsOfficerOwned
                      ? "Within officer scope"
                      : "Outside officer scope"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {selectedStage.description}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">
                      Responsible owner
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {selectedStage.owner}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">Next hand-off</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {selectedStage.nextOwner}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xs font-extrabold text-[#351b27]">
                  Stage completion checks
                </h3>
                <ul className="mt-3 space-y-3">
                  {selectedStage.checks.map((check, index) => (
                    <li
                      key={`${selectedStage.title}-${index}`}
                      className="flex gap-2.5 text-xs leading-5 text-slate-600"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
                {selectedStageIsOfficerOwned ? (
                  <div className="mt-5 rounded-xl border border-[#ead6dc] bg-[#f8eef1]/75 p-4">
                    <div className="flex items-center gap-2 text-[#69364a]">
                      <ShieldCheck size={16} />
                      <p className="text-xs font-bold">
                        Permitted officer actions
                      </p>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {selectedStage.officerActions.map((action) => (
                        <li
                          key={action}
                          className="flex items-start gap-2 text-[11px] leading-5 text-[#633b49]/85"
                        >
                          <CheckCircle2
                            size={13}
                            className="mt-0.5 shrink-0 text-[#78364d]"
                          />
                          {action}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 rounded-xl border border-dashed border-[#e6cbd3] bg-white/80 p-3">
                      <p className="text-[11px] font-bold text-[#55283a]">
                        Waiting for an assigned application
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#704151]/75">
                        Stage actions will become available when a real
                        application is assigned and the server confirms the
                        officer's permission. No demo hand-off can be submitted
                        here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <LockKeyhole size={15} />
                      <p className="text-xs font-bold">
                        Outside officer action scope
                      </p>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                      This stage is owned by {selectedStage.owner}. The officer
                      workspace can inspect its responsibilities but cannot
                      record or override its outcome.
                    </p>
                  </div>
                )}
              </div>
            </Panel>

            <Panel>
              <PanelTitle
                eyebrow="Live application progress"
                title="Workflow activity"
                description="Application-specific stage changes and audit history will appear here after live records are connected."
              />
              <EmptyState
                icon={Workflow}
                title="Workflow is reset and awaiting live records"
                description="There are no demo transitions or sample application statuses. The stage map above is the configured process only; actual progress will be loaded from the admission API."
                compact
              />
            </Panel>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#ead6dc] bg-[#f8eef1]/80 p-5">
            <div className="flex items-center gap-2 text-[#69364a]">
              <Workflow size={18} />
              <h3 className="text-sm font-extrabold">Controlled progression</h3>
            </div>
            <p className="mt-2 text-xs leading-6 text-[#633b49]/75">
              A stage should move forward only after required checks are
              complete and the server confirms the acting user's permission.
              Every real transition should record the officer identity,
              timestamp, previous state, new state, and reason.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldAlert size={18} />
              <h3 className="text-sm font-extrabold">Decision boundary</h3>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Officers may record document-verification and
              eligibility-screening outcomes within their assignment. Department
              review belongs to the assigned evaluator; final admission
              decisions and institution-wide rule changes remain restricted to
              authorized administrators.
            </p>
          </div>
        </div>
      </>
    );
  };

  const renderNotifications = () => (
    <>
      <PageHeading
        eyebrow="Communication centre"
        title="Notifications"
        description="Review application assignments, document resubmissions, eligibility follow-ups, and workflow updates relevant to your officer account."
        actions={
          unreadNotifications > 0 ? (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-[#e6cbd3] hover:bg-[#f8eef1] hover:text-[#71364a]"
            >
              <CheckCircle2 size={15} /> Mark all as read
            </button>
          ) : null
        }
      />
      <BackendNotice />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Total notifications"
          value={notificationRecords.length}
          description="Updates in your officer inbox"
          icon={Bell}
          tone="blue"
        />
        <StatCard
          title="Unread"
          value={unreadNotifications}
          description="Updates requiring attention"
          icon={AlertCircle}
          tone="amber"
        />
        <StatCard
          title="Read"
          value={notificationRecords.length - unreadNotifications}
          description="Previously reviewed updates"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <Panel>
        <PanelTitle
          eyebrow="Your inbox"
          title="Notification centre"
          description="Use search and filters to find relevant institutional updates."
          action={
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500">
              {filteredNotifications.length} shown
            </span>
          }
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5">
          <SearchBox
            value={notificationSearch}
            onChange={setNotificationSearch}
            placeholder="Search notifications or application ID..."
          />
          <div className="sm:w-40">
            <FilterSelect
              value={notificationFilter}
              onChange={setNotificationFilter}
              label="Notification status"
              options={["All", "Unread", "Read"]}
            />
          </div>
        </div>
        {notificationRecords.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New application assignments, document resubmissions, and workflow updates will appear here when the notification service is connected."
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching notifications"
            description="Try changing your search phrase or selecting a different notification filter."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((item) => (
              <article
                key={item.id}
                className={cx(
                  "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5",
                  !item.read && "bg-[#f8eef1]/60",
                )}
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <span
                    className={cx(
                      "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                      item.read ? "bg-slate-200" : "bg-[#71364a]",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">
                        {item.title}
                      </p>
                      {!item.read ? (
                        <span className="rounded-full bg-[#f1dfe5] px-2 py-0.5 text-[9px] font-bold text-[#71364a]">
                          Unread
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          Read
                        </span>
                      )}
                      {item.type ? (
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                          {item.type}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </span>
                      {item.applicationId ? (
                        <span>Application: {item.applicationId}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-5 sm:pl-0">
                  {item.applicationId ? (
                    <button
                      type="button"
                      onClick={() => {
                        const match = applicationRecords.find(
                          (record) =>
                            String(record.applicationId || record.id) ===
                            String(item.applicationId),
                        );
                        if (match) {
                          setSelectedApplication(match);
                        } else {
                          navigateTo("Applications");
                        }
                      }}
                      className="min-h-8 rounded-lg px-2.5 text-[10px] font-bold text-[#71364a] transition hover:bg-[#f8eef1]"
                    >
                      View application
                    </button>
                  ) : null}
                  {!item.read ? (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(item.id)}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-bold text-slate-600 transition hover:border-[#e6cbd3] hover:text-[#71364a]"
                    >
                      <CheckCircle2 size={12} /> Mark read
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
      <p className="mt-3 text-[10px] leading-5 text-slate-400">
        Read states are session-only in this frontend preview. The backend
        should persist them per officer account and enforce notification
        visibility by role.
      </p>
    </>
  );

  const renderReports = () => {
    const verifiedDocuments = reportDocuments.filter(
      (item) => item.status === "Verified",
    ).length;
    const returnedDocuments = reportDocuments.filter(
      (item) =>
        item.status === "Resubmission Required" || item.status === "Rejected",
    ).length;
    const pendingDocumentCount = reportDocuments.filter((item) =>
      ["Pending", "Under Review", "Resubmission Required"].includes(
        item.status,
      ),
    ).length;
    const reviewedEligibility = reportEligibility.filter(
      (item) => item.reviewStatus === "Reviewed",
    ).length;
    const hasReportData =
      reportApplications.length +
        reportDocuments.length +
        reportEligibility.length >
      0;

    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: date.toLocaleDateString(undefined, { month: "short" }),
        count: 0,
      };
    });
    reportApplications.forEach((item) => {
      const date = new Date(item.submittedAt || item.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const bucket = monthBuckets.find((month) => month.key === key);
      if (bucket) bucket.count += 1;
    });
    const monthlyTrendTotal = monthBuckets.reduce(
      (sum, month) => sum + month.count,
      0,
    );
    const maxMonthlyCount = Math.max(
      1,
      ...monthBuckets.map((month) => month.count),
    );

    const outcomeRows = [
      { label: "Verified", count: verifiedDocuments, tone: "bg-emerald-500" },
      {
        label: "Returned / Rejected",
        count: returnedDocuments,
        tone: "bg-rose-400",
      },
      {
        label: "Pending / Under review",
        count: pendingDocumentCount,
        tone: "bg-amber-400",
      },
    ];
    const documentTotal = reportDocuments.length;

    return (
      <>
        <PageHeading
          eyebrow="Institutional insights"
          title="Reports"
          description="Review application intake, document verification outcomes, and eligibility screening activity within your authorized data scope."
          actions={
            <>
              <div className="w-full sm:w-44">
                <FilterSelect
                  value={reportPeriod}
                  onChange={setReportPeriod}
                  label="Reporting period"
                  options={["All time", "Last 30 days", "This year"]}
                />
              </div>
              <button
                type="button"
                onClick={exportOfficerReport}
                disabled={!hasReportData}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#351b27] px-4 text-xs font-bold text-white transition hover:bg-[#3b1e2b] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ArrowDownToLine size={15} /> Export CSV
              </button>
            </>
          }
        />
        <BackendNotice />
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Applications received"
            value={reportApplications.length}
            description={`Submissions · ${reportPeriod.toLowerCase()}`}
            icon={Users}
            tone="blue"
          />
          <StatCard
            title="Documents verified"
            value={verifiedDocuments}
            description="Accepted document records"
            icon={FileCheck2}
            tone="emerald"
          />
          <StatCard
            title="Eligibility assessed"
            value={reviewedEligibility}
            description="Completed officer assessments"
            icon={ShieldCheck}
            tone="violet"
          />
          <StatCard
            title="Open reviews"
            value={
              pendingDocumentCount +
              reportEligibility.filter(
                (item) => item.reviewStatus !== "Reviewed",
              ).length
            }
            description="Document and eligibility tasks awaiting action"
            icon={Clock3}
            tone="amber"
          />
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <Panel>
            <PanelTitle
              eyebrow="Application analytics"
              title="Application intake"
              description="Monthly submissions across the last six calendar months."
            />
            {monthlyTrendTotal === 0 ? (
              <EmptyState
                icon={ChartNoAxesCombined}
                title="No trend data available"
                description="Application intake bars will appear when dated submissions exist in the last six calendar months."
                compact
              />
            ) : (
              <div className="p-5 sm:p-6">
                <div
                  role="img"
                  aria-label={`Monthly application intake for the last six months. ${monthBuckets.map((month) => `${month.label}: ${month.count}`).join(", ")}`}
                  className="flex h-48 items-end gap-2 sm:gap-4"
                >
                  {monthBuckets.map((month) => (
                    <div
                      key={month.key}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-[10px] font-bold tabular-nums text-slate-500">
                        {month.count || ""}
                      </span>
                      <div className="flex h-36 w-full items-end overflow-hidden rounded-t-lg bg-slate-50">
                        <div
                          className="w-full rounded-t-lg bg-[#f8eef1]0 transition-all"
                          style={{
                            height: `${month.count ? Math.max(6, (month.count / maxMonthlyCount) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {month.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-slate-400">
                  Only records with a valid submission date are included in the
                  monthly trend.
                </p>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelTitle
              eyebrow="Screening performance"
              title="Document outcomes"
              description="Distribution of document records in the selected reporting period."
            />
            {documentTotal === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="No verification data available"
                description="Outcome distribution will appear after document records and officer decisions are available."
                compact
              />
            ) : (
              <div className="space-y-5 p-5 sm:p-6">
                {outcomeRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-600">
                        {row.label}
                      </span>
                      <span className="text-xs font-extrabold tabular-nums text-[#351b27]">
                        {row.count}{" "}
                        <span className="font-medium text-slate-400">
                          / {documentTotal}
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cx(
                          "h-full rounded-full transition-all",
                          row.tone,
                        )}
                        style={{
                          width: `${(row.count / documentTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-400">
                  Counts are grouped by the current document status supplied by
                  the backend.
                </p>
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel>
            <PanelTitle
              eyebrow="Eligibility screening"
              title="Assessment summary"
              description="Rule-engine result and officer review status are tracked separately."
            />
            {reportEligibility.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="No eligibility data available"
                description="Eligibility summaries will appear when programme assessments are available from the backend."
                compact
              />
            ) : (
              <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold text-slate-500">
                    Total cases
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-[#351b27]">
                    {reportEligibility.length}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-semibold text-emerald-700">
                    Rule result: eligible
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-800">
                    {
                      reportEligibility.filter(
                        (item) =>
                          (item.ruleResult || item.status) === "Eligible",
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-4">
                  <p className="text-[10px] font-semibold text-rose-700">
                    Rule result: not eligible
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-rose-800">
                    {
                      reportEligibility.filter(
                        (item) =>
                          (item.ruleResult || item.status) === "Not Eligible",
                      ).length
                    }
                  </p>
                </div>
                <p className="text-[10px] leading-5 text-slate-400 sm:col-span-3">
                  Rule-engine outcomes are displayed as received and must not be
                  overwritten by an officer recommendation.
                </p>
              </div>
            )}
          </Panel>
          <Panel>
            <PanelTitle
              eyebrow="Report definitions"
              title="How to read these figures"
              description="Keep reporting transparent and auditable."
            />
            <div className="space-y-3 p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#f8eef1] p-2 text-[#71364a]">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Applications received
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Submitted applications included in the selected period.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Document outcomes
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Current verified, returned, rejected, and pending status
                    counts.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-lg bg-[#f5f0e8] p-2 text-[#927248]">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Eligibility assessed
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Cases with an officer review status of Reviewed; this is
                    separate from the automatic rule result.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-[10px] font-bold text-amber-800">
                  Data scope reminder
                </p>
                <p className="mt-1 text-[10px] leading-5 text-amber-900/80">
                  The API must return only records this officer is authorized to
                  see. Institution-wide exports require explicit permission
                  checks on the server.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </>
    );
  };

  const sectionContent = {
    Overview: renderOverview,
    Applications: renderApplications,
    "Document Verification": renderDocuments,
    "Eligibility Review": renderEligibility,
    "Admission Workflow": renderWorkflow,
    Notifications: renderNotifications,
    Reports: renderReports,
  };

  const activeContent = sectionContent[activeSection] || renderOverview;

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-[#40343a] selection:bg-[#ead6dc] selection:text-[#351b27]">
      {mobileNavOpen ? (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-[min(290px,86vw)] flex-col border-r border-[#4a2b36] bg-[#28151e] text-[#f7edf0] shadow-[18px_0_50px_-28px_rgba(40,21,30,0.55)] transition-transform duration-300 lg:w-[270px] lg:shadow-none",
          mobileNavOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5 sm:px-6">
          <a
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[#fff8f4]"
          >
            CrediFit<span className="text-[#c7a36c]">.</span>
          </a>
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-[#c9b7bd] hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>
        <div className="px-4 pt-5 sm:px-5">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#5a2b40] via-[#452333] to-[#321a25] p-4 text-white shadow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheck size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">Officer Workspace</p>
                <p className="mt-0.5 text-[10px] tracking-wide text-[#e7c9b4]">
                  Admission management
                </p>
              </div>
            </div>
          </div>
        </div>
        <nav
          aria-label="Officer navigation"
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-6 sm:px-5 [scrollbar-color:#72515d_transparent]"
        >
          {["Workspace", "Screening", "Communication", "Insights"].map(
            (group) => {
              const groupItems = navigation.filter(
                (item) => item.group === group,
              );
              if (!groupItems.length) return null;
              return (
                <div key={group} className="mb-6">
                  <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.19em] text-[#b99fa8]">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {groupItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeSection === item.label;
                      return (
                        <button
                          key={item.label}
                          onClick={() => navigateTo(item.label)}
                          aria-current={active ? "page" : undefined}
                          className={cx(
                            "group flex min-h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-xs font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#b98a98]",
                            active
                              ? "border-[#b98a72]/35 bg-gradient-to-r from-[#744052] to-[#552b3c] text-white shadow-lg shadow-black/15"
                              : "text-[#d7c5cb] hover:border-white/5 hover:bg-white/10 hover:text-[#fff8f4]",
                          )}
                        >
                          <Icon
                            size={18}
                            className={cx(
                              "shrink-0",
                              active
                                ? "text-[#e8c89c]"
                                : "text-[#ad929c] group-hover:text-[#e8c89c]",
                            )}
                          />
                          <span className="min-w-0 flex-1">{item.label}</span>
                          {item.label === "Notifications" &&
                          unreadNotifications > 0 ? (
                            <span className="rounded-full border border-[#c7a36c]/30 bg-[#c7a36c]/15 px-2 py-0.5 text-[10px] font-bold text-[#f0d7aa]">
                              {unreadNotifications}
                            </span>
                          ) : null}
                          {active ? (
                            <ChevronRight
                              size={14}
                              className="text-[#e7c9a9]"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-4 sm:p-5">
          <div className="rounded-xl border border-[#c7a36c]/25 bg-white/[0.045] p-3.5">
            <div className="flex items-center gap-2 text-[#e6c99f]">
              <LockKeyhole size={15} />
              <span className="text-[11px] font-bold">Scoped access</span>
            </div>
            <p className="mt-1.5 text-[10px] leading-4 text-[#c9b7bd]">
              Only records and actions assigned to your officer role should be
              available.
            </p>
          </div>
          <a
            href="/login"
            className="mt-3 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#d7c5cb] transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={17} />
            Return to sign in
          </a>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-[#e9dfd9] bg-[#fffdfa]/95 px-4 backdrop-blur-xl shadow-[0_4px_24px_-22px_rgba(53,27,39,0.35)] sm:h-[72px] sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#f0dce2] lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold tracking-tight text-[#351b27] sm:text-sm">
                Admission Office
              </p>
              <p className="hidden text-[10px] text-slate-400 sm:block">
                Institutional screening workspace
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen((open) => !open)}
                aria-label="Open notifications"
                aria-expanded={notificationOpen}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#f8eef1] hover:text-[#78364d] focus:outline-none focus:ring-2 focus:ring-[#e9cbd4]"
              >
                <Bell size={19} />
                {unreadNotifications > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(370px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-[#eadde1] bg-white shadow-[0_24px_70px_-25px_rgba(53,27,39,0.4)]">
                  <div className="flex items-center justify-between border-b border-[#f0e7e9] px-4 py-4">
                    <div>
                      <p className="text-sm font-extrabold text-[#351b27]">
                        Notifications
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {unreadNotifications} unread updates
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-[#f8eef1] hover:text-[#78364d]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto p-2">
                    {notificationRecords.length === 0 ? (
                      <div className="py-9 text-center">
                        <Bell size={25} className="mx-auto text-slate-300" />
                        <p className="mt-3 text-xs font-bold text-slate-700">
                          You're all caught up
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          New admission updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notificationRecords.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (!item.read) markNotificationRead(item.id);
                            setNotificationOpen(false);
                            navigateTo("Notifications");
                          }}
                          className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-[#faf6f5] ${
                            !item.read ? "bg-[#fbf2f4]" : ""
                          }`}
                        >
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              item.read ? "bg-slate-300" : "bg-[#78364d]"
                            }`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-[#351b27]">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                              {item.message}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f0e7e9] px-4 py-3">
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-slate-500 hover:text-[#78364d]"
                    >
                      Mark all read
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        navigateTo("Notifications");
                      }}
                      className="text-[10px] font-extrabold text-[#78364d] hover:text-[#512338]"
                    >
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <ProfileMenu
              role="Admission Officer"
              userId="officer-preview"
              displayName="Admission Officer"
              tone="wine"
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-7 xl:px-8 xl:py-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {activeContent()}
          </motion.div>
          <footer className="mt-9 flex flex-col gap-1 border-t border-[#e8ded8] py-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CrediFit · Admission Management Platform</p>
            <p>Officer Workspace · Institutional Access</p>
          </footer>
        </main>
      </div>
      {selectedApplication ? (
        <ApplicationReviewDialog
          application={selectedApplication}
          relatedDocuments={documentRecords.filter(
            (item) =>
              String(item.applicationId || "") ===
              String(
                selectedApplication.applicationId ||
                  selectedApplication.id ||
                  "",
              ),
          )}
          eligibilityRecord={
            eligibilityRecords.find(
              (item) =>
                String(item.applicationId || item.id || "") ===
                String(
                  selectedApplication.applicationId ||
                    selectedApplication.id ||
                    "",
                ),
            ) || null
          }
          onClose={() => setSelectedApplication(null)}
          onStartReview={handleStartApplicationReview}
          onSaveNote={handleSaveApplicationNote}
          onOpenDocument={openDocumentFromApplication}
          onOpenEligibility={openEligibilityFromApplication}
        />
      ) : null}
      {selectedDocument ? (
        <DocumentReviewDialog
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDecision={handleDocumentDecision}
        />
      ) : null}
      {selectedEligibility ? (
        <EligibilityReviewDialog
          record={selectedEligibility}
          onClose={() => setSelectedEligibility(null)}
          onSave={handleEligibilityDecision}
        />
      ) : null}
    </div>
  );
}

export default OfficerDashboard;
