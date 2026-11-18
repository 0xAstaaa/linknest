import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed, isConfigured } from "@/lib/auth";
import { themeVars } from "@/lib/themes";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/dashboard");
  const configured = isConfigured();

  return (
    <main
      className="grain relative grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--fg)]"
      style={themeVars("noir")}
    >
      <div className="w-full max-w-sm">
        <div className="rise">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
            Restricted
          </span>
          <h1 className="font-display mt-4 text-5xl leading-[0.95] tracking-tight">
            Owner
            <br />
            <span className="italic text-[var(--muted)]">access</span>
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)]">Enter your password to edit this page.</p>
        </div>

        <div className="rise mt-8" style={{ animationDelay: "120ms" }}>
          {configured ? (
            <LoginForm />
          ) : (
            <p className="border border-[var(--line)] p-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-[var(--muted)]">
              Login is disabled. Set the{" "}
              <span className="text-[var(--fg)]">DASHBOARD_PASSWORD</span> environment
              variable, then redeploy.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="rise mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          style={{ animationDelay: "200ms" }}
        >
          ← Back to page
        </Link>
      </div>
    </main>
  );
}
