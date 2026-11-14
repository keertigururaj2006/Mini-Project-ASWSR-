import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Code,
  Cpu,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  Lock,
  Mail,
  School,
  ScrollText,
  Search,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/*  Same palette as the login page, different composition:             */
/*  panel on the RIGHT, a live admission pass, and a 3-step form.      */
/* ------------------------------------------------------------------ */

const qualifications = [
  { value: "10th", label: "10th Standard", icon: School },
  { value: "12th", label: "12th Standard / PUC", icon: BookOpen },
  { value: "diploma", label: "Diploma", icon: ScrollText },
  { value: "degree", label: "Bachelor's Degree", icon: GraduationCap },
];

const steps = ["Personal", "Academics", "Security"];

const inputCls =
  "h-11 rounded-xl border-slate-200 bg-[#fbfcfe] pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/15";

/* ------------------------------------------------------------------ */
/*  Shared pieces (same as the login page; move to a shared file       */
/*  later if you like)                                                 */
/* ------------------------------------------------------------------ */

const wave = (x, k) =>
  `M0,0 L${x},0 C${x + 10 * k},12 ${x - 12 * k},24 ${x},38 C${x + 11 * k},52 ${x - 10 * k},64 ${x},78 C${x + 7 * k},88 ${x - 6 * k},95 ${x},100 L0,100 Z`;

function Brand({ dark = false }) {
  return (
    <a href="/" className="flex w-fit items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
          dark
            ? "border-indigo-100 bg-indigo-50 text-indigo-800"
            : "border-white/15 bg-white/10 text-cyan-300"
        }`}
      >
        <GraduationCap size={25} />
      </div>
      <div>
        <p
          className={`text-2xl font-extrabold tracking-tight ${
            dark ? "text-indigo-950" : "text-white"
          }`}
        >
          CrediFit<span className="text-cyan-400">.</span>
        </p>
        <p
          className={`text-[11px] font-medium ${
            dark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Admissions portal
        </p>
      </div>
    </a>
  );
}

/* Mirrored version of the login panel: dark side on the right,
   the melting edge faces the form card on the left. */
