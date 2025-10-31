"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "./question-renderer";
import { useAttemptState } from "@/hooks/test-engine";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Flag,
  Send,
} from "lucide-react";
import { useExamSecurity } from "@/hooks/use-exam-security";
import { useRouter } from "next/navigation";

type EngineQuestion = {
  id: string;
  text: string;
  type: "MCQ" | "TRUE_FALSE" | "NUMERICAL" | "FILL_BLANK";
  options?: Array<{ id: string; text: string; isCorrect?: boolean }>;
  marks: number;
  negativeMarks: number;
};

type EngineSection = {
  id: string;
  name: string;
  questions: EngineQuestion[];
};

function generateMockTest(): {
  durationMinutes: number;
  sections: EngineSection[];
} {
  const options = ["A", "B", "C", "D"];
  const sections: EngineSection[] = Array.from({ length: 3 }).map((_, si) => ({
    id: `section-${si + 1}`,
    name: `Section ${si + 1}`,
    questions: Array.from({ length: 10 }).map((__, qi) => ({
      id: `q-${si + 1}-${qi + 1}`,
      text: `Q${qi + 1}. This is a sample question in section ${si + 1}.`,
      type: "MCQ",
      // Add a dummy external image (Unsplash) for the first question
      imageUrl:
        qi === 0
          ? "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=80&auto=format&fit=crop"
          : undefined,
      options: options.map((o, oi) => ({
        id: `opt-${si}-${qi}-${oi}`,
        text: `${o}`,
        // Add a dummy external image for the first option of the first question
        imageUrl:
          qi === 0 && oi === 0
            ? "https://images.unsplash.com/photo-1520975922203-b8ad9a8a8d2a?w=800&q=80&auto=format&fit=crop"
            : undefined,
      })),
      marks: 4,
      negativeMarks: 1,
    })),
  }));
  return { durationMinutes: 60, sections };
}

