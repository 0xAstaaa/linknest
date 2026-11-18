"use client";

import { trackClick } from "@/app/actions";
import { LinkIcon } from "@/components/LinkIcon";

type Props = {
  id: string;
  title: string;
  url: string;
  index: number; // 0-based
  showIcon?: boolean;
};

function prettyDomain(url: string) {
  try {
    if (/^mailto:/i.test(url)) return url.replace(/^mailto:/i, "");
    if (/^tel:/i.test(url)) return url.replace(/^tel:/i, "");
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function PublicLink({ id, title, url, index, showIcon = true }: Props) {
  const domain = prettyDomain(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => void trackClick(id)}
      className="row-link group flex items-baseline gap-4 px-2 py-5 outline-none transition-colors hover:text-[var(--accent-fg)] focus-visible:text-[var(--accent-fg)]"
    >
      {showIcon ? (
        <span className="flex w-6 shrink-0 items-center self-center text-[var(--muted)] transition-colors group-hover:text-[var(--accent-fg)] group-focus-visible:text-[var(--accent-fg)]">
          <LinkIcon url={url} className="h-[18px] w-[18px]" />
        </span>
      ) : (
        <span className="w-6 shrink-0 font-mono text-[11px] tracking-widest text-[var(--muted)] transition-colors group-hover:text-[var(--accent-fg)] group-focus-visible:text-[var(--accent-fg)]">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1 overflow-hidden">
        <span className="font-display text-2xl leading-none sm:text-3xl">{title}</span>
        {domain && (
          <span className="max-h-0 overflow-hidden font-mono text-[10px] uppercase tracking-[0.18em] opacity-0 transition-all duration-500 group-hover:max-h-5 group-hover:opacity-60 group-focus-visible:max-h-5 group-focus-visible:opacity-60">
            {domain}
          </span>
        )}
      </span>
      <svg
        className="row-arrow h-5 w-5 shrink-0 self-center opacity-60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
