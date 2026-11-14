import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  GraduationCap,
  History,
  Inbox,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  X,
  LogOut,
} from "lucide-react";
import { apiRequest } from "../../services/api";
import { logout } from "../../services/auth";
import ProfileMenu from "../../components/Profile/ProfileMenu";
import NotificationBell from "../../components/notifications/NotificationBell";
import NotificationCenterPage from "../../components/notifications/NotificationCenterPage";
import usePersistedDashboardSection from "../../hooks/usePersistedDashboardSection.js";

/*
 * CrediFit — Evaluator Workspace
 * Live evaluator assignments, assessment workflow and review history.
 * Design-preview records remain isolated from production data.
 */

const navigation = [
  { label: "Overview", icon: LayoutDashboard, enabled: true },
  { label: "My Applications", icon: ClipboardList, enabled: true },
  { label: "Evaluation Studio", icon: ClipboardCheck, enabled: true },
  { label: "Clarification Centre", icon: FileSearch, enabled: true },
  { label: "Review History", icon: History, enabled: true },
  { label: "My Analytics", icon: ChartNoAxesCombined, enabled: true },
  { label: "Notifications", icon: Bell, enabled: true },
];

// DESIGN PREVIEW ONLY — never included in live application data.

const DOSSIER_LAYOUT_PREVIEW = {
  id: "dossier-layout-preview",
  applicationNumber: "PREVIEW-ONLY",
  applicantName: "Preview Applicant",
  programmeName: "Programme preview",
  departmentName: "Example Department",
  status: "in progress",
  priority: "normal",
  assignedAt: "2026-10-20",
  dueDate: "2026-11-20",
  submittedAt: "2026-10-18",
  currentStage: "Department Review",

  applicant: {
    email: "preview@example.invalid",
    phone: "Not available",
    gender: "Not specified",
    address: "Illustrative address — preview only",
    city: "Example City",
    state: "Example State",
    pincode: "000000",
  },

  academicRecords: [
    {
      id: "preview-academic-1",
      level: "12th / PUC",
      institution: "Example Institution",
      yearOfPassing: "2024",
      marks: "Illustrative result",
      board: "Example Board",
    },
    {
      id: "preview-academic-2",
      level: "10th",
      institution: "Example School",
      yearOfPassing: "2022",
      marks: "Illustrative result",
      board: "Example Board",
    },
  ],

  verifiedDocuments: [
    {
      id: "preview-document-1",
      documentType: "12th / PUC marks card",
      verificationStatus: "verified",
      verifiedAt: "2026-10-19",
    },
    {
      id: "preview-document-2",
      documentType: "10th marks card",
      verificationStatus: "verified",
      verifiedAt: "2026-10-19",
    },
  ],

  eligibilitySnapshot: {
    status: "Illustrative result",
    summary: "Sample information for visual layout testing only.",
    criteria: [
      {
        criterion: "Academic qualification",
        result: "Preview only",
      },
      {
        criterion: "Programme requirements",
        result: "Preview only",
      },
    ],
  },

  stageHistory: [
    {
      id: "preview-stage-1",
      stageName: "Application Submission",
      description: "Illustrative timeline event.",
      timestamp: "2026-10-18",
    },
    {
      id: "preview-stage-2",
      stageName: "Document Verification",
      description: "Illustrative timeline event.",
      timestamp: "2026-10-19",
    },
    {
      id: "preview-stage-3",
      stageName: "Eligibility Screening",
      description: "Illustrative timeline event.",
      timestamp: "2026-10-20",
    },
  ],
};

// DESIGN PREVIEW ONLY — illustrative clarification request.
// This sample is separate from live application records.
const CLARIFICATION_PREVIEW_REQUESTS = [
  {
    id: "clarification-preview-01",
    applicationId: "PREVIEW-ONLY",
    applicantName: "Preview Applicant",
    programmeName: "Programme preview",
    category: "Academic information",
    subject: "Academic record clarification",
    description:
      "Illustrative request to demonstrate how an evaluator flags incomplete or unclear academic information for Admission Officer review.",
    priority: "Normal",
    status: "Awaiting response",
    createdAt: "2026-10-20",
    updatedAt: "2026-10-20",
    assignedTo: "Admission Officer",
    history: [
      {
        action: "Clarification request created",
        actor: "Evaluator",
        timestamp: "2026-10-20",
      },
      {
        action: "Forwarded for Admission Officer review",
        actor: "System",
        timestamp: "2026-10-20",
      },
    ],
  },
];

// DESIGN PREVIEW ONLY — illustrative assessment rubric.
// Production criteria and weights must come from Admin configuration.
const EVALUATION_RUBRIC_PREVIEW = [
  {
    id: "academic-performance",
    title: "Academic performance",
    description: "Review the applicant's academic achievement and results.",
    weight: 30,
    maxScore: 10,
  },
  {
    id: "subject-relevance",
    title: "Subject relevance",
    description:
      "Consider the relevance of previous subjects to the selected programme.",
    weight: 25,
    maxScore: 10,
  },
  {
    id: "programme-suitability",
    title: "Programme suitability",
    description:
      "Assess the applicant's academic preparation for the programme.",
    weight: 25,
    maxScore: 10,
  },
  {
    id: "supporting-information",
    title: "Supporting information",
    description:
      "Consider relevant verified information provided with the application.",
    weight: 20,
    maxScore: 10,
  },
];

const statCards = [
  {
    label: "Assigned to me",
    value: "—",
    helper: "Live assignment count",
    icon: ClipboardList,
    tone: "blue",
  },
  {
    label: "Awaiting review",
    value: "—",
    helper: "Applications to begin",
    icon: Clock3,
    tone: "amber",
  },
  {
    label: "In progress",
    value: "—",
    helper: "Reviews saved as drafts",
    icon: Activity,
    tone: "violet",
  },
  {
    label: "Submitted",
    value: "—",
    helper: "Completed assessments",
    icon: CheckCircle2,
    tone: "emerald",
  },
];

