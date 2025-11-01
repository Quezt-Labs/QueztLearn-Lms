"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { useStartAttempt } from "@/hooks/test-attempts-client";
import { useState } from "react";
import {
  ErrorMessage,
  SuccessMessage,
} from "@/components/common/error-message";

export default function TestInstructionsPage() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const startAttempt = useStartAttempt();

  const mock = searchParams.get("mock") === "1";
  const testId = params.testId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Instructions"
        description="Please read carefully before starting your test."
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Tests", href: "/student/tests" },
          { label: "Instructions" },
        ]}
      />

      <Card>
        {successMessage && (
          <SuccessMessage
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}
        {errorMessage && (
          <ErrorMessage
            error={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" /> General Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-2">
            <li>Timer will start immediately once you begin the test.</li>
            <li>You can navigate between sections and questions anytime.</li>
            <li>Mark questions for review and revisit them later.</li>
            <li>Your answers are autosaved locally as you progress.</li>
            <li>Do not refresh or close the tab during the test.</li>
          </ul>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/student/tests">Cancel</Link>
          </Button>
          <Button
            disabled={!mock && startAttempt.isPending}
            onClick={async () => {
              setErrorMessage(null);

              // Request fullscreen as part of user gesture (button click)
              try {
                if (
                  typeof document !== "undefined" &&
                  !document.fullscreenElement
                ) {
                  await document.documentElement.requestFullscreen();
                }
              } catch (e) {
                // Fullscreen request failed, but continue anyway
                console.warn("Fullscreen request failed:", e);
              }

              // For mock tests, skip API call and go directly to attempt
              if (mock) {
                router.push(`/student/tests/${testId}/attempt?mock=1`);
                return;
              }

              // For real tests, use API
              try {
                const res = await startAttempt.mutateAsync(testId);
                const attemptId = res.data.id;
                router.push(
                  `/student/tests/${testId}/attempt?attemptId=${attemptId}`
                );
              } catch (e) {
                const msg =
                  (e as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                  "Failed to start attempt. Please ensure you are enrolled.";
                setErrorMessage(msg);
              }
            }}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> I&apos;m ready, start test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
