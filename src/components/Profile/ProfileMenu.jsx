import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  UserRound,
  Contact,
  GraduationCap,
  ShieldCheck,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Camera,
  Trash2,
  Upload,
  Check,
  LockKeyhole,
  Mail,
  ImagePlus,
  LogOut,
} from "lucide-react";
import { logout } from "../../services/auth";

const sections = [
  { id: "personal", label: "Personal Information", icon: UserRound },
  { id: "contact", label: "Contact Information", icon: Contact },
  { id: "professional", label: "Academic / Professional", icon: GraduationCap },
  { id: "security", label: "Account & Security", icon: LockKeyhole },
  { id: "notifications", label: "Notification Preferences", icon: Bell },
  { id: "privacy", label: "Privacy & Preferences", icon: Settings },
];

const defaults = {
  name: "",
  dob: "",
  phone: "",
  alternatePhone: "",
  address: "",
  city: "",
  avatar: "",
  preferences: {
    email: true,
    dashboard: true,
    application: true,
    digest: false,
    language: "English",
    appearance: "System",
    visibility: "Private",
  },
};

const tones = {
  wine: ["#78364d", "#351b27"],
  teal: ["#17645f", "#123d3b"],
  navy: ["#244b73", "#17324f"],
  indigo: ["#4338ca", "#172554"],
  blue: ["#245b91", "#17324f"],
  neutral: ["#475569", "#1e293b"],
  gold: ["#ffb74d", "#17242B"],
};

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