export function TestEngine({
  testId,
  enableMock = false,
}: {
  testId: string;
  enableMock?: boolean;
}) {
  const [markedForReview, setMarkedForReview] = useState<
    Record<string, boolean>
  >({});
  const { state, actions } = useAttemptState(testId);
  const router = useRouter();
  const security = useExamSecurity({
    maxViolations: 3,
    requireFullscreen:
      typeof document !== "undefined" && document.fullscreenEnabled,
    onViolation: (_reason, count) => {
      if (count >= 3) {
        actions.submitAttempt();
      }
    },
  });

  const data = useMemo(() => {
    if (enableMock) return generateMockTest();
    // TODO: Replace with real fetch once student APIs are available
    return generateMockTest();
  }, [enableMock]);

  const flatQuestions = useMemo(
    () => data.sections.flatMap((s) => s.questions),
    [data.sections]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    actions.startAttempt({
      durationMinutes: data.durationMinutes,
      totalQuestions: flatQuestions.length,
    });
    // Try to start lockdown features
    security.enterFullscreen();
    security.startMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const currentQuestion = flatQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flatQuestions.length - 1;

  const remainingMs = Math.max(
    0,
    (state.startedAtMs ?? 0) + state.durationMinutes * 60_000 - Date.now()
  );
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

  // Auto-submit on timer expiry once
  useEffect(() => {
    if (state.active && remainingMs <= 0) {
      security.stopMedia();
      security.exitFullscreen();
      actions.submitAttempt();
    }
  }, [remainingMs, state.active, actions, security]);

  useEffect(() => {
    if (!state.active) return;
    const t = setInterval(() => {
      // Trigger re-render each second via state setter
      actions.touch();
    }, 1000);
    return () => clearInterval(t);
  }, [state.active, actions]);

  // Stop media when attempt ends or component unmounts
  // IMPORTANT: depend on stable callbacks, not the whole security object
  const { stopMedia, exitFullscreen } = security;
  useEffect(() => {
    if (!state.active) {
      stopMedia();
      exitFullscreen();
    }
    return () => {
      stopMedia();
      exitFullscreen();
    };
  }, [state.active, stopMedia, exitFullscreen]);

  const handleAnswer = (answer: unknown) => {
    actions.saveAnswer(currentQuestion.id, answer);
  };

  const toggleReview = () => {
    setMarkedForReview((m) => ({
      ...m,
      [currentQuestion.id]: !m[currentQuestion.id],
    }));
  };

  const submit = () => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm(
            "Submit your test? You cannot change answers after submit."
          )
        : true;
    if (!ok) return;
    // Stop proctoring immediately when ending attempt
    security.stopMedia();
    security.exitFullscreen();
    actions.submitAttempt();
  };

  // Show submission summary screen when not active and submitted
  if (!state.active && state.submittedAtMs) {
    const submittedDate = new Date(state.submittedAtMs).toLocaleString();
    const questionsCount = (() => {
      // Fallback if engine unmounted data; try to reconstruct quickly
      return 0;
    })();
    const answeredCount = Object.keys(state.answers).filter(
      (k) =>
        state.answers[k] !== undefined &&
        state.answers[k] !== null &&
        state.answers[k] !== ""
    ).length;
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8 text-center space-y-4">
        <div className="text-2xl font-semibold">Submission complete</div>
        <div className="text-muted-foreground">
          Submitted on {submittedDate}
        </div>
        <div className="text-sm">Answered {answeredCount} questions</div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button onClick={() => router.push("/student/tests")}>
            Back to tests
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b bg-[radial-gradient(80rem_50rem_at_120%_-10%,theme(colors.primary/8),transparent_60%)] supports-[padding:max(0px)]
        pb-[max(theme(spacing.2),env(safe-area-inset-top))] pt-[max(theme(spacing.2),env(safe-area-inset-top))]"
      >
        <div className="flex items-center gap-2 text-sm">
          <Badge
            variant={remainingMinutes < 5 ? "destructive" : "secondary"}
            className="gap-1"
          >
            <Clock className="h-3.5 w-3.5" /> {remainingMinutes}:
            {remainingSeconds.toString().padStart(2, "0")}
          </Badge>
          <span className="text-muted-foreground">
            Q {currentIndex + 1} / {flatQuestions.length}
          </span>
          <Badge
            variant={security.violations > 0 ? "destructive" : "outline"}
            className="gap-1"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Violations:{" "}
            {security.violations}/{security.maxViolations}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={
              markedForReview[currentQuestion.id] ? "default" : "outline"
            }
            size="sm"
            onClick={toggleReview}
          >
            <Flag className="mr-2 h-4 w-4" /> Mark for review
          </Button>
          <Button size="sm" onClick={submit}>
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 sm:gap-4 p-3 sm:p-4 pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
        <div className="min-h-[50vh] sm:min-h-[60vh]">
          <QuestionRenderer
            key={currentQuestion.id}
            question={currentQuestion}
            value={state.answers[currentQuestion.id]}
            onChange={handleAnswer}
          />

          <div className="mt-4 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              disabled={isFirst}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            <div className="flex-1" />
            <Button
              disabled={isLast}
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(flatQuestions.length - 1, i + 1)
                )
              }
            >
              Next
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border rounded-lg p-3">
            <div className="mb-2 text-sm font-medium">Question Palette</div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {flatQuestions.map((q, idx) => {
                const answered =
                  state.answers[q.id] !== undefined &&
                  state.answers[q.id] !== null &&
                  state.answers[q.id] !== "";
                const isCurrent = idx === currentIndex;
                const review = markedForReview[q.id];
                return (
                  <button
                    key={q.id}
                    className={
                      "h-9 rounded text-xs font-medium border transition-colors " +
                      (isCurrent
                        ? "bg-primary text-primary-foreground"
                        : answered
                        ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800"
                        : review
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-800"
                        : "hover:bg-muted")
                    }
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" /> Proctoring
              </div>
              {security.mediaStream ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={security.isRequestingMedia}
                  onClick={() => security.startMedia()}
                >
                  {security.isRequestingMedia ? "Requesting…" : "Enable"}
                </Button>
              )}
            </div>
            {security.mediaError ? (
              <div className="text-xs text-destructive">
                {security.mediaError}. Please allow camera and microphone in
                your browser permissions and click Enable again.
              </div>
            ) : null}
            <video
              ref={security.videoRef}
              muted
              autoPlay
              playsInline
              className="w-full h-28 sm:h-40 object-cover rounded-md bg-black"
            />
            {!security.isFullscreen && (
              <Button
                size="sm"
                className="w-full"
                variant="secondary"
                onClick={() => security.enterFullscreen()}
              >
                Enter Fullscreen
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
