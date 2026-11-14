import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  Bell,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartPulse,
  LockKeyhole,
  Menu,
  Palette,
  PenTool,
  Plane,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  UserCog,
  Workflow,
  X,
  BriefcaseBusiness,
  ClipboardCheck,
} from "lucide-react";

// Illustrative academic catalogue. Final offerings are managed by the institution.

const programmes = [
  // Engineering & Technology

  {
    name: "Computer Science Engineering",

    short: "CSE",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",

    description:
      "Programming, algorithms, software engineering and computing systems.",
  },

  {
    name: "Bachelor of Computer Applications",

    short: "BCA",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "3 years",
    description:
      "Programming, databases, software development and modern computing.",
  },

  {
    name: "Artificial Intelligence & Machine Learning",

    short: "AI/ML",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",
    description: "Machine learning, intelligent systems and applied AI.",
  },

  {
    name: "Information Science",

    short: "ISE",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",
    description:
      "Information systems, databases, networking and software development.",
  },

  {
    name: "Mechanical Engineering",

    short: "ME",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",
    description: "Mechanical systems, manufacturing and engineering design.",
  },

  {
    name: "Civil Engineering",

    short: "CE",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",
    description: "Infrastructure, construction, structures and transportation.",
  },

  {
    name: "Electronics & Communication Engineering",

    short: "ECE",

    category: "Engineering & Technology",
    level: "Undergraduate",

    duration: "4 years",
    description: "Electronics, communication systems and embedded technology.",
  },

  {
    name: "Master of Computer Applications",

    short: "MCA",
    category: "Engineering & Technology",

    level: "Postgraduate",

    duration: "2 years",
    description: "Advanced computing, software applications and development.",
  },

  {
    name: "Polytechnic Diploma in Engineering",

    short: "DIP-ENG",
    category: "Engineering & Technology",

    level: "Diploma",

    duration: "Typically 3 years",
    description:
      "Practical and technical foundations in an engineering discipline.",
  },

  // Medical & Healthcare
  {
    name: "Bachelor of Medicine and Bachelor of Surgery",
    short: "MBBS",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "As prescribed",

    description: "Medical education and clinical training for future doctors.",
  },
  {
    name: "Bachelor of Dental Surgery",
    short: "BDS",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "As prescribed",

    description: "Dental sciences, oral health and clinical practice.",
  },
  {
    name: "Bachelor of Science in Nursing",
    short: "B.Sc Nursing",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "Typically 4 years",

    description: "Patient care, clinical practice and nursing sciences.",
  },
  {
    name: "Bachelor of Pharmacy",
    short: "B.Pharm",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "Typically 4 years",

    description: "Pharmaceutical sciences, medicines and drug safety.",
  },
  {
    name: "Bachelor of Physiotherapy",
    short: "BPT",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "As prescribed",

    description: "Movement, rehabilitation and physical therapy.",
  },

  {
    name: "Medical Laboratory Technology",
    short: "MLT",

    category: "Medical & Healthcare",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Laboratory testing and diagnostic healthcare techniques.",
  },

  {
    name: "Master of Public Health",
    short: "MPH",

    category: "Medical & Healthcare",

    level: "Postgraduate",
    duration: "Varies by programme",

    description: "Public health, epidemiology and population-level healthcare.",
  },

  // Agriculture & Veterinary

  {
    name: "Bachelor of Science in Agriculture",

    short: "B.Sc Agri",

    category: "Agriculture & Veterinary",
    level: "Undergraduate",

    duration: "Typically 4 years",
    description: "Crop science, soil management and agricultural systems.",
  },

  {
    name: "Horticulture",

    short: "B.Sc Hort",

    category: "Agriculture & Veterinary",
    level: "Undergraduate",

    duration: "Typically 4 years",
    description: "Fruits, vegetables, plantation crops and plant production.",
  },

  {
    name: "Veterinary Science",

    short: "BVSc",

    category: "Agriculture & Veterinary",
    level: "Undergraduate",

    duration: "As prescribed",
    description: "Animal health, veterinary medicine and animal husbandry.",
  },

  {
    name: "Forestry",

    short: "B.Sc Forestry",
    category: "Agriculture & Veterinary",

    level: "Undergraduate",

    duration: "Typically 4 years",
    description:
      "Forest ecosystems, conservation and natural resource management.",
  },

  {
    name: "Fisheries Science",

    short: "BFSc",
    category: "Agriculture & Veterinary",

    level: "Undergraduate",

    duration: "Varies by programme",
    description: "Aquaculture, aquatic ecosystems and fisheries management.",
  },

  // Science & Research
  {
    name: "Physics",
    short: "B.Sc Physics",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Typically 3–4 years",

    description: "Matter, energy, experimental science and physical systems.",
  },
  {
    name: "Chemistry",
    short: "B.Sc Chemistry",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Typically 3–4 years",

    description:
      "Chemical principles, laboratory methods and material properties.",
  },
  {
    name: "Mathematics",
    short: "B.Sc Maths",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Typically 3–4 years",

    description: "Mathematical modelling, statistics and analytical methods.",
  },
  {
    name: "Biotechnology",
    short: "B.Sc Biotech",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Biological systems, biotechnology and laboratory research.",
  },
  {
    name: "Microbiology",
    short: "B.Sc Micro",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Microorganisms, laboratory science and applied biology.",
  },

  {
    name: "Environmental Science",
    short: "Env. Sci",

    category: "Science & Research",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Environmental systems, sustainability and conservation.",
  },

  // Business, Commerce & Finance

  {
    name: "Bachelor of Business Administration",

    short: "BBA",

    category: "Business & Commerce",
    level: "Undergraduate",

    duration: "Typically 3–4 years",
    description: "Management, operations, leadership and business strategy.",
  },

  {
    name: "Bachelor of Commerce",

    short: "B.Com",

    category: "Business & Commerce",
    level: "Undergraduate",

    duration: "Typically 3–4 years",
    description: "Accounting, taxation, business and commercial principles.",
  },

  {
    name: "Master of Business Administration",

    short: "MBA",

    category: "Business & Commerce",
    level: "Postgraduate",

    duration: "Typically 2 years",
    description: "Business leadership, strategy, finance and management.",
  },

  {
    name: "Master of Commerce",

    short: "M.Com",

    category: "Business & Commerce",
    level: "Postgraduate",

    duration: "Typically 2 years",
    description: "Advanced commerce, accounting and financial management.",
  },

  {
    name: "Economics",

    short: "B.A. Econ",
    category: "Business & Commerce",

    level: "Undergraduate",

    duration: "Typically 3–4 years",
    description: "Markets, economic policy, data and resource allocation.",
  },

  // Arts & Social Sciences
  {
    name: "Bachelor of Arts",
    short: "BA",

    category: "Arts & Social Sciences",

    level: "Undergraduate",
    duration: "Typically 3–4 years",

    description:
      "Humanities and social science subjects across multiple disciplines.",
  },
  {
    name: "Psychology",
    short: "B.Sc Psych",

    category: "Arts & Social Sciences",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Human behaviour, cognition and psychological research.",
  },
  {
    name: "Sociology",
    short: "B.A. Soc",

    category: "Arts & Social Sciences",

    level: "Undergraduate",
    duration: "Typically 3–4 years",

    description: "Society, communities, institutions and social change.",
  },
  {
    name: "Journalism & Mass Communication",
    short: "JMC",

    category: "Arts & Social Sciences",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Reporting, digital media, communication and storytelling.",
  },

  // Law & Public Policy

  {
    name: "Bachelor of Laws",

    short: "LLB",

    category: "Law & Public Policy",
    level: "Undergraduate",

    duration: "Depends on entry route",

    description: "Legal principles, advocacy and the justice system.",
  },

  {
    name: "Integrated BA LLB",

    short: "BA LLB",

    category: "Law & Public Policy",
    level: "Undergraduate",

    duration: "Typically 5 years",
    description: "Combined undergraduate arts and professional legal studies.",
  },

  {
    name: "Master of Laws",

    short: "LLM",

    category: "Law & Public Policy",
    level: "Postgraduate",

    duration: "Varies by programme",
    description: "Advanced legal study and specialised legal research.",
  },

  {
    name: "Political Science",

    short: "B.A. Pol Sci",

    category: "Law & Public Policy",
    level: "Undergraduate",

    duration: "Typically 3–4 years",
    description:
      "Government, public policy, political institutions and governance.",
  },

  // Architecture, Design & Creative Arts
  {
    name: "Bachelor of Architecture",

    short: "B.Arch",
    category: "Architecture & Design",

    level: "Undergraduate",
    duration: "Typically 5 years",

    description: "Architectural design, buildings and the built environment.",
  },
  {
    name: "Interior Design",

    short: "Interior",
    category: "Architecture & Design",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Interior spaces, materials, planning and design practice.",
  },
  {
    name: "Fashion Design",

    short: "Fashion",
    category: "Architecture & Design",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Fashion concepts, textiles, garment design and production.",
  },
  {
    name: "Fine Arts",
    short: "BFA",

    category: "Architecture & Design",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Visual arts, creative practice and artistic expression.",
  },

  // Education & Hospitality

  {
    name: "Bachelor of Education",

    short: "B.Ed",

    category: "Education & Hospitality",
    level: "Undergraduate",

    duration: "As prescribed",

    description: "Teaching methods, pedagogy and classroom practice.",
  },

  {
    name: "Master of Education",

    short: "M.Ed",

    category: "Education & Hospitality",
    level: "Postgraduate",

    duration: "Typically 2 years",

    description: "Advanced pedagogy, educational research and leadership.",
  },

  {
    name: "Hotel Management",

    short: "BHM",

    category: "Education & Hospitality",
    level: "Undergraduate",

    duration: "Varies by programme",

    description: "Hospitality operations, guest services and hotel management.",
  },

  {
    name: "Tourism Management",

    short: "Tourism",

    category: "Education & Hospitality",
    level: "Undergraduate",

    duration: "Varies by programme",

    description:
      "Tourism operations, travel services and destination management.",
  },

  // Sports & Other Fields
  {
    name: "Physical Education & Sports Science",

    short: "Sports Sci",
    category: "Sports & Other Fields",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Sports performance, exercise science and physical education.",
  },
  {
    name: "Aviation Management",

    short: "Aviation",
    category: "Sports & Other Fields",

    level: "Undergraduate",
    duration: "Varies by programme",

    description: "Aviation operations, airport services and management.",
  },
  {
    name: "Certificate in Data Analytics",

    short: "Data Cert",
    category: "Sports & Other Fields",

    level: "Certificate",
    duration: "Varies by provider",

    description:
      "An introductory pathway into data analysis and visualisation.",
  },
];

