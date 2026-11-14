import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../src/config/env.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const seedDirectory = path.resolve(here, "../database/seeds");
const files = (await fs.readdir(seedDirectory)).filter((name) => name.endsWith(".sql")).sort();
if (!files.length) throw new Error("No seed files found.");

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
    process.stdout.write(`Seeding ${file} ... `);
    await connection.query(await fs.readFile(path.join(seedDirectory, file), "utf8"));
    console.log("done");
  }
  console.log("Reference data seeded.");
} finally {
  await connection.end();
}
