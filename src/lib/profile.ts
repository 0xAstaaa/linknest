import { prisma } from "@/lib/prisma";

/**
 * Single-tenant: there is exactly one profile for the whole site.
 * Returns it, creating a default on first run.
 */
export async function getProfile() {
  const existing = await prisma.profile.findFirst({
    include: { links: { orderBy: { position: "asc" } } },
  });
  if (existing) return existing;

  return prisma.profile.create({
    data: {
      name: "Your Name",
      bio: "Welcome to my links. Edit this from the dashboard.",
      theme: "aurora",
    },
    include: { links: { orderBy: { position: "asc" } } },
  });
}

export type FullProfile = Awaited<ReturnType<typeof getProfile>>;
