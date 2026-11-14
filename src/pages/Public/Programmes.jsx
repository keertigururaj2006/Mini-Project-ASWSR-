import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  GraduationCap,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Code2,
  BriefcaseBusiness,
  ChevronDown,
  HeartPulse,
  Sprout,
  Atom,
  Palette,
  Scale,
  PenTool,
  Plane,
  X,
  SlidersHorizontal,
  Building2,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const themeStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-700",
    glow: "from-blue-500/10 to-indigo-500/5",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "text-blue-700",
    line: "bg-blue-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700",
    glow: "from-violet-500/10 to-fuchsia-500/5",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    accent: "text-violet-700",
    line: "bg-violet-500",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    glow: "from-emerald-500/10 to-teal-500/5",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "text-emerald-700",
    line: "bg-emerald-500",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-700",
    glow: "from-cyan-500/10 to-sky-500/5",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-100",
    accent: "text-cyan-700",
    line: "bg-cyan-500",
  },
};

const fieldMeta = {
  "Engineering & Technology": { icon: Code2, theme: "blue" },
  "Medical & Healthcare": { icon: HeartPulse, theme: "violet" },
  "Agriculture & Veterinary": { icon: Sprout, theme: "emerald" },
  "Science & Research": { icon: Atom, theme: "cyan" },
  "Business & Commerce": { icon: BriefcaseBusiness, theme: "violet" },
  "Arts & Social Sciences": { icon: Palette, theme: "blue" },
  "Law & Public Policy": { icon: Scale, theme: "emerald" },
  "Architecture & Design": { icon: PenTool, theme: "cyan" },
  "Education & Hospitality": { icon: BookOpen, theme: "blue" },
  "Sports & Other Fields": { icon: Plane, theme: "violet" },
};

function ProgrammeCard({
  programme,
  index,
  onSelect,
  selecting,
  selected,
  applicantSignedIn,
}) {
  const meta = fieldMeta[programme.category] || {
    icon: GraduationCap,
    theme: "blue",
  };
  const Icon = meta.icon;
  const theme = themeStyles[meta.theme];

  const shortCode =
    programme.short || programme.code || programme.shortCode || "PROGRAMME";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.025, 0.2),
        layout: { duration: 0.25 },
      }}
      whileHover={{ y: -5 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.035)] transition-shadow duration-300 hover:shadow-[0_22px_50px_rgba(15,35,65,0.10)]"
    >
      <div className={`h-1 w-full ${theme.line}`} />
      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <div
          className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl transition-transform duration-500 group-hover:scale-125`}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.icon} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon size={26} strokeWidth={1.8} />
          </div>
          <span
            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}
          >
            {programme.level || "Programme"}
          </span>
        </div>

        <div className="relative mt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-extrabold tracking-wide ${theme.accent}`}
            >
              {shortCode}
            </span>
            {programme.category && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-slate-400">
                  {programme.category}
                </span>
              </>
            )}
          </div>

          <h3 className="mt-3 min-h-[58px] text-xl font-extrabold leading-[1.4] tracking-tight text-[#132d4b] transition-colors group-hover:text-blue-800">
            {programme.name}
          </h3>
          <p className="mt-3 min-h-[76px] text-[13px] leading-6 text-slate-500">
            {programme.description ||
              "View programme details and admission requirements."}
          </p>
        </div>

        <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock3 size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">
              {programme.duration || "Duration as prescribed"}
            </span>
          </div>
          {programme.department && (
            <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
              <BookOpen size={15} className="shrink-0 text-slate-400" />
              <span className="truncate">{programme.department}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(programme)}
          disabled={Boolean(selecting)}
          className={`relative mt-6 flex h-12 w-full items-center justify-between rounded-xl px-5 text-sm font-bold text-white transition-all duration-300 ${
            selecting
              ? "cursor-wait bg-blue-800"
              : selected
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-[#102d50] hover:bg-blue-700 group-hover:shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
          }`}
        >
          <span>
            {selecting
              ? "Saving selection..."
              : selected
                ? "Selected programme"
                : applicantSignedIn
                  ? "Select this programme"
                  : "Sign in to select"}
          </span>
          {selecting ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : selected ? (
            <CheckCircle2 size={18} />
          ) : (
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          )}
        </button>
      </div>
    </motion.article>
  );
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("credifit_user") || "{}");
  } catch {
    return {};
  }
}

