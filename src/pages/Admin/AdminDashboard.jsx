import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LogOut,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  UserCog,
  X,
  ChartNoAxesCombined,
  Scale,
  Building2,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import AdminEvaluatorAssignments from "./AdminEvaluatorAssignments";
import AdminAdmissionCycles from "./AdminAdmissionCycles";
import AdminProgrammes from "./AdminProgrammes";
import AdminCollegeManagement from "./AdminCollegeManagement";
import { apiDownload, apiRequest } from "../../services/api";
import { logout } from "../../services/auth";
import ProfileMenu from "../../components/Profile/ProfileMenu";
import NotificationBell from "../../components/notifications/NotificationBell";
import NotificationCenterPage from "../../components/notifications/NotificationCenterPage";

// CrediFit — Admin Workspace
// Admin workspace data is loaded from the authenticated Admin APIs.

const adminNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Programme Management",
    icon: Building2,
    enabled: true,
  },
  {
    label: "College Management",
    icon: Building2,
    enabled: true,
  },
  {
    label: "Evaluator Assignments",
    icon: Users,
    enabled: true,
  },
  {
    label: "Admission Cycle Management",
    icon: CalendarDays,
    enabled: true,
  },
  {
    label: "Applicant Management",
    icon: Users,
    enabled: true,
  },
  {
    label: "Document Monitoring",
    icon: FileCheck2,
    enabled: true,
  },
  {
    label: "Eligibility Rules",
    icon: SlidersHorizontal,
    enabled: true,
  },
  {
    label: "Evaluation Rubric",
    icon: Scale,
    enabled: true,
  },
  {
    label: "Final Decisions",
    icon: CheckCircle2,
    enabled: true,
  },
  {
    label: "User & Role Management",
    icon: UserCog,
    enabled: true,
  },
  {
    label: "Reports & Analytics",
    icon: ChartNoAxesCombined,
    enabled: true,
  },
  {
    label: "Notifications",
    icon: Bell,
    enabled: true,
  },
];

const admissionStages = [
  {
    number: "01",
    label: "Application Submission",
    description: "Applications received from applicants",
    icon: ClipboardList,
  },
  {
    number: "02",
    label: "Document Verification",
    description: "Documents reviewed by Admission Officers",
    icon: FileCheck2,
  },
  {
    number: "03",
    label: "Eligibility Screening",
    description: "Rule-based eligibility assessment",
    icon: ShieldCheck,
  },
  {
    number: "04",
    label: "Department Review",
    description: "Academic assessment by evaluators",
    icon: GraduationCap,
  },
  {
    number: "05",
    label: "Final Admission Decision",
    description: "Final decision by authorized Admin",
    icon: CheckCircle2,
  },
];

function AdminStatCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_18px_rgba(15,23,42,0.035)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{item.label}</p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#172554]">
            {item.value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">
        {item.helper}
      </p>
    </motion.article>
  );
}

