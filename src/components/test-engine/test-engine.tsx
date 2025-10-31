"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "./question-renderer";
import { useExamSecurity } from "@/hooks/use-exam-security";
import { useRouter } from "next/navigation";
import { useAttemptTimer } from "@/hooks/use-attempt-timer";
import { useProctoringOnAttempt } from "@/hooks/use-proctoring-on-attempt";
import { generateMockTest } from "@/lib/utils/test-mock";
import { getAnsweredCount } from "@/lib/utils/test-engine";
import { TestHeaderBar } from "@/components/test-engine/test-header-bar";
import { QuestionPalette } from "@/components/test-engine/question-palette";
import { ProctoringPanel } from "@/components/test-engine/proctoring-panel";
import {
  useAttemptDetails,
  useSaveAnswer,
  useSubmitAttempt,
  useAttemptResults,
  AttemptDetails,
} from "@/hooks/test-attempts-client";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { ErrorMessage } from "@/components/common/error-message";
import type { EngineQuestion } from "@/lib/types/test-engine";

export function TestEngine({
  testId,
  attemptId,
  enableMock = false,
}: {
  testId: string;
  attemptId?: string;
  enableMock?: boolean;
}) {
  const [markedForReview, setMarkedForReview] = useState<
    Record<string, boolean>
  >({});
  const [localAnswers, setLocalAnswers] = useState<Record<string, unknown>>({});
  const [answerTimeSpent, setAnswerTimeSpent] = useState<
    Record<string, number>
  >({});
  const router = useRouter();

  // Backend API hooks
  const {
    data: attemptData,
    isLoading: isLoadingAttempt,
    error: attemptError,
  } = useAttemptDetails(attemptId && !enableMock ? attemptId : undefined);

  const saveAnswerMutation = useSaveAnswer();
  const submitMutation = useSubmitAttempt();
  const { data: resultsData, isLoading: isLoadingResults } = useAttemptResults(
    attemptId && !enableMock && submitMutation.isSuccess ? attemptId : undefined
  );

  const security = useExamSecurity({
    maxViolations: 3,
    requireFullscreen:
      typeof document !== "undefined" && document.fullscreenEnabled,
    onViolation: (_reason, count) => {
      if (count >= 3 && attemptId) {
        handleSubmit();
      }
    },
  });

  // Use mock or real data
  const data = useMemo(() => {
    if (enableMock) return generateMockTest();
    if (!attemptData?.data) return null;

    const attempt = attemptData.data as AttemptDetails;
    // Transform backend data to match expected format
    return {
      durationMinutes: attempt.durationMinutes || 60,
      sections: attempt.questions.reduce((acc, q) => {
        const sectionId = q.sectionId || "default";
        let section = acc.find((s) => s.id === sectionId);
        if (!section) {
          section = { id: sectionId, name: "Questions", questions: [] };
          acc.push(section);
        }
        section.questions.push({
          id: q.id,
          text: q.text,
          imageUrl: q.imageUrl,
          type: q.type as EngineQuestion["type"],
          options: (q.options || []).map((opt) => ({
            id: opt.id,
            text: opt.text,
            imageUrl:
              "imageUrl" in opt && typeof opt.imageUrl === "string"
                ? opt.imageUrl
                : undefined,
            isCorrect: opt.isCorrect,
          })),
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks || 0,
        });
        return acc;
      }, [] as Array<{ id: string; name: string; questions: EngineQuestion[] }>),
    };
  }, [enableMock, attemptData]);

  const flatQuestions = useMemo(
    () =>
      (data?.sections.flatMap((s) => s.questions) || []) as EngineQuestion[],
    [data?.sections]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = flatQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === flatQuestions.length - 1;

  // Get attempt state from backend or local
  const attemptStartedAt = attemptData?.data?.startedAt
    ? new Date(attemptData.data.startedAt).getTime()
    : undefined;
  const attemptSubmittedAt = attemptData?.data?.submittedAt
    ? new Date(attemptData.data.submittedAt).getTime()
    : undefined;
  const isActive = attemptStartedAt && !attemptSubmittedAt;
  const durationMinutes = data?.durationMinutes || 0;

  // Initialize answers from backend if available
  useEffect(() => {
    if (attemptData?.data?.answers) {
      setLocalAnswers(attemptData.data.answers as Record<string, unknown>);
    }
  }, [attemptData]);

  // Track time spent on current question
  const [questionStartTime] = useState(() => Date.now());
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      const currentQ = flatQuestions[currentIndex];
      if (currentQ) {
        setAnswerTimeSpent((prev) => ({
          ...prev,
          [currentQ.id]: (prev[currentQ.id] || 0) + 1,
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, currentIndex, flatQuestions]);

  useProctoringOnAttempt(
    security.enterFullscreen,
    security.startMedia,
    security.stopMedia,
    security.exitFullscreen
  );

  // Drive countdown from a small timer hook
  const {
    remainingMs,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
  } = useAttemptTimer(attemptStartedAt, durationMinutes, () => {
    // Touch function - can be empty for backend-driven
  });

  // Auto-submit on timer expiry once
  useEffect(() => {
    if (isActive && remainingMs <= 0 && attemptId && !enableMock) {
      security.stopMedia();
      security.exitFullscreen();
      handleSubmit();
    }
  }, [remainingMs, isActive, attemptId, enableMock, security]);

  // Stop media when attempt ends or component unmounts
  // IMPORTANT: depend on stable callbacks, not the whole security object
  const { stopMedia, exitFullscreen } = security;
  useEffect(() => {
    if (!isActive) {
      stopMedia();
      exitFullscreen();
    }
    return () => {
      stopMedia();
      exitFullscreen();
    };
  }, [isActive, stopMedia, exitFullscreen]);

  // Save answer to backend (with debouncing could be added)
  const handleAnswer = useCallback(
    (answer: unknown) => {
      if (!currentQuestion) return;

      if (!attemptId || enableMock) {
        // Fallback to local state for mock
        setLocalAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: answer,
        }));
        return;
      }

      // Update local state immediately
      setLocalAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));

      // Determine answer payload based on question type
      const question = currentQuestion;
      const timeSpent = answerTimeSpent[currentQuestion.id] || 0;

      const payload: {
        questionId: string;
        selectedOptionId?: string;
        textAnswer?: string;
        timeSpentSeconds: number;
        isMarkedForReview?: boolean;
      } = {
        questionId: currentQuestion.id,
        timeSpentSeconds: timeSpent,
        isMarkedForReview: markedForReview[currentQuestion.id] || false,
      };

      if (question.type === "MCQ" || question.type === "TRUE_FALSE") {
        if (typeof answer === "string") {
          payload.selectedOptionId = answer;
        } else if (
          answer &&
          typeof answer === "object" &&
          "optionId" in answer
        ) {
          payload.selectedOptionId = answer.optionId as string;
        }
      } else if (
        question.type === "FILL_BLANK" ||
        question.type === "NUMERICAL"
      ) {
        payload.textAnswer = String(answer || "");
      }

      // Save to backend
      saveAnswerMutation.mutate(
        { attemptId, payload },
        {
          onError: (error) => {
            console.error("Failed to save answer:", error);
            // Optionally show error notification
          },
        }
      );
    },
    [
      attemptId,
      enableMock,
      currentQuestion,
      answerTimeSpent,
      markedForReview,
      saveAnswerMutation,
    ]
  );

  const toggleReview = useCallback(() => {
    const newMarked = !markedForReview[currentQuestion.id];
    setMarkedForReview((m) => ({
      ...m,
      [currentQuestion.id]: newMarked,
    }));

    // If backend-driven, update the answer with review flag
    if (attemptId && !enableMock && currentQuestion) {
      const timeSpent = answerTimeSpent[currentQuestion.id] || 0;
      const currentAnswer = localAnswers[currentQuestion.id];

      const payload: {
        questionId: string;
        selectedOptionId?: string;
        textAnswer?: string;
        timeSpentSeconds: number;
        isMarkedForReview: boolean;
      } = {
        questionId: currentQuestion.id,
        timeSpentSeconds: timeSpent,
        isMarkedForReview: newMarked,
      };

      if (currentAnswer) {
        if (
          currentQuestion.type === "MCQ" ||
          currentQuestion.type === "TRUE_FALSE"
        ) {
          if (typeof currentAnswer === "string") {
            payload.selectedOptionId = currentAnswer;
          }
        } else {
          payload.textAnswer = String(currentAnswer);
        }
      }

      saveAnswerMutation.mutate({ attemptId, payload });
    }
  }, [
    markedForReview,
    currentQuestion,
    attemptId,
    enableMock,
    answerTimeSpent,
    localAnswers,
    saveAnswerMutation,
  ]);

  const handleSubmit = useCallback(async () => {
    if (enableMock) {
      // Mock submission
      if (
        typeof window !== "undefined" &&
        window.confirm(
          "Submit your test? You cannot change answers after submit."
        )
      ) {
        security.stopMedia();
        security.exitFullscreen();
        // For mock, just update local state
        return;
      }
      return;
    }

    if (!attemptId) {
      console.error("No attemptId available");
      return;
    }

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

    try {
      await submitMutation.mutateAsync(attemptId);
    } catch (error) {
      console.error("Failed to submit attempt:", error);
      // Show error message
    }
  }, [attemptId, enableMock, submitMutation, security]);

  // Loading state
  if (!enableMock && attemptId && isLoadingAttempt) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (!enableMock && attemptId && attemptError) {
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8">
        <ErrorMessage
          error={
            (attemptError as { message?: string })?.message ||
            "Failed to load attempt details. Please try again."
          }
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/student/tests")}>
            Back to Tests
          </Button>
        </div>
      </Card>
    );
  }

  // No data state
  if (!data || flatQuestions.length === 0) {
    return (
      <Card className="mx-auto my-10 max-w-3xl p-8 text-center">
        <div className="text-lg font-semibold mb-2">No questions available</div>
        <Button onClick={() => router.push("/student/tests")}>
          Back to Tests
        </Button>
      </Card>
    );
  }

  // Show submission summary screen when not active and submitted
  if (!isActive && attemptSubmittedAt) {
    const submittedDate = new Date(attemptSubmittedAt).toLocaleString();
    const answeredCount = getAnsweredCount(localAnswers);
    const results = resultsData?.data;

    return (
      <Card className="mx-auto my-10 max-w-3xl p-8 text-center space-y-4">
        {isLoadingResults ? (
          <>
            <div className="text-2xl font-semibold">Submitting...</div>
            <div className="text-muted-foreground">
              Please wait while we evaluate your test
            </div>
          </>
        ) : results ? (
          <>
            <div className="text-2xl font-semibold">
              Test Submitted Successfully!
            </div>
            <div className="text-muted-foreground">
              Submitted on {submittedDate}
            </div>
            <div className="space-y-2 pt-4">
              <div className="text-lg">
                <span className="font-semibold">Score: </span>
                {results.totalScore} /{" "}
                {flatQuestions.reduce((sum, q) => sum + (q?.marks || 1), 0)}
              </div>
              <div className="text-lg">
                <span className="font-semibold">Percentage: </span>
                {results.percentage.toFixed(2)}%
              </div>
              {results.rank && (
                <div className="text-lg">
                  <span className="font-semibold">Rank: </span>#{results.rank}
                  {results.percentile &&
                    ` (${results.percentile.toFixed(1)} percentile)`}
                </div>
              )}
              <div className="text-sm text-muted-foreground pt-2">
                Answered {answeredCount} out of {flatQuestions.length} questions
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold">Submission complete</div>
            <div className="text-muted-foreground">
              Submitted on {submittedDate}
            </div>
            <div className="text-sm">Answered {answeredCount} questions</div>
          </>
        )}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button onClick={() => router.push("/student/tests")}>
            Back to tests
          </Button>
          {results && attemptId && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/student/tests/${testId}/results?attemptId=${attemptId}`
                )
              }
            >
              View Detailed Results
            </Button>
          )}
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
        markedForReview={
          currentQuestion ? Boolean(markedForReview[currentQuestion.id]) : false
        }
        onToggleReview={toggleReview}
        onSubmit={handleSubmit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3 sm:gap-4 p-3 sm:p-4 pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
        <div className="min-h-[50vh] sm:min-h-[60vh]">
          {currentQuestion && (
            <QuestionRenderer
              key={currentQuestion.id}
              question={currentQuestion}
              value={localAnswers[currentQuestion.id]}
              onChange={handleAnswer}
            />
          )}

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
                if (!q) return acc;
                acc[idx] =
                  localAnswers[q.id] !== undefined &&
                  localAnswers[q.id] !== null &&
                  localAnswers[q.id] !== "";
                return acc;
              },
              {}
            )}
            reviewMap={flatQuestions.reduce<Record<number, boolean>>(
              (acc, q, idx) => {
                if (!q) return acc;
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