function Programmes() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All levels");
  const [category, setCategory] = useState("All fields");

  const [programmes, setProgrammes] = useState([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");

  const [selectionError, setSelectionError] = useState("");
  const [selectionNotice, setSelectionNotice] = useState("");
  const [selectingProgrammeId, setSelectingProgrammeId] = useState(null);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(null);

  const storedUser = readStoredUser();
  const accessToken = localStorage.getItem("credifit_access_token");
  const applicantSignedIn =
    Boolean(accessToken) &&
    (storedUser.roleCode === "APPLICANT" ||
      String(storedUser.role || "").toLowerCase() === "applicant");

  useEffect(() => {
    let active = true;

    async function loadProgrammes() {
      setCatalogueLoading(true);
      setCatalogueError("");

      try {
        const response = await apiRequest("/programmes");
        const items = response?.data ?? response;

        if (!Array.isArray(items)) {
          throw new Error(
            "The programme catalogue returned an unexpected response.",
          );
        }

        if (active) {
          setProgrammes(items);
        }
      } catch (error) {
        if (active) {
          setCatalogueError(
            error.message || "Unable to load the programme catalogue.",
          );
        }
      } finally {
        if (active) setCatalogueLoading(false);
      }
    }

    loadProgrammes();

    return () => {
      active = false;
    };
  }, []);

  // Read the currently saved programme for the signed-in applicant.
  useEffect(() => {
    let active = true;

    async function loadCurrentSelection() {
      if (!applicantSignedIn) return;

      try {
        const response = await apiRequest("/profile/me");
        const profile = response?.data ?? response;

        if (active && profile?.programmeId) {
          setSelectedProgrammeId(Number(profile.programmeId));
        }
      } catch {
        // Catalogue remains usable. A selection click will display the API error.
      }
    }

    loadCurrentSelection();

    return () => {
      active = false;
    };
  }, [applicantSignedIn]);

  const levels = useMemo(
    () => [
      "All levels",
      ...new Set(programmes.map((item) => item.level).filter(Boolean)),
    ],
    [programmes],
  );

  const categories = useMemo(
    () => [
      "All fields",
      ...new Set(programmes.map((item) => item.category).filter(Boolean)),
    ],
    [programmes],
  );

  const filteredProgrammes = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return programmes.filter((programme) => {
      const searchableText = [
        programme.name,
        programme.short,
        programme.code,
        programme.category,
        programme.level,
        programme.description,
        programme.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchText);
      const matchesLevel = level === "All levels" || programme.level === level;
      const matchesCategory =
        category === "All fields" || programme.category === category;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [programmes, search, level, category]);

  const hasActiveFilters =
    search.trim() !== "" || level !== "All levels" || category !== "All fields";

  function clearFilters() {
    setSearch("");
    setLevel("All levels");
    setCategory("All fields");
  }

  async function handleSelectProgramme(programme) {
    setSelectionError("");
    setSelectionNotice("");

    if (!accessToken || !applicantSignedIn) {
      navigate("/login", {
        state: {
          from: "/programmes",
          selectedProgrammeId: programme.id,
          selectedProgrammeName: programme.name,
        },
      });
      return;
    }

    setSelectingProgrammeId(Number(programme.id));

    try {
      // Confirm the token belongs to an applicant account before updating the profile.
      const profileResponse = await apiRequest("/profile/me");
      const profile = profileResponse?.data ?? profileResponse;

      if (!profile?.id || profile.roleCode !== "APPLICANT") {
        throw new Error(
          "Please sign in with your applicant account to select a programme.",
        );
      }

      await apiRequest("/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          programmeId: Number(programme.id),
        }),
      });

      setSelectedProgrammeId(Number(programme.id));

      // The applicant dashboard reads the preferred programme from GET /profile/me.
      navigate("/applicant/dashboard", {
        state: {
          programmeSelectionSaved: true,
          selectedProgrammeId: Number(programme.id),
          selectedProgrammeName: programme.name,
        },
      });
    } catch (error) {
      setSelectionError(
        error.message ||
          "Unable to save this programme selection. Please try again.",
      );
    } finally {
      setSelectingProgrammeId(null);
    }
  }

  const studyLevelCount = new Set(
    programmes.map((item) => item.level).filter(Boolean),
  ).size;
  const fieldCount = new Set(
    programmes.map((item) => item.category).filter(Boolean),
  ).size;

  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f8fc] text-slate-800">
      {/* NAVIGATION */}
      <header className="relative z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102d50] text-white shadow-md shadow-blue-950/10">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#142f4e]">
                CrediFit<span className="text-blue-600">.</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-slate-400">
                Admissions portal
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Home
            </Link>
            <Link
              to="/programmes"
              className="relative text-sm font-bold text-[#173b61]"
            >
              Programmes
              <span className="absolute -bottom-[27px] left-0 h-[3px] w-full rounded-full bg-blue-600" />
            </Link>
            <Link
              to="/admission-process"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Admission process
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {applicantSignedIn ? (
              <Link
                to="/applicant/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-950/10 transition hover:bg-blue-700 sm:px-5 sm:text-sm"
              >
                My applicant profile
                <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-950/10 transition hover:bg-blue-700 sm:px-5 sm:text-sm"
                >
                  Get started
                  <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PROGRAMMES EXPLORER */}
      <main
        id="explore"
        className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <span className="h-1.5 w-6 rounded-full bg-blue-600" />
              Academic opportunities
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
              Explore our programmes
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Explore active programmes configured by the institution. Select a
              programme to save it to your applicant profile.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
            <Building2 size={16} className="text-blue-600" />
            Live academic programme directory
          </div>
        </motion.div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Active programmes
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#173b61]">
              {catalogueLoading ? "—" : programmes.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Study levels
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#173b61]">
              {catalogueLoading ? "—" : studyLevelCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Fields of study
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#173b61]">
              {catalogueLoading ? "—" : fieldCount}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mt-7 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,35,65,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search programme, course code or department..."
                aria-label="Search programmes"
                className="h-12 w-full rounded-xl border border-slate-200 bg-[#f9fafc] pl-12 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="relative lg:w-[220px]">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                aria-label="Filter by study level"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {categories.length > 1 && (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-start">
              <span className="shrink-0 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Browse by field
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => {
                  const active = category === item;

                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCategory(item)}
                      aria-pressed={active}
                      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                        active
                          ? "bg-[#173b61] text-white shadow-md shadow-blue-950/10"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 transition hover:text-blue-900"
              >
                <X size={14} /> Clear filters
              </button>
            </div>
          )}
        </div>

        {selectionError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{selectionError}</p>
          </div>
        )}

        {selectionNotice && (
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {selectionNotice}
          </div>
        )}

        {/* Results heading */}
        <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#142f4e]">
              Available programmes
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {applicantSignedIn
                ? "Choose a programme to update your applicant profile."
                : "Sign in with an applicant account to save your programme choice."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2">
            <span className="text-xs font-bold text-[#173b61]">
              {filteredProgrammes.length}
            </span>
            <span className="ml-1.5 text-xs text-slate-500">
              {filteredProgrammes.length === 1
                ? "programme found"
                : "programmes found"}
            </span>
          </div>
        </div>

        {catalogueLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-[26px] border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
              <LoaderCircle size={20} className="animate-spin text-blue-600" />
              Loading active programmes...
            </div>
          </div>
        ) : catalogueError ? (
          <div className="rounded-[26px] border border-rose-200 bg-white px-6 py-14 text-center">
            <AlertCircle size={30} className="mx-auto text-rose-500" />
            <h3 className="mt-4 text-lg font-extrabold text-[#142f4e]">
              Couldn't load programmes
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {catalogueError}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[#173b61] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredProgrammes.length > 0 ? (
          <motion.div
            layout
            className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredProgrammes.map((programme, index) => (
                <ProgrammeCard
                  key={
                    programme.id ||
                    programme.code ||
                    programme.short ||
                    programme.name
                  }
                  programme={programme}
                  index={index}
                  onSelect={handleSelectProgramme}
                  selecting={selectingProgrammeId === Number(programme.id)}
                  selected={selectedProgrammeId === Number(programme.id)}
                  applicantSignedIn={applicantSignedIn}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={27} />
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-[#142f4e]">
              {programmes.length === 0
                ? "No active programmes available"
                : "No programmes found"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {programmes.length === 0
                ? "The administrator has not published any active programmes yet."
                : "We couldn't find a programme matching your search and filters. Try another keyword or reset your filters."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <X size={16} /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* Bottom information */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
              <GraduationCap size={25} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#142f4e]">
                Ready to take the next step?
              </h3>
              <p className="mt-1 max-w-xl text-xs leading-6 text-slate-500 sm:text-sm">
                Choose an active programme to save it to your applicant profile.
                You can continue your admission application from your dashboard.
              </p>
            </div>
          </div>
          <Link
            to={applicantSignedIn ? "/applicant/dashboard" : "/register"}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#173b61] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            {applicantSignedIn ? "Back to applicant profile" : "Create account"}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-4 px-5 py-7 text-center sm:flex-row sm:px-8 sm:text-left lg:px-12">
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight text-[#142f4e]"
          >
            CrediFit<span className="text-blue-600">.</span>
          </Link>
          <p className="text-xs text-slate-400">
            © 2026 CrediFit · Admission Management Platform
          </p>
          <Link
            to="/admission-process"
            className="text-xs font-semibold text-slate-500 transition hover:text-blue-700"
          >
            Understand the admission process{" "}
            <ArrowUpRight size={13} className="inline" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Programmes;
