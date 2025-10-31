"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SecurityOptions = {
  maxViolations?: number;
  requireFullscreen?: boolean;
  requireWebcamMic?: boolean;
  onViolation?: (reason: string, count: number) => void;
  onLockdownFail?: (reason: string) => void;
};

export function useExamSecurity(options: SecurityOptions = {}) {
  const {
    maxViolations = 3,
    requireFullscreen = true,
    requireWebcamMic = true,
    onViolation,
    onLockdownFail,
  } = options;

  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastRestartAtRef = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);

  const addViolation = useCallback(
    (reason: string) => {
      setViolations((v) => {
        const next = v + 1;
        onViolation?.(reason, next);
        return next;
      });
    },
    [onViolation]
  );

  const enterFullscreen = useCallback(async () => {
    if (!requireFullscreen) return true;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (e) {
      onLockdownFail?.("Failed to enter fullscreen");
      return false;
    }
  }, [onLockdownFail, requireFullscreen]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (_) {
      // ignore
    }
  }, []);

  const startMedia = useCallback(async () => {
    if (!requireWebcamMic) return true;
    try {
      // If we already have a live stream, reuse it
      if (
        mediaStream &&
        mediaStream.getTracks().some((t) => t.readyState === "live")
      ) {
        return true;
      }
      setIsRequestingMedia(true);
      setMediaError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setMediaStream(stream);
      // Surface track lifecycle for debugging
      stream.getTracks().forEach((track) => {
        track.onended = () =>
          setMediaError((prev) => prev ?? `Track ended: ${track.kind}`);
        track.onmute = () =>
          setMediaError((prev) => prev ?? `Track muted: ${track.kind}`);
        track.onunmute = () => setMediaError(null);
      });
      // Attach will be handled in a dedicated effect to avoid play race conditions
      setIsRequestingMedia(false);
      // Try to acquire wake lock to prevent screen sleep on mobile
      try {
        // @ts-ignore
        if (navigator.wakeLock && !wakeLockRef.current) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          wakeLockRef.current.addEventListener("release", () => {
            wakeLockRef.current = null;
          });
        }
      } catch (_) {
        // ignore unsupported
      }
      return true;
    } catch (e) {
      const reason =
        e instanceof Error ? e.message : "Camera/Mic permissions denied";
      setMediaError(reason);
      setIsRequestingMedia(false);
      onLockdownFail?.(reason);
      return false;
    }
  }, [onLockdownFail, requireWebcamMic, mediaStream]);

  const stopMedia = useCallback(() => {
    setMediaStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
    if (videoRef.current) {
      try {
        // Detach to avoid stale streams
        (
          videoRef.current as HTMLVideoElement & {
            srcObject?: MediaStream | null;
          }
        ).srcObject = null;
      } catch (_) {}
    }
    // Release wake lock if held
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (_) {}
  }, []);

  // Attach stream if it changes after ref mounts
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      const video = videoRef.current;
      let cancelled = false;
      try {
        video.muted = true;
        video.setAttribute("playsinline", "true");
        (
          video as HTMLVideoElement & { srcObject?: MediaStream | null }
        ).srcObject = mediaStream;
      } catch (_) {}

      const playSafe = () => {
        if (cancelled) return;
        // Try play; ignore AbortError due to subsequent loads
        const p = video.play();
        if (p && typeof p.then === "function") {
          p.catch(() => undefined);
        }
      };

      // Wait for metadata to avoid interrupted play()
      const onLoaded = () => {
        playSafe();
      };
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      // Fallback: attempt on next frame
      requestAnimationFrame(playSafe);

      // Retry a few times if the element remains paused
      let attempts = 0;
      const retry = () => {
        if (cancelled) return;
        if (!video.paused && video.readyState >= 2) return;
        attempts += 1;
        playSafe();
        if (attempts < 10) setTimeout(retry, 300);
      };
      setTimeout(retry, 350);

      return () => {
        cancelled = true;
        video.removeEventListener("loadedmetadata", onLoaded);
      };
    }
  }, [mediaStream]);

  // Auto-restart media if tracks end unexpectedly while attempt is active
  useEffect(() => {
    const hasActiveTrack = (s: MediaStream | null) =>
      !!s && s.getTracks().some((t) => t.readyState === "live");
    if (!requireWebcamMic) return;
    if (hasActiveTrack(mediaStream)) return;
    const now = Date.now();
    if (now - lastRestartAtRef.current < 5000) return; // throttle restarts
    lastRestartAtRef.current = now;
    void startMedia();
  }, [mediaStream, startMedia, requireWebcamMic]);

  // Listeners: visibility, blur, fullscreen change, context/keys
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden")
        addViolation("Tab switched or window hidden");
    };
    const onBlur = () => addViolation("Window blurred");
    const onFsChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      if (requireFullscreen && !fs) addViolation("Exited fullscreen");
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("Context menu opened");
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const blocked =
        ((e.ctrlKey || e.metaKey) &&
          ["c", "x", "v", "a", "p", "s", "Tab"].includes(e.key)) ||
        e.key === "F11" ||
        e.key === "PrintScreen";
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        addViolation(`Blocked key: ${e.key}`);
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave the test?";
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [addViolation, requireFullscreen]);

  return useMemo(() => {
    return {
      violations,
      isFullscreen,
      mediaStream,
      isRequestingMedia,
      mediaError,
      videoRef,
      maxViolations,
      enterFullscreen,
      exitFullscreen,
      startMedia,
      stopMedia,
    } as const;
  }, [
    violations,
    isFullscreen,
    mediaStream,
    isRequestingMedia,
    mediaError,
    maxViolations,
    enterFullscreen,
    exitFullscreen,
    startMedia,
    stopMedia,
  ]);
}