function MeltPanel({ reduce }) {
  const layers = [
    { x: 94, k: 1, fill: "#a5b4fc", opacity: 0.35, duration: 14 },
    { x: 90, k: -1, fill: "#6366f1", opacity: 0.4, duration: 11 },
    { x: 86, k: 0.8, fill: "url(#reg-melt-base)", opacity: 1, duration: 9 },
  ];

  const gridMask = "linear-gradient(to right, black 35%, transparent 80%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[74%] lg:block"
      style={{ transform: "scaleX(-1)" }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="reg-melt-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#081b35" />
            <stop offset="55%" stopColor="#17185f" />
            <stop offset="100%" stopColor="#2e2a85" />
          </linearGradient>
        </defs>

        {layers.map((l) => (
          <motion.path
            key={l.x}
            d={wave(l.x, l.k)}
            fill={l.fill}
            fillOpacity={l.opacity}
            animate={
              reduce ? undefined : { d: [wave(l.x, l.k), wave(l.x, -l.k)] }
            }
            transition={{
              duration: l.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: gridMask,
          WebkitMaskImage: gridMask,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The memorable part: an admission pass that fills in as you type    */
/* ------------------------------------------------------------------ */

function AdmissionPass({ form, step, checks, programmes }) {
  const name = form.fullName.trim();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const programme = programmes.find(
    (p) => String(p.id) === String(form.programme),
  );
  const qualification = qualifications.find(
    (q) => q.value === form.qualification,
  );
  const ready = checks.every(Boolean);

  // Barcode changes as the name / programme change
  const seed = `${name}${form.programme}`;
  const bars = Array.from({ length: 36 }, (_, i) => {
    if (!seed) return 10 + ((i * 7) % 5);
    return 10 + ((seed.charCodeAt(i % seed.length) * (i + 3)) % 22);
  });

  const rows = ["Personal details", "Academic details", "Account security"];

  return (
    <div
      className="w-full max-w-[400px]"
      style={{ transform: "rotate(-2deg)" }}
    >
      <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30">
        {/* Header band */}
        <div className="flex items-center justify-between bg-indigo-900 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-cyan-300" />
            <span className="text-sm font-extrabold">
              CrediFit admission pass
            </span>
          </div>
          <Badge
            variant="outline"
            className={`px-2.5 py-0.5 text-xs font-semibold transition-colors ${
              ready
                ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-200"
                : "border-white/20 bg-white/10 text-indigo-100"
            }`}
          >
            {ready ? "Ready" : "Draft"}
          </Badge>
        </div>

        {/* Holder */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-800">
              {initials || <UserRound size={22} />}
            </div>
            <div className="min-w-0">
              <p
                className={`truncate text-lg font-extrabold ${
                  name ? "text-indigo-950" : "text-slate-300"
                }`}
              >
                {name || "Your name"}
              </p>
              <p className="text-xs text-slate-500">Applicant</p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <dt className="text-[11px] font-medium text-slate-400">
                Programme
              </dt>
              <dd
                className={`truncate text-sm font-bold ${
                  programme ? "text-indigo-950" : "text-slate-300"
                }`}
              >
                {programme
                  ? programme.short || programme.code || programme.name
                  : "Not chosen yet"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[11px] font-medium text-slate-400">
                Qualification
              </dt>
              <dd
                className={`truncate text-sm font-bold ${
                  qualification ? "text-indigo-950" : "text-slate-300"
                }`}
              >
                {qualification ? qualification.label : "Not chosen yet"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="my-4 border-t-2 border-dashed border-slate-200" />

        {/* Checklist + barcode */}
        <div className="px-5 pb-5">
          <ul className="space-y-1.5">
            {rows.map((label, i) => {
              const ok = checks[i];
              const current = i === step;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-300 ${
                    current ? "bg-indigo-50 ring-1 ring-indigo-100" : ""
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-300 ${
                      ok
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      ok || current ? "text-indigo-950" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            aria-hidden
            className={`mt-4 flex h-8 items-end justify-between transition-opacity duration-500 ${
              seed ? "opacity-90" : "opacity-30"
            }`}
          >
            {bars.map((h, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-indigo-950"
                initial={false}
                animate={{ height: h }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form pieces                                                        */
/* ------------------------------------------------------------------ */

function Field({ id, label, icon: Icon, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </Label>
      <div className="group relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-700"
        />
        {children}
      </div>
    </div>
  );
}

function PasswordToggle({ shown, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
    >
      {shown ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );
}

function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 gap-2.5"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const active = value === option.value;

          return (
            <button
              type="button"
              role="radio"
              aria-checked={active}
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                active
                  ? "border-indigo-700 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-indigo-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0 text-sm font-bold leading-tight text-indigo-950">
                {option.label}
              </span>
              {active && (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-900 text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stepper({ step, onJump }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Registration steps">
      {steps.map((label, i) => {
        const active = i === step;
        const done = i < step;

        return (
          <li
            key={label}
            className="flex flex-1 items-center gap-2 last:flex-none"
          >
            <button
              type="button"
              disabled={i >= step}
              onClick={() => onJump(i)}
              aria-current={active ? "step" : undefined}
              className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-indigo-900 text-white"
                    : active
                      ? "bg-indigo-900 text-white ring-4 ring-indigo-100"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-xs font-semibold ${
                  active || done ? "text-indigo-950" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 transition-colors ${
                  done ? "bg-indigo-700" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function RegisterPage() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const reduce = useReducedMotion();
  const today = new Date().toISOString().slice(0, 10);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    email: "",
    phone: "",
    qualification: "",
    programme: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [done, setDone] = useState(false);
  const [catalogueProgrammes, setCatalogueProgrammes] = useState([]);
  const [programmeLoadError, setProgrammeLoadError] = useState("");
  const [programmeSearch, setProgrammeSearch] = useState("");
  const [activeProgrammeType, setActiveProgrammeType] = useState("");
  const [showProgrammeSearchResults, setShowProgrammeSearchResults] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgrammes() {
      try {
        const response = await apiRequest("/programmes");

        if (!cancelled) {
          setCatalogueProgrammes(
            Array.isArray(response.data) ? response.data : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setProgrammeLoadError(
            error.message || "Unable to load active programmes.",
          );
        }
      }
    }

    loadProgrammes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Google registration uses the same verified backend session flow as LoginPage.
  // New Google users are created as Applicants by POST /api/v1/auth/google.
  useEffect(() => {
    if (!googleClientId) {
      setNotice(
        "Google registration is not configured yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file.",
      );
      return undefined;
    }
    if (step !== 0) return undefined;

    let cancelled = false;
    let script = document.querySelector('script[data-credifit-google="true"]');

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current)
        return;

      const nonceBytes = new Uint8Array(32);
      window.crypto.getRandomValues(nonceBytes);
      const nonce = Array.from(nonceBytes, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        nonce,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: async (response) => {
          if (!response?.credential) {
            setError(
              "Google did not return a sign-in credential. Please try again.",
            );
            return;
          }

          setError("");
          setNotice("");
          setIsGoogleLoading(true);
          try {
            const result = await apiRequest("/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential: response.credential, nonce }),
            });
            const { user, accessToken } = result.data || {};
            if (!user || !accessToken) {
              throw new Error(
                "Google registration returned an invalid response.",
              );
            }

            localStorage.setItem("credifit_access_token", accessToken);
            localStorage.setItem("credifit_user", JSON.stringify(user));

            const dashboardRoutes = {
              APPLICANT: "/applicant/dashboard",
              ADMISSION_OFFICER: "/admission-officer/dashboard",
              EVALUATOR: "/evaluator/dashboard",
              ADMIN: "/admin/dashboard",
            };
            const destination = dashboardRoutes[user.roleCode];
            if (!destination)
              throw new Error("Your account has an unsupported role.");
            navigate(destination, { replace: true });
          } catch (googleError) {
            setError(
              googleError.message ||
                "Google registration failed. Please try again.",
            );
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signup_with",
        width: Math.min(420, googleButtonRef.current.clientWidth || 420),
        logo_alignment: "left",
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (script) {
      script.addEventListener("load", initializeGoogle, { once: true });
      script.addEventListener(
        "error",
        () =>
          setError(
            "Google registration could not be loaded. Check your internet connection.",
          ),
        { once: true },
      );
    } else {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.credifitGoogle = "true";
      script.onload = initializeGoogle;
      script.onerror = () =>
        setError(
          "Google registration could not be loaded. Check your internet connection.",
        );
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (googleButtonRef.current) googleButtonRef.current.innerHTML = "";
    };
  }, [googleClientId, navigate, step]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function goTo(next) {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setError("");
    setNotice("");
  }

  // Live progress, drives the admission pass
  const checks = [
    form.fullName.trim().length > 1 &&
      Boolean(form.dob) &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.phone.length === 10,
    Boolean(form.qualification && form.programme),
    form.password.length >= 8 && form.password === form.confirm && form.agree,
  ];

  // Password strength
  const strength = [
    form.password.length >= 8,
    /[A-Z]/.test(form.password),
    /\d/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-rose-400",
    "bg-amber-400",
    "bg-sky-500",
    "bg-emerald-500",
  ][strength];

  const dist = reduce ? 0 : 24;
  const slide = {
    enter: (d) => ({ opacity: 0, x: d * dist }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -dist }),
  };

  // Programme groups are based on the catalogue's level field.
  // These are the four levels configured in the CrediFit programme catalogue.
  const programmeTypes = [
    {
      value: "Undergraduate",
      label: "Undergraduate",
      icon: GraduationCap,
    },
    {
      value: "Postgraduate",
      label: "Postgraduate",
      icon: BookOpen,
    },
    {
      value: "Diploma",
      label: "Diploma",
      icon: School,
    },
    {
      value: "Certificate",
      label: "Certificate",
      icon: ScrollText,
    },
  ].map((type) => ({
    ...type,
    count: catalogueProgrammes.filter(
      (item) =>
        String(item.level || "").toLowerCase() === type.value.toLowerCase(),
    ).length,
  }));

  const programmeSearchResults = catalogueProgrammes
    .filter((item) => {
      const query = programmeSearch.trim().toLowerCase();

      if (!query) return false;

      return [
        item.name,
        item.code,
        item.short,
        item.category,
        item.level,
        item.department,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .slice(0, 8);

  const programmesInSelectedType = catalogueProgrammes.filter(
    (item) =>
      String(item.level || "").toLowerCase() ===
      String(activeProgrammeType).toLowerCase(),
  );

  const selectedProgrammeRecord = catalogueProgrammes.find(
    (item) => String(item.id) === String(form.programme),
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (step === 0) {
      goTo(1);
      return;
    }

    if (step === 1) {
      if (!form.qualification || !form.programme) {
        setError("Choose your qualification and programme to continue.");
        return;
      }

      goTo(2);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match. Check both fields and try again.");
      return;
    }

    if (!form.agree) {
      setError("Accept the terms to create your account.");
      return;
    }
    const selectedProgramme = catalogueProgrammes.find(
      (item) => String(item.id) === String(form.programme),
    );

    if (!selectedProgramme) {
      setError("Please select an active programme from the catalogue.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          dateOfBirth: form.dob,
          email: form.email.trim().toLowerCase(),
          phoneCountryCode: "+91",
          phone: form.phone.trim(),
          qualification: form.qualification,
          programme: selectedProgramme.name,
          programmeId: Number(selectedProgramme.id),
          password: form.password,
        }),
      });

      const { user, accessToken } = result.data;

      if (!user || !accessToken || user.roleCode !== "APPLICANT") {
        throw new Error("Account registration returned an invalid response.");
      }

      localStorage.setItem("credifit_access_token", accessToken);
      localStorage.setItem("credifit_user", JSON.stringify(user));

      setDone(true);
    } catch (error) {
      setError(error.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#081b35] to-[#2e2a85] lg:bg-none lg:bg-[#f4f7fb]">
      {/* Desktop only: dark indigo panel on the right, melting toward the form */}
      <MeltPanel reduce={reduce} />

      <div className="relative z-10 flex min-h-screen">
        {/* ----------------------- LEFT: form card ----------------------- */}
        <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:w-[46%] lg:flex-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[520px]"
          >
            <Card className="gap-0 rounded-[24px] border border-slate-200/80 bg-white py-0 text-slate-900 shadow-[0_25px_60px_-20px_rgba(30,27,75,0.45)]">
              <CardHeader className="space-y-2 px-7 pb-4 pt-7">
                {/* Mobile shows the brand here, desktop shows it in the panel */}
                <div className="mb-2 lg:hidden">
                  <Brand dark />
                </div>

                <CardTitle className="text-3xl font-extrabold tracking-tight text-indigo-950">
                  Create your account
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                  Three short steps to start your admission journey.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-7 pb-6">
                {done ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 py-6 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CircleCheck size={30} />
                    </div>
                    <h3 className="text-xl font-extrabold text-indigo-950">
                      Account created
                    </h3>
                    <p className="text-sm leading-6 text-slate-500">
                      Your applicant account has been successfully created. Your
                      admission journey starts here.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/applicant/dashboard", { replace: true })
                      }
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-900 px-6 text-sm font-bold text-white transition hover:bg-indigo-800"
                    >
                      Continue to applicant portal
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <Stepper step={step} onJump={goTo} />

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <AnimatePresence mode="wait" initial={false} custom={dir}>
                        <motion.div
                          key={step}
                          custom={dir}
                          variants={slide}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="space-y-4"
                        >
                          {/* ---------- Step 1: personal ---------- */}
                          {step === 0 && (
                            <>
                              <Field
                                id="reg-name"
                                label="Full name"
                                icon={UserRound}
                              >
                                <Input
                                  id="reg-name"
                                  name="fullName"
                                  autoComplete="name"
                                  required
                                  value={form.fullName}
                                  onChange={(e) =>
                                    update("fullName", e.target.value)
                                  }
                                  placeholder="As on your marksheet"
                                  className={inputCls}
                                />
                              </Field>

                              <Field
                                id="reg-dob"
                                label="Date of birth"
                                icon={CalendarDays}
                              >
                                <Input
                                  id="reg-dob"
                                  type="date"
                                  name="dateOfBirth"
                                  autoComplete="bday"
                                  required
                                  max={today}
                                  value={form.dob}
                                  onChange={(e) =>
                                    update("dob", e.target.value)
                                  }
                                  className={`${inputCls} cursor-pointer`}
                                />
                              </Field>

                              <Field
                                id="reg-email"
                                label="Email address"
                                icon={Mail}
                              >
                                <Input
                                  id="reg-email"
                                  type="email"
                                  name="email"
                                  autoComplete="email"
                                  required
                                  value={form.email}
                                  onChange={(e) =>
                                    update("email", e.target.value)
                                  }
                                  placeholder="you@example.com"
                                  className={inputCls}
                                />
                              </Field>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="reg-phone"
                                  className="text-sm font-semibold text-slate-700"
                                >
                                  Phone number
                                </Label>
                                <div className="flex h-11 w-full overflow-hidden rounded-xl border border-slate-200 bg-[#fbfcfe] transition-colors focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                                  <span
                                    aria-label="India country calling code +91"
                                    className="flex h-full shrink-0 items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700"
                                  >
                                    +91
                                  </span>
                                  <Input
                                    id="reg-phone"
                                    type="tel"
                                    name="phone"
                                    autoComplete="tel-national"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    minLength={10}
                                    maxLength={10}
                                    title="Enter a 10-digit Indian mobile number"
                                    required
                                    value={form.phone}
                                    onChange={(e) =>
                                      update(
                                        "phone",
                                        e.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 10),
                                      )
                                    }
                                    placeholder="10-digit mobile number"
                                    className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* ---------- Step 2: academics ---------- */}

                          {step === 1 && (
                            <>
                              <ChoiceGroup
                                label="Highest qualification"
                                options={qualifications}
                                value={form.qualification}
                                onChange={(v) => update("qualification", v)}
                              />

                              {/* Programme selector */}
                              <div className="space-y-4 pt-2">
                                <div>
                                  <p className="text-sm font-bold text-indigo-950">
                                    Programme you are applying for
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Search for your programme or browse by
                                    programme type.
                                  </p>
                                </div>

                                {/* Search bar with dropdown */}
                                <div
                                  className="relative"
                                  onBlur={(event) => {
                                    if (
                                      !event.currentTarget.contains(
                                        event.relatedTarget,
                                      )
                                    ) {
                                      setShowProgrammeSearchResults(false);
                                    }
                                  }}
                                >
                                  <Search
                                    size={17}
                                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-indigo-500"
                                  />

                                  <Input
                                    type="search"
                                    value={programmeSearch}
                                    onChange={(event) => {
                                      setProgrammeSearch(event.target.value);
                                      update("programme", "");
                                      setShowProgrammeSearchResults(
                                        Boolean(event.target.value.trim()),
                                      );
                                    }}
                                    onFocus={() => {
                                      if (programmeSearch.trim()) {
                                        setShowProgrammeSearchResults(true);
                                      }
                                    }}
                                    onKeyDown={(event) => {
                                      if (event.key === "Escape") {
                                        setShowProgrammeSearchResults(false);
                                      }
                                    }}
                                    placeholder="Search programme name, code..."
                                    autoComplete="off"
                                    className="h-12 rounded-xl border-indigo-100 bg-[#fbfcfe] pl-10 pr-4 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                                  />

                                  {showProgrammeSearchResults &&
                                    programmeSearch.trim() && (
                                      <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-xl shadow-indigo-950/10">
                                        <div className="border-b border-indigo-50 bg-indigo-50/70 px-4 py-2.5">
                                          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-indigo-700">
                                            Search results
                                          </p>
                                        </div>

                                        <div className="max-h-56 overflow-y-auto p-1.5">
                                          {programmeSearchResults.length > 0 ? (
                                            programmeSearchResults.map(
                                              (item) => (
                                                <button
                                                  key={item.id}
                                                  type="button"
                                                  onMouseDown={(event) =>
                                                    event.preventDefault()
                                                  }
                                                  onClick={() => {
                                                    update(
                                                      "programme",
                                                      String(item.id),
                                                    );
                                                    setActiveProgrammeType(
                                                      item.level || "",
                                                    );
                                                    setProgrammeSearch(
                                                      item.name,
                                                    );
                                                    setShowProgrammeSearchResults(
                                                      false,
                                                    );
                                                  }}
                                                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-indigo-50"
                                                >
                                                  <div className="min-w-0">
                                                    <p className="truncate text-xs font-bold text-indigo-950">
                                                      {item.name}
                                                    </p>
                                                    <p className="mt-1 text-[10px] text-slate-500">
                                                      {item.code} · {item.level}{" "}
                                                      · {item.category}
                                                    </p>
                                                  </div>

                                                  <Check
                                                    size={16}
                                                    className="shrink-0 text-indigo-600"
                                                  />
                                                </button>
                                              ),
                                            )
                                          ) : (
                                            <p className="px-3 py-6 text-center text-xs text-slate-400">
                                              No matching programmes found.
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Four programme types in 2 × 2 grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  {programmeTypes.map((type) => {
                                    const Icon = type.icon;
                                    const active =
                                      activeProgrammeType === type.value;

                                    return (
                                      <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                          setActiveProgrammeType(type.value);
                                          update("programme", "");
                                          setProgrammeSearch("");
                                          setShowProgrammeSearchResults(false);
                                        }}
                                        className={`group relative min-h-[112px] overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                                          active
                                            ? "border-indigo-700 bg-indigo-50 shadow-md shadow-indigo-950/5 ring-2 ring-indigo-100"
                                            : "border-slate-200 bg-[#fbfcfe] hover:border-indigo-300 hover:bg-indigo-50/50"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                                              active
                                                ? "bg-indigo-900 text-white"
                                                : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200"
                                            }`}
                                          >
                                            <Icon size={18} />
                                          </span>

                                          {active ? (
                                            <CircleCheck
                                              size={17}
                                              className="text-indigo-700"
                                            />
                                          ) : (
                                            <ChevronDown
                                              size={16}
                                              className="text-slate-400 transition-transform group-hover:translate-y-0.5"
                                            />
                                          )}
                                        </div>

                                        <p className="mt-3 text-xs font-extrabold leading-5 text-indigo-950">
                                          {type.label}
                                        </p>

                                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                                          {type.count} programmes available
                                        </p>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Horizontal programme scrolling */}
                                <AnimatePresence mode="wait">
                                  {activeProgrammeType && (
                                    <motion.div
                                      key={activeProgrammeType}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      transition={{ duration: 0.2 }}
                                      className="space-y-3"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div>
                                          <p className="text-sm font-extrabold text-indigo-950">
                                            {activeProgrammeType}
                                          </p>
                                          <p className="mt-1 text-[10px] text-slate-400">
                                            Scroll sideways to explore
                                            programmes.
                                          </p>
                                        </div>

                                        <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                                          {programmesInSelectedType.length}{" "}
                                          available
                                        </span>
                                      </div>

                                      {programmesInSelectedType.length > 0 ? (
                                        <div className="-mx-1 overflow-x-auto px-1 pb-3 snap-x snap-mandatory [scrollbar-color:#a5b4fc_transparent] [scrollbar-width:thin]">
                                          <div className="flex w-max gap-3">
                                            {programmesInSelectedType.map(
                                              (item) => {
                                                const selected =
                                                  String(form.programme) ===
                                                  String(item.id);

                                                return (
                                                  <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                      update(
                                                        "programme",
                                                        String(item.id),
                                                      );
                                                      setProgrammeSearch(
                                                        item.name,
                                                      );
                                                      setShowProgrammeSearchResults(
                                                        false,
                                                      );
                                                    }}
                                                    className={`flex w-[190px] shrink-0 snap-start flex-col rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                                                      selected
                                                        ? "border-indigo-700 bg-indigo-50 shadow-sm ring-2 ring-indigo-100"
                                                        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
                                                    }`}
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <span
                                                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                                          selected
                                                            ? "bg-indigo-900 text-white"
                                                            : "bg-slate-100 text-indigo-700"
                                                        }`}
                                                      >
                                                        <GraduationCap
                                                          size={18}
                                                        />
                                                      </span>

                                                      {selected && (
                                                        <Check
                                                          size={16}
                                                          className="text-indigo-700"
                                                        />
                                                      )}
                                                    </div>

                                                    <p className="mt-3 min-h-10 text-xs font-extrabold leading-5 text-indigo-950">
                                                      {item.name}
                                                    </p>

                                                    <p className="mt-1 text-[10px] font-semibold text-indigo-600">
                                                      {item.short || item.code}
                                                    </p>

                                                    <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-400">
                                                      {item.department ||
                                                        "Available programme"}
                                                    </p>
                                                  </button>
                                                );
                                              },
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-[#fbfcfe] px-4 py-7 text-center">
                                          <p className="text-xs font-semibold text-slate-500">
                                            No programmes available in this
                                            category.
                                          </p>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Selected programme confirmation */}
                                {selectedProgrammeRecord && (
                                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                                    <CircleCheck
                                      size={19}
                                      className="mt-0.5 shrink-0 text-emerald-600"
                                    />

                                    <div className="min-w-0">
                                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                                        Selected programme
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-emerald-950">
                                        {selectedProgrammeRecord.name}
                                      </p>

                                      <p className="mt-1 text-[10px] text-emerald-700">
                                        {selectedProgrammeRecord.code} ·{" "}
                                        {selectedProgrammeRecord.level}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Loading / error message */}
                                {catalogueProgrammes.length === 0 && (
                                  <p className="text-xs text-rose-500">
                                    {programmeLoadError ||
                                      "Loading available programmes..."}
                                  </p>
                                )}
                              </div>
                            </>
                          )}

                          {/* ---------- Step 3: security ---------- */}
                          {step === 2 && (
                            <>
                              <div className="space-y-2">
                                <Field
                                  id="reg-password"
                                  label="Create password"
                                  icon={Lock}
                                >
                                  <Input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    value={form.password}
                                    onChange={(e) =>
                                      update("password", e.target.value)
                                    }
                                    placeholder="At least 8 characters"
                                    className={`${inputCls} pr-11`}
                                  />
                                  <PasswordToggle
                                    shown={showPassword}
                                    onToggle={() => setShowPassword((v) => !v)}
                                    label="password"
                                  />
                                </Field>

                                {form.password && (
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-1 gap-1.5">
                                      {[1, 2, 3, 4].map((n) => (
                                        <span
                                          key={n}
                                          className={`h-1 flex-1 rounded-full transition-colors ${
                                            n <= strength
                                              ? strengthColor
                                              : "bg-slate-200"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="w-12 text-right text-xs font-semibold text-slate-500">
                                      {strengthLabel}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Field
                                  id="reg-confirm"
                                  label="Confirm password"
                                  icon={Lock}
                                >
                                  <Input
                                    id="reg-confirm"
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    value={form.confirm}
                                    onChange={(e) =>
                                      update("confirm", e.target.value)
                                    }
                                    placeholder="Re-enter your password"
                                    className={`${inputCls} pr-11`}
                                  />
                                  <PasswordToggle
                                    shown={showConfirm}
                                    onToggle={() => setShowConfirm((v) => !v)}
                                    label="confirmation password"
                                  />
                                </Field>

                                {form.confirm && (
                                  <p
                                    className={`text-xs font-medium ${
                                      form.confirm === form.password
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                    }`}
                                  >
                                    {form.confirm === form.password
                                      ? "Passwords match"
                                      : "Passwords do not match yet"}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id="reg-agree"
                                  checked={form.agree}
                                  onCheckedChange={(v) =>
                                    update("agree", v === true)
                                  }
                                  className="mt-0.5 border-slate-300 data-[state=checked]:border-indigo-800 data-[state=checked]:bg-indigo-800 data-[state=checked]:text-white"
                                />
                                <Label
                                  htmlFor="reg-agree"
                                  className="cursor-pointer text-xs font-normal leading-5 text-slate-600"
                                >
                                  I confirm that my information is accurate and
                                  agree to the CrediFit terms and conditions.
                                </Label>
                              </div>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {error && (
                        <p
                          role="alert"
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800"
                        >
                          {error}
                        </p>
                      )}

                      {notice && (
                        <p
                          role="status"
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-900"
                        >
                          {notice}
                        </p>
                      )}

                      <div className="flex gap-3">
                        {step > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => goTo(step - 1)}
                            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <ArrowLeft size={16} />
                            Back
                          </Button>
                        )}

                        <Button
                          type="submit"
                          disabled={loading}
                          className="h-11 flex-1 rounded-xl bg-indigo-900 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,27,75,0.25)] transition hover:bg-indigo-800 disabled:opacity-80"
                        >
                          {loading ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                              Creating account…
                            </>
                          ) : step < 2 ? (
                            "Continue"
                          ) : (
                            "Create account"
                          )}
                        </Button>
                      </div>
                    </form>

                    {step === 0 && (
                      <>
                        <div className="flex items-center gap-3">
                          <Separator className="w-auto flex-1 bg-slate-200" />
                          <span className="text-xs font-medium text-slate-400">
                            or
                          </span>
                          <Separator className="w-auto flex-1 bg-slate-200" />
                        </div>

                        {googleClientId ? (
                          <div className="space-y-2">
                            <div
                              ref={googleButtonRef}
                              className="flex min-h-11 w-full justify-center [&>div]:max-w-full"
                              aria-label="Register with Google"
                            />
                            {isGoogleLoading && (
                              <p
                                className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-700"
                                role="status"
                              >
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                                Connecting your Google account...
                              </p>
                            )}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-500"
                          >
                            Google registration unavailable
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>

              <CardFooter className="justify-center border-t border-slate-100 px-7 py-5">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="rounded font-bold text-indigo-700 transition-colors hover:text-indigo-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                  >
                    Sign in
                  </a>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </section>

        {/* -------------------- RIGHT: desktop showcase -------------------- */}
        <section className="hidden flex-col justify-between px-12 py-10 text-white lg:flex lg:w-[54%] xl:px-16">
          <Brand />

          <div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
              Your future.
              <br />
              Your application.
              <br />
              <span className="text-cyan-300">Your journey.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-300">
              Create your CrediFit account and follow your admission through a
              clear, structured screening process.
            </p>

            <div className="mt-8">
              <AdmissionPass
                form={form}
                step={step}
                checks={checks}
                programmes={catalogueProgrammes}
              />{" "}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 CrediFit, Admission Management Platform
          </p>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
