// Additive, idempotent migration: create ONLY the ApplicationLead table + indexes
// on PROD. Deliberately NOT using `prisma db push` because the committed schema
// is behind prod (prod has PendingApplication.emailVerified, which db push would
// destructively drop). This touches nothing but the new table.
import fs from "node:fs";
import { Pool } from "pg";

function readEnv(file, key) {
  const txt = fs.readFileSync(file, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, "");
  }
  return null;
}

const connectionString = readEnv(".env.local", "DATABASE_URL");
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const statements = [
  `CREATE TABLE IF NOT EXISTS "ApplicationLead" (
     "id" TEXT NOT NULL,
     "name" TEXT NOT NULL DEFAULT '',
     "email" TEXT NOT NULL,
     "phone" TEXT NOT NULL DEFAULT '',
     "ticketType" TEXT NOT NULL DEFAULT '',
     "lastStep" TEXT NOT NULL DEFAULT 'basics',
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "ApplicationLead_pkey" PRIMARY KEY ("id")
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ApplicationLead_email_key" ON "ApplicationLead"("email")`,
  `CREATE INDEX IF NOT EXISTS "ApplicationLead_email_idx" ON "ApplicationLead"("email")`,
  `CREATE INDEX IF NOT EXISTS "ApplicationLead_createdAt_idx" ON "ApplicationLead"("createdAt" DESC)`,
];

try {
  for (const sql of statements) {
    await pool.query(sql);
    console.log("OK:", sql.split("\n")[0].trim());
  }
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name='ApplicationLead' ORDER BY column_name`
  );
  console.log("\nApplicationLead columns:", rows.map((r) => r.column_name).join(", "));
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
