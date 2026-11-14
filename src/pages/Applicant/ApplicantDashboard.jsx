import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../services/auth";
import { apiRequest } from "../../services/api";
import usePersistedDashboardSection from "../../hooks/usePersistedDashboardSection.js";

import {
  LayoutDashboard,
  FileText,
  FolderCheck,
  Bell,
  UserRound,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Upload,
  ShieldCheck,
  CircleHelp,
  MoreHorizontal,
  Search,
  FileCheck2,
  Save,
  LoaderCircle,
  Download,
  Check,
  MessageSquareText,
  Send,
  Building2,
  MapPin,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, target: "#overview" },

  { label: "My Application", icon: FileText, target: "#application-details" },

  { label: "Documents", icon: FolderCheck, target: "#documents" },

  { label: "Eligibility", icon: ShieldCheck, target: "#eligibility" },

  { label: "Notifications", icon: Bell, target: "#notifications" },
  {
    label: "Clarifications",
    icon: MessageSquareText,
    target: "#clarifications",
  },
];

const applicationStages = [
  {
    code: "APPLICATION_SUBMISSION",
    title: "Application submission",
    description: "Complete and submit your admission application.",
  },
  {
    code: "DOCUMENT_VERIFICATION",
    title: "Document verification",
    description: "The admission team reviews your uploaded documents.",
  },
  {
    code: "ELIGIBILITY_SCREENING",
    title: "Eligibility screening",
    description:
      "Your academic qualifications are checked against programme requirements.",
  },
  {
    code: "DEPARTMENT_REVIEW",
    title: "Department review",
    description: "The department evaluates your application where applicable.",
  },
  {
    code: "FINAL_ADMISSION_DECISION",
    title: "Final admission decision",
    description: "The institution records and publishes the final outcome.",
  },
];

function normalizeDocumentName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getDocumentStatus(status) {
  const statuses = {
    PENDING: {
      label: "Pending verification",
      className: "bg-amber-50 text-amber-700",
    },
    VERIFIED: {
      label: "Verified",
      className: "bg-emerald-50 text-emerald-700",
    },
    CLARIFICATION_REQUESTED: {
      label: "Correction requested",
      className: "bg-orange-50 text-orange-700",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-rose-50 text-rose-700",
    },
  };

  return (
    statuses[String(status || "PENDING").toUpperCase()] || {
      label: status || "Pending",
      className: "bg-slate-100 text-slate-600",
    }
  );
}

function formatDocumentDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Sidebar({
  mobileNavOpen,

  setMobileNavOpen,

  activeSection,

  setActiveSection,

  unreadNotificationCount,
}) {
  return (
    <>
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-7">
          <a
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[#173b61]"
          >
            CrediFit<span className="text-blue-500">.</span>
          </a>

          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active = activeSection === item.label;

              return (
                <a
                  key={item.label}
                  href={item.target}
                  onClick={() => {
                    setActiveSection(item.label);

                    setMobileNavOpen(false);
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#173b61] text-white shadow-lg shadow-blue-950/10"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-blue-200"
                        : "text-slate-400 group-hover:text-blue-600"
                    }
                  />

                  {item.label}

                  {item.label === "Notifications" && (
                    <span
                      className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {unreadNotificationCount}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="mt-9 px-5">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Account
          </p>

          <a
            href="#profile"
            onClick={() => {
              setActiveSection("Profile");

              setMobileNavOpen(false);
            }}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <UserRound size={18} className="text-slate-400" />
            My Profile
          </a>

          <a
            href="#settings"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Settings size={18} className="text-slate-400" />
            Settings
          </a>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-2xl bg-[#f3f7fd] p-4">
            <div className="flex items-center gap-2 text-[#173b61]">
              <CircleHelp size={18} />

              <p className="text-sm font-bold">Need assistance?</p>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Contact the admission support team for help with your application.
            </p>

            <a
              href="mailto:admissions@example.edu"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
            >
              Get help <ArrowUpRight size={13} />
            </a>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

function ApplicantDashboard() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [activeSection, setActiveSection] = usePersistedDashboardSection(
    "credifit_applicant_active_section",
  );
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [applicationId, setApplicationId] = useState(null);

  const [application, setApplication] = useState(null);

  const [applicationStatus, setApplicationStatus] = useState("");

  const [applicationLoaded, setApplicationLoaded] = useState(false);

  const [applicationError, setApplicationError] = useState("");

  const [applicationNotice, setApplicationNotice] = useState("");

  const [personalStatement, setPersonalStatement] = useState("");

  const [applicationSaving, setApplicationSaving] = useState(false);

  const [applicationSubmitting, setApplicationSubmitting] = useState(false);

  const [applicationStarting, setApplicationStarting] = useState(false);

  const [collegeOfferings, setCollegeOfferings] = useState([]);
  const [collegePreferences, setCollegePreferences] = useState([]);
  const [selectedCollegeProgrammeIds, setSelectedCollegeProgrammeIds] =
    useState([]);
  const [savedCollegeProgrammeIds, setSavedCollegeProgrammeIds] = useState([]);
  const [collegeDataLoading, setCollegeDataLoading] = useState(false);
  const [collegePreferencesSaving, setCollegePreferencesSaving] =
    useState(false);
  const [collegePreferencesError, setCollegePreferencesError] = useState("");
  const [collegePreferencesNotice, setCollegePreferencesNotice] = useState("");

  const [documentRequirements, setDocumentRequirements] = useState([]);

  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [uploadingDocumentId, setUploadingDocumentId] = useState("");

  const [documentError, setDocumentError] = useState("");

  const [documentNotice, setDocumentNotice] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [profile, setProfile] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);

  const [profileError, setProfileError] = useState("");

  const [applicationList, setApplicationList] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityError, setEligibilityError] = useState("");

  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  const [clarificationRequests, setClarificationRequests] = useState([]);
  const [clarificationResponses, setClarificationResponses] = useState({});
  const [clarificationSubmitting, setClarificationSubmitting] = useState("");
  const [clarificationError, setClarificationError] = useState("");
  const [clarificationNotice, setClarificationNotice] = useState("");

  const [educationRecords, setEducationRecords] = useState([]);
  const [educationLoading, setEducationLoading] = useState(true);
  const [educationSaving, setEducationSaving] = useState(false);
  const [educationDeletingId, setEducationDeletingId] = useState("");
  const [educationError, setEducationError] = useState("");
  const [educationNotice, setEducationNotice] = useState("");
  const [educationForm, setEducationForm] = useState({
    institution: "",
    board: "",
    yearOfPassing: String(new Date().getFullYear()),
    marksObtained: "",
    maximumMarks: "100",
  });

  useEffect(() => {
    let active = true;

    async function loadApplicantProfile() {
      try {
        const response = await apiRequest("/profile/me");

        const profileData = response?.data ?? response;

        if (!profileData || !profileData.id) {
          throw new Error("The profile response was incomplete.");
        }

        if (active) {
          setProfile(profileData);

          setProfileError("");
        }
      } catch (error) {
        if (active) {
          setProfileError(
            error.message || "Unable to load your profile details.",
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadApplicantProfile();

    return () => {
      active = false;
    };
  }, []);

  const storedUser = (() => {
    try {
      return JSON.parse(window.localStorage.getItem("credifit_user") || "{}");
    } catch {
      return {};
    }
  })();

  const displayName = profile?.fullName || storedUser.fullName || "Applicant";

  const firstName = displayName.trim().split(/\s+/)[0] || "Applicant";

  const displayEmail = profile?.email || storedUser.email || "";

  const initials =
    displayName

      .trim()

      .split(/\s+/)

      .filter(Boolean)

      .slice(0, 2)

      .map((part) => part[0].toUpperCase())

      .join("") || "A";

  async function refreshNotifications() {
    const response = await apiRequest("/notifications?limit=100");
    const payload = response?.data ?? response;
    const items = Array.isArray(payload) ? payload : payload?.items || [];
    setNotificationItems(items);
    setUnreadNotificationCount(
      Number(payload?.unreadCount ?? items.filter((item) => !item.read).length),
    );
    setNotificationError("");
    return items;
  }

  async function refreshClarifications() {
    const response = await apiRequest("/workflow/applicant/clarifications");
    const items = response?.data ?? response;
    if (!Array.isArray(items)) {
      throw new Error("Unable to load clarification requests.");
    }
    setClarificationRequests(items);
    setClarificationError("");
    return items;
  }

  async function refreshDashboardSummary() {
    const response = await apiRequest("/dashboard/summary");
    const payload = response?.data ?? response;
    setDashboardSummary(payload || null);
    return payload;
  }

  async function refreshEducationRecords() {
    const response = await apiRequest("/profile/education-records");
    const records = response?.data ?? response;
    if (!Array.isArray(records)) {
      throw new Error("Unable to load your academic records.");
    }
    setEducationRecords(records);
    setEducationError("");
    return records;
  }

  const applicantDocumentOptions = documentRequirements.map((requirement) => ({
    id: String(requirement.documentTypeId),
    documentTypeId: Number(requirement.documentTypeId),
    name: requirement.name,
    apiName: requirement.name,
    description:
      requirement.description ||
      "Supporting document required for this programme.",
    required:
      Number(requirement.isMandatory) === 1 || requirement.isMandatory === true
        ? "Mandatory"
        : "Optional",
    isMandatory:
      Number(requirement.isMandatory) === 1 || requirement.isMandatory === true,
  }));

  const requiredDocumentOptions = applicantDocumentOptions.filter(
    (document) => document.isMandatory,
  );

  const missingRequiredDocuments = requiredDocumentOptions.filter(
    (requirement) =>
      !uploadedDocuments.some(
        (uploaded) =>
          Number(uploaded.documentTypeId) === requirement.documentTypeId ||
          normalizeDocumentName(uploaded.documentType) ===
            normalizeDocumentName(requirement.apiName),
      ),
  );

  const allMandatoryDocumentsUploaded =
    requiredDocumentOptions.length > 0 && missingRequiredDocuments.length === 0;

  const collegePreferencesEditable =
    applicationStatus === "DRAFT" ||
    applicationStatus === "ELIGIBILITY_SCREENING";
  const collegePreferencesDirty =
    selectedCollegeProgrammeIds.length !== savedCollegeProgrammeIds.length ||
    selectedCollegeProgrammeIds.some(
      (id, index) => Number(id) !== Number(savedCollegeProgrammeIds[index]),
    );
  const collegePreferenceResults =
    Array.isArray(eligibilityResult?.collegePreferences) &&
    eligibilityResult.collegePreferences.length > 0
      ? eligibilityResult.collegePreferences
      : collegePreferences;

  const terminalApplicationStatuses = [
    "ADMITTED",
    "REJECTED",
    "WAITLISTED",
    "WITHDRAWN",
  ];
  const isTerminalApplication =
    terminalApplicationStatuses.includes(applicationStatus);
  const foundTimelineIndex = application
    ? applicationStages.findIndex(
        (stage) => stage.code === application.currentStage,
      )
    : -1;
  const currentTimelineIndex = application
    ? isTerminalApplication
      ? applicationStages.length
      : Math.max(0, foundTimelineIndex)
    : -1;

  const timelineStages = applicationStages.map((stage, index) => {
    const completed =
      Boolean(application) &&
      (index < currentTimelineIndex ||
        (isTerminalApplication && index === applicationStages.length - 1));
    const current =
      Boolean(application) &&
      !isTerminalApplication &&
      index === currentTimelineIndex;
    const historyEntry = application?.stageHistory?.find(
      (entry) => entry.toStage === stage.code,
    );
    const completedDate =
      historyEntry?.createdAt ||
      (stage.code === "APPLICATION_SUBMISSION"
        ? application?.submittedAt
        : null);

    return {
      ...stage,
      status: completed ? "completed" : current ? "current" : "upcoming",
      date: completed
        ? formatDocumentDate(completedDate) || "Completed"
        : current
          ? applicationStatus === "DRAFT"
            ? "Draft saved"
            : "In progress"
          : "Upcoming",
    };
  });

  // Load the application, its programme-specific document checklist and saved uploads.
  async function loadApplicationResources(
    targetApplicationId,
    programmeId,
    qualification,
    shouldUpdate = () => true,
  ) {
    const query = qualification
      ? `?qualification=${encodeURIComponent(qualification)}`
      : "";

    setCollegeDataLoading(true);
    const [
      applicationResult,
      documentResult,
      requirementResult,
      eligibilityResultCall,
      collegeOfferingsResult,
      collegePreferencesResult,
    ] = await Promise.allSettled([
      apiRequest(`/applications/${targetApplicationId}`),
      apiRequest(`/documents/applications/${targetApplicationId}`),
      apiRequest(`/programmes/${programmeId}/document-requirements${query}`),
      apiRequest(`/eligibility/applications/${targetApplicationId}`),
      apiRequest(
        `/programmes/college-offerings?programmeId=${encodeURIComponent(programmeId)}`,
      ),
      apiRequest(`/applications/${targetApplicationId}/college-preferences`),
    ]);
    setCollegeDataLoading(false);

    if (applicationResult.status === "rejected") throw applicationResult.reason;
    if (documentResult.status === "rejected") throw documentResult.reason;
    if (requirementResult.status === "rejected") throw requirementResult.reason;

    const applicationResponse = applicationResult.value;
    const documentResponse = documentResult.value;
    const requirementResponse = requirementResult.value;
    const applicationData = applicationResponse?.data ?? applicationResponse;
    const savedDocuments = documentResponse?.data ?? documentResponse;
    const requirements = requirementResponse?.data ?? requirementResponse;
    const eligibilityResponse =
      eligibilityResultCall.status === "fulfilled"
        ? eligibilityResultCall.value
        : null;
    const eligibilityPayload =
      eligibilityResponse &&
      Object.prototype.hasOwnProperty.call(eligibilityResponse, "data")
        ? eligibilityResponse.data
        : eligibilityResponse;
    const offeringsResponse =
      collegeOfferingsResult.status === "fulfilled"
        ? collegeOfferingsResult.value
        : null;
    const preferencesResponse =
      collegePreferencesResult.status === "fulfilled"
        ? collegePreferencesResult.value
        : null;
    const offeringRows = offeringsResponse?.data ?? offeringsResponse;
    const preferenceRows = preferencesResponse?.data ?? preferencesResponse;
    const normalizedOfferings = Array.isArray(offeringRows) ? offeringRows : [];
    const normalizedPreferences = Array.isArray(preferenceRows)
      ? preferenceRows
      : [];
    const savedPreferenceIds = normalizedPreferences
      .map((item) => Number(item.collegeProgrammeId))
      .filter((id) => Number.isSafeInteger(id) && id > 0);

    if (!applicationData?.id) {
      throw new Error("The application response was incomplete.");
    }
    if (!Array.isArray(savedDocuments)) {
      throw new Error("Unable to load saved application documents.");
    }
    if (!Array.isArray(requirements)) {
      throw new Error("Unable to load the programme document requirements.");
    }

    if (shouldUpdate()) {
      setApplication(applicationData);
      setApplicationId(applicationData.id);
      setApplicationStatus(
        String(applicationData.status || "DRAFT").toUpperCase(),
      );
      setPersonalStatement(applicationData.personalStatement || "");
      setUploadedDocuments(savedDocuments);
      setDocumentRequirements(requirements);
      setEligibilityResult(eligibilityPayload || null);
      setCollegeOfferings(normalizedOfferings);
      setCollegePreferences(normalizedPreferences);
      setSelectedCollegeProgrammeIds(savedPreferenceIds);
      setSavedCollegeProgrammeIds(savedPreferenceIds);
      setCollegePreferencesError(
        collegeOfferingsResult.status === "rejected"
          ? collegeOfferingsResult.reason?.message ||
              "Participating colleges could not be loaded."
          : collegePreferencesResult.status === "rejected"
            ? collegePreferencesResult.reason?.message ||
              "Saved college preferences could not be loaded."
            : !Array.isArray(offeringRows) || !Array.isArray(preferenceRows)
              ? "The college preference service returned an unexpected response."
              : "",
      );
      setCollegePreferencesNotice("");
      setEligibilityError(
        eligibilityResultCall.status === "rejected"
          ? eligibilityResultCall.reason?.message ||
              "Eligibility results are temporarily unavailable."
          : "",
      );
      setApplicationError("");
    }

    return applicationData;
  }

  useEffect(() => {
    if (profileLoading) return undefined;

    let active = true;

    async function loadApplicantApplication() {
      setDocumentsLoading(true);
      setApplicationLoaded(false);
      setApplicationError("");
      setDocumentError("");

      try {
        const response = await apiRequest("/applications");
        const applications = response?.data ?? response;

        if (!Array.isArray(applications)) {
          throw new Error("Unable to read your applications.");
        }

        if (!active) return;
        setApplicationList(applications);

        // Prefer an application for the programme currently selected on the profile.
        // If there is none, fall back to the latest in-progress application.
        const activeStatuses = [
          "DRAFT",
          "SUBMITTED",
          "DOCUMENT_VERIFICATION",
          "ELIGIBILITY_SCREENING",
          "DEPARTMENT_REVIEW",
          "DECISION_PENDING",
        ];
        const selectedProgrammeApplications = profile?.programmeId
          ? applications.filter(
              (item) =>
                Number(item.programmeId) === Number(profile.programmeId) &&
                !["WITHDRAWN", "REJECTED"].includes(
                  String(item.status || "").toUpperCase(),
                ),
            )
          : [];
        const currentApplication =
          selectedProgrammeApplications.find((item) =>
            activeStatuses.includes(String(item.status || "").toUpperCase()),
          ) ||
          selectedProgrammeApplications[0] ||
          applications.find((item) =>
            activeStatuses.includes(String(item.status || "").toUpperCase()),
          ) ||
          (!profile?.programmeId
            ? applications.find(
                (item) =>
                  String(item.status || "").toUpperCase() !== "WITHDRAWN",
              )
            : null);

        if (!active) return;

        if (!currentApplication?.id) {
          setApplication(null);
          setApplicationId(null);
          setApplicationStatus("");
          setPersonalStatement("");
          setUploadedDocuments([]);
          setDocumentRequirements([]);
          setEligibilityResult(null);
          setEligibilityError("");
          setApplicationError("");
          return;
        }

        await loadApplicationResources(
          currentApplication.id,
          currentApplication.programmeId,
          currentApplication.qualification,
          () => active,
        );
      } catch (error) {
        if (active) {
          setApplicationError(
            error.message || "Unable to load your application details.",
          );
        }
      } finally {
        if (active) {
          setApplicationLoaded(true);
          setDocumentsLoading(false);
        }
      }
    }

    loadApplicantApplication();

    return () => {
      active = false;
    };
  }, [profileLoading, profile?.programmeId]);

  useEffect(() => {
    if (profileLoading || !applicationLoaded || applicationId) return;
    if (!profile?.programmeId) {
      setDocumentRequirements([]);
      return;
    }

    let active = true;
    async function loadSelectedProgrammeRequirements() {
      try {
        const query = profile.qualification
          ? `?qualification=${encodeURIComponent(profile.qualification)}`
          : "";
        const response = await apiRequest(
          `/programmes/${profile.programmeId}/document-requirements${query}`,
        );
        const requirements = response?.data ?? response;
        if (!Array.isArray(requirements)) {
          throw new Error("Unable to load programme document requirements.");
        }
        if (active) setDocumentRequirements(requirements);
      } catch (error) {
        if (active)
          setDocumentError(
            error.message || "Unable to load programme document requirements.",
          );
      }
    }

    loadSelectedProgrammeRequirements();
    return () => {
      active = false;
    };
  }, [
    profileLoading,
    applicationLoaded,
    applicationId,
    profile?.programmeId,
    profile?.qualification,
  ]);

  useEffect(() => {
    let active = true;
    async function loadSupplementaryDashboardData() {
      setNotificationsLoading(true);
      const [
        notificationsResult,
        summaryResult,
        clarificationsResult,
        educationResult,
      ] = await Promise.allSettled([
        apiRequest("/notifications?limit=100"),
        apiRequest("/dashboard/summary"),
        apiRequest("/workflow/applicant/clarifications"),
        apiRequest("/profile/education-records"),
      ]);

      if (!active) return;

      if (notificationsResult.status === "fulfilled") {
        const payload =
          notificationsResult.value?.data ?? notificationsResult.value;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        setNotificationItems(items);
        setUnreadNotificationCount(
          Number(
            payload?.unreadCount ?? items.filter((item) => !item.read).length,
          ),
        );
        setNotificationError("");
      } else {
        setNotificationError(
          notificationsResult.reason?.message ||
            "Unable to load notifications.",
        );
      }

      if (summaryResult.status === "fulfilled") {
        setDashboardSummary(
          summaryResult.value?.data ?? summaryResult.value ?? null,
        );
      }

      if (clarificationsResult.status === "fulfilled") {
        const items =
          clarificationsResult.value?.data ?? clarificationsResult.value;
        setClarificationRequests(Array.isArray(items) ? items : []);
        setClarificationError("");
      } else {
        setClarificationError(
          clarificationsResult.reason?.message ||
            "Unable to load clarification requests.",
        );
      }

      if (educationResult.status === "fulfilled") {
        const records = educationResult.value?.data ?? educationResult.value;
        setEducationRecords(Array.isArray(records) ? records : []);
        setEducationError("");
      } else {
        setEducationError(
          educationResult.reason?.message || "Unable to load academic records.",
        );
      }
      setEducationLoading(false);
      setNotificationsLoading(false);
    }

    loadSupplementaryDashboardData();
    return () => {
      active = false;
    };
  }, []);

  async function refreshUploadedDocuments(targetApplicationId) {
    const currentApplication = application;
    if (!currentApplication?.programmeId) {
      throw new Error(
        "The programme linked to this application could not be loaded.",
      );
    }

    return loadApplicationResources(
      targetApplicationId,
      currentApplication.programmeId,
      currentApplication.qualification,
    );
  }

  // A draft is created only when the applicant explicitly chooses Start Application.
  async function handleStartApplication() {
    if (applicationStarting || applicationId) return;

    setApplicationStarting(true);
    setApplicationError("");
    setApplicationNotice("");
    setDocumentError("");

    try {
      if (profileLoading)
        throw new Error("Your profile is still loading. Please try again.");
      if (!profile?.programmeId) {
        throw new Error(
          "Choose a programme from Explore Programmes before starting your application.",
        );
      }
      if (!profile?.qualification) {
        throw new Error(
          "Complete your highest qualification in My Profile before starting your application.",
        );
      }

      let applicationData = null;
      try {
        const response = await apiRequest("/applications", {
          method: "POST",
          body: JSON.stringify({
            programmeId: Number(profile.programmeId),
            qualification: profile.qualification,
          }),
        });
        applicationData = response?.data ?? response;
      } catch (createError) {
        // A previous draft/application for this programme may already exist. Reuse it.
        const listResponse = await apiRequest("/applications");
        const list = listResponse?.data ?? listResponse;
        const existing = Array.isArray(list)
          ? list.find(
              (item) =>
                Number(item.programmeId) === Number(profile.programmeId) &&
                !["WITHDRAWN", "REJECTED"].includes(
                  String(item.status || "").toUpperCase(),
                ),
            )
          : null;
        if (!existing) throw createError;
        applicationData = existing;
        setApplicationList(list);
      }

      if (!applicationData?.id) {
        throw new Error(
          "The application service did not return an application record.",
        );
      }

      await loadApplicationResources(
        applicationData.id,
        applicationData.programmeId || profile.programmeId,
        applicationData.qualification || profile.qualification,
      );
      setApplicationList((previous) => [
        applicationData,
        ...previous.filter(
          (item) => String(item.id) !== String(applicationData.id),
        ),
      ]);
      setApplicationLoaded(true);
      setDocumentsLoading(false);
      setApplicationNotice(
        `Application ${applicationData.applicationNumber || "draft"} is ready. You can now upload the required documents.`,
      );
      refreshDashboardSummary().catch(() => {});
    } catch (error) {
      setApplicationError(error.message || "Unable to start your application.");
    } finally {
      setApplicationStarting(false);
    }
  }

  function toggleCollegePreference(collegeProgrammeId) {
    const id = Number(collegeProgrammeId);
    setCollegePreferencesNotice("");
    setCollegePreferencesError("");
    if (
      !selectedCollegeProgrammeIds.includes(id) &&
      selectedCollegeProgrammeIds.length >= 20
    ) {
      setCollegePreferencesError("You can rank up to 20 college preferences.");
      return;
    }
    setSelectedCollegeProgrammeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function moveCollegePreference(collegeProgrammeId, direction) {
    setCollegePreferencesNotice("");
    setSelectedCollegeProgrammeIds((current) => {
      const index = current.indexOf(Number(collegeProgrammeId));
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length)
        return current;
      const reordered = [...current];
      [reordered[index], reordered[nextIndex]] = [
        reordered[nextIndex],
        reordered[index],
      ];
      return reordered;
    });
  }

  async function persistCollegePreferences() {
    if (!applicationId) {
      throw new Error(
        "Start your application before selecting college preferences.",
      );
    }
    if (!collegeOfferings.length) {
      throw new Error(
        "No active colleges currently offer this programme. Please contact the admission office.",
      );
    }
    if (!selectedCollegeProgrammeIds.length) {
      throw new Error(
        "Select and rank at least one college before continuing.",
      );
    }
    const validIds = new Set(
      collegeOfferings.map((item) => Number(item.collegeProgrammeId)),
    );
    if (selectedCollegeProgrammeIds.some((id) => !validIds.has(Number(id)))) {
      throw new Error(
        "One of your selected college offerings is no longer available. Refresh your college choices.",
      );
    }

    setCollegePreferencesSaving(true);
    setCollegePreferencesError("");
    try {
      const response = await apiRequest(
        `/applications/${applicationId}/college-preferences`,
        {
          method: "PUT",
          body: JSON.stringify({
            collegeProgrammeIds: selectedCollegeProgrammeIds.map(Number),
          }),
        },
      );
      const rows = response?.data ?? response;
      setCollegePreferences(Array.isArray(rows) ? rows : []);
      setSavedCollegeProgrammeIds([...selectedCollegeProgrammeIds]);
      return rows;
    } finally {
      setCollegePreferencesSaving(false);
    }
  }

  async function handleSaveCollegePreferences() {
    setCollegePreferencesNotice("");
    setCollegePreferencesError("");
    try {
      await persistCollegePreferences();
      setCollegePreferencesNotice(
        "Your ranked college preferences have been saved.",
      );
    } catch (error) {
      setCollegePreferencesError(
        error.message || "Unable to save your college preferences.",
      );
    }
  }

  async function handleSaveApplication() {
    if (!applicationId || applicationStatus !== "DRAFT") return;

    setApplicationSaving(true);
    setApplicationError("");
    setApplicationNotice("");

    try {
      if (
        collegeOfferings.length > 0 &&
        selectedCollegeProgrammeIds.length > 0 &&
        collegePreferencesDirty
      ) {
        await persistCollegePreferences();
      }
      await apiRequest(`/applications/${applicationId}`, {
        method: "PATCH",
        body: JSON.stringify({ personalStatement: personalStatement.trim() }),
      });
      await loadApplicationResources(
        applicationId,
        application.programmeId,
        application.qualification,
      );
      setApplicationNotice("Your application details have been saved.");
    } catch (error) {
      setApplicationError(
        error.message || "Unable to save your application details.",
      );
    } finally {
      setApplicationSaving(false);
    }
  }

  async function handleSubmitApplication() {
    if (!applicationId || applicationStatus !== "DRAFT") return;

    setApplicationError("");
    setApplicationNotice("");

    if (!profile?.phone) {
      setApplicationError(
        "Add your contact phone number in My Profile before submitting.",
      );
      return;
    }

    if (!requiredDocumentOptions.length) {
      setApplicationError(
        "Mandatory document requirements are not configured for this programme. Contact the admission office.",
      );
      return;
    }

    if (missingRequiredDocuments.length) {
      setApplicationError(
        `Upload all mandatory documents before submitting: ${missingRequiredDocuments.map((item) => item.name).join(", ")}.`,
      );
      return;
    }

    if (!collegeOfferings.length) {
      setCollegePreferencesError(
        "No active colleges currently offer this programme. Please contact the admission office before submitting.",
      );
      setApplicationError(
        "College preferences are not available for this programme yet.",
      );
      return;
    }
    if (!selectedCollegeProgrammeIds.length) {
      setCollegePreferencesError(
        "Select and rank at least one college before submitting.",
      );
      setApplicationError(
        "Please save at least one college preference before submitting.",
      );
      return;
    }

    setApplicationSubmitting(true);

    try {
      await persistCollegePreferences();
      const response = await apiRequest(
        `/applications/${applicationId}/submit`,
        {
          method: "POST",
        },
      );
      const result = response?.data ?? response;
      await loadApplicationResources(
        applicationId,
        application.programmeId,
        application.qualification,
      );
      setApplicationNotice(
        `Application ${result?.applicationNumber || application.applicationNumber} submitted successfully for document verification.`,
      );
      refreshDashboardSummary().catch(() => {});
      refreshNotifications().catch(() => {});
    } catch (error) {
      setApplicationError(
        error.message || "Unable to submit your application.",
      );
    } finally {
      setApplicationSubmitting(false);
    }
  }

  // Upload the actual file to backend storage.
  async function handleDocumentUpload(doc, event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setDocumentError("");
    setDocumentNotice("");

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setDocumentError("Please select a PDF, JPG or PNG file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDocumentError("File size must be below 5 MB.");
      return;
    }

    if (!applicationId) {
      setDocumentError(
        "Start your application first. Selecting a file will not create an application automatically.",
      );
      return;
    }

    setUploadingDocumentId(doc.id);

    try {
      const targetApplicationId = applicationId;
      const currentStatus = applicationStatus;

      if (!["DRAFT", "DOCUMENT_VERIFICATION"].includes(currentStatus)) {
        throw new Error(
          "Documents cannot be changed at this application stage.",
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", doc.apiName);

      const apiBaseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
      ).replace(/\/+$/, "");
      const token = localStorage.getItem("credifit_access_token");

      const response = await fetch(
        `${apiBaseUrl}/documents/applications/${targetApplicationId}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
          credentials: "include",
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Document upload failed.");
      }

      await refreshUploadedDocuments(targetApplicationId);
      refreshNotifications().catch(() => {});
      setDocumentNotice(
        `${doc.name} uploaded successfully and saved to your application.`,
      );
    } catch (error) {
      setDocumentError(error.message || "Unable to upload this document.");
    } finally {
      setUploadingDocumentId("");
    }
  }

  async function handleSaveEducationRecord(event) {
    event.preventDefault();
    setEducationError("");
    setEducationNotice("");

    const qualification = application?.qualification || profile?.qualification;
    const institution = educationForm.institution.trim();
    const yearOfPassing = Number(educationForm.yearOfPassing);
    const marksObtained = Number(educationForm.marksObtained);
    const maximumMarks = Number(educationForm.maximumMarks);

    if (!qualification) {
      setEducationError(
        "Set your highest qualification in My Profile before adding an academic record.",
      );
      return;
    }
    if (institution.length < 2) {
      setEducationError(
        "Enter the name of your school, college or institution.",
      );
      return;
    }
    if (
      !Number.isInteger(yearOfPassing) ||
      yearOfPassing < 1950 ||
      yearOfPassing > new Date().getFullYear() + 1
    ) {
      setEducationError("Enter a valid year of passing.");
      return;
    }
    if (
      !Number.isFinite(marksObtained) ||
      !Number.isFinite(maximumMarks) ||
      marksObtained < 0 ||
      maximumMarks <= 0 ||
      marksObtained > maximumMarks
    ) {
      setEducationError(
        "Check your marks. Obtained marks must be between zero and the maximum marks.",
      );
      return;
    }

    setEducationSaving(true);
    try {
      const response = await apiRequest("/profile/education-records", {
        method: "POST",
        body: JSON.stringify({
          qualification,
          institution,
          board: educationForm.board.trim() || null,
          yearOfPassing,
          marksObtained,
          maximumMarks,
        }),
      });
      const savedRecord = response?.data ?? response;
      await refreshEducationRecords();
      setEducationForm((previous) => ({
        ...previous,
        institution: "",
        board: "",
        marksObtained: "",
        maximumMarks: "100",
      }));
      setEducationNotice(
        `Academic record saved${savedRecord?.percentage != null ? ` (${savedRecord.percentage}%).` : "."} The admission team can use it during eligibility screening.`,
      );
    } catch (error) {
      setEducationError(
        error.message || "Unable to save your academic record.",
      );
    } finally {
      setEducationSaving(false);
    }
  }

  async function handleDeleteEducationRecord(recordId) {
    setEducationDeletingId(String(recordId));
    setEducationError("");
    setEducationNotice("");
    try {
      await apiRequest(`/profile/education-records/${recordId}`, {
        method: "DELETE",
      });
      await refreshEducationRecords();
      setEducationNotice("Academic record removed.");
    } catch (error) {
      setEducationError(
        error.message || "Unable to remove this academic record.",
      );
    } finally {
      setEducationDeletingId("");
    }
  }

  async function handleDocumentDownload(documentItem) {
    if (!documentItem?.id) return;
    setDocumentError("");
    try {
      const apiBaseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
      ).replace(/\/+$/, "");
      const token = localStorage.getItem("credifit_access_token");
      const response = await fetch(
        `${apiBaseUrl}/documents/${documentItem.id}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(
          payload?.message || "Unable to download this document.",
        );
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = documentItem.fileName || "application-document";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setDocumentError(error.message || "Unable to download this document.");
    }
  }

  async function handleMarkNotificationRead(notificationId) {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      await refreshNotifications();
    } catch (error) {
      setNotificationError(
        error.message || "Unable to update this notification.",
      );
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      await refreshNotifications();
    } catch (error) {
      setNotificationError(
        error.message || "Unable to mark notifications as read.",
      );
    }
  }

  async function handleClearNotifications() {
    try {
      await apiRequest("/notifications", { method: "DELETE" });
      setNotificationItems([]);
      setUnreadNotificationCount(0);
      setNotificationError("");
      refreshDashboardSummary().catch(() => {});
    } catch (error) {
      setNotificationError(error.message || "Unable to clear notifications.");
    }
  }

  async function handleNotificationOpen(item) {
    if (!item) return;
    if (!item.read) await handleMarkNotificationRead(item.id);
    setNotificationOpen(false);
    const type = String(item.type || "").toLowerCase();
    const target = type.includes("clarification")
      ? "clarifications"
      : type.includes("document")
        ? "documents"
        : type.includes("eligibility")
          ? "eligibility"
          : "application-details";
    setActiveSection(
      target === "application-details"
        ? "My Application"
        : target === "clarifications"
          ? "Clarifications"
          : target[0].toUpperCase() + target.slice(1),
    );
    window.setTimeout(() => {
      document
        .getElementById(target)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  async function handleClarificationResponse(item) {
    const responseText = String(clarificationResponses[item.id] || "").trim();
    if (responseText.length < 5) {
      setClarificationError(
        "Please enter at least 5 characters before sending your response.",
      );
      return;
    }
    setClarificationSubmitting(String(item.id));
    setClarificationError("");
    setClarificationNotice("");
    try {
      await apiRequest(
        `/workflow/applicant/clarifications/${item.id}/respond`,
        {
          method: "POST",
          body: JSON.stringify({ response: responseText }),
        },
      );
      setClarificationResponses((previous) => {
        const next = { ...previous };
        delete next[item.id];
        return next;
      });
      await Promise.all([refreshClarifications(), refreshNotifications()]);
      setClarificationNotice("Your response was sent to the admission team.");
    } catch (error) {
      setClarificationError(
        error.message || "Unable to send your clarification response.",
      );
    } finally {
      setClarificationSubmitting("");
    }
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be below 5 MB.");

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatarPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <Sidebar
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="min-h-screen lg:pl-64">
        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-sm font-bold text-[#173b61]">
                Applicant Portal
              </p>

              <p className="hidden text-[11px] text-slate-400 sm:block">
                Your admission workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              aria-label="Search"
              className="hidden rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 sm:block"
            >
              <Search size={19} />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`relative rounded-xl p-2.5 transition ${
                  notificationOpen
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                }`}
              >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-14 z-50 w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 p-4">
                      <div>
                        <h3 className="font-bold text-[#173b61]">
                          Notifications
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Your admission updates
                        </p>
                      </div>

                      <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <Bell size={18} />
                      </div>
                    </div>

                    {notificationItems.length ? (
                      <div className="max-h-[330px] divide-y divide-slate-100 overflow-y-auto p-2">
                        {notificationItems.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNotificationOpen(item)}
                            className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${item.read ? "" : "bg-blue-50/60"}`}
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Bell size={15} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-xs font-bold text-slate-800">
                                  {item.title}
                                </span>
                                {!item.read && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                                )}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-slate-500">
                                {item.message}
                              </span>
                              <span className="mt-1.5 block text-[10px] text-slate-400">
                                {formatDocumentDate(item.createdAt)}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                          <Bell size={22} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-[#173b61]">
                          You're all caught up!
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          New admission and document updates will appear here.
                        </p>
                      </div>
                    )}

                    <a
                      href="#notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="flex items-center justify-center gap-2 border-t border-slate-100 py-3 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                    >
                      View notification centre
                      <ArrowRight size={14} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <a
              href="/applicant/edit-profile"
              title="Edit your profile"
              className="group flex items-center gap-3"
            >
              <div className="hidden text-right sm:block">
                <p className="max-w-[170px] truncate text-sm font-bold text-slate-700">
                  {profileLoading ? "Loading profile..." : displayName}
                </p>

                <p className="max-w-[170px] truncate text-[11px] text-slate-400">
                  {displayEmail || "Applicant account"}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-50 text-sm font-extrabold text-blue-700 shadow-sm ring-1 ring-slate-200 transition group-hover:ring-2 group-hover:ring-blue-400">
                {typeof avatarPreview === "string" && avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-7 px-5 py-7 md:px-9 md:py-9">
          {profileError && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"
            >
              We couldn't load your latest profile details: {profileError}
            </div>
          )}

          {/* WELCOME */}

          <motion.section
            id="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",

                  day: "numeric",

                  month: "long",

                  year: "numeric",
                })}
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#173b61] md:text-4xl">
                Welcome, {firstName}
                <span className="text-blue-500">.</span>
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Here's what's happening with your admission application.
                {profile?.programme
                  ? ` Your preferred programme is ${profile.programme}.`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-emerald-700">
                {profile?.accountStatus === "INACTIVE"
                  ? "Account inactive"
                  : "Account active"}
              </span>
            </div>
          </motion.section>

          {/* REGISTERED APPLICANT DETAILS */}

          {profile && (
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Email address",

                  value: profile.email || "Not provided",
                },

                {
                  label: "Phone number",

                  value:
                    [profile.phoneCountryCode, profile.phone]

                      .filter(Boolean)

                      .join(" ") || "Not provided",
                },

                {
                  label: "Highest qualification",

                  value: profile.qualification || "Not provided",
                },

                {
                  label: "Preferred programme",

                  value: profile.programme || "Not selected",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    {item.label}
                  </p>

                  <p className="mt-2 truncate text-sm font-bold text-[#173b61]">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* HERO APPLICATION CARD */}
          <motion.section
            id="application"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-[#102c4d] p-7 text-white shadow-xl md:p-10"
          >
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full bg-blue-500/20 blur-[90px]" />

            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_250px]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      applicationStatus === "ADMITTED"
                        ? "bg-emerald-300"
                        : "bg-cyan-300"
                    }`}
                  />
                  {applicationStatus === "ADMITTED"
                    ? "ADMISSION CONFIRMED"
                    : "YOUR ADMISSION JOURNEY"}
                </span>

                <h2 className="mt-5 text-2xl font-extrabold md:text-3xl">
                  {applicationStatus === "ADMITTED"
                    ? `Congratulations, ${firstName}! You've been admitted.`
                    : applicationId
                      ? "Your application is underway."
                      : "Your next chapter starts here."}
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100/70">
                  {applicationStatus === "ADMITTED" ? (
                    <>
                      Your admission to{" "}
                      <span className="font-semibold text-white">
                        {application?.programmeName ||
                          profile?.programme ||
                          "your selected programme"}
                      </span>
                      {(application?.collegeName ||
                        application?.institutionName ||
                        application?.college?.name) && (
                        <>
                          {" "}
                          at{" "}
                          <span className="font-semibold text-white">
                            {application?.collegeName ||
                              application?.institutionName ||
                              application?.college?.name}
                          </span>
                        </>
                      )}{" "}
                      has been confirmed. Congratulations on reaching this
                      milestone!
                    </>
                  ) : applicationId ? (
                    "Your application draft is saved. Continue uploading the required documents so your admission file can move forward."
                  ) : (
                    "Your programme selection is saved to your profile. Start an application when you're ready; uploading a file will never create one automatically."
                  )}
                </p>

                {applicationId ? (
                  <a
                    href="#application-details"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173b61] transition hover:-translate-y-1 hover:bg-blue-50"
                  >
                    {applicationStatus === "DRAFT"
                      ? "Continue application"
                      : applicationStatus === "ADMITTED"
                        ? "View admission details"
                        : "View application"}
                    <ArrowRight size={17} />
                  </a>
                ) : profile?.programmeId ? (
                  <button
                    type="button"
                    onClick={handleStartApplication}
                    disabled={
                      !applicationLoaded ||
                      profileLoading ||
                      applicationStarting
                    }
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173b61] transition hover:-translate-y-1 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applicationStarting
                      ? "Creating draft..."
                      : "Start application"}
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <a
                    href="/programmes"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173b61] transition hover:-translate-y-1 hover:bg-blue-50"
                  >
                    Explore programmes
                    <ArrowRight size={17} />
                  </a>
                )}
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-xl"
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-400/10">
                    <GraduationCap
                      size={55}
                      className={
                        applicationStatus === "ADMITTED"
                          ? "text-emerald-300"
                          : "text-cyan-300"
                      }
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* APPLICATION DETAILS AND SUBMISSION */}
          <motion.section
            id="application-details"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  My application
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                  {application
                    ? "Application details"
                    : "Start your application"}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {application
                    ? "Review your selected programme, save your statement and submit when the required documents are uploaded."
                    : "Your selected programme and qualification will be used to create your application draft."}
                </p>
              </div>
              {application && (
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${applicationStatus === "DRAFT" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {applicationStatus.replace(/_/g, " ")}
                </span>
              )}
            </div>

            {application ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Application number
                    </p>
                    <p className="mt-2 break-all text-sm font-extrabold text-[#173b61]">
                      {application.applicationNumber || `APP-${application.id}`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Selected programme
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-[#173b61]">
                      {application.programmeName ||
                        profile?.programme ||
                        "Not available"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Qualification
                    </p>
                    <p className="mt-2 text-sm font-extrabold capitalize text-[#173b61]">
                      {application.qualification || "Not recorded"}
                    </p>
                  </div>
                </div>

                <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        College preferences
                      </p>
                      <h3 className="mt-1 text-sm font-extrabold text-[#173b61]">
                        Rank the colleges you want to apply to
                      </h3>
                      <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
                        Select the colleges offering this programme, then
                        arrange them from your first choice to your last choice.
                        Your documents and programme eligibility are shared
                        across these preferences.
                      </p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700">
                      <Building2 size={13} /> {collegeOfferings.length}{" "}
                      participating college
                      {collegeOfferings.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {collegePreferencesError && (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] text-rose-700"
                    >
                      {collegePreferencesError}
                    </div>
                  )}
                  {collegePreferencesNotice && (
                    <div
                      role="status"
                      className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-700"
                    >
                      {collegePreferencesNotice}
                    </div>
                  )}

                  {collegeDataLoading ? (
                    <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-white p-5 text-center text-xs text-slate-400">
                      Loading participating colleges and saved preferences...
                    </div>
                  ) : collegeOfferings.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-white p-5">
                      <p className="text-xs font-bold text-amber-800">
                        No active college offerings found
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        The admission administrator needs to add at least one
                        active college offering for{" "}
                        {application.programmeName ||
                          profile?.programme ||
                          "this programme"}{" "}
                        before you can submit an application.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        {collegeOfferings.map((offering) => {
                          const offeringId = Number(
                            offering.collegeProgrammeId,
                          );
                          const selectedIndex =
                            selectedCollegeProgrammeIds.indexOf(offeringId);
                          const selected = selectedIndex >= 0;
                          const seats = offering.seatsAvailable;
                          const noSeats =
                            seats !== null &&
                            seats !== undefined &&
                            Number(seats) <= 0;
                          return (
                            <article
                              key={offeringId}
                              className={`rounded-xl border bg-white p-4 transition ${selected ? "border-blue-300 ring-2 ring-blue-500/10" : "border-slate-200"}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-xs font-extrabold text-[#173b61]">
                                      {offering.collegeName}
                                    </h4>
                                    {selected && (
                                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                                        Preference {selectedIndex + 1}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                    <MapPin size={11} />{" "}
                                    {[offering.city, offering.state]
                                      .filter(Boolean)
                                      .join(", ") || "Location not specified"}
                                  </p>
                                </div>
                                {noSeats && (
                                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">
                                    No seats
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <p className="text-[9px] text-slate-400">
                                    College cutoff
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-[#173b61]">
                                    {Number(offering.minimumPercentage)
                                      .toFixed(2)
                                      .replace(/\.00$/, "")}
                                    %
                                  </p>
                                </div>
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <p className="text-[9px] text-slate-400">
                                    Seats available
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-[#173b61]">
                                    {seats === null || seats === undefined
                                      ? "Unlimited"
                                      : Number(seats)}
                                  </p>
                                </div>
                              </div>
                              {collegePreferencesEditable && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleCollegePreference(offeringId)
                                  }
                                  className={`mt-3 w-full rounded-lg px-3 py-2 text-[10px] font-bold transition ${selected ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-[#173b61] text-white hover:bg-blue-700"}`}
                                >
                                  {selected
                                    ? "Remove preference"
                                    : "Add to preferences"}
                                </button>
                              )}
                            </article>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-[#173b61]">
                              Your preference order
                            </h4>
                            <p className="mt-1 text-[10px] text-slate-400">
                              The top eligible college with available seats is
                              considered first.
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                            {selectedCollegeProgrammeIds.length} selected
                          </span>
                        </div>
                        {selectedCollegeProgrammeIds.length === 0 ? (
                          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-3 text-[10px] text-slate-500">
                            Add at least one college above, then set your
                            ranking.
                          </p>
                        ) : (
                          <ol className="mt-3 space-y-2">
                            {selectedCollegeProgrammeIds.map((id, index) => {
                              const offering = collegeOfferings.find(
                                (item) =>
                                  Number(item.collegeProgrammeId) ===
                                  Number(id),
                              );
                              if (!offering) return null;
                              return (
                                <li
                                  key={id}
                                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-700">
                                    {index + 1}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-bold text-slate-700">
                                      {offering.collegeName}
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-slate-400">
                                      Cutoff{" "}
                                      {Number(offering.minimumPercentage)
                                        .toFixed(2)
                                        .replace(/\.00$/, "")}
                                      %
                                    </p>
                                  </div>
                                  {collegePreferencesEditable && (
                                    <div className="flex shrink-0 gap-1">
                                      <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() =>
                                          moveCollegePreference(id, -1)
                                        }
                                        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                        aria-label={`Move ${offering.collegeName} up`}
                                      >
                                        <ArrowUp size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          index ===
                                          selectedCollegeProgrammeIds.length - 1
                                        }
                                        onClick={() =>
                                          moveCollegePreference(id, 1)
                                        }
                                        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                        aria-label={`Move ${offering.collegeName} down`}
                                      >
                                        <ArrowDown size={13} />
                                      </button>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        )}
                        {collegePreferencesEditable && (
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[10px] text-slate-400">
                              Save your ranking before submitting. You can
                              change it while the application is a draft or
                              remains in eligibility screening.
                            </p>
                            <button
                              type="button"
                              onClick={handleSaveCollegePreferences}
                              disabled={
                                collegePreferencesSaving ||
                                collegeDataLoading ||
                                selectedCollegeProgrammeIds.length === 0 ||
                                !collegePreferencesDirty
                              }
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173b61] px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {collegePreferencesSaving ? (
                                <LoaderCircle
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Save size={13} />
                              )}
                              {collegePreferencesSaving
                                ? "Saving ranking..."
                                : collegePreferencesDirty
                                  ? "Save ranked preferences"
                                  : "Preferences saved"}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </section>

                <div className="mt-5">
                  <label
                    htmlFor="personalStatement"
                    className="mb-2 block text-xs font-bold text-slate-600"
                  >
                    Personal statement{" "}
                    <span className="font-normal text-slate-400">
                      (optional, up to 3,000 characters)
                    </span>
                  </label>
                  <textarea
                    id="personalStatement"
                    rows={4}
                    maxLength={3000}
                    value={personalStatement}
                    onChange={(event) =>
                      setPersonalStatement(event.target.value)
                    }
                    disabled={applicationStatus !== "DRAFT"}
                    placeholder="Briefly tell the admission team about your academic interests and goals..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {personalStatement.length}/3000
                  </p>
                </div>

                {applicationError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700"
                  >
                    {applicationError}
                  </div>
                )}
                {applicationNotice && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-700"
                  >
                    {applicationNotice}
                  </div>
                )}

                {isTerminalApplication && (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-xs font-semibold ${applicationStatus === "ADMITTED" ? "bg-emerald-50 text-emerald-700" : applicationStatus === "WAITLISTED" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}
                  >
                    Final admission outcome:{" "}
                    {applicationStatus.replace(/_/g, " ")}
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    {applicationStatus === "DRAFT"
                      ? `${missingRequiredDocuments.length} mandatory document${missingRequiredDocuments.length === 1 ? "" : "s"} remaining before submission.`
                      : "Your application has been submitted. Editing is locked while it is under review."}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {applicationStatus === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          onClick={handleSaveApplication}
                          disabled={applicationSaving || applicationSubmitting}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {applicationSaving ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Save size={15} />
                          )}
                          {applicationSaving ? "Saving..." : "Save draft"}
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitApplication}
                          disabled={
                            applicationSubmitting ||
                            applicationSaving ||
                            collegePreferencesSaving ||
                            !allMandatoryDocumentsUploaded ||
                            collegeOfferings.length === 0 ||
                            selectedCollegeProgrammeIds.length === 0
                          }
                          title={
                            !allMandatoryDocumentsUploaded
                              ? "Upload all mandatory documents first"
                              : collegeOfferings.length === 0
                                ? "No active college offerings are available for this programme"
                                : selectedCollegeProgrammeIds.length === 0
                                  ? "Select at least one college preference first"
                                  : "Submit your application"
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b61] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {applicationSubmitting ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Send size={15} />
                          )}
                          {applicationSubmitting
                            ? "Submitting..."
                            : "Submit application"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#173b61]">
                    {profile?.programmeId
                      ? profile.programme || "Programme selected"
                      : "No programme selected yet"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {profile?.programmeId
                      ? `Qualification: ${profile.qualification || "Not recorded"}. Start a draft to see your programme-specific document checklist.`
                      : "Explore the programme directory and select a programme before starting your application."}
                  </p>
                </div>
                {profile?.programmeId ? (
                  <button
                    type="button"
                    onClick={handleStartApplication}
                    disabled={
                      !applicationLoaded ||
                      profileLoading ||
                      applicationStarting
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173b61] px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {applicationStarting
                      ? "Creating draft..."
                      : "Start application"}{" "}
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <a
                    href="/programmes"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173b61] px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Explore programmes <ArrowRight size={15} />
                  </a>
                )}
              </div>
            )}
          </motion.section>

          {/* SUMMARY CARDS */}

          {/* APPLICANT SUMMARY */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Application status",

                value: applicationStatus
                  ? applicationStatus
                      .toLowerCase()
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())
                  : "Not started",
                note: `${Number(dashboardSummary?.totalApplications ?? applicationList.length)} application(s) on your account`,

                icon: FileText,

                color: "blue",
              },

              {
                label: "Documents uploaded",

                value: String(uploadedDocuments.length),
                note: uploadedDocuments.length
                  ? "Saved to your application"
                  : applicationId
                    ? "No documents submitted yet"
                    : "Start an application to upload",

                icon: FolderCheck,

                color: "emerald",
              },

              {
                label: "Eligibility status",

                value: application?.eligibilityStatus
                  ? String(application.eligibilityStatus).replace(/_/g, " ")
                  : applicationStatus === "ELIGIBILITY_SCREENING"
                    ? "In progress"
                    : "Not assessed",

                note:
                  application?.eligibilityPercentage != null
                    ? `Score: ${application.eligibilityPercentage}%`
                    : applicationId
                      ? "Awaiting assessment result"
                      : "Awaiting an application",

                icon: ShieldCheck,

                color: "violet",
              },

              {
                label: "Notifications",

                value: String(unreadNotificationCount),
                note: unreadNotificationCount
                  ? "Unread admission updates"
                  : "You're all caught up",

                icon: Bell,

                color: "amber",
              },
            ].map((card, index) => {
              const Icon = card.icon;

              const iconColors = {
                blue: "bg-blue-50 text-blue-600",

                emerald: "bg-emerald-50 text-emerald-600",

                violet: "bg-violet-50 text-violet-600",

                amber: "bg-amber-50 text-amber-600",
              };

              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      {card.label}
                    </p>

                    <div
                      className={`rounded-xl p-2.5 ${iconColors[card.color]}`}
                    >
                      <Icon size={19} />
                    </div>
                  </div>

                  <p className="mt-4 text-xl font-extrabold text-[#173b61]">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">{card.note}</p>
                </motion.div>
              );
            })}
          </section>

          {/* LOWER CONTENT */}

          <section className="grid items-start gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-6">
              {/* ADMISSION TIMELINE */}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Admission journey
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                      Screening timeline
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Follow your application at every stage.
                    </p>
                  </div>

                  <button
                    aria-label="More timeline options"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="mt-7">
                  {timelineStages.map((stage, index) => {
                    const completed = stage.status === "completed";

                    const current = stage.status === "current";

                    return (
                      <div
                        key={stage.title}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {index !== timelineStages.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-9 h-full w-px ${
                              completed ? "bg-emerald-300" : "bg-slate-200"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            completed
                              ? "bg-emerald-100 text-emerald-600"
                              : current
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "border border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 size={18} />
                          ) : current ? (
                            <Clock3 size={16} />
                          ) : (
                            <span className="text-xs font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p
                              className={`text-sm font-bold ${
                                current || completed
                                  ? "text-[#173b61]"
                                  : "text-slate-400"
                              }`}
                            >
                              {stage.title}
                            </p>

                            <span
                              className={`text-[10px] font-semibold ${
                                completed
                                  ? "text-emerald-600"
                                  : current
                                    ? "text-blue-600"
                                    : "text-slate-400"
                              }`}
                            >
                              {stage.date}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* ELIGIBILITY SCREENING */}
              <motion.div
                id="eligibility"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Academic assessment
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                      Eligibility Screening
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Your recorded eligibility outcome and screening checks.
                    </p>
                  </div>
                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                {eligibilityError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
                  >
                    {eligibilityError}
                  </div>
                )}

                {!application ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center">
                    <GraduationCap
                      size={29}
                      className="mx-auto text-violet-600"
                    />
                    <h4 className="mt-3 text-sm font-bold text-[#173b61]">
                      No application to assess yet
                    </h4>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                      Select a programme and start an application. The admission
                      team will evaluate eligibility after document
                      verification.
                    </p>
                  </div>
                ) : eligibilityResult?.status ? (
                  <div className="mt-6 space-y-4">
                    <div
                      className={`rounded-xl border p-4 ${eligibilityResult.status === "ELIGIBLE" ? "border-emerald-200 bg-emerald-50" : eligibilityResult.status === "NOT_ELIGIBLE" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-[#173b61]">
                          {String(
                            eligibilityResult.status || "INCOMPLETE",
                          ).replace(/_/g, " ")}
                        </p>
                        {eligibilityResult.percentage != null && (
                          <span className="text-xs font-bold text-slate-600">
                            Recorded score: {eligibilityResult.percentage}%
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {eligibilityResult.summary ||
                          "The latest eligibility assessment is available."}
                      </p>
                      {eligibilityResult.evaluatedAt && (
                        <p className="mt-2 text-[10px] text-slate-400">
                          Evaluated{" "}
                          {formatDocumentDate(eligibilityResult.evaluatedAt)}
                          {eligibilityResult.evaluatedBy
                            ? ` by ${eligibilityResult.evaluatedBy}`
                            : ""}
                        </p>
                      )}
                    </div>
                    {Array.isArray(eligibilityResult.checks) &&
                      eligibilityResult.checks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            Screening checks
                          </p>
                          {eligibilityResult.checks.map((check, index) => (
                            <div
                              key={`${check.criterion}-${index}`}
                              className="rounded-xl border border-slate-100 p-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-700">
                                  {check.criterion}
                                </p>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${check.result === "PASS" ? "bg-emerald-50 text-emerald-700" : check.result === "FAIL" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                                >
                                  {check.result}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                {check.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    {Array.isArray(collegePreferenceResults) &&
                      collegePreferenceResults.length > 0 && (
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              College-wise eligibility results
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              Each college is checked against its own cutoff as
                              well as the common programme rule.
                            </p>
                          </div>
                          {collegePreferenceResults.map((preference, index) => {
                            const passLabel = (value) =>
                              value === true || value === 1 || value === "1"
                                ? "PASS"
                                : value === false ||
                                    value === 0 ||
                                    value === "0"
                                  ? "FAIL"
                                  : "PENDING";
                            return (
                              <article
                                key={
                                  preference.collegePreferenceId ||
                                  `${preference.collegeName}-${index}`
                                }
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-extrabold text-[#173b61]">
                                      Preference {preference.preferenceOrder}:{" "}
                                      {preference.collegeName}
                                    </p>
                                    <p className="mt-1 text-[10px] text-slate-400">
                                      College cutoff:{" "}
                                      {preference.collegeMinimumPercentage}%
                                    </p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${preference.eligibilityStatus === "ELIGIBLE" ? "bg-emerald-50 text-emerald-700" : preference.eligibilityStatus === "NOT_ELIGIBLE" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                                  >
                                    {String(
                                      preference.eligibilityStatus || "PENDING",
                                    ).replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                  {[
                                    [
                                      "College cutoff",
                                      passLabel(
                                        preference.collegePercentagePass,
                                      ),
                                    ],
                                    [
                                      "Programme cutoff",
                                      passLabel(
                                        preference.programmePercentagePass,
                                      ),
                                    ],
                                    [
                                      "Documents",
                                      passLabel(preference.documentCheckPass),
                                    ],
                                  ].map(([label, value]) => (
                                    <div
                                      key={label}
                                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                                    >
                                      <span className="text-[9px] text-slate-500">
                                        {label}
                                      </span>
                                      <span
                                        className={`text-[9px] font-extrabold ${value === "PASS" ? "text-emerald-700" : value === "FAIL" ? "text-rose-700" : "text-amber-700"}`}
                                      >
                                        {value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {preference.finalDecision &&
                                  preference.finalDecision !== "PENDING" && (
                                    <p className="mt-3 text-[10px] font-semibold text-slate-600">
                                      College decision:{" "}
                                      {String(preference.finalDecision).replace(
                                        /_/g,
                                        " ",
                                      )}
                                      {preference.finalDecisionRemarks
                                        ? ` — ${preference.finalDecisionRemarks}`
                                        : ""}
                                    </p>
                                  )}
                                {preference.isCurrent && (
                                  <p className="mt-2 text-[9px] font-bold text-indigo-600">
                                    Currently under review
                                  </p>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center">
                    <GraduationCap
                      size={29}
                      className="mx-auto text-violet-600"
                    />
                    <h4 className="mt-3 text-sm font-bold text-[#173b61]">
                      {applicationStatus === "ELIGIBILITY_SCREENING"
                        ? "Eligibility screening in progress"
                        : "Eligibility assessment pending"}
                    </h4>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                      {applicationStatus === "ELIGIBILITY_SCREENING"
                        ? "Your verified documents are moving through the eligibility engine. The latest result will appear here when recorded by the admission team."
                        : "The eligibility engine will evaluate your academic records and verified mandatory documents when your application reaches this stage."}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700">
                      <Clock3 size={14} /> Awaiting assessment result
                    </div>
                  </div>
                )}

                {/* ACADEMIC RECORDS — used by the backend eligibility evaluator */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Academic records
                      </p>
                      <h4 className="mt-1 text-base font-extrabold text-[#173b61]">
                        Your marks and education history
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        These records are stored with your applicant profile and
                        used by the eligibility screening process.
                      </p>
                    </div>
                    {educationLoading && (
                      <span className="text-[11px] text-slate-400">
                        Loading records...
                      </span>
                    )}
                  </div>

                  {educationError && (
                    <div
                      role="alert"
                      className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
                    >
                      {educationError}
                    </div>
                  )}
                  {educationNotice && (
                    <div
                      role="status"
                      className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700"
                    >
                      {educationNotice}
                    </div>
                  )}

                  {educationRecords.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {educationRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold text-slate-800">
                                {record.qualification}
                              </p>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                {record.percentage}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              {record.institution}{" "}
                              {record.board ? `· ${record.board}` : ""}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              Year: {record.yearOfPassing} · Marks:{" "}
                              {record.marksObtained}/{record.maximumMarks}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteEducationRecord(record.id)
                            }
                            disabled={educationDeletingId === String(record.id)}
                            className="self-start rounded-lg px-3 py-2 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 sm:self-center"
                          >
                            {educationDeletingId === String(record.id)
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {application?.qualification || profile?.qualification ? (
                    <form
                      onSubmit={handleSaveEducationRecord}
                      className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-700">
                          Add an academic record
                        </p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                          Qualification:{" "}
                          {application?.qualification || profile?.qualification}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="educationInstitution"
                            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
                          >
                            School / college / institution
                          </label>
                          <input
                            id="educationInstitution"
                            value={educationForm.institution}
                            onChange={(event) =>
                              setEducationForm((previous) => ({
                                ...previous,
                                institution: event.target.value,
                              }))
                            }
                            maxLength={180}
                            required
                            placeholder="Enter institution name"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="educationBoard"
                            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
                          >
                            Board / university{" "}
                            <span className="font-normal text-slate-400">
                              (optional)
                            </span>
                          </label>
                          <input
                            id="educationBoard"
                            value={educationForm.board}
                            onChange={(event) =>
                              setEducationForm((previous) => ({
                                ...previous,
                                board: event.target.value,
                              }))
                            }
                            maxLength={180}
                            placeholder="e.g. CBSE / State Board"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="educationYear"
                            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
                          >
                            Year of passing
                          </label>
                          <input
                            id="educationYear"
                            type="number"
                            min="1950"
                            max={new Date().getFullYear() + 1}
                            value={educationForm.yearOfPassing}
                            onChange={(event) =>
                              setEducationForm((previous) => ({
                                ...previous,
                                yearOfPassing: event.target.value,
                              }))
                            }
                            required
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="educationMarks"
                            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
                          >
                            Marks obtained
                          </label>
                          <input
                            id="educationMarks"
                            type="number"
                            min="0"
                            step="0.01"
                            value={educationForm.marksObtained}
                            onChange={(event) =>
                              setEducationForm((previous) => ({
                                ...previous,
                                marksObtained: event.target.value,
                              }))
                            }
                            required
                            placeholder="e.g. 465"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="educationMaximumMarks"
                            className="mb-1.5 block text-[11px] font-semibold text-slate-600"
                          >
                            Maximum marks
                          </label>
                          <input
                            id="educationMaximumMarks"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={educationForm.maximumMarks}
                            onChange={(event) =>
                              setEducationForm((previous) => ({
                                ...previous,
                                maximumMarks: event.target.value,
                              }))
                            }
                            required
                            placeholder="e.g. 500"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] leading-4 text-slate-400">
                          Percentage is calculated and saved by the server.
                        </p>
                        <button
                          type="submit"
                          disabled={educationSaving || educationLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#173b61] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {educationSaving ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          {educationSaving
                            ? "Saving record..."
                            : "Save academic record"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                      Complete your highest qualification in{" "}
                      <a
                        href="/applicant/edit-profile"
                        className="font-bold text-blue-700 hover:underline"
                      >
                        My Profile
                      </a>{" "}
                      before adding an academic record.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Transparent eligibility rules
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Eligibility decisions are made by the configured programme
                      rules and academic records. The applicant dashboard
                      displays the recorded result; it does not run or alter the
                      staff evaluation.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* GETTING STARTED */}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Quick access
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                  Getting started
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Everything you need to prepare your admission application.
                </p>

                <div className="mt-5 space-y-2">
                  {[
                    {
                      title: "Complete your profile",

                      description: "Review your personal and academic details.",

                      icon: UserRound,

                      link: "/applicant/edit-profile",
                    },

                    {
                      title: "Explore programmes",

                      description: "Find the right academic programme.",

                      icon: GraduationCap,

                      link: "/programmes",
                    },

                    {
                      title: "Prepare your documents",

                      description: "Check your required certificates.",

                      icon: FileText,

                      link: "#documents",
                    },

                    {
                      title: "Admission guidance",

                      description: "Understand the admission process.",

                      icon: CircleHelp,

                      link: "/admission-process",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.title}
                        href={item.link}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/70"
                      >
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition group-hover:bg-blue-100">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-700">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.description}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600"
                        />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              {/* DOCUMENT CENTRE */}

              <motion.div
                id="documents"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Document centre
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                      Required documents
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Upload each document separately for verification.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    <AlertCircle size={14} />
                    Verification required
                  </span>
                </div>

                {documentError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {documentError}
                  </div>
                )}

                {documentNotice && (
                  <div
                    role="status"
                    className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  >
                    {documentNotice}
                  </div>
                )}

                {applicationError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  >
                    {applicationError}
                  </div>
                )}

                {!applicationId && !profile?.programmeId ? (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                    <FolderCheck size={27} className="mx-auto text-slate-400" />
                    <p className="mt-3 text-sm font-bold text-[#173b61]">
                      Choose a programme first
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Explore Programmes to select your preferred programme.
                      Your selection will return here and be saved to your
                      profile.
                    </p>
                    <a
                      href="/programmes"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#173b61] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Explore programmes <ArrowRight size={14} />
                    </a>
                  </div>
                ) : documentRequirements.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs leading-5 text-amber-800">
                    No document requirements are configured for this programme
                    and qualification. Contact the admission office before
                    submitting.
                  </div>
                ) : (
                  <>
                    {!applicationId && (
                      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#173b61]">
                            Programme-specific document checklist
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            These are the documents configured for your selected
                            programme. Start an application before uploading
                            them.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartApplication}
                          disabled={
                            !applicationLoaded ||
                            profileLoading ||
                            applicationStarting
                          }
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#173b61] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {applicationStarting
                            ? "Creating draft..."
                            : "Start application"}{" "}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                    <div className="mt-6 space-y-3">
                      {[
                        ...new Map(
                          applicantDocumentOptions.map((doc) => [
                            normalizeDocumentName(doc.apiName || doc.name),
                            doc,
                          ]),
                        ).values(),
                      ].map((doc) => {
                        // Trust the qualification-specific requirement returned by the backend.
                        const isMandatory = doc.isMandatory;
                        const requiredLabel = doc.required;
                        const uploadedDocument = uploadedDocuments.find(
                          (item) =>
                            Number(item.documentTypeId) ===
                              doc.documentTypeId ||
                            normalizeDocumentName(item.documentType) ===
                              normalizeDocumentName(doc.apiName),
                        );
                        const isUploading = uploadingDocumentId === doc.id;
                        const statusMeta = uploadedDocument
                          ? getDocumentStatus(uploadedDocument.status)
                          : null;
                        const uploadBlocked =
                          !applicationId ||
                          Boolean(uploadingDocumentId) ||
                          documentsLoading ||
                          !applicationLoaded ||
                          !["DRAFT", "DOCUMENT_VERIFICATION"].includes(
                            applicationStatus,
                          );

                        return (
                          <div
                            key={doc.id}
                            className="group rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/20"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                                  <FileText size={21} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-bold text-[#173b61]">
                                      {doc.name}
                                    </h4>
                                    <span
                                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${isMandatory ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600"}`}
                                    >
                                      {requiredLabel}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {doc.description}
                                  </p>
                                  {documentsLoading ? (
                                    <p className="mt-2 text-xs text-slate-400">
                                      Loading saved documents...
                                    </p>
                                  ) : uploadedDocument ? (
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <p className="flex min-w-0 items-center gap-1.5 break-all text-xs font-medium text-blue-700">
                                        <FileCheck2
                                          size={14}
                                          className="shrink-0"
                                        />
                                        {uploadedDocument.fileName}
                                      </p>
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusMeta.className}`}
                                      >
                                        {statusMeta.label}
                                      </span>
                                      {uploadedDocument.uploadedAt && (
                                        <span className="text-[10px] text-slate-400">
                                          {formatDocumentDate(
                                            uploadedDocument.uploadedAt,
                                          )}
                                        </span>
                                      )}
                                      {uploadedDocument.id && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDocumentDownload(
                                              uploadedDocument,
                                            )
                                          }
                                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline"
                                        >
                                          <Download size={12} /> Download
                                        </button>
                                      )}
                                      {uploadedDocument.latestReason && (
                                        <span className="basis-full text-[11px] text-rose-600">
                                          Officer note:{" "}
                                          {uploadedDocument.latestReason}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="mt-2 text-xs text-slate-400">
                                      No file submitted yet
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                {!documentsLoading && uploadedDocument && (
                                  <span className="text-[11px] font-semibold text-emerald-600">
                                    Saved
                                  </span>
                                )}
                                <label
                                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold text-white transition ${uploadBlocked ? "cursor-not-allowed bg-slate-400" : "cursor-pointer bg-[#173b61] hover:bg-blue-700"}`}
                                >
                                  <Upload size={14} />
                                  {isUploading
                                    ? "Uploading..."
                                    : uploadedDocument
                                      ? "Replace file"
                                      : "Upload"}
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    disabled={uploadBlocked}
                                    onChange={(event) =>
                                      handleDocumentUpload(doc, event)
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#173b61]">
                        Document submission guidelines
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Upload clear and readable documents. Every mandatory
                        document configured for your selected programme must be
                        uploaded before you can submit the application.
                      </p>
                      <p className="mt-2 text-[10px] font-medium text-blue-600">
                        Accepted formats: PDF, JPG and PNG · Maximum size: 5 MB
                        per file
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400">
                    Saved: {uploadedDocuments.length} /{" "}
                    {applicantDocumentOptions.length} document types
                  </p>

                  <span className="text-[10px] text-emerald-600">
                    {applicationStatus === "DRAFT"
                      ? "Draft · synced with your application"
                      : "Synced with your application"}
                  </span>
                </div>
              </motion.div>

              {/* NOTIFICATIONS */}
              <motion.div
                id="notifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Stay informed
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                      Notifications
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Live updates from your admission workflow.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Mark all read
                      </button>
                    )}
                    {notificationItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearNotifications}
                        className="rounded-lg border border-rose-100 px-3 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        Clear inbox
                      </button>
                    )}
                  </div>
                </div>

                {notificationError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
                  >
                    {notificationError}
                  </div>
                )}
                {notificationsLoading ? (
                  <div className="mt-6 rounded-xl bg-slate-50 px-4 py-7 text-center text-xs text-slate-400">
                    Loading your notifications...
                  </div>
                ) : notificationItems.length ? (
                  <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {notificationItems.slice(0, 12).map((item) => (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start ${item.read ? "" : "bg-blue-50/50"}`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Bell size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold text-slate-800">
                              {item.title}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.read ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"}`}
                            >
                              {item.read ? "Read" : "Unread"}
                            </span>
                            {item.type && (
                              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                                {String(item.type).replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.message}
                          </p>
                          <p className="mt-1.5 text-[10px] text-slate-400">
                            {formatDocumentDate(item.createdAt)}
                            {item.applicationNumber
                              ? ` · ${item.applicationNumber}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleNotificationOpen(item)}
                            className="rounded-lg px-3 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-50"
                          >
                            Open
                          </button>
                          {!item.read && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkNotificationRead(item.id)
                              }
                              className="rounded-lg px-3 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
                    <Bell size={25} className="mx-auto text-slate-400" />
                    <h4 className="mt-3 text-sm font-bold text-[#173b61]">
                      You're all caught up!
                    </h4>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
                      New admission, document verification and eligibility
                      updates will appear here.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* APPLICANT CLARIFICATIONS */}
              <motion.div
                id="clarifications"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Action required
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-[#173b61]">
                      Clarification requests
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Respond to questions or document corrections from the
                      admission team.
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <MessageSquareText size={21} />
                  </div>
                </div>
                {clarificationError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
                  >
                    {clarificationError}
                  </div>
                )}
                {clarificationNotice && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700"
                  >
                    {clarificationNotice}
                  </div>
                )}
                {clarificationRequests.length ? (
                  <div className="mt-5 space-y-3">
                    {clarificationRequests.map((item) => {
                      const waiting = item.status === "WAITING_FOR_APPLICANT";
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-extrabold text-slate-800">
                              {item.subject ||
                                item.document ||
                                "Application clarification"}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${waiting ? "bg-amber-50 text-amber-700" : item.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {String(item.status || "OPEN").replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {item.instruction ||
                              item.reason ||
                              item.description ||
                              "The admission team has requested additional information."}
                          </p>
                          {item.applicantResponse && (
                            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                              <strong>Your response:</strong>{" "}
                              {item.applicantResponse}
                            </p>
                          )}
                          {waiting && (
                            <div className="mt-3 space-y-2">
                              <textarea
                                rows={3}
                                value={clarificationResponses[item.id] || ""}
                                onChange={(event) =>
                                  setClarificationResponses((previous) => ({
                                    ...previous,
                                    [item.id]: event.target.value,
                                  }))
                                }
                                placeholder="Write your response to the admission team..."
                                className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleClarificationResponse(item)
                                  }
                                  disabled={
                                    clarificationSubmitting === String(item.id)
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#173b61] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {clarificationSubmitting ===
                                  String(item.id) ? (
                                    <LoaderCircle
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <ArrowRight size={14} />
                                  )}
                                  {clarificationSubmitting === String(item.id)
                                    ? "Sending..."
                                    : "Send response"}
                                </button>
                              </div>
                            </div>
                          )}
                          <p className="mt-2 text-[10px] text-slate-400">
                            {item.applicationNumber
                              ? `Application ${item.applicationNumber} · `
                              : ""}
                            {formatDocumentDate(
                              item.updatedAt || item.createdAt,
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
                    <Check size={22} className="mx-auto text-emerald-600" />
                    <p className="mt-2 text-xs font-bold text-slate-700">
                      No pending clarification requests
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      If the admission team needs additional information, the
                      request will appear here.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </section>

          {/* FOOTER */}

          <footer
            id="profile"
            className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>© 2026 CrediFit · Applicant Portal</p>

            <div className="flex items-center gap-4">
              <a href="#settings" className="hover:text-blue-600">
                Privacy
              </a>

              <a href="#settings" className="hover:text-blue-600">
                Terms
              </a>

              <a
                href="mailto:admissions@example.edu"
                className="hover:text-blue-600"
              >
                Support
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default ApplicantDashboard;
