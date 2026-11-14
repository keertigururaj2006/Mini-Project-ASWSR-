import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const emptyForm = {
  code: "",
  name: "",
  shortCode: "",
  category: "",
  level: "",
  duration: "",
  description: "",
  department: "",
  intakeCapacity: "",
  isActive: true,
};

const STANDARD_LEVELS = [
  {
    value: "Undergraduate",
    title: "Undergraduate",
    description: "Bachelor's degree programmes",
    short: "UG",
  },
  {
    value: "Postgraduate",
    title: "Postgraduate",
    description: "Master's degree programmes",
    short: "PG",
  },
  {
    value: "Diploma",
    title: "Diploma",
    description: "Diploma and technical programmes",
    short: "DIP",
  },
  {
    value: "Certificate",
    title: "Certificate",
    description: "Certificate and short-term courses",
    short: "CERT",
  },
  {
    value: "Doctoral",
    title: "Doctoral",
    description: "PhD and research programmes",
    short: "PHD",
  },
  {
    value: "Other",
    title: "Other",
    description: "Integrated or custom programme level",
    short: "OTHER",
  },
];

const ALL_PROGRAMMES = "__all_programmes__";

const isProgrammeActive = (programme) =>
  programme.isActive === true ||
  programme.isActive === 1 ||
  programme.isActive === "1";

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

