"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Plus,
  ExternalLink,
  MousePointerClick,
  Check,
  Copy,
  Pencil,
  LogOut,
} from "lucide-react";
import { THEME_LIST, getTheme } from "@/lib/themes";
import { LinkIcon } from "@/components/LinkIcon";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import type { Analytics } from "@/lib/analytics";
import {
  addLink,
  deleteLink,
  updateLink,
  reorderLinks,
  updateProfile,
  logout,
} from "@/app/actions";

type LinkRow = {
  id: string;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  position: number;
};
type ProfileData = {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  theme: string;
  showIcons: boolean;
  views: number;
  links: LinkRow[];
};

export function Editor({ profile, analytics }: { profile: ProfileData; analytics: Analytics }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [theme, setTheme] = useState(profile.theme);
  const [showIcons, setShowIcons] = useState(profile.showIcons);
  const [links, setLinks] = useState<LinkRow[]>(profile.links);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function saveProfile(patch: Partial<Pick<ProfileData, "name" | "bio" | "avatar" | "theme" | "showIcons">>) {
    startTransition(() => updateProfile(patch));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const next = arrayMove(links, oldIndex, newIndex);
    setLinks(next);
    startTransition(() => reorderLinks(next.map((l) => l.id)));
  }

  async function handleAdd() {
    const optimistic: LinkRow = {
      id: `tmp-${Date.now()}`,
      title: "New link",
      url: "",
      active: true,
      clicks: 0,
      position: links.length,
    };
    setLinks((l) => [...l, optimistic]);
    startTransition(async () => {
      await addLink(optimistic.title, optimistic.url);
      router.refresh();
    });
  }

  function handleLinkChange(id: string, patch: Partial<LinkRow>) {
    setLinks((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (!id.startsWith("tmp-")) {
      startTransition(() =>
        updateLink(id, {
          title: patch.title,
          url: patch.url,
          active: patch.active,
        }),
      );
    }
  }

  function handleDelete(id: string) {
    setLinks((l) => l.filter((x) => x.id !== id));
    if (!id.startsWith("tmp-")) startTransition(() => deleteLink(id));
  }

  const publicUrl = "/";
  const t = getTheme(theme);

  function copyLink() {
    const full = `${window.location.origin}/`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div className="grain relative min-h-screen bg-[#0b0b0c] text-[#f5f3ee]" style={{ ["--grain" as string]: "0.04", ["--accent" as string]: "#e8e4d8", ["--accent-fg" as string]: "#0b0b0c" }}>
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0c]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-xl leading-none tracking-tight">
            LinkNest<span className="align-top text-[var(--accent)]">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition hover:bg-white/5"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--accent-fg)] transition hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View page</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* ---- controls ---- */}
        <div className="space-y-6">
          {/* analytics */}
          <Section title="Analytics · last 7 days">
            <AnalyticsChart
              days={analytics.days}
              totalViews={analytics.totalViews}
              totalClicks={analytics.totalClicks}
              ctr={analytics.ctr}
            />
          </Section>

          {/* profile card */}
          <Section title="Profile">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-lg font-bold ring-2 ring-white/10">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50">Avatar image URL</label>
                <input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  onBlur={() => saveProfile({ avatar })}
                  placeholder="https://…/photo.jpg"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>
            <Field label="Display name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => saveProfile({ name })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={() => saveProfile({ bio })}
                rows={2}
                maxLength={160}
                placeholder="Tell people who you are…"
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
              />
              <span className="mt-1 block text-right text-[11px] text-white/30">{bio.length}/160</span>
            </Field>
          </Section>

          {/* theme picker */}
          <Section title="Theme">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {THEME_LIST.map((th) => (
                <button
                  key={th.id}
                  onClick={() => {
                    setTheme(th.id);
                    saveProfile({ theme: th.id });
                  }}
                  className={`group relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl ring-1 transition ${
                    theme === th.id ? "ring-white scale-[1.03]" : "ring-white/10 hover:ring-white/40"
                  }`}
                  style={{ background: th.bg }}
                  title={th.name}
                  aria-label={th.name}
                >
                  {/* mini editorial glyph: a serif letter + accent dot */}
                  <span className="font-display text-xl leading-none" style={{ color: th.fg }}>
                    Aa
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: th.accent }} />
                  {theme === th.id && (
                    <span className="absolute right-1.5 top-1.5">
                      <Check className="h-3.5 w-3.5" style={{ color: th.fg }} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">Current: {t.name}</p>

            {/* show-icons toggle */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <div>
                <div className="text-sm font-medium">Show brand icons</div>
                <div className="text-xs text-white/40">
                  Auto-detected from each link (GitHub, Instagram, X…). Off = numbered list.
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !showIcons;
                  setShowIcons(next);
                  saveProfile({ showIcons: next });
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  showIcons ? "bg-white" : "bg-white/15"
                }`}
                aria-label="Toggle brand icons"
                aria-pressed={showIcons}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
                    showIcons ? "left-[22px] bg-black" : "left-0.5 bg-white"
                  }`}
                />
              </button>
            </div>
          </Section>

          {/* links */}
          <Section
            title="Links"
            action={
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/20"
              >
                <Plus className="h-4 w-4" /> Add link
              </button>
            }
          >
            {links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-white/40">
                No links yet. Hit <span className="text-white/70">Add link</span> to start.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {links.map((l) => (
                      <LinkItem
                        key={l.id}
                        link={l}
                        onChange={(patch) => handleLinkChange(l.id, patch)}
                        onDelete={() => handleDelete(l.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </Section>
        </div>

        {/* ---- live preview ---- */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-white/40">
            Live preview
          </p>
          <PhonePreview
            name={name}
            bio={bio}
            avatar={avatar}
            theme={theme}
            showIcons={showIcons}
            links={links.filter((l) => l.active)}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- sub components ---------- */

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      {children}
    </div>
  );
}

function LinkItem({
  link,
  onChange,
  onDelete,
}: {
  link: LinkRow;
  onChange: (patch: Partial<LinkRow>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });
  const [open, setOpen] = useState(link.url === "");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-white/10 bg-white/[0.05] transition ${
        isDragging ? "z-10 shadow-2xl ring-1 ring-white/50" : ""
      } ${!link.active ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1.5 text-white/30 hover:bg-white/10 hover:text-white/70 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{link.title || "Untitled"}</div>
          <div className="truncate text-xs text-white/40">{link.url || "No URL set"}</div>
        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/50 sm:inline-flex">
          <MousePointerClick className="h-3 w-3" /> {link.clicks}
        </span>
        <button
          onClick={() => onChange({ active: !link.active })}
          className={`relative h-5 w-9 shrink-0 rounded-full transition ${
            link.active ? "bg-[#e8e4d8]" : "bg-white/15"
          }`}
          aria-label="Toggle active"
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
              link.active ? "left-[18px] bg-black" : "left-0.5 bg-white"
            }`}
          />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-300"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="grid gap-2 border-t border-white/10 p-3 sm:grid-cols-2">
          <input
            value={link.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Title (e.g. Instagram)"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
          />
          <input
            value={link.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="example.com/you"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

function PhonePreview({
  name,
  bio,
  avatar,
  theme,
  showIcons,
  links,
}: {
  name: string;
  bio: string;
  avatar: string;
  theme: string;
  showIcons: boolean;
  links: LinkRow[];
}) {
  const t = getTheme(theme);
  const [first, ...rest] = (name || "Your Name").split(" ");
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div
        className="relative aspect-[9/19] overflow-hidden rounded-[2.75rem] border-[10px] border-zinc-900 bg-black"
        style={{ boxShadow: "0 40px 80px -24px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        <div className="absolute -left-[10px] top-24 h-10 w-[3px] rounded-l bg-zinc-800" />
        <div className="absolute -left-[10px] top-36 h-14 w-[3px] rounded-l bg-zinc-800" />
        <div className="absolute -right-[10px] top-28 h-16 w-[3px] rounded-r bg-zinc-800" />
        <div className="absolute left-1/2 top-2.5 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />

        <div
          className="thin-scroll relative h-full overflow-y-auto"
          style={{ background: t.bg, color: t.fg }}
        >
          <div className="flex min-h-full flex-col px-6 pb-8 pt-14">
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border text-[10px]"
                style={{ borderColor: t.line }}
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span style={{ color: t.muted }}>
                    {(name || "·").slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{ color: t.muted }}
              >
                Links
              </span>
            </div>

            <h1 className="font-display mt-5 text-3xl leading-[0.95] tracking-tight">
              {first}
              {rest.length > 0 && (
                <>
                  <br />
                  <span className="italic" style={{ color: t.muted }}>
                    {rest.join(" ")}
                  </span>
                </>
              )}
            </h1>
            {bio && (
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: t.muted }}>
                {bio}
              </p>
            )}

            <div className="mt-7 h-px w-full" style={{ background: t.line }} />
            {links.length === 0 ? (
              <p className="py-5 text-[11px]" style={{ color: t.muted }}>
                Your links appear here
              </p>
            ) : (
              links.map((l, i) => (
                <div key={l.id}>
                  <div className="flex items-center gap-2.5 py-3">
                    {showIcons ? (
                      <span className="flex w-4 shrink-0 justify-center" style={{ color: t.muted }}>
                        <LinkIcon url={l.url} className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span
                        className="w-4 shrink-0 font-mono text-[9px] tracking-widest"
                        style={{ color: t.muted }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span className="font-display flex-1 truncate text-base leading-none">
                      {l.title || "Untitled"}
                    </span>
                    <span style={{ color: t.muted }}>↗</span>
                  </div>
                  <div className="h-px w-full" style={{ background: t.line }} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
