"use client";

import { useEffect } from "react";
import { isAttemptRoute } from "@/lib/utils/test-engine";

// Starts fullscreen and media only on the attempt route; cleans up on unmount
export function useProctoringOnAttempt(
  enterFullscreen: () => Promise<boolean> | boolean,
  startMedia: () => Promise<boolean> | boolean
) {
  useEffect(() => {
    const shouldStart =
      typeof window !== "undefined" && isAttemptRoute(window.location.pathname);
    if (shouldStart) {
      void enterFullscreen();
      void startMedia();
    }
  }, [enterFullscreen, startMedia]);
}
