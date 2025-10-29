"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  useCreateSectionQuestion,
  QuestionType,
  DifficultyLevel,
  QuestionOption,
} from "@/hooks/test-series";

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onSuccess?: () => void;
}

const QUESTION_TYPES: QuestionType[] = [
  "MCQ",
  "TRUE_FALSE",
  "FILL_BLANK",
  "NUMERICAL",
];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

export function CreateQuestionModal({
  open,
  onOpenChange,
  sectionId,
  onSuccess,
}: CreateQuestionModalProps) {
  const [formData, setFormData] = useState({
    text: "",
    imageUrl: "",
    type: "MCQ" as QuestionType,
    difficulty: "MEDIUM" as DifficultyLevel,
    marks: 1,
    negativeMarks: 0.25,
    explanation: "",
    explanationImageUrl: "",
    options: [
      { text: "", isCorrect: false, displayOrder: 0 },
      { text: "", isCorrect: false, displayOrder: 1 },
      { text: "", isCorrect: false, displayOrder: 2 },
      { text: "", isCorrect: false, displayOrder: 3 },
    ] as QuestionOption[],
  });

  const createMutation = useCreateSectionQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate options for MCQ
    if (formData.type === "MCQ") {
      const hasCorrect = formData.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        alert("Please mark at least one option as correct");
        return;
      }
      const hasAllText = formData.options.every((opt) => opt.text.trim());
      if (!hasAllText) {
        alert("Please fill in all options");
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        sectionId,
        data: {
          text: formData.text,
          imageUrl: formData.imageUrl || undefined,
          type: formData.type,
          difficulty: formData.difficulty,
          marks: formData.marks,
          negativeMarks: formData.negativeMarks,
          explanation: formData.explanation || undefined,
          explanationImageUrl: formData.explanationImageUrl || undefined,
          options:
            formData.type === "MCQ" || formData.type === "TRUE_FALSE"
              ? formData.options.filter((opt) => opt.text.trim())
              : undefined,
        },
      });

      // Reset form
      setFormData({
        text: "",
        imageUrl: "",
        type: "MCQ",
        difficulty: "MEDIUM",
        marks: 1,
        negativeMarks: 0.25,
        explanation: "",
        explanationImageUrl: "",
        options: [
          { text: "", isCorrect: false, displayOrder: 0 },
          { text: "", isCorrect: false, displayOrder: 1 },
          { text: "", isCorrect: false, displayOrder: 2 },
          { text: "", isCorrect: false, displayOrder: 3 },
        ],
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create question:", error);
    }
  };

  const handleOptionChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    const newOptions = [...formData.options];
    if (field === "text") {
      newOptions[index] = { ...newOptions[index], text: value as string };
    } else {
      newOptions[index] = { ...newOptions[index], isCorrect: value as boolean };
    }
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          text: "",
          isCorrect: false,
          displayOrder: formData.options.length,
        },
      ],
    });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Add a new question to this section
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Question Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as QuestionType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    difficulty: value as DifficultyLevel,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marks">
                Marks <span className="text-red-500">*</span>
              </Label>
              <Input
                id="marks"
                type="number"
                min="1"
                value={formData.marks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marks: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="text">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="text"
              placeholder="Enter your question here..."
              rows={3}
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              required
            />
          </div>

          {/* Question Image */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Question Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
            />
          </div>

          {/* Negative Marks */}
          <div className="space-y-2">
            <Label htmlFor="negativeMarks">Negative Marks</Label>
            <Input
              id="negativeMarks"
              type="number"
              min="0"
              step="0.25"
              value={formData.negativeMarks}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  negativeMarks: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Options - Only for MCQ and TRUE_FALSE */}
          {(formData.type === "MCQ" || formData.type === "TRUE_FALSE") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                {formData.type === "MCQ" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 border rounded-lg"
                  >
                    <input
                      type={
                        formData.type === "TRUE_FALSE" ? "radio" : "checkbox"
                      }
                      checked={option.isCorrect}
                      onChange={(e) =>
                        handleOptionChange(index, "isCorrect", e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, "text", e.target.value)
                      }
                      className="flex-1"
                    />
                    {formData.type === "MCQ" && formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              placeholder="Explain the correct answer..."
              rows={3}
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