const toneClasses = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)] ${className}`}
    >
      {children}
    </section>
  );
}

function PanelHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-blue-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-base font-extrabold tracking-tight text-[#173b61]">
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
      className={`flex flex-col items-center px-5 text-center ${compact ? "py-8" : "py-10 sm:py-12"}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#173b61]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Sidebar({ mobileOpen, onClose, activeSection, onNavigate }) {
  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Close navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col bg-[#022d3b] text-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17474A] text-[#80E0C4] shadow-lg shadow-[#102F35]/30">
              <GraduationCap size={22} strokeWidth={2.1} />
            </div>

            <div>
              <p className="font-display text-[20px] font-extrabold tracking-tight text-white">
                CrediFit
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Evaluator workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Review workspace
          </p>

          <nav className="mt-4 space-y-1" aria-label="Evaluator navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;
              const isEnabled = item.enabled;

              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={!isEnabled}
                  title={
                    isEnabled
                      ? item.label
                      : `${item.label} will be added in a later phase`
                  }
                  onClick={() => {
                    if (!isEnabled) return;
                    onNavigate(item.label);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${
                    isActive
                      ? "bg-[#16806E]/20 text-white ring-1 ring-[#80E0C4]/30"
                      : isEnabled
                        ? "text-slate-300 hover:bg-white/5 hover:text-[#80E0C4]"
                        : "cursor-not-allowed text-slate-600"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={
                      isActive
                        ? "text-[#80E0C4]"
                        : isEnabled
                          ? "text-slate-400 group-hover:text-[#80E0C4]"
                          : "text-slate-600"
                    }
                  />

                  <span className="min-w-0 flex-1">{item.label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#80E0C4]" />
                  )}

                  {!isEnabled && (
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                      Later
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-[#80E0C4]/15 bg-gradient-to-br from-[#16806E]/20 to-transparent p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16806E]/20 text-[#80E0C4]">
              <ShieldCheck size={18} />
            </div>

            <p className="mt-3 text-xs font-bold text-white">
              A fair review starts with evidence.
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-400">
              Review only assigned applications and keep every assessment clear,
              consistent and traceable.
            </p>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={16} className="text-slate-400" />
            Sign Out
          </button>

          <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[#80E0C4]" />
            Live records synced
          </div>

          <p className="mt-2 px-2 text-[9px] text-slate-600">
            CrediFit · Admission screening system
          </p>
        </div>
      </aside>
    </>
  );
}

function StatCard({ card, index }) {
  const Icon = card.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_18px_rgba(15,23,42,0.035)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{card.label}</p>
          <p className="mt-3 font-display text-[30px] font-extrabold leading-none tracking-tight text-[#173b61]">
            {card.value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClasses[card.tone]}`}
        >
          <Icon size={19} strokeWidth={1.9} />
        </div>
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
        {card.helper}
      </p>
    </motion.article>
  );
}

function ReviewPrinciples() {
  const principles = [
    {
      number: "01",
      title: "Review the verified evidence",
      description:
        "Use the documents and screening information made available through the admission process.",
    },
    {
      number: "02",
      title: "Score against approved criteria",
      description:
        "Apply the programme rubric consistently. Evaluators cannot edit institutional rules or weights.",
    },
    {
      number: "03",
      title: "Explain every recommendation",
      description:
        "Record clear remarks and supporting evidence so the next decision-maker can understand the assessment.",
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeading
        eyebrow="Evaluation standard"
        title="A consistent review, every time"
        description="A quick reminder of the principles behind a fair department-level assessment."
      />
      <div className="grid gap-0 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
        {principles.map((principle) => (
          <div key={principle.number} className="p-5 sm:p-6">
            <p className="font-display text-xs font-extrabold tracking-[0.16em] text-blue-600">
              {principle.number}
            </p>
            <h3 className="mt-3 text-sm font-bold leading-5 text-[#173b61]">
              {principle.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {principle.description}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const APPLICATION_STATUS_OPTIONS = [
  { value: "awaiting review", label: "Awaiting review" },
  { value: "in progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "returned for clarification", label: "Returned for clarification" },
];

function normalizeApplicationStatus(status) {
  const value = String(status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    ["pending", "assigned", "awaiting review", "awaiting evaluation"].includes(
      value,
    )
  ) {
    return "awaiting review";
  }

  if (["draft", "in progress", "under review"].includes(value)) {
    return "in progress";
  }

  if (["completed", "submitted", "review submitted"].includes(value)) {
    return "submitted";
  }

  if (
    [
      "returned",
      "needs clarification",
      "returned for clarification",
      "clarification requested",
    ].includes(value)
  ) {
    return "returned for clarification";
  }

  return "other";
}

function getApplicationStatusMeta(status) {
  const key = normalizeApplicationStatus(status);

  const styles = {
    "awaiting review": "bg-amber-50 text-amber-800 ring-amber-200",
    "in progress": "bg-teal-50 text-teal-800 ring-teal-200",
    submitted: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    "returned for clarification":
      "bg-orange-50 text-orange-800 ring-orange-200",
    other: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  const known = APPLICATION_STATUS_OPTIONS.find((item) => item.value === key);

  const label = known
    ? known.label
    : status
      ? String(status).replace(/[_-]+/g, " ")
      : "Status not set";

  return {
    label,
    className: styles[key] || styles.other,
  };
}

function getApplicationDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatApplicationDate(value) {
  const date = getApplicationDate(value);

  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getApplicationIdentity(application) {
  return (
    application.applicationNumber ||
    application.applicationId ||
    application.id ||
    "Reference unavailable"
  );
}

function getApplicationName(application) {
  return (
    application.applicantName ||
    application.applicant?.fullName ||
    application.applicant?.name ||
    "Applicant name unavailable"
  );
}

function getApplicationProgramme(application) {
  return (
    application.programmeName ||
    application.programme?.name ||
    "Programme not specified"
  );
}

function getPriorityMeta(priority) {
  const value = String(priority || "").toLowerCase();

  if (value === "high" || value === "urgent") {
    return {
      label: priority,
      className: "bg-rose-50 text-rose-700 ring-rose-200",
    };
  }

  if (value === "low") {
    return {
      label: priority,
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  if (value === "normal" || value === "medium") {
    return {
      label: priority,
      className: "bg-teal-50 text-teal-800 ring-teal-200",
    };
  }

  return {
    label: "Not set",
    className: "bg-slate-50 text-slate-500 ring-slate-200",
  };
}

function isApplicationOverdue(application) {
  const dueDate = getApplicationDate(application.dueDate);

  if (!dueDate) return false;

  if (normalizeApplicationStatus(application.status) === "submitted") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function unwrapApiResponse(response) {
  return response?.data ?? response;
}

function toUiReviewStatus(status) {
  const value = String(status || "").toUpperCase();
  if (value === "SUBMITTED") return "submitted";
  if (value === "DRAFT") return "in progress";
  return "awaiting review";
}

function toUiRecommendation(value) {
  const values = {
    RECOMMEND: "recommended",
    DO_NOT_RECOMMEND: "not_recommended",
    CLARIFICATION_REQUIRED: "clarification",
    recommended: "recommended",
    not_recommended: "not_recommended",
    clarification: "clarification",
  };
  return values[value] || "";
}

function toApiRecommendation(value) {
  const values = {
    recommended: "RECOMMEND",
    not_recommended: "DO_NOT_RECOMMEND",
    clarification: "CLARIFICATION_REQUIRED",
  };
  return values[value] || "";
}

function toEvaluatorDraft(savedReview) {
  if (!savedReview) return null;
  const scores = {};
  const evidence = {};
  const evidenceSources = {};

  (Array.isArray(savedReview.scores) ? savedReview.scores : []).forEach(
    (item) => {
      const key = String(item.criterionId ?? item.criterion);
      scores[key] = Number(item.score);
      evidence[key] = item.evidence || "";
      evidenceSources[key] = item.evidenceSource || "";
    },
  );

  return {
    scores,
    evidence,
    evidenceSources,
    overallRemarks: savedReview.remarks || "",
    recommendation: toUiRecommendation(savedReview.recommendation),
    conflictConfirmed: Boolean(savedReview.conflictConfirmed),
    savedAt: savedReview.updatedAt || "",
  };
}

function CustomDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative min-w-0">
      <span className="sr-only">{label}</span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 text-xs font-semibold transition-all duration-200 ${
          open
            ? "border-[#29977D] ring-2 ring-[#29977D]/10 shadow-sm"
            : "border-slate-200 shadow-[0_2px_6px_rgba(15,23,42,0.025)] hover:border-[#A9D6C6] hover:shadow-sm"
        }`}
      >
        <span className="truncate text-slate-700">
          {selectedOption?.label || label}
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-[#16806E]" : ""
          }`}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16 }}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.13)]"
        >
          {options.map((option) => {
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
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${
                  selected
                    ? "bg-[#EAF5F0] font-bold text-[#176B59]"
                    : "font-medium text-slate-600 hover:bg-[#F4F8F5] hover:text-[#176B59]"
                }`}
              >
                <span className="truncate">{option.label}</span>

                {selected && (
                  <CheckCircle2 size={15} className="shrink-0 text-[#16806E]" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function ApplicationQueue({ applications = [], onOpen, onPreview }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  const programmeOptions = [
    ...new Set(
      applications
        .map((application) => getApplicationProgramme(application))
        .filter((programme) => programme !== "Programme not specified"),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const filteredApplications = applications
    .filter((application) => {
      const query = searchQuery.trim().toLowerCase();

      const searchableText = [
        getApplicationIdentity(application),
        getApplicationName(application),
        getApplicationProgramme(application),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeApplicationStatus(application.status) === statusFilter;

      const matchesProgramme =
        programmeFilter === "all" ||
        getApplicationProgramme(application) === programmeFilter;

      return matchesSearch && matchesStatus && matchesProgramme;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const first = getApplicationDate(a.dueDate)?.getTime() ?? Infinity;
        const second = getApplicationDate(b.dueDate)?.getTime() ?? Infinity;
        return first - second;
      }

      if (sortBy === "assigned") {
        const first = getApplicationDate(a.assignedAt)?.getTime() ?? 0;
        const second = getApplicationDate(b.assignedAt)?.getTime() ?? 0;
        return second - first;
      }

      return getApplicationName(a).localeCompare(getApplicationName(b));
    });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    programmeFilter !== "all" ||
    sortBy !== "deadline";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProgrammeFilter("all");
    setSortBy("deadline");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Page introduction */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#E8F4EF] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#176B59]">
            <ClipboardList size={13} />
            Assignment workspace
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#173B35] sm:text-4xl">
            My Applications
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review applications assigned specifically to your evaluator account.
            Prioritize deadlines, inspect application status and organize your
            assessment workload.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#D8E9E1] bg-white px-4 py-3 text-xs font-semibold text-[#176B59] shadow-sm">
          <ShieldCheck size={17} />
          Assignment-based access
        </div>
      </div>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">
              Find an application
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Search and organize your assigned review queue.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold text-[#167461] transition hover:bg-[#EFF8F4]"
            >
              <RotateCcw size={13} />
              Reset filters
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          {/* Search */}
          <label className="relative block">
            <span className="sr-only">Search applications</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, application ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#31977E] focus:bg-white focus:ring-2 focus:ring-[#31977E]/10"
            />
          </label>

          {/* Status filter */}
          <CustomDropdown
            label="Review status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All review statuses" },
              ...APPLICATION_STATUS_OPTIONS,
            ]}
          />

          {/* Programme filter */}
          <CustomDropdown
            label="Programme"
            value={programmeFilter}
            onChange={setProgrammeFilter}
            options={[
              { value: "all", label: "All programmes" },
              ...programmeOptions.map((programme) => ({
                value: programme,
                label: programme,
              })),
            ]}
          />

          {/* Sorting */}
          <CustomDropdown
            label="Sort applications"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "deadline", label: "Upcoming deadline" },
              { value: "assigned", label: "Recently assigned" },
              { value: "name", label: "Applicant name" },
            ]}
          />
        </div>
      </section>

      {/* Application results */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#16806E]">
              Your workload
            </p>
            <h2 className="mt-1 text-base font-extrabold text-[#173B35]">
              Assigned review queue
            </h2>
          </div>

          <p className="text-[11px] font-medium text-slate-400">
            {applications.length === 0
              ? "Waiting for assigned records"
              : `${filteredApplications.length} of ${applications.length} applications`}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center sm:py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5F0] text-[#16806E] ring-1 ring-[#CDE7DC]">
              <Inbox size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              No applications assigned yet
            </h3>

            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
              Applications will appear here after the Admission Officer assigns
              them to your evaluator account.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching applications"
            description="Try changing your search text or filters to find the application you're looking for."
            compact
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching applications"
            description="Try changing your search text or filters to find the application you're looking for."
            compact
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F6FAF8]">
                  <tr className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-4 py-4">Programme</th>
                    <th className="px-4 py-4">Assigned on</th>
                    <th className="px-4 py-4">Review deadline</th>
                    <th className="px-4 py-4">Priority</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application, index) => {
                    const status = getApplicationStatusMeta(application.status);
                    const priority = getPriorityMeta(application.priority);
                    const overdue = isApplicationOverdue(application);

                    return (
                      <tr
                        key={
                          application.id ||
                          application.applicationId ||
                          application.applicationNumber ||
                          index
                        }
                        className="transition hover:bg-[#FAFCFB]"
                      >
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-800">
                            {getApplicationName(application)}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {getApplicationIdentity(application)}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-xs font-medium text-slate-600">
                          {getApplicationProgramme(application)}
                        </td>

                        <td className="px-4 py-4 text-[11px] text-slate-500">
                          {formatApplicationDate(application.assignedAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays
                              size={13}
                              className={
                                overdue ? "text-rose-500" : "text-slate-400"
                              }
                            />
                            <span
                              className={`text-[11px] font-semibold ${
                                overdue ? "text-rose-600" : "text-slate-600"
                              }`}
                            >
                              {formatApplicationDate(application.dueDate)}
                            </span>
                          </div>
                          {overdue && (
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-rose-500">
                              Overdue
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ring-1 ${priority.className}`}
                          >
                            {priority.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* Action column */}
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpen?.(application)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#CDE7DC] bg-[#F1F8F4] px-3 py-2 text-[10px] font-bold text-[#176B59] transition hover:border-[#16806E] hover:bg-[#E3F2E9] focus:outline-none focus:ring-2 focus:ring-[#31977E]/20"
                          >
                            Open dossier
                            <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile application cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredApplications.map((application, index) => {
                const status = getApplicationStatusMeta(application.status);
                const priority = getPriorityMeta(application.priority);
                const overdue = isApplicationOverdue(application);

                return (
                  <article
                    key={
                      application.id ||
                      application.applicationId ||
                      application.applicationNumber ||
                      index
                    }
                    className="space-y-3 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {getApplicationName(application)}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {getApplicationIdentity(application)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ring-1 ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-600">
                      {getApplicationProgramme(application)}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">
                          Due date
                        </p>
                        <p
                          className={`mt-1 text-[11px] font-semibold ${overdue ? "text-rose-600" : "text-slate-600"}`}
                        >
                          {formatApplicationDate(application.dueDate)}
                          {overdue ? " · Overdue" : ""}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ring-1 ${priority.className}`}
                      >
                        {priority.label} priority
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpen?.(application)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#CDE7DC] bg-[#F1F8F4] px-4 py-2.5 text-xs font-bold text-[#176B59] transition hover:bg-[#E3F2E9] focus:outline-none focus:ring-2 focus:ring-[#31977E]/20"
                    >
                      Open applicant dossier
                      <ExternalLink size={14} />
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Workflow reminder */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#D8E9E1] bg-[#F1F8F4] p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#16806E]" />
        <p className="text-[11px] leading-5 text-[#45665D]">
          Review only applications assigned to your account. Document
          verification and final admission decisions remain with their
          respective authorized roles.
        </p>
      </div>
    </motion.div>
  );
}

function displayDossierValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function getApplicantInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "AP";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DossierField({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-[#FAFCFB] p-3.5">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={14} />}
        <p className="text-[9px] font-bold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-700">
        {displayDossierValue(value)}
      </p>
    </div>
  );
}

function DossierSection({ eyebrow, title, description, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          {eyebrow && (
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#16806E]">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-1 text-base font-extrabold tracking-tight text-[#173B35]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ApplicantDossier({
  application,
  onBack,
  onContinue,
  onDownloadDocument,
  isPreview = false,
}) {
  const applicant = application.applicant || application.applicantDetails || {};

  const applicantName = getApplicationName(application);
  const applicationId = getApplicationIdentity(application);
  const programme = getApplicationProgramme(application);
  const status = getApplicationStatusMeta(application.status);
  const priority = getPriorityMeta(application.priority);

  const email =
    applicant.email || application.applicantEmail || application.email;

  const phone =
    applicant.phone ||
    applicant.mobile ||
    application.applicantPhone ||
    application.phone;

  const address =
    applicant.address || applicant.permanentAddress || application.address;

  const city = applicant.city || application.city;
  const state = applicant.state || application.state;
  const pincode = applicant.pincode || applicant.postalCode;

  // Academic records can arrive as an array or a grouped object.
  const academicSource =
    application.academicRecords ||
    applicant.academicRecords ||
    applicant.educationDetails ||
    applicant.education ||
    [];

  let academicRecords = [];

  if (Array.isArray(academicSource)) {
    academicRecords = academicSource;
  } else if (academicSource && typeof academicSource === "object") {
    academicRecords = Object.entries(academicSource).map(
      ([level, details]) => ({
        level,
        ...(typeof details === "object" && details !== null
          ? details
          : { result: details }),
      }),
    );
  }

  // Only explicitly verified documents are visible here.
  const allDocuments = application.documents || applicant.documents || [];

  const suppliedVerifiedDocuments =
    application.verifiedDocuments || applicant.verifiedDocuments;

  const verifiedDocuments = Array.isArray(suppliedVerifiedDocuments)
    ? suppliedVerifiedDocuments
    : Array.isArray(allDocuments)
      ? allDocuments.filter((document) => {
          const documentStatus = String(
            document.verificationStatus || document.status || "",
          ).toLowerCase();

          return documentStatus === "verified";
        })
      : [];

  const hasOtherDocuments =
    Array.isArray(allDocuments) &&
    allDocuments.some((document) => {
      const documentStatus = String(
        document.verificationStatus || document.status || "",
      ).toLowerCase();

      return documentStatus !== "verified";
    });

  // Eligibility is displayed as read-only information.
  const eligibility =
    application.eligibilitySnapshot ||
    application.eligibility ||
    applicant.eligibilitySnapshot ||
    null;

  const eligibilityCriteria = Array.isArray(eligibility?.criteria)
    ? eligibility.criteria
    : Array.isArray(eligibility?.results)
      ? eligibility.results
      : eligibility && typeof eligibility === "object"
        ? Object.entries(eligibility)
            .filter(
              ([key]) =>
                !["status", "result", "summary", "checkedAt"].includes(key),
            )
            .map(([criterion, result]) => ({
              criterion,
              result,
            }))
        : [];

  const eligibilityStatus = eligibility?.status || eligibility?.result || null;

  // Timeline contains only events supplied by the application record.
  const timelineSource =
    application.stageHistory ||
    application.timeline ||
    application.applicationHistory ||
    [];

  const timeline = Array.isArray(timelineSource) ? timelineSource : [];

  const personalDetails = [
    {
      label: "Email address",
      value: email,
      icon: Mail,
    },
    {
      label: "Phone number",
      value: phone,
      icon: Phone,
    },
    {
      label: "Date of birth",
      value: applicant.dateOfBirth
        ? formatApplicationDate(applicant.dateOfBirth)
        : application.dateOfBirth
          ? formatApplicationDate(application.dateOfBirth)
          : null,
      icon: CalendarDays,
    },
    {
      label: "Gender",
      value: applicant.gender || application.gender,
      icon: UserRound,
    },
    {
      label: "Address",
      value: address,
      icon: MapPin,
    },
    {
      label: "City / State / PIN",
      value: [city, state, pincode].filter(Boolean).join(", "),
      icon: MapPin,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {isPreview && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-xs font-extrabold text-amber-900">
              Preview Mode — Sample Information
            </p>

            <p className="mt-1 text-[11px] leading-5 text-amber-800">
              This is an illustrative design preview, not a real applicant
              record. This information must not be used for admission assessment
              or decision-making.
            </p>
          </div>
        </div>
      )}

      {/* Back navigation */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#B9DACC] hover:bg-[#F3F9F5] hover:text-[#176B59] focus:outline-none focus:ring-2 focus:ring-[#31977E]/20"
      >
        <ArrowLeft size={15} />
        Back to My Applications
      </button>

      {/* Applicant identity header */}
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#102F35] via-[#17474A] to-[#1B5551] p-5 text-white shadow-lg shadow-[#102F35]/10 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-5 -top-12 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-extrabold text-[#A7EAD5] shadow-inner sm:h-20 sm:w-20 sm:text-2xl">
              {getApplicantInitials(applicantName)}
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#A7EAD5]">
                Applicant dossier
              </p>

              <h1 className="mt-1 break-words text-xl font-extrabold tracking-tight sm:text-2xl">
                {applicantName}
              </h1>

              <p className="mt-1 break-all text-[11px] text-[#D3E5E2]">
                Application ID: {applicationId}
              </p>

              <p className="mt-1 text-xs font-medium text-[#D3E5E2]">
                {programme}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ${status.className}`}
            >
              {status.label}
            </span>

            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold capitalize ring-1 ${priority.className}`}
            >
              {priority.label} priority
            </span>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A9CFC4]">
              Assigned on
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {formatApplicationDate(application.assignedAt)}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A9CFC4]">
              Review deadline
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {formatApplicationDate(application.dueDate)}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A9CFC4]">
              Department
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {displayDossierValue(
                application.departmentName || application.department?.name,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Applicant and application information */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <DossierSection
          eyebrow="Applicant information"
          title="Personal and contact details"
          description="Applicant information submitted during application registration."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {personalDetails.map((item) => (
              <DossierField
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>
        </DossierSection>

        <DossierSection
          eyebrow="Application record"
          title="Programme information"
          description="The programme and application details associated with this review."
        >
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Applied programme
              </p>
              <p className="mt-1 text-sm font-bold leading-5 text-[#173B35]">
                {programme}
              </p>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Application submitted
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {formatApplicationDate(
                  application.submittedAt || application.applicationDate,
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Current admission stage
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {displayDossierValue(
                  application.currentStage || application.stageName,
                )}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Application reference
              </p>
              <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                {applicationId}
              </p>
            </div>
          </div>
        </DossierSection>
      </div>

      {/* Academic records */}
      <DossierSection
        eyebrow="Academic background"
        title="Academic records"
        description="Academic qualifications supplied with the application."
      >
        {academicRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <GraduationCap size={25} className="mx-auto text-slate-300" />
            <p className="mt-3 text-xs font-bold text-slate-600">
              Academic records are not available
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Academic details will appear here when they are provided by the
              application service.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {academicRecords.map((record, index) => (
              <article
                key={record.id || record.level || record.qualification || index}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-[#B9DACC] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F0] text-[#176B59]">
                      <GraduationCap size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-[#173B35]">
                        {displayDossierValue(
                          record.level ||
                            record.qualification ||
                            record.course ||
                            `Qualification ${index + 1}`,
                        )}
                      </h3>

                      <p className="mt-1 truncate text-[10px] text-slate-400">
                        {displayDossierValue(
                          record.institution ||
                            record.school ||
                            record.college ||
                            record.board,
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500">
                    {displayDossierValue(
                      record.yearOfPassing || record.passingYear || record.year,
                    )}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Marks / Result
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {displayDossierValue(
                        record.marks ||
                          record.percentage ||
                          record.result ||
                          record.grade,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Board / University
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      {displayDossierValue(record.board || record.university)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DossierSection>

      {/* Verified documents */}
      <DossierSection
        eyebrow="Document review"
        title="Verified documents"
        description="Only documents marked as verified by the Admission Officer are displayed to evaluators."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5F0] px-2.5 py-1.5 text-[9px] font-bold text-[#176B59]">
            <ShieldCheck size={12} />
            Read only
          </span>
        }
      >
        {verifiedDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <FileText size={24} className="mx-auto text-slate-300" />
            <p className="mt-3 text-xs font-bold text-slate-600">
              No verified documents available
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {hasOtherDocuments
                ? "Some documents exist, but they have not been marked as verified. They are not available for evaluator review."
                : "Verified documents will appear here after the Admission Officer completes document verification."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {verifiedDocuments.map((document, index) => {
              const documentName =
                document.documentType ||
                document.name ||
                document.title ||
                document.fileName ||
                `Verified document ${index + 1}`;

              const documentUrl =
                document.accessUrl || document.viewUrl || null;

              return (
                <div
                  key={document.id || documentName + index}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F0] text-[#176B59]">
                      <FileText size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-700">
                        {documentName}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Verified{" "}
                        {document.verifiedAt
                          ? `on ${formatApplicationDate(document.verifiedAt)}`
                          : "by Admission Officer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 size={11} />
                      Verified
                    </span>

                    {documentUrl ? (
                      <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-[#B9DACC] hover:bg-[#F3F9F5] hover:text-[#176B59]"
                      >
                        View
                        <ExternalLink size={12} />
                      </a>
                    ) : document.id && onDownloadDocument ? (
                      <button
                        type="button"
                        onClick={() =>
                          onDownloadDocument(
                            document.id,
                            document.fileName || documentName,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-[#B9DACC] hover:bg-[#F3F9F5] hover:text-[#176B59]"
                      >
                        Download
                        <Download size={12} />
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-400">
                        Secure preview unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DossierSection>

      {/* Eligibility snapshot */}
      <DossierSection
        eyebrow="Screening information"
        title="Eligibility snapshot"
        description="Read-only results from the institutional eligibility screening process."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-500">
            <ShieldCheck size={12} />
            Officer controlled
          </span>
        }
      >
        {!eligibility ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <ShieldCheck size={24} className="mx-auto text-slate-300" />
            <p className="mt-3 text-xs font-bold text-slate-600">
              Eligibility results are not available
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              The eligibility screening information will appear here when
              supplied by the admission workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {eligibilityStatus && (
              <div className="rounded-xl border border-[#D8E9E1] bg-[#F3F8F5] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#16806E]">
                  Overall screening result
                </p>
                <p className="mt-1 text-sm font-extrabold capitalize text-[#173B35]">
                  {String(eligibilityStatus).replace(/[_-]+/g, " ")}
                </p>

                {eligibility.summary && (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {eligibility.summary}
                  </p>
                )}
              </div>
            )}

            {eligibilityCriteria.length > 0 ? (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {eligibilityCriteria.map((criterion, index) => {
                  const criterionName =
                    criterion.criterion ||
                    criterion.name ||
                    criterion.label ||
                    `Criterion ${index + 1}`;

                  const criterionResult =
                    criterion.result ??
                    criterion.status ??
                    criterion.value ??
                    criterion.passed;

                  return (
                    <div
                      key={criterion.id || criterionName + index}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <p className="text-xs font-semibold text-slate-600">
                        {criterionName}
                      </p>

                      <span className="max-w-[55%] break-words text-right text-[10px] font-bold capitalize text-slate-600">
                        {displayDossierValue(criterionResult)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No individual eligibility criteria were supplied.
              </p>
            )}
          </div>
        )}
      </DossierSection>

      {/* Application stage history */}
      <DossierSection
        eyebrow="Admission journey"
        title="Application timeline"
        description="Historical stage updates supplied by the admission workflow."
      >
        {timeline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <History size={24} className="mx-auto text-slate-300" />
            <p className="mt-3 text-xs font-bold text-slate-600">
              No stage history available
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Application stage events will appear here as they are recorded by
              the admission workflow.
            </p>
          </div>
        ) : (
          <div className="relative ml-2 space-y-0 border-l-2 border-[#D8E9E1] pl-6">
            {timeline.map((event, index) => (
              <div
                key={event.id || event.timestamp || index}
                className="relative pb-6 last:pb-0"
              >
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#16806E] ring-2 ring-[#D8E9E1]" />

                <p className="text-xs font-extrabold text-[#173B35]">
                  {displayDossierValue(
                    event.stageName ||
                      event.stage ||
                      event.title ||
                      event.action,
                  )}
                </p>

                {event.description && (
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {event.description}
                  </p>
                )}

                <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                  {formatApplicationDate(
                    event.timestamp || event.createdAt || event.date,
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </DossierSection>

      {/* Continue to evaluation */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#CDE7DC] bg-gradient-to-r from-[#F0F8F3] to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17474A] text-white">
            <ClipboardCheck size={19} />
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#173B35]">
              Ready to assess this application?
            </h3>

            <p className="mt-1 max-w-lg text-[11px] leading-5 text-slate-500">
              Continue to the Evaluation Studio to assess the applicant against
              the approved programme criteria and record your recommendation.
            </p>
          </div>
        </div>

        {application.savedReview?.status === "SUBMITTED" ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={16} /> Assessment submitted
          </span>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17474A] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#102F35] focus:outline-none focus:ring-2 focus:ring-[#31977E]/30 focus:ring-offset-2"
          >
            <ClipboardCheck size={16} />
            {isPreview ? "Open evaluation preview" : "Continue to Evaluation"}
          </button>
        )}
      </section>

      {/* Evaluator boundary */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#D8E9E1] bg-[#F1F8F4] p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#16806E]" />

        <div>
          <p className="text-xs font-bold text-[#176B59]">
            Read-only applicant dossier
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[#58736B]">
            Applicant details, verified documents and eligibility results are
            provided for assessment reference. Document verification,
            eligibility rule changes and final admission decisions remain with
            their authorized roles.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function EvaluationStudio({
  application,
  rubric = EVALUATION_RUBRIC_PREVIEW,
  isPreview = false,
  initialDraft = null,
  onSaveDraft,
  onSubmitAssessment,
  onBack,
}) {
  const [scores, setScores] = useState(() => initialDraft?.scores ?? {});
  const [evidence, setEvidence] = useState(() => initialDraft?.evidence ?? {});

  const [evidenceSources, setEvidenceSources] = useState(
    () => initialDraft?.evidenceSources ?? {},
  );
  const [overallRemarks, setOverallRemarks] = useState(
    () => initialDraft?.overallRemarks ?? "",
  );
  const [recommendation, setRecommendation] = useState(
    () => initialDraft?.recommendation ?? "",
  );
  const [conflictConfirmed, setConflictConfirmed] = useState(
    () => initialDraft?.conflictConfirmed ?? false,
  );
  const [notice, setNotice] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [showSubmissionReview, setShowSubmissionReview] = useState(false);
  const [completedAssessment, setCompletedAssessment] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applicantName = getApplicationName(application);
  const applicationId = getApplicationIdentity(application);
  const programme = getApplicationProgramme(application);

  // Only verified documents can be selected as assessment evidence.
  const suppliedVerifiedDocuments =
    application.verifiedDocuments || application.applicant?.verifiedDocuments;

  const verifiedSourceDocuments = Array.isArray(suppliedVerifiedDocuments)
    ? suppliedVerifiedDocuments
    : Array.isArray(application.documents)
      ? application.documents.filter((document) => {
          const status = String(
            document.verificationStatus || document.status || "",
          ).toLowerCase();

          return status === "verified";
        })
      : [];

  const evidenceSourceOptions = [
    {
      value: "",
      label: "No document selected",
    },
    ...verifiedSourceDocuments.map((document, index) => ({
      value: String(document.id || document.documentId || index),
      label:
        document.documentType ||
        document.name ||
        document.title ||
        document.fileName ||
        `Verified document ${index + 1}`,
    })),
  ];

  const weightTotal = rubric.reduce(
    (total, criterion) => total + criterion.weight,
    0,
  );

  const scoredCount = rubric.filter((criterion) =>
    Number.isFinite(scores[criterion.id]),
  ).length;

  const evidenceCount = rubric.filter((criterion) =>
    Boolean(evidence[criterion.id]?.trim()),
  ).length;

  const allScored = scoredCount === rubric.length;
  const allEvidenceProvided = evidenceCount === rubric.length;
  const hasRemarks = overallRemarks.trim().length > 0;
  const hasRecommendation = Boolean(recommendation);

  const weightedPercentage =
    allScored && weightTotal > 0
      ? (rubric.reduce((total, criterion) => {
          return (
            total +
            (scores[criterion.id] / criterion.maxScore) * criterion.weight
          );
        }, 0) /
          weightTotal) *
        100
      : null;

  const isReady =
    conflictConfirmed &&
    allScored &&
    allEvidenceProvided &&
    hasRemarks &&
    hasRecommendation;

  const updateScore = (criterionId, score) => {
    setScores((previous) => ({
      ...previous,
      [criterionId]: score,
    }));
    setDraftNotice("");
    setNotice("");
  };

  const saveEvaluationDraft = async () => {
    setNotice("");
    setDraftNotice("");

    // The current database schema requires a recommendation for every review row,
    // including drafts. Keep the form incomplete if the evaluator has not chosen one.
    if (!isPreview && !hasRecommendation) {
      setNotice("Choose an evaluator recommendation before saving this draft.");
      return;
    }

    const draft = {
      applicationId,
      scores: { ...scores },
      evidence: { ...evidence },
      evidenceSources: { ...evidenceSources },
      overallRemarks,
      recommendation,
      conflictConfirmed,
      savedAt: new Date().toISOString(),
    };

    setIsSavingDraft(true);
    try {
      await onSaveDraft?.(draft);
      setSavedDraft(draft);
      setDraftNotice(
        isPreview
          ? "Preview draft saved for this session."
          : "Draft saved to your evaluator account. You can return and continue this assessment later.",
      );
    } catch (error) {
      setNotice(error.message || "Unable to save this assessment draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const updateEvidence = (criterionId, value) => {
    setEvidence((previous) => ({
      ...previous,
      [criterionId]: value,
    }));
    setDraftNotice("");
    setNotice("");
  };

  const recommendations = [
    {
      value: "recommended",
      title: "Recommended",
      description: "The applicant meets the assessment expectations.",
    },
    {
      value: "clarification",
      title: "Needs clarification",
      description: "Additional information should be reviewed.",
    },
    {
      value: "not_recommended",
      title: "Not recommended",
      description: "The assessment does not support progression.",
    },
  ];

  const checklist = [
    {
      label: "Conflict of interest declaration confirmed",
      complete: conflictConfirmed,
    },
    {
      label: "All assessment criteria scored",
      complete: allScored,
    },
    {
      label: "Evidence provided for every criterion",
      complete: allEvidenceProvided,
    },
    {
      label: "Overall assessment remarks recorded",
      complete: hasRemarks,
    },
    {
      label: "Recommendation selected",
      complete: hasRecommendation,
    },
  ];

  // Show the completion screen after assessment confirmation.
  if (completedAssessment) {
    const submittedTime = completedAssessment.submittedAt
      ? new Date(completedAssessment.submittedAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not available";

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center"
      >
        <div className="w-full rounded-3xl border border-[#D8E9E1] bg-white p-6 text-center shadow-[0_12px_40px_rgba(15,47,53,0.07)] sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F4F0] text-[#16806E] ring-8 ring-[#F3F8F5]">
            <CheckCircle2 size={38} strokeWidth={2} />
          </div>

          <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#16806E]">
            Evaluation completed
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#102F35] sm:text-3xl">
            Assessment Submitted!
          </h1>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-slate-500">
            Your assessment has been saved to CrediFit and moved to the final
            admission decision stage.
          </p>

          {completedAssessment.isPreview && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
              <p className="text-[11px] font-bold text-amber-900">
                Preview submission only
              </p>
              <p className="mt-1 text-[10px] leading-5 text-amber-800">
                This assessment uses sample applicant information. It is not a
                real admission submission.
              </p>
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-slate-100 bg-[#F8FAF9] p-5 text-left">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Submission summary
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[10px] text-slate-400">Applicant</p>
                <p className="mt-1 text-sm font-bold text-[#102F35]">
                  {completedAssessment.applicantName}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">
                  Application reference
                </p>
                <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                  {completedAssessment.applicationId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400">Weighted score</p>
                  <p className="mt-1 text-lg font-extrabold text-[#176B59]">
                    {Number.isFinite(
                      Number(completedAssessment.weightedPercentage),
                    )
                      ? `${Number(
                          completedAssessment.weightedPercentage,
                        ).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">Recommendation</p>
                  <p className="mt-1 text-xs font-bold capitalize text-[#102F35]">
                    {{
                      recommended: "Recommended",
                      clarification: "Needs clarification",
                      not_recommended: "Not recommended",
                    }[completedAssessment.recommendation] || "Not available"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">Submitted on</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {submittedTime}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17474A] px-6 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#102F35] focus:outline-none focus:ring-2 focus:ring-[#29977D]/30 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeft size={15} />
            Back to Evaluation Studio
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Back navigation */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#B9DACC] hover:bg-[#F3F9F5] hover:text-[#176B59] focus:outline-none focus:ring-2 focus:ring-[#31977E]/20"
      >
        <ArrowLeft size={15} />
        Back to applicant dossier
      </button>

      {/* Isolated design preview notice */}
      {isPreview && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-xs font-extrabold text-amber-900">
              Evaluation design preview
            </p>
            <p className="mt-1 text-[11px] leading-5 text-amber-800">
              This is illustrative information only. No real application or
              admission assessment is changed.
            </p>
          </div>
        </div>
      )}

      {/* Applicant identity */}
      <section className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#102F35] via-[#17474A] to-[#1B5551] p-5 text-white shadow-lg shadow-[#102F35]/10 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#A7EAD5]">
              Evaluation studio
            </p>

            <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">
              {applicantName}
            </h1>

            <p className="mt-2 break-all text-[11px] text-[#D3E5E2]">
              {applicationId}
            </p>

            <p className="mt-1 text-xs text-[#D3E5E2]">{programme}</p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 sm:min-w-[190px]">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#A9CFC4]">
              Assessment progress
            </p>

            <p className="mt-2 text-3xl font-extrabold text-white">
              {scoredCount}
              <span className="text-lg text-[#A9CFC4]">/{rubric.length}</span>
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#80E0C4] transition-all duration-300"
                style={{
                  width: `${rubric.length ? (scoredCount / rubric.length) * 100 : 0}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[10px] text-[#D3E5E2]">Criteria scored</p>
          </div>
        </div>
      </section>

      {/* Weighted score summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#D8E9E1] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#16806E]">
            Weighted assessment
          </p>

          <div className="mt-3 flex items-end gap-2">
            <p className="font-display text-3xl font-extrabold text-[#173B35]">
              {weightedPercentage !== null
                ? `${weightedPercentage.toFixed(1)}%`
                : "—"}
            </p>

            <span className="mb-1 text-[10px] font-semibold text-slate-400">
              {weightedPercentage !== null
                ? "Provisional rubric result"
                : "Complete all scoring criteria"}
            </span>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            Based on the configured criterion weights. This is an assessment
            aid, not an automatic admission decision.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
            Rubric configuration
          </p>

          <p className="mt-3 text-2xl font-extrabold text-[#173B35]">
            {weightTotal}%
          </p>

          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            Total criterion weight. Production criteria and weights will be
            supplied by Admin.
          </p>
        </div>
      </section>

      {/* Conflict of interest declaration */}
      <section className="rounded-2xl border border-[#D8E9E1] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F0] text-[#176B59]">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#16806E]">
              Required reviewer declaration
            </p>

            <h2 className="mt-1 text-sm font-extrabold text-[#173B35]">
              Conflict of interest
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Before assessing this application, confirm that you have no
              personal, professional or other conflict that could affect your
              impartiality.
            </p>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-[#A9D6C6] hover:bg-[#F3F9F5]">
          <input
            type="checkbox"
            checked={conflictConfirmed}
            onChange={(event) => {
              setConflictConfirmed(event.target.checked);
              setNotice("");
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#176B59]"
          />

          <span className="text-xs font-semibold leading-5 text-slate-700">
            I confirm that I have no known conflict of interest with this
            applicant and can conduct an impartial assessment.
          </span>
        </label>

        {!conflictConfirmed && (
          <p className="mt-3 text-[10px] font-medium text-amber-700">
            Declaration required before an assessment can be submitted. If a
            conflict exists, do not proceed; request reassignment through the
            admission office.
          </p>
        )}

        {conflictConfirmed && (
          <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[#16806E]">
            <CheckCircle2 size={14} />
            No conflict declared in this preview session.
          </p>
        )}
      </section>

      {/* Assessment criteria */}
      {rubric.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-bold text-amber-900">
            No active evaluation rubric is configured
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Ask the Admin to configure an active rubric for this programme
            before you begin the assessment.
          </p>
        </div>
      ) : null}
      <section className="space-y-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16806E]">
            Assessment framework
          </p>

          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#173B35]">
            Evaluate each criterion
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Select a score from 0 to 10 and provide an observation supporting
            each assessment.
          </p>
        </div>

        {rubric.map((criterion, index) => {
          const currentScore = scores[criterion.id];
          const currentEvidence = evidence[criterion.id] || "";

          return (
            <motion.article
              key={criterion.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:z-30"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F0] text-sm font-extrabold text-[#176B59]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#173B35]">
                      {criterion.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {criterion.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                    Weight {criterion.weight}%
                  </span>

                  <span className="rounded-lg bg-[#EAF5F0] px-2.5 py-1.5 text-[10px] font-extrabold text-[#176B59]">
                    {currentScore === undefined
                      ? "Not scored"
                      : `${currentScore}/${criterion.maxScore}`}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Select score
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Maximum {criterion.maxScore}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(
                      { length: criterion.maxScore + 1 },
                      (_, score) => score,
                    ).map((score) => (
                      <button
                        key={score}
                        type="button"
                        aria-pressed={currentScore === score}
                        aria-label={`Score ${score} out of ${criterion.maxScore} for ${criterion.title}`}
                        onClick={() => updateScore(criterion.id, score)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#31977E]/20 ${
                          currentScore === score
                            ? "border-[#176B59] bg-[#176B59] text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#A9D6C6] hover:bg-[#F1F8F4] hover:text-[#176B59]"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`evidence-${criterion.id}`}
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"
                  >
                    Supporting observation
                  </label>

                  <textarea
                    id={`evidence-${criterion.id}`}
                    value={currentEvidence}
                    onChange={(event) =>
                      updateEvidence(criterion.id, event.target.value)
                    }
                    rows={3}
                    placeholder="Explain the evidence supporting this score..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#31977E] focus:bg-white focus:ring-2 focus:ring-[#31977E]/10"
                  />

                  <p className="mt-1.5 text-right text-[9px] text-slate-400">
                    {currentEvidence.length} characters
                  </p>
                </div>

                {/* Verified evidence reference */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileSearch size={14} className="text-[#16806E]" />

                    <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Supporting document reference
                    </label>

                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-400">
                      OPTIONAL
                    </span>
                  </div>

                  {verifiedSourceDocuments.length > 0 ? (
                    <CustomDropdown
                      label="Select verified document"
                      value={evidenceSources[criterion.id] || ""}
                      options={evidenceSourceOptions}
                      onChange={(value) => {
                        setEvidenceSources((previous) => ({
                          ...previous,
                          [criterion.id]: value,
                        }));

                        setNotice("");
                        setDraftNotice("");
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3">
                      <FileText size={15} className="shrink-0 text-slate-400" />

                      <p className="text-[10px] leading-5 text-slate-500">
                        No verified documents are available for reference yet.
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-[9px] leading-4 text-slate-400">
                    Link your observation to a verified academic document where
                    applicable. Only documents cleared by the Admission Officer
                    are available.
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* Overall assessment */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16806E]">
          Overall evaluation
        </p>

        <h2 className="mt-1 text-base font-extrabold text-[#173B35]">
          Assessment remarks
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Summarize the applicant's strengths, concerns and supporting
          observations.
        </p>

        <textarea
          value={overallRemarks}
          onChange={(event) => {
            setOverallRemarks(event.target.value);
            setDraftNotice("");
            setNotice("");
          }}
          rows={5}
          placeholder="Enter your overall assessment and explain the basis for your recommendation..."
          className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#31977E] focus:bg-white focus:ring-2 focus:ring-[#31977E]/10"
        />

        <div className="mt-2 flex justify-end">
          <span className="text-[9px] text-slate-400">
            {overallRemarks.length} characters
          </span>
        </div>
      </section>

      {/* Recommendation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16806E]">
          Evaluator recommendation
        </p>

        <h2 className="mt-1 text-base font-extrabold text-[#173B35]">
          What is your assessment outcome?
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          This is a recommendation for the next authorized decision-maker, not a
          final admission decision.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {recommendations.map((item) => {
            const selected = recommendation === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setRecommendation(item.value);
                  setDraftNotice("");
                  setNotice("");
                }}
                className={`rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#31977E]/20 ${
                  selected
                    ? "border-[#16806E] bg-[#EFF8F3] shadow-sm ring-1 ring-[#16806E]/20"
                    : "border-slate-200 bg-white hover:border-[#A9D6C6] hover:bg-[#FAFCFB]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs font-extrabold ${
                      selected ? "text-[#176B59]" : "text-slate-700"
                    }`}
                  >
                    {item.title}
                  </p>

                  {selected && (
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-[#16806E]"
                    />
                  )}
                </div>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pre-submission checklist */}
      <section className="rounded-2xl border border-[#D8E9E1] bg-[#F7FAF8] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#16806E]">
              Final review
            </p>

            <h2 className="mt-1 text-sm font-extrabold text-[#173B35]">
              Pre-submission checklist
            </h2>
          </div>

          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#176B59] ring-1 ring-[#D8E9E1]">
            {checklist.filter((item) => item.complete).length}/5 complete
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <CheckCircle2
                size={16}
                className={
                  item.complete
                    ? "shrink-0 text-[#16806E]"
                    : "shrink-0 text-slate-300"
                }
              />

              <span
                className={`text-[11px] font-medium ${
                  item.complete ? "text-[#176B59]" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {notice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800"
          >
            {notice}
          </div>
        )}

        {draftNotice && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-[#D8E9E1] bg-[#F1F8F4] p-3 text-[11px] leading-5 text-[#176B59]"
          >
            {draftNotice}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[10px] leading-5 text-slate-400">
            Save your assessment as a draft at any time after choosing a
            recommendation. Submission is permanent and moves the application to
            the final decision stage.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Save draft */}
            <button
              type="button"
              onClick={saveEvaluationDraft}
              disabled={isSavingDraft || isSubmitting || rubric.length === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-[#A9D6C6] hover:bg-[#F5FAF7] hover:text-[#176B59] focus:outline-none focus:ring-2 focus:ring-[#31977E]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingDraft ? "Saving..." : "Save draft"}
            </button>

            {/* Restore saved draft */}
            {savedDraft && (
              <button
                type="button"
                onClick={() => {
                  setScores({ ...savedDraft.scores });
                  setEvidence({ ...savedDraft.evidence });
                  setEvidenceSources({ ...savedDraft.evidenceSources });
                  setOverallRemarks(savedDraft.overallRemarks);
                  setRecommendation(savedDraft.recommendation);
                  setConflictConfirmed(savedDraft.conflictConfirmed);
                  setNotice("");

                  setDraftNotice(
                    "Previously saved preview draft restored successfully.",
                  );
                }}
                className="rounded-xl border border-[#CDE7DC] bg-[#F1F8F4] px-4 py-3 text-xs font-bold text-[#176B59] transition hover:bg-[#E3F2E9]"
              >
                <History size={14} className="mr-1.5 inline" />
                Restore saved draft
              </button>
            )}

            {/* Submit assessment */}
            <button
              type="button"
              disabled={!isReady || isSubmitting || rubric.length === 0}
              onClick={() => setShowSubmissionReview(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17474A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#102F35] focus:outline-none focus:ring-2 focus:ring-[#31977E]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ClipboardCheck size={15} />
              Submit assessment
            </button>
          </div>
        </div>
      </section>

      {/* Final assessment review modal */}
      <AnimatePresence>
        {showSubmissionReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F35]/60 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowSubmissionReview(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="assessment-review-title"
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-[#F8FAF9] shadow-2xl"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#102F35] px-5 py-4 text-white sm:px-6">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#80E0C4]">
                    Final verification
                  </p>

                  <h2
                    id="assessment-review-title"
                    className="mt-1 text-lg font-extrabold"
                  >
                    Review your assessment
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSubmissionReview(false)}
                  aria-label="Close assessment review"
                  className="rounded-xl border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-4 sm:p-6">
                {/* Preview warning */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />

                  <p className="text-[10px] leading-5 text-amber-800">
                    Final review preview only. Confirming here will not submit,
                    store or transmit an actual admission assessment.
                  </p>
                </div>

                {/* Applicant details */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#16806E]">
                    Applicant being assessed
                  </p>

                  <p className="mt-2 text-sm font-extrabold text-[#173B35]">
                    {applicantName}
                  </p>

                  <p className="mt-1 break-all text-[10px] text-slate-500">
                    {applicationId}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-600">{programme}</p>
                </div>

                {/* Overall score */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#D8E9E1] bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Weighted assessment
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-[#176B59]">
                      {weightedPercentage !== null
                        ? `${weightedPercentage.toFixed(1)}%`
                        : "Incomplete"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#D8E9E1] bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Completed criteria
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-[#173B35]">
                      {scoredCount}/{rubric.length}
                    </p>
                  </div>
                </div>

                {/* Criterion-by-criterion review */}
                <section>
                  <h3 className="text-xs font-extrabold text-[#173B35]">
                    Assessment breakdown
                  </h3>

                  <div className="mt-3 space-y-3">
                    {rubric.map((criterion, index) => {
                      const selectedSource = evidenceSourceOptions.find(
                        (source) =>
                          source.value === evidenceSources[criterion.id],
                      );

                      return (
                        <div
                          key={criterion.id}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-[#16806E]">
                                CRITERION {String(index + 1).padStart(2, "0")}
                              </p>

                              <p className="mt-1 text-xs font-extrabold text-slate-800">
                                {criterion.title}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-lg bg-[#EAF5F0] px-2.5 py-1.5 text-[10px] font-extrabold text-[#176B59]">
                              {scores[criterion.id] ?? "—"}/{criterion.maxScore}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Supporting observation
                              </p>

                              <p className="mt-1 whitespace-pre-wrap break-words text-[10px] leading-5 text-slate-600">
                                {evidence[criterion.id]?.trim() ||
                                  "Not provided"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Evidence document
                              </p>

                              <p className="mt-1 break-words text-[10px] leading-5 text-slate-600">
                                {selectedSource?.label ||
                                  "No document reference selected"}
                              </p>

                              <p className="mt-2 text-[9px] font-semibold text-slate-400">
                                Criterion weight: {criterion.weight}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Overall remarks */}
                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#16806E]">
                    Overall assessment remarks
                  </p>

                  <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-slate-600">
                    {overallRemarks.trim() || "No remarks provided"}
                  </p>
                </section>

                {/* Recommendation and declaration */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Recommendation
                    </p>

                    <p className="mt-2 text-xs font-extrabold capitalize text-[#176B59]">
                      {recommendations.find(
                        (item) => item.value === recommendation,
                      )?.title || "Not selected"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Conflict declaration
                    </p>

                    <p
                      className={`mt-2 text-xs font-extrabold ${
                        conflictConfirmed ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {conflictConfirmed ? "Confirmed" : "Not confirmed"}
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="rounded-xl border border-[#D8E9E1] bg-[#F1F8F4] p-4">
                  <p className="text-[10px] font-extrabold text-[#176B59]">
                    Readiness check
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className={
                            item.complete
                              ? "shrink-0 text-[#16806E]"
                              : "shrink-0 text-slate-300"
                          }
                        />

                        <span className="text-[10px] text-slate-600">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionReview(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Back to editing
                  </button>

                  <button
                    type="button"
                    disabled={!isReady || isSubmitting}
                    onClick={async () => {
                      if (isSubmitting) return;
                      setIsSubmitting(true);
                      setNotice("");
                      const submittedAssessment = {
                        id: `submission-${applicationId}-${Date.now()}`,
                        applicationId,
                        applicantName,
                        programmeName: programme,
                        submittedAt: new Date().toISOString(),
                        weightedPercentage,
                        recommendation,
                        overallRemarks,
                        conflictConfirmed,
                        rubric: rubric.map((criterion) => ({ ...criterion })),
                        scores: { ...scores },
                        evidence: { ...evidence },
                        evidenceSources: { ...evidenceSources },
                        verifiedDocuments: verifiedSourceDocuments.map(
                          (document) => ({ ...document }),
                        ),
                        isPreview,
                      };

                      try {
                        await onSubmitAssessment?.(submittedAssessment);
                        setCompletedAssessment(submittedAssessment);
                        setSavedDraft(null);
                        setShowSubmissionReview(false);
                        setDraftNotice("");
                        setNotice("");
                      } catch (error) {
                        setNotice(
                          error.message || "Unable to submit this assessment.",
                        );
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17474A] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#102F35] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <ShieldCheck size={15} />
                    {isSubmitting
                      ? "Submitting..."
                      : "Confirm and submit assessment"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ClarificationCentre({
  requests = [],
  previewRequests = [],
  applications = [],
  onCreateRequest,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newRequest, setNewRequest] = useState({
    applicationId: "",
    category: "Academic information",
    subject: "",
    description: "",
    priority: "NORMAL",
  });

  const availableApplications = applications.filter(
    (application) =>
      normalizeApplicationStatus(application.status) !== "submitted",
  );

  // Preview records stay separate from live records.
  const displayedRequests = showPreview ? previewRequests : requests;

  const filteredRequests = displayedRequests.filter((request) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      [
        request.applicantName,
        request.applicationId,
        request.subject,
        request.category,
        request.programmeName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));

    const matchesStatus =
      statusFilter === "all" ||
      (request.status || "").toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" ||
      (request.priority || "").toLowerCase() === priorityFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      (request.category || "").toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const totalRequests = displayedRequests.length;
  const awaitingCount = displayedRequests.filter(
    (request) => (request.status || "").toLowerCase() === "awaiting response",
  ).length;
  const highPriorityCount = displayedRequests.filter((request) =>
    ["high", "urgent"].includes((request.priority || "").toLowerCase()),
  ).length;
  const resolvedCount = displayedRequests.filter(
    (request) => (request.status || "").toLowerCase() === "resolved",
  ).length;

  const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Awaiting response", value: "awaiting response" },
    { label: "Response received", value: "response received" },
    { label: "Resolved", value: "resolved" },
  ];

  const priorityOptions = [
    { label: "All priorities", value: "all" },
    { label: "Low", value: "low" },
    { label: "Normal", value: "normal" },
    { label: "High", value: "high" },
  ];

  const categoryOptions = [
    { label: "All categories", value: "all" },
    { label: "Academic information", value: "academic information" },
    { label: "Document information", value: "document information" },
    { label: "Personal information", value: "personal information" },
    { label: "Other", value: "other" },
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  };

  const submitClarificationRequest = async (event) => {
    event.preventDefault();
    setCreateError("");

    if (!newRequest.applicationId) {
      setCreateError("Select an assigned application.");
      return;
    }
    if (newRequest.subject.trim().length < 3) {
      setCreateError("Enter a subject with at least 3 characters.");
      return;
    }
    if (newRequest.description.trim().length < 5) {
      setCreateError("Describe the information gap in at least 5 characters.");
      return;
    }

    setCreatingRequest(true);
    try {
      await onCreateRequest?.(Number(newRequest.applicationId), {
        category: newRequest.category,
        subject: newRequest.subject.trim(),
        description: newRequest.description.trim(),
        priority: newRequest.priority,
      });
      setNewRequest({
        applicationId: "",
        category: "Academic information",
        subject: "",
        description: "",
        priority: "NORMAL",
      });
      setShowCreateForm(false);
    } catch (error) {
      setCreateError(
        error.message || "Unable to create the clarification request.",
      );
    } finally {
      setCreatingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#29977D]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16806E]">
              Evaluator Workspace
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#102F35] sm:text-3xl">
            Clarification Centre
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track information gaps and clarification requests forwarded to the
            Admission Officer for review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showPreview && (
            <button
              type="button"
              onClick={() => {
                setCreateError("");
                setShowCreateForm((previous) => !previous);
                setNewRequest((previous) => ({
                  ...previous,
                  applicationId:
                    previous.applicationId ||
                    String(availableApplications[0]?.id || ""),
                }));
              }}
              disabled={availableApplications.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17474A] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#102F35] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText size={15} />
              {showCreateForm ? "Close request form" : "New clarification"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowPreview((previous) => !previous);
              resetFilters();
              setSelectedRequest(null);
              setShowCreateForm(false);
            }}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
              showPreview
                ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FileSearch size={15} />
            {showPreview ? "Exit Preview Mode" : "View Design Preview"}
          </button>
        </div>
      </div>

      {/* Preview warning */}
      {showPreview && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={19} />
          <div>
            <p className="text-xs font-bold text-amber-900">
              Design Preview — Sample Information
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              This is illustrative data for layout testing only. It is not a
              real applicant request and must not be used for admission
              decisions.
            </p>
          </div>
        </div>
      )}

      {!showPreview && showCreateForm && (
        <form
          onSubmit={submitClarificationRequest}
          className="rounded-2xl border border-[#D8E9E1] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#16806E]">
              New request
            </p>
            <h2 className="mt-1 text-base font-extrabold text-[#102F35]">
              Send an information gap to the Admission Officer
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This creates a clarification request for officer review. It does
              not submit or change the application stage.
            </p>
          </div>

          {createError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700"
            >
              {createError}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Assigned application
              </span>
              <select
                required
                value={newRequest.applicationId}
                onChange={(event) =>
                  setNewRequest((previous) => ({
                    ...previous,
                    applicationId: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
              >
                <option value="">Select an application</option>
                {availableApplications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {getApplicationIdentity(application)} ·{" "}
                    {getApplicationName(application)} ·{" "}
                    {getApplicationProgramme(application)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Category
              </span>
              <select
                value={newRequest.category}
                onChange={(event) =>
                  setNewRequest((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
              >
                <option>Academic information</option>
                <option>Document information</option>
                <option>Personal information</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Priority
              </span>
              <select
                value={newRequest.priority}
                onChange={(event) =>
                  setNewRequest((previous) => ({
                    ...previous,
                    priority: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Subject
              </span>
              <input
                required
                minLength={3}
                maxLength={180}
                value={newRequest.subject}
                onChange={(event) =>
                  setNewRequest((previous) => ({
                    ...previous,
                    subject: event.target.value,
                  }))
                }
                placeholder="e.g. Confirm academic record details"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Description
              </span>
              <textarea
                required
                minLength={5}
                maxLength={2000}
                rows={3}
                value={newRequest.description}
                onChange={(event) =>
                  setNewRequest((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Explain what needs to be checked by the Admission Officer."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setCreateError("");
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingRequest || availableApplications.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#17474A] px-5 text-xs font-bold text-white transition hover:bg-[#102F35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingRequest ? "Sending…" : "Send to Admission Officer"}
            </button>
          </div>
        </form>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "Total requests",
            value: totalRequests,
            icon: FileText,
            tone: "bg-[#E8F4F0] text-[#16806E]",
          },
          {
            label: "Awaiting response",
            value: awaitingCount,
            icon: Clock3,
            tone: "bg-amber-50 text-amber-700",
          },
          {
            label: "High priority",
            value: highPriorityCount,
            icon: Activity,
            tone: "bg-rose-50 text-rose-600",
          },
          {
            label: "Resolved",
            value: resolvedCount,
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-700",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  {stat.label}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon size={17} />
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tabular-nums text-[#102F35]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search applicant, application ID or subject..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[570px]">
            <CustomDropdown
              label="All statuses"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            <CustomDropdown
              label="All priorities"
              value={priorityFilter}
              options={priorityOptions}
              onChange={setPriorityFilter}
            />

            <CustomDropdown
              label="All categories"
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-[11px] text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filteredRequests.length}
            </span>{" "}
            of {totalRequests} requests
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-[#16806E] transition hover:text-[#102F35]"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Request list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#102F35]">
            Clarification requests
          </h2>
          <span className="text-[10px] font-medium text-slate-400">
            {showPreview ? "Preview records" : "Live records"}
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#16806E]">
              <Inbox size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#102F35]">
              {totalRequests === 0
                ? "No clarification requests yet"
                : "No matching requests"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              {totalRequests === 0
                ? "Use New clarification to flag an information gap on one of your active assignments."
                : "Try changing your search term or filters to find a request."}
            </p>

            {totalRequests > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-[#E8F4F0] px-4 py-2 text-xs font-bold text-[#16806E] transition hover:bg-[#D9EEE6]"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] transition hover:border-[#A9D6C6] hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#E8F4F0] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#16806E]">
                      {request.category}
                    </span>

                    <span
                      className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                        ["high", "urgent"].includes(
                          (request.priority || "").toLowerCase(),
                        )
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {request.priority || "Normal"} priority
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#102F35]">
                    {request.subject}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {request.applicantName} · {request.applicationId}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {request.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      Created: {request.createdAt || "Not available"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <UserRound size={12} />
                      Routed to: {request.assignedTo || "Admission Officer"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800">
                    {request.status || "Open"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#CDE5DB] bg-[#F2F8F5] px-3 text-[11px] font-bold text-[#176B5B] transition hover:border-[#29977D] hover:bg-[#E8F4F0]"
                  >
                    View details
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request details modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRequest(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F35]/45 p-3 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="clarification-detail-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16806E]">
                    Request details
                  </p>
                  <h2
                    id="clarification-detail-title"
                    className="mt-1 text-base font-bold text-[#102F35]"
                  >
                    {selectedRequest.subject}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  aria-label="Close request details"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="space-y-6 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Applicant
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#102F35]">
                      {selectedRequest.applicantName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Application ID
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#102F35]">
                      {selectedRequest.applicationId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedRequest.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedRequest.status}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Description
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-600">
                    {selectedRequest.description}
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <History size={16} className="text-[#16806E]" />
                    <h3 className="text-sm font-bold text-[#102F35]">
                      Request history
                    </h3>
                  </div>

                  {selectedRequest.history?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRequest.history.map((entry, index) => (
                        <div
                          key={`${entry.timestamp}-${index}`}
                          className="flex gap-3"
                        >
                          <div className="flex flex-col items-center">
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#29977D]" />
                            {index !== selectedRequest.history.length - 1 && (
                              <span className="mt-1 min-h-8 w-px flex-1 bg-[#CDE5DB]" />
                            )}
                          </div>

                          <div className="pb-2">
                            <p className="text-xs font-bold text-slate-700">
                              {entry.action}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {entry.actor} · {entry.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No history entries are available.
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-[#D8EAE2] bg-[#F3F8F5] p-3">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[#16806E]"
                  />
                  <p className="text-[10px] leading-5 text-slate-600">
                    Evaluators can flag information gaps and track requests.
                    Applicant communication and clarification handling remain
                    with the Admission Officer.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// DESIGN PREVIEW ONLY — illustrative submitted assessment.
const REVIEW_HISTORY_PREVIEW = [
  {
    id: "review-preview-01",
    applicationId: "PREVIEW-ONLY",
    applicantName: "Preview Applicant",
    programmeName: "Programme preview",
    submittedAt: "2026-10-21T10:30:00",
    weightedPercentage: 82.5,
    recommendation: "recommended",
    overallRemarks:
      "Illustrative assessment. The applicant demonstrates a consistent academic record and relevant preparation for the selected programme.",
    conflictConfirmed: true,

    rubric: EVALUATION_RUBRIC_PREVIEW,

    scores: {
      "academic-performance": 8,
      "subject-relevance": 9,
      "programme-suitability": 8,
      "supporting-information": 8,
    },

    evidence: {
      "academic-performance":
        "The applicant demonstrates a good academic record in the previous qualifying examination.",
      "subject-relevance":
        "Previous subjects show relevant preparation for the selected programme.",
      "programme-suitability":
        "The academic background appears suitable for the programme requirements.",
      "supporting-information":
        "The available supporting information is consistent with the academic records.",
    },

    evidenceSources: {
      "academic-performance": "0-preview-document-1",
      "subject-relevance": "1-preview-document-2",
      "programme-suitability": "1-preview-document-2",
      "supporting-information": "0-preview-document-1",
    },

    verifiedDocuments: [
      {
        id: "preview-document-1",
        documentType: "12th / PUC marks card",
      },
      {
        id: "preview-document-2",
        documentType: "10th marks card",
      },
    ],
  },
];

function ReviewHistory({ reviews = [], previewReviews = [] }) {
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);

  // Preview records never get mixed with live submitted reviews.
  const displayedReviews = showPreview ? previewReviews : reviews;

  const recommendationOptions = [
    { label: "All recommendations", value: "all" },
    { label: "Recommended", value: "recommended" },
    { label: "Needs clarification", value: "clarification" },
    { label: "Not recommended", value: "not_recommended" },
  ];

  const recommendationLabels = {
    recommended: "Recommended",
    clarification: "Needs clarification",
    not_recommended: "Not recommended",
  };

  const filteredReviews = displayedReviews
    .filter((review) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        [
          review.applicantName,
          review.applicationId,
          review.programmeName,
          review.overallRemarks,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));

      const matchesRecommendation =
        recommendationFilter === "all" ||
        review.recommendation === recommendationFilter;

      return matchesSearch && matchesRecommendation;
    })
    .sort(
      (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0),
    );

  const totalReviews = displayedReviews.length;

  const recommendedCount = displayedReviews.filter(
    (review) => review.recommendation === "recommended",
  ).length;

  const clarificationCount = displayedReviews.filter(
    (review) => review.recommendation === "clarification",
  ).length;

  const notRecommendedCount = displayedReviews.filter(
    (review) => review.recommendation === "not_recommended",
  ).length;

  const scoredReviews = displayedReviews.filter((review) =>
    Number.isFinite(Number(review.weightedPercentage)),
  );

  const averageScore =
    scoredReviews.length > 0
      ? (
          scoredReviews.reduce(
            (total, review) => total + Number(review.weightedPercentage),
            0,
          ) / scoredReviews.length
        ).toFixed(1)
      : "—";

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRecommendationStyle = (value) => {
    switch (value) {
      case "recommended":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "clarification":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "not_recommended":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRecommendationFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#29977D]" />

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16806E]">
              Evaluator Workspace
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#102F35] sm:text-3xl">
            Review History
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Access your previously submitted assessments, review scores and
            recommendations, and inspect the evidence recorded for each
            application.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowPreview((previous) => !previous);
            resetFilters();
            setSelectedReview(null);
          }}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
            showPreview
              ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "bg-[#17474A] text-white shadow-sm hover:bg-[#102F35]"
          }`}
        >
          <History size={15} />
          {showPreview ? "Exit Preview Mode" : "View Design Preview"}
        </button>
      </div>

      {/* Preview warning */}
      {showPreview && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={19} />

          <div>
            <p className="text-xs font-bold text-amber-900">
              Design Preview — Sample Assessment
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              This record is illustrative information for layout testing only.
              It is not a real submitted assessment and must not be used for
              admission decisions.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "Submitted reviews",
            value: totalReviews,
            icon: FileText,
            tone: "bg-[#E8F4F0] text-[#16806E]",
          },
          {
            label: "Recommended",
            value: recommendedCount,
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Needs clarification",
            value: clarificationCount,
            icon: Clock3,
            tone: "bg-amber-50 text-amber-700",
          },
          {
            label: "Average score",
            value: averageScore === "—" ? "—" : `${averageScore}%`,
            icon: Activity,
            tone: "bg-violet-50 text-violet-700",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  {stat.label}
                </p>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon size={17} />
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tabular-nums text-[#102F35]">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search applicant, application ID or programme..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
            />
          </div>

          <div className="w-full sm:w-64">
            <CustomDropdown
              label="All recommendations"
              value={recommendationFilter}
              options={recommendationOptions}
              onChange={setRecommendationFilter}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-[11px] text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {filteredReviews.length}
            </span>{" "}
            of {totalReviews} submitted reviews
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-[#16806E] transition hover:text-[#102F35]"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#102F35]">
            Submitted assessments
          </h2>

          <span className="text-[10px] font-medium text-slate-400">
            {showPreview ? "Preview records" : "Live records"}
          </span>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#16806E]">
              <History size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#102F35]">
              {totalReviews === 0
                ? "No submitted reviews yet"
                : "No matching assessments"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              {totalReviews === 0
                ? "Your submitted assessments will appear here once review history is connected to the backend."
                : "Try changing your search term or recommendation filter."}
            </p>

            {totalReviews > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-[#E8F4F0] px-4 py-2 text-xs font-bold text-[#16806E] transition hover:bg-[#D9EEE6]"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] transition hover:border-[#A9D6C6] hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#E8F4F0] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#16806E]">
                      Submitted assessment
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${getRecommendationStyle(
                        review.recommendation,
                      )}`}
                    >
                      {recommendationLabels[review.recommendation] ||
                        "Recommendation unavailable"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#102F35]">
                    {review.applicantName || "Applicant"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {review.applicationId || "Application ID unavailable"}
                    {" · "}
                    {review.programmeName || "Programme unavailable"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      Submitted: {formatDate(review.submittedAt)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <ClipboardCheck size={12} />
                      {review.rubric?.length || 0} assessment criteria
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-3 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Weighted score
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-[#176B59]">
                      {Number.isFinite(Number(review.weightedPercentage))
                        ? `${Number(review.weightedPercentage).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReview(review)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#CDE5DB] bg-[#F2F8F5] px-3 text-[11px] font-bold text-[#176B5B] transition hover:border-[#29977D] hover:bg-[#E8F4F0]"
                  >
                    View assessment
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Read-only assessment detail modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReview(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F35]/55 p-3 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-history-detail-title"
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#F8FAF9] shadow-2xl"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#102F35] px-5 py-4 text-white sm:px-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#80E0C4]">
                    Submitted assessment · Read only
                  </p>

                  <h2
                    id="review-history-detail-title"
                    className="mt-1 text-lg font-bold"
                  >
                    Assessment details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  aria-label="Close assessment details"
                  className="rounded-xl border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-4 sm:p-6">
                {/* Preview warning */}
                {showPreview && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">
                    Preview data only. This assessment is illustrative and is
                    not a real submission.
                  </div>
                )}

                {/* Applicant details */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#16806E]">
                    Applicant assessed
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#102F35]">
                    {selectedReview.applicantName}
                  </p>

                  <p className="mt-1 break-all text-[10px] text-slate-500">
                    {selectedReview.applicationId}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-600">
                    {selectedReview.programmeName}
                  </p>
                </div>

                {/* Score and recommendation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#D8E9E1] bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Weighted assessment
                    </p>

                    <p className="mt-2 text-2xl font-extrabold text-[#176B59]">
                      {Number.isFinite(
                        Number(selectedReview.weightedPercentage),
                      )
                        ? `${Number(selectedReview.weightedPercentage).toFixed(
                            1,
                          )}%`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#D8E9E1] bg-white p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Recommendation
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${getRecommendationStyle(
                        selectedReview.recommendation,
                      )}`}
                    >
                      {recommendationLabels[selectedReview.recommendation] ||
                        "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Assessment breakdown */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-[#16806E]" />

                    <h3 className="text-xs font-bold text-[#102F35]">
                      Assessment breakdown
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {(selectedReview.rubric || []).map((criterion, index) => {
                      const sourceValue =
                        selectedReview.evidenceSources?.[criterion.id];

                      const sourceIndex =
                        selectedReview.verifiedDocuments?.findIndex(
                          (document, documentIndex) =>
                            String(document.id || document.documentId || "") ===
                              String(sourceValue) ||
                            `${documentIndex}-${
                              document.id || document.documentId || "document"
                            }` === sourceValue,
                        ) ?? -1;

                      const sourceDocument =
                        sourceIndex >= 0
                          ? selectedReview.verifiedDocuments[sourceIndex]
                          : null;

                      const sourceLabel = sourceDocument
                        ? sourceDocument.documentType ||
                          sourceDocument.name ||
                          sourceDocument.title ||
                          "Verified document"
                        : sourceValue
                          ? "Document reference recorded"
                          : "No document reference selected";

                      return (
                        <div
                          key={criterion.id}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#16806E]">
                                Criterion {String(index + 1).padStart(2, "0")}
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-800">
                                {criterion.title}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Weight: {criterion.weight}%
                              </p>
                            </div>

                            <span className="shrink-0 rounded-lg bg-[#EAF5F0] px-3 py-1.5 text-[11px] font-extrabold text-[#176B59]">
                              {selectedReview.scores?.[criterion.id] ?? "—"}/
                              {criterion.maxScore}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Supporting observation
                              </p>

                              <p className="mt-1 whitespace-pre-wrap break-words text-[10px] leading-5 text-slate-600">
                                {selectedReview.evidence?.[criterion.id] ||
                                  "Not provided"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                Evidence document
                              </p>

                              <p className="mt-1 break-words text-[10px] leading-5 text-slate-600">
                                {sourceLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {(!selectedReview.rubric ||
                      selectedReview.rubric.length === 0) && (
                      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-xs text-slate-400">
                        Assessment criteria are unavailable for this record.
                      </p>
                    )}
                  </div>
                </section>

                {/* Overall remarks */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Overall assessment remarks
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-600">
                    {selectedReview.overallRemarks || "No remarks recorded."}
                  </p>
                </div>

                {/* Declaration */}
                <div className="flex items-start gap-2 rounded-xl border border-[#D8EAE2] bg-[#F3F8F5] p-3">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[#16806E]"
                  />

                  <div>
                    <p className="text-[10px] font-bold text-[#176B59]">
                      Conflict of interest declaration
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {selectedReview.conflictConfirmed
                        ? "Declaration confirmed at submission."
                        : "Declaration confirmation is not recorded."}
                    </p>
                  </div>
                </div>

                {/* Role boundary */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] leading-5 text-slate-500">
                    This page displays the evaluator's submitted recommendation.
                    The final admission decision remains with the authorized
                    Admission Officer / Admin workflow.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MyAnalytics({ reviews = [], previewReviews = [] }) {
  const [showPreview, setShowPreview] = useState(false);

  // Use either live submitted reviews or isolated preview records.
  const analyticsReviews = showPreview ? previewReviews : reviews;

  const validScoreReviews = analyticsReviews.filter(
    (review) =>
      review.weightedPercentage !== null &&
      review.weightedPercentage !== undefined &&
      Number.isFinite(Number(review.weightedPercentage)),
  );

  const averageScore =
    validScoreReviews.length > 0
      ? validScoreReviews.reduce(
          (total, review) => total + Number(review.weightedPercentage),
          0,
        ) / validScoreReviews.length
      : null;

  const recommendationConfig = [
    {
      value: "recommended",
      label: "Recommended",
      description: "Positive evaluator recommendations",
      color: "bg-emerald-500",
      text: "text-emerald-700",
      background: "bg-emerald-50",
    },
    {
      value: "clarification",
      label: "Needs clarification",
      description: "Further information required",
      color: "bg-amber-500",
      text: "text-amber-700",
      background: "bg-amber-50",
    },
    {
      value: "not_recommended",
      label: "Not recommended",
      description: "Negative evaluator recommendations",
      color: "bg-rose-500",
      text: "text-rose-700",
      background: "bg-rose-50",
    },
  ];

  const recommendationStats = recommendationConfig.map((item) => {
    const count = analyticsReviews.filter(
      (review) => review.recommendation === item.value,
    ).length;

    return {
      ...item,
      count,
      percentage:
        analyticsReviews.length > 0
          ? (count / analyticsReviews.length) * 100
          : 0,
    };
  });

  const recommendationChartColors = {
    recommended: "#10B981",
    clarification: "#F59E0B",
    not_recommended: "#F43F5E",
  };

  let donutProgress = 0;

  const donutSegments = recommendationStats.map((item) => {
    const start = donutProgress;
    donutProgress += item.percentage;

    return `${recommendationChartColors[item.value]} ${start}% ${donutProgress}%`;
  });

  if (donutProgress < 100) {
    donutSegments.push(`#E2E8F0 ${donutProgress}% 100%`);
  }

  const donutBackground =
    analyticsReviews.length > 0
      ? `conic-gradient(${donutSegments.join(", ")})`
      : "#E2E8F0";

  const criterionChartColors = [
    "#0F766E",
    "#8B5CF6",
    "#F59E0B",
    "#0EA5E9",
    "#EC4899",
    "#64748B",
  ];

  const recommendedCount = analyticsReviews.filter(
    (review) => review.recommendation === "recommended",
  ).length;

  const recommendedPercentage =
    analyticsReviews.length > 0
      ? (recommendedCount / analyticsReviews.length) * 100
      : null;

  // Calculate average performance for each assessment criterion.
  const criterionBuckets = new Map();

  analyticsReviews.forEach((review) => {
    (review.rubric || []).forEach((criterion) => {
      const rawScore = review.scores?.[criterion.id];
      const maxScore = Number(criterion.maxScore);

      if (
        rawScore === null ||
        rawScore === undefined ||
        !Number.isFinite(Number(rawScore)) ||
        !Number.isFinite(maxScore) ||
        maxScore <= 0
      ) {
        return;
      }

      if (!criterionBuckets.has(criterion.id)) {
        criterionBuckets.set(criterion.id, {
          id: criterion.id,
          title: criterion.title,
          totalPercentage: 0,
          count: 0,
        });
      }

      const bucket = criterionBuckets.get(criterion.id);

      bucket.totalPercentage += (Number(rawScore) / maxScore) * 100;

      bucket.count += 1;
    });
  });

  const criterionPerformance = Array.from(criterionBuckets.values())
    .map((criterion) => ({
      ...criterion,
      averagePercentage:
        criterion.count > 0 ? criterion.totalPercentage / criterion.count : 0,
    }))
    .sort((a, b) => b.averagePercentage - a.averagePercentage);

  // Recent submitted assessments.
  const recentReviews = [...analyticsReviews].sort(
    (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0),
  );

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const recommendationLabels = {
    recommended: "Recommended",
    clarification: "Needs clarification",
    not_recommended: "Not recommended",
  };

  const getRecommendationStyle = (value) => {
    switch (value) {
      case "recommended":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "clarification":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "not_recommended":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#29977D]" />

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16806E]">
              Evaluator Workspace
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#102F35] sm:text-3xl">
            My Analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Understand your assessment activity, recommendation distribution and
            criterion-wise scoring performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview((previous) => !previous)}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
            showPreview
              ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "bg-[#17474A] text-white shadow-sm hover:bg-[#102F35]"
          }`}
        >
          <ChartNoAxesCombined size={15} />
          {showPreview ? "Exit Preview Mode" : "View Design Preview"}
        </button>
      </div>

      {/* Preview warning */}
      {showPreview && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={19} />

          <div>
            <p className="text-xs font-bold text-amber-900">
              Design Preview — Illustrative Analytics
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              These figures are calculated from sample assessment data for
              layout testing only. They are not actual evaluator performance
              statistics.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: "Reviews completed",
            value: analyticsReviews.length,
            helper: "Submitted assessments",
            icon: FileText,
            tone: "bg-[#E8F4F0] text-[#16806E]",
          },
          {
            label: "Average score",
            value: averageScore !== null ? `${averageScore.toFixed(1)}%` : "—",
            helper: "Average weighted score",
            icon: Activity,
            tone: "bg-violet-50 text-violet-700",
          },
          {
            label: "Recommended",
            value:
              recommendedPercentage !== null
                ? `${recommendedPercentage.toFixed(1)}%`
                : "—",
            helper: "Share of submitted reviews",
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Needs clarification",
            value:
              recommendationStats.find((item) => item.value === "clarification")
                ?.count ?? 0,
            helper: "Further information required",
            icon: Clock3,
            tone: "bg-amber-50 text-amber-700",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  {stat.label}
                </p>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon size={17} />
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tabular-nums text-[#102F35]">
                {stat.value}
              </p>

              <p className="mt-1 text-[10px] text-slate-400">{stat.helper}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics panels */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Recommendation donut chart */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16806E]">
                Assessment outcomes
              </p>

              <h2 className="mt-1 text-base font-bold text-[#102F35]">
                Recommendation distribution
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Distribution of submitted recommendations
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F0] text-[#16806E]">
              <ChartNoAxesCombined size={18} />
            </span>
          </div>

          {analyticsReviews.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#16806E]">
                <Activity size={22} />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-600">
                No recommendation data available
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Analytics will appear after assessments are submitted.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid items-center gap-7 sm:grid-cols-[190px_minmax(0,1fr)]">
              {/* Donut */}
              <div
                className="relative mx-auto h-44 w-44 rounded-full p-3 shadow-[0_8px_25px_rgba(15,23,42,0.08)]"
                style={{ background: donutBackground }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full border-[5px] border-white bg-white shadow-inner">
                  <p className="text-3xl font-extrabold tracking-tight text-[#102F35]">
                    {analyticsReviews.length}
                  </p>

                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Total reviews
                  </p>

                  <div className="mt-2 h-1 w-8 rounded-full bg-[#80E0C4]" />
                </div>
              </div>

              {/* Donut legend */}
              <div className="min-w-0 space-y-5">
                {recommendationStats.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            recommendationChartColors[item.value],
                        }}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-700">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-extrabold tabular-nums text-[#102F35]">
                        {item.count}
                      </p>

                      <p className="text-[10px] font-medium text-slate-400">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 border-t border-slate-100 pt-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#29977D]" />

            <p className="text-[10px] text-slate-400">
              Based on submitted evaluator recommendations
            </p>
          </div>
        </section>

        {/* Criterion performance column chart */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16806E]">
                Scoring insights
              </p>

              <h2 className="mt-1 text-base font-bold text-[#102F35]">
                Criterion performance
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Average score achieved per assessment criterion
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F0] text-[#16806E]">
              <Activity size={18} />
            </span>
          </div>

          {criterionPerformance.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#16806E]">
                <ChartNoAxesCombined size={22} />
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-600">
                No scoring data available
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Criterion analytics will appear after assessments are scored.
              </p>
            </div>
          ) : (
            <div className="mt-7">
              {/* Chart area */}
              <div className="flex gap-2">
                {/* Y-axis labels */}
                <div className="flex h-48 w-7 shrink-0 flex-col justify-between pb-0 text-right text-[9px] font-medium tabular-nums text-slate-400">
                  {[100, 75, 50, 25, 0].map((tick) => (
                    <span key={tick}>{tick}</span>
                  ))}
                </div>

                {/* Plot */}
                <div className="relative h-48 min-w-0 flex-1">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map((tick) => (
                      <div
                        key={tick}
                        className="w-full border-t border-dashed border-slate-200"
                      />
                    ))}
                  </div>

                  {/* Vertical bars */}
                  <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">
                    {criterionPerformance.map((criterion, index) => {
                      const score = Math.max(
                        0,
                        Math.min(100, criterion.averagePercentage),
                      );

                      const barColor =
                        criterionChartColors[
                          index % criterionChartColors.length
                        ];

                      return (
                        <div
                          key={criterion.id}
                          className="relative flex h-full min-w-0 flex-1 items-end justify-center"
                          title={`${criterion.title}: ${score.toFixed(1)}%`}
                        >
                          {/* Value label */}
                          <span
                            className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-1.5 py-1 text-[9px] font-extrabold tabular-nums text-[#102F35] shadow-sm"
                            style={{
                              left: "50%",
                              bottom: `calc(${Math.min(score, 90)}% + 7px)`,
                            }}
                          >
                            {score.toFixed(0)}%
                          </span>

                          {/* Bar */}
                          <div
                            className="w-full max-w-12 rounded-t-xl shadow-[0_4px_12px_rgba(15,23,42,0.10)] transition-all duration-700"
                            style={{
                              height: `${score}%`,
                              minHeight: score > 0 ? "4px" : "0px",
                              background: `linear-gradient(180deg, ${barColor}, ${barColor}B8)`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-axis labels */}
              <div
                className="mt-3 grid gap-2 border-t border-slate-100 pt-3"
                style={{
                  gridTemplateColumns: `repeat(${criterionPerformance.length}, minmax(0, 1fr))`,
                }}
              >
                {criterionPerformance.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="min-w-0 text-center"
                    title={criterion.title}
                  >
                    <span
                      className="mx-auto mb-1 block h-1.5 w-5 rounded-full"
                      style={{
                        backgroundColor:
                          criterionChartColors[
                            index % criterionChartColors.length
                          ],
                      }}
                    />

                    <p className="line-clamp-2 break-words text-[9px] font-semibold leading-4 text-slate-500">
                      {criterion.title}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-[10px] text-slate-400">
                  Average score across scored reviews
                </p>

                <span className="rounded-lg bg-[#E8F4F0] px-2.5 py-1 text-[9px] font-bold text-[#176B59]">
                  Scale: 0–100%
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Recent assessment activity */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16806E]">
              Assessment records
            </p>

            <h2 className="mt-1 text-base font-bold text-[#102F35]">
              Recent submissions
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Your latest submitted assessments
            </p>
          </div>

          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F0] text-[#16806E]">
            <CalendarDays size={18} />
          </span>
        </div>

        {recentReviews.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F4F0] text-[#16806E]">
              <History size={22} />
            </div>

            <h3 className="mt-3 text-sm font-bold text-[#102F35]">
              No assessment activity yet
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Submitted assessments will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {recentReviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#102F35]">
                    {review.applicantName || "Applicant"}
                  </p>

                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {review.applicationId || "Application ID unavailable"}
                    {" · "}
                    {review.programmeName || "Programme unavailable"}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Submitted {formatDate(review.submittedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${getRecommendationStyle(
                      review.recommendation,
                    )}`}
                  >
                    {recommendationLabels[review.recommendation] ||
                      "Unavailable"}
                  </span>

                  <p className="text-xs font-extrabold tabular-nums text-[#176B59]">
                    {review.weightedPercentage !== null &&
                    review.weightedPercentage !== undefined &&
                    Number.isFinite(Number(review.weightedPercentage))
                      ? `${Number(review.weightedPercentage).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data interpretation note */}
      <div className="flex items-start gap-2 rounded-xl border border-[#D8EAE2] bg-[#F3F8F5] p-4">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#16806E]" />

        <p className="text-[10px] leading-5 text-slate-600">
          Analytics are calculated from submitted evaluator assessments only.
          Drafts, pending applications and final admission decisions are not
          included. These statistics describe assessment activity and do not
          determine admission outcomes.
        </p>
      </div>
    </div>
  );
}

function EvaluationAssignmentQueue({ applications = [], onOpen, onPreview }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");

  const programmeOptions = [
    ...new Set(
      applications
        .map((application) => getApplicationProgramme(application))
        .filter((programme) => programme !== "Programme not specified"),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const filteredApplications = applications.filter((application) => {
    const searchableText = [
      getApplicationName(application),
      getApplicationIdentity(application),
      getApplicationProgramme(application),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      searchQuery.trim().toLowerCase(),
    );

    const matchesStatus =
      statusFilter === "all" ||
      normalizeApplicationStatus(application.status) === statusFilter;

    const matchesProgramme =
      programmeFilter === "all" ||
      getApplicationProgramme(application) === programmeFilter;

    return matchesSearch && matchesStatus && matchesProgramme;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setProgrammeFilter("all");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page introduction */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#29977D]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#16806E]">
            Evaluator Workspace
          </p>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#102F35] sm:text-3xl">
          Evaluation Studio
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Select an application assigned to you and begin its academic
          assessment using the approved evaluation rubric.
        </p>
      </div>

      {/* Assignment notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#D8E9E1] bg-[#F1F8F4] p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#16806E]" />

        <div>
          <p className="text-xs font-bold text-[#176B59]">
            Assignment-based evaluation
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            Only applications assigned to your evaluator account are available
            here. Document verification and final admission decisions remain
            with their authorized roles.
          </p>
        </div>
      </div>

      {/* Assignment count */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold text-slate-500">
            Assigned applications
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#102F35]">
            {applications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold text-slate-500">
            Awaiting review
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#102F35]">
            {
              applications.filter(
                (application) =>
                  normalizeApplicationStatus(application.status) ===
                  "awaiting review",
              ).length
            }
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1">
          <p className="text-[10px] font-semibold text-slate-500">
            In progress
          </p>

          <p className="mt-2 text-2xl font-extrabold text-[#102F35]">
            {
              applications.filter(
                (application) =>
                  normalizeApplicationStatus(application.status) ===
                  "in progress",
              ).length
            }
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#102F35]">
            Find an application
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Search and filter your assigned assessment workload.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative block">
            <span className="sr-only">Search assigned applications</span>

            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search applicant or application ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#29977D] focus:ring-2 focus:ring-[#29977D]/10"
            />
          </label>

          <CustomDropdown
            label="All review statuses"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All review statuses" },
              ...APPLICATION_STATUS_OPTIONS,
            ]}
          />

          <CustomDropdown
            label="All programmes"
            value={programmeFilter}
            onChange={setProgrammeFilter}
            options={[
              { value: "all", label: "All programmes" },
              ...programmeOptions.map((programme) => ({
                value: programme,
                label: programme,
              })),
            ]}
          />
        </div>

        <div className="mt-4 flex justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-[10px] text-slate-400">
            Showing {filteredApplications.length} of {applications.length}
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-bold text-[#16806E] hover:text-[#102F35]"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Assigned application list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#102F35]">
            Applications available for evaluation
          </h2>

          <span className="text-[10px] text-slate-400">
            {filteredApplications.length} records
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F4F0] text-[#16806E]">
              <ClipboardCheck size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#102F35]">
              No applications assigned yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              Applications will appear here after the Admission Officer assigns
              them to your evaluator account.
            </p>

            <button
              type="button"
              onClick={onPreview}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#17474A] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#102F35]"
            >
              <FileSearch size={15} />
              Open Evaluation Preview
            </button>

            <p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Design preview · Sample information only
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching applications"
            description="Try changing your search text or filters."
          />
        ) : (
          filteredApplications.map((application, index) => {
            const status = getApplicationStatusMeta(application.status);
            const priority = getPriorityMeta(application.priority);
            const overdue = isApplicationOverdue(application);

            return (
              <article
                key={
                  application.id ||
                  application.applicationId ||
                  application.applicationNumber ||
                  index
                }
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#A9D6C6] hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ring-1 ${status.className}`}
                      >
                        {status.label}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ring-1 ${priority.className}`}
                      >
                        {priority.label} priority
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-[#102F35]">
                      {getApplicationName(application)}
                    </h3>

                    <p className="mt-1 break-all text-[10px] text-slate-400">
                      {getApplicationIdentity(application)}
                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-600">
                      {getApplicationProgramme(application)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        Assigned:{" "}
                        {formatApplicationDate(application.assignedAt)}
                      </span>

                      <span
                        className={`flex items-center gap-1.5 ${
                          overdue ? "font-bold text-rose-600" : ""
                        }`}
                      >
                        <Clock3 size={12} />
                        Deadline: {formatApplicationDate(application.dueDate)}
                        {overdue ? " · Overdue" : ""}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpen?.(application)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17474A] px-5 text-xs font-bold text-white transition hover:bg-[#102F35]"
                  >
                    <ClipboardCheck size={15} />
                    Open Evaluation
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>
    </motion.div>
  );
}

function EvaluatorDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = usePersistedDashboardSection(
    "credifit_evaluator_active_section",
  );
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDossierPreview, setIsDossierPreview] = useState(false);
  const [showEvaluationStudio, setShowEvaluationStudio] = useState(false);
  const [evaluationDrafts, setEvaluationDrafts] = useState({});
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState({
    assignedApplications: 0,
    awaitingReview: 0,
    inProgressReviews: 0,
    submittedReviews: 0,
    upcomingDeadlines: [],
  });
  const [dashboardData, setDashboardData] = useState({
    assignedApplications: [],
    pendingReviews: [],
    inProgressReviews: [],
    submittedReviews: [],
    upcomingDeadlines: [],
    recentActivity: [],
    clarificationRequests: [],
  });
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionPreviewReviews, setSessionPreviewReviews] = useState([]);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("credifit_user") || "{}");
    } catch {
      return {};
    }
  })();
  const displayName = profile?.fullName || storedUser.fullName || "Evaluator";
  const displayEmail = profile?.email || storedUser.email || "";
  const profileUserId =
    profile?.id || storedUser.id || storedUser.userId || "evaluator";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeSection, selectedApplication]);

  const greeting = getGreeting();

  const loadEvaluatorWorkspace = useCallback(async (showLoader = false) => {
    if (showLoader) setWorkspaceLoading(true);
    setWorkspaceError("");

    const endpoints = [
      ["assignments", "/evaluator/assignments"],
      ["clarifications", "/evaluator/clarifications"],
      ["reviews", "/evaluator/reviews"],
      ["summary", "/dashboard/summary"],
      ["notifications", "/notifications?limit=50"],
      ["profile", "/profile/me"],
    ];
    const results = await Promise.allSettled(
      endpoints.map(([, path]) => apiRequest(path)),
    );
    const loaded = {};
    const failures = [];

    results.forEach((result, index) => {
      const [key] = endpoints[index];
      if (result.status === "fulfilled") {
        loaded[key] = unwrapApiResponse(result.value);
      } else {
        loaded[key] = null;
        failures.push(`${key}: ${result.reason?.message || "Unable to load"}`);
      }
    });

    const assignments = Array.isArray(loaded.assignments)
      ? loaded.assignments
      : [];
    const normalizedAssignments = assignments.map((application) => ({
      ...application,
      status: toUiReviewStatus(application.reviewStatus),
      priority: application.priority || "normal",
    }));

    const reviews = (Array.isArray(loaded.reviews) ? loaded.reviews : []).map(
      (review) => ({
        ...review,
        recommendation: toUiRecommendation(review.recommendation),
        overallRemarks: review.remarks || review.overallRemarks || "",
        submittedAt: review.submittedAt || review.updatedAt || null,
        weightedPercentage:
          review.weightedPercentage === null ||
          review.weightedPercentage === undefined
            ? null
            : Number(review.weightedPercentage),
        rubric: Array.isArray(review.rubric) ? review.rubric : [],
        scores:
          review.scores && typeof review.scores === "object"
            ? review.scores
            : {},
      }),
    );

    const clarifications = (
      Array.isArray(loaded.clarifications) ? loaded.clarifications : []
    ).map((request) => {
      const status = String(request.status || "").toUpperCase();
      const statusLabel =
        {
          OPEN_FOR_OFFICER: "awaiting response",
          WAITING_FOR_APPLICANT: "awaiting response",
          RESPONSE_RECEIVED: "response received",
          READY_FOR_REVIEW: "response received",
          RESOLVED: "resolved",
          CLOSED: "resolved",
        }[status] ||
        String(request.status || "awaiting response")
          .toLowerCase()
          .replace(/_/g, " ");
      return {
        ...request,
        applicationId: request.applicationNumber || request.applicationId,
        status: statusLabel,
        priority: String(request.priority || "normal").toLowerCase(),
      };
    });

    const summary = loaded.summary || {};
    const normalizedSummary = {
      assignedApplications: Number(
        summary.assignedApplications || normalizedAssignments.length || 0,
      ),
      awaitingReview: Number(summary.awaitingReview || 0),
      inProgressReviews: Number(summary.inProgressReviews || 0),
      submittedReviews: Number(summary.submittedReviews || 0),
      upcomingDeadlines: Array.isArray(summary.upcomingDeadlines)
        ? summary.upcomingDeadlines
        : [],
    };

    setDashboardSummary(normalizedSummary);
    setDashboardData({
      assignedApplications: normalizedAssignments,
      pendingReviews: normalizedAssignments.filter(
        (item) => item.status === "awaiting review",
      ),
      inProgressReviews: normalizedAssignments.filter(
        (item) => item.status === "in progress",
      ),
      submittedReviews: reviews.filter(
        (item) => String(item.status || "").toUpperCase() === "SUBMITTED",
      ),
      upcomingDeadlines: normalizedSummary.upcomingDeadlines,
      recentActivity: reviews
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.submittedAt || 0) -
            new Date(a.updatedAt || a.submittedAt || 0),
        ),
      clarificationRequests: clarifications,
    });

    if (loaded.profile && typeof loaded.profile === "object")
      setProfile(loaded.profile);

    const notificationData = loaded.notifications || {};
    setNotifications(
      Array.isArray(notificationData.items) ? notificationData.items : [],
    );
    setUnreadCount(Number(notificationData.unreadCount || 0));

    if (failures.length) {
      setWorkspaceError(
        `Some evaluator data could not be loaded (${failures.join("; ")}). Use refresh to try again.`,
      );
    }
    if (showLoader) setWorkspaceLoading(false);
  }, []);

  useEffect(() => {
    loadEvaluatorWorkspace(true);
  }, [loadEvaluatorWorkspace]);

  const openEvaluatorApplication = async (application) => {
    if (!application?.id) {
      setActionNotice(
        "This assignment is missing its application reference. Refresh your queue and try again.",
      );
      return;
    }

    setDetailLoading(true);
    setActionNotice("");
    try {
      const response = await apiRequest(
        `/evaluator/applications/${application.id}`,
      );
      const details = unwrapApiResponse(response);
      if (!details?.id)
        throw new Error("The application details were incomplete.");

      const savedReview = details.savedReview || null;
      const currentReviewStatus =
        savedReview?.status || application.reviewStatus;
      setSelectedApplication({
        ...application,
        ...details,
        applicationStatus: details.status,
        status: toUiReviewStatus(currentReviewStatus),
        priority: application.priority || "normal",
      });
      setIsDossierPreview(false);
      setShowEvaluationStudio(false);
      setActiveSection("My Applications");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setActionNotice(
        error.message || "Unable to open this assigned application.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const buildReviewPayload = (application, assessment, status) => {
    const recommendation = toApiRecommendation(assessment.recommendation);
    if (!recommendation) {
      throw new Error(
        "Choose an evaluator recommendation before saving or submitting.",
      );
    }

    const rubric = Array.isArray(application?.rubric) ? application.rubric : [];
    const scores = rubric
      .filter((criterion) => {
        const value = assessment.scores?.[criterion.id];
        return (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          Number.isFinite(Number(value))
        );
      })
      .map((criterion) => ({
        criterionId: Number(criterion.id),
        criterion: criterion.title,
        weight: Number(criterion.weight),
        score: Number(assessment.scores[criterion.id]),
        maxScore: Number(criterion.maxScore),
        evidence: assessment.evidence?.[criterion.id] || "",
        evidenceSource: assessment.evidenceSources?.[criterion.id] || "",
      }));

    return {
      status,
      recommendation,
      remarks: assessment.overallRemarks || "",
      conflictConfirmed: Boolean(assessment.conflictConfirmed),
      scores,
    };
  };

  const saveEvaluatorDraft = async (draft) => {
    if (isDossierPreview || !selectedApplication?.id) {
      setEvaluationDrafts((previous) => ({
        ...previous,
        [String(draft.applicationId)]: draft,
      }));
      return;
    }

    const payload = buildReviewPayload(selectedApplication, draft, "DRAFT");
    await apiRequest(
      `/evaluator/applications/${selectedApplication.id}/reviews`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    setEvaluationDrafts((previous) => ({
      ...previous,
      [String(selectedApplication.id)]: draft,
    }));
    await loadEvaluatorWorkspace(false);
  };

  const createEvaluatorClarification = async (applicationId, payload) => {
    await apiRequest(
      `/evaluator/applications/${applicationId}/clarifications`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    await loadEvaluatorWorkspace(false);
    setActionNotice("Clarification request sent to the Admission Officer.");
  };

  const handleAssessmentSubmission = async (assessment) => {
    if (assessment.isPreview || isDossierPreview) {
      setSessionPreviewReviews((previous) => [
        assessment,
        ...previous.filter((review) => review.id !== assessment.id),
      ]);
      return;
    }

    if (!selectedApplication?.id)
      throw new Error("The selected application is no longer available.");
    const payload = buildReviewPayload(
      selectedApplication,
      assessment,
      "SUBMITTED",
    );
    await apiRequest(
      `/evaluator/applications/${selectedApplication.id}/reviews`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    await loadEvaluatorWorkspace(false);

    setEvaluationDrafts((previous) => {
      const updated = { ...previous };
      delete updated[String(selectedApplication.id)];
      return updated;
    });
    setSelectedApplication(null);
    setIsDossierPreview(false);
    setShowEvaluationStudio(false);
    setActiveSection("Review History");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setActionNotice(
        error.message || "Unable to mark the notification as read.",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      setActionNotice(error.message || "Unable to mark notifications as read.");
    }
  };

  const removeNotification = async (id) => {
    try {
      const existing = notifications.find((item) => item.id === id);
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      setNotifications((previous) => previous.filter((item) => item.id !== id));
      if (existing && !existing.read)
        setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setActionNotice(error.message || "Unable to remove this notification.");
    }
  };

  const clearAll = async () => {
    try {
      await apiRequest("/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      setActionNotice(error.message || "Unable to clear notifications.");
    }
  };

  const downloadEvaluationDocument = async (documentId, fileName) => {
    try {
      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
      ).replace(/\/+$/, "");
      const token = localStorage.getItem("credifit_access_token");
      const response = await fetch(
        `${baseUrl}/documents/${documentId}/download`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "Unable to download this document.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `application-document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionNotice(error.message || "Unable to download this document.");
    }
  };

  const handleNotificationOpen = async (item) => {
    if (!item.read) await markAsRead(item.id);
    if (item.applicationId) {
      const match = dashboardData.assignedApplications.find(
        (application) => String(application.id) === String(item.applicationId),
      );
      if (match) {
        await openEvaluatorApplication(match);
        return;
      }
      setActiveSection("My Applications");
      setActionNotice(
        "This notification refers to an application that is no longer assigned to your account.",
      );
      return;
    }
    setActiveSection("Notifications");
  };

  const liveStatCards = statCards.map((card) => ({
    ...card,
    value: String(
      card.label === "Assigned to me"
        ? dashboardSummary.assignedApplications
        : card.label === "Awaiting review"
          ? dashboardSummary.awaitingReview
          : card.label === "In progress"
            ? dashboardSummary.inProgressReviews
            : dashboardSummary.submittedReviews,
    ),
  }));

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 lg:flex">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section);
          setSelectedApplication(null);
          setIsDossierPreview(false);
          setShowEvaluationStudio(false);
        }}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl border border-slate-200 p-2 text-[#D3E5E2] hover:bg-slate-50 lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Evaluator / {activeSection}
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-[#173b61]">
                {showEvaluationStudio || activeSection === "Evaluation Studio"
                  ? "Evaluation Studio"
                  : selectedApplication
                    ? "Applicant Dossier"
                    : activeSection === "My Applications"
                      ? "Assigned Review Queue"
                      : activeSection === "Clarification Centre"
                        ? "Clarification Centre"
                        : activeSection === "Review History"
                          ? "Review History"
                          : activeSection === "My Analytics"
                            ? "My Analytics"
                            : "Review Command Centre"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-amber-700">
                {workspaceLoading
                  ? "Loading live data"
                  : workspaceError
                    ? "Connection needs attention"
                    : "Live data connected"}
              </span>
            </div>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onViewAll={() => setActiveSection("Notifications")}
              onNotificationOpen={handleNotificationOpen}
              tone="teal"
            />
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <ProfileMenu
                role="Evaluator"
                userId={String(profileUserId)}
                displayName={displayName}
                email={displayEmail}
                department={profile?.department || storedUser.department || ""}
                tone="teal"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          {detailLoading && (
            <div className="mb-4 rounded-xl border border-[#D8E9E1] bg-[#F1F8F4] px-4 py-3 text-xs font-semibold text-[#176B59]">
              Loading assigned applicant dossier…
            </div>
          )}
          {(workspaceError || actionNotice) && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <p>{actionNotice || workspaceError}</p>
              {workspaceError && (
                <button
                  type="button"
                  onClick={() => loadEvaluatorWorkspace(true)}
                  className="shrink-0 font-bold underline underline-offset-2"
                >
                  Retry connection
                </button>
              )}
            </div>
          )}
          {activeSection === "Overview" ? (
            <>
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38 }}
                className="relative mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#102F35] via-[#17474A] to-[#1B5551] text-white p-6 shadow-[0_8px_30px_rgba(28,35,60,0.045)] sm:p-8 lg:mb-7 lg:p-9"
              >
                {/* Editorial background texture */}
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[37%] bg-[radial-gradient(circle_at_70%_30%,rgba(128,224,196,0.16),transparent_65%)] lg:block" />

                <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full border border-teal-100/80" />
                <div className="pointer-events-none absolute -left-7 -top-11 h-40 w-40 rounded-full border border-teal-100/80" />

                <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center lg:gap-10">
                  {/* Main introduction */}
                  <div className="relative min-w-0 max-w-2xl">
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-md bg-[#242743] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.17em] text-white shadow-sm">
                        <Activity size={12} />
                        Academic review workspace
                      </span>

                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Department assessment
                      </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
                      {greeting}, welcome back
                    </p>

                    <h1 className="mt-3 max-w-[650px] font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-[40px] lg:text-[46px]">
                      Make every evaluation{" "}
                      <span className="relative inline-block text-[#80E0C4]">
                        count
                        <span className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full bg-[#80E0C4]" />
                        .
                      </span>
                    </h1>

                    <p className="mt-5 max-w-xl text-[13px] leading-6 text-[#D3E5E2] sm:text-sm sm:leading-7">
                      Your department review workspace brings assigned
                      applications, assessment activity and upcoming actions
                      together in one focused place.
                    </p>

                    <div className="mt-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <span className="h-px w-9 bg-teal-400" />
                      <span>Evidence-led · Consistent · Traceable</span>
                    </div>
                  </div>

                  {/* Review status panel */}
                  <div className="relative min-w-0 rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(35,39,70,0.07)] sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#7779c9]">
                          Your review space
                        </p>

                        <p className="mt-2 text-lg font-extrabold tracking-tight text-[#252841]">
                          Ready for assignments
                        </p>
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f0efff] text-[#6265c9] ring-1 ring-[#e4e2ff]">
                        <Clock3 size={21} strokeWidth={1.9} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-35" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      </span>

                      <p className="text-[11px] font-semibold text-amber-800">
                        {workspaceLoading
                          ? "Loading assignments..."
                          : dashboardSummary.assignedApplications === 0
                            ? "No applications assigned yet"
                            : `${dashboardSummary.assignedApplications} assigned application${dashboardSummary.assignedApplications === 1 ? "" : "s"}`}
                      </p>
                    </div>

                    <div
                      className="mt-5 grid grid-cols-3 gap-2"
                      aria-label="Review process"
                    >
                      {[
                        { number: "01", label: "Assigned" },
                        { number: "02", label: "Assess" },
                        { number: "03", label: "Recommend" },
                      ].map((step, index) => (
                        <div key={step.number} className="relative min-w-0">
                          {index > 0 && (
                            <span className="absolute -left-2 top-[9px] h-px w-2 bg-slate-200" />
                          )}

                          <p className="text-[9px] font-extrabold tracking-[0.12em] text-teal-600">
                            {step.number}
                          </p>

                          <p className="mt-1 truncate text-[10px] font-bold text-slate-600">
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              <section
                aria-label="Review statistics"
                className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4 xl:gap-4"
              >
                {liveStatCards.map((card, index) => (
                  <StatCard key={card.label} card={card} index={index} />
                ))}
              </section>

              <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                <Panel className="overflow-hidden">
                  <PanelHeading
                    eyebrow="Your workload"
                    title="Assigned review queue"
                    description="Applications routed to you for department-level assessment."
                    action={
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                        <ClipboardCheck size={12} /> Assignment-based access
                      </span>
                    }
                  />
                  {dashboardData.assignedApplications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {dashboardData.assignedApplications
                        .slice(0, 4)
                        .map((application) => (
                          <button
                            key={application.id}
                            type="button"
                            onClick={() =>
                              openEvaluatorApplication(application)
                            }
                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-[#F7FBF9] sm:px-6"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-bold text-[#173b61]">
                                {getApplicationName(application)}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-slate-400">
                                {getApplicationIdentity(application)} ·{" "}
                                {getApplicationProgramme(application)}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-[#EAF5F0] px-2.5 py-1 text-[9px] font-bold capitalize text-[#176B59]">
                              {
                                getApplicationStatusMeta(application.status)
                                  .label
                              }
                            </span>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Inbox}
                      title={
                        workspaceLoading
                          ? "Loading your assignments"
                          : "Your queue is clear for now"
                      }
                      description="Applications assigned by the Admission Officer will appear here with their programme, review status and due date."
                    />
                  )}
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:px-6">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-blue-600">
                        <ShieldCheck size={15} />
                      </div>
                      <p className="text-[10px] leading-5 text-slate-500">
                        Only applications assigned to your evaluator account
                        will be available in this workspace.
                      </p>
                    </div>
                  </div>
                </Panel>

                <Panel className="overflow-hidden">
                  <PanelHeading
                    eyebrow="Stay prepared"
                    title="Upcoming deadlines"
                    description="Keep track of review due dates and time-sensitive assignments."
                    action={<Clock3 size={18} className="text-slate-300" />}
                  />
                  {dashboardData.upcomingDeadlines.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {dashboardData.upcomingDeadlines
                        .slice(0, 5)
                        .map((item) => (
                          <div
                            key={`${item.applicationNumber}-${item.dueDate}`}
                            className="flex items-center justify-between gap-3 px-5 py-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#173b61]">
                                {item.applicationNumber}
                              </p>
                              <p className="mt-1 truncate text-[10px] text-slate-400">
                                {item.programmeName}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold text-slate-600">
                              {formatApplicationDate(item.dueDate)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Clock3}
                      title="No upcoming deadlines"
                      description="Your assigned review deadlines will appear here."
                      compact
                    />
                  )}
                </Panel>
              </section>

              <section className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                <Panel className="overflow-hidden">
                  <PanelHeading
                    eyebrow="Your activity"
                    title="Recent review activity"
                    description="A record of your latest drafts, submitted assessments and follow-up actions."
                    action={<Activity size={18} className="text-slate-300" />}
                  />
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {dashboardData.recentActivity
                        .slice(0, 5)
                        .map((review) => (
                          <div
                            key={review.id}
                            className="flex items-center justify-between gap-3 px-5 py-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#173b61]">
                                {review.applicantName ||
                                  review.applicationNumber}
                              </p>
                              <p className="mt-1 truncate text-[10px] text-slate-400">
                                {review.applicationNumber} ·{" "}
                                {String(review.status || "").toLowerCase()}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {formatApplicationDate(
                                review.updatedAt || review.submittedAt,
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Activity}
                      title="No review activity yet"
                      description="Saved drafts and submitted assessments will appear here."
                      compact
                    />
                  )}
                </Panel>

                <Panel className="overflow-hidden">
                  <PanelHeading
                    eyebrow="Quick guide"
                    title="Your review checklist"
                    description="The essentials of a responsible department-level assessment."
                  />
                  <div className="space-y-4 p-5 sm:p-6">
                    {[
                      {
                        icon: FileSearch,
                        title: "Check verified information",
                        text: "Use the applicant details and documents cleared by the admission team.",
                      },
                      {
                        icon: ClipboardCheck,
                        title: "Follow the approved rubric",
                        text: "Assess against the criteria configured for the selected programme.",
                      },
                      {
                        icon: ClipboardCheck,
                        title: "Support your recommendation",
                        text: "Add evidence-based remarks before submitting your assessment.",
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            <Icon size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#173b61]">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 text-amber-600">
                          <ShieldCheck size={15} />
                        </div>
                        <p className="text-[10px] leading-5 text-amber-800">
                          Evaluators provide recommendations. The final
                          admission decision remains with the authorized
                          administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              </section>

              <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>CrediFit · Admission Stage-Wise Screening Register</p>
                <p className="flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Secure, role-based evaluation
                  workspace
                </p>
              </div>
            </>
          ) : activeSection === "My Applications" ? (
            selectedApplication ? (
              showEvaluationStudio ? (
                <EvaluationStudio
                  key={getApplicationIdentity(selectedApplication)}
                  application={selectedApplication}
                  isPreview={isDossierPreview}
                  rubric={
                    isDossierPreview
                      ? EVALUATION_RUBRIC_PREVIEW
                      : selectedApplication.rubric || []
                  }
                  initialDraft={
                    evaluationDrafts[String(selectedApplication.id)] ||
                    toEvaluatorDraft(selectedApplication.savedReview)
                  }
                  onSaveDraft={saveEvaluatorDraft}
                  onSubmitAssessment={handleAssessmentSubmission}
                  onBack={() => {
                    setShowEvaluationStudio(false);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                />
              ) : (
                <ApplicantDossier
                  application={selectedApplication}
                  isPreview={isDossierPreview}
                  onBack={() => {
                    setShowEvaluationStudio(false);
                    setSelectedApplication(null);
                    setIsDossierPreview(false);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  onContinue={() => {
                    setShowEvaluationStudio(false);
                    setActiveSection("Evaluation Studio");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDownloadDocument={downloadEvaluationDocument}
                />
              )
            ) : (
              <ApplicationQueue
                applications={dashboardData.assignedApplications}
                onOpen={openEvaluatorApplication}
                onPreview={() => {
                  setIsDossierPreview(true);
                  setSelectedApplication(DOSSIER_LAYOUT_PREVIEW);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            )
          ) : activeSection === "Evaluation Studio" ? (
            selectedApplication ? (
              <EvaluationStudio
                key={getApplicationIdentity(selectedApplication)}
                application={selectedApplication}
                isPreview={isDossierPreview}
                rubric={
                  isDossierPreview
                    ? EVALUATION_RUBRIC_PREVIEW
                    : selectedApplication.rubric || []
                }
                initialDraft={
                  evaluationDrafts[String(selectedApplication.id)] ||
                  toEvaluatorDraft(selectedApplication.savedReview)
                }
                onSaveDraft={saveEvaluatorDraft}
                onSubmitAssessment={handleAssessmentSubmission}
                onBack={() => {
                  setSelectedApplication(null);
                  setIsDossierPreview(false);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            ) : (
              <EvaluationAssignmentQueue
                applications={dashboardData.assignedApplications}
                onOpen={openEvaluatorApplication}
                onPreview={() => {
                  setIsDossierPreview(true);
                  setSelectedApplication(DOSSIER_LAYOUT_PREVIEW);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />
            )
          ) : activeSection === "Clarification Centre" ? (
            <ClarificationCentre
              requests={dashboardData.clarificationRequests}
              previewRequests={CLARIFICATION_PREVIEW_REQUESTS}
              applications={dashboardData.assignedApplications}
              onCreateRequest={createEvaluatorClarification}
            />
          ) : activeSection === "My Analytics" ? (
            <MyAnalytics
              reviews={dashboardData.submittedReviews}
              previewReviews={[
                ...REVIEW_HISTORY_PREVIEW,
                ...sessionPreviewReviews,
              ]}
            />
          ) : activeSection === "Review History" ? (
            <ReviewHistory
              reviews={dashboardData.submittedReviews}
              previewReviews={[
                ...REVIEW_HISTORY_PREVIEW,
                ...sessionPreviewReviews,
              ]}
            />
          ) : activeSection === "Notifications" ? (
            <NotificationCenterPage
              role="Evaluator"
              tone="teal"
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onRemove={removeNotification}
              onClearAll={clearAll}
              onNotificationOpen={handleNotificationOpen}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default EvaluatorDashboard;
