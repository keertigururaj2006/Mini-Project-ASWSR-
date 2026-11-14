import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { pool } from "../config/db.js";
import { asyncHandler, HttpError, sendOk } from "../lib/http.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createPublicId,
  moveApplicationStage,
  notifyUser,
  writeAudit,
} from "../services/records.js";
import {
  normalizeQualification,
  qualificationLabel,
} from "../services/qualifications.js";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

function canonicalDocumentName(name) {
  const key = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  const aliases = {
    "10thmarkscard": "10th Standard Marks Card",
    "10thstandardmarkscard": "10th Standard Marks Card",
    "12thmarkscard": "12th / PUC Marks Card",
    "12thpucmarkscard": "12th / PUC Marks Card",
    "degree markscards": "Degree Certificate",
    degreemarkscards: "Degree Certificate",
    degreecertificate: "Degree Certificate",
    leavingcertificate: "Leaving Certificate",
    hostelapplication: "Hostel Application",
    messapplication: "Mess Application",
  };
  return aliases[key] || String(name).trim();
}

const userCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  role: z.enum(["APPLICANT", "ADMISSION_OFFICER", "EVALUATOR", "ADMIN"]),
  department: z.string().trim().max(160).optional().default(""),
  programmeIds: z
    .array(z.coerce.number().int().positive())
    .optional()
    .default([]),
});
const userUpdateSchema = z.object({
  role: z
    .enum(["APPLICANT", "ADMISSION_OFFICER", "EVALUATOR", "ADMIN"])
    .optional(),
  accountStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});
const programmeSchema = z.object({
  code: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(180),
  shortCode: z.string().trim().min(1).max(40),
  category: z.string().trim().min(2).max(100),
  level: z.string().trim().min(2).max(50),
  duration: z.string().trim().max(80).optional().default("To be announced"),
  description: z.string().trim().max(2000).optional().default(""),
  department: z.string().trim().max(160).optional().default(""),
  intakeCapacity: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});
const collegeSchema = z.object({
  // College codes remain in the database for internal uniqueness, but admins
  // no longer need to enter them. The API generates a code when omitted.
  code: z.string().trim().min(2).max(40).optional(),
  name: z.string().trim().min(2).max(180),
  address: z.string().trim().max(1000).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});
const collegeOfferingSchema = z.object({
  collegeId: z.coerce.number().int().positive(),
  programmeId: z.coerce.number().int().positive(),
  minimumPercentage: z.coerce.number().min(0).max(100),
  intakeCapacity: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});
