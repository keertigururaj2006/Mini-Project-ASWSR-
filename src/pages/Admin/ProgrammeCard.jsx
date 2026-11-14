import { Pencil } from "lucide-react";

export default function ProgrammeCard({
  programme,
  openEditForm,
  toggleProgrammeStatus,
  savingId,
  isProgrammeActive,
}) {
  const active = isProgrammeActive(programme);

  return (
    <article className="flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#172554]">{programme.name}</h3>

        <p className="mt-1 text-[10px] text-slate-500">
          {programme.code} · {programme.shortCode}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          {programme.category} · {programme.level} · {programme.duration}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
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
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
            active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {active ? "Active" : "Disabled"}
        </span>

        <button
          type="button"
          onClick={() => openEditForm(programme)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <Pencil size={12} />
          Edit
        </button>

        <button
          type="button"
          disabled={savingId === programme.id}
          onClick={() => toggleProgrammeStatus(programme)}
          className={`rounded-lg border px-3 py-2 text-[10px] font-bold transition disabled:opacity-50 ${
            active
              ? "border-rose-200 text-rose-600 hover:bg-rose-50"
              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
}