function AdminApplicationRegister({
  applications = [],
  loading = false,
  error = "",
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const getApplicantName = (application) =>
    application.applicantName ||
    application.applicant?.fullName ||
    application.applicant?.name ||
    "Name unavailable";

  const getApplicationId = (application) =>
    application.applicationNumber ||
    application.applicationId ||
    application.id ||
    "Reference unavailable";

  const getProgramme = (application) =>
    application.programmeName ||
    application.programme?.name ||
    "Programme unavailable";

  const getStage = (application) => {
    const stage =
      application.currentStage ||
      application.stageName ||
      application.admissionStage ||
      "Stage not specified";
    const stageLabels = {
      APPLICATION_SUBMISSION: "Application Submission",
      DOCUMENT_VERIFICATION: "Document Verification",
      ELIGIBILITY_SCREENING: "Eligibility Screening",
      DEPARTMENT_REVIEW: "Department Review",
      FINAL_ADMISSION_DECISION: "Final Admission Decision",
    };
    return stageLabels[stage] || String(stage).replaceAll("_", " ");
  };

  const getStatus = (application) =>
    String(application.status || application.applicationStatus || "Unknown")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const stages = [
    "Application Submission",
    "Document Verification",
    "Eligibility Screening",
    "Department Review",
    "Final Admission Decision",
  ];

  const statusOptions = [
    ...new Set(applications.map((application) => getStatus(application))),
  ].sort((a, b) => a.localeCompare(b));

  const filteredApplications = applications.filter((application) => {
    const searchableText = [
      getApplicantName(application),
      getApplicationId(application),
      getProgramme(application),
      application.departmentName || application.department?.name || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      searchQuery.trim().toLowerCase(),
    );

    const matchesStage =
      stageFilter === "all" || getStage(application) === stageFilter;

    const matchesStatus =
      statusFilter === "all" || getStatus(application) === statusFilter;

    return matchesSearch && matchesStage && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setStageFilter("all");
    setStatusFilter("all");
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status) => {
    const value = status.toLowerCase();

    if (value.includes("approved") || value.includes("admitted")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (value.includes("reject")) {
      return "bg-rose-50 text-rose-700 ring-rose-200";
    }

    if (value.includes("clarification")) {
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    if (value.includes("review") || value.includes("progress")) {
      return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    }

    return "bg-slate-100 text-slate-600 ring-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional administration
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            Applicant Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View and monitor applications across all departments and admission
            screening stages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRefresh?.()}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"
        >
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold text-slate-500">
            Total applications
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#172554]">
            {applications.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-semibold text-slate-500">
            Displayed results
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#172554]">
            {filteredApplications.length}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1">
          <p className="text-[10px] font-semibold text-slate-500">
            Admission stages
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#172554]">05</p>
        </div>
      </div>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#172554]">
            Find an applicant
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Search the institution-wide application register.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label
              htmlFor="admin-applicant-search"
              className="mb-1.5 block text-[10px] font-bold text-slate-500"
            >
              Search applicant
            </label>
            <input
              id="admin-applicant-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Applicant, application ID or programme..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All admission stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All application statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-[10px] text-slate-400">
            Showing {filteredApplications.length} of {applications.length}
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[10px] font-bold text-indigo-600 transition hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Application register */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-sm font-bold text-[#172554]">
            Institution-wide application register
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Applicant records and their current screening stage.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <Users size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172554]">
              {loading
                ? "Loading applications..."
                : "No applications available"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              {loading
                ? "Applicant records are being retrieved from the admission database."
                : "Applications will appear here after applicants create or submit an application."}
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-bold text-slate-600">
              No matching applications
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-4 py-4">Programme</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4">Admission stage</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((application, index) => (
                    <tr
                      key={getApplicationId(application) || index}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-800">
                          {getApplicantName(application)}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {getApplicationId(application)}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {getProgramme(application)}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {application.departmentName ||
                          application.department?.name ||
                          "Not specified"}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {getStage(application)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ring-1 ${statusStyle(
                            getStatus(application),
                          )}`}
                        >
                          {getStatus(application)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredApplications.map((application, index) => (
                <article
                  key={getApplicationId(application) || index}
                  className="space-y-3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#172554]">
                        {getApplicantName(application)}
                      </p>

                      <p className="mt-1 break-all text-[10px] text-slate-400">
                        {getApplicationId(application)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold capitalize ring-1 ${statusStyle(
                        getStatus(application),
                      )}`}
                    >
                      {getStatus(application)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {getProgramme(application)}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Stage: {getStage(application)}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700"
                  >
                    View application details
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Application detail modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApplication(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-applicant-detail-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                    Applicant record
                  </p>

                  <h2
                    id="admin-applicant-detail-title"
                    className="mt-1 text-base font-extrabold text-[#172554]"
                  >
                    Application details
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  aria-label="Close applicant details"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {[
                  ["Applicant name", getApplicantName(selectedApplication)],
                  ["Application ID", getApplicationId(selectedApplication)],
                  ["Programme", getProgramme(selectedApplication)],
                  [
                    "Department",
                    selectedApplication.departmentName ||
                      selectedApplication.department?.name ||
                      "Not specified",
                  ],
                  ["Current stage", getStage(selectedApplication)],
                  ["Status", getStatus(selectedApplication)],
                  [
                    "Submitted on",
                    formatDate(
                      selectedApplication.submittedAt ||
                        selectedApplication.applicationDate,
                    ),
                  ],
                  ["Priority", selectedApplication.priority || "Not specified"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      {label}
                    </p>

                    <p className="mt-2 break-words text-xs font-semibold text-slate-700">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 bg-indigo-50/50 p-4">
                <p className="text-[10px] leading-5 text-indigo-800">
                  Administrative overview only. Document verification,
                  eligibility processing and final admission decisions must
                  follow their respective authorized workflows.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
            className="absolute left-0 top-full z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
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

function AdminDocumentMonitoring({
  documents = [],
  loading = false,
  error = "",
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const documentRecords = Array.isArray(documents) ? documents : [];

  const getApplicantName = (record) =>
    record.applicantName ||
    record.applicant?.name ||
    record.name ||
    "Applicant";

  const getApplicationId = (record) =>
    record.applicationNumber ||
    record.applicationId ||
    record.applicantId ||
    record.applicant?.applicationId ||
    "—";

  const getDocumentName = (record) =>
    record.documentName ||
    record.documentType ||
    record.type ||
    record.name ||
    "Document";

  const getDocumentStatus = (record) =>
    record.verificationStatus || record.status || "Pending";

  const getDepartment = (record) =>
    record.programmeName ||
    record.department ||
    record.programme ||
    record.applicant?.programme ||
    "—";

  const getStatusBucket = (record) => {
    const status = String(getDocumentStatus(record)).toLowerCase();

    if (status.includes("verified") || status.includes("approved")) {
      return "verified";
    }

    if (status.includes("reject")) {
      return "rejected";
    }

    if (
      status.includes("clarification") ||
      status.includes("re-upload") ||
      status.includes("reupload") ||
      status.includes("resubmit") ||
      status.includes("correction")
    ) {
      return "clarification";
    }

    return "pending";
  };

  const getStatusStyle = (status) => {
    const bucket = getStatusBucket({ status });

    const styles = {
      verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
      pending: "border-amber-200 bg-amber-50 text-amber-700",
      rejected: "border-rose-200 bg-rose-50 text-rose-700",
      clarification: "border-indigo-200 bg-indigo-50 text-indigo-700",
    };

    return styles[bucket];
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not recorded";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Not recorded";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const verifiedCount = documentRecords.filter(
    (record) => getStatusBucket(record) === "verified",
  ).length;

  const pendingCount = documentRecords.filter(
    (record) => getStatusBucket(record) === "pending",
  ).length;

  const rejectedCount = documentRecords.filter(
    (record) => getStatusBucket(record) === "rejected",
  ).length;

  const clarificationCount = documentRecords.filter(
    (record) => getStatusBucket(record) === "clarification",
  ).length;

  const totalCount = documentRecords.length;

  const percentage = (count) =>
    totalCount === 0 ? 0 : Math.round((count / totalCount) * 100);

  const verifiedEnd = percentage(verifiedCount);
  const pendingEnd = verifiedEnd + percentage(pendingCount);
  const rejectedEnd = pendingEnd + percentage(rejectedCount);

  const donutGradient =
    totalCount === 0
      ? "conic-gradient(#334155 0% 100%)"
      : `conic-gradient(
          #34d399 0% ${verifiedEnd}%,
          #fbbf24 ${verifiedEnd}% ${pendingEnd}%,
          #fb7185 ${pendingEnd}% ${rejectedEnd}%,
          #818cf8 ${rejectedEnd}% 100%
        )`;

  const statusGroups = [
    {
      value: "verified",
      label: "Verified",
      count: verifiedCount,
      percentage: percentage(verifiedCount),
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      icon: CheckCircle2,
    },
    {
      value: "pending",
      label: "Pending",
      count: pendingCount,
      percentage: percentage(pendingCount),
      color: "bg-amber-400",
      textColor: "text-amber-700",
      icon: Clock3,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: rejectedCount,
      percentage: percentage(rejectedCount),
      color: "bg-rose-500",
      textColor: "text-rose-700",
      icon: X,
    },
    {
      value: "clarification",
      label: "Clarification",
      count: clarificationCount,
      percentage: percentage(clarificationCount),
      color: "bg-indigo-500",
      textColor: "text-indigo-700",
      icon: FileCheck2,
    },
  ];

  const documentTypeSummary = Object.entries(
    documentRecords.reduce((summary, record) => {
      const type = getDocumentName(record);
      summary[type] = (summary[type] || 0) + 1;
      return summary;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const documentTypes = documentTypeSummary.map((item) => item.name);

  const filteredDocuments = documentRecords.filter((record) => {
    const searchText = [
      getApplicantName(record),
      getApplicationId(record),
      getDocumentName(record),
      getDepartment(record),
      record.verifiedBy,
      record.reviewedBy,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(searchQuery.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "all" || getStatusBucket(record) === statusFilter;

    const matchesType =
      typeFilter === "all" || getDocumentName(record) === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const handleDocumentDownload = async (record) => {
    if (!record?.id) {
      setDownloadError(
        "This document does not have a valid download reference.",
      );
      return;
    }

    setDownloadingDocumentId(record.id);
    setDownloadError("");
    try {
      const blob = await apiDownload(`/documents/${record.id}/download`);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download =
        record.fileName || `${getDocumentName(record)}-${record.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setDownloadError(error.message || "Unable to download this document.");
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional administration / Verification
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            Document Monitoring
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track document verification activity and identify records that need
            attention across admission applications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm">
            <ShieldCheck size={14} className="text-indigo-600" />
            Read-only oversight
          </span>
          <button
            type="button"
            onClick={() => onRefresh?.()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm transition hover:bg-indigo-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"
        >
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
          Loading document monitoring records from the admission database...
        </div>
      )}

      {/* Analytics overview */}
      <section className="relative overflow-hidden rounded-2xl bg-[#111827] p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[40px] border-indigo-400/10" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300">
              Verification overview
            </p>

            <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
              Document status at a glance
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">
              A consolidated view of submitted documents and their current
              verification status.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Total documents
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">
                  {totalCount}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Verified rate
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-300">
                  {percentage(verifiedCount)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-center lg:pr-5">
            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2"
              style={{ background: donutGradient }}
              role="img"
              aria-label={`Document status distribution: ${verifiedCount} verified, ${pendingCount} pending, ${rejectedCount} rejected and ${clarificationCount} requiring clarification`}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#111827]">
                <p className="text-2xl font-extrabold tabular-nums">
                  {totalCount}
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Documents
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {statusGroups.map((item) => (
                <div key={item.value} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-slate-300">
                    {item.label}
                  </span>
                  <span className="ml-auto min-w-6 text-right text-[10px] font-bold tabular-nums text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clickable status distribution */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-sm font-bold text-[#172554]">
              Verification distribution
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Select a status to filter the document register.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="self-start text-[10px] font-bold text-indigo-600 hover:text-indigo-800 sm:self-auto"
          >
            View all statuses
          </button>
        </div>

        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
          {totalCount > 0 ? (
            statusGroups.map((item) => (
              <div
                key={item.value}
                className={`${item.color} transition-all`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.count}`}
              />
            ))
          ) : (
            <div className="h-full w-full bg-slate-200" />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {statusGroups.map((item) => {
            const Icon = item.icon;
            const isActive = statusFilter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(isActive ? "all" : item.value)}
                className={`rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-100"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {item.label}
                  </span>
                  <Icon size={14} className={item.textColor} />
                </div>

                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-xl font-extrabold tabular-nums text-[#172554]">
                    {item.count}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400">
                    {item.percentage}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Document type and review breakdown */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                Document categories
              </p>
              <h2 className="mt-1 text-sm font-bold text-[#172554]">
                Document type breakdown
              </h2>
            </div>

            <FileText size={18} className="text-indigo-600" />
          </div>

          {documentTypeSummary.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-[10px] leading-5 text-slate-400">
              Document type statistics will appear when verification records are
              connected.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {documentTypeSummary.slice(0, 5).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    setTypeFilter(typeFilter === item.name ? "all" : item.name)
                  }
                  className="block w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[11px] font-semibold text-slate-600">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-[#172554]">
                      {item.count}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.round(
                          (item.count / totalCount) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </button>
              ))}

              {documentTypeSummary.length > 5 && (
                <p className="text-[9px] text-slate-400">
                  Showing the five most common document types.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                Attention required
              </p>
              <h2 className="mt-1 text-sm font-bold text-[#172554]">
                Verification workload
              </h2>
            </div>

            <Clock3 size={18} className="text-amber-600" />
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className="flex w-full items-center justify-between rounded-xl bg-amber-50/80 p-3 text-left transition hover:bg-amber-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-600">
                  <Clock3 size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    Awaiting verification
                  </p>
                  <p className="mt-0.5 text-[9px] text-amber-700">
                    Pending review
                  </p>
                </div>
              </div>
              <span className="text-lg font-extrabold tabular-nums text-amber-800">
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("clarification")}
              className="flex w-full items-center justify-between rounded-xl bg-indigo-50/80 p-3 text-left transition hover:bg-indigo-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600">
                  <FileCheck2 size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold text-indigo-900">
                    Clarification required
                  </p>
                  <p className="mt-0.5 text-[9px] text-indigo-700">
                    Applicant follow-up
                  </p>
                </div>
              </div>
              <span className="text-lg font-extrabold tabular-nums text-indigo-800">
                {clarificationCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className="flex w-full items-center justify-between rounded-xl bg-rose-50/80 p-3 text-left transition hover:bg-rose-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600">
                  <X size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold text-rose-900">
                    Rejected documents
                  </p>
                  <p className="mt-0.5 text-[9px] text-rose-700">
                    Review recorded outcome
                  </p>
                </div>
              </div>
              <span className="text-lg font-extrabold tabular-nums text-rose-800">
                {rejectedCount}
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* Document register */}
      <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                Institution-wide records
              </p>

              <h2 className="mt-1 text-sm font-bold text-[#172554]">
                Document verification register
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Inspect individual records and their latest recorded status.
              </p>
            </div>

            <span className="self-start rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-500 sm:self-auto">
              {filteredDocuments.length} records displayed
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_220px]">
            <div>
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Search records
              </p>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Applicant, application ID or document..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <AdminFilterDropdown
              label="Verification status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
                { value: "clarification", label: "Clarification" },
              ]}
            />

            <AdminFilterDropdown
              label="Document type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All document types" },
                ...documentTypes.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
            />
          </div>

          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-400">Filters are active</p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileCheck2 size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172554]">
              {loading
                ? "Loading document records..."
                : documentRecords.length === 0
                  ? "No verification records yet"
                  : "No matching documents"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
              {loading
                ? "Document submissions are being retrieved from the admission database."
                : documentRecords.length === 0
                  ? "Document records will appear here after applicants submit their documents."
                  : "Try adjusting your search term or selected filters."}
            </p>

            {documentRecords.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop register */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-4 py-4">Document</th>
                    <th className="px-4 py-4">Programme</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Reviewed by</th>
                    <th className="px-4 py-4">Reviewed on</th>
                    <th className="px-4 py-4 text-right">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((record, index) => (
                    <tr
                      key={
                        record.id ||
                        record._id ||
                        `${getApplicationId(record)}-${index}`
                      }
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-800">
                          {getApplicantName(record)}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {getApplicationId(record)}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {getDocumentName(record)}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {getDepartment(record)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusStyle(
                            record.status || record.verificationStatus,
                          )}`}
                        >
                          {getDocumentStatus(record)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {record.verifiedBy ||
                          record.reviewedBy ||
                          "Not recorded"}
                      </td>

                      <td className="px-4 py-4 text-[10px] text-slate-500">
                        {formatDate(
                          record.reviewedAt ||
                            record.verifiedAt ||
                            record.uploadedAt,
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setDownloadError("");
                            setSelectedDocument(record);
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          View record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile register */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredDocuments.map((record, index) => (
                <article
                  key={
                    record.id ||
                    record._id ||
                    `${getApplicationId(record)}-${index}`
                  }
                  className="space-y-3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172554]">
                        {getApplicantName(record)}
                      </p>
                      <p className="mt-1 break-all text-[10px] text-slate-400">
                        {getApplicationId(record)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusStyle(
                        record.status || record.verificationStatus,
                      )}`}
                    >
                      {getDocumentStatus(record)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Document
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {getDocumentName(record)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Programme
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {getDepartment(record)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDocument(record)}
                    className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    View document record
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">
          Showing {filteredDocuments.length} of {documentRecords.length}{" "}
          document records
        </div>
      </section>

      {/* Read-only document detail modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedDocument(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                    Verification record
                  </p>

                  <h3 className="mt-1 text-base font-extrabold text-[#172554]">
                    {getDocumentName(selectedDocument)}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {getApplicantName(selectedDocument)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDocument(null)}
                  aria-label="Close details"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Current status
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#172554]">
                      {getDocumentStatus(selectedDocument)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-[9px] font-bold ${getStatusStyle(
                      selectedDocument.status ||
                        selectedDocument.verificationStatus,
                    )}`}
                  >
                    {getStatusBucket(selectedDocument)}
                  </span>
                </div>
              </div>

              {downloadError && (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-700"
                >
                  {downloadError}
                </div>
              )}

              <div className="mt-4 space-y-3">
                {[
                  ["Application ID", getApplicationId(selectedDocument)],
                  ["Programme", getDepartment(selectedDocument)],
                  [
                    "Verified / reviewed by",
                    selectedDocument.verifiedBy ||
                      selectedDocument.reviewedBy ||
                      "Not recorded",
                  ],
                  [
                    "Uploaded on",
                    formatDate(
                      selectedDocument.uploadedAt ||
                        selectedDocument.submittedAt,
                    ),
                  ],
                  [
                    "Reviewed on",
                    formatDate(
                      selectedDocument.reviewedAt ||
                        selectedDocument.verifiedAt,
                    ),
                  ],
                  [
                    "Remarks",
                    selectedDocument.latestNotes ||
                      selectedDocument.latestReason ||
                      selectedDocument.remarks ||
                      selectedDocument.comments ||
                      "No remarks recorded",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      {label}
                    </span>

                    <span className="max-w-[65%] break-words text-xs font-semibold text-slate-700 sm:text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-indigo-700"
                />
                <p className="text-[10px] leading-5 text-indigo-800">
                  Administrative monitoring only. Verification actions remain
                  with the authorised Admission Officer.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDocumentDownload(selectedDocument)}
                  disabled={downloadingDocumentId === selectedDocument.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                >
                  <FileText size={14} />
                  {downloadingDocumentId === selectedDocument.id
                    ? "Downloading..."
                    : "Download file"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocument(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Close record
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminEligibilityRules() {
  const mandatoryDocumentOptions = [
    "10th Markscard",
    "12th Markscard",
    "Leaving Certificate",
    "Degree Markscards",
  ];
  const [programmeSearch, setProgrammeSearch] = useState("");
  const [showProgrammeOptions, setShowProgrammeOptions] = useState(false);

  const optionalDocumentOptions = ["Hostel Application", "Mess Application"];

  const [rules, setRules] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadPolicyData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [programmeResponse, rulesResponse] = await Promise.all([
        apiRequest("/admin/programmes"),
        apiRequest("/admin/eligibility-rules"),
      ]);

      setProgrammes(
        Array.isArray(programmeResponse.data) ? programmeResponse.data : [],
      );

      setRules(Array.isArray(rulesResponse.data) ? rulesResponse.data : []);
    } catch (error) {
      setLoadError(error.message || "Unable to load eligibility policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicyData();
  }, [loadPolicyData]);
  const [showForm, setShowForm] = useState(false);
  const [formNotice, setFormNotice] = useState("");
  const [createdAccount, setCreatedAccount] = useState(null);
  const [manageNotice, setManageNotice] = useState("");

  const [programme, setProgramme] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [qualification, setQualification] = useState("");
  const [minimumMarks, setMinimumMarks] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState(
    mandatoryDocumentOptions,
  );
  const [optionalDocuments, setOptionalDocuments] = useState([]);
  const [remarks, setRemarks] = useState("");

  const totalRequiredDocuments = rules.reduce(
    (total, rule) => total + rule.requiredDocuments.length,
    0,
  );

  const toggleDocument = (documentName, selected, setter) => {
    setter((previous) =>
      selected
        ? [...previous, documentName]
        : previous.filter((item) => item !== documentName),
    );
  };

  const resetForm = () => {
    setProgrammeSearch("");
    setShowProgrammeOptions(false);
    setCreatedAccount(null);
    setProgramme("");
    setSelectedProgrammeId("");
    setQualification("");
    setMinimumMarks("");
    setRequiredDocuments(mandatoryDocumentOptions);
    setOptionalDocuments([]);
    setRemarks("");
    setFormNotice("");
    setShowForm(false);
  };

  const handleAddRule = async (event) => {
    event.preventDefault();
    setFormNotice("");

    const selectedProgramme = programmes.find(
      (item) => String(item.id) === String(selectedProgrammeId),
    );

    if (!selectedProgramme) {
      setFormNotice("Please choose a valid programme.");
      return;
    }

    if (!qualification.trim()) {
      setFormNotice("Enter the qualifying examination.");
      return;
    }

    if (
      minimumMarks === "" ||
      Number(minimumMarks) < 0 ||
      Number(minimumMarks) > 100
    ) {
      setFormNotice("Enter a percentage between 0 and 100.");
      return;
    }

    if (requiredDocuments.length === 0) {
      setFormNotice("Select at least one mandatory document.");
      return;
    }

    try {
      setFormNotice("Saving eligibility policy...");

      await apiRequest("/admin/eligibility-rules", {
        method: "POST",
        body: JSON.stringify({
          programmeId: Number(selectedProgramme.id),
          qualification: qualification.trim(),
          minimumPercentage: Number(minimumMarks),
          requiredDocuments,
          optionalDocuments,
          remarks: remarks.trim(),
          isActive: true,
        }),
      });

      await loadPolicyData();
      resetForm();
    } catch (error) {
      setFormNotice(error.message || "Unable to save eligibility policy.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not recorded";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not recorded";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredProgrammeOptions = programmes.filter((item) => {
    const query = programmeSearch.trim().toLowerCase();

    if (!query) return true;

    return [
      item.name,
      item.code,
      item.shortCode,
      item.category,
      item.department,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="space-y-6">
      {/* Policy studio header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#111827] p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[42px] border-indigo-400/10" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300">
              <SlidersHorizontal size={13} />
              Institutional policy / Configuration
            </p>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Eligibility Policy Studio
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-400">
              Define the academic and document requirements that guide
              programme-wise admission screening.
            </p>
          </div>

          <div className="relative flex items-center gap-5 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Configured policies
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">
                {rules.length}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Required documents
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-indigo-300">
                {totalRequiredDocuments}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormNotice("");
                setShowForm(true);
              }}
              className="ml-auto rounded-xl bg-indigo-500 px-4 py-3 text-[10px] font-bold text-white transition hover:bg-indigo-400"
            >
              + New policy
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-3 border-t border-white/10 pt-5">
          {[
            {
              number: "01",
              title: "Academic criteria",
              description: "Minimum qualification",
            },
            {
              number: "02",
              title: "Document conditions",
              description: "Required submissions",
            },
            {
              number: "03",
              title: "Eligibility screening",
              description: "Rule-based assessment",
            },
          ].map((step, index) => (
            <div
              key={step.number}
              className={`min-w-0 ${
                index !== 0 ? "border-l border-white/10 pl-3 sm:pl-5" : ""
              }`}
            >
              <p className="text-[9px] font-bold tracking-wider text-indigo-300">
                STEP {step.number}
              </p>

              <p className="mt-1.5 text-[10px] font-bold text-white sm:text-xs">
                {step.title}
              </p>

              <p className="mt-1 text-[9px] text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Temporary configuration warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-700" />
        <p className="text-[10px] leading-5 text-amber-800">
          {loadError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"
            >
              {loadError}
            </div>
          )}
        </p>
      </div>

      {/* Policy register */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
              Policy library
            </p>
            <h2 className="mt-1 text-base font-extrabold text-[#172554]">
              Programme requirements
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Each policy defines its own academic threshold and document list.
            </p>
          </div>

          <span className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-[9px] font-bold text-slate-500">
            {rules.length} policies configured
          </span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-400">
            Loading eligibility policies...
          </div>
        ) : rules.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172554]">
              Your policy library is empty
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              Start by defining the academic eligibility threshold and documents
              required for a programme.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-bold text-white transition hover:bg-indigo-700"
            >
              Create first policy
            </button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {rules.map((rule, index) => (
              <article
                key={rule.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Policy card heading */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <GraduationCap size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                        Policy {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-1 break-words text-sm font-extrabold text-[#172554]">
                        {rule.programme}
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Qualification: {rule.qualification}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                    Draft
                  </span>
                </div>

                {/* Academic threshold */}
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Minimum academic aggregate
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      Qualifying percentage requirement
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      Programme-specific threshold
                    </p>
                  </div>

                  <div
                    className="flex h-[76px] w-[76px] items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#4f46e5 0% ${rule.minimumPercentage ?? rule.minimumMarks}%, #e2e8f0 ${rule.minimumPercentage ?? rule.minimumMarks}% 100%)`,
                    }}
                  >
                    <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-white">
                      <p className="text-base font-extrabold text-[#172554]">
                        {rule.minimumPercentage ?? rule.minimumMarks}%
                      </p>
                      <p className="text-[8px] font-semibold uppercase text-slate-400">
                        Minimum
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document requirements */}
                <div className="space-y-4 p-4 sm:p-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                        <FileCheck2 size={14} className="text-emerald-600" />
                        Mandatory documents
                      </p>

                      <span className="text-[9px] font-bold text-slate-400">
                        {rule.requiredDocuments.length} required
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {rule.requiredDocuments.map((item) => (
                        <span
                          key={item}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-semibold text-emerald-800"
                        >
                          <CheckCircle2 size={11} />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-700">
                      <FileText size={14} className="text-slate-400" />
                      Optional documents
                    </p>

                    {rule.optionalDocuments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {rule.optionalDocuments.map((item) => (
                          <span
                            key={item}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-400">
                        No optional documents selected.
                      </p>
                    )}
                  </div>

                  {rule.remarks && (
                    <div className="rounded-lg border-l-2 border-indigo-400 bg-indigo-50/50 px-3 py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-700">
                        Additional conditions
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-600">
                        {rule.remarks}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-[9px] text-slate-400">
                      Created {formatDate(rule.createdAt)}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setRules((previous) =>
                          previous.filter((item) => item.id !== rule.id),
                        )
                      }
                      className="rounded-lg border border-rose-100 px-3 py-2 text-[9px] font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      Remove policy
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* New policy modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                    Policy studio / New configuration
                  </p>

                  <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                    Build eligibility policy
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  aria-label="Close policy form"
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleAddRule} className="space-y-5 p-5">
                {/* Programme information */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label
                      htmlFor="eligibility-programme-search"
                      className="mb-1.5 block text-[10px] font-bold text-slate-500"
                    >
                      Select programme *
                    </label>

                    <div className="relative">
                      <input
                        id="eligibility-programme-search"
                        type="text"
                        required
                        value={programmeSearch}
                        autoComplete="off"
                        placeholder="Search or select a programme..."
                        onFocus={() => setShowProgrammeOptions(true)}
                        onChange={(event) => {
                          const value = event.target.value;

                          setProgrammeSearch(value);
                          setSelectedProgrammeId("");
                          setProgramme("");
                          setShowProgrammeOptions(true);
                        }}
                        className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 pr-10 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />

                      <ChevronRight
                        size={16}
                        className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 transition-transform ${
                          showProgrammeOptions ? "rotate-[270deg]" : ""
                        }`}
                      />
                    </div>

                    {showProgrammeOptions && (
                      <div className="absolute left-0 right-0 top-full z-[120] mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                        {filteredProgrammeOptions.length > 0 ? (
                          filteredProgrammeOptions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedProgrammeId(String(item.id));
                                setProgramme(item.name);
                                setProgrammeSearch(
                                  `${item.name} (${item.code})`,
                                );
                                setShowProgrammeOptions(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition ${
                                String(item.id) === String(selectedProgrammeId)
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <div>
                                <p className="text-xs font-bold">{item.name}</p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {item.code} · {item.category}
                                </p>
                              </div>

                              {String(item.id) ===
                                String(selectedProgrammeId) && (
                                <CheckCircle2
                                  size={15}
                                  className="text-indigo-600"
                                />
                              )}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-5 text-center text-xs text-slate-400">
                            No matching programmes found.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedProgrammeId && (
                      <p className="mt-2 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 size={12} className="mr-1 inline" />
                        Programme selected
                      </p>
                    )}

                    {programmes.length === 0 && (
                      <p className="mt-1 text-[10px] text-rose-500">
                        No programmes are available. Add a programme first.
                      </p>
                    )}
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                      Qualifying examination *
                    </span>

                    <input
                      required
                      value={qualification}
                      onChange={(event) => setQualification(event.target.value)}
                      placeholder="e.g. 12th / PUC"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                </div>

                {/* Academic threshold */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600">
                      <GraduationCap size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#172554]">
                        Academic requirement
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Set the minimum aggregate percentage for this programme.
                      </p>
                    </div>
                  </div>

                  <label className="mt-4 block max-w-xs">
                    <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                      Minimum aggregate marks (%) *
                    </span>

                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={minimumMarks}
                        onChange={(event) =>
                          setMinimumMarks(event.target.value)
                        }
                        placeholder="Enter percentage"
                        className="h-11 w-full rounded-xl border border-indigo-100 bg-white px-3 pr-10 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </label>
                </div>

                {/* Required documents */}
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={15} className="text-emerald-600" />
                    <h3 className="text-xs font-bold text-[#172554]">
                      Mandatory documents *
                    </h3>
                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Applicants must submit the selected documents.
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {mandatoryDocumentOptions.map((item) => {
                      const checked = requiredDocuments.includes(item);

                      return (
                        <label
                          key={item}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition ${
                            checked
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              toggleDocument(
                                item,
                                event.target.checked,
                                setRequiredDocuments,
                              )
                            }
                            className="h-4 w-4 accent-emerald-600"
                          />

                          <span className="text-xs font-semibold text-slate-700">
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Optional documents */}
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-slate-500" />
                    <h3 className="text-xs font-bold text-[#172554]">
                      Optional documents
                    </h3>
                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    These are additional submissions, not mandatory eligibility
                    conditions.
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {optionalDocumentOptions.map((item) => {
                      const checked = optionalDocuments.includes(item);

                      return (
                        <label
                          key={item}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition ${
                            checked
                              ? "border-indigo-200 bg-indigo-50/60"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              toggleDocument(
                                item,
                                event.target.checked,
                                setOptionalDocuments,
                              )
                            }
                            className="h-4 w-4 accent-indigo-600"
                          />

                          <span className="text-xs font-semibold text-slate-700">
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Additional remarks */}
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    Additional conditions / remarks
                  </span>

                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    rows={3}
                    placeholder="Add any additional programme-specific conditions..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                {formNotice && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold leading-5 text-rose-700">
                    {formNotice}
                  </p>
                )}

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    Save session policy
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminEvaluationRubric() {
  const weightColors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-400",
    "bg-sky-500",
    "bg-violet-500",
    "bg-rose-500",
  ];

  const [rubrics, setRubrics] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [rubricsLoading, setRubricsLoading] = useState(true);
  const [rubricsError, setRubricsError] = useState("");

  const loadRubrics = useCallback(async () => {
    setRubricsLoading(true);
    setRubricsError("");

    try {
      const response = await apiRequest("/admin/rubrics");

      const savedRubrics = Array.isArray(response.data) ? response.data : [];

      setRubrics(
        savedRubrics.map((rubric) => {
          const savedCriteria = Array.isArray(rubric.criteria)
            ? rubric.criteria
            : [];

          return {
            id: rubric.id,
            name: rubric.name,
            programme: rubric.programme || "All programmes",
            programmeId: rubric.programmeId,
            isActive: Boolean(rubric.isActive),
            criteria: savedCriteria.map((criterion) => ({
              ...criterion,
              weight: Number(criterion.weight),
              maxScore: Number(criterion.maxScore ?? 10),
            })),
            totalWeight: savedCriteria.reduce(
              (total, criterion) => total + Number(criterion.weight || 0),
              0,
            ),
            createdAt: rubric.createdAt,
          };
        }),
      );
    } catch (error) {
      setRubricsError(error.message || "Unable to load evaluation rubrics.");
    } finally {
      setRubricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRubrics();
  }, [loadRubrics]);

  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        const response = await apiRequest("/admin/programmes");
        const programmeRows = Array.isArray(response.data) ? response.data : [];
        setProgrammes(
          programmeRows.filter(
            (item) =>
              item.isActive === true ||
              item.isActive === 1 ||
              item.isActive === "1" ||
              String(item.isActive).toLowerCase() === "true",
          ),
        );
      } catch (error) {
        console.error("Unable to load programme catalogue:", error);
      } finally {
        setProgrammesLoading(false);
      }
    };

    loadProgrammes();
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [rubricName, setRubricName] = useState("");
  const [programme, setProgramme] = useState("");
  const [programmeMenuOpen, setProgrammeMenuOpen] = useState(false);
  const [openCriterionId, setOpenCriterionId] = useState(null);
  const [notice, setNotice] = useState("");

  const criterionOptions = [
    "Academic Performance",
    "Subject Knowledge",
    "Programme Suitability",
    "Communication Skills",
  ];

  const [criteria, setCriteria] = useState([
    {
      id: 1,
      name: "",
      weight: "",
      description: "",
    },
  ]);

  const totalWeight = Number(
    criteria
      .reduce((total, criterion) => total + (Number(criterion.weight) || 0), 0)
      .toFixed(2),
  );

  const totalCriteria = rubrics.reduce(
    (total, rubric) => total + rubric.criteria.length,
    0,
  );

  const updateCriterion = (id, field, value) => {
    setCriteria((previous) =>
      previous.map((criterion) =>
        criterion.id === id ? { ...criterion, [field]: value } : criterion,
      ),
    );
  };

  const addCriterion = () => {
    setCriteria((previous) => {
      if (previous.length >= criterionOptions.length) return previous;
      return [
        ...previous,
        {
          id: Date.now() + Math.random(),
          name: "",
          weight: "",
          description: "",
        },
      ];
    });
  };

  const removeCriterion = (id) => {
    setCriteria((previous) =>
      previous.filter((criterion) => criterion.id !== id),
    );
  };

  const resetForm = () => {
    setRubricName("");
    setProgramme("");
    setProgrammeMenuOpen(false);
    setOpenCriterionId(null);
    setCriteria([
      {
        id: Date.now(),
        name: "",
        weight: "",
        description: "",
      },
    ]);
    setNotice("");
    setShowForm(false);
  };

  const handleSaveRubric = async (event) => {
    event.preventDefault();
    setNotice("");

    if (!rubricName.trim()) {
      setNotice("Enter a name for this evaluation rubric.");
      return;
    }

    if (criteria.length === 0) {
      setNotice("Add at least one assessment criterion.");
      return;
    }

    const incompleteCriterion = criteria.some(
      (criterion) =>
        !criterion.name.trim() ||
        criterion.weight === "" ||
        Number(criterion.weight) <= 0 ||
        Number(criterion.weight) > 100,
    );

    if (incompleteCriterion) {
      setNotice("Every criterion needs a name and a weight between 0 and 100.");
      return;
    }

    const duplicateNames = criteria.some((criterion, index) =>
      criteria.some(
        (other, otherIndex) =>
          index !== otherIndex &&
          other.name.trim().toLowerCase() ===
            criterion.name.trim().toLowerCase(),
      ),
    );

    if (duplicateNames) {
      setNotice("Each assessment criterion must have a unique name.");
      return;
    }

    if (totalWeight !== 100) {
      setNotice(
        `The total weightage must equal 100%. Current total: ${totalWeight}%.`,
      );
      return;
    }

    if (programme && programmesLoading) {
      setNotice("Programme catalogue is still loading. Please try again.");
      return;
    }

    const selectedProgramme = programme
      ? programmes.find((item) => String(item.id) === String(programme))
      : null;

    if (programme && !selectedProgramme) {
      setNotice("Choose an active programme from the dropdown.");
      return;
    }

    try {
      await apiRequest("/admin/rubrics", {
        method: "POST",
        body: JSON.stringify({
          name: rubricName.trim(),
          programmeId: selectedProgramme ? Number(selectedProgramme.id) : null,
          criteria: criteria.map((criterion) => ({
            name: criterion.name.trim(),
            description: criterion.description.trim(),
            weight: Number(criterion.weight),
            maxScore: 10,
          })),
          isActive: true,
        }),
      });

      await loadRubrics();
      resetForm();
    } catch (error) {
      setNotice(error.message || "Unable to save the evaluation rubric.");
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not recorded";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startNewRubric = () => {
    setNotice("");
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Scoring studio header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#111827] p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-violet-400/10" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
              <Scale size={13} />
              Assessment configuration / Scoring
            </p>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Evaluation Rubric Studio
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-400">
              Design the assessment framework by defining evaluation criteria,
              their relative importance and scoring guidance.
            </p>

            <button
              type="button"
              onClick={startNewRubric}
              className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-violet-400"
            >
              + Build new rubric
            </button>
          </div>

          <div className="relative grid grid-cols-2 gap-3 sm:min-w-[230px]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Rubric templates
              </p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums">
                {rubrics.length}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Total criteria
              </p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-violet-300">
                {totalCriteria}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-amber-300" />
            <p className="text-[10px] text-slate-400">
              Admin-controlled assessment configuration
            </p>
          </div>

          <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-[9px] font-bold text-violet-200">
            100% weightage standard
          </span>
        </div>
      </section>

      {/* Temporary configuration notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-700" />
        <p className="text-[10px] leading-5 text-amber-800">
          Rubrics configured here are temporary session records. They are not
          saved to the database or automatically applied to Evaluator
          assessments until both dashboards are integrated.
        </p>
      </div>

      {rubricsLoading && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          Loading saved evaluation rubrics...
        </p>
      )}

      {rubricsError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {rubricsError}
        </p>
      )}

      {/* Rubric design library */}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-violet-600">
              Assessment library
            </p>

            <h2 className="mt-1 text-base font-extrabold text-[#172554]">
              Scoring frameworks
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Each rubric contains weighted criteria for applicant evaluation.
            </p>
          </div>

          <span className="self-start rounded-lg bg-violet-50 px-3 py-1.5 text-[9px] font-bold text-violet-700">
            {rubrics.length} configured
          </span>
        </div>

        {rubrics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Scale size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172554]">
              No scoring frameworks yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              Build a rubric by choosing the assessment criteria and allocating
              a percentage weight to each one.
            </p>

            <button
              type="button"
              onClick={startNewRubric}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-[10px] font-bold text-white transition hover:bg-violet-700"
            >
              Create first rubric
            </button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {rubrics.map((rubric, rubricIndex) => (
              <article
                key={rubric.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="border-b border-slate-100 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <Scale size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">
                          Framework {String(rubricIndex + 1).padStart(2, "0")}
                        </p>

                        <h3 className="mt-1 break-words text-sm font-extrabold text-[#172554]">
                          {rubric.name}
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {rubric.programme}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                      Session draft
                    </span>
                  </div>

                  {/* Weighted composition bar */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Scoring composition
                      </p>

                      <p className="text-[10px] font-extrabold text-emerald-700">
                        {rubric.totalWeight}% allocated
                      </p>
                    </div>

                    <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                      {rubric.criteria.map((criterion, index) => (
                        <div
                          key={criterion.id}
                          className={`${weightColors[index % weightColors.length]} border-r border-white/30`}
                          style={{ width: `${criterion.weight}%` }}
                          title={`${criterion.name}: ${criterion.weight}%`}
                        />
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {rubric.criteria.map((criterion, index) => (
                        <span
                          key={criterion.id}
                          className="flex items-center gap-1 text-[9px] text-slate-500"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${weightColors[index % weightColors.length]}`}
                          />
                          {criterion.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Criteria breakdown */}
                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Assessment breakdown
                    </h4>

                    <span className="text-[9px] text-slate-400">
                      {rubric.criteria.length} criteria
                    </span>
                  </div>

                  {rubric.criteria.map((criterion, index) => (
                    <div key={criterion.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-700">
                            {criterion.name}
                          </p>

                          {criterion.description && (
                            <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-slate-400">
                              {criterion.description}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-xs font-extrabold tabular-nums text-[#172554]">
                          {criterion.weight}%
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${weightColors[index % weightColors.length]}`}
                          style={{ width: `${criterion.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[9px] text-slate-400">
                        Created {formatDate(rubric.createdAt)}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-slate-600">
                        Total allocated:{" "}
                        <span className="text-emerald-700">
                          {rubric.totalWeight}%
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setRubrics((previous) =>
                          previous.filter((item) => item.id !== rubric.id),
                        )
                      }
                      className="rounded-lg border border-rose-100 px-3 py-2 text-[9px] font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      Remove rubric
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Build rubric modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600">
                    Scoring studio / New framework
                  </p>

                  <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                    Build evaluation rubric
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  aria-label="Close rubric form"
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleSaveRubric}>
                <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                  {/* Form area */}
                  <div className="space-y-5 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                          Rubric name *
                        </span>

                        <input
                          required
                          value={rubricName}
                          onChange={(event) =>
                            setRubricName(event.target.value)
                          }
                          placeholder="e.g. Department Evaluation"
                          className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        />
                      </label>

                      <div
                        className="relative"
                        onBlur={(event) => {
                          if (
                            !event.currentTarget.contains(event.relatedTarget)
                          ) {
                            setProgrammeMenuOpen(false);
                          }
                        }}
                      >
                        <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                          Applicable programme
                        </span>

                        <button
                          type="button"
                          onClick={() => setProgrammeMenuOpen((open) => !open)}
                          aria-expanded={programmeMenuOpen}
                          disabled={programmesLoading}
                          className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-xs font-medium text-slate-700 shadow-sm outline-none transition hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:cursor-wait disabled:bg-slate-50"
                        >
                          <span className="truncate">
                            {programmesLoading
                              ? "Loading active programmes..."
                              : programme
                                ? programmes.find(
                                    (item) =>
                                      String(item.id) === String(programme),
                                  )?.name || "Choose a programme"
                                : "All active programmes"}
                          </span>
                          <ChevronRight
                            size={15}
                            className={`ml-3 shrink-0 rotate-90 text-slate-400 transition-transform ${
                              programmeMenuOpen ? "rotate-[270deg]" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {programmeMenuOpen && !programmesLoading && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute left-0 right-0 top-full z-[120] mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setProgramme("");
                                  setProgrammeMenuOpen(false);
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs transition ${
                                  !programme
                                    ? "bg-violet-50 font-semibold text-violet-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span>All active programmes</span>
                                {!programme && (
                                  <CheckCircle2
                                    size={15}
                                    className="text-violet-600"
                                  />
                                )}
                              </button>

                              {programmes.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setProgramme(String(item.id));
                                    setProgrammeMenuOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition ${
                                    String(item.id) === String(programme)
                                      ? "bg-violet-50 text-violet-700"
                                      : "text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-bold">
                                      {item.name}
                                    </span>
                                    <span className="mt-1 block text-[10px] text-slate-400">
                                      {item.code} · {item.category}
                                    </span>
                                  </span>
                                  {String(item.id) === String(programme) && (
                                    <CheckCircle2
                                      size={15}
                                      className="ml-3 shrink-0 text-violet-600"
                                    />
                                  )}
                                </button>
                              ))}

                              {programmes.length === 0 && (
                                <p className="px-3 py-5 text-center text-xs text-slate-400">
                                  No active programmes are available.
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-[#172554]">
                          Scoring criteria
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-400">
                          Define each criterion and its percentage share.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addCriterion}
                        disabled={criteria.length >= criterionOptions.length}
                        className="shrink-0 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        + Add criterion
                      </button>
                    </div>

                    <div className="space-y-3">
                      {criteria.map((criterion, index) => (
                        <div
                          key={criterion.id}
                          className="rounded-xl border border-slate-200 bg-white p-3.5"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${weightColors[index % weightColors.length]}`}
                              />
                              <p className="text-[10px] font-bold text-slate-600">
                                Criterion {String(index + 1).padStart(2, "0")}
                              </p>
                            </div>

                            {criteria.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCriterion(criterion.id)}
                                className="text-[9px] font-bold text-rose-600 hover:text-rose-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                            <div
                              className="relative"
                              onBlur={(event) => {
                                if (
                                  !event.currentTarget.contains(
                                    event.relatedTarget,
                                  )
                                ) {
                                  setOpenCriterionId(null);
                                }
                              }}
                            >
                              <span className="mb-1.5 block text-[9px] font-bold text-slate-500">
                                Criterion name *
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenCriterionId((current) =>
                                    current === criterion.id
                                      ? null
                                      : criterion.id,
                                  )
                                }
                                aria-expanded={openCriterionId === criterion.id}
                                className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-xs text-slate-700 outline-none transition hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                              >
                                <span
                                  className={
                                    criterion.name
                                      ? "font-medium"
                                      : "text-slate-400"
                                  }
                                >
                                  {criterion.name || "Select a criterion"}
                                </span>
                                <ChevronRight
                                  size={14}
                                  className={`ml-2 shrink-0 rotate-90 text-slate-400 transition-transform ${
                                    openCriterionId === criterion.id
                                      ? "rotate-[270deg]"
                                      : ""
                                  }`}
                                />
                              </button>

                              <AnimatePresence>
                                {openCriterionId === criterion.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute left-0 right-0 top-full z-[130] mt-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl"
                                  >
                                    {criterionOptions.map((option) => {
                                      const alreadyUsed = criteria.some(
                                        (other) =>
                                          other.id !== criterion.id &&
                                          other.name === option,
                                      );
                                      const selected =
                                        criterion.name === option;

                                      return (
                                        <button
                                          key={option}
                                          type="button"
                                          disabled={alreadyUsed}
                                          onClick={() => {
                                            updateCriterion(
                                              criterion.id,
                                              "name",
                                              option,
                                            );
                                            setOpenCriterionId(null);
                                          }}
                                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition ${
                                            selected
                                              ? "bg-violet-50 font-semibold text-violet-700"
                                              : alreadyUsed
                                                ? "cursor-not-allowed text-slate-300"
                                                : "text-slate-600 hover:bg-slate-50"
                                          }`}
                                        >
                                          <span>{option}</span>
                                          {selected && (
                                            <CheckCircle2
                                              size={14}
                                              className="text-violet-600"
                                            />
                                          )}
                                          {alreadyUsed && !selected && (
                                            <span className="text-[9px]">
                                              Already added
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <label className="block">
                              <span className="mb-1.5 block text-[9px] font-bold text-slate-500">
                                Weight (%) *
                              </span>

                              <input
                                type="number"
                                min="0.01"
                                max="100"
                                step="0.01"
                                value={criterion.weight}
                                onChange={(event) =>
                                  updateCriterion(
                                    criterion.id,
                                    "weight",
                                    event.target.value,
                                  )
                                }
                                placeholder="0"
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                              />
                            </label>
                          </div>

                          <label className="mt-3 block">
                            <span className="mb-1.5 block text-[9px] font-bold text-slate-500">
                              Evaluation guidance
                            </span>

                            <textarea
                              rows={2}
                              value={criterion.description}
                              onChange={(event) =>
                                updateCriterion(
                                  criterion.id,
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="What should the evaluator assess?"
                              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    {notice && (
                      <p className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold leading-5 text-rose-700">
                        {notice}
                      </p>
                    )}

                    <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700"
                      >
                        Save session rubric
                      </button>
                    </div>
                  </div>

                  {/* Live weightage preview */}
                  <aside className="border-t border-slate-100 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-violet-600">
                      Live configuration
                    </p>

                    <h3 className="mt-1 text-sm font-extrabold text-[#172554]">
                      Weightage preview
                    </h3>

                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      Allocation updates as you change the criteria.
                    </p>

                    <div
                      className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full p-2"
                      style={{
                        background: `conic-gradient(#8b5cf6 0% ${Math.min(totalWeight, 100)}%, #e2e8f0 ${Math.min(totalWeight, 100)}% 100%)`,
                      }}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-50">
                        <p className="text-3xl font-extrabold tabular-nums text-[#172554]">
                          {totalWeight}%
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Allocated
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-600">
                        Allocation status
                      </p>

                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                          totalWeight === 100
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {totalWeight === 100 ? "Complete" : "Incomplete"}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{
                          width: `${Math.min(totalWeight, 100)}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] font-semibold text-slate-500">
                      {totalWeight === 100
                        ? "All weightage has been allocated."
                        : totalWeight < 100
                          ? `${Number((100 - totalWeight).toFixed(2))}% remaining to allocate.`
                          : `${Number((totalWeight - 100).toFixed(2))}% above the allowed total.`}
                    </p>

                    <div className="mt-5 border-t border-slate-200 pt-4">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Criteria overview
                      </p>

                      <div className="mt-3 space-y-2.5">
                        {criteria.map((criterion, index) => (
                          <div
                            key={criterion.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${weightColors[index % weightColors.length]}`}
                              />
                              <span className="truncate text-[10px] text-slate-600">
                                {criterion.name || `Criterion ${index + 1}`}
                              </span>
                            </div>

                            <span className="shrink-0 text-[10px] font-bold tabular-nums text-slate-700">
                              {Number(criterion.weight) || 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-violet-100 bg-white p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-violet-600" />
                        <p className="text-[10px] font-bold text-violet-800">
                          Validation rule
                        </p>
                      </div>

                      <p className="mt-1 text-[9px] leading-5 text-slate-500">
                        A rubric can only be saved when every criterion is
                        complete and the total weightage equals exactly 100%.
                      </p>
                    </div>
                  </aside>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminFinalDecisions({
  pendingDecisions = [],
  admissionDecisions = [],
  onDecisionSaved,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState("");
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [notice, setNotice] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);

  const records = Array.isArray(pendingDecisions) ? pendingDecisions : [];
  const savedDecisionRecords = (
    Array.isArray(admissionDecisions) ? admissionDecisions : []
  )
    .filter((record) => record.decision)
    .map((record) => ({
      id: record.id,
      applicationId:
        record.applicationNumber || record.applicationId || record.id,
      applicantName: record.applicantName || "Applicant",
      programme: record.programmeName || "Programme unavailable",
      decision: String(record.decision).replaceAll("_", " "),
      remarks: record.decisionRemarks || "No decision remarks recorded",
      decidedAt: record.decidedAt,
    }));

  const getApplicantName = (record) =>
    record.applicantName ||
    record.applicant?.fullName ||
    record.applicant?.name ||
    "Applicant";

  const getApplicationId = (record) =>
    String(
      record.applicationNumber ||
        record.applicationId ||
        record.id ||
        record._id ||
        "Reference unavailable",
    );

  const getIdentity = (record) =>
    String(record.id || record._id || getApplicationId(record));

  const getProgramme = (record) =>
    record.programmeName ||
    record.programme?.name ||
    record.programme ||
    "Programme unavailable";

  const getEvaluatorName = (record) =>
    record.evaluatorName ||
    record.reviewedBy ||
    record.evaluator?.name ||
    record.assignedEvaluator?.name ||
    "Not recorded";

  const getRecommendation = (record) =>
    record.evaluatorRecommendation ||
    record.recommendation ||
    record.assessment?.recommendation ||
    "Not recorded";

  const getScore = (record) =>
    record.weightedPercentage ??
    record.overallPercentage ??
    record.overallScore ??
    record.scorePercentage ??
    null;

  const formatDate = (value) => {
    if (!value) return "Not recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not recorded";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const decidedIds = new Set(
    savedDecisionRecords.map((item) => String(item.applicationId)),
  );

  const remainingRecords = records.filter(
    (record) => !decidedIds.has(String(getApplicationId(record))),
  );

  const filteredRecords = remainingRecords.filter((record) => {
    const searchableText = [
      getApplicantName(record),
      getApplicationId(record),
      getProgramme(record),
      getEvaluatorName(record),
      getRecommendation(record),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery.trim().toLowerCase());
  });

  const selectedRecord =
    remainingRecords.find((record) => getIdentity(record) === selectedId) ||
    null;

  const admittedCount = savedDecisionRecords.filter(
    (item) => item.decision === "ADMITTED",
  ).length;

  const rejectedCount = savedDecisionRecords.filter(
    (item) => item.decision === "REJECTED",
  ).length;

  const handleSelectRecord = (record) => {
    setSelectedId(getIdentity(record));
    setSelectedDecision("");
    setDecisionRemarks("");
    setNotice("");
  };

  const handleDecisionSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRecord || !selectedDecision) {
      setNotice("Select an admission outcome before continuing.");
      return;
    }

    if (decisionRemarks.trim().length < 5) {
      setNotice("Enter a decision justification of at least 5 characters.");
      return;
    }

    setSavingDecision(true);
    setNotice("");

    try {
      await apiRequest(
        `/admin/applications/${selectedRecord.id}/final-decision`,
        {
          method: "POST",
          body: JSON.stringify({
            decision: selectedDecision === "Admitted" ? "ADMITTED" : "REJECTED",
            remarks: decisionRemarks.trim(),
          }),
        },
      );

      setSelectedId(null);
      setSelectedDecision("");
      setDecisionRemarks("");
      setNotice("Final admission decision saved successfully.");
      await onDecisionSaved?.();
    } catch (error) {
      setNotice(
        error.message || "Unable to save the final admission decision.",
      );
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Decision desk heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional administration / Decision authority
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            Final Decision Desk
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">
            Review completed assessments, consider evaluator recommendations and
            record the institution's final admission outcome.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:self-auto">
          <Scale size={16} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-600">
            Admin decision authority
          </span>
        </div>
      </div>

      {notice && !selectedRecord && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
        >
          {notice}
        </div>
      )}

      {/* Decision status strip */}
      <section className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-r border-slate-100 p-3 sm:p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            In review queue
          </p>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#172554]">
            {remainingRecords.length}
          </p>
        </div>

        <div className="border-r border-slate-100 p-3 sm:p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Admitted
          </p>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-emerald-600">
            {admittedCount}
          </p>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Rejected
          </p>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-rose-600">
            {rejectedCount}
          </p>
        </div>
      </section>

      {/* Decision workflow note */}
      <div className="flex items-start gap-2.5 rounded-xl border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-indigo-700" />
        <p className="text-[10px] leading-5 text-indigo-800">
          Final outcomes are saved to the admission database. The applicant is
          notified automatically after a decision is recorded.
        </p>
      </div>

      {/* Split decision workspace */}
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(290px,0.78fr)_minmax(0,1.55fr)]">
        {/* LEFT: Review queue */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                  Assessment queue
                </p>
                <h2 className="mt-1 text-sm font-bold text-[#172554]">
                  Awaiting your review
                </h2>
              </div>

              <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-extrabold text-indigo-700">
                {remainingRecords.length}
              </span>
            </div>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find an applicant..."
              className="mt-4 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {filteredRecords.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <ClipboardList size={20} />
              </div>

              <p className="mt-3 text-xs font-bold text-slate-700">
                {remainingRecords.length === 0
                  ? "Queue is currently empty"
                  : "No matching applications"}
              </p>

              <p className="mx-auto mt-1 max-w-xs text-[10px] leading-5 text-slate-400">
                {remainingRecords.length === 0
                  ? "Completed evaluator assessments will appear here when the review workflow is connected."
                  : "Try another applicant name or application reference."}
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
              {filteredRecords.map((record, index) => {
                const isSelected = getIdentity(record) === selectedId;

                const score = getScore(record);

                return (
                  <button
                    key={
                      record.id ||
                      record._id ||
                      `${getApplicationId(record)}-${index}`
                    }
                    type="button"
                    onClick={() => handleSelectRecord(record)}
                    className={`w-full border-l-[3px] p-4 text-left transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#172554]">
                          {getApplicantName(record)}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-400">
                          {getApplicationId(record)}
                        </p>
                      </div>

                      <ChevronRight
                        size={15}
                        className={`shrink-0 ${
                          isSelected ? "text-indigo-600" : "text-slate-300"
                        }`}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-medium text-slate-500">
                        {getProgramme(record)}
                      </span>

                      <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold tabular-nums text-slate-700">
                        {score === null ? "No score" : `${score}%`}
                      </span>
                    </div>

                    <p className="mt-2 text-[9px] text-slate-400">
                      Evaluator: {getEvaluatorName(record)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[9px] text-slate-400">
              Showing {filteredRecords.length} of {remainingRecords.length}{" "}
              pending records
            </p>
          </div>
        </div>

        {/* RIGHT: Decision workspace */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedRecord ? (
            <>
              {/* Selected applicant header */}
              <div className="bg-[#172554] p-5 text-white sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                      Selected application
                    </p>

                    <h2 className="mt-2 text-xl font-extrabold">
                      {getApplicantName(selectedRecord)}
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-300">
                      {getApplicationId(selectedRecord)}
                    </p>
                  </div>

                  <span className="self-start rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-bold text-indigo-100">
                    Ready for final review
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[9px] text-slate-400">Programme</p>
                    <p className="mt-1 text-xs font-bold text-white">
                      {getProgramme(selectedRecord)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[9px] text-slate-400">Evaluator</p>
                    <p className="mt-1 text-xs font-bold text-white">
                      {getEvaluatorName(selectedRecord)}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-1">
                    <p className="text-[9px] text-slate-400">
                      Assessment score
                    </p>
                    <p className="mt-1 text-xl font-extrabold tabular-nums text-emerald-300">
                      {getScore(selectedRecord) === null
                        ? "—"
                        : `${getScore(selectedRecord)}%`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {/* Evaluator recommendation */}
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                    Evaluator assessment
                  </p>

                  <h3 className="mt-1 text-sm font-bold text-[#172554]">
                    Recommendation received
                  </h3>

                  <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <p className="text-xs font-bold text-indigo-900">
                      {getRecommendation(selectedRecord)}
                    </p>

                    {selectedRecord.overallRemarks ||
                    selectedRecord.evaluatorRemarks ||
                    selectedRecord.remarks ||
                    selectedRecord.assessment?.remarks ? (
                      <p className="mt-2 text-[11px] leading-5 text-slate-600">
                        {selectedRecord.overallRemarks ||
                          selectedRecord.evaluatorRemarks ||
                          selectedRecord.remarks ||
                          selectedRecord.assessment?.remarks}
                      </p>
                    ) : (
                      <p className="mt-2 text-[10px] text-slate-400">
                        No additional evaluator remarks recorded.
                      </p>
                    )}
                  </div>
                </div>

                {/* Decision selection */}
                <form onSubmit={handleDecisionSubmit} className="space-y-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                      Decision authority
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-[#172554]">
                      Choose final outcome
                    </h3>

                    <p className="mt-1 text-[10px] leading-5 text-slate-400">
                      The evaluator recommendation is advisory. The final
                      admission outcome is recorded by the Admin.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDecision("Admitted");
                          setNotice("");
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                          selectedDecision === "Admitted"
                            ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                            : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-emerald-900">
                            Admit applicant
                          </p>
                          <p className="mt-1 text-[9px] text-emerald-700">
                            Record successful admission
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDecision("Rejected");
                          setNotice("");
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                          selectedDecision === "Rejected"
                            ? "border-rose-400 bg-rose-50 ring-2 ring-rose-100"
                            : "border-slate-200 hover:border-rose-200 hover:bg-rose-50/40"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                          <X size={18} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-rose-900">
                            Reject applicant
                          </p>
                          <p className="mt-1 text-[9px] text-rose-700">
                            Record unsuccessful admission
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Decision reason */}
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
                      Decision justification *
                    </span>

                    <textarea
                      required
                      rows={4}
                      value={decisionRemarks}
                      onChange={(event) =>
                        setDecisionRemarks(event.target.value)
                      }
                      placeholder="Document the reason supporting this final admission decision..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />

                    <span className="mt-1 block text-[9px] text-slate-400">
                      A clear reason is required before recording the outcome.
                    </span>
                  </label>

                  {notice && (
                    <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-[10px] font-semibold text-rose-700">
                      {notice}
                    </p>
                  )}

                  <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setSelectedDecision("");
                        setDecisionRemarks("");
                        setNotice("");
                      }}
                      className="text-xs font-bold text-slate-500 transition hover:text-slate-800"
                    >
                      Clear selection
                    </button>

                    <button
                      type="submit"
                      disabled={!selectedDecision || savingDecision}
                      className="rounded-xl bg-[#172554] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingDecision
                        ? "Saving decision..."
                        : "Record final decision"}
                      <ChevronRight size={14} className="ml-2 inline-block" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex min-h-[470px] flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Scale size={28} />
              </div>

              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                Decision workspace
              </p>

              <h2 className="mt-2 text-lg font-extrabold text-[#172554]">
                Select an application to begin
              </h2>

              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">
                Choose an application from the review queue. Its evaluation
                details and final decision controls will appear here.
              </p>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <ClipboardList size={15} className="text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-500">
                  {remainingRecords.length} applications awaiting review
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Decision history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-700">
              Activity history
            </p>

            <h2 className="mt-1 text-sm font-bold text-[#172554]">
              Recorded final decisions
            </h2>
          </div>

          <span className="self-start rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-bold text-slate-500">
            {savedDecisionRecords.length} outcomes
          </span>
        </div>

        {savedDecisionRecords.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-7">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Clock3 size={18} />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-600">
                No final decisions recorded yet
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Final outcomes saved by an administrator will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {savedDecisionRecords.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      item.decision === "ADMITTED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.decision === "ADMITTED" ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <X size={17} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#172554]">
                      {item.applicantName}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                      {item.applicationId} · {item.programme}
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      {item.remarks}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                      item.decision === "ADMITTED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {item.decision}
                  </span>

                  <span className="text-[9px] text-slate-400">
                    {formatDate(item.decidedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminUserRoleManagement() {
  const roleOptions = [
    { value: "Applicant", label: "Applicant" },
    { value: "Admission Officer", label: "Admission Officer" },
    { value: "Evaluator", label: "Evaluator" },
    { value: "Admin", label: "Admin" },
  ];

  const roleMeta = [
    {
      value: "Applicant",
      label: "Applicants",
      description: "Application access",
      icon: GraduationCap,
      iconStyle: "bg-sky-50 text-sky-700",
      activeStyle: "border-sky-300 bg-sky-50/70",
      dot: "bg-sky-500",
    },
    {
      value: "Admission Officer",
      label: "Admission Officers",
      description: "Document verification",
      icon: ClipboardList,
      iconStyle: "bg-amber-50 text-amber-700",
      activeStyle: "border-amber-300 bg-amber-50/70",
      dot: "bg-amber-500",
    },
    {
      value: "Evaluator",
      label: "Evaluators",
      description: "Academic assessment",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-700",
      activeStyle: "border-emerald-300 bg-emerald-50/70",
      dot: "bg-emerald-500",
    },
    {
      value: "Admin",
      label: "Administrators",
      description: "Institutional control",
      icon: ShieldCheck,
      iconStyle: "bg-indigo-50 text-indigo-700",
      activeStyle: "border-indigo-300 bg-indigo-50/70",
      dot: "bg-indigo-500",
    },
  ];

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [createdAccount, setCreatedAccount] = useState(null);
  const [manageNotice, setManageNotice] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableAdminProgrammes, setAvailableAdminProgrammes] = useState([]);
  const [adminProgrammesLoading, setAdminProgrammesLoading] = useState(false);
  const [newAdminProgrammeIds, setNewAdminProgrammeIds] = useState([]);
  const [selectedAdminAccessMode, setSelectedAdminAccessMode] = useState("ALL");
  const [selectedAdminProgrammeIds, setSelectedAdminProgrammeIds] = useState(
    [],
  );
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionSaving, setPermissionSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await apiRequest("/admin/users");

      const roleLabels = {
        APPLICANT: "Applicant",
        ADMISSION_OFFICER: "Admission Officer",
        EVALUATOR: "Evaluator",
        ADMIN: "Admin",
      };

      const savedUsers = Array.isArray(response.data) ? response.data : [];

      setUsers(
        savedUsers.map((user) => ({
          id: String(user.id),
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          department: user.department || "Not assigned",
          role: roleLabels[user.roleCode] || user.role,
          status:
            user.accountStatus === "ACTIVE"
              ? "Active"
              : user.accountStatus === "SUSPENDED"
                ? "Suspended"
                : "Inactive",
          createdAt: user.createdAt,
        })),
      );
    } catch (error) {
      setUsersError(error.message || "Unable to load accounts.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let cancelled = false;
    setAdminProgrammesLoading(true);
    apiRequest("/admin/programmes")
      .then((response) => {
        if (!cancelled) {
          const rows = Array.isArray(response?.data) ? response.data : [];
          setAvailableAdminProgrammes(
            rows.filter(
              (item) =>
                item.isActive === true ||
                item.isActive === 1 ||
                item.isActive === "1",
            ),
          );
        }
      })
      .catch((error) => {
        if (!cancelled)
          setManageNotice(error.message || "Unable to load programme options.");
      })
      .finally(() => {
        if (!cancelled) setAdminProgrammesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedUser || selectedUser.role !== "Admin") return undefined;
    let cancelled = false;
    setPermissionLoading(true);
    setManageNotice("");
    apiRequest(`/admin/users/${selectedUser.id}/programme-permissions`)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data || {};
        setSelectedAdminAccessMode(data.allowAll ? "ALL" : "SELECTED");
        setSelectedAdminProgrammeIds((data.programmeIds || []).map(String));
      })
      .catch((error) => {
        if (!cancelled)
          setManageNotice(
            error.message || "Unable to load Admin programme permissions.",
          );
      })
      .finally(() => {
        if (!cancelled) setPermissionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUser?.id, selectedUser?.role]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [newRole, setNewRole] = useState("Applicant");
  const [formNotice, setFormNotice] = useState("");

  const activeCount = users.filter((user) => user.status === "Active").length;

  const inactiveCount = users.length - activeCount;

  const getInitials = (name) =>
    String(name || "U")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const getRoleMeta = (role) =>
    roleMeta.find((item) => item.value === role) || roleMeta[0];

  const getRoleStyle = (role) => {
    const styles = {
      Applicant: "bg-sky-50 text-sky-700",
      "Admission Officer": "bg-amber-50 text-amber-700",
      Evaluator: "bg-emerald-50 text-emerald-700",
      Admin: "bg-indigo-50 text-indigo-700",
    };

    return styles[role] || "bg-slate-100 text-slate-600";
  };

  const getStatusStyle = (status) =>
    status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  const roleCounts = roleMeta.map((role) => ({
    ...role,
    count: users.filter((user) => user.role === role.value).length,
  }));

  const filteredUsers = users.filter((user) => {
    const searchableText = [
      user.fullName,
      user.email,
      user.department,
      user.role,
      user.userId,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(
      searchQuery.trim().toLowerCase(),
    );

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setDepartment("");
    setNewRole("Applicant");
    setNewAdminProgrammeIds([]);
    setFormNotice("");
    setShowForm(false);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setFormNotice("");

    if (!fullName.trim() || !email.trim()) {
      setFormNotice("Enter the user's full name and email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setFormNotice("Enter a valid email address.");
      return;
    }

    const duplicateEmail = users.some(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (duplicateEmail) {
      setFormNotice("An account with this email already exists.");
      return;
    }

    if (newRole === "Admin" && newAdminProgrammeIds.length === 0) {
      setFormNotice(
        "Choose at least one programme this Admin is allowed to manage.",
      );
      return;
    }

    const roleCodes = {
      Applicant: "APPLICANT",
      "Admission Officer": "ADMISSION_OFFICER",
      Evaluator: "EVALUATOR",
      Admin: "ADMIN",
    };

    try {
      const response = await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: roleCodes[newRole],
          department: department.trim(),
          programmeIds:
            newRole === "Admin" ? newAdminProgrammeIds.map(Number) : [],
        }),
      });

      const created = response.data;

      setCreatedAccount({
        fullName: created.fullName,
        email: created.email,
        userId: created.userId,
        role: newRole,
        temporaryPassword: created.temporaryPassword,
      });

      setFullName("");
      setEmail("");
      setDepartment("");
      setNewRole("Applicant");
      setNewAdminProgrammeIds([]);

      await loadUsers();
    } catch (error) {
      setFormNotice(error.message || "Unable to create the account.");
    }
  };
  const saveSelectedAdminPermissions = async () => {
    if (!selectedUser || selectedUser.role !== "Admin") return;
    if (
      selectedAdminAccessMode === "SELECTED" &&
      selectedAdminProgrammeIds.length === 0
    ) {
      setManageNotice(
        "Select at least one permitted programme, or choose all active programmes.",
      );
      return;
    }
    setPermissionSaving(true);
    setManageNotice("");
    try {
      await apiRequest(
        `/admin/users/${selectedUser.id}/programme-permissions`,
        {
          method: "PUT",
          body: JSON.stringify({
            allowAll: selectedAdminAccessMode === "ALL",
            programmeIds:
              selectedAdminAccessMode === "ALL"
                ? []
                : selectedAdminProgrammeIds.map(Number),
          }),
        },
      );
      setManageNotice(
        "Programme permissions saved. This Admin's College Management options are now restricted accordingly.",
      );
    } catch (error) {
      setManageNotice(error.message || "Unable to save programme permissions.");
    } finally {
      setPermissionSaving(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    const roleCodes = {
      Applicant: "APPLICANT",
      "Admission Officer": "ADMISSION_OFFICER",
      Evaluator: "EVALUATOR",
      Admin: "ADMIN",
    };

    try {
      setManageNotice("");

      await apiRequest(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: roleCodes[role],
        }),
      });

      await loadUsers();

      setSelectedUser((previous) =>
        previous ? { ...previous, role } : previous,
      );
      if (role !== "Admin") {
        setSelectedAdminAccessMode("SELECTED");
        setSelectedAdminProgrammeIds([]);
      }
    } catch (error) {
      setManageNotice(error.message || "Unable to update account role.");
    }
  };

  const toggleUserStatus = async (userId) => {
    const nextStatus = selectedUser.status === "Active" ? "INACTIVE" : "ACTIVE";

    try {
      setManageNotice("");

      await apiRequest(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          accountStatus: nextStatus,
        }),
      });

      await loadUsers();

      setSelectedUser((previous) =>
        previous
          ? {
              ...previous,
              status: nextStatus === "ACTIVE" ? "Active" : "Inactive",
            }
          : previous,
      );
    } catch (error) {
      setManageNotice(error.message || "Unable to update account status.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not recorded";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional administration / Access
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            People & Permissions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage institutional accounts and control the roles assigned across
            the CrediFit admission workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormNotice("");
            setShowForm(true);
          }}
          className="self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:self-auto"
        >
          + Add account
        </button>
      </div>

      {/* Access control header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#111827] p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[35px] border-indigo-400/10" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-300">
              <UserCog size={23} />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-300">
                Access control centre
              </p>

              <h2 className="mt-1 text-lg font-extrabold">
                Institutional directory
              </h2>

              <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-400">
                Four system roles. One central place to manage institutional
                access.
              </p>
            </div>
          </div>

          <div className="flex gap-5 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Total accounts
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">
                {users.length}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Active
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-300">
                {activeCount}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Inactive
              </p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-rose-300">
                {inactiveCount}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-start gap-2 border-t border-white/10 pt-4">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-amber-300" />
          <p className="text-[10px] leading-5 text-slate-400">
            Session preview only. Real account permissions and sign-in access
            require backend authentication and authorisation.
          </p>
        </div>
      </section>

      {/* Role tiles */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#172554]">System roles</h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Select a role to view its assigned accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`text-[10px] font-bold transition ${
              roleFilter === "all"
                ? "text-indigo-700"
                : "text-slate-400 hover:text-indigo-700"
            }`}
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {roleCounts.map((role) => {
            const Icon = role.icon;
            const isActive = roleFilter === role.value;

            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setRoleFilter(role.value)}
                className={`rounded-2xl border p-4 text-left transition ${
                  isActive
                    ? role.activeStyle
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${role.iconStyle}`}
                  >
                    <Icon size={18} />
                  </div>

                  {isActive && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </div>

                <p className="mt-4 text-xl font-extrabold tabular-nums text-[#172554]">
                  {role.count}
                </p>

                <p className="mt-0.5 text-xs font-bold text-slate-700">
                  {role.label}
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* People directory */}
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Role navigation */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Directory
          </p>

          <div className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                roleFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All accounts
              <span className="text-[10px] tabular-nums">{users.length}</span>
            </button>

            {roleCounts.map((role) => {
              const Icon = role.icon;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setRoleFilter(role.value)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                    roleFilter === role.value
                      ? "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} />

                  <span className="min-w-0 flex-1 text-[11px] font-semibold">
                    {role.label}
                  </span>

                  <span className="text-[10px] tabular-nums text-slate-400">
                    {role.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Account status
            </p>

            <div className="mt-2 space-y-1">
              {[
                { value: "all", label: "All statuses" },
                { value: "Active", label: "Active accounts" },
                { value: "Inactive", label: "Inactive accounts" },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setStatusFilter(status.value)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-[10px] font-semibold transition ${
                    statusFilter === status.value
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Account list */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                  People directory
                </p>

                <h2 className="mt-1 text-sm font-bold text-[#172554]">
                  {roleFilter === "all"
                    ? "All institutional accounts"
                    : roleFilter}
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  {filteredUsers.length} matching accounts
                </p>
              </div>

              {roleFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  className="self-start text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Clear role filter
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_175px]">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search name, email or account ID..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

              <AdminFilterDropdown
                label="Sort by role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[{ value: "all", label: "All roles" }, ...roleOptions]}
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users size={22} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#172554]">
                {users.length === 0
                  ? "Your directory is empty"
                  : "No matching accounts"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
                {users.length === 0
                  ? "Add an institutional account to start organising users by their system roles."
                  : "Try another search term or change the selected role and status."}
              </p>

              {users.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-4 rounded-lg bg-indigo-50 px-4 py-2.5 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                >
                  Add first account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Reset directory filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const role = getRoleMeta(user.role);
                const Icon = role.icon;

                return (
                  <article
                    key={user.id}
                    className="flex flex-col justify-between gap-3 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${role.iconStyle}`}
                      >
                        {getInitials(user.fullName)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#172554]">
                          {user.fullName}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {user.email}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {user.userId} · {user.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${getRoleStyle(
                          user.role,
                        )}`}
                      >
                        <Icon size={11} />
                        {user.role}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-bold ${getStatusStyle(
                          user.status,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {user.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedUser({ ...user })}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Manage
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">
            Displaying {filteredUsers.length} of {users.length} session accounts
          </div>
        </section>
      </div>

      {/* Add account modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) resetForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                    New institutional account
                  </p>

                  <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                    Add a person
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  aria-label="Close add account form"
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    Full name *
                  </span>

                  <input
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter full name"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    Email address *
                  </span>

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    Department / Programme
                  </span>

                  <input
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="e.g. Computer Applications"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <AdminFilterDropdown
                  label="Assign system role"
                  value={newRole}
                  onChange={(role) => {
                    setNewRole(role);
                    setNewAdminProgrammeIds([]);
                  }}
                  options={roleOptions}
                />
                {newRole === "Admin" && (
                  <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-[#172554]">
                          Allowed programmes *
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500">
                          This Admin can create college offerings only for the
                          courses selected here.
                        </p>
                      </div>
                      <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-indigo-700">
                        Course access
                      </span>
                    </div>
                    {adminProgrammesLoading ? (
                      <p className="mt-3 text-[10px] text-slate-400">
                        Loading active programmes...
                      </p>
                    ) : availableAdminProgrammes.length ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {availableAdminProgrammes.map((programme) => {
                          const checked = newAdminProgrammeIds.includes(
                            String(programme.id),
                          );
                          return (
                            <label
                              key={programme.id}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-semibold transition ${checked ? "border-indigo-300 bg-white text-indigo-800" : "border-slate-200 bg-white/70 text-slate-600 hover:border-indigo-200"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  setNewAdminProgrammeIds((current) =>
                                    event.target.checked
                                      ? [...current, String(programme.id)]
                                      : current.filter(
                                          (id) => id !== String(programme.id),
                                        ),
                                  )
                                }
                                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                              />
                              <span>
                                {programme.name}
                                {programme.shortCode
                                  ? ` (${programme.shortCode})`
                                  : ""}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-[10px] text-rose-600">
                        No active programmes exist. Add programmes before
                        creating a scoped Admin.
                      </p>
                    )}
                  </section>
                )}
                {createdAccount && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-800">
                      Account created successfully!
                    </p>

                    <p className="mt-2 text-xs text-emerald-700">
                      {createdAccount.fullName} · {createdAccount.role}
                    </p>

                    <p className="mt-3 text-[10px] font-bold uppercase text-emerald-700">
                      Temporary password — save this now
                    </p>

                    <p className="mt-1 select-all rounded-lg border border-emerald-200 bg-white p-3 font-mono text-sm font-bold text-slate-800">
                      {createdAccount.temporaryPassword}
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-emerald-700">
                      This password is displayed only once. Share it securely
                      with the account holder.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-700">
                    Role description
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {newRole === "Applicant" &&
                      "Manages their own application and tracks admission progress."}
                    {newRole === "Admission Officer" &&
                      "Handles applicant documents and verification workflows."}
                    {newRole === "Evaluator" &&
                      "Reviews assigned applications and submits assessment recommendations."}
                    {newRole === "Admin" &&
                      "Manages institutional rules, evaluation rubric, monitoring and final admission decisions."}
                  </p>
                </div>

                {formNotice && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
                    {formNotice}
                  </p>
                )}

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    Create session account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage account modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedUser(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-extrabold ${
                      getRoleMeta(selectedUser.role).iconStyle
                    }`}
                  >
                    {getInitials(selectedUser.fullName)}
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                      Account profile
                    </p>

                    <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                      {selectedUser.fullName}
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {selectedUser.userId}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close user details"
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  ["Email address", selectedUser.email],
                  ["Department / Programme", selectedUser.department],
                  ["Created on", formatDate(selectedUser.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      {label}
                    </span>

                    <span className="break-words text-xs font-semibold text-slate-700 sm:text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <AdminFilterDropdown
                  label="Assigned system role"
                  value={selectedUser.role}
                  onChange={(role) => updateUserRole(selectedUser.id, role)}
                  options={roleOptions}
                />
              </div>

              {selectedUser.role === "Admin" && (
                <section className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div>
                    <p className="text-xs font-extrabold text-[#172554]">
                      Admin course permissions
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">
                      Choose whether this Admin can manage every active
                      programme or only selected courses in College Management.
                    </p>
                  </div>
                  {permissionLoading ? (
                    <p className="mt-3 text-[10px] text-slate-400">
                      Loading permissions...
                    </p>
                  ) : (
                    <>
                      <div className="mt-3 grid gap-2">
                        <label
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-[10px] font-semibold ${selectedAdminAccessMode === "ALL" ? "border-indigo-300 text-indigo-800" : "border-slate-200 text-slate-600"}`}
                        >
                          <input
                            type="radio"
                            name="admin-programme-access"
                            checked={selectedAdminAccessMode === "ALL"}
                            onChange={() => setSelectedAdminAccessMode("ALL")}
                          />
                          All active programmes
                        </label>
                        <label
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-[10px] font-semibold ${selectedAdminAccessMode === "SELECTED" ? "border-indigo-300 text-indigo-800" : "border-slate-200 text-slate-600"}`}
                        >
                          <input
                            type="radio"
                            name="admin-programme-access"
                            checked={selectedAdminAccessMode === "SELECTED"}
                            onChange={() =>
                              setSelectedAdminAccessMode("SELECTED")
                            }
                          />
                          Only selected programmes
                        </label>
                      </div>
                      {selectedAdminAccessMode === "SELECTED" && (
                        <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
                          {availableAdminProgrammes.map((programme) => {
                            const checked = selectedAdminProgrammeIds.includes(
                              String(programme.id),
                            );
                            return (
                              <label
                                key={programme.id}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold ${checked ? "border-indigo-300 bg-white text-indigo-800" : "border-slate-200 bg-white text-slate-600"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) =>
                                    setSelectedAdminProgrammeIds((current) =>
                                      event.target.checked
                                        ? [...current, String(programme.id)]
                                        : current.filter(
                                            (id) => id !== String(programme.id),
                                          ),
                                    )
                                  }
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                                />
                                <span>
                                  {programme.name}
                                  {programme.shortCode
                                    ? ` (${programme.shortCode})`
                                    : ""}
                                </span>
                              </label>
                            );
                          })}
                          {availableAdminProgrammes.length === 0 && (
                            <p className="text-[10px] text-slate-400">
                              No active programmes are available.
                            </p>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={saveSelectedAdminPermissions}
                        disabled={permissionSaving || permissionLoading}
                        className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-[10px] font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {permissionSaving
                          ? "Saving permissions..."
                          : "Save course permissions"}
                      </button>
                    </>
                  )}
                </section>
              )}

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Account status
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {selectedUser.status === "Active"
                      ? "This account is active."
                      : "This account is inactive."}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${getStatusStyle(
                    selectedUser.status,
                  )}`}
                >
                  {selectedUser.status}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleUserStatus(selectedUser.id)}
                className={`mt-3 w-full rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  selectedUser.status === "Active"
                    ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {selectedUser.status === "Active"
                  ? "Mark account inactive"
                  : "Mark account active"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Done
              </button>

              <p className="mt-3 text-[9px] leading-4 text-slate-400">
                Role, account status and programme permissions are saved to the
                CrediFit backend and applied on subsequent data loads.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminReportsAnalytics({
  applications = [],
  documents = [],
  pendingDecisions = [],
  admissionDecisions = [],
  stageSummary = [],
  reports = null,
}) {
  const applicationRecords = Array.isArray(applications) ? applications : [];
  const documentRecords = Array.isArray(documents) ? documents : [];
  const evaluationRecords = Array.isArray(pendingDecisions)
    ? pendingDecisions
    : [];
  const decisionRecords = Array.isArray(admissionDecisions)
    ? admissionDecisions
    : [];

  const getProgramme = (record) =>
    record.programmeName ||
    record.programme?.name ||
    record.programme ||
    "Unassigned";

  const getStage = (record) =>
    record.currentStage?.name ||
    record.currentStage ||
    record.stageName ||
    record.admissionStage ||
    "Unassigned";

  const getStatus = (record) =>
    String(record.status || record.applicationStatus || "Unspecified")
      .replace(/[_-]+/g, " ")
      .trim();

  const getDecision = (record) =>
    String(record.decision || record.outcome || record.status || "Unspecified");

  const getScore = (record) => {
    const value =
      record.weightedPercentage ??
      record.overallPercentage ??
      record.overallScore ??
      record.scorePercentage ??
      record.score;

    if (value === null || value === undefined || value === "") return null;

    const number = Number(value);
    return Number.isFinite(number) && number >= 0 && number <= 100
      ? number
      : null;
  };

  const calculatedVerifiedCount = documentRecords.filter((record) => {
    const status = String(
      record.verificationStatus || record.status || "",
    ).toLowerCase();

    return status.includes("verified") || status.includes("approved");
  }).length;
  const verifiedCount = Number(
    reports?.documents?.verifiedDocuments ?? calculatedVerifiedCount,
  );

  const admittedCount = decisionRecords.filter((record) => {
    const decision = getDecision(record).toLowerCase();
    return decision.includes("admit") || decision.includes("approved");
  }).length;

  const rejectedCount = decisionRecords.filter((record) =>
    getDecision(record).toLowerCase().includes("reject"),
  ).length;

  const otherOutcomes = decisionRecords.length - admittedCount - rejectedCount;

  const scores = evaluationRecords
    .map(getScore)
    .filter((value) => value !== null);

  const averageScore =
    scores.length > 0
      ? scores.reduce((total, score) => total + score, 0) / scores.length
      : null;

  const stageRows = admissionStages.map((stage) => {
    const summary = stageSummary.find(
      (item) =>
        String(
          item.stageName || item.stage || item.name || "",
        ).toLowerCase() === stage.label.toLowerCase(),
    );

    const count =
      summary && summary.count !== undefined
        ? Number(summary.count) || 0
        : applicationRecords.filter(
            (record) =>
              String(getStage(record)).toLowerCase() ===
              stage.label.toLowerCase(),
          ).length;

    return { ...stage, count };
  });

  const maxStageCount = Math.max(1, ...stageRows.map((item) => item.count));

  const programmeRows = Array.isArray(reports?.byProgramme)
    ? reports.byProgramme
        .map((item) => ({
          name: item.programmeName,
          count: Number(item.applications || 0),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    : Object.entries(
        applicationRecords.reduce((result, record) => {
          const name = getProgramme(record);
          result[name] = (result[name] || 0) + 1;
          return result;
        }, {}),
      )
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

  const maxProgrammeCount = Math.max(
    1,
    ...programmeRows.map((item) => item.count),
  );

  const statusRows = Object.entries(
    applicationRecords.reduce((result, record) => {
      const status = getStatus(record);
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {}),
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const scoreBands = [
    { label: "Below 40%", min: 0, max: 40, color: "bg-rose-400" },
    { label: "40–59%", min: 40, max: 60, color: "bg-amber-400" },
    { label: "60–79%", min: 60, max: 80, color: "bg-sky-500" },
    { label: "80–100%", min: 80, max: 101, color: "bg-emerald-500" },
  ].map((band) => ({
    ...band,
    count: scores.filter((score) => score >= band.min && score < band.max)
      .length,
  }));

  const decisionTotal = reports?.totals
    ? Number(reports.totals.admitted || 0) +
      Number(reports.totals.rejected || 0) +
      Number(reports.totals.waitlisted || 0)
    : decisionRecords.length;

  const decisionPercent = (count) =>
    decisionTotal === 0 ? 0 : Math.round((count / decisionTotal) * 100);

  const admittedPercent = decisionPercent(admittedCount);
  const rejectedPercent = decisionPercent(rejectedCount);

  const outcomeGradient =
    decisionTotal === 0
      ? "conic-gradient(#e2e8f0 0% 100%)"
      : `conic-gradient(
          #34d399 0% ${admittedPercent}%,
          #fb7185 ${admittedPercent}% ${admittedPercent + rejectedPercent}%,
          #818cf8 ${admittedPercent + rejectedPercent}% 100%
        )`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional intelligence / Reporting
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            Reports & Analytics
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">
            Understand admission progress, document verification, programme
            distribution and evaluation performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:self-auto">
          <Activity size={15} className="text-indigo-600" />
          <span className="text-[10px] font-bold text-slate-600">
            Institutional overview
          </span>
        </div>
      </div>

      {/* Metric strip */}
      <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4">
        {[
          {
            label: "Applications",
            value: Number(
              reports?.totals?.totalApplications ?? applicationRecords.length,
            ),
            icon: FileText,
            color: "text-indigo-600",
          },
          {
            label: "Documents verified",
            value: verifiedCount,
            icon: FileCheck2,
            color: "text-emerald-600",
          },
          {
            label: "Final decisions",
            value: decisionTotal,
            icon: Scale,
            color: "text-violet-600",
          },
          {
            label: "Average evaluation",
            value: averageScore === null ? "—" : `${averageScore.toFixed(1)}%`,
            icon: ChartNoAxesCombined,
            color: "text-amber-600",
          },
        ].map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`p-4 sm:p-5 ${
                index % 2 === 1 ? "border-l border-slate-100" : ""
              } ${
                index >= 2 ? "border-t border-slate-100 sm:border-t-0" : ""
              } ${
                index !== 0 && index !== 2
                  ? "sm:border-l sm:border-slate-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={15} className={metric.color} />
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {metric.label}
                </p>
              </div>

              <p className="mt-3 text-2xl font-extrabold tabular-nums text-[#172554]">
                {metric.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Admission funnel / stage overview */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
            Admission journey
          </p>

          <h2 className="mt-1 text-sm font-bold text-[#172554]">
            Stage-wise application movement
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Current application count recorded at each screening stage.
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-5 sm:p-5">
          {stageRows.map((stage) => {
            const Icon = stage.icon;

            return (
              <div
                key={stage.number}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-indigo-500">
                    {stage.number}
                  </span>
                  <Icon size={15} className="text-indigo-600" />
                </div>

                <p className="mt-3 text-2xl font-extrabold tabular-nums text-[#172554]">
                  {stage.count}
                </p>

                <p className="mt-1 min-h-[32px] text-[9px] font-bold leading-4 text-slate-600">
                  {stage.label}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{
                      width: `${(stage.count / maxStageCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-indigo-50/60 px-4 py-3 sm:px-5">
          <p className="text-[9px] leading-5 text-indigo-800">
            Counts show applications currently recorded at each stage. They are
            not cumulative conversion or stage-to-stage pass rates.
          </p>
        </div>
      </section>

      {/* Programme and decision analysis */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                Department insights
              </p>
              <h2 className="mt-1 text-sm font-bold text-[#172554]">
                Programme-wise applications
              </h2>
            </div>

            <Building2 size={18} className="text-indigo-600" />
          </div>

          {programmeRows.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-[10px] leading-5 text-slate-400">
              Programme comparisons will appear when application records are
              connected.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {programmeRows.map((item, index) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-xs font-extrabold tabular-nums text-[#172554]">
                      {item.count}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${(item.count / maxProgrammeCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-700">
            Admission outcomes
          </p>

          <h2 className="mt-1 text-sm font-bold text-[#172554]">
            Final decision distribution
          </h2>

          <div className="mt-5 flex flex-col items-center">
            <div
              className="flex h-36 w-36 items-center justify-center rounded-full p-3"
              style={{ background: outcomeGradient }}
              role="img"
              aria-label={`${admittedCount} admitted, ${rejectedCount} rejected and ${otherOutcomes} other outcomes`}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                <p className="text-3xl font-extrabold tabular-nums text-[#172554]">
                  {decisionTotal}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Decisions
                </p>
              </div>
            </div>

            <div className="mt-5 w-full space-y-3">
              {[
                {
                  label: "Admitted",
                  count: admittedCount,
                  percent: admittedPercent,
                  color: "bg-emerald-500",
                },
                {
                  label: "Rejected",
                  count: rejectedCount,
                  percent: rejectedPercent,
                  color: "bg-rose-500",
                },
                {
                  label: "Other outcomes",
                  count: otherOutcomes,
                  percent: decisionPercent(otherOutcomes),
                  color: "bg-indigo-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-[10px] font-semibold text-slate-600">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[#172554]">
                      {item.count}
                    </span>
                    <span className="w-9 text-right text-[9px] text-slate-400">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Evaluation score analysis */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-violet-600">
              Academic assessment
            </p>

            <h2 className="mt-1 text-sm font-bold text-[#172554]">
              Evaluation score distribution
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Distribution of recorded evaluator scores.
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 px-4 py-2.5">
            <p className="text-[9px] font-semibold text-violet-600">
              Average score
            </p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-violet-800">
              {averageScore === null ? "—" : `${averageScore.toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-center rounded-xl bg-slate-50 p-4">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Evaluations with scores
            </p>

            <p className="mt-2 text-3xl font-extrabold tabular-nums text-[#172554]">
              {scores.length}
            </p>

            <p className="mt-2 text-[10px] leading-5 text-slate-400">
              Only records containing a valid percentage score are included.
            </p>
          </div>

          <div className="space-y-4">
            {scoreBands.map((band) => (
              <div key={band.label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold text-slate-600">
                    {band.label}
                  </span>

                  <span className="text-[10px] font-bold tabular-nums text-[#172554]">
                    {band.count}
                  </span>
                </div>

                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${band.color}`}
                    style={{
                      width:
                        scores.length === 0
                          ? "0%"
                          : `${(band.count / scores.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {scores.length === 0 && (
              <p className="text-[10px] leading-5 text-slate-400">
                Score distribution will appear after completed evaluations are
                connected.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Application status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Application register
            </p>

            <h2 className="mt-1 text-sm font-bold text-[#172554]">
              Application status breakdown
            </h2>
          </div>

          <FileText size={18} className="text-slate-500" />
        </div>

        {statusRows.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-[10px] text-slate-400">
            Application status statistics will appear when application records
            are connected.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {statusRows.map((item) => (
              <div
                key={item.name}
                className="min-w-[125px] flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <p className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {item.name}
                </p>

                <p className="mt-2 text-xl font-extrabold tabular-nums text-[#172554]">
                  {item.count}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data transparency */}
      <div className="flex items-start gap-2 border-t border-slate-200 pt-4">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />

        <p className="text-[9px] leading-5 text-slate-400">
          Analytics are calculated from records supplied to this dashboard.
          Missing backend data is shown as unavailable or zero. No sample
          admission statistics are generated.
        </p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const savedSection = localStorage.getItem(
        "credifit_admin_active_section",
      );
      return adminNavigation.some((item) => item.label === savedSection)
        ? savedSection
        : "Overview";
    } catch {
      return "Overview";
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminData, setAdminData] = useState({
    applications: [],
    documentVerifications: [],
    eligibilityResults: [],
    pendingDecisions: [],
    admissionDecisions: [],
    recentActivity: [],
    stageSummary: [],
  });
  const [overviewData, setOverviewData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState("");
  const [currentAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("credifit_user") || "null");
    } catch {
      return null;
    }
  });

  const loadAdminData = useCallback(async () => {
    setLoadingDashboard(true);
    setDashboardError("");

    try {
      const results = await Promise.allSettled([
        apiRequest("/admin/overview"),
        apiRequest("/admin/applications?limit=250"),
        apiRequest("/admin/documents?limit=300"),
        apiRequest("/admin/final-decisions"),
        apiRequest("/admin/reports"),
        apiRequest("/admin/audit-logs?limit=8"),
      ]);
      const errors = [];
      const readData = (result, label, fallback) => {
        if (result.status === "fulfilled")
          return result.value?.data ?? fallback;
        errors.push(`${label}: ${result.reason?.message || "Unable to load"}`);
        return fallback;
      };

      const overview = readData(results[0], "Overview", null);
      const applications = readData(results[1], "Applicant register", []);
      const documents = readData(results[2], "Document monitoring", []);
      const decisions = readData(results[3], "Final decisions", []);
      const reports = readData(results[4], "Reports", null);
      const activity = readData(results[5], "Recent activity", []);

      const applicationRows = Array.isArray(applications) ? applications : [];
      const documentRows = Array.isArray(documents) ? documents : [];
      const decisionRows = Array.isArray(decisions) ? decisions : [];
      const stageLabelByCode = {
        APPLICATION_SUBMISSION: "Application Submission",
        DOCUMENT_VERIFICATION: "Document Verification",
        ELIGIBILITY_SCREENING: "Eligibility Screening",
        DEPARTMENT_REVIEW: "Department Review",
        FINAL_ADMISSION_DECISION: "Final Admission Decision",
      };
      const apiStageRows = Array.isArray(reports?.byStage)
        ? reports.byStage
        : [];
      const stageSummary = admissionStages.map((stage) => {
        const row = apiStageRows.find(
          (item) =>
            (stageLabelByCode[item.stage] ||
              String(item.stage || "").replaceAll("_", " ")) === stage.label,
        );
        return { stageName: stage.label, count: Number(row?.count || 0) };
      });

      setOverviewData(overview);
      setReportsData(reports);
      setAdminData({
        applications: applicationRows,
        documentVerifications: documentRows,
        eligibilityResults: [],
        pendingDecisions: decisionRows.filter(
          (record) => record.status === "DECISION_PENDING" && !record.decision,
        ),
        admissionDecisions: decisionRows.filter((record) =>
          Boolean(record.decision),
        ),
        recentActivity: Array.isArray(activity) ? activity : [],
        stageSummary,
      });
      setDashboardError(errors.join(" · "));
    } catch (error) {
      setDashboardError(
        error.message || "Unable to load Admin dashboard data.",
      );
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiRequest("/notifications?limit=50");
      const data = response?.data || {};
      setNotifications(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.unreadCount || 0));
      setNotificationError("");
    } catch (error) {
      setNotificationError(error.message || "Unable to load notifications.");
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      setNotifications((previous) =>
        previous.map((item) =>
          String(item.id) === String(notificationId)
            ? { ...item, read: true }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark notification as read.",
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true })),
      );
      setUnreadCount(0);
      setNotificationError("");
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark notifications as read.",
      );
    }
  }, []);

  const removeNotification = useCallback(
    async (notificationId) => {
      const target = notifications.find(
        (item) => String(item.id) === String(notificationId),
      );
      try {
        await apiRequest(`/notifications/${notificationId}`, {
          method: "DELETE",
        });
        setNotifications((previous) =>
          previous.filter((item) => String(item.id) !== String(notificationId)),
        );
        if (target && !target.read)
          setUnreadCount((count) => Math.max(0, count - 1));
      } catch (error) {
        setNotificationError(error.message || "Unable to remove notification.");
      }
    },
    [notifications],
  );

  const clearAll = useCallback(async () => {
    try {
      await apiRequest("/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
      setNotificationError("");
    } catch (error) {
      setNotificationError(error.message || "Unable to clear notifications.");
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    loadNotifications();
  }, [loadAdminData, loadNotifications]);

  const changeActiveSection = (section) => {
    try {
      localStorage.setItem("credifit_admin_active_section", section);
    } catch {
      // The dashboard still works when browser storage is unavailable.
    }
    setActiveSection(section);
  };

  useEffect(() => {
    try {
      localStorage.setItem("credifit_admin_active_section", activeSection);
    } catch {
      // Ignore storage restrictions; navigation remains usable in this session.
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeSection]);

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const formatMetric = (value) =>
    value === null || value === undefined || value === ""
      ? "—"
      : Number(value).toLocaleString("en-IN");

  const statCards = [
    {
      label: "Total applications",
      value: formatMetric(overviewData?.total),
      helper: "All recorded applications",
      icon: FileText,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Under review",
      value: formatMetric(overviewData?.underReview),
      helper: "Across admission stages",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Awaiting final decision",
      value: formatMetric(overviewData?.awaitingDecision),
      helper: "Pending Admin action",
      icon: Scale,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Admitted",
      value: formatMetric(overviewData?.admitted),
      helper: "Final admission outcomes",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-800 lg:flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col bg-[#111827] text-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/30">
              <GraduationCap size={22} />
            </div>

            <div>
              <p className="text-[20px] font-extrabold tracking-tight">
                CrediFit
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Admin Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-7 pb-4">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Institutional control
          </p>

          <nav className="mt-4 space-y-1" aria-label="Admin navigation">
            {adminNavigation.map((item) => {
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
                      : `${item.label} will be available in a later phase`
                  }
                  onClick={() => {
                    if (!isEnabled) return;
                    changeActiveSection(item.label);
                    setMobileOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] font-semibold transition ${
                    isActive
                      ? "bg-indigo-500/15 text-white ring-1 ring-indigo-400/30"
                      : isEnabled
                        ? "text-slate-300 hover:bg-white/5 hover:text-white"
                        : "cursor-not-allowed text-slate-600"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-indigo-300"
                        : isEnabled
                          ? "text-slate-400"
                          : "text-slate-600"
                    }
                  />

                  <span className="min-w-0 flex-1">{item.label}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
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
          <div className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/15 to-transparent p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-300">
              <Building2 size={18} />
            </div>

            <p className="mt-3 text-xs font-bold text-white">
              Institutional oversight
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-400">
              Manage admission policies, monitor screening stages and maintain
              accountable admission decisions.
            </p>
          </div>

          {/* Officer Account */}
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={16} className="text-slate-400" />
            Sign Out
          </button>

          <p className="mt-2 px-2 text-[9px] text-slate-600">
            CrediFit · Institutional administration
          </p>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="min-w-0 flex-1">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                CrediFit / Administration
              </p>

              <p className="mt-0.5 truncate text-xs font-bold text-[#172554]">
                {activeSection}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden rounded-full border px-3 py-1.5 sm:block ${
                loadingDashboard
                  ? "border-amber-100 bg-amber-50"
                  : dashboardError
                    ? "border-rose-100 bg-rose-50"
                    : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <span
                className={`text-[10px] font-bold ${
                  loadingDashboard
                    ? "text-amber-700"
                    : dashboardError
                      ? "text-rose-700"
                      : "text-emerald-700"
                }`}
              >
                {loadingDashboard
                  ? "Syncing data"
                  : dashboardError
                    ? "Partial data"
                    : "Live data connected"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                loadAdminData();
                loadNotifications();
              }}
              title="Refresh Admin data"
              aria-label="Refresh Admin data"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <RefreshCw
                size={16}
                className={loadingDashboard ? "animate-spin" : ""}
              />
            </button>

            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onViewAll={() => changeActiveSection("Notifications")}
              onNotificationOpen={(item) => {
                if (item.applicationId) {
                  changeActiveSection("Applicant Management");
                } else {
                  changeActiveSection("Notifications");
                }
              }}
              tone="indigo"
            />

            <ProfileMenu
              role="Admin"
              userId={currentAdmin?.id || currentAdmin?.userId || "admin"}
              displayName={currentAdmin?.fullName || "Administrator"}
              email={currentAdmin?.email || ""}
              department={currentAdmin?.department || ""}
              tone="indigo"
            />
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-7 lg:p-9">
          {(dashboardError || notificationError) && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"
            >
              {dashboardError || notificationError}
            </div>
          )}
          {activeSection === "Overview" ? (
            <>
              {/* Overview introduction */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Institutional administration
                  </p>

                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
                    Admin Overview
                  </h1>

                  <p className="mt-2 text-xs text-slate-500">
                    Monitor the admission process and institutional screening
                    operations from one workspace.
                  </p>
                </div>

                <div className="text-[11px] font-medium text-slate-400">
                  {formattedDate}
                </div>
              </div>

              {/* Hero banner */}
              <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#111827] via-[#1E293B] to-[#312E81] p-6 text-white shadow-lg shadow-indigo-950/10 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-4 -top-12 h-52 w-52 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute bottom-[-100px] right-[25%] h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-200">
                      <ShieldCheck size={13} />
                      Administrative control centre
                    </div>

                    <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      Admission cycle overview
                    </h2>

                    <p className="mt-3 max-w-xl text-xs leading-6 text-slate-300">
                      Track applications across all five admission stages,
                      monitor departmental reviews and manage final admission
                      decisions with institutional oversight.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm lg:min-w-[220px]">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-200">
                      Current system status
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${loadingDashboard ? "bg-amber-400" : dashboardError ? "bg-rose-400" : "bg-emerald-400"}`}
                      />
                      <p className="text-sm font-bold text-white">
                        {loadingDashboard
                          ? "Connecting to backend"
                          : dashboardError
                            ? "Backend partially available"
                            : "Backend connected"}
                      </p>
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-slate-300">
                      Applicant, document, decision and reporting data are
                      loaded from the admission database.
                    </p>
                  </div>
                </div>
              </section>

              {/* Statistics */}
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-[#172554]">
                      Admission summary
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Institution-wide application statistics
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {statCards.map((item, index) => (
                    <AdminStatCard key={item.label} item={item} index={index} />
                  ))}
                </div>
              </section>

              {/* Admission pipeline */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)]">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                    Admission workflow
                  </p>

                  <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                    Stage-wise screening pipeline
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Monitor the progress of applications through all five
                    stages.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {admissionStages.map((stage) => {
                    const Icon = stage.icon;

                    const stageData = adminData.stageSummary.find(
                      (item) => item.stageName === stage.label,
                    );

                    return (
                      <div
                        key={stage.number}
                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-bold text-indigo-500">
                              STAGE {stage.number}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold text-slate-700">
                            {stage.label}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {stage.description}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-lg font-extrabold tabular-nums text-[#172554]">
                            {stageData?.count ?? "—"}
                          </p>

                          <p className="text-[9px] text-slate-400">
                            Applications
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                  <p className="text-[10px] text-slate-400">
                    Stage counts are supplied by the live application database.
                  </p>
                </div>
              </section>

              {/* Bottom dashboard panels */}
              <div className="grid gap-5 xl:grid-cols-2">
                {/* Final decisions */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)]">
                  <div className="border-b border-slate-100 px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                          Decision authority
                        </p>

                        <h2 className="mt-1 text-sm font-extrabold text-[#172554]">
                          Pending final decisions
                        </h2>
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Scale size={17} />
                      </span>
                    </div>
                  </div>

                  {adminData.pendingDecisions.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <CheckCircle2 size={21} />
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-600">
                        {loadingDashboard
                          ? "Loading decision queue..."
                          : "No decisions awaiting review"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Applications awaiting final decisions will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {adminData.pendingDecisions.slice(0, 5).map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {record.applicantName || "Applicant"}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {record.applicationNumber} ·{" "}
                              {record.programmeName}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-700">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent activity */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.035)]">
                  <div className="border-b border-slate-100 px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                          System monitoring
                        </p>

                        <h2 className="mt-1 text-sm font-extrabold text-[#172554]">
                          Recent administrative activity
                        </h2>
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Activity size={17} />
                      </span>
                    </div>
                  </div>

                  {adminData.recentActivity.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Activity size={21} />
                      </div>
                      <p className="mt-3 text-xs font-bold text-slate-600">
                        No recent activity
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Administrative actions and system updates will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {adminData.recentActivity.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {String(
                                item.action || "System activity",
                              ).replaceAll("_", " ")}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              {item.actorName || "System"} ·{" "}
                              {item.entityType || "Record"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[9px] text-slate-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>CrediFit · Admission Stage-Wise Screening Register</p>

                <p className="flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  Institutional administration workspace
                </p>
              </div>
            </>
          ) : activeSection === "Applicant Management" ? (
            <AdminApplicationRegister
              applications={adminData.applications}
              loading={loadingDashboard}
              error={dashboardError}
              onRefresh={loadAdminData}
            />
          ) : activeSection === "Document Monitoring" ? (
            <AdminDocumentMonitoring
              documents={adminData.documentVerifications}
              loading={loadingDashboard}
              error={dashboardError}
              onRefresh={loadAdminData}
            />
          ) : activeSection === "Eligibility Rules" ? (
            <AdminEligibilityRules />
          ) : activeSection === "Evaluation Rubric" ? (
            <AdminEvaluationRubric />
          ) : activeSection === "Evaluator Assignments" ? (
            <AdminEvaluatorAssignments />
          ) : activeSection === "Final Decisions" ? (
            <AdminFinalDecisions
              pendingDecisions={adminData.pendingDecisions}
              admissionDecisions={adminData.admissionDecisions}
              onDecisionSaved={loadAdminData}
            />
          ) : activeSection === "Programme Management" ? (
            <AdminProgrammes />
          ) : activeSection === "College Management" ? (
            <AdminCollegeManagement />
          ) : activeSection === "Admission Cycle Management" ? (
            <AdminAdmissionCycles />
          ) : activeSection === "User & Role Management" ? (
            <AdminUserRoleManagement />
          ) : activeSection === "Reports & Analytics" ? (
            <AdminReportsAnalytics
              applications={adminData.applications}
              documents={adminData.documentVerifications}
              pendingDecisions={adminData.pendingDecisions}
              admissionDecisions={adminData.admissionDecisions}
              stageSummary={adminData.stageSummary}
              reports={reportsData}
            />
          ) : activeSection === "Notifications" ? (
            <NotificationCenterPage
              role="Admin"
              tone="indigo"
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onRemove={removeNotification}
              onClearAll={clearAll}
              onNotificationOpen={(item) => {
                if (item.applicationId) {
                  changeActiveSection("Applicant Management");
                }
              }}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
