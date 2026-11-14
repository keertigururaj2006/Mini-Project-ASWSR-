import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";

const rl = readline.createInterface({ input, output });

try {
  const email = "adityaapatil51@gmail.com";
  const password = await rl.question("Enter the admin password to test: ");

  const [rows] = await pool.execute(
    "SELECT password_hash FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  if (!rows[0]) {
    console.log("RESULT: Admin account not found in backend database.");
  } else {
    const matches = await bcrypt.compare(password, rows[0].password_hash);
    console.log("PASSWORD MATCH:", matches);
  }
} catch (error) {
  console.error("Test error:", error.message);
} finally {
  rl.close();
  await pool.end();
}
