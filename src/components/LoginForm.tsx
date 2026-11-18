"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginResult } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group mt-6 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--fg)] transition-opacity hover:opacity-70 disabled:opacity-40"
    >
      {pending ? "…" : "Log in"}
      <span className="h-px w-8 bg-[var(--fg)] transition-all group-hover:w-12" />
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginResult | null, FormData>(login, null);

  return (
    <form action={formAction}>
      <input
        type="password"
        name="password"
        autoFocus
        required
        placeholder="Password"
        aria-label="Password"
        className="w-full border-0 border-b border-[var(--line)] bg-transparent pb-3 pt-1 font-display text-2xl text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
      />
      {state && !state.ok && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-red-400">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
