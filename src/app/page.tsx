import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/profile";
import { themeVars } from "@/lib/themes";
import { PublicLink } from "@/components/PublicLink";
import { ViewTracker } from "@/components/ViewTracker";
import { LocalTime } from "@/components/LocalTime";
import { ScrollProgress } from "@/components/ScrollProgress";

export const instant = false;

const YEAR = new Date().getFullYear();

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: profile.name,
    description: profile.bio || `${profile.name}'s links`,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function Home() {
  const profile = await getProfile();
  const activeLinks = profile.links.filter((l) => l.active);
  const [first, ...rest] = profile.name.split(" ");

  return (
    <main
      className="grain relative min-h-screen bg-[var(--bg)] text-[var(--fg)]"
      style={themeVars(profile.theme)}
    >
      <ViewTracker profileId={profile.id} />
      <ScrollProgress />

      {/* owner entry point */}
      <Link
        href="/dashboard"
        aria-label="Edit"
        className="fixed right-5 top-5 z-40 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
      >
        edit
      </Link>

      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-20 sm:px-8 sm:py-28">
        {/* header */}
        <header>
          <div className="rise flex items-center gap-4" style={{ animationDelay: "0ms" }}>
            <div
              className="group grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--line)] text-sm font-medium"
            >
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105"
                />
              ) : (
                <span className="text-[var(--muted)]">{initials(profile.name) || "·"}</span>
              )}
            </div>
            <span className="flex flex-1 items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              <span>Links</span>
              <LocalTime />
            </span>
          </div>

          <h1
            className="font-display rise mt-8 text-6xl leading-[0.95] tracking-tight sm:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {first}
            {rest.length > 0 && (
              <>
                <br />
                <span className="italic text-[var(--muted)]">{rest.join(" ")}</span>
              </>
            )}
          </h1>

          {profile.bio && (
            <p
              className="rise mt-6 max-w-sm text-pretty text-[15px] leading-relaxed text-[var(--muted)]"
              style={{ animationDelay: "160ms" }}
            >
              {profile.bio}
            </p>
          )}
        </header>

        {/* links */}
        <nav className="mt-14">
          {activeLinks.length > 0 && (
            <div
              className="rise mb-3 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]"
              style={{ animationDelay: "200ms" }}
            >
              <span>Index</span>
              <span>{String(activeLinks.length).padStart(2, "0")} —</span>
            </div>
          )}
          <div
            className="draw-line h-px w-full bg-[var(--line)]"
            style={{ animationDelay: "220ms" }}
          />
          {activeLinks.length === 0 ? (
            <p className="py-8 text-sm text-[var(--muted)]">No links yet.</p>
          ) : (
            activeLinks.map((l, i) => (
              <div key={l.id} className="rise" style={{ animationDelay: `${260 + i * 70}ms` }}>
                <PublicLink id={l.id} title={l.title} url={l.url} index={i} showIcon={profile.showIcons} />
                <div className="h-px w-full bg-[var(--line)]" />
              </div>
            ))
          )}
        </nav>

        <div className="flex-1" />

        <footer
          className="rise mt-16 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]"
          style={{ animationDelay: "600ms" }}
        >
          <span>© {YEAR}</span>
          <span>{profile.name}</span>
        </footer>
      </div>
    </main>
  );
}
