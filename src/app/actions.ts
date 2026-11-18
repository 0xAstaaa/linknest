"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/profile";
import { checkPassword, createSession, destroySession, isAuthed } from "@/lib/auth";

function normalizeUrl(raw: string) {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^mailto:|^tel:/i.test(t)) return t;
  return `https://${t}`;
}

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Not authorized");
}

/* ---------------- auth ---------------- */

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(_prev: unknown, formData: FormData): Promise<LoginResult> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // tiny delay to blunt brute-forcing
    await new Promise((r) => setTimeout(r, 400));
    return { ok: false, error: "Incorrect password." };
  }
  await createSession();
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/* ---------------- profile ---------------- */

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  avatar?: string;
  theme?: string;
  showIcons?: boolean;
}) {
  await requireAuth();
  const profile = await getProfile();
  await prisma.profile.update({ where: { id: profile.id }, data });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

/* ---------------- links ---------------- */

export async function addLink(title: string, url: string) {
  await requireAuth();
  const profile = await getProfile();
  const count = await prisma.link.count({ where: { profileId: profile.id } });
  await prisma.link.create({
    data: {
      profileId: profile.id,
      title: title.trim() || "Untitled",
      url: normalizeUrl(url),
      position: count,
    },
  });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateLink(
  id: string,
  data: { title?: string; url?: string; active?: boolean; icon?: string },
) {
  await requireAuth();
  if (data.url !== undefined) data.url = normalizeUrl(data.url);
  await prisma.link.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteLink(id: string) {
  await requireAuth();
  await prisma.link.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function reorderLinks(orderedIds: string[]) {
  await requireAuth();
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.link.update({ where: { id }, data: { position: index } }),
    ),
  );
  revalidatePath("/");
  revalidatePath("/dashboard");
}

/* ---------------- analytics (public, no auth) ---------------- */

export async function trackClick(linkId: string) {
  try {
    await prisma.$transaction([
      prisma.link.update({ where: { id: linkId }, data: { clicks: { increment: 1 } } }),
      prisma.event.create({ data: { type: "click", linkId } }),
    ]);
  } catch {
    /* non-blocking */
  }
}

export async function trackView(profileId: string) {
  try {
    await prisma.$transaction([
      prisma.profile.update({ where: { id: profileId }, data: { views: { increment: 1 } } }),
      prisma.event.create({ data: { type: "view" } }),
    ]);
  } catch {
    /* non-blocking */
  }
}
