import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  Award,
  Check,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  GraduationCap,
  ListChecks,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
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
/*  Palette (from your original page, shifted toward dark indigo)      */
/*  navy #081b35 · indigo #17185f → #2e2a85 · page #f4f7fb             */
/*  cyan-300 accent · white card · indigo-900 button                   */
/* ------------------------------------------------------------------ */

const stages = [
  { name: "Application", note: "Form received", icon: FileText, score: 24 },
  {
    name: "Documents",
    note: "Marksheets verified",
    icon: FileCheck2,
    score: 47,
  },
  {
    name: "Eligibility",
    note: "All rules passed",
    icon: ListChecks,
    score: 69,
  },
  {
    name: "Review",
    note: "Evaluator scored 8.4 / 10",
    icon: ClipboardCheck,
    score: 86,
  },
  { name: "Decision", note: "Admission offered", icon: Award, score: 96 },
];

/* Wavy right edge of the side panel. Same structure for every k,
   so framer-motion can morph between k and -k (the "melting"). */
const wave = (x, k) =>
  `M0,0 L${x},0 C${x + 10 * k},12 ${x - 12 * k},24 ${x},38 C${x + 11 * k},52 ${x - 10 * k},64 ${x},78 C${x + 7 * k},88 ${x - 6 * k},95 ${x},100 L0,100 Z`;

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

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

/* The dark indigo panel whose right edge melts into the page */
function MeltPanel({ reduce }) {
  const layers = [
    { x: 94, k: 1, fill: "#a5b4fc", opacity: 0.35, duration: 14 },
    { x: 90, k: -1, fill: "#6366f1", opacity: 0.4, duration: 11 },
    { x: 86, k: 0.8, fill: "url(#melt-base)", opacity: 1, duration: 9 },
  ];

  const gridMask = "linear-gradient(to right, black 35%, transparent 80%)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 hidden w-[74%] lg:block"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="melt-base" x1="0" y1="0" x2="1" y2="1">
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

function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

function FitRing({ score }) {
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="fit-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="7"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#fit-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums text-white">
          <AnimatedNumber value={score} />
        </span>
        <span className="text-[11px] font-medium text-indigo-200">
          Fit score
        </span>
      </div>
    </div>
  );
}