const workflowStages = [
  {
    number: "01",

    title: "Application submission",
    description:
      "Create an applicant account, complete personal and academic details, choose a programme and submit the application with the required documents.",

    owner: "Applicant",
    icon: FileText,

    tone: "blue",
  },
  {
    number: "02",
    title: "Document verification",

    description:
      "The Admission Officer checks whether documents are complete, readable and consistent. Any correction or resubmission request includes a reason.",
    owner: "Admission Officer",

    icon: FileCheck2,

    tone: "cyan",
  },

  {
    number: "03",

    title: "Eligibility screening",

    description:
      "Academic details are checked against the programme requirements and eligibility rules configured by the institution.",

    owner: "Admission Officer",

    icon: ShieldCheck,
    tone: "violet",
  },
  {
    number: "04",

    title: "Department review",
    description:
      "An assigned Evaluator reviews the application against relevant department criteria and records assessment remarks or a recommendation.",
    owner: "Assigned Evaluator",

    icon: ClipboardCheck,

    tone: "emerald",
  },

  {
    number: "05",
    title: "Final admission decision",

    description:
      "An authorized Administrator records the final outcome after all required screening and department review stages are complete.",

    owner: "Authorized Administrator",

    icon: CheckCircle2,
    tone: "amber",
  },
];

