"use client";

import { useEffect, useMemo } from "react";
import { formatRemaining } from "@/lib/utils/test-engine";

// Drives the countdown timer from a start time and duration
export function useAttemptTimer(
  startedAtMs: number | null | undefined,
  durationMinutes: number,
  tick: () => void
) {
  const remainingMs = useMemo(() => {
    if (!startedAtMs) return 0;
    return Math.max(0, startedAtMs + durationMinutes * 60_000 - Date.now());
  }, [startedAtMs, durationMinutes]);

  const { minutes, seconds } = useMemo(
    () => formatRemaining(remainingMs),
    [remainingMs]
  );

  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  return { remainingMs, minutes, seconds } as const;
}
