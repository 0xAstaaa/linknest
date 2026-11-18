import { resolveIcon } from "@/lib/icons";

/**
 * Renders a brand/mail/phone/generic glyph for a link.
 * Uses `currentColor` so it inverts with the editorial hover fill.
 */
export function LinkIcon({ url, className = "h-5 w-5" }: { url: string; className?: string }) {
  const resolved = resolveIcon(url);

  if (resolved === "mail") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (resolved === "phone") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l-5-2-1 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (resolved) {
    // official brand path (24x24 viewBox, filled)
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={resolved.title}>
        <path d={resolved.path} />
      </svg>
    );
  }
  // generic link glyph
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
