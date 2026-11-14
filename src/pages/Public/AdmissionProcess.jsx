import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRoundPlus,
  WalletCards,
  AlertCircle,
  Info,
  Landmark,
  ListChecks,
} from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Application Submission",
    subtitle: "Start with your application",
    description:
      "Create your applicant account, complete your personal and academic profile, choose an available programme, and submit the application with the required information and documents.",
    owner: "Applicant",
    icon: UserRoundPlus,
    accent: "blue",
    actions: [
      "Create an applicant account and complete your profile",
      "Enter personal, contact and academic details",
      "Select an available programme and submit the application",
    ],
    handoff: "The submitted application enters the admission office queue.",
  },
  {
    number: "02",
    title: "Document Verification",
    subtitle: "Make sure your records are complete",
    description:
      "An Admission Officer checks whether the submitted documents are present, readable and consistent with the details in your application.",
    owner: "Admission Officer",
    icon: FileCheck2,
    accent: "cyan",
    actions: [
      "Check document presence, readability and completeness",
      "Compare names, dates and academic details",
      "Request a correction or replacement when something needs attention",
    ],
    handoff:
      "Any resubmission request must include a clear reason for the applicant.",
  },
  {
    number: "03",
    title: "Eligibility Screening",
    subtitle: "Check programme-specific requirements",
    description:
      "The system evaluates the applicant's academic information against the eligibility rules configured for the selected programme by an authorized Administrator.",
    owner: "Rule engine + Admission Officer",
    icon: ShieldCheck,
    accent: "violet",
    actions: [
      "Evaluate academic details against active programme rules",
      "Display an understandable eligibility outcome",
      "Allow the officer to review the result and record separate remarks",
    ],
    handoff:
      "Admission Officers can review outcomes, but cannot change institution-wide eligibility rules.",
  },
  {
    number: "04",
    title: "Department Review",
    subtitle: "Assigned academic evaluation",
    description:
      "The application is routed to the relevant assigned Evaluator for department-level review, where applicable. The evaluator records an assessment and recommendation.",
    owner: "Assigned Evaluator",
    icon: GraduationCap,
    accent: "emerald",
    actions: [
      "Review applications assigned to the evaluator",
      "Assess the application using the configured review criteria",
      "Record assessment remarks and a recommendation",
    ],
    handoff:
      "Evaluators review assigned cases; the final admission decision remains with the authorized Administrator.",
  },
  {
    number: "05",
    title: "Final Admission Decision",
    subtitle: "The institution records the outcome",
    description:
      "After the required screening and department review stages are complete, an authorized Administrator records the final admission decision and the applicant is notified.",
    owner: "Authorized Administrator",
    icon: BellRing,
    accent: "amber",
    actions: [
      "Review the completed screening and department records",
      "Record the authorized final admission outcome",
      "Make the decision status available to the applicant",
    ],
    handoff:
      "The decision, responsible user and relevant timestamp are retained for traceability.",
  },
];

const requiredDocuments = [
  "10th marks card",
  "12th / PUC marks card",
  "Leaving certificate",
];

const roleResponsibilities = [
  {
    role: "Applicant",
    description:
      "Submits the application, provides documents and tracks progress.",
    icon: UserRoundPlus,
    color: "bg-blue-50 text-blue-700",
  },
  {
    role: "Admission Officer",
    description:
      "Verifies documents, reviews eligibility information and handles authorized workflow tasks.",
    icon: ClipboardCheck,
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    role: "Evaluator",
    description:
      "Reviews assigned applications and records assessment remarks or recommendations.",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    role: "Administrator",
    description:
      "Manages programmes and eligibility rules, and records authorized final decisions.",
    icon: LockKeyhole,
    color: "bg-violet-50 text-violet-700",
  },
];

const accentStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-700",
    number: "text-blue-600",
    marker: "bg-blue-600",
    border: "group-hover:border-blue-200",
    wash: "from-blue-50/90",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-700",
    number: "text-cyan-700",
    marker: "bg-cyan-600",
    border: "group-hover:border-cyan-200",
    wash: "from-cyan-50/90",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700",
    number: "text-violet-700",
    marker: "bg-violet-600",
    border: "group-hover:border-violet-200",
    wash: "from-violet-50/90",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    number: "text-emerald-700",
    marker: "bg-emerald-600",
    border: "group-hover:border-emerald-200",
    wash: "from-emerald-50/90",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    number: "text-amber-700",
    marker: "bg-amber-500",
    border: "group-hover:border-amber-200",
    wash: "from-amber-50/90",
  },
};

