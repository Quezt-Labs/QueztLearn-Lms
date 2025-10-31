"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "./question-renderer";
import { useAttemptState } from "@/hooks/test-engine";
import { useExamSecurity } from "@/hooks/use-exam-security";
import { useRouter } from "next/navigation";
import { useAttemptTimer } from "@/hooks/use-attempt-timer";
import { useProctoringOnAttempt } from "@/hooks/use-proctoring-on-attempt";
import { generateMockTest } from "@/lib/utils/test-mock";
import { getAnsweredCount } from "@/lib/utils/test-engine";
import { TestHeaderBar } from "@/components/test-engine/test-header-bar";
import { QuestionPalette } from "@/components/test-engine/question-palette";
import { ProctoringPanel } from "@/components/test-engine/proctoring-panel";

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

  // Initialize attempt state and start proctoring only on attempt route
  useEffect(() => {
    actions.startAttempt({
      durationMinutes: data.durationMinutes,
      totalQuestions: flatQuestions.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  useProctoringOnAttempt(security.enterFullscreen, security.startMedia);

  const currentQuestion = flatQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flatQuestions.length - 1;

  // Drive countdown from a small timer hook
  const {
    remainingMs,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  } = useAttemptTimer(state.startedAtMs, state.durationMinutes, actions.touch);

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
    const answeredCount = getAnsweredCount(state.answers);
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
      <TestHeaderBar
        remainingMinutes={remainingMinutes}
        remainingSeconds={remainingSeconds}
        currentIndex={currentIndex}
        totalQuestions={flatQuestions.length}
        violations={security.violations}
        maxViolations={security.maxViolations}
        markedForReview={Boolean(markedForReview[currentQuestion.id])}
        onToggleReview={toggleReview}
        onSubmit={submit}
      />

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
          <QuestionPalette
            total={flatQuestions.length}
            currentIndex={currentIndex}
            answeredMap={flatQuestions.reduce<Record<number, boolean>>(
              (acc, q, idx) => {
                acc[idx] =
                  state.answers[q.id] !== undefined &&
                  state.answers[q.id] !== null &&
                  state.answers[q.id] !== "";
                return acc;
              },
              {}
            )}
            reviewMap={flatQuestions.reduce<Record<number, boolean>>(
              (acc, q, idx) => {
                acc[idx] = Boolean(markedForReview[q.id]);
                return acc;
              },
              {}
            )}
            onSelect={(idx) => setCurrentIndex(idx)}
          />

          <ProctoringPanel
            mediaStream={security.mediaStream}
            isRequestingMedia={security.isRequestingMedia}
            startMedia={security.startMedia}
            mediaError={security.mediaError}
            videoRef={security.videoRef}
            isFullscreen={security.isFullscreen}
            enterFullscreen={security.enterFullscreen}
          />
        </div>
      </div>
    </Card>
  );
}
