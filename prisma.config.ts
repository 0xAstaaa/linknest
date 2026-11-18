import path from "node:path";
import { defineConfig } from "prisma/config";

// Only the local SQLite file goes through Prisma's datasource URL. Remote
// libSQL/Turso (`libsql://`) is handled at runtime by the driver adapter and
// at deploy time by `prisma/deploy.mjs` — Prisma's migrate engine can't parse
// the `libsql://` scheme itself (P1013), so we never hand it one here.
const localUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const envUrl = process.env.DATABASE_URL;
const url = !envUrl || envUrl.startsWith("file:") ? envUrl ?? localUrl : localUrl;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url,
  },
});
