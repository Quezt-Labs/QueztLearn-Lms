"use client";

import { useParams, useSearchParams } from "next/navigation";
import { TestEngine } from "@/components/test-engine/test-engine";

export default function TestAttemptPage() {
  const params = useParams<{ testId: string }>();
  const searchParams = useSearchParams();
  const testId = params.testId;
  const mock = searchParams.get("mock") === "1";

  return <TestEngine testId={testId} enableMock={mock} />;
}