async function processPhoto(file) {
  if (!file?.type.startsWith("image/")) {
    throw new Error("Please select a valid image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Invalid image file."));
      img.onload = () => {
        const scale = Math.min(1, 512 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing failed."));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function ProfileMenu({
  role = "User",
  userId = "preview-user",
  displayName = "User",
  email = "",
  department = "",
  tone = "neutral",
  roleDetails = {},
  onProfileSave,
}) {
  const [accent, dark] = tones[tone] || tones.neutral;
  const storageKey = `credifit-profile:${role}:${userId}`;

  const [profile, setProfile] = useState({
    ...defaults,
    name: displayName,
  });

  const [draft, setDraft] = useState(profile);
  const [menuOpen, setMenuOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 80,
    right: 12,
  });

  useEffect(() => {
    if (!menuOpen) return;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuHeight = 260;
      const menuWidth = 288;

      let top = rect.bottom + 10;

      if (top + menuHeight > window.innerHeight - 12) {
        top = Math.max(12, (window.innerHeight - menuHeight) / 2);
      }

      const right = Math.max(
        12,
        Math.min(
          window.innerWidth - rect.right,
          window.innerWidth - menuWidth - 12,
        ),
      );

      setMenuPosition({ top, right });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState("personal");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileRef = useRef(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved);
        const loaded = {
          ...defaults,
          ...parsed,
          preferences: {
            ...defaults.preferences,
            ...(parsed.preferences || {}),
          },
        };

        setProfile(loaded);
        setDraft(loaded);
      } else {
        const initial = { ...defaults, name: displayName };
        setProfile(initial);
        setDraft(initial);
      }
    } catch {
      console.error("Unable to load profile.");
    }
  }, [storageKey, displayName]);

  useEffect(() => {
    const closeMenu = (e) => {
      const clickedButton = rootRef.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);

      if (!clickedButton && !clickedMenu) {
        setMenuOpen(false);
      }
    };

    const escape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setModalOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const update = (key, value) => {
    setDraft((old) => ({ ...old, [key]: value }));
  };

  const updatePreference = (key, value) => {
    setDraft((old) => ({
      ...old,
      preferences: { ...old.preferences, [key]: value },
    }));
  };

  const openProfile = (editable) => {
    setDraft({
      ...profile,
      preferences: { ...profile.preferences },
    });
    setEditing(editable);
    setActive("personal");
    setError("");
    setMessage("");
    setMenuOpen(false);
    setModalOpen(true);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      const image = await processPhoto(file);
      update("avatar", image);
      setMessage("Photo preview updated. Save your changes to confirm.");
    } catch (err) {
      setError(err.message);
    }

    e.target.value = "";
  };

  const deletePhoto = () => {
    update("avatar", "");
    setMessage("Photo removed from preview. Save to confirm.");
    setError("");
  };

  const saveProfile = () => {
    const updated = {
      ...draft,
      name: draft.name.trim() || displayName,
      phone: draft.phone.trim(),
      alternatePhone: draft.alternatePhone.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setProfile(updated);
      setDraft(updated);
      onProfileSave?.(updated);
      setEditing(false);
      setError("");
      setMessage("Profile saved successfully on this browser.");
    } catch {
      setError(
        "Unable to save. Try removing the photo or using a smaller image.",
      );
    }
  };

  const Avatar = ({
    size = "h-10 w-10",
    image = profile.avatar,
    name = profile.name,
  }) => (
    <span
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white text-xs font-extrabold text-white shadow-md`}
      style={{ background: `linear-gradient(135deg,${accent},${dark})` }}
    >
      {image ? (
        <img src={image} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );

  const applicant = role.toLowerCase().includes("applicant");
  const professionalDetails = applicant
    ? [
        ["Application ID", roleDetails.applicationId],
        ["Selected programme", roleDetails.programme],
        ["Qualification", roleDetails.qualification],
        ["Institution", roleDetails.institution],
      ]
    : [
        ["Employee / Admin ID", roleDetails.employeeId || roleDetails.staffId],
        ["Designation", roleDetails.designation || role],
        ["Department", roleDetails.department || department],
        ["Institution", roleDetails.institution],
        ...(role.toLowerCase().includes("evaluator")
          ? [["Expertise", roleDetails.expertise]]
          : []),
      ];

  const Toggle = ({ label, description, field }) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div>
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <p className="mt-1 text-[11px] text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={draft.preferences[field]}
        disabled={!editing}
        onClick={() => updatePreference(field, !draft.preferences[field])}
        className="relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60"
        style={{ background: draft.preferences[field] ? accent : "#cbd5e1" }}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            draft.preferences[field] ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      {/* HEADER AVATAR */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100"
        aria-expanded={menuOpen}
      >
        <Avatar />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[130px] truncate text-xs font-bold text-slate-700">
            {profile.name}
          </span>
          <span className="text-[10px] text-slate-400">{role}</span>
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* PROFILE DROPDOWN */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[10000] w-72 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            {" "}
            <div
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: `${accent}12` }}
            >
              <Avatar size="h-12 w-12" />
              <div className="min-w-0">
                <p className="truncate text-xs font-extrabold text-slate-800">
                  {profile.name}
                </p>
                <p className="text-[10px] text-slate-500">{role}</p>
                <p className="truncate text-[10px] text-slate-400">{email}</p>
              </div>
            </div>
            <button
              onClick={() => openProfile(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <UserRound size={16} /> View profile
              <ChevronRight size={13} className="ml-auto" />
            </button>
            <button
              onClick={() => openProfile(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold hover:bg-slate-50"
              style={{ color: accent }}
            >
              <ImagePlus size={16} /> Edit profile & photo
              <ChevronRight size={13} className="ml-auto" />
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>,
          document.body,
        )}
      {/* PROFILE WORKSPACE */}
      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <section className="flex my-auto max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#fffdfa] shadow-2xl">
              {/* MODAL HEADER */}
              <header
                className="flex items-center justify-between gap-4 px-5 py-5 text-white sm:px-7"
                style={{
                  background: `linear-gradient(120deg,${dark},${accent})`,
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size="h-14 w-14"
                    image={draft.avatar}
                    name={draft.name}
                  />
                  <div>
                    <p className="text-[9px] uppercase tracking-[.2em] text-white/60">
                      CrediFit Account
                    </p>
                    <h2 className="text-xl font-extrabold">{draft.name}</h2>
                    <p className="text-xs text-white/70">{role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl bg-white/10 p-2 hover:bg-white/20"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                {/* SECTION NAVIGATION */}
                <aside className="border-b border-slate-200 bg-[#faf7f5] p-3 md:w-64 md:border-b-0 md:border-r">
                  <p className="mb-3 px-2 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    Profile settings
                  </p>
                  <nav className="flex gap-1 overflow-x-auto md:flex-col">
                    {sections.map((item) => {
                      const Icon = item.icon;
                      const selected = active === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActive(item.id)}
                          className="flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-bold transition md:w-full"
                          style={
                            selected
                              ? {
                                  background: "white",
                                  color: accent,
                                  boxShadow: `inset 3px 0 ${accent}`,
                                }
                              : { color: "#64748b" }
                          }
                        >
                          <Icon size={16} />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </aside>

                {/* SECTION CONTENT */}
                <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                  {active === "personal" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          Personal information
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Manage your name, date of birth and profile photo.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5">
                        <Avatar
                          size="h-24 w-24"
                          image={draft.avatar}
                          name={draft.name}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-extrabold text-slate-800">
                            Profile photo
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            JPG, PNG or WEBP · Maximum 5 MB
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              hidden
                              onChange={uploadPhoto}
                            />
                            <button
                              type="button"
                              disabled={!editing}
                              onClick={() => fileRef.current?.click()}
                              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                              style={{ background: accent }}
                            >
                              <Upload size={14} /> Upload / Change
                            </button>

                            <button
                              type="button"
                              disabled={!editing || !draft.avatar}
                              onClick={deletePhoto}
                              className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 disabled:opacity-40"
                            >
                              <Trash2 size={14} /> Delete photo
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Full name"
                          field="name"
                          value={draft.name}
                          editing={editing}
                          onUpdate={update}
                        />
                        <Field
                          label="Date of birth"
                          field="dob"
                          type="date"
                          value={draft.dob}
                          editing={editing}
                          onUpdate={update}
                        />
                      </div>
                    </div>
                  )}

                  {active === "contact" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          Contact information
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Update your contact details.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Registered email"
                          value={email}
                          readOnly={true}
                          editing={false}
                        />
                        <Field
                          label="Mobile number"
                          field="phone"
                          value={draft.phone}
                        />
                        <Field
                          label="Alternate number"
                          field="alternatePhone"
                          value={draft.alternatePhone}
                        />
                        <Field label="City" field="city" value={draft.city} />
                        <div className="sm:col-span-2">
                          <Field
                            label="Address"
                            field="address"
                            value={draft.address}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {active === "professional" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          {applicant
                            ? "Academic details"
                            : "Professional details"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Official institutional details are read-only.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {professionalDetails.map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {label}
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-700">
                              {value || "Not provided"}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                        Contact the institution administrator to correct
                        official academic or employment records.
                      </div>
                    </div>
                  )}

                  {active === "security" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          Account & security
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Review your account identity and security.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Info label="Account role" value={role} />
                        <Info
                          label="Registered email"
                          value={email || "Not provided"}
                        />
                        <Info label="User ID" value={userId} />
                        <Info
                          label="Department"
                          value={
                            department ||
                            roleDetails.department ||
                            "Not provided"
                          }
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                          <LockKeyhole size={22} style={{ color: accent }} />
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Change password
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Password changes will be enabled when the
                              authentication API is connected.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {active === "notifications" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          Notification preferences
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Choose which updates you want to receive.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-5">
                        <Toggle
                          label="Email notifications"
                          description="Important account updates by email."
                          field="email"
                        />
                        <Toggle
                          label="Dashboard notifications"
                          description="Alerts inside your CrediFit dashboard."
                          field="dashboard"
                        />
                        <Toggle
                          label="Application updates"
                          description="Updates when an application changes stage."
                          field="application"
                        />
                        <Toggle
                          label="Weekly digest"
                          description="A weekly summary of relevant activity."
                          field="digest"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Actual email delivery requires backend integration.
                      </p>
                    </div>
                  )}

                  {active === "privacy" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-800">
                          Privacy & preferences
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Set your language, appearance and visibility
                          preferences.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                          label="Language"
                          value={draft.preferences.language}
                          disabled={!editing}
                          onChange={(v) => updatePreference("language", v)}
                          options={["English", "Kannada", "Hindi"]}
                        />
                        <SelectField
                          label="Appearance"
                          value={draft.preferences.appearance}
                          disabled={!editing}
                          onChange={(v) => updatePreference("appearance", v)}
                          options={["System", "Light", "Dark"]}
                        />
                        <div className="sm:col-span-2">
                          <SelectField
                            label="Profile visibility"
                            value={draft.preferences.visibility}
                            disabled={!editing}
                            onChange={(v) => updatePreference("visibility", v)}
                            options={["Private", "Institution only"]}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Application-wide theme and privacy enforcement require
                        backend/app integration.
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="mt-5 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                      {message}
                    </p>
                  )}
                </main>
              </div>

              {/* MODAL FOOTER */}
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
                <p className="text-[10px] text-slate-400">
                  {editing
                    ? "Remember to save your changes."
                    : "Viewing saved profile."}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  {editing ? (
                    <button
                      onClick={saveProfile}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white"
                      style={{ background: accent }}
                    >
                      <Check size={14} /> Save changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-xl px-5 py-2.5 text-xs font-bold text-white"
                      style={{ background: accent }}
                    >
                      Edit profile
                    </button>
                  )}
                </div>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-700">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function SelectField({ label, value, options, disabled, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:bg-slate-50"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  value,
  field,
  type = "text",
  readOnly = false,
  editing = false,
  onUpdate,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        readOnly={readOnly || !editing}
        onChange={(e) => onUpdate(field, e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 read-only:bg-slate-50"
      />
    </label>
  );
}
