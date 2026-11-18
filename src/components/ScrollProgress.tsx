"use client";

import { useEffect, useState } from "react";

/** A hairline at the very top that fills as you scroll. Quiet, accent-colored. */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div
        className="h-full origin-left bg-[var(--accent)] transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}
