import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const emptyForm = {
  name: "",
  startDate: "",
  endDate: "",
  isActive: false,
};

const isCycleActive = (cycle) =>
  cycle.isActive === true || cycle.isActive === 1 || cycle.isActive === "1";

const formatDate = (value) => {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminAdmissionCycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadCycles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/admin/admission-cycles");
      setCycles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message || "Unable to load admission cycles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openForm = () => {
    setForm(emptyForm);
    setError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setError("");
  };

  const handleCreateCycle = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError("Complete all required fields.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("End date must be after or equal to the start date.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/admin/admission-cycles", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          isActive: form.isActive,
        }),
      });

      closeForm();
      await loadCycles();

      setNotice("Admission cycle created successfully.");
    } catch (err) {
      setError(err.message || "Unable to create admission cycle.");
    } finally {
      setSaving(false);
    }
  };

  const activateCycle = async (cycle) => {
    setError("");
    setNotice("");
    setActivatingId(cycle.id);

    try {
      await apiRequest(`/admin/admission-cycles/${cycle.id}/activate`, {
        method: "PATCH",
      });

      await loadCycles();
      setNotice(`${cycle.name} is now the active admission cycle.`);
    } catch (err) {
      setError(err.message || "Unable to activate admission cycle.");
    } finally {
      setActivatingId(null);
    }
  };

  const deleteCycle = async (cycle) => {
    if (isCycleActive(cycle)) return;

    const confirmed = window.confirm(
      `Delete "${cycle.name}"? This cannot be undone. Cycles linked to applications cannot be deleted.`,
    );
    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(cycle.id);

    try {
      await apiRequest(`/admin/admission-cycles/${cycle.id}`, {
        method: "DELETE",
      });
      await loadCycles();
      setNotice(`${cycle.name} was deleted successfully.`);
    } catch (err) {
      setError(err.message || "Unable to delete admission cycle.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeCycles = cycles.filter(isCycleActive);
  const inactiveCycles = cycles.filter((cycle) => !isCycleActive(cycle));
  const filteredCycles = cycles.filter((cycle) => {
    if (statusFilter === "active") return isCycleActive(cycle);
    if (statusFilter === "inactive") return !isCycleActive(cycle);
    return true;
  });
  const filteredActiveCycles = filteredCycles.filter(isCycleActive);
  const filteredInactiveCycles = filteredCycles.filter(
    (cycle) => !isCycleActive(cycle),
  );

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
            Institutional configuration
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-[#172554] sm:text-3xl">
            Admission Cycle Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Configure admission periods and control the active admission cycle.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadCycles}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Plus size={15} />
            New cycle
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700"
        >
          <CheckCircle2 size={15} />
          {notice}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Total cycles
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[#172554]">
            {cycles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Active cycles
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            {activeCycles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Inactive cycles
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-500">
            {inactiveCycles.length}
          </p>
        </div>
      </div>

      {/* Cycle list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-indigo-600" />
              <h2 className="text-sm font-extrabold text-[#172554]">
                Admission cycles
              </h2>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Records retrieved directly from the database.
            </p>
          </div>

          <AdminFilterDropdown
            label="Cycle Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: `All cycles (${cycles.length})` },
              {
                value: "active",
                label: `Active cycles (${activeCycles.length})`,
              },
              {
                value: "inactive",
                label: `Inactive cycles (${inactiveCycles.length})`,
              },
            ]}
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">
            Loading admission cycles...
          </p>
        ) : cycles.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              No admission cycles found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Create your first admission cycle.
            </p>
          </div>
        ) : filteredCycles.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              No {statusFilter === "active" ? "active" : "inactive"} cycles
              found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Choose another status filter or create a new admission cycle.
            </p>
          </div>
        ) : (
          <div>
            {filteredActiveCycles.length > 0 && (
              <section>
                <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-5 py-3">
                  <h3 className="text-xs font-extrabold text-emerald-800">
                    Active Cycles
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    {filteredActiveCycles.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredActiveCycles.map((cycle) => (
                    <CycleCard
                      key={cycle.id}
                      cycle={cycle}
                      active
                      onActivate={activateCycle}
                      onDelete={deleteCycle}
                      activatingId={activatingId}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredInactiveCycles.length > 0 && (
              <section
                className={
                  filteredActiveCycles.length > 0
                    ? "border-t-4 border-slate-100"
                    : ""
                }
              >
                <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                  <h3 className="text-xs font-extrabold text-slate-700">
                    Inactive / Previous Cycles
                  </h3>
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                    {filteredInactiveCycles.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredInactiveCycles.map((cycle) => (
                    <CycleCard
                      key={cycle.id}
                      cycle={cycle}
                      active={false}
                      onActivate={activateCycle}
                      onDelete={deleteCycle}
                      activatingId={activatingId}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      {/* Create modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                  Institutional configuration
                </p>
                <h2 className="mt-1 text-base font-extrabold text-[#172554]">
                  Create admission cycle
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                  Cycle name *
                </span>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. 2027–28 Admission Cycle"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    Start date *
                  </span>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(event) =>
                      updateField("startDate", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                    End date *
                  </span>
                  <input
                    type="date"
                    required
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      updateField("endDate", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Make this the active admission cycle
                </span>
              </label>

              {form.isActive && (
                <p className="rounded-lg bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">
                  Activating this cycle will automatically deactivate the
                  currently active cycle.
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function CycleCard({
  cycle,
  active,
  onActivate,
  onDelete,
  activatingId,
  deletingId,
}) {
  return (
    <article className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-sm font-bold text-[#172554]">{cycle.name}</h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={12} />
            Starts: {formatDate(cycle.startDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={12} />
            Ends: {formatDate(cycle.endDate)}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
            active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>

        {!active && (
          <button
            type="button"
            disabled={activatingId === cycle.id || deletingId === cycle.id}
            onClick={() => onActivate(cycle)}
            className="rounded-lg border border-indigo-200 px-3 py-2 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
          >
            {activatingId === cycle.id ? "Activating..." : "Make active"}
          </button>
        )}

        <button
          type="button"
          disabled={
            active || activatingId === cycle.id || deletingId === cycle.id
          }
          onClick={() => onDelete(cycle)}
          title={
            active
              ? "Activate another cycle before deleting this one."
              : "Delete this unused admission cycle."
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={13} />
          {deletingId === cycle.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