const collegeCreateSchema = collegeSchema.extend({
  // When importing from the preloaded national directory, this identifies
  // the source institution so course offerings can be checked against it.
  directoryInstitutionId: z.string().trim().max(80).optional(),
  // A new institution must be linked to at least one active programme the
  // current Admin is permitted to manage.
  initialOffering: z.object({
    programmeId: z.coerce.number().int().positive(),
    minimumPercentage: z.coerce.number().min(0).max(100),
    intakeCapacity: z.coerce.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});
const adminProgrammePermissionsSchema = z.object({
  allowAll: z.boolean().optional().default(false),
  programmeIds: z
    .array(z.coerce.number().int().positive())
    .optional()
    .default([]),
});

async function getAdminProgrammeScope(userId, executor = pool) {
  const [accessRows] = await executor.execute(
    "SELECT access_mode AS accessMode FROM admin_programme_access WHERE admin_user_id = ? LIMIT 1",
    [userId],
  );
  // Existing installations without a permission row retain full access until
  // an administrator explicitly assigns a restricted programme list.
  if (!accessRows[0] || accessRows[0].accessMode === "ALL") {
    return { accessMode: "ALL", allowAll: true, programmeIds: [] };
  }
  const [permissionRows] = await executor.execute(
    `SELECT ap.programme_id AS id
     FROM admin_programme_permissions ap
     JOIN programmes p ON p.id = ap.programme_id AND p.is_active = 1
     WHERE ap.admin_user_id = ? ORDER BY ap.programme_id`,
    [userId],
  );
  return {
    accessMode: "SELECTED",
    allowAll: false,
    programmeIds: permissionRows.map((row) => Number(row.id)),
  };
}

async function assertAdminProgrammeAccess(
  userId,
  programmeId,
  executor = pool,
) {
  const scope = await getAdminProgrammeScope(userId, executor);
  if (!scope.allowAll && !scope.programmeIds.includes(Number(programmeId))) {
    throw new HttpError(
      403,
      "This Admin account is not allowed to manage the selected programme.",
    );
  }
}

// -----------------------------------------------------------------------------
// Preloaded national college directory (AICTE-derived public snapshot).
// The upstream endpoint returns institution + approved course records state-wise.
// Cache each state in memory to avoid repeatedly downloading the same catalogue.
// -----------------------------------------------------------------------------
const COLLEGE_DIRECTORY_BASE_URL =
  "https://indian-colleges-list.vercel.app/api/institutions/states";
const COLLEGE_DIRECTORY_CACHE_TTL = 6 * 60 * 60 * 1000;
const COLLEGE_DIRECTORY_STATES_CACHE_TTL = 24 * 60 * 60 * 1000;
const collegeDirectoryCache = new Map();
let collegeDirectoryStatesCache = null;

const COURSE_EQUIVALENCE_GROUPS = [
  ["BCA", "BACHELOROFCOMPUTERAPPLICATION", "BACHELOROFCOMPUTERAPPLICATIONS"],
  ["BBA", "BACHELOROFBUSINESSADMINISTRATION"],
  ["MCA", "MASTEROFCOMPUTERAPPLICATION", "MASTEROFCOMPUTERAPPLICATIONS"],
  [
    "MBA",
    "MASTER OF BUSINESS ADMINISTRATION",
    "MASTER OF BUSINESS MANAGEMENT",
    "MBABUSINESSMANAGEMENT",
    "MBAGENERALMANAGEMENT",
  ],
  ["BTECH", "BACHELOROFTECHNOLOGY", "BTECH"],
  ["BE", "BACHELOROFENGINEERING", "BE"],
  ["MTECH", "MASTEROFTECHNOLOGY", "MTECH"],
  ["ME", "MASTEROFENGINEERING", "ME"],
];

function normalizeDirectoryCourse(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function sameDirectoryCourse(left, right) {
  const a = normalizeDirectoryCourse(left);
  const b = normalizeDirectoryCourse(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return COURSE_EQUIVALENCE_GROUPS.some((group) => {
    const normalized = group.map(normalizeDirectoryCourse);
    return normalized.includes(a) && normalized.includes(b);
  });
}

function stateDirectorySlug(state) {
  return String(state || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractDirectoryInstitutions(payload) {
  if (Array.isArray(payload)) return payload;
  const containers = [payload, payload?.data, payload?.result];
  for (const container of containers) {
    if (Array.isArray(container)) return container;
    for (const key of [
      "institutions",
      "colleges",
      "data",
      "results",
      "records",
      "combined",
    ]) {
      if (Array.isArray(container?.[key])) return container[key];
    }
  }
  return [];
}

function extractDirectoryStateOptions(payload) {
  const source = Array.isArray(payload)
    ? payload
    : payload?.states ||
      payload?.data?.states ||
      payload?.data ||
      payload?.results ||
      [];
  if (!Array.isArray(source)) return [];
  return source
    .map((entry) => {
      if (typeof entry === "string") {
        return { name: entry.trim(), slug: stateDirectorySlug(entry) };
      }
      const name = String(
        entry?.name ||
          entry?.state ||
          entry?.label ||
          entry?.stateName ||
          entry?.state_name ||
          "",
      ).trim();
      const slug = String(
        entry?.slug ||
          entry?.stateSlug ||
          entry?.state_slug ||
          entry?.urlSlug ||
          stateDirectorySlug(name),
      ).trim();
      return { name, slug };
    })
    .filter((entry) => entry.name && entry.slug)
    .filter(
      (entry, index, all) =>
        all.findIndex((item) => item.slug === entry.slug) === index,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

function directoryProgrammeRows(institution) {
  const rows =
    institution?.programmes ||
    institution?.programs ||
    institution?.courses ||
    [];
  if (!Array.isArray(rows)) return [];
  return rows
    .map((entry) => ({
      ...entry,
      course:
        entry?.course ||
        entry?.course_name ||
        entry?.courseName ||
        entry?.programme ||
        entry?.program ||
        entry?.name ||
        (typeof entry === "string" ? entry : ""),
      level: entry?.level || entry?.programme_level || "",
      intake:
        entry?.intake ??
        entry?.approved_intake ??
        entry?.approvedIntake ??
        null,
    }))
    .filter((entry) => String(entry.course).trim());
}

async function fetchCollegeDirectoryStates() {
  if (
    collegeDirectoryStatesCache &&
    Date.now() - collegeDirectoryStatesCache.loadedAt <
      COLLEGE_DIRECTORY_STATES_CACHE_TTL
  ) {
    return collegeDirectoryStatesCache.states;
  }
  let response;
  try {
    response = await fetch(COLLEGE_DIRECTORY_BASE_URL, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new HttpError(
      502,
      "The national institution directory is temporarily unreachable. Please retry in a moment.",
    );
  }
  if (!response.ok) {
    throw new HttpError(
      502,
      `The national institution directory returned HTTP ${response.status} while loading states.`,
    );
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new HttpError(
      502,
      "The national institution directory returned an unreadable state list.",
    );
  }
  const states = extractDirectoryStateOptions(payload);
  if (!states.length)
    throw new HttpError(
      502,
      "The national institution directory did not return a usable state list.",
    );
  collegeDirectoryStatesCache = { loadedAt: Date.now(), states };
  return states;
}

async function fetchCollegeDirectoryState(state) {
  const slug = stateDirectorySlug(state);
  if (!slug)
    throw new HttpError(422, "Choose a valid Indian state or union territory.");
  const cached = collegeDirectoryCache.get(slug);
  if (cached && Date.now() - cached.loadedAt < COLLEGE_DIRECTORY_CACHE_TTL) {
    return cached.rows;
  }

  let response;
  try {
    response = await fetch(
      `${COLLEGE_DIRECTORY_BASE_URL}/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
      },
    );
  } catch (error) {
    throw new HttpError(
      502,
      "The national college directory is temporarily unreachable. Please retry in a moment.",
    );
  }
  if (!response.ok) {
    throw new HttpError(
      502,
      `The national college directory returned HTTP ${response.status} for ${state}.`,
    );
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new HttpError(
      502,
      "The national college directory returned an unreadable response.",
    );
  }
  const rows = extractDirectoryInstitutions(payload);
  if (!rows.length) {
    // Some states legitimately have no rows in this particular snapshot. Do not
    // silently substitute unrelated institutions from another state.
    collegeDirectoryCache.set(slug, { loadedAt: Date.now(), rows: [] });
    return [];
  }
  collegeDirectoryCache.set(slug, { loadedAt: Date.now(), rows });
  return rows;
}

function directoryProgrammeMatches(
  localProgramme,
  directoryProgrammeRows = [],
) {
  const localKeys = [localProgramme?.shortCode, localProgramme?.name].filter(
    Boolean,
  );
  return directoryProgrammeRows
    .filter((entry) =>
      localKeys.some((key) => sameDirectoryCourse(key, entry?.course)),
    )
    .map((entry) => ({
      directoryCourse: String(entry.course || "").trim(),
      level: String(entry.level || "").trim() || null,
      intake:
        entry.intake === "" || entry.intake == null
          ? null
          : Number(entry.intake) || null,
    }));
}

async function getAdminAllowedProgrammeRows(userId, executor = pool) {
  const scope = await getAdminProgrammeScope(userId, executor);
  const values = [];
  let where = "p.is_active = 1";
  if (!scope.allowAll) {
    if (!scope.programmeIds.length) return [];
    where += ` AND p.id IN (${scope.programmeIds.map(() => "?").join(",")})`;
    values.push(...scope.programmeIds);
  }
  const [rows] = await executor.execute(
    `SELECT p.id, p.name, p.short_code AS shortCode FROM programmes p WHERE ${where} ORDER BY p.name`,
    values,
  );
  return rows;
}

async function assertDirectoryInstitutionOffersProgramme({
  state,
  institutionId,
  programmeId,
  executor = pool,
}) {
  const rows = await fetchCollegeDirectoryState(state);
  const normalizedId = normalizeDirectoryCourse(institutionId);
  const institution = rows.find(
    (row) =>
      normalizeDirectoryCourse(row.aicte_id || row.id || row.other_id) ===
      normalizedId,
  );
  if (!institution) {
    throw new HttpError(
      422,
      "This institution could not be verified in the selected state's public college directory. Reload the directory and select it again.",
    );
  }
  const [programmeRows] = await executor.execute(
    "SELECT id, name, short_code AS shortCode FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
    [programmeId],
  );
  if (
    !programmeRows[0] ||
    !directoryProgrammeMatches(
      programmeRows[0],
      directoryProgrammeRows(institution),
    ).length
  ) {
    throw new HttpError(
      422,
      "The selected institution does not list this programme in the public directory.",
    );
  }
  return institution;
}

const eligibilityRuleSchema = z.object({
  programmeId: z.coerce.number().int().positive().optional(),
  programme: z.string().trim().min(2).max(180).optional(),
  qualification: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .transform(normalizeQualification),
  minimumPercentage: z.coerce.number().min(0).max(100),
  requiredDocuments: z.array(z.string().trim().min(1)).min(1),
  optionalDocuments: z.array(z.string().trim().min(1)).default([]),
  remarks: z.string().trim().max(2000).optional().default(""),
  isActive: z.boolean().optional().default(true),
});
const rubricSchema = z.object({
  name: z.string().trim().min(2).max(160),
  programmeId: z.coerce.number().int().positive().nullable().optional(),
  criteria: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(160),
        description: z.string().trim().max(1000).optional().default(""),
        weight: z.coerce.number().positive().max(100),
        maxScore: z.coerce.number().positive().max(100).default(10),
      }),
    )
    .min(1)
    .max(20),
  isActive: z.boolean().optional().default(true),
});

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [[applications]] = await pool.query(
      `SELECT COUNT(*) AS total,
      COALESCE(SUM(status IN ('DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','DECISION_PENDING')), 0) AS underReview,
      COALESCE(SUM(status = 'DECISION_PENDING'), 0) AS awaitingDecision,
      COALESCE(SUM(status = 'ADMITTED'), 0) AS admitted
     FROM applications`,
    );
    const [[users]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE account_status = 'ACTIVE'",
    );
    const [[documents]] = await pool.query(
      "SELECT COUNT(*) AS pending FROM application_documents WHERE is_latest = 1 AND status = 'PENDING'",
    );
    return sendOk(res, {
      ...applications,
      activeUsers: users.total,
      pendingDocuments: documents.pending,
    });
  }),
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const search = `%${String(req.query.search || "").trim()}%`;
    const [rows] = await pool.execute(
      `SELECT u.id, u.public_id AS userId, u.full_name AS fullName, u.email,
            u.account_status AS accountStatus, u.created_at AS createdAt,
            r.code AS roleCode, r.label AS role, sp.department
     FROM users u JOIN roles r ON r.id = u.role_id
     LEFT JOIN staff_profiles sp ON sp.user_id = u.id
     WHERE (? = '%%' OR u.full_name LIKE ? OR u.email LIKE ? OR u.public_id LIKE ? OR sp.department LIKE ?)
     ORDER BY u.created_at DESC LIMIT 250`,
      [search, search, search, search, search],
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/users/:userId/programme-permissions",
  asyncHandler(async (req, res) => {
    const [targetRows] = await pool.execute(
      `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND r.code = 'ADMIN' LIMIT 1`,
      [req.params.userId],
    );
    if (!targetRows[0]) throw new HttpError(404, "Admin account not found.");
    const scope = await getAdminProgrammeScope(req.params.userId);
    const values = [];
    let where = "p.is_active = 1";
    if (!scope.allowAll) {
      if (!scope.programmeIds.length) {
        return sendOk(res, {
          accessMode: "SELECTED",
          allowAll: false,
          programmeIds: [],
          programmes: [],
        });
      }
      where += ` AND p.id IN (${scope.programmeIds.map(() => "?").join(",")})`;
      values.push(...scope.programmeIds);
    }
    const [programmes] = await pool.execute(
      `SELECT p.id, p.name, p.short_code AS shortCode
       FROM programmes p WHERE ${where} ORDER BY p.name`,
      values,
    );
    return sendOk(res, {
      accessMode: scope.accessMode,
      allowAll: scope.allowAll,
      programmeIds: scope.programmeIds,
      programmes,
    });
  }),
);

router.put(
  "/users/:userId/programme-permissions",
  validateBody(adminProgrammePermissionsSchema),
  asyncHandler(async (req, res) => {
    const [targetRows] = await pool.execute(
      `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND r.code = 'ADMIN' LIMIT 1`,
      [req.params.userId],
    );
    if (!targetRows[0]) throw new HttpError(404, "Admin account not found.");

    const allowAll = Boolean(req.body.allowAll);
    const programmeIds = [
      ...new Set((req.body.programmeIds || []).map(Number)),
    ];
    if (!allowAll && programmeIds.length === 0) {
      throw new HttpError(
        422,
        "Select at least one programme, or enable access to all active programmes.",
      );
    }
    if (!allowAll) {
      const placeholders = programmeIds.map(() => "?").join(",");
      const [validRows] = await pool.execute(
        `SELECT id FROM programmes WHERE is_active = 1 AND id IN (${placeholders})`,
        programmeIds,
      );
      if (validRows.length !== programmeIds.length) {
        throw new HttpError(
          422,
          "One or more selected programmes are unavailable or inactive.",
        );
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO admin_programme_access (admin_user_id, access_mode)
         VALUES (?, ?) ON DUPLICATE KEY UPDATE access_mode = VALUES(access_mode), updated_at = CURRENT_TIMESTAMP`,
        [req.params.userId, allowAll ? "ALL" : "SELECTED"],
      );
      await connection.execute(
        "DELETE FROM admin_programme_permissions WHERE admin_user_id = ?",
        [req.params.userId],
      );
      if (!allowAll) {
        for (const programmeId of programmeIds) {
          await connection.execute(
            "INSERT INTO admin_programme_permissions (admin_user_id, programme_id) VALUES (?, ?)",
            [req.params.userId, programmeId],
          );
        }
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "ADMIN_PROGRAMME_PERMISSIONS_UPDATED",
        entityType: "USER",
        entityId: req.params.userId,
        metadata: { allowAll, programmeIds: allowAll ? [] : programmeIds },
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        { updated: true, allowAll, programmeIds: allowAll ? [] : programmeIds },
        200,
        "Admin programme permissions updated.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/users",
  validateBody(userCreateSchema),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    const temporaryPassword = crypto.randomBytes(9).toString("base64url");
    try {
      await connection.beginTransaction();
      const [roles] = await connection.execute(
        "SELECT id FROM roles WHERE code = ?",
        [req.body.role],
      );
      if (!roles[0])
        throw new HttpError(422, "The selected role is not configured.");
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);
      const publicId = createPublicId();
      const [insert] = await connection.execute(
        `INSERT INTO users (public_id, role_id, full_name, email, password_hash, account_status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          publicId,
          roles[0].id,
          req.body.fullName,
          req.body.email,
          passwordHash,
        ],
      );
      if (req.body.role === "APPLICANT") {
        await connection.execute(
          "INSERT INTO applicant_profiles (user_id) VALUES (?)",
          [insert.insertId],
        );
      } else {
        await connection.execute(
          "INSERT INTO staff_profiles (user_id, department) VALUES (?, ?)",
          [insert.insertId, req.body.department || null],
        );
      }
      if (req.body.role === "ADMIN") {
        const programmeIds = [
          ...new Set((req.body.programmeIds || []).map(Number)),
        ];
        if (!programmeIds.length) {
          throw new HttpError(
            422,
            "Select at least one allowed programme for this Admin account.",
          );
        }
        const placeholders = programmeIds.map(() => "?").join(",");
        const [validProgrammes] = await connection.execute(
          `SELECT id FROM programmes WHERE is_active = 1 AND id IN (${placeholders})`,
          programmeIds,
        );
        if (validProgrammes.length !== programmeIds.length) {
          throw new HttpError(
            422,
            "One or more selected programmes are unavailable or inactive.",
          );
        }
        await connection.execute(
          "INSERT INTO admin_programme_access (admin_user_id, access_mode) VALUES (?, 'SELECTED')",
          [insert.insertId],
        );
        for (const programmeId of programmeIds) {
          await connection.execute(
            "INSERT INTO admin_programme_permissions (admin_user_id, programme_id) VALUES (?, ?)",
            [insert.insertId, programmeId],
          );
        }
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "USER_CREATED_BY_ADMIN",
        entityType: "USER",
        entityId: insert.insertId,
        metadata: { role: req.body.role, publicId },
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        {
          id: String(insert.insertId),
          userId: publicId,
          fullName: req.body.fullName,
          email: req.body.email,
          role: req.body.role,
          temporaryPassword,
          note: "Show this temporary password once and deliver it to the user through a secure channel.",
        },
        201,
        "User account created.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/users/:userId",
  validateBody(userUpdateSchema),
  asyncHandler(async (req, res) => {
    if (
      String(req.params.userId) === req.auth.userId &&
      req.body.accountStatus &&
      req.body.accountStatus !== "ACTIVE"
    ) {
      throw new HttpError(
        409,
        "You cannot deactivate your own administrator account.",
      );
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const fields = [];
      const values = [];
      if (req.body.role) {
        const [roles] = await connection.execute(
          "SELECT id FROM roles WHERE code = ?",
          [req.body.role],
        );
        if (!roles[0]) throw new HttpError(422, "Role not found.");
        fields.push("role_id = ?");
        values.push(roles[0].id);
      }
      if (req.body.accountStatus) {
        fields.push("account_status = ?");
        values.push(req.body.accountStatus);
      }
      if (!fields.length)
        throw new HttpError(422, "Provide a role or account status to update.");
      values.push(req.params.userId);
      const [result] = await connection.execute(
        `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
      );
      if (!result.affectedRows) throw new HttpError(404, "User not found.");
      if (req.body.role) {
        if (req.body.role === "APPLICANT") {
          await connection.execute(
            "INSERT INTO applicant_profiles (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)",
            [req.params.userId],
          );
        } else {
          await connection.execute(
            "INSERT INTO staff_profiles (user_id) VALUES (?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)",
            [req.params.userId],
          );
        }
        if (req.body.role === "ADMIN") {
          await connection.execute(
            "INSERT IGNORE INTO admin_programme_access (admin_user_id, access_mode) VALUES (?, 'SELECTED')",
            [req.params.userId],
          );
        } else {
          await connection.execute(
            "DELETE FROM admin_programme_access WHERE admin_user_id = ?",
            [req.params.userId],
          );
        }
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "USER_ACCOUNT_UPDATED",
        entityType: "USER",
        entityId: req.params.userId,
        metadata: req.body,
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(res, { updated: true }, 200, "User account updated.");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

// College management. College cutoffs are stored per college-programme offering,
// independently from the common programme eligibility rule.
router.get(
  "/college-management/allowed-programmes",
  asyncHandler(async (req, res) => {
    const scope = await getAdminProgrammeScope(req.auth.userId);
    const values = [];
    let where = "p.is_active = 1";
    if (!scope.allowAll) {
      if (!scope.programmeIds.length) {
        return sendOk(res, {
          accessMode: scope.accessMode,
          allowAll: false,
          programmeIds: [],
          programmes: [],
        });
      }
      where += ` AND p.id IN (${scope.programmeIds.map(() => "?").join(",")})`;
      values.push(...scope.programmeIds);
    }
    const [programmes] = await pool.execute(
      `SELECT p.id, p.name, p.short_code AS shortCode
       FROM programmes p WHERE ${where} ORDER BY p.name`,
      values,
    );
    return sendOk(res, {
      accessMode: scope.accessMode,
      allowAll: scope.allowAll,
      programmeIds: scope.programmeIds,
      programmes,
    });
  }),
);

router.get(
  "/college-directory/states",
  asyncHandler(async (_req, res) => {
    const states = await fetchCollegeDirectoryStates();
    return sendOk(res, {
      states,
      source: "AICTE-derived public institution directory",
    });
  }),
);

router.get(
  "/college-directory/states/:stateSlug",
  asyncHandler(async (req, res) => {
    const requestedState = String(req.params.stateSlug || "");
    const rows = await fetchCollegeDirectoryState(requestedState);
    const allowedProgrammes = await getAdminAllowedProgrammeRows(
      req.auth.userId,
    );

    const districts = [
      ...new Set(
        rows
          .map((row) =>
            String(
              row.city || row.town || row.district || row.district_name || "",
            ).trim(),
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));

    const colleges = rows
      .map((row) => {
        const directoryCourses = directoryProgrammeRows(row);
        const cityOrDistrict = String(
          row.city || row.town || row.district || row.district_name || "",
        ).trim();
        const matchedProgrammes = allowedProgrammes.flatMap((localProgramme) =>
          directoryProgrammeMatches(localProgramme, directoryCourses).map(
            (match) => ({
              programmeId: Number(localProgramme.id),
              programmeName: localProgramme.name,
              shortCode: localProgramme.shortCode,
              directoryCourse: match.directoryCourse,
              level: match.level,
              referenceIntake: match.intake,
            }),
          ),
        );
        const uniqueMatches = matchedProgrammes.filter(
          (item, index, all) =>
            all.findIndex(
              (candidate) => candidate.programmeId === item.programmeId,
            ) === index,
        );
        return {
          directoryInstitutionId: String(
            row.aicte_id || row.id || row.other_id || "",
          ).trim(),
          name: String(row.institute_name || row.name || "").trim(),
          state: String(row.state || requestedState).trim(),
          cityOrDistrict,
          district: String(
            row.district || row.district_name || cityOrDistrict,
          ).trim(),
          address: String(
            row.address ||
              [row.address_line1, row.address_line2]
                .filter(Boolean)
                .join(", ") ||
              "",
          ).trim(),
          university: String(row.university || "").trim(),
          institutionType: String(
            row.institution_type || row.institutionCategory || "",
          ).trim(),
          matchedProgrammes: uniqueMatches,
        };
      })
      .filter(
        (row) =>
          row.name &&
          row.directoryInstitutionId &&
          row.district &&
          row.matchedProgrammes.length,
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return sendOk(res, {
      source: "AICTE-derived public institution directory",
      state: requestedState,
      totalStateInstitutions: rows.length,
      matchedInstitutionCount: colleges.length,
      districts,
      colleges,
    });
  }),
);

router.get(
  "/college-management/locations",
  asyncHandler(async (_req, res) => {
    // Location choices are separate from course visibility: an Admin may
    // choose any city, but only permitted-course colleges are returned below.
    const [rows] = await pool.query(
      `SELECT DISTINCT state, city
       FROM colleges
       WHERE is_active = 1
         AND state IS NOT NULL AND TRIM(state) <> ''
         AND city IS NOT NULL AND TRIM(city) <> ''
       ORDER BY state, city`,
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/colleges",
  asyncHandler(async (req, res) => {
    const scope = await getAdminProgrammeScope(req.auth.userId);
    if (!scope.allowAll && !scope.programmeIds.length) return sendOk(res, []);

    const values = [];
    let permittedOfferingFilter = "";
    if (!scope.allowAll) {
      permittedOfferingFilter = ` AND cp.programme_id IN (${scope.programmeIds.map(() => "?").join(",")})`;
      values.push(...scope.programmeIds);
    }

    // A college is visible only when it has at least one ACTIVE offering
    // for a programme this Admin is allowed to manage. No empty/unconfigured
    // colleges and no medical-only/other-course institutions leak into the list.
    const [rows] = await pool.execute(
      `SELECT c.id, c.code, c.name, c.address, c.city, c.state, c.description,
              c.is_active AS isActive, c.created_at AS createdAt,
              COUNT(DISTINCT cp.id) AS programmeCount,
              GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ' · ') AS matchedProgrammes,
              GROUP_CONCAT(DISTINCT p.id ORDER BY p.name SEPARATOR ',') AS matchedProgrammeIds
       FROM colleges c
       JOIN college_programmes cp
         ON cp.college_id = c.id AND cp.is_active = 1
       JOIN programmes p
         ON p.id = cp.programme_id AND p.is_active = 1
       WHERE 1 = 1 ${permittedOfferingFilter}
       GROUP BY c.id
       ORDER BY c.state, c.city, c.name`,
      values,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/colleges",
  validateBody(collegeCreateSchema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await assertAdminProgrammeAccess(
        req.auth.userId,
        b.initialOffering.programmeId,
        connection,
      );
      const [programmes] = await connection.execute(
        "SELECT id FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
        [b.initialOffering.programmeId],
      );
      if (!programmes[0])
        throw new HttpError(
          422,
          "Choose an active programme that this Admin is permitted to manage.",
        );

      if (b.directoryInstitutionId) {
        await assertDirectoryInstitutionOffersProgramme({
          state: b.state,
          institutionId: b.directoryInstitutionId,
          programmeId: b.initialOffering.programmeId,
          executor: connection,
        });
      }

      // Prevent the same directory institution from being registered twice.
      const [existingColleges] = await connection.execute(
        `SELECT id FROM colleges
         WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
           AND LOWER(TRIM(COALESCE(city, ''))) = LOWER(TRIM(COALESCE(?, '')))
           AND LOWER(TRIM(COALESCE(state, ''))) = LOWER(TRIM(COALESCE(?, '')))
         LIMIT 1 FOR UPDATE`,
        [b.name, b.city || "", b.state || ""],
      );

      let collegeId;
      let created = false;
      if (existingColleges[0]) {
        collegeId = Number(existingColleges[0].id);
      } else {
        const generatedCode = b.directoryInstitutionId
          ? `AICTE-${String(b.directoryInstitutionId)
              .replace(/[^A-Za-z0-9]/g, "")
              .slice(0, 30)}`
          : b.code ||
            `COL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const [collegeResult] = await connection.execute(
          `INSERT INTO colleges (code, name, address, city, state, description, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            generatedCode,
            b.name,
            b.address || null,
            b.city || null,
            b.state || null,
            b.description || null,
            b.isActive ? 1 : 0,
          ],
        );
        collegeId = Number(collegeResult.insertId);
        created = true;
      }

      const [existingOffering] = await connection.execute(
        "SELECT id FROM college_programmes WHERE college_id = ? AND programme_id = ? LIMIT 1 FOR UPDATE",
        [collegeId, b.initialOffering.programmeId],
      );
      let offeringId = existingOffering[0]
        ? Number(existingOffering[0].id)
        : null;
      if (!offeringId) {
        const [offeringResult] = await connection.execute(
          `INSERT INTO college_programmes
           (college_id, programme_id, minimum_percentage, intake_capacity, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [
            collegeId,
            b.initialOffering.programmeId,
            b.initialOffering.minimumPercentage,
            b.initialOffering.intakeCapacity ?? null,
            b.initialOffering.isActive ? 1 : 0,
          ],
        );
        offeringId = Number(offeringResult.insertId);
      }

      if (created) {
        await writeAudit(connection, {
          actorUserId: req.auth.userId,
          action: "COLLEGE_CREATED_WITH_INITIAL_PROGRAMME",
          entityType: "COLLEGE",
          entityId: collegeId,
          metadata: {
            name: b.name,
            city: b.city,
            state: b.state,
            directoryInstitutionId: b.directoryInstitutionId || null,
            programmeId: b.initialOffering.programmeId,
            minimumPercentage: b.initialOffering.minimumPercentage,
            intakeCapacity: b.initialOffering.intakeCapacity ?? null,
          },
          ipAddress: req.ip,
        });
      }
      await connection.commit();
      return sendOk(
        res,
        {
          id: collegeId,
          offeringId,
          existing: !created,
          directoryInstitutionId: b.directoryInstitutionId || null,
        },
        created ? 201 : 200,
        created
          ? "College and its verified programme offering created."
          : "This college was already registered; its verified programme offering is available.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/colleges/:collegeId",
  validateBody(collegeSchema.partial()),
  asyncHandler(async (req, res) => {
    const columns = {
      code: "code",
      name: "name",
      address: "address",
      city: "city",
      state: "state",
      description: "description",
      isActive: "is_active",
    };
    const sets = [];
    const values = [];
    for (const [key, column] of Object.entries(columns)) {
      if (req.body[key] !== undefined) {
        sets.push(`${column} = ?`);
        values.push(
          key === "isActive" ? (req.body[key] ? 1 : 0) : req.body[key],
        );
      }
    }
    if (!sets.length)
      throw new HttpError(422, "No college fields were supplied.");
    values.push(req.params.collegeId);
    const [result] = await pool.execute(
      `UPDATE colleges SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
    );
    if (!result.affectedRows) throw new HttpError(404, "College not found.");
    await writeAudit(pool, {
      actorUserId: req.auth.userId,
      action: "COLLEGE_UPDATED",
      entityType: "COLLEGE",
      entityId: req.params.collegeId,
      metadata: req.body,
      ipAddress: req.ip,
    });
    return sendOk(res, { updated: true }, 200, "College updated.");
  }),
);

router.get(
  "/college-programmes",
  asyncHandler(async (req, res) => {
    const collegeId = req.query.collegeId ? Number(req.query.collegeId) : null;
    const values = [];
    let where = "1 = 1";
    if (collegeId) {
      where += " AND cp.college_id = ?";
      values.push(collegeId);
    }
    const programmeScope = await getAdminProgrammeScope(req.auth.userId);
    if (!programmeScope.allowAll) {
      if (!programmeScope.programmeIds.length) return sendOk(res, []);
      where += ` AND cp.programme_id IN (${programmeScope.programmeIds.map(() => "?").join(",")})`;
      values.push(...programmeScope.programmeIds);
    }
    const [rows] = await pool.execute(
      `SELECT cp.id, cp.college_id AS collegeId, c.name AS collegeName,
              cp.programme_id AS programmeId, p.name AS programmeName,
              p.short_code AS programmeShortCode,
              cp.minimum_percentage AS minimumPercentage,
              cp.intake_capacity AS intakeCapacity,
              CASE WHEN cp.intake_capacity IS NULL THEN NULL ELSE GREATEST(
                cp.intake_capacity - (SELECT COUNT(*) FROM application_college_preferences admitted
                  WHERE admitted.college_programme_id = cp.id
                    AND admitted.final_decision = 'ADMITTED'
                    AND EXISTS (
                      SELECT 1 FROM applications counted_app
                      WHERE counted_app.id = admitted.application_id
                        AND counted_app.admission_cycle_id = (
                          SELECT active_cycle.id FROM admission_cycles active_cycle
                          WHERE active_cycle.is_active = 1
                            AND active_cycle.start_date <= CURDATE()
                            AND active_cycle.end_date >= CURDATE()
                          ORDER BY active_cycle.start_date DESC LIMIT 1
                        )
                    )), 0
              ) END AS seatsAvailable,
              cp.is_active AS isActive
       FROM college_programmes cp
       JOIN colleges c ON c.id = cp.college_id
       JOIN programmes p ON p.id = cp.programme_id
       WHERE ${where}
       ORDER BY c.name, p.name`,
      values,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/college-programmes",
  validateBody(collegeOfferingSchema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    await assertAdminProgrammeAccess(req.auth.userId, b.programmeId);
    const [colleges] = await pool.execute(
      "SELECT id, code, state FROM colleges WHERE id = ? AND is_active = 1 LIMIT 1",
      [b.collegeId],
    );
    if (!colleges[0]) throw new HttpError(422, "Choose an active college.");
    const [programmes] = await pool.execute(
      "SELECT id, name, short_code AS shortCode FROM programmes WHERE id = ? AND is_active = 1 LIMIT 1",
      [b.programmeId],
    );
    if (!programmes[0]) throw new HttpError(422, "Choose an active programme.");
    if (String(colleges[0].code || "").startsWith("AICTE-")) {
      const directoryInstitutionId = String(colleges[0].code).slice(
        "AICTE-".length,
      );
      await assertDirectoryInstitutionOffersProgramme({
        state: colleges[0].state,
        institutionId: directoryInstitutionId,
        programmeId: b.programmeId,
        executor: pool,
      });
    }
    const [result] = await pool.execute(
      `INSERT INTO college_programmes
       (college_id, programme_id, minimum_percentage, intake_capacity, is_active)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE minimum_percentage = VALUES(minimum_percentage),
         intake_capacity = VALUES(intake_capacity), is_active = VALUES(is_active),
         updated_at = CURRENT_TIMESTAMP`,
      [
        b.collegeId,
        b.programmeId,
        b.minimumPercentage,
        b.intakeCapacity ?? null,
        b.isActive ? 1 : 0,
      ],
    );
    const [rows] = await pool.execute(
      "SELECT id FROM college_programmes WHERE college_id = ? AND programme_id = ? LIMIT 1",
      [b.collegeId, b.programmeId],
    );
    await writeAudit(pool, {
      actorUserId: req.auth.userId,
      action:
        result.affectedRows === 1
          ? "COLLEGE_PROGRAMME_CREATED"
          : "COLLEGE_PROGRAMME_UPDATED",
      entityType: "COLLEGE_PROGRAMME",
      entityId: rows[0].id,
      metadata: b,
      ipAddress: req.ip,
    });
    return sendOk(
      res,
      { id: rows[0].id },
      201,
      "College programme offering saved.",
    );
  }),
);

router.patch(
  "/college-programmes/:offeringId",
  validateBody(
    z.object({
      minimumPercentage: z.coerce.number().min(0).max(100).optional(),
      intakeCapacity: z.coerce.number().int().positive().nullable().optional(),
      isActive: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const [offeringRows] = await pool.execute(
      "SELECT programme_id AS programmeId FROM college_programmes WHERE id = ? LIMIT 1",
      [req.params.offeringId],
    );
    if (!offeringRows[0])
      throw new HttpError(404, "College programme offering not found.");
    await assertAdminProgrammeAccess(
      req.auth.userId,
      offeringRows[0].programmeId,
    );
    const columns = {
      minimumPercentage: "minimum_percentage",
      intakeCapacity: "intake_capacity",
      isActive: "is_active",
    };
    const sets = [];
    const values = [];
    for (const [key, column] of Object.entries(columns)) {
      if (req.body[key] !== undefined) {
        sets.push(`${column} = ?`);
        values.push(
          key === "isActive" ? (req.body[key] ? 1 : 0) : req.body[key],
        );
      }
    }
    if (!sets.length)
      throw new HttpError(422, "No college programme fields were supplied.");
    values.push(req.params.offeringId);
    const [result] = await pool.execute(
      `UPDATE college_programmes SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
    );
    if (!result.affectedRows)
      throw new HttpError(404, "College programme offering not found.");
    await writeAudit(pool, {
      actorUserId: req.auth.userId,
      action: "COLLEGE_PROGRAMME_UPDATED",
      entityType: "COLLEGE_PROGRAMME",
      entityId: req.params.offeringId,
      metadata: req.body,
      ipAddress: req.ip,
    });
    return sendOk(
      res,
      { updated: true },
      200,
      "College programme offering updated.",
    );
  }),
);

router.get(
  "/programmes",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      `SELECT id, code, name, short_code AS shortCode, category, level, duration, description,
            department, intake_capacity AS intakeCapacity, is_active AS isActive
     FROM programmes ORDER BY category, name`,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/programmes",
  validateBody(programmeSchema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO programmes (code, name, short_code, category, level, duration, description, department, intake_capacity, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.code,
          b.name,
          b.shortCode,
          b.category,
          b.level,
          b.duration,
          b.description,
          b.department || null,
          b.intakeCapacity ?? null,
          b.isActive ? 1 : 0,
        ],
      );
      // New programmes inherit the common mandatory documents specified in the
      // CrediFit requirements; postgraduate programmes also require a degree certificate.
      const defaultDocumentRequirements = [
        {
          name: "10th Standard Marks Card",
          qualification: "*",
        },
        {
          name: "12th / PUC Marks Card",
          qualification: "*",
        },
        {
          name: "Leaving Certificate",
          qualification: "*",
        },
        ...(String(b.level).toLowerCase() === "postgraduate"
          ? [
              {
                name: "Degree Certificate",
                qualification: "degree",
              },
            ]
          : []),
      ];

      for (const [
        index,
        requirement,
      ] of defaultDocumentRequirements.entries()) {
        const [types] = await connection.execute(
          "SELECT id FROM document_types WHERE name = ? LIMIT 1",
          [requirement.name],
        );

        if (!types[0]) {
          throw new HttpError(
            500,
            `Document reference data is missing: ${requirement.name}`,
          );
        }

        await connection.execute(
          `INSERT INTO programme_document_requirements
     (programme_id, document_type_id, qualification,
      is_mandatory, is_active, display_order)
     VALUES (?, ?, ?, 1, 1, ?)`,
          [result.insertId, types[0].id, requirement.qualification, index + 1],
        );
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "PROGRAMME_CREATED",
        entityType: "PROGRAMME",
        entityId: result.insertId,
        metadata: {
          code: b.code,
          name: b.name,
          defaultDocuments: defaultDocumentRequirements,
        },
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(res, { id: result.insertId }, 201, "Programme created.");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/programmes/:programmeId",
  validateBody(programmeSchema.partial()),
  asyncHandler(async (req, res) => {
    const columns = {
      code: "code",
      name: "name",
      shortCode: "short_code",
      category: "category",
      level: "level",
      duration: "duration",
      description: "description",
      department: "department",
      intakeCapacity: "intake_capacity",
      isActive: "is_active",
    };
    const sets = [];
    const values = [];
    for (const [key, column] of Object.entries(columns)) {
      if (req.body[key] !== undefined) {
        sets.push(`${column} = ?`);
        values.push(
          key === "isActive" ? (req.body[key] ? 1 : 0) : req.body[key],
        );
      }
    }
    if (!sets.length)
      throw new HttpError(422, "No programme fields were supplied.");
    values.push(req.params.programmeId);
    const [result] = await pool.execute(
      `UPDATE programmes SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
    );
    if (!result.affectedRows) throw new HttpError(404, "Programme not found.");
    await pool.execute(
      "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, 'PROGRAMME_UPDATED', 'PROGRAMME', ?, ?, ?)",
      [
        req.auth.userId,
        req.params.programmeId,
        JSON.stringify(req.body),
        req.ip,
      ],
    );
    return sendOk(res, { updated: true }, 200, "Programme updated.");
  }),
);

router.get(
  "/eligibility-rules",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      `SELECT er.id, er.programme_id AS programmeId, p.name AS programme,
            er.qualification, er.minimum_percentage AS minimumPercentage,
            er.required_documents AS requiredDocuments, er.optional_documents AS optionalDocuments,
            er.remarks, er.is_active AS isActive, er.created_at AS createdAt
     FROM eligibility_rules er JOIN programmes p ON p.id = er.programme_id
     ORDER BY p.name, er.qualification`,
    );
    return sendOk(
      res,
      rows.map((row) => ({
        ...row,
        qualificationCode: row.qualification,
        qualification: qualificationLabel(row.qualification),
        requiredDocuments: Array.isArray(row.requiredDocuments)
          ? row.requiredDocuments
          : JSON.parse(row.requiredDocuments || "[]"),
        optionalDocuments: Array.isArray(row.optionalDocuments)
          ? row.optionalDocuments
          : JSON.parse(row.optionalDocuments || "[]"),
      })),
    );
  }),
);

router.post(
  "/eligibility-rules",
  validateBody(eligibilityRuleSchema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    let programmeId = b.programmeId;
    if (!programmeId && b.programme) {
      const [programmes] = await pool.execute(
        "SELECT id FROM programmes WHERE LOWER(name) = LOWER(?) LIMIT 1",
        [b.programme],
      );
      programmeId = programmes[0]?.id;
    }
    if (!programmeId)
      throw new HttpError(
        422,
        "Choose a valid programme from the programme catalogue.",
      );

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [programme] = await connection.execute(
        "SELECT id, level FROM programmes WHERE id = ?",
        [programmeId],
      );

      if (!programme[0]) throw new HttpError(404, "Programme not found.");

      const isDegreeCertificate = (name) =>
        String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .startsWith("degree");

      const requiresDegreeCertificate =
        String(programme[0].level).toLowerCase() === "postgraduate" &&
        String(b.qualification).toLowerCase() === "degree";

      const requiredDocuments = b.requiredDocuments
        .map(canonicalDocumentName)
        .filter(
          (name) => !isDegreeCertificate(name) || requiresDegreeCertificate,
        );

      if (
        requiresDegreeCertificate &&
        !requiredDocuments.some(isDegreeCertificate)
      ) {
        requiredDocuments.push("Degree Certificate");
      }

      const optionalDocuments = b.optionalDocuments
        .map(canonicalDocumentName)
        .filter((name) => !isDegreeCertificate(name));
      const [insert] = await connection.execute(
        `INSERT INTO eligibility_rules
       (programme_id, qualification, minimum_percentage, required_documents, optional_documents, remarks, is_active, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE minimum_percentage = VALUES(minimum_percentage),
         required_documents = VALUES(required_documents), optional_documents = VALUES(optional_documents),
         remarks = VALUES(remarks), is_active = VALUES(is_active), updated_at = CURRENT_TIMESTAMP`,
        [
          programmeId,
          b.qualification,
          b.minimumPercentage,
          JSON.stringify(requiredDocuments),
          JSON.stringify(optionalDocuments),
          b.remarks || null,
          b.isActive ? 1 : 0,
          req.auth.userId,
        ],
      );
      const [ruleRows] = await connection.execute(
        "SELECT id FROM eligibility_rules WHERE programme_id = ? AND LOWER(qualification) = LOWER(?)",
        [programmeId, b.qualification],
      );
      const ruleId = ruleRows[0].id;

      await connection.execute(
        "UPDATE programme_document_requirements SET is_active = 0 WHERE programme_id = ? AND LOWER(qualification) = LOWER(?)",
        [programmeId, b.qualification],
      );
      for (const [index, name] of requiredDocuments.entries()) {
        const [types] = await connection.execute(
          "SELECT id FROM document_types WHERE LOWER(name) = LOWER(?) LIMIT 1",
          [name],
        );
        if (!types[0])
          throw new HttpError(422, `Document type is not configured: ${name}`);
        await connection.execute(
          `INSERT INTO programme_document_requirements (programme_id, document_type_id, qualification, is_mandatory, is_active, display_order)
         VALUES (?, ?, ?, 1, 1, ?)
         ON DUPLICATE KEY UPDATE is_mandatory = 1, is_active = 1, display_order = VALUES(display_order)`,
          [programmeId, types[0].id, b.qualification, index + 1],
        );
      }
      for (const [index, name] of optionalDocuments.entries()) {
        const [types] = await connection.execute(
          "SELECT id FROM document_types WHERE LOWER(name) = LOWER(?) LIMIT 1",
          [name],
        );
        if (!types[0])
          throw new HttpError(422, `Document type is not configured: ${name}`);
        await connection.execute(
          `INSERT INTO programme_document_requirements (programme_id, document_type_id, qualification, is_mandatory, is_active, display_order)
         VALUES (?, ?, ?, 0, 1, ?)
         ON DUPLICATE KEY UPDATE is_mandatory = 0, is_active = 1, display_order = VALUES(display_order)`,
          [programmeId, types[0].id, b.qualification, 100 + index],
        );
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action:
          insert.affectedRows === 1
            ? "ELIGIBILITY_RULE_CREATED"
            : "ELIGIBILITY_RULE_UPDATED",
        entityType: "ELIGIBILITY_RULE",
        entityId: ruleId,
        metadata: b,
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(res, { id: ruleId }, 201, "Eligibility rule saved.");
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/eligibility-rules/:ruleId/status",
  validateBody(z.object({ isActive: z.boolean() })),
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute(
      "UPDATE eligibility_rules SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.body.isActive ? 1 : 0, req.params.ruleId],
    );
    if (!result.affectedRows)
      throw new HttpError(404, "Eligibility rule not found.");
    await pool.execute(
      "INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, 'ELIGIBILITY_RULE_STATUS_CHANGED', 'ELIGIBILITY_RULE', ?, ?, ?)",
      [req.auth.userId, req.params.ruleId, JSON.stringify(req.body), req.ip],
    );
    return sendOk(res, { updated: true });
  }),
);

router.get(
  "/rubrics",
  asyncHandler(async (_req, res) => {
    const [rubrics] = await pool.query(
      `SELECT r.id, r.name, r.programme_id AS programmeId, p.name AS programme,
            r.is_active AS isActive, r.created_at AS createdAt
     FROM evaluation_rubrics r LEFT JOIN programmes p ON p.id = r.programme_id
     ORDER BY r.created_at DESC`,
    );
    for (const rubric of rubrics) {
      const [criteria] = await pool.execute(
        `SELECT id, name, description, weight, max_score AS maxScore, display_order AS displayOrder
       FROM rubric_criteria WHERE rubric_id = ? AND is_active = 1 ORDER BY display_order, id`,
        [rubric.id],
      );
      rubric.criteria = criteria;
    }
    return sendOk(res, rubrics);
  }),
);

router.post(
  "/rubrics",
  validateBody(rubricSchema),
  asyncHandler(async (req, res) => {
    const totalWeight = req.body.criteria.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    if (Math.abs(totalWeight - 100) > 0.01)
      throw new HttpError(
        422,
        "The total weight of all rubric criteria must equal 100%.",
      );
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [insert] = await connection.execute(
        "INSERT INTO evaluation_rubrics (name, programme_id, is_active, created_by_user_id) VALUES (?, ?, ?, ?)",
        [
          req.body.name,
          req.body.programmeId ?? null,
          req.body.isActive ? 1 : 0,
          req.auth.userId,
        ],
      );
      for (const [index, criterion] of req.body.criteria.entries()) {
        await connection.execute(
          `INSERT INTO rubric_criteria (rubric_id, name, description, weight, max_score, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            insert.insertId,
            criterion.name,
            criterion.description || null,
            criterion.weight,
            criterion.maxScore,
            index + 1,
          ],
        );
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "EVALUATION_RUBRIC_CREATED",
        entityType: "EVALUATION_RUBRIC",
        entityId: insert.insertId,
        metadata: { name: req.body.name, totalWeight },
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        { id: insert.insertId },
        201,
        "Evaluation rubric created.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.post(
  "/applications/:applicationId/assign-evaluator",
  validateBody(
    z.object({
      evaluatorUserId: z.coerce.number().int().positive(),
      collegePreferenceId: z.coerce.number().int().positive().optional(),
      dueDate: z.string().date().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [applications] = await connection.execute(
        "SELECT id, applicant_id, status, selected_college_preference_id FROM applications WHERE id = ? FOR UPDATE",
        [req.params.applicationId],
      );
      const application = applications[0];
      if (!application) throw new HttpError(404, "Application not found.");
      if (application.status !== "DEPARTMENT_REVIEW")
        throw new HttpError(
          409,
          "Only eligible applications at Department Review can be assigned.",
        );
      const collegePreferenceId =
        req.body.collegePreferenceId ||
        application.selected_college_preference_id ||
        null;
      if (
        application.selected_college_preference_id &&
        String(collegePreferenceId) !==
          String(application.selected_college_preference_id)
      ) {
        throw new HttpError(
          409,
          "Assign the evaluator to the currently selected college preference.",
        );
      }
      if (collegePreferenceId) {
        const [preferences] = await connection.execute(
          `SELECT id FROM application_college_preferences
           WHERE id = ? AND application_id = ? AND overall_eligibility_status = 'ELIGIBLE' LIMIT 1 FOR UPDATE`,
          [collegePreferenceId, application.id],
        );
        if (!preferences[0])
          throw new HttpError(
            409,
            "The selected college preference has not passed eligibility screening.",
          );
      }
      const [evaluators] = await connection.execute(
        `SELECT u.id, u.full_name FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.id = ? AND r.code = 'EVALUATOR' AND u.account_status = 'ACTIVE' LIMIT 1`,
        [req.body.evaluatorUserId],
      );
      if (!evaluators[0])
        throw new HttpError(422, "Choose an active Evaluator account.");
      const [insert] = await connection.execute(
        `INSERT INTO evaluator_assignments
         (application_id, evaluator_user_id, assigned_by_user_id, due_date, is_active, college_preference_id)
       VALUES (?, ?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE assigned_by_user_id = VALUES(assigned_by_user_id),
         due_date = VALUES(due_date), is_active = 1`,
        [
          application.id,
          req.body.evaluatorUserId,
          req.auth.userId,
          req.body.dueDate || null,
          collegePreferenceId,
        ],
      );
      if (collegePreferenceId) {
        await connection.execute(
          "UPDATE application_college_preferences SET review_status = 'IN_REVIEW', is_current = 1 WHERE id = ? AND application_id = ?",
          [collegePreferenceId, application.id],
        );
      }
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "EVALUATOR_ASSIGNED",
        entityType: "APPLICATION",
        entityId: application.id,
        metadata: {
          evaluatorUserId: req.body.evaluatorUserId,
          dueDate: req.body.dueDate || null,
        },
        ipAddress: req.ip,
      });
      await notifyUser(connection, {
        recipientUserId: evaluators[0].id,
        actorUserId: req.auth.userId,
        title: "New application assigned",
        message: `An application has been assigned to you for department review.`,
        type: "REVIEW",
        applicationId: application.id,
        route: "/evaluator/dashboard",
      });
      await connection.commit();
      return sendOk(
        res,
        {
          assignmentId: insert.insertId || null,
          evaluator: evaluators[0].full_name,
        },
        201,
        "Evaluator assigned.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/admission-cycles",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      `SELECT id, name, start_date AS startDate, end_date AS endDate,
            is_active AS isActive, created_at AS createdAt
     FROM admission_cycles ORDER BY start_date DESC`,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/admission-cycles",
  validateBody(
    z.object({
      name: z.string().trim().min(2).max(120),
      startDate: z.string().date(),
      endDate: z.string().date(),
      isActive: z.boolean().default(false),
    }),
  ),
  asyncHandler(async (req, res) => {
    if (req.body.endDate < req.body.startDate)
      throw new HttpError(422, "The end date must be after the start date.");
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (req.body.isActive)
        await connection.query("UPDATE admission_cycles SET is_active = 0");
      const [insert] = await connection.execute(
        "INSERT INTO admission_cycles (name, start_date, end_date, is_active, created_by_user_id) VALUES (?, ?, ?, ?, ?)",
        [
          req.body.name,
          req.body.startDate,
          req.body.endDate,
          req.body.isActive ? 1 : 0,
          req.auth.userId,
        ],
      );
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "ADMISSION_CYCLE_CREATED",
        entityType: "ADMISSION_CYCLE",
        entityId: insert.insertId,
        metadata: req.body,
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        { id: insert.insertId },
        201,
        "Admission cycle created.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.patch(
  "/admission-cycles/:cycleId/activate",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [cycles] = await connection.execute(
        "SELECT id FROM admission_cycles WHERE id = ? FOR UPDATE",
        [req.params.cycleId],
      );
      if (!cycles[0]) throw new HttpError(404, "Admission cycle not found.");
      await connection.query("UPDATE admission_cycles SET is_active = 0");
      await connection.execute(
        "UPDATE admission_cycles SET is_active = 1 WHERE id = ?",
        [req.params.cycleId],
      );
      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "ADMISSION_CYCLE_ACTIVATED",
        entityType: "ADMISSION_CYCLE",
        entityId: req.params.cycleId,
        ipAddress: req.ip,
      });
      await connection.commit();
      return sendOk(
        res,
        { activeCycleId: Number(req.params.cycleId) },
        200,
        "Admission cycle activated.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.delete(
  "/admission-cycles/:cycleId",
  asyncHandler(async (req, res) => {
    const cycleId = Number(req.params.cycleId);

    if (!Number.isSafeInteger(cycleId) || cycleId <= 0) {
      throw new HttpError(400, "Invalid admission cycle ID.");
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [cycles] = await connection.execute(
        `SELECT id, name, is_active AS isActive
       FROM admission_cycles
       WHERE id = ?
       FOR UPDATE`,
        [cycleId],
      );

      const cycle = cycles[0];

      if (!cycle) {
        throw new HttpError(404, "Admission cycle not found.");
      }

      if (Number(cycle.isActive) === 1) {
        throw new HttpError(
          409,
          "The active admission cycle cannot be deleted. Activate another cycle first.",
        );
      }

      const [[usage]] = await connection.execute(
        "SELECT COUNT(*) AS applicationCount FROM applications WHERE admission_cycle_id = ?",
        [cycleId],
      );

      if (Number(usage.applicationCount) > 0) {
        throw new HttpError(
          409,
          `This cycle is linked to ${usage.applicationCount} application(s) and cannot be deleted. Keep it inactive to preserve application history.`,
        );
      }

      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: "ADMISSION_CYCLE_DELETED",
        entityType: "ADMISSION_CYCLE",
        entityId: String(cycleId),
        metadata: { name: cycle.name },
        ipAddress: req.ip,
      });

      await connection.execute("DELETE FROM admission_cycles WHERE id = ?", [
        cycleId,
      ]);

      await connection.commit();

      return sendOk(
        res,
        { deletedId: cycleId },
        200,
        "Admission cycle deleted.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

router.get(
  "/applications",
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();
    const search = `%${String(req.query.search || "").trim()}%`;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const [rows] = await pool.execute(
      `SELECT a.id, a.application_number AS applicationNumber, a.status,
            a.current_stage_code AS currentStage, a.qualification,
            a.submitted_at AS submittedAt, a.created_at AS createdAt,
            u.public_id AS applicantUserId, u.full_name AS applicantName, u.email AS applicantEmail,
            p.id AS programmeId, p.name AS programmeName, p.short_code AS programmeShortCode,
            p.department AS departmentName, c.name AS admissionCycle,
            selected_college.name AS collegeName,
            selected_pref.preference_order AS collegePreferenceOrder
     FROM applications a
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     JOIN admission_cycles c ON c.id = a.admission_cycle_id
     LEFT JOIN application_college_preferences selected_pref ON selected_pref.id = a.selected_college_preference_id
     LEFT JOIN college_programmes selected_offering ON selected_offering.id = selected_pref.college_programme_id
     LEFT JOIN colleges selected_college ON selected_college.id = selected_offering.college_id
     WHERE (? = '' OR a.status = ?)
       AND (? = '%%' OR a.application_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR p.name LIKE ?)
     ORDER BY a.created_at DESC LIMIT ${limit}`,
      [status, status, search, search, search, search, search],
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/documents",
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();
    const search = `%${String(req.query.search || "").trim()}%`;
    const limit = Math.min(Math.max(Number(req.query.limit) || 150, 1), 300);
    const [rows] = await pool.execute(
      `SELECT ad.id, ad.application_id AS applicationId,
            a.application_number AS applicationNumber, a.status AS applicationStatus,
            u.full_name AS applicantName, u.email AS applicantEmail,
            p.name AS programmeName, dt.name AS documentType,
            ad.original_filename AS fileName, ad.mime_type AS mimeType,
            ad.size_bytes AS sizeBytes, ad.status, ad.version_number AS version,
            ad.is_latest AS isLatest, ad.uploaded_at AS uploadedAt,
            dr.reason AS latestReason, dr.notes AS latestNotes,
            reviewer.full_name AS reviewedBy, dr.reviewed_at AS reviewedAt
     FROM application_documents ad
     JOIN applications a ON a.id = ad.application_id
     JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     JOIN document_types dt ON dt.id = ad.document_type_id
     LEFT JOIN document_reviews dr ON dr.id = (
       SELECT MAX(dr2.id) FROM document_reviews dr2 WHERE dr2.application_document_id = ad.id
     )
     LEFT JOIN users reviewer ON reviewer.id = dr.reviewer_user_id
     WHERE ad.is_latest = 1
       AND (? = '' OR ad.status = ?)
       AND (? = '%%' OR a.application_number LIKE ? OR u.full_name LIKE ? OR dt.name LIKE ? OR ad.original_filename LIKE ?)
     ORDER BY ad.uploaded_at DESC LIMIT ${limit}`,
      [status, status, search, search, search, search, search],
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/reports",
  asyncHandler(async (_req, res) => {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS totalApplications,
            COALESCE(SUM(status IN ('DRAFT','SUBMITTED','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','DECISION_PENDING')), 0) AS inProgress,
            COALESCE(SUM(status = 'ADMITTED'), 0) AS admitted,
            COALESCE(SUM(status = 'REJECTED'), 0) AS rejected,
            COALESCE(SUM(status = 'WAITLISTED'), 0) AS waitlisted
     FROM applications`,
    );
    const [[documentTotals]] = await pool.query(
      `SELECT COUNT(*) AS totalDocuments,
            COALESCE(SUM(is_latest = 1 AND status = 'PENDING'), 0) AS pendingDocuments,
            COALESCE(SUM(is_latest = 1 AND status = 'VERIFIED'), 0) AS verifiedDocuments,
            COALESCE(SUM(is_latest = 1 AND status = 'CLARIFICATION_REQUESTED'), 0) AS clarificationDocuments,
            COALESCE(SUM(is_latest = 1 AND status = 'REJECTED'), 0) AS rejectedDocuments
     FROM application_documents`,
    );
    const [byStage] = await pool.query(
      `SELECT current_stage_code AS stage, COUNT(*) AS count
     FROM applications GROUP BY current_stage_code ORDER BY FIELD(current_stage_code,
       'APPLICATION_SUBMISSION','DOCUMENT_VERIFICATION','ELIGIBILITY_SCREENING','DEPARTMENT_REVIEW','FINAL_ADMISSION_DECISION')`,
    );
    const [byProgramme] = await pool.query(
      `SELECT p.id AS programmeId, p.name AS programmeName, COUNT(a.id) AS applications,
            COALESCE(SUM(a.status = 'ADMITTED'), 0) AS admitted,
            COALESCE(SUM(a.status = 'REJECTED'), 0) AS rejected
     FROM programmes p LEFT JOIN applications a ON a.programme_id = p.id
     GROUP BY p.id ORDER BY applications DESC, p.name ASC LIMIT 20`,
    );
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS applications
     FROM applications WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 11 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`,
    );
    return sendOk(res, {
      totals,
      documents: documentTotals,
      byStage,
      byProgramme,
      monthly,
    });
  }),
);

router.get(
  "/audit-logs",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const [rows] = await pool.execute(
      `SELECT al.id, al.action, al.entity_type AS entityType, al.entity_id AS entityId,
            al.metadata, al.ip_address AS ipAddress, al.created_at AS createdAt,
            u.full_name AS actorName, u.public_id AS actorUserId
     FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_user_id
     ORDER BY al.created_at DESC LIMIT ${limit}`,
    );
    return sendOk(res, rows);
  }),
);

router.get(
  "/final-decisions",
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      `SELECT a.id, a.application_number AS applicationNumber, a.status,
            u.full_name AS applicantName, u.email AS applicantEmail,
            p.name AS programmeName, c.name AS collegeName,
            dr.recommendation, dr.remarks AS evaluatorRemarks, dr.submitted_at AS reviewedAt,
            fd.outcome AS decision, fd.remarks AS decisionRemarks, fd.decided_at AS decidedAt
     FROM applications a JOIN users u ON u.id = a.applicant_id
     JOIN programmes p ON p.id = a.programme_id
     LEFT JOIN application_college_preferences selected_cp ON selected_cp.id = a.selected_college_preference_id
     LEFT JOIN college_programmes cprog ON cprog.id = selected_cp.college_programme_id
     LEFT JOIN colleges c ON c.id = cprog.college_id
     LEFT JOIN department_reviews dr ON dr.id = (
       SELECT MAX(dr2.id) FROM department_reviews dr2
       WHERE dr2.application_id = a.id AND dr2.status = 'SUBMITTED'
     )
     LEFT JOIN final_decisions fd ON fd.application_id = a.id
     WHERE a.status IN ('DECISION_PENDING','ADMITTED','REJECTED','WAITLISTED')
     ORDER BY COALESCE(fd.decided_at, dr.submitted_at) DESC`,
    );
    return sendOk(res, rows);
  }),
);

router.post(
  "/applications/:applicationId/final-decision",
  validateBody(
    z.object({
      decision: z.enum(["ADMITTED", "REJECTED", "WAITLISTED"]),
      remarks: z.string().trim().min(5).max(2000),
    }),
  ),
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [apps] = await connection.execute(
        `SELECT a.id, a.application_number, a.applicant_id, a.status,
                a.selected_college_preference_id, a.admission_cycle_id, u.full_name
         FROM applications a JOIN users u ON u.id = a.applicant_id
         WHERE a.id = ? FOR UPDATE`,
        [req.params.applicationId],
      );
      const application = apps[0];
      if (!application) throw new HttpError(404, "Application not found.");
      if (application.status !== "DECISION_PENDING")
        throw new HttpError(
          409,
          "This application is not ready for a final decision. Department review must be submitted first.",
        );

      let selectedPreference = null;
      if (application.selected_college_preference_id) {
        const [preferenceRows] = await connection.execute(
          `SELECT acp.id, acp.application_id, acp.preference_order,
                  acp.overall_eligibility_status, acp.final_decision,
                  cp.id AS college_programme_id, cp.intake_capacity,
                  c.name AS college_name, c.is_active AS college_active,
                  cp.is_active AS offering_active
           FROM application_college_preferences acp
           JOIN college_programmes cp ON cp.id = acp.college_programme_id
           JOIN colleges c ON c.id = cp.college_id
           WHERE acp.id = ? AND acp.application_id = ? FOR UPDATE`,
          [application.selected_college_preference_id, application.id],
        );
        selectedPreference = preferenceRows[0] || null;
        if (!selectedPreference)
          throw new HttpError(
            409,
            "The selected college preference could not be found.",
          );
      }

      if (selectedPreference && req.body.decision === "ADMITTED") {
        if (
          selectedPreference.overall_eligibility_status !== "ELIGIBLE" ||
          Number(selectedPreference.college_active) !== 1 ||
          Number(selectedPreference.offering_active) !== 1
        ) {
          throw new HttpError(
            409,
            "The selected college offering is no longer active or the applicant is not eligible.",
          );
        }
        if (selectedPreference.intake_capacity !== null) {
          const [[seats]] = await connection.execute(
            `SELECT COUNT(*) AS admittedCount
             FROM application_college_preferences admitted
             JOIN applications admitted_app ON admitted_app.id = admitted.application_id
             WHERE admitted.college_programme_id = ? AND admitted.final_decision = 'ADMITTED'
               AND admitted_app.admission_cycle_id = ? AND admitted.id <> ?`,
            [
              selectedPreference.college_programme_id,
              application.admission_cycle_id,
              selectedPreference.id,
            ],
          );
          if (
            Number(seats.admittedCount) >=
            Number(selectedPreference.intake_capacity)
          ) {
            throw new HttpError(
              409,
              `The intake capacity for ${selectedPreference.college_name} has been reached. Consider the next eligible college preference.`,
            );
          }
        }
      }

      if (selectedPreference) {
        await connection.execute(
          `UPDATE application_college_preferences
           SET final_decision = ?, final_decision_remarks = ?, final_decided_at = CURRENT_TIMESTAMP,
               review_status = 'COMPLETED',
               is_current = IF(? IN ('ADMITTED','WAITLISTED'), 1, 0)
           WHERE id = ?`,
          [
            req.body.decision,
            req.body.remarks,
            req.body.decision,
            selectedPreference.id,
          ],
        );
      }

      await connection.execute(
        `INSERT INTO final_decisions (application_id, decided_by_user_id, outcome, remarks)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE decided_by_user_id = VALUES(decided_by_user_id),
           outcome = VALUES(outcome), remarks = VALUES(remarks), decided_at = CURRENT_TIMESTAMP`,
        [application.id, req.auth.userId, req.body.decision, req.body.remarks],
      );

      let nextPreference = null;
      if (selectedPreference && req.body.decision === "REJECTED") {
        const [nextRows] = await connection.execute(
          `SELECT acp.id, acp.preference_order, acp.college_programme_id,
                  cp.intake_capacity, c.name AS college_name
           FROM application_college_preferences acp
           JOIN college_programmes cp ON cp.id = acp.college_programme_id AND cp.is_active = 1
           JOIN colleges c ON c.id = cp.college_id AND c.is_active = 1
           WHERE acp.application_id = ?
             AND acp.preference_order > ?
             AND acp.overall_eligibility_status = 'ELIGIBLE'
             AND acp.final_decision = 'PENDING'
             AND (
               cp.intake_capacity IS NULL OR cp.intake_capacity > (
                 SELECT COUNT(*) FROM application_college_preferences admitted
                 JOIN applications admitted_app ON admitted_app.id = admitted.application_id
                 WHERE admitted.college_programme_id = cp.id
                   AND admitted.final_decision = 'ADMITTED'
                   AND admitted_app.admission_cycle_id = ?
               )
             )
           ORDER BY acp.preference_order ASC
           LIMIT 1 FOR UPDATE`,
          [
            application.id,
            selectedPreference.preference_order,
            application.admission_cycle_id,
          ],
        );
        nextPreference = nextRows[0] || null;
      }

      if (nextPreference) {
        await connection.execute(
          "DELETE FROM final_decisions WHERE application_id = ?",
          [application.id],
        );
        await connection.execute(
          `UPDATE application_college_preferences SET is_current = 0
           WHERE application_id = ?`,
          [application.id],
        );
        await connection.execute(
          `UPDATE application_college_preferences
           SET is_current = 1, review_status = 'IN_REVIEW'
           WHERE id = ?`,
          [nextPreference.id],
        );
        await connection.execute(
          `UPDATE applications
           SET selected_college_preference_id = ?, status = 'DEPARTMENT_REVIEW',
               current_stage_code = 'DEPARTMENT_REVIEW', updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [nextPreference.id, application.id],
        );
        await connection.execute(
          `INSERT INTO application_stage_history
           (application_id, from_stage_code, to_stage_code, from_status, to_status, actor_user_id, reason)
           VALUES (?, 'FINAL_ADMISSION_DECISION', 'DEPARTMENT_REVIEW', 'DECISION_PENDING', 'DEPARTMENT_REVIEW', ?, ?)`,
          [
            application.id,
            req.auth.userId,
            `Previous preference was not admitted. Proceeding to ${nextPreference.college_name}, the next eligible preference. ${req.body.remarks}`,
          ],
        );
      } else {
        await moveApplicationStage(connection, {
          applicationId: application.id,
          actorUserId: req.auth.userId,
          stageCode: "FINAL_ADMISSION_DECISION",
          status: req.body.decision,
          reason: req.body.remarks,
        });
      }

      await writeAudit(connection, {
        actorUserId: req.auth.userId,
        action: nextPreference
          ? "COLLEGE_PREFERENCE_REJECTED_ADVANCED"
          : "FINAL_ADMISSION_DECISION_RECORDED",
        entityType: "APPLICATION",
        entityId: application.id,
        metadata: {
          decision: req.body.decision,
          remarks: req.body.remarks,
          collegePreferenceId: selectedPreference?.id || null,
          collegeName: selectedPreference?.college_name || null,
          nextCollegePreferenceId: nextPreference?.id || null,
          nextCollegeName: nextPreference?.college_name || null,
        },
        ipAddress: req.ip,
      });

      const admittedCollegeName = selectedPreference?.college_name || null;
      await notifyUser(connection, {
        recipientUserId: application.applicant_id,
        actorUserId: req.auth.userId,
        title: nextPreference
          ? "Your application is moving to the next college preference"
          : req.body.decision === "ADMITTED"
            ? "Congratulations! Admission confirmed"
            : "Final admission decision published",
        message: nextPreference
          ? `${selectedPreference.college_name} could not offer admission. Your application is now being considered by ${nextPreference.college_name}.`
          : req.body.decision === "ADMITTED"
            ? `You have been admitted to ${admittedCollegeName || "the selected college"}. ${req.body.remarks}`
            : `The final decision for ${application.application_number} is ${req.body.decision.replaceAll("_", " ")}. ${req.body.remarks}`,
        type: "DECISION",
        applicationId: application.id,
        route: "/applicant/dashboard",
      });

      await connection.commit();
      return sendOk(
        res,
        {
          applicationId: application.id,
          decision: req.body.decision,
          collegeName: selectedPreference?.college_name || null,
          nextCollege: nextPreference?.college_name || null,
          advancedToNextPreference: Boolean(nextPreference),
        },
        200,
        nextPreference
          ? `Decision recorded. The application has moved to ${nextPreference.college_name}.`
          : "Final admission decision recorded.",
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),
);

export default router;
