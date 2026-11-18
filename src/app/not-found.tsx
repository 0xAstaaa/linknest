import Link from "next/link";
import { themeVars } from "@/lib/themes";

export default function NotFound() {
  return (
    <main
      className="grain relative grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-center text-[var(--fg)]"
      style={themeVars("noir")}
    >
      <div>
        <h1 className="font-display text-7xl leading-none tracking-tight">
          4<span className="italic text-[var(--muted)]">0</span>4
        </h1>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Page not found
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
        >
          Go home <span className="h-px w-8 bg-[var(--fg)]" />
        </Link>
      </div>
    </main>
  );
}
