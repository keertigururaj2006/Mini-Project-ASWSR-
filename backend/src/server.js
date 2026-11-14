import app from "./app.js";
import { env } from "./config/env.js";
import { assertDatabaseConnection, pool } from "./config/db.js";

try {
  await assertDatabaseConnection();
  const server = app.listen(env.PORT, () => {
    console.log(`CrediFit API listening on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing CrediFit API...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error("Could not start CrediFit API:", error.message);
  await pool.end();
  process.exit(1);
}
