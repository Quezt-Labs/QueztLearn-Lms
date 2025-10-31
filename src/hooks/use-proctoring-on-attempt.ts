"use client";

import { useEffect } from "react";
import { isAttemptRoute } from "@/lib/utils/test-engine";

// Starts fullscreen and media only on the attempt route; cleans up on unmount
export function useProctoringOnAttempt(
  enterFullscreen: () => Promise<boolean> | boolean,
  startMedia: () => Promise<boolean> | boolean,
  stopMedia: () => void,
  exitFullscreen: () => Promise<void> | void
) {
  useEffect(() => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const shouldStart = isAttemptRoute(pathname);
    if (shouldStart) {
      void enterFullscreen();
      void startMedia();
    }

    // Always cleanup on unmount to ensure camera is released on route changes
    return () => {
      stopMedia();
      void exitFullscreen();
    };
  }, [enterFullscreen, startMedia, stopMedia, exitFullscreen]);
}
