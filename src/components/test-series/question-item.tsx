"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  HelpCircle,
  Award,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Question, QuestionType, DifficultyLevel } from "@/hooks/test-series";
import { EditQuestionModal } from "./edit-question-modal";

interface QuestionItemProps {
  question: Question;
  index: number;
  onDelete: () => void;
  onRefetch: () => void;
}

const difficultyColors = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const typeLabels: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill in the Blank",
  NUMERICAL: "Numerical",
};

export function QuestionItem({
  question,
  index,
  onDelete,
  onRefetch,
}: QuestionItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold line-clamp-2">
                      {question.text}
                    </h4>
                  </div>
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-w-xs rounded-lg border mb-2"
                    />
                  )}
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[question.type]}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        difficultyColors[question.difficulty]
                      }`}
                    >
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {question.marks} marks
                    </Badge>
                    {question.negativeMarks > 0 && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        -{question.negativeMarks} penalty
                      </Badge>
                    )}
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option.id || optIndex}
                          className={`flex items-center space-x-2 text-sm p-2 rounded ${
                            option.isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-muted"
                          }`}
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span
                            className={
                              option.isCorrect
                                ? "font-medium text-green-900 dark:text-green-100"
                                : ""
                            }
                          >
                            {String.fromCharCode(65 + optIndex)}. {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.explanation && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <EditQuestionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        question={question}
        onSuccess={() => {
          onRefetch();
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
}
