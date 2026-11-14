import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  Files,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
  ClipboardCheck,
  ChartNoAxesCombined,
  ClipboardList,
  GraduationCap,
  Workflow,
  LockKeyhole,
} from "lucide-react";
import { apiDownload, apiRequest } from "../../services/api";
import { logout } from "../../services/auth";
import ProfileMenu from "../../components/Profile/ProfileMenu";
import NotificationBell from "../../components/notifications/NotificationBell";
import usePersistedDashboardSection from "../../hooks/usePersistedDashboardSection.js";

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Applicant Queue", icon: Files },
  { label: "Document Verification", icon: ClipboardCheck },
  { label: "Eligibility Screening", icon: ShieldCheck },
  { label: "Clarification Requests", icon: MessageSquare },
  { label: "Admission Workflow", icon: Workflow },
  { label: "Verification History", icon: History },
  { label: "My Analytics", icon: ChartNoAxesCombined },
  { label: "Notifications", icon: Bell },
];

const unwrap = (response) => response?.data ?? response;

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("credifit_user") || "{}");
  } catch {
    return {};
  }
}

function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(
    "en-IN",
    withTime
      ? {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { day: "2-digit", month: "short", year: "numeric" },
  );
}

function formatStatus(status) {
  const key = String(status || "").toUpperCase();
  const labels = {
    SUBMITTED: "Submitted",
    DOCUMENT_VERIFICATION: "Document verification",
    ELIGIBILITY_SCREENING: "Eligibility screening",
    ELIGIBLE: "Eligible",
    NOT_ELIGIBLE: "Not eligible",
    INCOMPLETE: "Incomplete",
    PASS: "Passed",
    FAIL: "Failed",
    PENDING: "Pending",
    VERIFIED: "Verified",
    CLARIFICATION_REQUESTED: "Clarification requested",
    REJECTED: "Rejected",
    WAITING_FOR_APPLICANT: "Waiting for applicant",
    RESPONSE_RECEIVED: "Response received",
    READY_FOR_REVIEW: "Ready for review",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    OPEN_FOR_OFFICER: "Open",
  };
  return (
    labels[key] ||
    String(status || "Unknown")
      .replaceAll("_", " ")
      .toLowerCase()
  );
}