export default function AdminProgrammes() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [customLevel, setCustomLevel] = useState("");

  const loadProgrammes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/admin/programmes");
      setProgrammes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message || "Unable to load programmes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreateForm = () => {
    setEditingProgramme(null);
    setForm(emptyForm);
    setCustomLevel("");
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (programme) => {
    const storedLevel = String(programme.level || "").trim();
    const isStandardLevel = STANDARD_LEVELS.some(
      (item) => item.value === storedLevel && item.value !== "Other",
    );

    setEditingProgramme(programme);
    setForm({
      code: programme.code || "",
      name: programme.name || "",
      shortCode: programme.shortCode || "",
      category: programme.category || "",
      level: isStandardLevel ? storedLevel : storedLevel ? "Other" : "",
      duration: programme.duration || "",
      description: programme.description || "",
      department: programme.department || "",
      intakeCapacity: programme.intakeCapacity ?? "",
      isActive: isProgrammeActive(programme),
    });
    setCustomLevel(isStandardLevel ? "" : storedLevel);
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProgramme(null);
    setForm(emptyForm);
    setCustomLevel("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const resolvedLevel =
      form.level === "Other" ? customLevel.trim() : form.level.trim();

    if (!resolvedLevel) {
      setError(
        form.level === "Other"
          ? "Enter the custom programme level."
          : "Select a programme level to continue.",
      );
      setSaving(false);
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      shortCode: form.shortCode.trim(),
      category: form.category.trim(),
      level: resolvedLevel,
      duration: form.duration.trim() || "To be announced",
      description: form.description.trim(),
      department: form.department.trim(),
      intakeCapacity:
        form.intakeCapacity === "" ? null : Number(form.intakeCapacity),
      isActive: form.isActive,
    };

    if (payload.level.length > 50) {
      setError("Programme level must be 50 characters or fewer.");
      setSaving(false);
      return;
    }

    if (
      payload.intakeCapacity !== null &&
      (!Number.isInteger(payload.intakeCapacity) || payload.intakeCapacity <= 0)
    ) {
      setError("Enter a valid positive whole-number intake capacity.");
      setSaving(false);
      return;
    }

    try {
      if (editingProgramme) {
        await apiRequest(`/admin/programmes/${editingProgramme.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/admin/programmes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const wasEditing = Boolean(editingProgramme);
      await loadProgrammes();
      closeForm();
      setNotice(
        wasEditing
          ? "Programme updated successfully."
          : "Programme created successfully.",
      );
    } catch (err) {
      setError(err.message || "Unable to save programme.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProgrammeStatus = async (programme) => {
    const nextStatus = !isProgrammeActive(programme);

    setSavingId(programme.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/admin/programmes/${programme.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextStatus }),
      });

      await loadProgrammes();
      setNotice(
        `${programme.name} has been ${nextStatus ? "activated" : "deactivated"}.`,
      );
    } catch (err) {
      setError(err.message || "Unable to update programme status.");
    } finally {
      setSavingId(null);
    }
  };

  const activeCount = programmes.filter(isProgrammeActive).length;
  const inactiveCount = programmes.length - activeCount;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const statusScopedProgrammes = useMemo(
    () =>
      programmes.filter((programme) => {
        if (statusFilter === "active") return isProgrammeActive(programme);
        if (statusFilter === "inactive") return !isProgrammeActive(programme);
        return true;
      }),
    [programmes, statusFilter],
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(
          statusScopedProgrammes
            .map((programme) =>
              String(programme.category || "Uncategorised").trim(),
            )
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [statusScopedProgrammes],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    statusScopedProgrammes.forEach((programme) => {
      const category = String(programme.category || "Uncategorised").trim();
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return counts;
  }, [statusScopedProgrammes]);

  const isSearching = normalizedQuery.length > 0;
  const isShowingCategoryGrid = !isSearching && selectedCategory === null;

  const visibleProgrammes = useMemo(() => {
    if (isSearching) {
      return statusScopedProgrammes.filter((programme) =>
        [
          programme.name,
          programme.code,
          programme.shortCode,
          programme.category,
          programme.level,
          programme.department,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedQuery),
          ),
      );
    }

    if (selectedCategory === null) return [];
    if (selectedCategory === ALL_PROGRAMMES) return statusScopedProgrammes;

    return statusScopedProgrammes.filter(
      (programme) =>
        String(programme.category || "Uncategorised").trim() ===
        selectedCategory,
    );
  }, [isSearching, normalizedQuery, selectedCategory, statusScopedProgrammes]);

  const renderProgrammeRow = (programme) => {
    const active = isProgrammeActive(programme);

    return (
      <article
        key={programme.id}
        className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50/70 sm:flex-row sm:items-center"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#172554]">
              {programme.name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>

          <p className="mt-1 text-[10px] font-semibold text-slate-600">
            {programme.code} · {programme.shortCode}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {programme.category || "Uncategorised"} ·{" "}
            {programme.level || "Level not set"} ·{" "}
            {programme.duration || "Duration not set"}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            Department: {programme.department || "Not assigned"}
            {" · "}
            Intake: {programme.intakeCapacity ?? "Not specified"}
          </p>

          {programme.description && (
            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
              {programme.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openEditForm(programme)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
          >
            <Pencil size={12} />
            Edit
          </button>

          <button
            type="button"
            disabled={savingId === programme.id}
            onClick={() => toggleProgrammeStatus(programme)}
            className={`rounded-lg border px-3 py-2 text-[10px] font-bold transition disabled:cursor-wait disabled:opacity-50 ${
              active
                ? "border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                : "border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            {savingId === programme.id
              ? "Saving..."
              : active
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            Institutional configuration
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#172554] sm:text-3xl">
            Programme Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse programmes by field, search the catalogue and manage
            admission availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadProgrammes}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-800"
          >
            <Plus size={15} />
            Add programme
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800"
        >
          <CheckCircle2 size={15} />
          {notice}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Total programmes
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#172554]">
            {programmes.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900">
            Active programmes
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-800">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-slate-100 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
            Inactive programmes
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-800">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Catalogue controls */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
              <Search size={16} className="shrink-0 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by programme name, code, department or level..."
                className="h-11 w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-500"
                aria-label="Search programmes"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <AdminFilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                {
                  value: "all",
                  label: `All Programmes (${programmes.length})`,
                },
                {
                  value: "active",
                  label: `Active Programmes (${activeCount})`,
                },
                {
                  value: "inactive",
                  label: `Inactive Programmes (${inactiveCount})`,
                },
              ]}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers3 size={17} className="text-indigo-700" />
              <h2 className="text-sm font-extrabold text-[#172554]">
                Programme catalogue
              </h2>
            </div>
            <p className="text-[10px] font-semibold text-slate-600">
              {statusScopedProgrammes.length} programmes in this status view
            </p>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-xs font-medium text-slate-500">
            Loading programmes...
          </p>
        ) : programmes.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 size={30} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-700">
              No programmes found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add a programme to begin building the catalogue.
            </p>
          </div>
        ) : isShowingCategoryGrid ? (
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Choose a field
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Select a category to view only the programmes offered in that
                field.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(ALL_PROGRAMMES)}
                className="group flex min-h-[104px] items-center justify-between rounded-2xl border border-indigo-300 bg-indigo-50 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-700 text-white">
                    <Layers3 size={20} />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-indigo-950">
                      All programmes
                    </span>
                    <span className="mt-1 block text-[11px] font-medium text-indigo-800">
                      Browse the complete catalogue
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-2 text-xs font-extrabold text-indigo-900">
                  {statusScopedProgrammes.length}
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="group flex min-h-[104px] items-center justify-between rounded-2xl border border-slate-300 bg-white p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition group-hover:bg-indigo-800">
                      <Building2 size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold leading-5 text-slate-900">
                        {category}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium text-slate-600">
                        View programmes in this field
                      </span>
                    </span>
                  </div>
                  <span className="ml-2 flex shrink-0 items-center gap-2 text-xs font-extrabold text-slate-800">
                    {categoryCounts.get(category) || 0}
                    <ArrowRight
                      size={16}
                      className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-indigo-700"
                    />
                  </span>
                </button>
              ))}
            </div>

            {categories.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-600">
                No programmes match this status filter.
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-between gap-2 border-b border-slate-200 bg-slate-100 px-5 py-3 sm:flex-row sm:items-center">
              <div>
                {!isSearching && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 hover:text-indigo-950"
                  >
                    <ArrowLeft size={12} />
                    All categories
                  </button>
                )}
                <h3 className="text-sm font-extrabold text-slate-950">
                  {isSearching
                    ? `Search results for “${searchQuery.trim()}”`
                    : selectedCategory === ALL_PROGRAMMES
                      ? "All programmes"
                      : selectedCategory}
                </h3>
              </div>
              <span className="w-fit rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-extrabold text-slate-800">
                {visibleProgrammes.length}{" "}
                {visibleProgrammes.length === 1 ? "programme" : "programmes"}
              </span>
            </div>

            {visibleProgrammes.length > 0 ? (
              <div>{visibleProgrammes.map(renderProgrammeRow)}</div>
            ) : (
              <div className="p-10 text-center">
                <Search size={27} className="mx-auto text-slate-400" />
                <p className="mt-3 text-sm font-bold text-slate-800">
                  No matching programmes
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Try another search term or change the programme status filter.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Create / Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-700">
                  Institutional configuration
                </p>
                <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                  {editingProgramme ? "Edit programme" : "Add programme"}
                </h2>
                <p className="mt-1 text-[11px] text-slate-600">
                  Enter programme details and choose its academic level.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["code", "Programme code *", "e.g. BCA"],
                  ["shortCode", "Short code *", "e.g. BCA"],
                  [
                    "name",
                    "Programme name *",
                    "e.g. Bachelor of Computer Applications",
                  ],
                  ["category", "Category *", "e.g. Engineering & Technology"],
                  ["duration", "Duration", "e.g. 3 Years"],
                  ["department", "Department", "e.g. Computer Applications"],
                  ["intakeCapacity", "Intake capacity", "e.g. 120"],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
                      {label}
                    </span>
                    <input
                      required={[
                        "code",
                        "shortCode",
                        "name",
                        "category",
                      ].includes(key)}
                      type={key === "intakeCapacity" ? "number" : "text"}
                      min={key === "intakeCapacity" ? "1" : undefined}
                      step={key === "intakeCapacity" ? "1" : undefined}
                      value={form[key]}
                      onChange={(event) => updateField(key, event.target.value)}
                      placeholder={placeholder}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                ))}
              </div>

              {/* Programme level selector */}

              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-extrabold text-slate-900">
                  Programme Level <span className="text-rose-600">*</span>
                </legend>

                <p className="mb-4 text-xs text-slate-500">
                  Select the academic level for this programme.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {STANDARD_LEVELS.map((level) => {
                    const selected = form.level === level.value;

                    return (
                      <button
                        type="button"
                        key={level.value}
                        aria-pressed={selected}
                        onClick={() => {
                          updateField("level", level.value);
                          if (level.value !== "Other") setCustomLevel("");
                        }}
                        className={`group relative flex min-h-[100px] items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-[#173b61] bg-blue-50 shadow-md shadow-blue-950/10"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#456b91] hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                            selected
                              ? "bg-[#173b61] text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-blue-100"
                          }`}
                        >
                          {level.value === "Undergraduate" ||
                          level.value === "Postgraduate" ? (
                            <GraduationCap size={23} />
                          ) : (
                            <Layers3 size={22} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-extrabold text-slate-900">
                            {level.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {level.description}
                          </span>
                          <span
                            className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              selected
                                ? "bg-[#173b61] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {level.short}
                          </span>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-[#173b61] bg-[#173b61] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && <CheckCircle2 size={15} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.level === "Other" && (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-bold text-slate-800">
                      Specify Programme Level *
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={customLevel}
                      onChange={(event) => setCustomLevel(event.target.value)}
                      placeholder="e.g. Integrated, Professional"
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#173b61] focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                )}
              </fieldset>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
                  Description
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe this programme..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-indigo-700"
                />
                <span>
                  <span className="block text-xs font-bold text-slate-900">
                    Programme is active
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-600">
                    Active programmes can be selected during admission.
                  </span>
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-800 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProgramme
                      ? "Save programme changes"
                      : "Create programme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
