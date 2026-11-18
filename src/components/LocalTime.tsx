"use client";

import { useEffect, useState } from "react";

/** A quiet editorial time readout, local to the visitor. */
export function LocalTime() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);

  // render nothing until mounted to avoid hydration mismatch
  if (!now) return <span className="opacity-0">00:00</span>;
  return <span suppressHydrationWarning>{now}</span>;
}
