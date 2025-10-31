"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type Props = {
  question: {
    id: string;
    text: string;
    type: "MCQ" | "TRUE_FALSE" | "NUMERICAL" | "FILL_BLANK";
    imageUrl?: string;
    options?: Array<{ id: string; text: string; imageUrl?: string }>;
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
          {question.imageUrl ? (
            <div className="mb-4 relative w-full h-60 sm:h-80 border rounded overflow-hidden bg-black/5">
              <Image
                src={question.imageUrl}
                alt="Question"
                fill
                sizes="(max-width: 640px) 100vw, 800px"
                style={{ objectFit: "contain" }}
                onClick={() =>
                  window.open(question.imageUrl as string, "_blank")
                }
              />
            </div>
          ) : null}
          <RadioGroup
            value={(value as string) ?? ""}
            onValueChange={(v) => onChange(v)}
            className="space-y-3"
          >
            {question.options?.map((opt) => (
              <div key={opt.id} className="flex items-start gap-3">
                <RadioGroupItem
                  id={`${question.id}-${opt.id}`}
                  value={opt.id}
                />
                <div className="flex-1">
                  <Label htmlFor={`${question.id}-${opt.id}`}>{opt.text}</Label>
                  {opt.imageUrl ? (
                    <div className="mt-2 relative w-full h-40 border rounded overflow-hidden bg-black/5">
                      <Image
                        src={opt.imageUrl}
                        alt="Option"
                        fill
                        sizes="(max-width: 640px) 100vw, 600px"
                        style={{ objectFit: "contain" }}
                        onClick={() =>
                          window.open(opt.imageUrl as string, "_blank")
                        }
                      />
                    </div>
                  ) : null}
                </div>
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
          {question.imageUrl ? (
            <div className="mb-4">
              <img
                src={question.imageUrl}
                alt="Question"
                className="w-full max-h-60 sm:max-h-80 object-contain rounded border"
                onClick={() =>
                  window.open(question.imageUrl as string, "_blank")
                }
              />
            </div>
          ) : null}
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
                <RadioGroupItem
                  id={`${question.id}-${opt.id}`}
                  value={opt.id}
                />
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
