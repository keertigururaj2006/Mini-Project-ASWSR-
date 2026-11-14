import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { apiRequest } from "../../services/api";

export default function AdminEvaluatorAssignments() {
  const [applications, setApplications] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedEvaluators, setSelectedEvaluators] = useState({});
  const [dueDates, setDueDates] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [assignedThisSession, setAssignedThisSession] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [applicationResponse, userResponse] = await Promise.all([
        apiRequest("/admin/applications?status=DEPARTMENT_REVIEW"),
        apiRequest("/admin/users"),
      ]);

      const applicationRows = Array.isArray(applicationResponse.data)
        ? applicationResponse.data
        : [];

      const userRows = Array.isArray(userResponse.data)
        ? userResponse.data
        : [];

      setApplications(
        applicationRows.filter(
          (application) => application.status === "DEPARTMENT_REVIEW",
        ),
      );

      setEvaluators(
        userRows.filter(
          (user) =>
            user.roleCode === "EVALUATOR" && user.accountStatus === "ACTIVE",
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to load evaluator assignment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) =>
      [
        application.applicationNumber,
        application.applicantName,
        application.applicantEmail,
        application.programmeName,
        application.admissionCycle,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [applications, search]);

  const handleAssign = async (application) => {
    const evaluatorId = selectedEvaluators[application.id];

    if (!evaluatorId) {
      setNotice({
        type: "error",
        message: "Please select an evaluator first.",
      });
      return;
    }

    const evaluator = evaluators.find(
      (user) => String(user.id) === String(evaluatorId),
    );

    if (!evaluator) {
      setNotice({
        type: "error",
        message: "Selected evaluator account is unavailable.",
      });
      return;
    }

    setSavingId(application.id);
    setNotice(null);

    try {
      const body = {
        evaluatorUserId: Number(evaluatorId),
      };

      if (dueDates[application.id]) {
        body.dueDate = dueDates[application.id];
      }

      await apiRequest(
        `/admin/applications/${application.id}/assign-evaluator`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      setAssignedThisSession((previous) => ({
        ...previous,
        [application.id]: evaluator.fullName,
      }));

      setNotice({
        type: "success",
        message: `${evaluator.fullName} has been assigned to ${application.applicationNumber}.`,
      });

      setSelectedEvaluators((previous) => ({
        ...previous,
        [application.id]: "",
      }));
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Unable to assign evaluator.",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institutional administration / Department review
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172554] sm:text-3xl">
            Evaluator Assignments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Allocate eligible applications to active evaluators for department
            review.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Eligible applications
            </p>
            <ClipboardList size={19} className="text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#172554]">
            {applications.length}
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Applications at Department Review
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              Active evaluators
            </p>
            <UserRound size={19} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#172554]">
            {evaluators.length}
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            Available evaluator accounts
          </p>
        </div>
      </div>

      {/* Notices */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {notice && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      {/* Application queue */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <h2 className="text-sm font-bold text-[#172554]">
            Department review queue
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Only applications eligible for evaluator assignment are displayed.
          </p>

          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applicant, application ID or programme..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Loading applications and evaluators...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ClipboardList size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#172554]">
              {applications.length === 0
                ? "No applications ready for assignment"
                : "No matching applications"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
              Applications will appear here after they successfully complete
              eligibility screening and reach Department Review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((application) => (
              <article key={application.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#172554]">
                        {application.applicantName}
                      </h3>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                        Ready for assignment
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {application.applicationNumber}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {application.programmeName}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {application.applicantEmail}
                      {application.admissionCycle
                        ? ` · ${application.admissionCycle}`
                        : ""}
                    </p>
                  </div>

                  <span className="h-fit rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-indigo-700">
                    Department Review
                  </span>
                </div>

                <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_190px_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold text-slate-500">
                      Assign evaluator *
                    </span>

                    <select
                      value={selectedEvaluators[application.id] || ""}
                      onChange={(event) =>
                        setSelectedEvaluators((previous) => ({
                          ...previous,
                          [application.id]: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Choose evaluator</option>
                      {evaluators.map((evaluator) => (
                        <option key={evaluator.id} value={evaluator.id}>
                          {evaluator.fullName}
                          {evaluator.department
                            ? ` · ${evaluator.department}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <CalendarDays size={12} />
                      Due date (optional)
                    </span>

                    <input
                      type="date"
                      value={dueDates[application.id] || ""}
                      onChange={(event) =>
                        setDueDates((previous) => ({
                          ...previous,
                          [application.id]: event.target.value,
                        }))
                      }
                      min={new Date().toISOString().slice(0, 10)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={
                      !selectedEvaluators[application.id] ||
                      savingId === application.id ||
                      evaluators.length === 0
                    }
                    onClick={() => handleAssign(application)}
                    className="h-10 rounded-lg bg-[#173b61] px-5 text-xs font-bold text-white transition hover:bg-[#245c8e] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {savingId === application.id
                      ? "Assigning..."
                      : "Assign evaluator"}
                  </button>
                </div>

                {assignedThisSession[application.id] && (
                  <p className="text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 size={12} className="mr-1 inline" />
                    Assigned during this session to{" "}
                    {assignedThisSession[application.id]}.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">
            Showing {filteredApplications.length} of {applications.length}{" "}
            eligible applications
          </div>
        )}
      </section>

      {evaluators.length === 0 && !loading && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          No active Evaluator accounts found. Create an Evaluator account in
          User & Role Management before assigning applications.
        </p>
      )}
    </div>
  );
}