const userRoles = [
  {
    title: "Applicant",

    description:
      "Complete your profile, submit programme-specific documents, respond to clarification requests and follow application progress.",
    icon: GraduationCap,

    tone: "blue",

    responsibilities: [
      "Maintain personal and academic details",

      "Submit an application for an available programme",
      "Upload requested documents and track progress",
    ],
  },
  {
    title: "Admission Officer",

    description:
      "Manage application queues, verify documents, review eligibility information and process authorized workflow tasks.",

    icon: ShieldCheck,
    tone: "cyan",

    responsibilities: [
      "Verify submitted documents and request corrections",
      "Review rule-based eligibility information",

      "Record remarks and authorized workflow updates",
    ],
  },

  {
    title: "Evaluator",

    description:
      "Review assigned applications for the relevant department and record assessment remarks or recommendations.",
    icon: ClipboardCheck,

    tone: "violet",
    responsibilities: [
      "Access only assigned review tasks",

      "Assess against the configured department rubric",
      "Record remarks and recommendations",
    ],
  },
  {
    title: "Administrator",
    description:
      "Manage users, institution-specific programmes, eligibility rules, workflow settings and authorized final decisions.",

    icon: UserCog,
    tone: "emerald",

    responsibilities: [
      "Manage user access and role assignments",
      "Configure programmes and eligibility rules",

      "Record authorized final admission decisions",
    ],
  },
];

const commonDocuments = [
  {
    title: "10th marks card",
    note: "Common mandatory document",

    icon: FileText,
  },

  {
    title: "12th / PUC marks card",
    note: "Common mandatory document",

    icon: FileText,
  },
  {
    title: "Leaving certificate",
    note: "Common mandatory document",

    icon: FileCheck2,
  },
  {
    title: "Degree certificate",

    note: "Required when applicable",
    icon: GraduationCap,
  },
];

const toneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-700 ring-blue-100",

    badge: "border-blue-100 bg-blue-50 text-blue-700",

    glow: "from-blue-500/10 to-indigo-500/5",
    line: "bg-blue-500",
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-700 ring-cyan-100",

    badge: "border-cyan-100 bg-cyan-50 text-cyan-700",
    glow: "from-cyan-500/10 to-sky-500/5",

    line: "bg-cyan-500",
  },

  violet: {
    icon: "bg-violet-50 text-violet-700 ring-violet-100",
    badge: "border-violet-100 bg-violet-50 text-violet-700",

    glow: "from-violet-500/10 to-fuchsia-500/5",

    line: "bg-violet-500",
  },

  emerald: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",

    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",

    glow: "from-emerald-500/10 to-teal-500/5",
    line: "bg-emerald-500",
  },

  amber: {
    icon: "bg-amber-50 text-amber-800 ring-amber-100",

    badge: "border-amber-100 bg-amber-50 text-amber-800",
    glow: "from-amber-500/10 to-orange-500/5",

    line: "bg-amber-500",
  },
};

const fieldIconMap = {
  "Engineering & Technology": Code2,
  "Medical & Healthcare": HeartPulse,

  "Agriculture & Veterinary": Sprout,
  "Science & Research": Atom,

  "Business & Commerce": BriefcaseBusiness,

  "Arts & Social Sciences": Palette,
  "Law & Public Policy": Scale,

  "Architecture & Design": PenTool,

  "Education & Hospitality": BookOpen,
  "Sports & Other Fields": Plane,
};

function Brand({ light = false, compact = false }) {
  return (
    <Link
      to="/"
      aria-label="CrediFit home"
      className="flex w-fit items-center gap-3"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          light
            ? "bg-white/10 text-cyan-200 ring-1 ring-white/15"
            : "bg-[#102d50] text-white shadow-md shadow-blue-950/10"
        }`}
      >
        <GraduationCap size={23} />
      </span>
      <span>
        <span
          className={`block text-xl font-extrabold tracking-tight ${
            light ? "text-white" : "text-[#142f4e]"
          }`}
        >
          CrediFit<span className="text-cyan-400">.</span>
        </span>
        {!compact && (
          <span
            className={`block text-[9px] font-bold uppercase tracking-[0.19em] ${
              light ? "text-slate-400" : "text-slate-400"
            }`}
          >
            Admissions portal
          </span>
        )}
      </span>
    </Link>
  );
}

function SectionEyebrow({ children, light = false }) {
  return (
    <div
      className={`mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] sm:text-xs ${
        light ? "text-cyan-300" : "text-blue-700"
      }`}
    >
      <span
        className={`h-1.5 w-6 rounded-full ${
          light ? "bg-cyan-300" : "bg-blue-600"
        }`}
      />

      {children}
    </div>
  );
}

function ProgrammeCard({ programme, index, onSelect }) {
  const Icon = fieldIconMap[programme.category] || GraduationCap;

  const tone = ["blue", "violet", "emerald", "cyan", "amber"][index % 5];
  const style = toneStyles[tone];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.18) }}
      whileHover={{ y: -5 }}
      className="group relative flex min-h-[315px] flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_28px_rgba(15,35,65,0.035)] transition-shadow duration-300 hover:shadow-[0_20px_45px_rgba(15,35,65,0.10)]"
    >
      <div className={`h-1 w-full ${style.line}`} />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div
          className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${style.glow} blur-2xl transition-transform duration-500 group-hover:scale-125`}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 ${style.icon}`}
          >
            <Icon size={23} strokeWidth={1.8} />
          </div>

          <span
            className={`rounded-full border px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider ${style.badge}`}
          >
            {programme.level}
          </span>
        </div>

        <div className="relative mt-5 flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#173b61]">
            {programme.short}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span className="text-[10px] font-semibold text-slate-400">
            {programme.category}
          </span>
        </div>

        <h3 className="relative mt-2 min-h-[52px] text-base font-extrabold leading-6 tracking-tight text-[#142f4e] sm:text-lg">
          {programme.name}
        </h3>

        <p className="relative mt-2 flex-1 text-xs leading-6 text-slate-500">
          {programme.description}
        </p>

        <div className="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <Clock3 size={14} className="text-slate-400" />

            {programme.duration}
          </span>
          <button
            type="button"
            onClick={() => onSelect(programme)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 transition hover:gap-2.5"
          >
            View details <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function WorkflowStageCard({ stage, index }) {
  const Icon = stage.icon;

  const style = toneStyles[stage.tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative rounded-[23px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.035)] transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${style.icon}`}
        >
          <Icon size={22} />
        </div>

        <span className="text-3xl font-black tracking-tight text-slate-100">
          {stage.number}
        </span>
      </div>
      <h3 className="mt-5 text-base font-extrabold leading-6 text-[#142f4e]">
        {stage.title}
      </h3>
      <p className="mt-2 min-h-[96px] text-xs leading-6 text-slate-500">
        {stage.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          Responsible
        </span>

        <span
          className={`rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${style.badge}`}
        >
          {stage.owner}
        </span>
      </div>
    </motion.article>
  );
}

