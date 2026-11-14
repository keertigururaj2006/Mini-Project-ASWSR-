import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";
import { createPublicId } from "../src/services/records.js";

const rl = readline.createInterface({ input, output });
try {
  const fullName = (await rl.question("Admin full name: ")).trim();
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Password (minimum 12 characters): ");
  if (fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
    throw new Error("Enter a valid name/email and a password of at least 12 characters.");
  }
  const [roles] = await pool.execute("SELECT id FROM roles WHERE code = 'ADMIN'");
  if (!roles[0]) throw new Error("Run npm run db:migrate and npm run db:seed before creating the Admin.");
  const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
  if (existing[0]) throw new Error("An account with this email already exists.");
  const passwordHash = await bcrypt.hash(password, 12);
  const publicId = createPublicId("CF");
  const [insert] = await pool.execute(
    "INSERT INTO users (public_id, role_id, full_name, email, password_hash) VALUES (?, ?, ?, ?, ?)",
    [publicId, roles[0].id, fullName, email, passwordHash],
  );
  await pool.execute("INSERT INTO staff_profiles (user_id, department, designation) VALUES (?, 'Administration', 'Administrator')", [insert.insertId]);
  console.log(`Admin created: ${publicId} (${email})`);
} finally {
  rl.close();
  await pool.end();
}
