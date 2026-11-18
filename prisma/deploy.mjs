/**
 * Apply Prisma migrations to a libSQL / Turso database.
 *
 * Prisma 7's `migrate deploy` cannot talk to `libsql://` URLs directly
 * (the migrate engine rejects the scheme — P1013). This script applies the
 * generated migration SQL through the libSQL client instead, which the app
 * already depends on. It is idempotent: it records applied migrations in a
 * `_migrations` table and skips ones already run.
 *
 * Used by `npm run vercel-build`. Locally (no DATABASE_URL) it no-ops, since
 * `prisma migrate dev` manages the local SQLite file.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || url.startsWith("file:")) {
  console.log("[deploy] No remote DATABASE_URL set — skipping (local dev uses prisma migrate dev).");
  process.exit(0);
}

const client = createClient(authToken ? { url, authToken } : { url });

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
if (!existsSync(migrationsDir)) {
  console.log("[deploy] No migrations directory — nothing to apply.");
  process.exit(0);
}

await client.execute(
  `CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
);

const applied = new Set(
  (await client.execute("SELECT name FROM _migrations")).rows.map((r) => String(r.name)),
);

const dirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort(); // timestamp-prefixed names sort chronologically

let count = 0;
for (const name of dirs) {
  if (applied.has(name)) continue;
  const sqlPath = path.join(migrationsDir, name, "migration.sql");
  if (!existsSync(sqlPath)) continue;

  const raw = readFileSync(sqlPath, "utf8");
  // Strip full-line SQL comments, then split into individual statements on ';'.
  const cleaned = raw
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`[deploy] Applying migration: ${name} (${statements.length} statements)`);
  // Apply sequentially. PRAGMA statements can't run inside a transaction batch,
  // so we execute one at a time; Prisma's SQLite migrations are self-contained.
  for (const stmt of statements) {
    await client.execute(stmt);
  }
  await client.execute({ sql: "INSERT INTO _migrations (name) VALUES (?)", args: [name] });
  count++;
}

console.log(count === 0 ? "[deploy] Database already up to date." : `[deploy] Applied ${count} migration(s).`);
await client.close();
