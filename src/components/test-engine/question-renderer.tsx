"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  question: {
    id: string;
    text: string;
    type: "MCQ" | "TRUE_FALSE" | "NUMERICAL" | "FILL_BLANK";
    options?: Array<{ id: string; text: string }>;
  };
  value: unknown;
  onChange: (value: unknown) => void;
};

export function QuestionRenderer({ question, value, onChange }: Props) {
  if (question.type === "MCQ") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
            className="space-y-3"
          >
            {question.options?.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <RadioGroupItem id={`${question.id}-${opt.id}`} value={opt.id} />
                <Label htmlFor={`${question.id}-${opt.id}`}>{opt.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
            className="space-y-3"
          >
            {[
              { id: "TRUE", text: "True" },
              { id: "FALSE", text: "False" },
            ].map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <RadioGroupItem id={`${question.id}-${opt.id}`} value={opt.id} />
                <Label htmlFor={`${question.id}-${opt.id}`}>{opt.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    );
  }

  // Basic fallback for other types (to be enhanced)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>Unsupported question type</CardContent>
    </Card>
  );
}


