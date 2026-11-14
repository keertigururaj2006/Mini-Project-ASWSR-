import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const INDIA_STATES_AND_UTS = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const ADD_NEW_CITY = "__ADD_NEW_CITY__";

const emptyCollege = {
  name: "",
  address: "",
  city: "",
  state: "",
  description: "",
  isActive: true,
};

const emptyOffering = {
  programmeId: "",
  minimumPercentage: "",
  intakeCapacity: "",
  isActive: true,
};

const isActive = (value) => value === true || value === 1 || value === "1";

const messageFrom = (error, fallback) => error?.message || fallback;

const directoryStateSlug = (state) =>
  String(state || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const sameText = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() ===
  String(b || "")
    .trim()
    .toLowerCase();

function StyledDropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  compact = false,
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const selected = options.find(
    (option) => String(option.value) === String(value),
  );
  const visibleOptions = options.filter((option) =>
    String(option.label).toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          setQuery("");
        }}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white text-left font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${compact ? "h-10 border-slate-200 px-3 text-[10px]" : "h-[42px] border-slate-200 px-3 text-xs"}`}
      >
        <span className="min-w-0 truncate">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={compact ? 13 : 14}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-[95] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {searchable && options.length > 7 && (
            <div className="border-b border-slate-100 p-2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Search..."
                className="h-8 w-full rounded-lg bg-slate-50 px-2.5 text-[10px] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}
          <div role="listbox" className="max-h-56 overflow-y-auto p-1.5">
            {visibleOptions.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[11px] transition ${active ? "bg-indigo-50 font-bold text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {active && (
                    <CheckCircle2
                      size={13}
                      className="ml-2 shrink-0 text-indigo-600"
                    />
                  )}
                </button>
              );
            })}
            {visibleOptions.length === 0 && (
              <p className="px-3 py-4 text-center text-[10px] text-slate-400">
                No matching options
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCollegeManagement() {
  const [colleges, setColleges] = useState([]);
  const [collegeLocations, setCollegeLocations] = useState([]);
  const [directoryStates, setDirectoryStates] = useState(INDIA_STATES_AND_UTS);
  const [directoryStateSlugs, setDirectoryStateSlugs] = useState({});
  const [directoryColleges, setDirectoryColleges] = useState([]);
  const [directoryDistricts, setDirectoryDistricts] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState("");
  const [directorySearch, setDirectorySearch] = useState("");
  const [selectedDirectoryInstitution, setSelectedDirectoryInstitution] =
    useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [programmesLoading, setProgrammesLoading] = useState(true);
  const [programmeAccessMode, setProgrammeAccessMode] = useState("ALL");
  const [offerings, setOfferings] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [offeringsLoading, setOfferingsLoading] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [savingOffering, setSavingOffering] = useState(false);
  const [togglingCollegeId, setTogglingCollegeId] = useState(null);
  const [togglingOfferingId, setTogglingOfferingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [browseState, setBrowseState] = useState("all");
  const [browseCity, setBrowseCity] = useState("all");
  const [cityEntryMode, setCityEntryMode] = useState(false);
  const [registerNewMode, setRegisterNewMode] = useState(false);
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [offeringModalOpen, setOfferingModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [editingOffering, setEditingOffering] = useState(null);
  const [collegeForm, setCollegeForm] = useState(emptyCollege);
  const [initialOfferingForm, setInitialOfferingForm] = useState(emptyOffering);
  const [offeringForm, setOfferingForm] = useState(emptyOffering);

  const stateOptions = useMemo(() => {
    const existingStates = collegeLocations
      .map((location) => String(location.state || "").trim())
      .filter(Boolean);
    return [
      ...new Set([
        ...INDIA_STATES_AND_UTS,
        ...directoryStates,
        ...existingStates,
      ]),
    ].sort((a, b) => a.localeCompare(b));
  }, [collegeLocations, directoryStates]);

  const browseCityOptions = useMemo(() => {
    if (!browseState || browseState === "all") return [];
    return [
      ...new Set(
        collegeLocations
          .filter(
            (location) =>
              String(location.state || "").toLowerCase() ===
              browseState.toLowerCase(),
          )
          .map((location) => String(location.city || "").trim())
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [browseState, collegeLocations]);

  const formCityOptions = useMemo(
    () =>
      directoryDistricts
        .map((district) => String(district || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [directoryDistricts],
  );

  const matchingCityColleges = useMemo(() => {
    if (!collegeForm.state || !collegeForm.city || cityEntryMode) return [];
    const query = directorySearch.trim().toLowerCase();
    return directoryColleges.filter(
      (college) =>
        sameText(college.state, collegeForm.state) &&
        sameText(
          college.cityOrDistrict || college.city || college.district,
          collegeForm.city,
        ) &&
        (!query ||
          [
            college.name,
            college.address,
            college.university,
            college.institutionType,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))),
    );
  }, [
    cityEntryMode,
    collegeForm.city,
    collegeForm.state,
    directoryColleges,
    directorySearch,
  ]);

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();
    return colleges.filter((college) => {
      const matchesState =
        browseState === "all" ||
        String(college.state || "").toLowerCase() === browseState.toLowerCase();
      const matchesCity =
        browseCity === "all" ||
        String(college.city || "").toLowerCase() === browseCity.toLowerCase();
      const matchesSearch =
        !query ||
        [college.name, college.city, college.state]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesState && matchesCity && matchesSearch;
    });
  }, [browseCity, browseState, colleges, search]);

  const selectedCollege =
    filteredColleges.find(
      (college) => String(college.id) === String(selectedCollegeId),
    ) ||
    filteredColleges[0] ||
    null;

  useEffect(() => {
    if (
      filteredColleges.some(
        (college) => String(college.id) === String(selectedCollegeId),
      )
    )
      return;
    setSelectedCollegeId(
      filteredColleges[0] ? String(filteredColleges[0].id) : "",
    );
  }, [filteredColleges, selectedCollegeId]);

  const loadColleges = useCallback(async () => {
    const response = await apiRequest("/admin/colleges");
    const rows = Array.isArray(response?.data) ? response.data : [];
    setColleges(rows);
    setSelectedCollegeId((current) => {
      if (current && rows.some((item) => String(item.id) === String(current))) {
        return current;
      }
      return rows.length ? String(rows[0].id) : "";
    });
    return rows;
  }, []);

  const loadLocations = useCallback(async () => {
    const response = await apiRequest("/admin/college-management/locations");
    const rows = Array.isArray(response?.data) ? response.data : [];
    setCollegeLocations(rows);
    return rows;
  }, []);

  const loadDirectoryStates = useCallback(async () => {
    try {
      const response = await apiRequest("/admin/college-directory/states");
      const data = response?.data || {};
      const rows = Array.isArray(data.states) ? data.states : [];
      const normalizedStates = rows
        .map((entry) => {
          if (typeof entry === "string") {
            return { name: entry.trim(), slug: directoryStateSlug(entry) };
          }
          const name = String(
            entry?.name || entry?.state || entry?.label || "",
          ).trim();
          const slug = String(
            entry?.slug || entry?.stateSlug || directoryStateSlug(name),
          ).trim();
          return { name, slug };
        })
        .filter((entry) => entry.name && entry.slug);
      const names = normalizedStates.map((entry) => entry.name);
      if (names.length) {
        setDirectoryStates(names);
        setDirectoryStateSlugs(
          Object.fromEntries(
            normalizedStates.map((entry) => [entry.name, entry.slug]),
          ),
        );
      }
    } catch {
      // Keep the built-in India state/UT list as a fallback if the directory
      // state catalogue is temporarily unavailable.
      setDirectoryStates(INDIA_STATES_AND_UTS);
    }
  }, []);

  const loadStateDirectory = useCallback(
    async (state) => {
      if (!state) {
        setDirectoryColleges([]);
        setDirectoryDistricts([]);
        return;
      }
      setDirectoryLoading(true);
      setDirectoryError("");
      setDirectoryColleges([]);
      setDirectoryDistricts([]);
      try {
        const slug = directoryStateSlugs[state] || directoryStateSlug(state);
        const response = await apiRequest(
          `/admin/college-directory/states/${encodeURIComponent(slug)}`,
        );
        const data = response?.data || {};
        setDirectoryColleges(Array.isArray(data.colleges) ? data.colleges : []);
        setDirectoryDistricts(
          Array.isArray(data.districts) ? data.districts : [],
        );
        if (!Array.isArray(data.colleges) || data.colleges.length === 0) {
          setDirectoryError(
            "The directory has no verified institutions in this state for your assigned programmes. Try another state or review your programme permissions.",
          );
        }
        return data;
      } catch (error) {
        const message = messageFrom(
          error,
          "Unable to load the national college directory.",
        );
        setDirectoryError(message);
        throw error;
      } finally {
        setDirectoryLoading(false);
      }
    },
    [directoryStateSlugs],
  );

  const loadProgrammes = useCallback(async () => {
    setProgrammesLoading(true);
    try {
      const response = await apiRequest(
        "/admin/college-management/allowed-programmes",
      );
      const data = response?.data || {};
      setProgrammeAccessMode(
        data.accessMode || (data.allowAll ? "ALL" : "SELECTED"),
      );
      const allowedProgrammes = Array.isArray(data.programmes)
        ? data.programmes
        : [];
      setProgrammes(allowedProgrammes);
      setInitialOfferingForm((current) => ({
        ...current,
        programmeId: allowedProgrammes.some(
          (programme) => String(programme.id) === String(current.programmeId),
        )
          ? current.programmeId
          : String(allowedProgrammes[0]?.id || ""),
      }));
    } finally {
      setProgrammesLoading(false);
    }
  }, []);

  const loadOfferings = useCallback(async (collegeId) => {
    if (!collegeId) {
      setOfferings([]);
      return [];
    }
    setOfferingsLoading(true);
    try {
      const response = await apiRequest(
        `/admin/college-programmes?collegeId=${encodeURIComponent(collegeId)}`,
      );
      const rows = Array.isArray(response?.data) ? response.data : [];
      setOfferings(rows);
      return rows;
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadColleges(), loadProgrammes(), loadLocations()]);
      if (selectedCollegeId) await loadOfferings(selectedCollegeId);
    } catch (err) {
      setError(messageFrom(err, "Unable to load college management data."));
    } finally {
      setLoading(false);
    }
  }, [
    loadColleges,
    loadLocations,
    loadOfferings,
    loadProgrammes,
    selectedCollegeId,
  ]);

  useEffect(() => {
    refreshAll();
    loadDirectoryStates();
  }, [refreshAll, loadDirectoryStates]);

  useEffect(() => {
    if (!selectedCollegeId) {
      setOfferings([]);
      return;
    }
    setError("");
    loadOfferings(selectedCollegeId).catch((err) => {
      setError(messageFrom(err, "Unable to load programme offerings."));
    });
  }, [selectedCollegeId, loadOfferings]);

  const openCreateCollege = () => {
    setEditingCollege(null);
    setCollegeForm(emptyCollege);
    setInitialOfferingForm({
      ...emptyOffering,
      programmeId: String(programmes[0]?.id || ""),
    });
    setCityEntryMode(false);
    setRegisterNewMode(false);
    setDirectoryColleges([]);
    setDirectoryDistricts([]);
    setDirectoryError("");
    setDirectorySearch("");
    setSelectedDirectoryInstitution(null);
    setError("");
    setNotice("");
    setCollegeModalOpen(true);
  };

  const openEditCollege = (college) => {
    setEditingCollege(college);
    setCollegeForm({
      name: college.name || "",
      address: college.address || "",
      city: college.city || "",
      state: college.state || "",
      description: college.description || "",
      isActive: isActive(college.isActive),
    });
    setCityEntryMode(false);
    setRegisterNewMode(true);
    setSelectedDirectoryInstitution(null);
    setError("");
    setNotice("");
    setCollegeModalOpen(true);
  };

  const chooseExistingCollege = (college) => {
    setSelectedCollegeId(String(college.id));
    setBrowseState(college.state || "all");
    setBrowseCity(college.city || "all");
    setSearch("");
    setCollegeModalOpen(false);
    setRegisterNewMode(false);
    setError("");
    setNotice(
      `${college.name} selected. Its permitted programme offerings are loaded.`,
    );
  };

  const importDirectoryCollege = (institution) => {
    const firstMatch = institution.matchedProgrammes?.[0];
    setSelectedDirectoryInstitution(institution);
    setCollegeForm({
      name: institution.name || "",
      address: institution.address || "",
      city:
        institution.cityOrDistrict ||
        institution.city ||
        institution.district ||
        "",
      state: institution.state || collegeForm.state,
      description: [
        institution.university
          ? `Affiliated university: ${institution.university}`
          : "",
        institution.institutionType
          ? `Institution type: ${institution.institutionType}`
          : "",
        institution.directoryInstitutionId
          ? `Directory ID: ${institution.directoryInstitutionId}`
          : "",
      ]
        .filter(Boolean)
        .join(" | "),
      isActive: true,
    });
    setInitialOfferingForm({
      ...emptyOffering,
      programmeId: String(firstMatch?.programmeId || ""),
      minimumPercentage: "",
      intakeCapacity: "",
    });
    setRegisterNewMode(true);
    setCityEntryMode(false);
    setError("");
    setDirectoryError("");
    setNotice(
      `${institution.name} selected from the national directory. Confirm its college cutoff and intake capacity before importing.`,
    );
  };

  const saveCollege = async (event) => {
    event.preventDefault();
    setSavingCollege(true);
    setError("");
    setNotice("");
    const payload = {
      name: collegeForm.name.trim(),
      address: collegeForm.address.trim() || null,
      city: collegeForm.city.trim() || null,
      state: collegeForm.state.trim() || null,
      description: collegeForm.description.trim() || null,
      isActive: Boolean(collegeForm.isActive),
      ...(!editingCollege &&
      selectedDirectoryInstitution?.directoryInstitutionId
        ? {
            directoryInstitutionId:
              selectedDirectoryInstitution.directoryInstitutionId,
          }
        : {}),
      ...(editingCollege
        ? {}
        : {
            initialOffering: {
              programmeId: Number(initialOfferingForm.programmeId),
              minimumPercentage: Number(initialOfferingForm.minimumPercentage),
              intakeCapacity:
                initialOfferingForm.intakeCapacity === ""
                  ? null
                  : Number(initialOfferingForm.intakeCapacity),
              isActive: true,
            },
          }),
    };
    if (!payload.name || !payload.state || !payload.city) {
      setError("College name, state and city are required.");
      setSavingCollege(false);
      return;
    }
    if (!editingCollege) {
      const initialCapacity =
        initialOfferingForm.intakeCapacity === ""
          ? null
          : Number(initialOfferingForm.intakeCapacity);
      if (!initialOfferingForm.programmeId) {
        setError(
          "Choose the first permitted programme offered by this college.",
        );
        setSavingCollege(false);
        return;
      }
      if (
        !Number.isFinite(Number(initialOfferingForm.minimumPercentage)) ||
        Number(initialOfferingForm.minimumPercentage) < 0 ||
        Number(initialOfferingForm.minimumPercentage) > 100
      ) {
        setError("Enter a valid college cutoff between 0 and 100 percent.");
        setSavingCollege(false);
        return;
      }
      if (
        initialCapacity !== null &&
        (!Number.isInteger(initialCapacity) || initialCapacity < 1)
      ) {
        setError(
          "Seat capacity must be a positive whole number, or left blank for unlimited seats.",
        );
        setSavingCollege(false);
        return;
      }
    }
    try {
      if (editingCollege) {
        await apiRequest(`/admin/colleges/${editingCollege.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("College details updated successfully.");
      } else {
        const response = await apiRequest("/admin/colleges", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const createdId = response?.data?.id;
        if (createdId) setSelectedCollegeId(String(createdId));
        setNotice(
          response?.data?.existing
            ? "This institution was already registered. Its verified programme offering is ready."
            : "College imported from the national directory with its first verified programme offering.",
        );
      }
      setCollegeModalOpen(false);
      setBrowseState(payload.state);
      setBrowseCity(payload.city);
      setSearch("");
      if (!editingCollege) {
        setRegisterNewMode(false);
        setSelectedDirectoryInstitution(null);
      }
      await Promise.all([loadColleges(), loadLocations()]);
    } catch (err) {
      setError(messageFrom(err, "Unable to save college details."));
    } finally {
      setSavingCollege(false);
    }
  };

  const toggleCollegeStatus = async (college) => {
    setTogglingCollegeId(college.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/admin/colleges/${college.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive(college.isActive) }),
      });
      await loadColleges();
      setNotice(
        `${college.name} ${isActive(college.isActive) ? "deactivated" : "activated"}.`,
      );
    } catch (err) {
      setError(messageFrom(err, "Unable to update college status."));
    } finally {
      setTogglingCollegeId(null);
    }
  };

  const openCreateOffering = () => {
    if (!selectedCollege) return;
    setEditingOffering(null);
    setOfferingForm(emptyOffering);
    setError("");
    setNotice("");
    setOfferingModalOpen(true);
  };

  const openEditOffering = (offering) => {
    setEditingOffering(offering);
    setOfferingForm({
      programmeId: String(offering.programmeId || ""),
      minimumPercentage: String(offering.minimumPercentage ?? ""),
      intakeCapacity: offering.intakeCapacity ?? "",
      isActive: isActive(offering.isActive),
    });
    setError("");
    setNotice("");
    setOfferingModalOpen(true);
  };

  const saveOffering = async (event) => {
    event.preventDefault();
    setSavingOffering(true);
    setError("");
    setNotice("");
    const minimumPercentage = Number(offeringForm.minimumPercentage);
    const intakeCapacity =
      offeringForm.intakeCapacity === ""
        ? null
        : Number(offeringForm.intakeCapacity);
    if (!selectedCollege) {
      setError("Select a college before adding a programme offering.");
      setSavingOffering(false);
      return;
    }
    if (!editingOffering && !offeringForm.programmeId) {
      setError("Select a programme.");
      setSavingOffering(false);
      return;
    }
    if (
      !Number.isFinite(minimumPercentage) ||
      minimumPercentage < 0 ||
      minimumPercentage > 100
    ) {
      setError("College cutoff must be between 0 and 100 percent.");
      setSavingOffering(false);
      return;
    }
    if (
      intakeCapacity !== null &&
      (!Number.isInteger(intakeCapacity) || intakeCapacity < 1)
    ) {
      setError(
        "Seat capacity must be a positive whole number, or left blank for unlimited seats.",
      );
      setSavingOffering(false);
      return;
    }
    try {
      if (editingOffering) {
        await apiRequest(`/admin/college-programmes/${editingOffering.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            minimumPercentage,
            intakeCapacity,
            isActive: Boolean(offeringForm.isActive),
          }),
        });
        setNotice("Programme offering updated successfully.");
      } else {
        await apiRequest("/admin/college-programmes", {
          method: "POST",
          body: JSON.stringify({
            collegeId: Number(selectedCollege.id),
            programmeId: Number(offeringForm.programmeId),
            minimumPercentage,
            intakeCapacity,
            isActive: Boolean(offeringForm.isActive),
          }),
        });
        setNotice("Programme offering saved successfully.");
      }
      setOfferingModalOpen(false);
      await loadOfferings(selectedCollege.id);
      await loadColleges();
    } catch (err) {
      setError(messageFrom(err, "Unable to save programme offering."));
    } finally {
      setSavingOffering(false);
    }
  };

  const toggleOfferingStatus = async (offering) => {
    setTogglingOfferingId(offering.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/admin/college-programmes/${offering.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive(offering.isActive) }),
      });
      await loadOfferings(selectedCollegeId);
      await loadColleges();
      setNotice(`${offering.programmeName} offering updated.`);
    } catch (err) {
      setError(messageFrom(err, "Unable to update programme offering."));
    } finally {
      setTogglingOfferingId(null);
    }
  };

  const updateCollegeField = (key, value) =>
    setCollegeForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "state" ? { city: "" } : {}),
    }));

  const handleDirectoryStateChange = (value) => {
    updateCollegeField("state", value);
    setCityEntryMode(false);
    setRegisterNewMode(false);
    setSelectedDirectoryInstitution(null);
    setDirectorySearch("");
    setDirectoryColleges([]);
    setDirectoryDistricts([]);
    loadStateDirectory(value).catch(() => {});
  };
  const updateOfferingField = (key, value) =>
    setOfferingForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            Institutional setup
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#172554]">
            College Management
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
            Search the preloaded national institution directory by state and
            district, import colleges that list your permitted courses, and
            configure each course's cutoff and intake capacity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateCollege}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={15} /> Add college
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700"
        >
          {notice}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.5fr)]">
        <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative z-20 rounded-t-2xl border-b border-slate-100 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#172554]">
                  Registered colleges
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  {colleges.length} college{colleges.length === 1 ? "" : "s"}{" "}
                  configured
                </p>
              </div>
              <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <Building2 size={18} />
              </span>
            </div>
            <div className="relative mt-4">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search colleges..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="min-w-0">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  State
                </span>
                <StyledDropdown
                  compact
                  value={browseState}
                  options={[
                    { value: "all", label: "All states" },
                    ...stateOptions.map((state) => ({
                      value: state,
                      label: state,
                    })),
                  ]}
                  onChange={(value) => {
                    setBrowseState(value);
                    setBrowseCity("all");
                  }}
                  placeholder="Select state"
                />
              </label>
              <label className="min-w-0">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  City
                </span>
                <StyledDropdown
                  compact
                  value={browseCity}
                  disabled={
                    browseState === "all" || browseCityOptions.length === 0
                  }
                  options={[
                    { value: "all", label: "All cities" },
                    ...browseCityOptions.map((city) => ({
                      value: city,
                      label: city,
                    })),
                  ]}
                  onChange={setBrowseCity}
                  placeholder={
                    browseState === "all" ? "Select state first" : "Select city"
                  }
                />
              </label>
            </div>
            <p className="mt-2 text-[9px] leading-4 text-slate-400">
              Choose a state, then a city to show only colleges registered in
              that location.
            </p>
            <div className="mt-3 rounded-xl bg-indigo-50/70 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                Your permitted courses
              </p>
              <p className="mt-1 text-[10px] font-semibold text-indigo-900">
                {programmesLoading
                  ? "Loading course access..."
                  : programmes.length
                    ? `${programmeAccessMode === "ALL" ? "All active: " : "Assigned: "}${programmes.map((item) => item.shortCode || item.name).join(" · ")}`
                    : "No course permissions assigned"}
              </p>
            </div>
          </div>
          <div className="max-h-[680px] divide-y divide-slate-100 overflow-y-auto rounded-b-2xl">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading colleges...
              </div>
            ) : filteredColleges.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 size={24} className="mx-auto text-slate-300" />
                <p className="mt-3 text-xs font-semibold text-slate-600">
                  No colleges found
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {browseCity !== "all"
                    ? `No colleges are registered in ${browseCity} yet.`
                    : browseState !== "all"
                      ? `No colleges are registered in ${browseState} yet.`
                      : "Add a college to start configuring programme offerings."}
                </p>
              </div>
            ) : (
              filteredColleges.map((college) => {
                const active = isActive(college.isActive);
                const selected =
                  String(college.id) === String(selectedCollegeId);
                return (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => setSelectedCollegeId(String(college.id))}
                    className={`w-full p-4 text-left transition ${selected ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-xs font-extrabold text-[#172554]">
                            {college.name}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={11} />{" "}
                          {[college.city, college.state]
                            .filter(Boolean)
                            .join(", ") || "Location not specified"}
                        </p>
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Courses matching your access
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {String(college.matchedProgrammes || "")
                            .split(" · ")
                            .filter(Boolean)
                            .map((name) => (
                              <span
                                key={name}
                                className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700"
                              >
                                {name}
                              </span>
                            ))}
                        </div>
                      </div>
                      {selected && (
                        <CheckCircle2
                          size={17}
                          className="shrink-0 text-indigo-600"
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {selectedCollege ? (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                    Selected college
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#172554]">
                    {selectedCollege.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />{" "}
                    {[selectedCollege.city, selectedCollege.state]
                      .filter(Boolean)
                      .join(", ") || "Location not specified"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditCollege(selectedCollege)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={13} /> Edit college
                  </button>
                  <button
                    type="button"
                    disabled={togglingCollegeId === selectedCollege.id}
                    onClick={() => toggleCollegeStatus(selectedCollege)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isActive(selectedCollege.isActive) ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {isActive(selectedCollege.isActive)
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={openCreateOffering}
                    disabled={!isActive(selectedCollege.isActive)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={13} /> Add programme
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-100 bg-slate-50/70 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-xs font-extrabold text-[#172554]">
                      {isActive(selectedCollege.isActive)
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Active offerings
                    </p>
                    <p className="mt-1 text-xs font-extrabold text-[#172554]">
                      {
                        offerings.filter((item) => isActive(item.isActive))
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#172554]">
                      Programme offerings
                    </h4>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Each offering has its own cutoff and intake capacity.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      loadOfferings(selectedCollege.id).catch((err) =>
                        setError(
                          messageFrom(err, "Unable to refresh offerings."),
                        ),
                      )
                    }
                    disabled={offeringsLoading}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                  >
                    <RefreshCw
                      size={14}
                      className={offeringsLoading ? "animate-spin" : ""}
                    />
                  </button>
                </div>
                {offeringsLoading ? (
                  <div className="py-10 text-center text-xs text-slate-400">
                    Loading programme offerings...
                  </div>
                ) : offerings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                    <GraduationCap
                      size={25}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 text-xs font-bold text-slate-600">
                      No programme offerings yet
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Add the programmes this college offers and set their
                      individual cutoff and seat capacity.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offerings.map((offering) => {
                      const active = isActive(offering.isActive);
                      return (
                        <article
                          key={offering.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-extrabold text-[#172554]">
                                  {offering.programmeName}
                                </p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                                >
                                  {active ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-slate-400">
                                {offering.programmeShortCode || "Programme"}
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <p className="text-[9px] text-slate-400">
                                    College cutoff
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-[#172554]">
                                    {Number(offering.minimumPercentage)
                                      .toFixed(2)
                                      .replace(/\.00$/, "")}
                                    %
                                  </p>
                                </div>
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <p className="text-[9px] text-slate-400">
                                    Intake capacity
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-[#172554]">
                                    {offering.intakeCapacity ?? "Unlimited"}
                                  </p>
                                </div>
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                  <p className="text-[9px] text-slate-400">
                                    Seats available
                                  </p>
                                  <p className="mt-1 text-xs font-extrabold text-[#172554]">
                                    {offering.seatsAvailable ?? "Not limited"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => openEditOffering(offering)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleOfferingStatus(offering)}
                                disabled={togglingOfferingId === offering.id}
                                className="rounded-lg border border-slate-200 px-2.5 py-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                                title={
                                  active
                                    ? "Deactivate offering"
                                    : "Activate offering"
                                }
                              >
                                {active ? (
                                  <ToggleRight size={14} />
                                ) : (
                                  <ToggleLeft size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <Building2 size={30} className="text-slate-300" />
              <h3 className="mt-3 text-sm font-extrabold text-[#172554]">
                Select a college
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                Choose a college from the left panel or add your first college.
              </p>
            </div>
          )}
        </section>
      </div>

      {collegeModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <form
            onSubmit={saveCollege}
            className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#172554]">
                  {editingCollege ? "Edit college" : "Add college"}
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  The national institution directory is preloaded by state.
                  Choose a district/city to see only institutions that list at
                  least one of your assigned courses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollegeModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            {!editingCollege && (
              <div className="space-y-4 border-b border-slate-100 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-600">
                      State *
                    </span>
                    <StyledDropdown
                      value={collegeForm.state}
                      options={stateOptions.map((state) => ({
                        value: state,
                        label: state,
                      }))}
                      onChange={handleDirectoryStateChange}
                      placeholder="Select state"
                    />
                  </label>
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-600">
                      City / District *
                    </span>
                    {cityEntryMode ? (
                      <div className="space-y-1.5">
                        <input
                          required
                          value={collegeForm.city}
                          onChange={(event) => {
                            updateCollegeField("city", event.target.value);
                            setSelectedDirectoryInstitution(null);
                          }}
                          className="h-[42px] w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400"
                          placeholder="Enter city name"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCityEntryMode(false);
                            updateCollegeField("city", "");
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Choose a city already in the directory
                        </button>
                      </div>
                    ) : (
                      <StyledDropdown
                        value={collegeForm.city}
                        disabled={!collegeForm.state || directoryLoading}
                        options={[
                          ...formCityOptions.map((city) => ({
                            value: city,
                            label: city,
                          })),
                          {
                            value: ADD_NEW_CITY,
                            label: "+ Add a location manually",
                          },
                        ]}
                        onChange={(value) => {
                          if (value === ADD_NEW_CITY) {
                            setCityEntryMode(true);
                            setRegisterNewMode(true);
                            setSelectedDirectoryInstitution(null);
                            updateCollegeField("city", "");
                          } else {
                            updateCollegeField("city", value);
                            setRegisterNewMode(false);
                            setSelectedDirectoryInstitution(null);
                          }
                        }}
                        placeholder={
                          !collegeForm.state
                            ? "Select state first"
                            : directoryLoading
                              ? "Loading districts..."
                              : "Select city / district"
                        }
                      />
                    )}
                  </div>
                </div>

                {collegeForm.state && !cityEntryMode && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#172554]">
                          Preloaded India institution directory ·{" "}
                          {collegeForm.state}
                        </h4>
                        <p className="mt-1 text-[10px] text-slate-500">
                          Choose a city / district to filter the preloaded
                          national institution directory by course records. Only
                          colleges that list at least one course assigned to
                          this Admin appear. Your permitted courses:{" "}
                          {programmes
                            .map((item) => item.shortCode || item.name)
                            .join(", ") || "No courses assigned"}
                          .
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-bold text-indigo-700">
                        {collegeForm.city
                          ? `${matchingCityColleges.length} matches`
                          : `${directoryColleges.length} matches in state`}
                      </span>
                    </div>
                    {directoryLoading ? (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
                        <RefreshCw
                          size={16}
                          className="mx-auto mb-2 animate-spin"
                        />
                        Loading preloaded institution and course records for{" "}
                        {collegeForm.state}...
                      </div>
                    ) : directoryError ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-800">
                        {directoryError}
                      </div>
                    ) : directoryColleges.length === 0 ? (
                      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
                        <Building2
                          size={22}
                          className="mx-auto text-slate-300"
                        />
                        <p className="mt-2 text-xs font-bold text-slate-600">
                          No institutions matched your permitted courses
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          The directory does not list an institution in this
                          state for the courses assigned to your Admin account.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-3">
                          <input
                            value={directorySearch}
                            onChange={(event) =>
                              setDirectorySearch(event.target.value)
                            }
                            placeholder="Search institution or university name..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[11px] outline-none focus:border-indigo-400"
                          />
                        </div>
                        {!collegeForm.city ? (
                          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-[10px] text-slate-500">
                            Select a city / district above to view matching
                            colleges and universities.
                          </div>
                        ) : matchingCityColleges.length ? (
                          <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                            {matchingCityColleges.map((institution) => {
                              const registered = colleges.find(
                                (item) =>
                                  sameText(item.name, institution.name) &&
                                  sameText(item.state, institution.state) &&
                                  sameText(
                                    item.city,
                                    institution.cityOrDistrict ||
                                      institution.city ||
                                      institution.district,
                                  ),
                              );
                              return (
                                <article
                                  key={institution.directoryInstitutionId}
                                  className="rounded-xl border border-slate-200 bg-white p-3"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="text-xs font-extrabold text-[#172554]">
                                        {institution.name}
                                      </p>
                                      <p className="mt-1 text-[9px] text-slate-400">
                                        {institution.university ||
                                          institution.institutionType ||
                                          "Higher education institution"}{" "}
                                        ·{" "}
                                        {institution.cityOrDistrict ||
                                          institution.city ||
                                          institution.district}
                                      </p>
                                      {institution.address && (
                                        <p className="mt-1 text-[9px] leading-4 text-slate-400">
                                          {institution.address}
                                        </p>
                                      )}
                                      <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                        Verified course matches
                                      </p>
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        {institution.matchedProgrammes.map(
                                          (item) => (
                                            <span
                                              key={item.programmeId}
                                              className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700"
                                            >
                                              {item.programmeName} (
                                              {item.directoryCourse})
                                            </span>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        registered
                                          ? chooseExistingCollege(registered)
                                          : importDirectoryCollege(institution)
                                      }
                                      className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold text-white ${registered ? "bg-emerald-700 hover:bg-emerald-800" : "bg-[#173b61] hover:bg-blue-700"}`}
                                    >
                                      {registered
                                        ? "Open registered college"
                                        : "Import this college"}
                                    </button>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
                            <Building2
                              size={22}
                              className="mx-auto text-slate-300"
                            />
                            <p className="mt-2 text-xs font-bold text-slate-600">
                              No matching colleges in {collegeForm.city}
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-slate-400">
                              Only institutions with a matching course entry in
                              the directory are shown. Colleges that do not list
                              your assigned courses are hidden.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    <p className="mt-3 text-[9px] leading-4 text-slate-400">
                      Course matching uses the public AICTE-derived institution
                      and programme snapshot. The location picker uses the
                      source's city field where available and district
                      otherwise. Regulator-specific catalogues outside this
                      source (for example, medical programmes) must be added
                      from their respective regulator directory; CrediFit does
                      not guess course availability.
                    </p>
                  </div>
                )}

                {!registerNewMode && (
                  <button
                    type="button"
                    onClick={() => setRegisterNewMode(true)}
                    disabled={
                      !collegeForm.state ||
                      !collegeForm.city ||
                      programmes.length === 0
                    }
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Institution missing from the directory? Add it manually
                    (course offering will be admin-declared)
                  </button>
                )}
              </div>
            )}

            {(editingCollege || registerNewMode) && (
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                    {editingCollege
                      ? "College details"
                      : "Register new institution"}
                  </p>
                  {!editingCollege && (
                    <p className="text-[10px] leading-4 text-slate-500">
                      A new institution must be registered with at least one of
                      your permitted programmes. This is what lets CrediFit
                      filter it correctly for future Admins and applicants.
                    </p>
                  )}
                </div>
                <label className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600">
                    College / university name *
                  </span>
                  <input
                    required
                    maxLength={180}
                    value={collegeForm.name}
                    onChange={(event) =>
                      updateCollegeField("name", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                    placeholder="Enter the official institution name"
                  />
                </label>
                {editingCollege ? (
                  <>
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-600">
                        State *
                      </span>
                      <StyledDropdown
                        value={collegeForm.state}
                        options={stateOptions.map((state) => ({
                          value: state,
                          label: state,
                        }))}
                        onChange={(value) => {
                          updateCollegeField("state", value);
                          setCityEntryMode(false);
                        }}
                        placeholder="Select state"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-600">
                        City / District *
                      </span>
                      {cityEntryMode ? (
                        <input
                          required
                          value={collegeForm.city}
                          onChange={(event) =>
                            updateCollegeField("city", event.target.value)
                          }
                          className="h-[42px] w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-indigo-400"
                          placeholder="Enter city"
                        />
                      ) : (
                        <StyledDropdown
                          value={collegeForm.city}
                          disabled={!collegeForm.state}
                          options={[
                            ...formCityOptions.map((city) => ({
                              value: city,
                              label: city,
                            })),
                            { value: ADD_NEW_CITY, label: "+ Add a new city" },
                          ]}
                          onChange={(value) => {
                            if (value === ADD_NEW_CITY) {
                              setCityEntryMode(true);
                              updateCollegeField("city", "");
                            } else updateCollegeField("city", value);
                          }}
                          placeholder="Select city"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-3 py-3 text-[10px] text-slate-600">
                    <span className="block font-bold text-slate-500">
                      Location
                    </span>
                    <span className="mt-1 block font-extrabold text-[#172554]">
                      {collegeForm.city}, {collegeForm.state}
                    </span>
                  </div>
                )}
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-600">
                    Address
                  </span>
                  <input
                    value={collegeForm.address}
                    onChange={(event) =>
                      updateCollegeField("address", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-600">
                    Description
                  </span>
                  <textarea
                    rows={2}
                    value={collegeForm.description}
                    onChange={(event) =>
                      updateCollegeField("description", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                  />
                </label>
                {!editingCollege && (
                  <>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-600">
                        First course offered *
                      </span>
                      <select
                        required
                        value={initialOfferingForm.programmeId}
                        onChange={(event) =>
                          setInitialOfferingForm((current) => ({
                            ...current,
                            programmeId: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                      >
                        <option value="">
                          Select one of your permitted courses
                        </option>
                        {(selectedDirectoryInstitution?.matchedProgrammes
                          ?.length
                          ? selectedDirectoryInstitution.matchedProgrammes.map(
                              (item) => ({
                                id: item.programmeId,
                                name: item.programmeName,
                                shortCode: item.shortCode,
                              }),
                            )
                          : programmes
                        ).map((programme) => (
                          <option key={programme.id} value={programme.id}>
                            {programme.name}{" "}
                            {programme.shortCode
                              ? `(${programme.shortCode})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-600">
                        College minimum percentage *
                      </span>
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={initialOfferingForm.minimumPercentage}
                        onChange={(event) =>
                          setInitialOfferingForm((current) => ({
                            ...current,
                            minimumPercentage: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                        placeholder="e.g. 65"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-600">
                        Intake capacity
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={initialOfferingForm.intakeCapacity}
                        onChange={(event) =>
                          setInitialOfferingForm((current) => ({
                            ...current,
                            intakeCapacity: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                        placeholder="Leave blank for unlimited seats"
                      />
                    </label>
                  </>
                )}
                {editingCollege && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={collegeForm.isActive}
                      onChange={(event) =>
                        updateCollegeField("isActive", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />{" "}
                    College is active and can receive applicant preferences
                  </label>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 px-5 py-4">
              <div>
                {registerNewMode && !editingCollege && (
                  <button
                    type="button"
                    onClick={() => setRegisterNewMode(false)}
                    className="rounded-xl px-3 py-2.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-50"
                  >
                    Back to matching colleges
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCollegeModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                {(editingCollege || registerNewMode) && (
                  <button
                    type="submit"
                    disabled={
                      savingCollege ||
                      (!editingCollege &&
                        (!programmes.length ||
                          !collegeForm.city ||
                          !collegeForm.state))
                    }
                    className="rounded-xl bg-[#173b61] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {savingCollege
                      ? "Saving..."
                      : editingCollege
                        ? "Save changes"
                        : "Register college and course"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {offeringModalOpen && selectedCollege && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <form
            onSubmit={saveOffering}
            className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#172554]">
                  {editingOffering
                    ? "Edit programme offering"
                    : "Add programme offering"}
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  {selectedCollege.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOfferingModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {!editingOffering && (
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600">
                    Permitted programme *
                  </span>
                  <select
                    required
                    disabled={programmesLoading || programmes.length === 0}
                    value={offeringForm.programmeId}
                    onChange={(event) =>
                      updateOfferingField("programmeId", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-indigo-400 disabled:bg-slate-50"
                  >
                    <option value="">
                      {programmesLoading
                        ? "Loading permitted programmes..."
                        : programmes.length
                          ? "Select an allowed programme"
                          : "No programmes assigned to this Admin"}
                    </option>
                    {programmes.map((programme) => (
                      <option key={programme.id} value={programme.id}>
                        {programme.name}{" "}
                        {programme.shortCode ? `(${programme.shortCode})` : ""}
                      </option>
                    ))}
                  </select>
                  {!programmesLoading && programmes.length === 0 && (
                    <span className="block text-[10px] text-rose-600">
                      This Admin account has no course permissions. Assign
                      courses in User & Role Management first.
                    </span>
                  )}
                </label>
              )}
              {editingOffering && (
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Programme
                  </p>
                  <p className="mt-1 text-xs font-extrabold text-[#172554]">
                    {editingOffering.programmeName}
                  </p>
                </div>
              )}
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600">
                  College minimum percentage *
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={offeringForm.minimumPercentage}
                  onChange={(event) =>
                    updateOfferingField("minimumPercentage", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                  placeholder="e.g. 70"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600">
                  Intake capacity
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={offeringForm.intakeCapacity}
                  onChange={(event) =>
                    updateOfferingField("intakeCapacity", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-indigo-400"
                  placeholder="Leave blank for unlimited seats"
                />
                <span className="text-[9px] text-slate-400">
                  This capacity is separate from the college's overall programme
                  settings.
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={offeringForm.isActive}
                  onChange={(event) =>
                    updateOfferingField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />{" "}
                This college-programme offering is active
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setOfferingModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingOffering}
                className="rounded-xl bg-[#173b61] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {savingOffering ? "Saving..." : "Save offering"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