function RoleCard({ role, index }) {
  const Icon = role.icon;
  const style = toneStyles[role.tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex h-full flex-col rounded-[23px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_25px_rgba(15,35,65,0.035)] transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${style.icon}`}
      >
        <Icon size={23} />
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-[#142f4e]">
        {role.title}
      </h3>

      <p className="mt-2 min-h-[68px] text-xs leading-6 text-slate-500">
        {role.description}
      </p>
      <div className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
        {role.responsibilities.map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 text-[11px] leading-5 text-slate-600"
          >
            <CheckCircle2
              size={13}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            {item}
          </div>
        ))}
      </div>
      <Link
        to="/login"
        className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-blue-700 transition hover:gap-3"
      >
        Portal sign in <ArrowRight size={15} />
      </Link>
    </motion.article>
  );
}

function ProgrammeDialog({ programme, onClose }) {
  if (!programme) return null;
  const Icon = fieldIconMap[programme.category] || GraduationCap;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06162b]/65 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-programme-dialog-title"
          initial={{ opacity: 0, y: 22, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/40 bg-white p-6 shadow-2xl sm:p-8"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Icon size={27} />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close programme details"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative mt-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
              Programme overview · {programme.short}
            </p>
            <h2
              id="home-programme-dialog-title"
              className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-[#142f4e]"
            >
              {programme.name}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {programme.description}
            </p>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Study level
              </p>

              <p className="mt-2 text-sm font-extrabold text-[#142f4e]">
                {programme.level}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Duration
              </p>
              <p className="mt-2 text-sm font-extrabold text-[#142f4e]">
                {programme.duration}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Academic field
              </p>
              <p className="mt-2 text-sm font-extrabold text-[#142f4e]">
                {programme.category}
              </p>
            </div>
          </div>

          <p className="relative mt-5 text-xs leading-6 text-slate-500">
            Programme listings are illustrative until an institution configures
            its actual offerings and admission requirements. Eligibility
            information is provided during the application workflow.
          </p>

          <div className="relative mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#173b61] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-700"
            >
              Continue to sign in <ArrowUpRight size={16} />
            </Link>

            <Link
              to="/programmes"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Browse all
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [field, setField] = useState("All fields");
  const [level, setLevel] = useState("All levels");

  const [showAllProgrammes, setShowAllProgrammes] = useState(false);

  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const fields = [
    "All fields",
    ...new Set(programmes.map((programme) => programme.category)),
  ];

  const levels = [
    "All levels",

    ...new Set(programmes.map((programme) => programme.level)),
  ];

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return programmes.filter((programme) => {
      const searchableText = [
        programme.name,
        programme.short,

        programme.category,
        programme.level,

        programme.description,
      ]
        .join(" ")

        .toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesField =
        field === "All fields" || programme.category === field;

      const matchesLevel = level === "All levels" || programme.level === level;

      return matchesSearch && matchesField && matchesLevel;
    });
  }, [search, field, level]);

  const visibleProgrammes = showAllProgrammes
    ? filteredProgrammes
    : filteredProgrammes.slice(0, 6);

  const closeMenu = () => setMobileMenu(false);

  const clearProgrammeFilters = () => {
    setSearch("");

    setField("All fields");

    setLevel("All levels");
    setShowAllProgrammes(false);
  };

  useEffect(() => {
    if (!selectedProgramme) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedProgramme(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProgramme]);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* NAVIGATION */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand />

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            <a
              href="#about"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              About CrediFit
            </a>

            <Link
              to="/programmes"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Programmes
            </Link>

            <Link
              to="/admission-process"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Admission process
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#173b61]"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu((open) => !open)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50 md:hidden"
            aria-label={mobileMenu ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 bg-white px-5 py-5 md:hidden"
            >
              <nav
                className="flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                <a
                  onClick={closeMenu}
                  href="#about"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  About CrediFit
                </a>

                <Link
                  onClick={closeMenu}
                  to="/programmes"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Programmes
                </Link>
                <Link
                  onClick={closeMenu}
                  to="/admission-process"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Admission process
                </Link>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                  <Link
                    onClick={closeMenu}
                    to="/login"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700"
                  >
                    Sign in
                  </Link>

                  <Link
                    onClick={closeMenu}
                    to="/register"
                    className="rounded-xl bg-[#173b61] px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Get started
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* HERO */}

        <section id="home" className="relative overflow-hidden bg-[#f5f8fc]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 left-1/3 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#245c8e] shadow-sm sm:text-sm">
                <Sparkles size={15} />A more transparent admissions journey
              </div>

              <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-[#142f4d] sm:text-5xl lg:text-[62px]">
                Your next chapter
                <span className="mt-1 block text-[#397bb5]">
                  starts with clarity.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Discover academic programmes, understand admission requirements
                and follow your application through every screening stage—all in
                one place.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/programmes")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b61] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-[#245c8e]"
                >
                  Explore programmes
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admission-process")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  Understand the process
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Stage-wise tracking
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Clear requirements
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="relative mx-auto w-full max-w-lg"
            >
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-blue-200/50 to-indigo-100/40 blur-xl" />
              <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40 sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Applicant workspace
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold text-[#173b61]">
                      Your admission journey
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#245c8e]">
                    <FileCheck2 size={23} />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f5f8fc] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Application overview
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        Stay on top of every stage
                      </p>
                    </div>
                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-[#245c8e]">
                      Preview
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      ["Profile details", "Ready when you are", true],
                      ["Document verification", "Required documents", false],
                      ["Eligibility screening", "Rule-based review", false],
                    ].map(([title, detail, complete], index) => (
                      <div key={title} className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${complete ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400 ring-1 ring-slate-200"}`}
                        >
                          {complete ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <span className="text-sm font-bold">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {detail}
                          </p>
                        </div>
                        <ChevronDown
                          size={16}
                          className="rotate-[-90deg] text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Designed for transparent screening
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                      Follow the process and understand what is required at each
                      stage.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-center text-[11px] text-slate-400">
                  Illustrative preview · Not connected to live applications
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUST / VALUE STRIP */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1380px] gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-12">
            {[
              {
                icon: FileCheck2,

                title: "Organized documents",

                text: "Clear document requirements and review records.",
              },

              {
                icon: ShieldCheck,

                title: "Rule-based eligibility",

                text: "Configured criteria with explainable screening outcomes.",
              },

              {
                icon: Bell,
                title: "Visible progress",

                text: "Stage updates, remarks and relevant notifications.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 sm:justify-center"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="block text-xs font-extrabold text-[#142f4e]">
                      {item.title}
                    </span>

                    <span className="mt-1 block max-w-[240px] text-[10px] leading-5 text-slate-500">
                      {item.text}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROGRAMME DISCOVERY */}

        <section
          id="programmes"
          className="scroll-mt-24 bg-[#f7f9fc] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="flex flex-col justify-between gap-5 md:flex-row md:items-end"
            >
              <div>
                <SectionEyebrow>Find your direction</SectionEyebrow>

                <h2 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
                  Explore academic programmes
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                  Browse the illustrative course catalogue, search by area of
                  study and explore the details before starting your
                  application.
                </p>
              </div>

              <Link
                to="/programmes"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-blue-700 transition hover:gap-3"
              >
                View complete catalogue <ArrowRight size={17} />
              </Link>
            </motion.div>

            {/* Search and filter panel */}

            <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,35,65,0.04)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setShowAllProgrammes(false);
                    }}
                    placeholder="Search programmes, degrees, departments or course codes..."
                    aria-label="Search programmes"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-[#fbfcfe] pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div className="relative lg:w-[220px]">
                  <SlidersHorizontal
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={level}
                    onChange={(event) => {
                      setLevel(event.target.value);
                      setShowAllProgrammes(false);
                    }}
                    aria-label="Filter programmes by qualification level"
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {levels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-start">
                <span className="shrink-0 pt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Browse by field
                </span>
                <div className="flex flex-wrap gap-2">
                  {fields.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => {
                        setField(item);

                        setShowAllProgrammes(false);
                      }}
                      aria-pressed={field === item}
                      className={`rounded-lg border px-3 py-2 text-[10px] font-bold transition ${
                        field === item
                          ? "border-[#173b61] bg-[#173b61] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  <span className="font-extrabold text-[#142f4e]">
                    {filteredProgrammes.length}
                  </span>{" "}
                  matching programmes
                </p>

                <button
                  type="button"
                  onClick={clearProgrammeFilters}
                  className="text-xs font-bold text-blue-700 transition hover:text-blue-900 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            </div>

            {/* Featured programme grid */}

            {filteredProgrammes.length > 0 ? (
              <motion.div
                layout
                className="mt-7 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {visibleProgrammes.map((programme, index) => (
                    <ProgrammeCard
                      key={programme.short}
                      programme={programme}
                      index={index}
                      onSelect={setSelectedProgramme}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-7 rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-[#142f4e]">
                  No matching programmes
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search term or choose a different academic field.
                </p>
                <button
                  type="button"
                  onClick={clearProgrammeFilters}
                  className="mt-5 rounded-xl bg-[#173b61] px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Clear filters
                </button>
              </motion.div>
            )}

            {filteredProgrammes.length > 6 && (
              <div className="mt-9 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAllProgrammes((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {showAllProgrammes
                    ? "Show featured programmes"
                    : `Show all ${filteredProgrammes.length} matches`}

                  <ChevronDown
                    size={15}
                    className={`transition-transform ${showAllProgrammes ? "rotate-180" : ""}`}
                  />
                </button>
                <p className="text-[10px] text-slate-400">
                  Or explore the full catalogue on the dedicated programmes
                  page.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ADMISSION PROCESS */}
        <section
          id="process"
          className="scroll-mt-24 border-y border-slate-200 bg-white py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-3xl text-center">
              <SectionEyebrow>Simple by design</SectionEyebrow>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
                Admissions, stage by stage.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Each application follows five defined stages. Applicants can
                understand what happens next and which team is responsible.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {workflowStages.map((stage, index) => (
                <WorkflowStageCard
                  key={stage.number}
                  stage={stage}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-9 flex justify-center">
              <Link
                to="/admission-process"
                className="inline-flex items-center gap-2 rounded-xl bg-[#173b61] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Understand every stage <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* ROLE-BASED WORKSPACES */}

        <section className="bg-[#f7f9fc]">
          <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
              <SectionEyebrow>
                One platform, defined responsibilities
              </SectionEyebrow>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#142f4e] sm:text-4xl">
                A workspace for every role.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                CrediFit separates applicant activities, admission operations,
                department evaluation and administration.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {userRoles.map((role, index) => (
                <RoleCard key={role.title} role={role} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* IMPORTANT APPLICANT INFORMATION */}

        <section className="bg-white">
          <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative overflow-hidden rounded-[26px] bg-[#102d50] p-7 text-white sm:p-9">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-[90px]" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
                  <FileCheck2 size={24} />
                </div>

                <p className="relative mt-7 text-xs font-extrabold uppercase tracking-[0.17em] text-cyan-300">
                  Before you apply
                </p>

                <h2 className="relative mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                  Keep your documents ready.
                </h2>

                <p className="relative mt-4 text-sm leading-7 text-blue-100/80">
                  Document requirements depend on the selected programme and
                  your previous qualification. Check the requirements shown
                  during the application.
                </p>

                <Link
                  to="/admission-process"
                  className="relative mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-white transition hover:gap-3"
                >
                  Read applicant guidance <ArrowRight size={17} />
                </Link>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-[#fbfcfe] p-7 sm:p-9">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <SectionEyebrow>Document checklist</SectionEyebrow>

                    <h3 className="text-xl font-extrabold text-[#142f4e]">
                      Common admission documents
                    </h3>
                  </div>
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
                    Programme-dependent
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {commonDocuments.map((item, index) => {
                    const Icon = item.icon;

                    const isConditional = index === 3;
                    return (
                      <div
                        key={item.title}
                        className={`flex items-center gap-3 rounded-xl border p-4 ${
                          isConditional
                            ? "border-amber-200 bg-amber-50/70"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isConditional
                              ? "bg-white text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <span>
                          <span className="block text-xs font-extrabold text-slate-700">
                            {item.title}
                          </span>

                          <span
                            className={`mt-1 block text-[9px] font-semibold ${isConditional ? "text-amber-700" : "text-slate-400"}`}
                          >
                            {item.note}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <p className="text-xs font-extrabold text-cyan-900">
                      Hostel information
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-cyan-900/70">
                      Optional — does not block admission screening.
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <p className="text-xs font-extrabold text-cyan-900">
                      Mess information
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-cyan-900/70">
                      Optional — does not block admission screening.
                    </p>
                  </div>
                </div>

                <p className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-slate-500">
                  <LockKeyhole
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  Only upload documents requested for your selected programme
                  and qualification. Additional requirements may be configured
                  by the institution.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <Bell size={19} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <h3 className="text-sm font-extrabold text-amber-900">
                  No online fee payment in this portal
                </h3>

                <p className="mt-1 text-xs leading-6 text-amber-900/75">
                  CrediFit manages admission applications and screening records.
                  Online admission-fee payment and payment-gateway transactions
                  are outside this project’s scope.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT CREDIFIT */}

        <section
          id="about"
          className="scroll-mt-24 border-y border-slate-200 bg-[#f7f9fc]"
        >
          <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-12 lg:py-20">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[28px] bg-[#0d2b4c] p-8 text-white sm:p-10"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-[90px]" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
                <ShieldCheck size={27} />
              </div>
              <p className="relative mt-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
                Built around clarity
              </p>
              <h2 className="relative mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                One connected journey. Clear responsibilities.
              </h2>
              <p className="relative mt-5 text-sm leading-7 text-blue-100/80">
                CrediFit brings programme information, applicant records,
                document verification and rule-based eligibility checks into one
                structured campus workflow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="space-y-6"
            >
              <div>
                <SectionEyebrow>About the platform</SectionEyebrow>

                <h3 className="text-2xl font-extrabold tracking-tight text-[#142f4e] sm:text-3xl">
                  Designed for a structured admission process.
                </h3>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                When admission activities are handled across separate forms,
                spreadsheets and manual updates, it can be difficult to track
                missing documents, review progress and decision history.
                CrediFit is designed to organize these activities in a
                centralized register.
              </p>
              <p className="text-sm leading-7 text-slate-600">
                Eligibility outcomes are based on rules configured by an
                authorized Administrator. Admission Officers and Evaluators
                review information within their assigned responsibilities, while
                the final decision remains with the authorized Administrator.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Workflow size={17} />
                    <span className="text-xs font-extrabold">
                      Stage-wise workflow
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Required checks follow a defined sequence with status and
                    responsible-user records.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck size={17} />
                    <span className="text-xs font-extrabold">
                      Traceable actions
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Important reviews, updates and decisions are intended to
                    retain their history.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <p className="text-xs font-extrabold text-blue-900">
                  Academic project prototype
                </p>

                <p className="mt-2 text-xs leading-6 text-blue-900/75">
                  This public page uses illustrative programme catalogue data.
                  Live registration, authentication, database records and actual
                  eligibility decisions depend on backend integration and
                  institution-configured programme information.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}

        <section className="relative isolate overflow-hidden bg-[#0d2b4c] text-white">
          <div className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[110px]" />

          <div className="relative mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-12 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
                Your journey begins here
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Take the next step with CrediFit.
              </h2>

              <p className="mt-4 text-sm leading-7 text-blue-100/80">
                Explore the programme directory or create an applicant account
                to begin the admission process.
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-3 md:w-auto">
              <Link
                to="/register"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-extrabold text-[#102d50] transition hover:-translate-y-0.5 hover:bg-cyan-50 md:flex-none"
              >
                Create account <ArrowRight size={17} />
              </Link>

              <Link
                to="/programmes"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/5 md:flex-none"
              >
                Browse programmes <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:px-12">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-xs leading-6 text-slate-500">
              A structured and traceable approach to campus admissions, document
              verification and stage-wise screening.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#142f4e]">
              Explore
            </h3>

            <div className="mt-4 flex flex-col items-start gap-3 text-xs font-medium text-slate-500">
              <Link to="/programmes" className="transition hover:text-blue-700">
                Academic programmes
              </Link>
              <Link
                to="/admission-process"
                className="transition hover:text-blue-700"
              >
                Admission process
              </Link>
              <a href="#about" className="transition hover:text-blue-700">
                About CrediFit
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#142f4e]">
              Portal access
            </h3>

            <div className="mt-4 flex flex-col items-start gap-3 text-xs font-medium text-slate-500">
              <Link to="/login" className="transition hover:text-blue-700">
                Sign in
              </Link>
              <Link to="/register" className="transition hover:text-blue-700">
                Applicant registration
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#142f4e]">
              Project information
            </h3>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Admission Stage-Wise Screening Register.
            </p>

            <p className="mt-2 text-[10px] leading-5 text-slate-400">
              Academic project prototype. Programme listings are illustrative
              until configured by an institution.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-5 text-center text-[10px] font-medium text-slate-400">
          © {new Date().getFullYear()} CrediFit · Admission Stage-Wise Screening
          Register
        </div>
      </footer>

      <ProgrammeDialog
        programme={selectedProgramme}
        onClose={() => setSelectedProgramme(null)}
      />
    </div>
  );
}

export default HomePage;
