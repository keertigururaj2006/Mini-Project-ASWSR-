import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

const emptyProfile = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phoneCountryCode: "+91",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  qualification: "",
  institution: "",
  programmeId: "",
  programme: "",
};

function dateForInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function getInitials(name) {
  return (
    String(name || "Applicant")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "A"
  );
}

function EditProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const [profileResponse, programmeResponse] = await Promise.all([
        apiRequest("/profile/me"),
        apiRequest("/programmes").catch(() => ({ data: [] })),
      ]);

      const data = profileResponse?.data ?? profileResponse;
      if (!data || !data.id) {
        throw new Error(
          "We couldn't read your profile details. Please try again.",
        );
      }

      const catalogue = Array.isArray(programmeResponse?.data)
        ? programmeResponse.data
        : [];

      setProgrammes(catalogue);
      setProfile({
        ...emptyProfile,
        ...data,
        dateOfBirth: dateForInput(data.dateOfBirth),
        phoneCountryCode: data.phoneCountryCode || "+91",
        programmeId: data.programmeId ? String(data.programmeId) : "",
      });
    } catch (err) {
      setError(err.message || "Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSuccess("");
    setError("");
  }

  const completion = useMemo(() => {
    const fields = [
      profile.fullName,
      profile.dateOfBirth,
      profile.gender,
      profile.email,
      profile.phone,
      profile.address,
      profile.city,
      profile.state,
      profile.postalCode,
      profile.country,
      profile.qualification,
      profile.institution,
      profile.programmeId,
    ];
    const filled = fields.filter((value) => String(value ?? "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const initials = getInitials(profile.fullName);
  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      fullName: profile.fullName.trim(),
      email: profile.email.trim().toLowerCase(),
      phoneCountryCode: profile.phoneCountryCode || "+91",
      phone: profile.phone.trim(),
      dateOfBirth: profile.dateOfBirth || null,
      gender: profile.gender || null,
      address: profile.address.trim() || null,
      city: profile.city.trim() || null,
      state: profile.state.trim() || null,
      postalCode: profile.postalCode.trim() || null,
      country: profile.country.trim() || null,
      qualification: profile.qualification || null,
      institution: profile.institution.trim() || null,
      programmeId: profile.programmeId ? Number(profile.programmeId) : null,
    };

    try {
      await apiRequest("/profile/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // Keep the cached account summary in sync with the saved profile.
      try {
        const storedUser = JSON.parse(
          window.localStorage.getItem("credifit_user") || "{}",
        );
        window.localStorage.setItem(
          "credifit_user",
          JSON.stringify({
            ...storedUser,
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            phoneCountryCode: payload.phoneCountryCode,
          }),
        );
      } catch {
        // The database save is authoritative; a missing local cache is harmless.
      }

      setSuccess("Your profile has been updated successfully.");
      try {
        const refreshed = await apiRequest("/profile/me");
        const refreshedProfile = refreshed?.data ?? refreshed;
        if (refreshedProfile?.id) {
          setProfile({
            ...emptyProfile,
            ...refreshedProfile,
            dateOfBirth: dateForInput(refreshedProfile.dateOfBirth),
            phoneCountryCode: refreshedProfile.phoneCountryCode || "+91",
            programmeId: refreshedProfile.programmeId
              ? String(refreshedProfile.programmeId)
              : "",
          });
        }
      } catch {
        // The PATCH succeeded; keep the edited values visible if refresh fails.
      }
    } catch (err) {
      setError(
        err.message || "We couldn't save your changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/applicant/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173b61] text-sm font-black text-white shadow-sm">
              C
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#173b61]">
              CrediFit<span className="text-blue-500">.</span>
            </span>
          </a>
          <a
            href="/applicant/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#173b61]"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to dashboard</span>
            <span className="sm:hidden">Back</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
              <Sparkles size={13} /> Account settings
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#173b61] sm:text-3xl">
              Your profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep your details up to date for a smoother admission process.
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
            <LockKeyhole size={14} /> Your information is securely stored
          </div>
        </motion.div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={17} className="shrink-0" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <LoaderCircle size={20} className="animate-spin text-blue-600" />
              Loading your profile...
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-20 bg-gradient-to-r from-[#173b61] via-[#245b88] to-blue-500" />
                <div className="px-5 pb-5">
                  <div className="-mt-9 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-4 border-white bg-blue-50 text-xl font-extrabold text-[#173b61] shadow-sm">
                    {initials}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-[#173b61]">
                    {profile.fullName || "Your name"}
                  </h2>
                  <p className="mt-0.5 break-all text-xs text-slate-500">
                    {profile.email || "Add your email address"}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck size={13} /> Applicant account
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        Profile completion
                      </span>
                      <span className="text-xs font-bold tabular-nums text-[#173b61]">
                        {completion}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                      A complete profile helps the admission team review your
                      application more efficiently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#173b61]">
                    Your data, protected
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Only update details that are accurate and current.
                  </p>
                </div>
              </div>
            </aside>

            <form onSubmit={handleSave} className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <UserRound size={19} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#173b61]">
                      Personal details
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      The basics about you
                    </p>
                  </div>
                </div>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="fullName">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={updateField}
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Enter your full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="dateOfBirth">
                      Date of birth
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={updateField}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="gender">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={profile.gender || ""}
                        onChange={updateField}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Phone size={19} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#173b61]">
                      Contact & location
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Where the admission team can reach you
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Email Address */}
                  <div className="min-w-0">
                    <label className={labelClass} htmlFor="email">
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={updateField}
                        required
                        placeholder="you@example.com"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass} htmlFor="phone">
                      Mobile number
                    </label>

                    <div className="flex min-w-0 gap-2">
                      <div className="relative w-[76px] shrink-0">
                        <select
                          name="phoneCountryCode"
                          value={profile.phoneCountryCode}
                          onChange={updateField}
                          aria-label="Country calling code"
                          className={`${inputClass} appearance-none px-2 pr-6 text-center`}
                        >
                          <option value="+91">+91</option>
                          <option value="+971">+971</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                          <option value="+977">+977</option>
                        </select>

                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>

                      {/* Mobile number input */}
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={updateField}
                        maxLength={20}
                        placeholder="Mobile number"
                        className={`${inputClass} min-w-0 flex-1 px-3`}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="address">
                      Residential address
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                      />
                      <input
                        id="address"
                        name="address"
                        value={profile.address}
                        onChange={updateField}
                        maxLength={255}
                        placeholder="House number, street and locality"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={profile.city}
                      onChange={updateField}
                      maxLength={100}
                      placeholder="Your city"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      value={profile.state}
                      onChange={updateField}
                      maxLength={100}
                      placeholder="Your state"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="postalCode">
                      Postal code
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      value={profile.postalCode}
                      onChange={updateField}
                      maxLength={20}
                      placeholder="PIN / ZIP code"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="country">
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      value={profile.country}
                      onChange={updateField}
                      maxLength={100}
                      placeholder="Your country"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#173b61]">
                      Academic details
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Your education and programme preference
                    </p>
                  </div>
                </div>
                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="qualification">
                      Highest qualification
                    </label>
                    <div className="relative">
                      <select
                        id="qualification"
                        name="qualification"
                        value={profile.qualification || ""}
                        onChange={updateField}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        <option value="">Select qualification</option>
                        <option value="10th">10th Standard</option>
                        <option value="12th">12th Standard / PUC</option>
                        <option value="diploma">Diploma</option>
                        <option value="degree">Bachelor's Degree</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="programmeId">
                      Interested programme
                    </label>
                    <div className="relative">
                      <select
                        id="programmeId"
                        name="programmeId"
                        value={profile.programmeId}
                        onChange={updateField}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        <option value="">Select programme</option>
                        {profile.programmeId &&
                          !programmes.some(
                            (item) => String(item.id) === profile.programmeId,
                          ) && (
                            <option value={profile.programmeId}>
                              {profile.programme || "Current programme"}
                            </option>
                          )}
                        {programmes.map((programme) => (
                          <option
                            key={programme.id}
                            value={String(programme.id)}
                          >
                            {programme.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                    {programmes.length === 0 && (
                      <p className="mt-1.5 text-[11px] text-amber-600">
                        Programme catalogue is unavailable right now.
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="institution">
                      Previous institution
                    </label>
                    <input
                      id="institution"
                      name="institution"
                      value={profile.institution}
                      onChange={updateField}
                      maxLength={180}
                      placeholder="School or college name"
                      className={inputClass}
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:px-5">
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <LockKeyhole size={14} /> Changes are saved to your CrediFit
                  account.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173b61] px-6 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#245b88] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default EditProfile;