/* A stack of application files; the top one clears all five stages */
function RegisterCard({ reduce }) {
  const [active, setActive] = useState(reduce ? 2 : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setActive((prev) => (prev + 1) % stages.length),
      2600,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const stage = stages[active];

  return (
    <div className="relative w-full max-w-[440px] pb-8 pt-7">
      <div className="relative">
        {/* Files stacked behind */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.04]"
          style={{ transform: "translateY(-24px) scaleX(0.88)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-3xl border border-white/10 bg-white/[0.07]"
          style={{ transform: "translateY(-12px) scaleX(0.94)" }}
        />

        {/* Top file */}
        <div className="relative rounded-3xl border border-white/15 bg-[#14175a] p-5 shadow-xl shadow-black/25">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                AK
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Aarav K.</p>
                <p className="text-xs text-slate-400">
                  Register entry CF-2026-0481
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-200"
            >
              Stage {active + 1} of {stages.length}
            </Badge>
          </div>

          <Separator className="my-4 bg-white/10" />

          <div className="flex items-center gap-5">
            <FitRing score={stage.score} />

            <ol className="flex-1 space-y-1">
              {stages.map((s, i) => {
                const Icon = s.icon;
                const done = i < active;
                const current = i === active;

                return (
                  <li
                    key={s.name}
                    className={`flex items-center gap-3 rounded-xl px-2.5 py-1.5 transition-colors duration-500 ${
                      current ? "bg-white/10 ring-1 ring-cyan-300/30" : ""
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-500 ${
                        done
                          ? "bg-emerald-400/20 text-emerald-300"
                          : current
                            ? "bg-cyan-300 text-[#081b35]"
                            : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {done ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </span>
                    <span
                      className={`text-xs font-semibold transition-colors duration-500 ${
                        current
                          ? "text-white"
                          : done
                            ? "text-slate-300"
                            : "text-slate-500"
                      }`}
                    >
                      {s.name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-5 flex gap-1.5">
            {stages.map((s, i) => (
              <div
                key={s.name}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-cyan-300"
                  initial={false}
                  animate={{ width: i <= active ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note that changes with each stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 right-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#14175a] shadow-lg shadow-black/20"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={12} strokeWidth={3} />
          </span>
          {stage.note}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-5 w-5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.7-.4-4H24v7.6h11c-.5 2.5-1.9 4.6-4.1 6v5h6.6c3.9-3.6 6.1-8.8 6.1-14.6z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.4 0 9.9-1.8 13.2-4.9l-6.6-5c-1.8 1.2-4 1.9-6.6 1.9-5.1 0-9.4-3.4-10.9-8H6.3v5.2C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#FBBC05"
        d="M13.1 28c-.4-1.2-.7-2.6-.7-4s.3-2.8.7-4v-5.2H6.3C4.8 17.7 4 20.8 4 24s.8 6.3 2.3 9.2l5.3-4.1 1.5-1.1z"
      />
      <path
        fill="#EA4335"
        d="M24 12c2.9 0 5.5 1 7.5 3l5.6-5.6C33.9 6.1 29.4 4 24 4 16.3 4 9.6 8.4 6.3 14.8l6.8 5.2c1.5-4.6 5.8-8 10.9-8z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function LoginPage() {
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const reduce = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  async function handleLogin(e) {
    e.preventDefault();

    setLoginError("");
    setIsLoading(true);

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const { user, accessToken } = result.data;

      localStorage.setItem("credifit_access_token", accessToken);
      localStorage.setItem("credifit_user", JSON.stringify(user));

      const dashboardRoutes = {
        APPLICANT: "/applicant/dashboard",
        ADMISSION_OFFICER: "/admission-officer/dashboard",
        EVALUATOR: "/evaluator/dashboard",
        ADMIN: "/admin/dashboard",
      };

      const destination = dashboardRoutes[user.roleCode];

      if (!destination) {
        throw new Error("Your account has an unsupported role.");
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setLoginError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!googleClientId) {
      setNotice(
        "Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file.",
      );
      return undefined;
    }

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
        callback: async (response) => {
          if (!response?.credential) {
            setLoginError(
              "Google did not return a sign-in credential. Please try again.",
            );
            return;
          }

          setLoginError("");
          setNotice("");
          setIsGoogleLoading(true);
          try {
            const result = await apiRequest("/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential: response.credential, nonce }),
            });
            const { user, accessToken } = result.data;
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
          } catch (error) {
            setLoginError(
              error.message || "Google sign-in failed. Please try again.",
            );
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(360, googleButtonRef.current.clientWidth || 360),
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
          setLoginError(
            "Google sign-in could not be loaded. Check your internet connection.",
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
        setLoginError(
          "Google sign-in could not be loaded. Check your internet connection.",
        );
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (googleButtonRef.current) googleButtonRef.current.innerHTML = "";
    };
  }, [googleClientId, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#081b35] to-[#2e2a85] lg:bg-none lg:bg-[#f4f7fb]">
      {/* Desktop only: dark indigo panel that melts into the page */}
      <MeltPanel reduce={reduce} />

      <div className="relative z-10 flex min-h-screen">
        {/* ------------------- LEFT: desktop showcase ------------------- */}
        <section className="hidden flex-col justify-between px-12 py-10 text-white lg:flex lg:w-[54%] xl:px-16">
          <Brand />

          <div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
              Every application.
              <br />
              Every stage.
              <br />
              <span className="text-cyan-300">Clearer decisions.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-300">
              A structured admission experience that brings applications,
              document verification and evaluation together in one connected
              platform.
            </p>

            <div className="mt-8">
              <RegisterCard reduce={reduce} />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 CrediFit, Admission Management Platform
          </p>
        </section>

        {/* ----------------------- RIGHT: login card ----------------------- */}
        <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[440px]"
          >
            <Card className="gap-0 rounded-[24px] border border-slate-200/80 bg-white py-0 text-slate-900 shadow-[0_25px_60px_-20px_rgba(30,27,75,0.45)]">
              <CardHeader className="space-y-2 px-7 pb-5 pt-8">
                {/* Mobile shows the brand here, desktop shows it in the panel */}
                <div className="mb-3 lg:hidden">
                  <Brand dark />
                </div>
                <div className="mb-2 hidden h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-800 lg:flex">
                  <ShieldCheck size={24} />
                </div>

                <CardTitle className="text-3xl font-extrabold tracking-tight text-indigo-950">
                  Sign in to CrediFit
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                  Enter your account details. Your workspace opens automatically
                  based on your role.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-7 pb-7">
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {loginError}
                    </div>
                  )}
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </Label>
                    <div className="group relative">
                      <Mail
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-700"
                      />
                      <form onSubmit={handleLogin} autoComplete="on">
                        <Input
                          id="login-email"
                          type="email"
                          name="username"
                          autoComplete="username"
                          inputMode="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="h-11 rounded-xl border-slate-200 bg-[#fbfcfe] pl-10 text-sm focus-visible:border-indigo-500 focus-visible:ring-indigo-500/15"
                        />
                      </form>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </Label>
                    <div className="group relative">
                      <Lock
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-700"
                      />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-11 rounded-xl border-slate-200 bg-[#fbfcfe] pl-10 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember + forgot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={(v) => setRemember(v === true)}
                        className="border-slate-300 data-[state=checked]:border-indigo-800 data-[state=checked]:bg-indigo-800 data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor="remember"
                        className="cursor-pointer text-sm font-normal text-slate-600"
                      >
                        Keep me signed in
                      </Label>
                    </div>

                    <a
                      href="/forgot-password"
                      className="rounded text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Primary action */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl bg-indigo-900 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,27,75,0.25)] transition hover:bg-indigo-800 disabled:opacity-80"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                {notice && (
                  <p
                    role="status"
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs leading-5 text-indigo-900"
                  >
                    {notice}
                  </p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <Separator className="w-auto flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400">
                    or continue with
                  </span>
                  <Separator className="w-auto flex-1 bg-slate-200" />
                </div>

                {/* Google */}
                {googleClientId ? (
                  <div
                    className="flex min-h-11 w-full justify-center"
                    aria-label="Continue with Google"
                  >
                    <div ref={googleButtonRef} className="min-h-11 w-full" />
                    {isGoogleLoading && (
                      <span className="sr-only" role="status">
                        Signing in with Google...
                      </span>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-11 w-full gap-3 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-500"
                  >
                    <GoogleIcon />
                    Google sign-in needs configuration
                  </Button>
                )}
              </CardContent>

              <CardFooter className="justify-center border-t border-slate-100 px-7 py-5">
                <p className="text-sm text-slate-500">
                  New applicant?{" "}
                  <a
                    href="/register"
                    className="rounded font-bold text-indigo-700 transition-colors hover:text-indigo-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                  >
                    Create an account
                  </a>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