function StageCard({ stage, index }) {
  const Icon = stage.icon;
  const style = accentStyles[stage.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className={`group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,35,65,0.09)] ${style.border}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${style.wash} to-transparent opacity-70`}
      />
      <div className="relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${style.icon}`}
          >
            <Icon size={26} strokeWidth={1.8} />
          </div>
          <span
            className={`text-[34px] font-black leading-none tracking-tight ${style.number} opacity-20`}
          >
            {stage.number}
          </span>
        </div>

        <p
          className={`mt-6 text-[10px] font-extrabold uppercase tracking-[0.17em] ${style.number}`}
        >
          {stage.subtitle}
        </p>
        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[#142f4e] sm:text-[22px]">
          {stage.title}
        </h3>
        <p className="mt-3 text-[13px] leading-6 text-slate-500">
          {stage.description}
        </p>

        <div className="mt-6 rounded-2xl bg-[#f8fafc] p-4">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            <ListChecks size={14} /> What happens here
          </p>
          <ul className="space-y-2.5">
            {stage.actions.map((action) => (
              <li
                key={action}
                className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
              >
                <CheckCircle2
                  size={15}
                  className={`mt-0.5 shrink-0 ${style.number}`}
                />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Responsible role
            </p>
            <p className="mt-1 text-xs font-bold text-[#173b61]">
              {stage.owner}
            </p>
          </div>
          <div
            className={`flex max-w-[230px] items-start gap-2 rounded-xl px-3 py-2 text-[10px] font-medium leading-4 ${style.icon}`}
          >
            <ArrowRight size={13} className="mt-0.5 shrink-0" />
            <span>{stage.handoff}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function AdmissionProcess() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f8fc] text-slate-800">
      {/* Navigation */}
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
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Programmes
            </Link>
            <Link
              to="/admission-process"
              className="relative text-sm font-bold text-[#173b61]"
            >
              Admission process
              <span className="absolute -bottom-[27px] left-0 h-[3px] w-full rounded-full bg-blue-600" />
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
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
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Workflow details */}
      <main className="mx-auto max-w-[1380px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <section id="workflow" className="scroll-mt-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"
          >
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <span className="h-1.5 w-6 rounded-full bg-blue-600" /> The
                admission workflow
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
                Five stages, clearly explained
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Each stage has a defined responsibility. You can see what is
                expected, who handles the work and what happens before the
                application moves forward.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
                01 — 05
              </span>
              Stage-wise screening
            </div>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2">
            {stages.map((stage, index) => (
              <StageCard key={stage.number} stage={stage} index={index} />
            ))}
          </div>
        </section>

        {/* Documents and important applicant guidance */}
        <section className="mt-16 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[26px] border border-blue-100 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.035)]"
          >
            <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:p-7">
              <div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-blue-700">
                  Keep these ready
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[#142f4e] sm:text-2xl">
                  Documents for your application
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The common mandatory documents listed in the CrediFit
                  requirements.
                </p>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <ul className="grid gap-3 sm:grid-cols-2">
                {requiredDocuments.map((document, index) => (
                  <li
                    key={document}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fbfcfe] p-3.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
                      0{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {document}
                    </span>
                    <CheckCircle2
                      size={16}
                      className="ml-auto shrink-0 text-emerald-600"
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-700"
                />
                <p className="text-xs leading-5 text-amber-900/80">
                  <strong>Degree certificate:</strong> Required when applicable
                  to the applicant's qualification or selected programme.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 text-emerald-700 shadow-sm">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">
                    Optional information
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#142f4e]">
                    Hostel & mess
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Hostel and mess details may be collected, but they are optional
                and do not block the admission screening process.
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,35,65,0.035)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                  <WalletCards size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                    Project scope
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-[#142f4e]">
                    No online fee payment
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                CrediFit manages admission applications and screening. It does
                not process admission fee payments or store payment-gateway
                transactions.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Roles */}
        <section className="mt-16">
          <div className="mb-7">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <span className="h-1.5 w-6 rounded-full bg-blue-600" /> Who is
              involved
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
              Four roles. Clear responsibilities.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Each user sees a role-specific workspace and can perform only the
              actions permitted for that role.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {roleResponsibilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_rgba(15,35,65,0.03)]"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-[#142f4e]">
                    {item.role}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Important workflow safeguards */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-violet-700"
            />
            <div>
              <h3 className="text-sm font-extrabold text-violet-950">
                Eligibility rules are controlled
              </h3>
              <p className="mt-1 text-xs leading-6 text-violet-900/75">
                Only an authorized Administrator manages the institution's
                eligibility rules. Officers and evaluators may review outcomes
                but do not edit the rule definitions.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
            <ClipboardList
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
            />
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Every important action is traceable
              </h3>
              <p className="mt-1 text-xs leading-6 text-amber-900/75">
                Document decisions, eligibility reviews, workflow updates and
                final outcomes are recorded with the responsible user and
                timestamp.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-16 overflow-hidden rounded-[30px] bg-[#102d50] p-8 text-white shadow-[0_25px_65px_rgba(15,45,80,0.18)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-400/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px]" />
          <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-cyan-300">
                Your next step starts here
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to begin your admission journey?
              </h2>
              <p className="mt-4 text-sm leading-7 text-blue-100/80">
                Explore available programmes, create your applicant account and
                follow your application through the five screening stages.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#102d50] transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                Create applicant account <ArrowRight size={17} />
              </Link>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View programmes <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            to="/programmes"
            className="text-xs font-semibold text-slate-500 transition hover:text-blue-700"
          >
            Explore programmes <ArrowUpRight size={13} className="inline" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default AdmissionProcess;
