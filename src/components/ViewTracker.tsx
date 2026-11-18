"use client";

import { useEffect, useRef } from "react";
import { trackView } from "@/app/actions";

export function ViewTracker({ profileId }: { profileId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void trackView(profileId);
  }, [profileId]);
  return null;
}
