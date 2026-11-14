import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../src/config/env.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationDirectory = path.resolve(here, "../database/migrations");
const files = (await fs.readdir(migrationDirectory)).filter((name) => name.endsWith(".sql")).sort();
if (!files.length) throw new Error("No migration files found.");

const connection = await mysql.createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
  timezone: "Z",
});
try {
  for (const file of files) {
    process.stdout.write(`Applying ${file} ... `);
    const sql = await fs.readFile(path.join(migrationDirectory, file), "utf8");
    await connection.query(sql);
    console.log("done");
  }
  console.log("Database migrations completed.");
} finally {
  await connection.end();
}
