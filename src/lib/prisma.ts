import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url =
  process.env.DATABASE_URL ??
  `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

// Turso (hosted libSQL) needs an auth token for libsql:// / https:// URLs.
const authToken = process.env.DATABASE_AUTH_TOKEN;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaLibSql(authToken ? { url, authToken } : { url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