function statusTone(status) {
  const key = String(status || "").toUpperCase();
  if (["VERIFIED", "RESOLVED"].includes(key))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (
    [
      "CLARIFICATION_REQUESTED",
      "WAITING_FOR_APPLICANT",
      "RESPONSE_RECEIVED",
      "READY_FOR_REVIEW",
      "OPEN_FOR_OFFICER",
    ].includes(key)
  ) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }
  if (["REJECTED", "CLOSED"].includes(key))
    return "border-rose-200 bg-rose-50 text-rose-700";
  if (
    [
      "PENDING",
      "SUBMITTED",
      "DOCUMENT_VERIFICATION",
      "ELIGIBILITY_SCREENING",
    ].includes(key)
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusTone(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function AdminFilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative min-w-[170px]" ref={dropdownRef}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <span className="truncate">{selectedOption?.label || "All"}</span>
        <span className="ml-3 text-slate-400">⌄</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            role="listbox"
            className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition ${
                  value === option.value
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <CheckCircle2 size={14} className="text-indigo-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ icon: Icon = Files, title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-800">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[2px] text-amber-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[25px] font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, description, icon: Icon, tone = "amber" }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-500">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone] || tones.slate}`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-[29px] font-bold tracking-tight text-slate-900">
        {value ?? "—"}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{description}</p>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-400 transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

function AdmissionOfficerOverview({
  summary,
  queue,
  onOpenVerification,
  onOpenQueue,
  loading,
}) {
  const priorityItems = queue
    .filter(
      (item) =>
        Number(item.pendingDocuments || 0) > 0 ||
        Number(item.documentsNeedingAttention || 0) > 0,
    )
    .slice(0, 5);

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#17242B] shadow-xl shadow-slate-900/10">
        <div className="pointer-events-none absolute -right-28 -top-36 h-[420px] w-[420px] rounded-full border border-amber-200/10" />
        <div className="pointer-events-none absolute -right-12 -top-20 h-[300px] w-[300px] rounded-full border border-amber-200/10" />
        <div className="pointer-events-none absolute -bottom-40 right-36 h-[380px] w-[380px] rounded-full bg-amber-400/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
              <span className="text-[9px] font-bold uppercase tracking-[2px] text-amber-200">
                Admission operations centre
              </span>
            </div>
            <p className="text-[12px] font-medium tracking-wide text-slate-400">
              Welcome to your workspace
            </p>
            <h1 className="mt-2 max-w-xl text-[30px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[39px]">
              Every document.
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                Every detail. Under control.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-[12px] leading-6 text-slate-400 sm:text-[13px]">
              Review submitted applications, validate documents, respond to
              clarifications and keep the admission process moving.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onOpenVerification}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 px-5 py-3 text-[11px] font-bold text-[#17242B] shadow-lg shadow-amber-950/20 transition hover:-translate-y-0.5"
              >
                Open verification desk{" "}
                <ChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <button
                onClick={onOpenQueue}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-[11px] font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/[0.09]"
              >
                View applicant queue <Files size={15} />
              </button>
            </div>
          </div>
          <div className="relative hidden min-h-[245px] items-center justify-center lg:flex">
            <div className="absolute h-[235px] w-[235px] rounded-full border border-white/[0.08]" />
            <div className="absolute h-[190px] w-[190px] rounded-full border border-dashed border-amber-200/20" />
            <div className="absolute h-[145px] w-[145px] rounded-full bg-gradient-to-br from-amber-300/20 to-amber-300/[0.02] blur-xl" />
            <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-[32px] border border-amber-200/30 bg-gradient-to-br from-amber-300/20 to-white/[0.04] text-amber-200 shadow-2xl shadow-amber-950/30">
              <ShieldCheck size={57} strokeWidth={1.25} />
              <div className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#263941] text-emerald-300 shadow-lg">
                <FileCheck2 size={17} />
              </div>
            </div>
            <div className="absolute right-0 top-8 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md">
              <p className="text-[9px] font-semibold text-slate-400">
                WORKSPACE
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-amber-200">
                Document review
              </p>
            </div>
            <div className="absolute bottom-6 left-0 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                <p className="text-[10px] font-semibold text-slate-200">
                  Live workflow
                </p>
              </div>
              <p className="mt-1 text-[9px] text-slate-400">
                Connected to CrediFit records
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-amber-700">
              Performance snapshot
            </p>
            <h2 className="mt-1 text-[19px] font-bold tracking-tight text-slate-900">
              Your verification overview
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Live totals from your admission workspace
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-semibold text-emerald-700">
            Live data
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pending verification"
            value={summary?.pending ?? (loading ? "…" : 0)}
            description="Documents waiting for review"
            icon={Clock3}
            tone="amber"
          />
          <MetricCard
            label="Verified documents"
            value={summary?.verified ?? (loading ? "…" : 0)}
            description="Successfully reviewed"
            icon={FileCheck2}
            tone="emerald"
          />
          <MetricCard
            label="Clarifications"
            value={summary?.clarifications ?? (loading ? "…" : 0)}
            description="Requiring follow-up"
            icon={MessageSquare}
            tone="orange"
          />
          <MetricCard
            label="Applications in queue"
            value={
              summary?.assignedApplications ?? (loading ? "…" : queue.length)
            }
            description="Submitted or in document review"
            icon={Files}
            tone="sky"
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">
                Priority workspace
              </h3>
              <p className="mt-1 text-[10px] text-slate-400">
                Applications with pending documents or attention required
              </p>
            </div>
            <button
              onClick={onOpenQueue}
              className="text-[10px] font-bold text-amber-700 transition hover:text-amber-900"
            >
              View queue →
            </button>
          </div>
          {priorityItems.length ? (
            <div className="divide-y divide-slate-100">
              {priorityItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onOpenVerification(item.id)}
                  className="flex w-full flex-col gap-2 px-5 py-4 text-left transition hover:bg-amber-50/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-bold text-slate-800">
                      {item.applicantName || "Applicant"} ·{" "}
                      {item.applicationNumber}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-slate-500">
                      {item.programmeName || "Programme not available"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3 text-[10px]">
                    <span className="text-amber-700">
                      {Number(item.pendingDocuments || 0)} pending
                    </span>
                    <span className="text-orange-700">
                      {Number(item.documentsNeedingAttention || 0)} need
                      attention
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10">
              <EmptyState
                icon={ClipboardCheck}
                title={loading ? "Loading your queue…" : "No priority items"}
                description="Applications with documents waiting for review or applicant attention will appear here."
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6">
            <p className="text-[9px] font-bold uppercase tracking-[1.7px] text-amber-700">
              Admission journey
            </p>
            <h3 className="mt-1 text-[14px] font-bold text-slate-900">
              Where your work fits in
            </h3>
            <p className="mt-1 text-[10px] text-slate-400">
              Your role in the screening process
            </p>
          </div>
          <div className="space-y-5">
            {[
              {
                title: "Application submission",
                description:
                  "Applicant completes and submits their application.",
                icon: Files,
                color: "bg-slate-100 text-slate-600",
              },
              {
                title: "Document verification",
                description:
                  "Review the uploaded certificates and record a decision.",
                icon: ClipboardCheck,
                color: "bg-amber-100 text-amber-700",
                active: true,
              },
              {
                title: "Eligibility screening",
                description:
                  "The application moves to the eligibility assessment stage.",
                icon: ShieldCheck,
                color: "bg-indigo-100 text-indigo-700",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="relative flex gap-3">
                  {index < 2 && (
                    <div className="absolute bottom-[-22px] left-[17px] top-10 w-px border-l border-dashed border-slate-200" />
                  )}
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-bold text-slate-800">
                        {item.title}
                      </p>
                      {item.active && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-800">
                          Your stage
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[9px] leading-4 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-7 rounded-xl bg-[#17242B] p-4">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldCheck size={15} />
              <p className="text-[10px] font-bold">Responsibility boundary</p>
            </div>
            <p className="mt-2 text-[9px] leading-5 text-slate-400">
              Document verification belongs to your role. Eligibility rules,
              evaluations and final admission decisions remain with their
              authorised roles.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const admissionWorkflowStages = [
  {
    title: "Application submission",
    description:
      "The applicant completes and submits the admission application with the required information and documents.",
    owner: "Applicant",
    nextOwner: "Admission Officer",
    icon: ClipboardList,
    checks: [
      "Personal and academic details are completed.",
      "All mandatory documents are uploaded.",
      "The applicant confirms and submits the application.",
    ],
    officerActions: [],
  },
  {
    title: "Document verification",
    description:
      "The Admission Officer checks the uploaded documents for completeness, readability, and consistency with the application.",
    owner: "Admission Officer",
    nextOwner: "Eligibility screening",
    icon: ClipboardCheck,
    checks: [
      "Every required document is present.",
      "Scans are readable, complete, and correctly oriented.",
      "Names, dates, and academic details are consistent with the application.",
      "A specific correction reason is recorded whenever a document is returned.",
    ],
    officerActions: [
      "Verify documents that meet the requirements.",
      "Return documents with a clear correction or resubmission reason.",
    ],
  },
  {
    title: "Eligibility screening",
    description:
      "The Admission Officer reviews the applicant's academic evidence against the configured programme eligibility criteria.",
    owner: "Admission Officer",
    nextOwner: "Assigned Evaluator / Department Review",
    icon: ShieldCheck,
    checks: [
      "The configured eligibility result is reviewed against the applicant's academic evidence.",
      "Any mismatch is supported by an evidence reference and an officer remark.",
      "The officer's recommendation is kept separate from the final admission decision.",
    ],
    officerActions: [
      "Run the configured programme eligibility checks from the Eligibility Screening workspace.",
      "Review each PASS, FAIL, or PENDING result before the application is handed off.",
    ],
  },
  {
    title: "Department review",
    description:
      "The assigned Evaluator performs the department-level assessment where the programme requires it.",
    owner: "Assigned Evaluator",
    nextOwner: "Authorized Admin",
    icon: GraduationCap,
    checks: [
      "The assigned evaluator reviews the relevant department criteria.",
      "The assessment outcome and remarks are recorded.",
      "Any required follow-up is sent to the responsible team.",
    ],
    officerActions: [],
  },
  {
    title: "Final admission decision",
    description:
      "The authorized administrator reviews the completed screening stages and records the institution's final outcome.",
    owner: "Authorized Admin",
    nextOwner: "Applicant notification",
    icon: CheckCircle2,
    checks: [
      "All required screening and department-review stages are complete.",
      "The final outcome is recorded by an authorized administrator.",
      "The decision date and outcome are retained for the application record.",
    ],
    officerActions: [],
  },
];

function AdmissionOfficerWorkflow({ onOpenQueue, onOpenVerification }) {
  const [selectedStageTitle, setSelectedStageTitle] = useState(
    "Document verification",
  );
  const selectedStage =
    admissionWorkflowStages.find(
      (stage) => stage.title === selectedStageTitle,
    ) || admissionWorkflowStages[1];
  const selectedStageIsOfficerOwned =
    selectedStage.owner === "Admission Officer";

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Process"
        title="Admission Workflow"
        description="Explore the admission stages, understand who owns each step, and see the checks expected before an application moves forward."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenQueue}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
            >
              <Files size={14} /> Applicant queue
            </button>
            <button
              type="button"
              onClick={onOpenVerification}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#17242B] px-4 text-[10px] font-bold text-amber-200 transition hover:bg-[#243740]"
            >
              <ClipboardCheck size={14} /> Verification desk
            </button>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <Activity size={17} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="text-xs font-bold text-amber-900">
            Workflow reference guide
          </p>
          <p className="mt-1 text-[11px] leading-5 text-amber-900/75">
            This page explains stage ownership and review responsibilities. Use
            the connected queue, verification, eligibility screening, and
            clarification workspaces for the actions available to the Admission
            Officer.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-amber-700">
              Institutional process
            </p>
            <h2 className="mt-1 text-[15px] font-bold text-slate-900">
              Stage-wise admission journey
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-400">
              Select a stage to inspect its owner, hand-off, and completion
              checks.
            </p>
          </div>
          <div className="space-y-2 p-4">
            {admissionWorkflowStages.map((stage, index) => {
              const Icon = stage.icon;
              const active = selectedStage.title === stage.title;
              const officerOwned = stage.owner === "Admission Officer";
              return (
                <button
                  key={stage.title}
                  type="button"
                  onClick={() => setSelectedStageTitle(stage.title)}
                  aria-pressed={active}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    active
                      ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-100"
                      : "border-slate-200 bg-white hover:border-amber-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active
                        ? "bg-[#17242B] text-amber-200"
                        : officerOwned
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Stage {index + 1}
                      </span>
                      {officerOwned ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                          Officer scope
                        </span>
                      ) : stage.owner === "Authorized Admin" ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                          Admin only
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-slate-800">
                      {stage.title}
                    </span>
                    <span className="mt-1 block text-[10px] leading-5 text-slate-500">
                      {stage.description}
                    </span>
                    <span className="mt-2 block text-[10px] font-semibold text-slate-500">
                      Owner: {stage.owner}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className={`mt-1 shrink-0 ${active ? "text-amber-700" : "text-slate-300"}`}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[2px] text-amber-700">
              Selected stage details
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedStage.title}
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  selectedStageIsOfficerOwned
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {selectedStageIsOfficerOwned
                  ? "Within officer scope"
                  : "Outside officer scope"}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              {selectedStage.description}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Responsible owner
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  {selectedStage.owner}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Next hand-off
                </p>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  {selectedStage.nextOwner}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <h3 className="text-xs font-bold text-slate-900">
              Stage completion checks
            </h3>
            <ul className="mt-3 space-y-3">
              {selectedStage.checks.map((check, index) => (
                <li
                  key={`${selectedStage.title}-${index}`}
                  className="flex gap-2.5 text-[11px] leading-5 text-slate-600"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                    {index + 1}
                  </span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>

            {selectedStageIsOfficerOwned ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <ShieldCheck size={15} />
                  <p className="text-xs font-bold">Officer responsibilities</p>
                </div>
                <ul className="mt-3 space-y-2">
                  {selectedStage.officerActions.map((action) => (
                    <li
                      key={action}
                      className="flex items-start gap-2 text-[10px] leading-5 text-amber-900/80"
                    >
                      <CheckCircle2
                        size={13}
                        className="mt-0.5 shrink-0 text-amber-700"
                      />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg border border-amber-200/80 bg-white/80 p-3 text-[10px] leading-5 text-slate-500">
                  Use the Eligibility Screening workspace to run the configured
                  backend checks. Applications that pass move to Department
                  Review; incomplete or failed checks remain in this stage until
                  the underlying information is addressed.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <LockKeyhole size={14} />
                  <p className="text-xs font-bold">
                    Outside officer action scope
                  </p>
                </div>
                <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                  This stage is owned by {selectedStage.owner}. The Admission
                  Officer can understand the hand-off but cannot record or
                  override its outcome from this workspace.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#17242B] p-5 text-white">
          <div className="flex items-center gap-2 text-amber-200">
            <Workflow size={17} />
            <h3 className="text-xs font-bold">Controlled progression</h3>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-slate-300">
            A stage should move forward only after its required checks are
            complete and the server confirms the acting user's permission. Real
            transitions should retain the acting officer, timestamp, previous
            state, new state, and reason.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-700">
            <LockKeyhole size={16} />
            <h3 className="text-xs font-bold">Decision boundary</h3>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">
            Admission Officers handle document verification and screening
            remarks. Department review belongs to the assigned Evaluator, while
            final admission decisions and programme-rule changes remain
            restricted to authorized administrators.
          </p>
        </div>
      </div>
    </div>
  );
}

function AdmissionOfficerQueue({
  applications,
  loading,
  error,
  onRefresh,
  onReview,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const statuses = [
    "All statuses",
    ...new Set(applications.map((item) => formatStatus(item.status))),
  ];
  const filtered = applications.filter((item) => {
    const text =
      `${item.applicationNumber || ""} ${item.applicantName || ""} ${item.applicantEmail || ""} ${item.programmeName || ""}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (statusFilter === "All statuses" ||
        formatStatus(item.status) === statusFilter)
    );
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Applications"
        title="Applicant Queue"
        description="Live applications submitted for document verification. Open an application to inspect its uploaded documents and record a review."
        action={
          <button
            onClick={onRefresh}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
          >
            <RefreshCw size={14} /> Refresh queue
          </button>
        }
      />
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
        >
          {error}
        </div>
      )}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Total applications"
          value={applications.length}
          description="In the officer work queue"
          icon={Files}
          tone="slate"
        />
        <MetricCard
          label="Pending documents"
          value={applications.reduce(
            (sum, item) => sum + Number(item.pendingDocuments || 0),
            0,
          )}
          description="Awaiting review"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Verified documents"
          value={applications.reduce(
            (sum, item) => sum + Number(item.verifiedDocuments || 0),
            0,
          )}
          description="Accepted documents"
          icon={FileCheck2}
          tone="emerald"
        />
        <MetricCard
          label="Need attention"
          value={applications.reduce(
            (sum, item) => sum + Number(item.documentsNeedingAttention || 0),
            0,
          )}
          description="Clarification or rejected"
          icon={AlertCircle}
          tone="orange"
        />
      </section>
      <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">
                Application register
              </h2>
              <p className="mt-1 text-[10px] text-slate-400">
                Search applicants and filter by their current workflow status
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-600">
              {filtered.length} shown
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search applicant, application ID or programme…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[11px] outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </label>
            <div className="sm:w-[230px]">
              <AdminFilterDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statuses.map((item) => ({ value: item, label: item }))}
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading live applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Search}
              title="No matching applications"
              description="No applications match these filters. Try another search or check back after an applicant submits an application."
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {[
                      "Applicant",
                      "Programme",
                      "Submitted",
                      "Documents",
                      "Status",
                      "Action",
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((application) => (
                    <tr
                      key={application.id}
                      className="transition hover:bg-amber-50/30"
                    >
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-bold text-slate-800">
                          {application.applicantName || "Applicant"}
                        </p>
                        <p className="mt-0.5 text-[9px] text-slate-400">
                          {application.applicationNumber}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {application.applicantEmail}
                        </p>
                      </td>
                      <td className="max-w-[220px] px-4 py-4 text-[10px] leading-5 text-slate-600">
                        {application.programmeName}
                      </td>
                      <td className="px-4 py-4 text-[10px] text-slate-500">
                        {formatDate(application.submittedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-[10px] font-semibold text-slate-700">
                          {Number(application.documentCount || 0)} uploaded
                        </p>
                        <p className="mt-1 text-[9px] text-amber-700">
                          {Number(application.pendingDocuments || 0)} pending ·{" "}
                          {Number(application.verifiedDocuments || 0)} verified
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill status={application.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onReview(application.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                          Review <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {filtered.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-slate-800">
                        {application.applicantName}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        {application.applicationNumber}
                      </p>
                    </div>
                    <StatusPill status={application.status} />
                  </div>
                  <p className="mt-3 text-[10px] text-slate-600">
                    {application.programmeName}
                  </p>
                  <p className="mt-2 text-[9px] text-slate-400">
                    {Number(application.pendingDocuments || 0)} pending ·{" "}
                    {Number(application.verifiedDocuments || 0)} verified
                  </p>
                  <button
                    onClick={() => onReview(application.id)}
                    className="mt-3 w-full rounded-lg bg-[#17242B] px-3 py-2.5 text-[10px] font-bold text-amber-200"
                  >
                    Open verification desk
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function AdmissionOfficerVerification({
  applications,
  selectedApplicationId,
  onSelectApplication,
  documents,
  documentsLoading,
  documentsError,
  onReloadDocuments,
  onReviewDocument,
  reviewingDocumentId,
  notice,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");

  const selectedApplication =
    applications.find(
      (item) => String(item.id) === String(selectedApplicationId),
    ) || null;
  const visibleDocuments = documents.filter((item) => {
    const matchesSearch = `${item.documentType || ""} ${item.fileName || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      String(item.status).toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const selectedDocument =
    visibleDocuments.find(
      (item) => String(item.id) === String(selectedDocumentId),
    ) ||
    visibleDocuments[0] ||
    null;

  useEffect(() => {
    setSelectedDocumentId("");
    setDecisionReason("");
    setDecisionNotes("");
  }, [selectedApplicationId]);

  const submitDecision = async (decision) => {
    if (!selectedDocument) return;
    if (decision !== "VERIFIED" && decisionReason.trim().length < 5) {
      window.alert(
        "Enter an applicant-visible reason of at least 5 characters.",
      );
      return;
    }
    const ok = await onReviewDocument(
      selectedDocument,
      decision,
      decisionReason.trim(),
      decisionNotes.trim(),
    );
    if (ok) {
      setDecisionReason("");
      setDecisionNotes("");
      setSelectedDocumentId("");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Verification"
        title="Document Verification Studio"
        description="Open submitted documents, inspect the latest file version and record a verified, clarification or rejected decision."
        action={
          <button
            onClick={onReloadDocuments}
            disabled={!selectedApplicationId || documentsLoading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} /> Refresh documents
          </button>
        }
      />
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
          {notice}
        </div>
      )}
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-[13px] font-bold text-slate-900">
              Applications for review
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Choose an application to inspect its documents
            </p>
            <div className="mt-4">
              <AdminFilterDropdown
                label="Application for review"
                value={selectedApplicationId || ""}
                onChange={onSelectApplication}
                options={[
                  { value: "", label: "Select an application" },
                  ...applications.map((item) => ({
                    value: String(item.id),
                    label: `${item.applicationNumber || `Application #${item.id}`} · ${item.applicantName || "Applicant"}`,
                  })),
                ]}
              />
            </div>
          </div>
          {selectedApplication ? (
            <div className="space-y-3 p-4">
              <div className="rounded-xl bg-[#17242B] p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  Selected application
                </p>
                <p className="mt-2 text-[12px] font-bold">
                  {selectedApplication.applicantName}
                </p>
                <p className="mt-1 text-[10px] text-slate-300">
                  {selectedApplication.applicationNumber}
                </p>
                <p className="mt-3 text-[10px] leading-5 text-slate-300">
                  {selectedApplication.programmeName}
                </p>
                <div className="mt-3">
                  <StatusPill status={selectedApplication.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[9px] text-slate-400">Uploaded</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {selectedApplication.documentCount ?? documents.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[9px] text-slate-400">Awaiting review</p>
                  <p className="mt-1 text-lg font-bold text-amber-700">
                    {selectedApplication.pendingDocuments ??
                      documents.filter((doc) => doc.status === "PENDING")
                        .length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <EmptyState
                icon={Files}
                title="Select an application"
                description="Submitted applications will appear in this selector when they enter the officer queue."
              />
            </div>
          )}
        </div>

        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-bold text-slate-900">
                  Submitted documents
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Only the latest uploaded version of each document is shown
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-600">
                {documents.length} documents
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search document or filename…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[10px] outline-none focus:border-amber-400 focus:bg-white"
                />
              </label>
              <div className="sm:w-[220px]">
                <AdminFilterDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "All", label: "All statuses" },
                    { value: "PENDING", label: "Pending" },
                    { value: "VERIFIED", label: "Verified" },
                    {
                      value: "CLARIFICATION_REQUESTED",
                      label: "Clarification requested",
                    },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                />
              </div>
            </div>
          </div>
          {documentsError && (
            <div
              role="alert"
              className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[10px] text-rose-700"
            >
              {documentsError}
            </div>
          )}
          {documentsLoading ? (
            <div className="p-10 text-center text-xs text-slate-400">
              Loading saved document records…
            </div>
          ) : !selectedApplication ? (
            <div className="p-4">
              <EmptyState
                icon={Files}
                title="No application selected"
                description="Select an application on the left to view its submitted documents."
              />
            </div>
          ) : visibleDocuments.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={FileCheck2}
                title="No documents found"
                description="There are no documents matching this application and filter."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleDocuments.map((document) => (
                <button
                  key={document.id}
                  onClick={() => setSelectedDocumentId(String(document.id))}
                  className={`flex w-full items-start gap-3 p-4 text-left transition ${String(selectedDocument?.id) === String(document.id) ? "bg-amber-50/70" : "hover:bg-slate-50"}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileCheck2 size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-800">
                        {document.documentType}
                      </span>
                      <StatusPill status={document.status} />
                    </span>
                    <span className="mt-1 block break-all text-[10px] text-slate-500">
                      {document.fileName}
                    </span>
                    <span className="mt-1 block text-[9px] text-slate-400">
                      Version {document.version} · Uploaded{" "}
                      {formatDate(document.uploadedAt, true)}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="mt-1 shrink-0 text-slate-400"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedDocument && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                Review selected document
              </p>
              <h3 className="mt-1 text-[16px] font-bold text-slate-900">
                {selectedDocument.documentType}
              </h3>
              <p className="mt-1 break-all text-[10px] text-slate-500">
                {selectedDocument.fileName}
              </p>
              <div className="mt-2">
                <StatusPill status={selectedDocument.status} />
              </div>
            </div>
            <button
              onClick={() => onReviewDocument(selectedDocument, "DOWNLOAD")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
            >
              <Download size={14} /> Download file
            </button>
          </div>
          {selectedDocument.latestReason && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-800">
                Previous review reason
              </p>
              <p className="mt-1 text-[10px] leading-5 text-orange-800">
                {selectedDocument.latestReason}
              </p>
            </div>
          )}
          {selectedDocument.latestNotes && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Previous notes
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-600">
                {selectedDocument.latestNotes}
              </p>
            </div>
          )}
          {selectedDocument.status === "VERIFIED" ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 size={16} /> This latest document version has
              already been verified.
            </div>
          ) : !["SUBMITTED", "DOCUMENT_VERIFICATION"].includes(
              String(selectedApplication?.status || "").toUpperCase(),
            ) ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] font-semibold text-slate-600">
              <ShieldCheck size={16} /> This application has moved beyond
              document verification. The file is available for download, but
              document decisions are closed.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-600">
                  Reason <span className="text-rose-500">*</span> for
                  clarification or rejection
                </span>
                <textarea
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="Explain what is missing, unclear or incorrect. Required for clarification/rejection."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-600">
                  Applicant instruction / internal notes
                </span>
                <textarea
                  value={decisionNotes}
                  onChange={(event) => setDecisionNotes(event.target.value)}
                  rows={3}
                  maxLength={1500}
                  placeholder="Tell the applicant what to correct or add any review notes."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />
              </label>
              <div className="flex flex-wrap gap-2 lg:col-span-2">
                <button
                  disabled={Boolean(reviewingDocumentId)}
                  onClick={() => submitDecision("VERIFIED")}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={14} /> Mark verified
                </button>
                <button
                  disabled={Boolean(reviewingDocumentId)}
                  onClick={() => submitDecision("CLARIFICATION_REQUESTED")}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-500 px-4 text-[10px] font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                >
                  <MessageSquare size={14} /> Request clarification
                </button>
                <button
                  disabled={Boolean(reviewingDocumentId)}
                  onClick={() => submitDecision("REJECTED")}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-[10px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  <XCircle size={14} /> Reject document
                </button>
                {reviewingDocumentId && (
                  <span className="self-center text-[10px] text-slate-400">
                    Saving review…
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AdmissionOfficerClarification({
  requests,
  loading,
  onUpdate,
  updatingId,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [nextStatus, setNextStatus] = useState("READY_FOR_REVIEW");
  const [instruction, setInstruction] = useState("");

  const filtered = requests.filter((item) => {
    const text =
      `${item.applicationNumber || ""} ${item.applicantName || ""} ${item.programmeName || ""} ${item.document || ""} ${item.subject || ""} ${item.reason || ""}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (filter === "All" || item.status === filter)
    );
  });
  const selected =
    filtered.find((item) => String(item.id) === String(selectedId)) ||
    filtered[0] ||
    null;

  useEffect(() => {
    if (selected) {
      setSelectedId(String(selected.id));
      setNextStatus(
        selected.status === "RESPONSE_RECEIVED" ||
          selected.status === "OPEN_FOR_OFFICER"
          ? "READY_FOR_REVIEW"
          : [
                "WAITING_FOR_APPLICANT",
                "READY_FOR_REVIEW",
                "RESOLVED",
                "CLOSED",
              ].includes(selected.status)
            ? selected.status
            : "READY_FOR_REVIEW",
      );
      setInstruction(selected.instruction || "");
    } else {
      setSelectedId("");
    }
  }, [selected?.id]);

  const save = () =>
    selected && onUpdate(selected, nextStatus, instruction.trim());

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Applicant support"
        title="Clarification Requests"
        description="Track document issues, read applicant responses and update the next action. Sending an instruction while setting the status to Waiting for applicant notifies the applicant."
      />
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Total requests"
          value={requests.length}
          description="Visible clarification records"
          icon={MessageSquare}
          tone="slate"
        />
        <MetricCard
          label="Waiting for applicant"
          value={
            requests.filter((x) => x.status === "WAITING_FOR_APPLICANT").length
          }
          description="Applicant action pending"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Responses received"
          value={
            requests.filter((x) => x.status === "RESPONSE_RECEIVED").length
          }
          description="Ready for officer review"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          label="Ready for review"
          value={requests.filter((x) => x.status === "READY_FOR_REVIEW").length}
          description="Officer follow-up needed"
          icon={AlertCircle}
          tone="orange"
        />
      </section>
      <section className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-[13px] font-bold text-slate-900">
              Clarification register
            </h2>
            <div className="mt-3 space-y-2">
              <label className="relative block">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search applicant, document or application…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[10px] outline-none focus:border-amber-400 focus:bg-white"
                />
              </label>
              <AdminFilterDropdown
                label="Request Status"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "All", label: "All request statuses" },
                  ...[
                    "OPEN_FOR_OFFICER",
                    "WAITING_FOR_APPLICANT",
                    "RESPONSE_RECEIVED",
                    "READY_FOR_REVIEW",
                    "RESOLVED",
                    "CLOSED",
                  ].map((item) => ({
                    value: item,
                    label: formatStatus(item),
                  })),
                ]}
              />
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading clarification requests…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={MessageSquare}
                title="No clarification requests"
                description="Applicant corrections and replies will appear here when they are created."
              />
            </div>
          ) : (
            <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(String(item.id));
                    setNextStatus(
                      item.status === "RESPONSE_RECEIVED" ||
                        item.status === "OPEN_FOR_OFFICER"
                        ? "READY_FOR_REVIEW"
                        : [
                              "WAITING_FOR_APPLICANT",
                              "READY_FOR_REVIEW",
                              "RESOLVED",
                              "CLOSED",
                            ].includes(item.status)
                          ? item.status
                          : "READY_FOR_REVIEW",
                    );
                    setInstruction(item.instruction || "");
                  }}
                  className={`w-full p-4 text-left transition ${String(selected?.id) === String(item.id) ? "bg-amber-50/70" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-800">
                      {item.subject || item.document || "Clarification request"}
                    </p>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {item.applicantName} · {item.applicationNumber}
                  </p>
                  <p className="mt-1 truncate text-[9px] text-slate-400">
                    {item.programmeName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                  Selected request
                </p>
                <h2 className="mt-1 text-[16px] font-bold text-slate-900">
                  {selected.subject ||
                    selected.document ||
                    "Clarification request"}
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  {selected.applicantName} · {selected.applicationNumber}
                </p>
              </div>
              <StatusPill status={selected.status} />
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Reason recorded
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-slate-700">
                  {selected.reason || "No reason was recorded."}
                </p>
              </div>
              {selected.applicantResponse && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    Applicant response
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-emerald-900">
                    {selected.applicantResponse}
                  </p>
                </div>
              )}
              <AdminFilterDropdown
                label="Next Status"
                value={nextStatus}
                onChange={setNextStatus}
                options={[
                  {
                    value: "WAITING_FOR_APPLICANT",
                    label: "Waiting for applicant",
                  },
                  { value: "READY_FOR_REVIEW", label: "Ready for review" },
                  { value: "RESOLVED", label: "Resolved" },
                  { value: "CLOSED", label: "Closed" },
                ]}
              />
              <label className="block">
                <span className="text-[10px] font-bold text-slate-600">
                  Instruction to applicant (used when waiting for applicant)
                </span>
                <textarea
                  rows={3}
                  maxLength={1500}
                  value={instruction}
                  onChange={(event) => setInstruction(event.target.value)}
                  placeholder="Explain exactly what the applicant must correct or provide…"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-5 outline-none focus:border-amber-400 focus:bg-white"
                />
              </label>
              <button
                disabled={Boolean(updatingId)}
                onClick={save}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#17242B] px-5 text-[10px] font-bold text-amber-200 transition hover:bg-[#263941] disabled:opacity-50"
              >
                <Check size={14} />{" "}
                {updatingId ? "Saving…" : "Save clarification update"}
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a clarification"
            description="Choose a request from the register to review its reason and applicant response."
          />
        )}
      </section>
    </div>
  );
}

function AdmissionOfficerHistory({ history, loading }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All decisions");
  const filtered = history.filter((item) => {
    const text =
      `${item.applicationNumber || ""} ${item.applicantName || ""} ${item.documentType || ""} ${item.fileName || ""} ${item.reason || ""}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (filter === "All decisions" || item.decision === filter)
    );
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Audit trail"
        title="Verification History"
        description="A read-only record of document decisions recorded through your officer account."
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Total reviews"
          value={history.length}
          description="Recorded review actions"
          icon={History}
          tone="slate"
        />
        <MetricCard
          label="Verified"
          value={history.filter((x) => x.decision === "VERIFIED").length}
          description="Accepted documents"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          label="Clarifications"
          value={
            history.filter((x) => x.decision === "CLARIFICATION_REQUESTED")
              .length
          }
          description="Applicant corrections requested"
          icon={MessageSquare}
          tone="amber"
        />
        <MetricCard
          label="Rejected"
          value={history.filter((x) => x.decision === "REJECTED").length}
          description="Documents rejected"
          icon={XCircle}
          tone="orange"
        />
      </div>
      <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">
              Review activity
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Search and filter historical decisions
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search history…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[10px] outline-none focus:border-amber-400 sm:w-64"
              />
            </label>
            <AdminFilterDropdown
              value={filter}
              onChange={setFilter}
              options={[
                { value: "All decisions", label: "All decisions" },
                { value: "VERIFIED", label: "Verified" },
                {
                  value: "CLARIFICATION_REQUESTED",
                  label: "Clarification requested",
                },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading review history…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={History}
              title="No review history found"
              description="Your completed document reviews will be recorded here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.decision === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : item.decision === "REJECTED" ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}
                >
                  {item.decision === "VERIFIED" ? (
                    <CheckCircle2 size={17} />
                  ) : item.decision === "REJECTED" ? (
                    <XCircle size={17} />
                  ) : (
                    <MessageSquare size={17} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-800">
                      {item.documentType}
                    </p>
                    <StatusPill status={item.decision} />
                  </div>
                  <p className="mt-1 break-all text-[10px] text-slate-500">
                    {item.fileName}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {item.applicantName} · {item.applicationNumber}
                  </p>
                  {item.reason && (
                    <p className="mt-2 text-[10px] leading-5 text-slate-600">
                      Reason: {item.reason}
                    </p>
                  )}
                  {item.notes && (
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[10px] font-semibold text-slate-700">
                    {formatDate(item.reviewedAt)}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    Reviewed by {item.reviewedBy || "Officer"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdmissionOfficerAnalytics({ history }) {
  const total = history.length;
  const verified = history.filter(
    (item) => item.decision === "VERIFIED",
  ).length;
  const clarification = history.filter(
    (item) => item.decision === "CLARIFICATION_REQUESTED",
  ).length;
  const rejected = history.filter(
    (item) => item.decision === "REJECTED",
  ).length;
  const verifiedPercent = total ? Math.round((verified / total) * 100) : 0;
  const byDocument = Object.entries(
    history.reduce((acc, item) => {
      const key = item.documentType || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxDocumentCount = Math.max(1, ...byDocument.map(([, count]) => count));
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toLocaleDateString("en-CA");
    const count = history.filter(
      (item) =>
        item.reviewedAt &&
        new Date(item.reviewedAt).toLocaleDateString("en-CA") === key,
    ).length;
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      count,
    };
  });
  const maxDay = Math.max(1, ...recentDays.map((item) => item.count));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admission operations / Performance"
        title="My Analytics"
        description="Workload and decision trends calculated from actual document-review history."
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Review actions"
          value={total}
          description="Recorded by your account"
          icon={Activity}
          tone="slate"
        />
        <MetricCard
          label="Verified share"
          value={`${verifiedPercent}%`}
          description={`${verified} verified of ${total} reviews`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          label="Clarifications"
          value={clarification}
          description="Requests for applicant correction"
          icon={MessageSquare}
          tone="amber"
        />
        <MetricCard
          label="Rejected"
          value={rejected}
          description="Rejected latest versions"
          icon={XCircle}
          tone="orange"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
              Decision distribution
            </p>
            <h2 className="mt-1 text-[14px] font-bold text-slate-900">
              Review outcomes
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: "Verified", value: verified, color: "bg-emerald-500" },
              {
                label: "Clarification requested",
                value: clarification,
                color: "bg-amber-500",
              },
              { label: "Rejected", value: rejected, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-slate-600">
                    {item.label}
                  </p>
                  <p className="text-[10px] font-bold text-slate-800">
                    {item.value} ·{" "}
                    {total ? Math.round((item.value / total) * 100) : 0}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${total ? (item.value / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!total && (
              <p className="text-[10px] text-slate-400">
                Decision charts will populate after you review submitted
                documents.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
              Recent activity
            </p>
            <h2 className="mt-1 text-[14px] font-bold text-slate-900">
              Last 7 days
            </h2>
          </div>
          <div className="mt-7 flex h-44 items-end justify-around gap-3 border-b border-slate-100 pb-2">
            {recentDays.map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[9px] font-bold text-slate-600">
                  {item.count || ""}
                </span>
                <div
                  className="flex w-full max-w-8 items-end rounded-t-md bg-amber-100"
                  style={{ height: "78%" }}
                >
                  <div
                    className="w-full rounded-t-md bg-amber-500 transition-all"
                    style={{
                      height: `${item.count ? Math.max(8, (item.count / maxDay) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[9px] text-slate-400">
            Counts are based on review timestamps in the officer history API.
          </p>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
            Document mix
          </p>
          <h2 className="mt-1 text-[14px] font-bold text-slate-900">
            Most reviewed document types
          </h2>
        </div>
        {byDocument.length ? (
          <div className="mt-5 space-y-3">
            {byDocument.map(([label, count]) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_minmax(100px,2fr)_32px] items-center gap-3"
              >
                <p className="truncate text-[10px] font-semibold text-slate-600">
                  {label}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#17242B]"
                    style={{ width: `${(count / maxDocumentCount) * 100}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-slate-800">
                  {count}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={ChartNoAxesCombined}
              title="No analytics yet"
              description="Your document review activity will appear here after the first decision."
            />
          </div>
        )}
      </section>
      <p className="text-[9px] leading-5 text-slate-400">
        Analytics describe recorded workflow activity only; they are not a
        quality score or an assessment of decision accuracy.
      </p>
    </div>
  );
}

function OfficerNotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  onOpen,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = notifications.filter((item) => {
    const text =
      `${item.title || ""} ${item.message || ""} ${item.applicationNumber || ""} ${item.type || ""}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (filter === "All" ||
        (filter === "Unread" ? !item.read : Boolean(item.read)))
    );
  });
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Communication centre / Admission officer"
        title="Notifications"
        description="Server-synchronised updates for application submissions, document uploads, applicant replies and admission workflow changes."
        action={
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 text-[10px] font-bold text-rose-600"
              >
                <X size={14} /> Clear inbox
              </button>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Total"
          value={notifications.length}
          description="Inbox updates"
          icon={Bell}
          tone="slate"
        />
        <MetricCard
          label="Unread"
          value={unreadCount}
          description="Need your attention"
          icon={AlertCircle}
          tone="orange"
        />
        <MetricCard
          label="Read"
          value={notifications.length - unreadCount}
          description="Already reviewed"
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <label className="relative block min-w-0 flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[10px] outline-none focus:border-amber-400 focus:bg-white"
            />
          </label>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {["All", "Unread", "Read"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-2 text-[9px] font-bold ${filter === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {filtered.length ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <article
                key={item.id}
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5 ${!item.read ? "bg-amber-50/40" : ""}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Bell size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[11px] font-bold text-slate-800">
                      {item.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.read ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-800"}`}
                    >
                      {item.read ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[9px] text-slate-400">
                    {formatDate(item.createdAt, true)}
                    {item.applicationNumber
                      ? ` · ${item.applicationNumber}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {(item.route || item.applicationId) && (
                    <button
                      onClick={() => onOpen(item)}
                      className="rounded-lg px-3 py-2 text-[9px] font-bold text-amber-800 hover:bg-amber-50"
                    >
                      Open update
                    </button>
                  )}
                  {!item.read && (
                    <button
                      onClick={() => onMarkAsRead(item.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-bold text-slate-600"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg px-2 py-2 text-[9px] font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Bell}
              title={
                notifications.length
                  ? "No matching notifications"
                  : "You're all caught up"
              }
              description={
                notifications.length
                  ? "Try another search or filter."
                  : "New application and document workflow updates will appear here."
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

function AdmissionOfficerEligibility({
  applications = [],
  loading = false,
  evaluatingApplicationId = "",
  results = {},
  notice = "",
  onEvaluate,
  onRefresh,
}) {
  const eligibilityQueue = applications.filter(
    (application) =>
      String(application.status || "").toUpperCase() ===
      "ELIGIBILITY_SCREENING",
  );

  const getCheckStyle = (result) => {
    const key = String(result || "").toUpperCase();
    if (key === "PASS")
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (key === "FAIL") return "border-rose-200 bg-rose-50 text-rose-800";
    return "border-amber-200 bg-amber-50 text-amber-800";
  };

  const getCheckIcon = (result) => {
    const key = String(result || "").toUpperCase();
    if (key === "PASS") return CheckCircle2;
    if (key === "FAIL") return XCircle;
    return Clock3;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Admission operations / Eligibility"
          title="Eligibility Screening"
          description="Run the active programme rules against the applicant's academic record and verified mandatory documents. Only eligible applications move to Department Review."
        />
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Waiting for eligibility screening
            </p>
            <ShieldCheck size={19} className="text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {eligibilityQueue.length}
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Applications at ELIGIBILITY_SCREENING
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Next hand-off
            </p>
            <GraduationCap size={19} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-lg font-extrabold text-slate-900">
            Department Review
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Eligible applications become available for Admin assignment
          </p>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-semibold leading-5 text-emerald-800">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-400">
          Loading applications awaiting eligibility screening...
        </div>
      ) : eligibilityQueue.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No applications waiting for eligibility screening"
          description="Applications appear here after all mandatory programme documents have been verified. Run the eligibility check once an application reaches this stage."
        />
      ) : (
        <div className="space-y-4">
          {eligibilityQueue.map((application) => {
            const result = results[String(application.id)];
            const isEvaluating =
              String(evaluatingApplicationId) === String(application.id);
            const checks = Array.isArray(result?.checks) ? result.checks : [];
            const resultStatus = String(result?.status || "").toUpperCase();
            const resultTone =
              resultStatus === "ELIGIBLE"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : resultStatus === "NOT_ELIGIBLE"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-amber-200 bg-amber-50 text-amber-800";

            return (
              <article
                key={application.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-extrabold text-slate-900">
                        {application.applicantName || "Applicant"}
                      </h2>
                      <StatusPill status={application.status} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {application.applicationNumber ||
                        `Application #${application.id}`}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {application.programmeName || "Programme not available"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {application.applicantEmail || "Email not available"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEvaluate?.(application)}
                    disabled={isEvaluating}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#17242B] px-4 text-[10px] font-bold text-amber-200 transition hover:bg-[#243740] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    {isEvaluating
                      ? "Checking..."
                      : result
                        ? "Run screening again"
                        : "Run eligibility screening"}
                  </button>
                </div>

                {result ? (
                  <div className="space-y-4 p-4 sm:p-5">
                    <div className={`rounded-xl border p-4 ${resultTone}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-extrabold">
                          Eligibility result: {formatStatus(result.status)}
                        </p>
                        {result.percentage !== null &&
                          result.percentage !== undefined && (
                            <span className="text-xs font-extrabold tabular-nums">
                              Academic percentage: {result.percentage}%
                            </span>
                          )}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-5">
                        {result.summary ||
                          "The screening result has been recorded."}
                      </p>
                    </div>

                    {checks.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-[10px] font-extrabold uppercase tracking-[1.5px] text-slate-500">
                          Rule-by-rule result
                        </h3>
                        <div className="space-y-2">
                          {checks.map((check, index) => {
                            const Icon = getCheckIcon(check.result);
                            return (
                              <div
                                key={`${check.criterion || "check"}-${index}`}
                                className={`flex items-start gap-3 rounded-xl border p-3 ${getCheckStyle(check.result)}`}
                              >
                                <Icon size={15} className="mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[11px] font-bold">
                                      {check.criterion ||
                                        `Criterion ${index + 1}`}
                                    </p>
                                    <span className="text-[9px] font-extrabold uppercase tracking-wide">
                                      {formatStatus(check.result)}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[10px] leading-5 opacity-80">
                                    {check.explanation ||
                                      "No additional explanation provided."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {resultStatus !== "ELIGIBLE" && (
                      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-600">
                        This application remains in Eligibility Screening.
                        Resolve missing academic information or document
                        verification issues, then run the screening again.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 sm:p-5">
                    <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-3 text-[10px] leading-5 text-amber-900/80">
                      The application has reached Eligibility Screening. Run the
                      configured rule check to verify its academic percentage
                      and mandatory documents. A passing result moves it to
                      Department Review; this does not make the final admission
                      decision.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdmissionOfficerDashboard() {
  const [activeSection, setActiveSection] = usePersistedDashboardSection(
    "credifit_admission_officer_active_section",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(() => readStoredUser());
  const [summary, setSummary] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [clarifications, setClarifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [reviewingDocumentId, setReviewingDocumentId] = useState("");
  const [updatingClarificationId, setUpdatingClarificationId] = useState("");
  const [evaluatingApplicationId, setEvaluatingApplicationId] = useState("");
  const [eligibilityResults, setEligibilityResults] = useState({});

  const loadWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    setWorkspaceError("");
    try {
      const [
        summaryResponse,
        queueResponse,
        historyResponse,
        clarificationResponse,
        notificationResponse,
        profileResponse,
      ] = await Promise.all([
        apiRequest("/dashboard/summary"),
        apiRequest("/workflow/officer/queue"),
        apiRequest("/workflow/officer/history"),
        apiRequest("/workflow/officer/clarifications"),
        apiRequest("/notifications?limit=100"),
        apiRequest("/profile/me").catch(() => null),
      ]);

      const nextSummary = unwrap(summaryResponse) || {};
      const nextQueue = unwrap(queueResponse);
      const nextHistory = unwrap(historyResponse);
      const nextClarifications = unwrap(clarificationResponse);
      const nextNotificationData = unwrap(notificationResponse) || {};
      const nextProfile = unwrap(profileResponse);

      if (!Array.isArray(nextQueue))
        throw new Error("The officer queue response was not a list.");
      if (!Array.isArray(nextHistory))
        throw new Error("The verification history response was not a list.");
      if (!Array.isArray(nextClarifications))
        throw new Error("The clarification response was not a list.");

      setSummary(nextSummary);
      setApplications(nextQueue);
      setReviewHistory(nextHistory);
      setClarifications(nextClarifications);
      setNotifications(
        Array.isArray(nextNotificationData.items)
          ? nextNotificationData.items
          : [],
      );
      setUnreadCount(Number(nextNotificationData.unreadCount || 0));
      if (nextProfile?.fullName)
        setProfile((previous) => ({ ...previous, ...nextProfile }));
      setSelectedApplicationId((previous) => {
        if (
          previous &&
          nextQueue.some((item) => String(item.id) === String(previous))
        )
          return String(previous);
        return nextQueue[0]?.id ? String(nextQueue[0].id) : "";
      });
    } catch (error) {
      setWorkspaceError(
        error.message || "Unable to load the admission officer workspace.",
      );
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  }, [activeSection]);

  const loadDocuments = useCallback(async (applicationId) => {
    if (!applicationId) {
      setDocuments([]);
      setDocumentsError("");
      setDocumentsLoading(false);
      return;
    }
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const response = await apiRequest(
        `/documents/applications/${applicationId}`,
      );
      const rows = unwrap(response);
      if (!Array.isArray(rows))
        throw new Error("The document response was not a list.");
      setDocuments(rows);
    } catch (error) {
      setDocuments([]);
      setDocumentsError(
        error.message || "Unable to load application documents.",
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Document Verification" && selectedApplicationId) {
      loadDocuments(selectedApplicationId);
    }
  }, [activeSection, selectedApplicationId, loadDocuments]);

  const selectedApplication =
    applications.find(
      (item) => String(item.id) === String(selectedApplicationId),
    ) || null;
  const displayName = profile?.fullName || profile?.name || "Admission Officer";
  const profileUserId =
    profile?.id || profile?.userId || profile?.email || "admission-officer";

  const openVerification = (applicationId = selectedApplicationId) => {
    if (applicationId) setSelectedApplicationId(String(applicationId));
    setActiveSection("Document Verification");
  };

  const handleReviewDocument = async (
    document,
    decision,
    reason = "",
    notes = "",
  ) => {
    if (decision === "DOWNLOAD") {
      try {
        const blob = await apiDownload(`/documents/${document.id}/download`);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = document.fileName || `document-${document.id}`;
        window.document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        return true;
      } catch (error) {
        setWorkspaceError(error.message || "Document download failed.");
        return false;
      }
    }

    setReviewingDocumentId(String(document.id));
    setWorkspaceError("");
    setNotice("");
    try {
      await apiRequest(`/documents/${document.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ decision, reason, notes }),
      });
      setNotice(
        `${document.documentType} marked as ${formatStatus(decision).toLowerCase()}.`,
      );
      await loadWorkspace();
      await loadDocuments(selectedApplicationId);
      return true;
    } catch (error) {
      setWorkspaceError(error.message || "Unable to save the document review.");
      return false;
    } finally {
      setReviewingDocumentId("");
    }
  };

  const handleEvaluateEligibility = async (application) => {
    if (!application?.id) return;
    setEvaluatingApplicationId(String(application.id));
    setWorkspaceError("");
    setNotice("");
    try {
      const response = await apiRequest(
        `/eligibility/applications/${application.id}/evaluate`,
        { method: "POST" },
      );
      const result = unwrap(response) || {};
      setEligibilityResults((previous) => ({
        ...previous,
        [String(application.id)]: result,
      }));
      setNotice(
        result.status === "ELIGIBLE"
          ? `${application.applicationNumber || "Application"} passed eligibility screening and moved to Department Review. It is now available in Admin Evaluator Assignments.`
          : `${application.applicationNumber || "Application"}: ${formatStatus(result.status || "INCOMPLETE")}. ${result.summary || "The application remains in Eligibility Screening."}`,
      );
      await loadWorkspace();
    } catch (error) {
      setWorkspaceError(
        error.message ||
          "Unable to run eligibility screening for this application.",
      );
    } finally {
      setEvaluatingApplicationId("");
    }
  };

  const updateClarification = async (item, status, instruction) => {
    if (status === "WAITING_FOR_APPLICANT" && instruction.trim().length < 5) {
      setWorkspaceError(
        "Enter an applicant instruction of at least 5 characters before sending the request.",
      );
      return;
    }
    setUpdatingClarificationId(String(item.id));
    setWorkspaceError("");
    setNotice("");
    try {
      await apiRequest(`/workflow/officer/clarifications/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(instruction ? { instruction } : {}),
        }),
      });
      setNotice(
        `Clarification ${item.applicationNumber} updated to ${formatStatus(status).toLowerCase()}.`,
      );
      await loadWorkspace();
      return true;
    } catch (error) {
      setWorkspaceError(
        error.message || "Unable to update the clarification request.",
      );
      return false;
    } finally {
      setUpdatingClarificationId("");
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((previous) =>
        previous.map((item) =>
          String(item.id) === String(id) ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setWorkspaceError(
        error.message || "Unable to mark notification as read.",
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
      setWorkspaceError(
        error.message || "Unable to mark notifications as read.",
      );
    }
  };

  const removeNotification = async (id) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      const removed = notifications.find(
        (item) => String(item.id) === String(id),
      );
      setNotifications((previous) =>
        previous.filter((item) => String(item.id) !== String(id)),
      );
      if (removed && !removed.read)
        setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setWorkspaceError(error.message || "Unable to remove notification.");
    }
  };

  const clearNotifications = async () => {
    try {
      await apiRequest("/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      setWorkspaceError(error.message || "Unable to clear notifications.");
    }
  };

  const openNotification = (item) => {
    if (item?.applicationId)
      setSelectedApplicationId(String(item.applicationId));
    const type = String(item?.type || "").toUpperCase();
    const route = String(item?.route || "").toLowerCase();
    if (type.includes("CLARIFICATION") || route.includes("clarification"))
      setActiveSection("Clarification Requests");
    else if (type.includes("DOCUMENT") || route.includes("document"))
      setActiveSection("Document Verification");
    else if (type.includes("ELIGIBILITY") || route.includes("eligibility"))
      setActiveSection("Eligibility Screening");
    else if (item?.applicationId || type.includes("APPLICATION"))
      setActiveSection("Applicant Queue");
    else setActiveSection("Notifications");
  };

  const renderContent = () => {
    if (activeSection === "Overview") {
      return (
        <AdmissionOfficerOverview
          summary={summary}
          queue={applications}
          loading={workspaceLoading}
          onOpenVerification={openVerification}
          onOpenQueue={() => setActiveSection("Applicant Queue")}
        />
      );
    }
    if (activeSection === "Applicant Queue") {
      return (
        <AdmissionOfficerQueue
          applications={applications}
          loading={workspaceLoading}
          error={workspaceError}
          onRefresh={loadWorkspace}
          onReview={openVerification}
        />
      );
    }
    if (activeSection === "Document Verification") {
      return (
        <AdmissionOfficerVerification
          applications={applications}
          selectedApplicationId={selectedApplicationId}
          onSelectApplication={setSelectedApplicationId}
          documents={documents}
          documentsLoading={documentsLoading}
          documentsError={documentsError}
          onReloadDocuments={() => loadDocuments(selectedApplicationId)}
          onReviewDocument={handleReviewDocument}
          reviewingDocumentId={reviewingDocumentId}
          notice={notice}
        />
      );
    }
    if (activeSection === "Eligibility Screening") {
      return (
        <AdmissionOfficerEligibility
          applications={applications}
          loading={workspaceLoading}
          evaluatingApplicationId={evaluatingApplicationId}
          results={eligibilityResults}
          notice={notice}
          onEvaluate={handleEvaluateEligibility}
          onRefresh={loadWorkspace}
        />
      );
    }
    if (activeSection === "Clarification Requests") {
      return (
        <AdmissionOfficerClarification
          requests={clarifications}
          loading={workspaceLoading}
          onUpdate={updateClarification}
          updatingId={updatingClarificationId}
        />
      );
    }
    if (activeSection === "Admission Workflow") {
      return (
        <AdmissionOfficerWorkflow
          onOpenQueue={() => setActiveSection("Applicant Queue")}
          onOpenVerification={() => openVerification()}
        />
      );
    }
    if (activeSection === "Verification History") {
      return (
        <AdmissionOfficerHistory
          history={reviewHistory}
          loading={workspaceLoading}
        />
      );
    }
    if (activeSection === "My Analytics") {
      return <AdmissionOfficerAnalytics history={reviewHistory} />;
    }
    return (
      <OfficerNotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onClearAll={clearNotifications}
        onOpen={openNotification}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <button
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-[19px] font-extrabold tracking-tight text-slate-900">
                  CrediFit
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-slate-400">
                  Admission Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>
          <div className="px-5 pb-3 pt-7">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-slate-400">
              Workspace
            </p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveSection(item.label)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-all ${isActive ? "bg-amber-50 text-amber-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-amber-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  />
                  <span>{item.label}</span>
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="ml-auto h-5 w-1 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                {displayName
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "AO"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-slate-800">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {profile?.email || "Admission Officer"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  CrediFit / Admission Officer
                </p>
                <h2 className="text-[16px] font-bold text-slate-900">
                  {activeSection}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadWorkspace}
                disabled={workspaceLoading}
                aria-label="Refresh workspace"
                title="Refresh workspace"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={workspaceLoading ? "animate-spin" : ""}
                />
              </button>
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onViewAll={() => setActiveSection("Notifications")}
                onNotificationOpen={openNotification}
                tone="gold"
              />
              <ProfileMenu
                role="Officer"
                userId={profileUserId}
                displayName={displayName}
                email={profile?.email || ""}
                department={profile?.department || ""}
                tone="gold"
              />
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9">
            {workspaceError && (
              <div
                role="alert"
                className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] leading-5 text-rose-700"
              >
                <span>{workspaceError}</span>
                <button
                  onClick={() => setWorkspaceError("")}
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {renderContent()}
            <div className="mt-9 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-4">
              <p className="text-[9px] text-slate-400">
                CrediFit · Admission Operations Workspace
              </p>
              <p className="text-[9px] font-medium text-slate-400">
                Secure, role-based admission workflow
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdmissionOfficerDashboard;
