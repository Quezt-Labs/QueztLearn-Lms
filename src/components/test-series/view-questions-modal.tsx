"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import {
  Question,
  QuestionType,
  useDeleteQuestion,
} from "@/hooks/test-series";
import { EditQuestionModal } from "./edit-question-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ViewQuestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  questions: Question[];
  onRefetch: () => void;
}

const difficultyColors = {
  EASY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  MEDIUM:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  HARD: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800",
};

const typeLabels: Record<QuestionType, string> = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill in the Blank",
  NUMERICAL: "Numerical",
};

export function ViewQuestionsModal({
  open,
  onOpenChange,
  sectionName,
  questions,
  onRefetch,
}: ViewQuestionsModalProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const deleteMutation = useDeleteQuestion();

  const handleDelete = async () => {
    if (!deleteQuestionId) return;
    try {
      await deleteMutation.mutateAsync(deleteQuestionId);
      setDeleteQuestionId(null);
      onRefetch();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Questions - {sectionName}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  View and manage all questions in this section
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            {questions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-muted-foreground mb-4">
                  No questions yet
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                <AnimatePresence>
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="border-2 border-border rounded-lg p-5 bg-background hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Question Number */}
                            <div className="shrink-0">
                              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1 min-w-0 space-y-4">
                              <div>
                                <h4 className="text-base font-semibold leading-relaxed text-foreground mb-2">
                                  {question.text}
                                </h4>
                                {question.imageUrl && (
                                  <div className="mt-3 relative">
                                    <img
                                      src={question.imageUrl}
                                      alt="Question"
                                      className="max-w-md rounded-lg border-2 border-border shadow-sm"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Metadata */}
                              <div className="flex items-center flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-medium bg-background border-border"
                                >
                                  {typeLabels[question.type]}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-semibold border ${
                                    difficultyColors[question.difficulty]
                                  }`}
                                >
                                  {question.difficulty}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-medium bg-background border-border"
                                >
                                  {question.marks} mark
                                  {question.marks !== 1 ? "s" : ""}
                                </Badge>
                                {question.negativeMarks > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-medium text-destructive bg-destructive/10 border-destructive/20"
                                  >
                                    -{question.negativeMarks} penalty
                                  </Badge>
                                )}
                              </div>

                              {/* Options */}
                              {question.options &&
                                question.options.length > 0 && (
                                  <div className="mt-4 space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                      Options
                                    </div>
                                    {question.options.map(
                                      (option, optIndex) => (
                                        <div
                                          key={option.id || optIndex}
                                          className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                                            option.isCorrect
                                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                                              : "bg-muted/50 border-border/50"
                                          }`}
                                        >
                                          <div className="shrink-0 mt-0.5">
                                            {option.isCorrect ? (
                                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                              <XCircle className="h-5 w-5 text-muted-foreground opacity-50" />
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <span
                                              className={`text-sm ${
                                                option.isCorrect
                                                  ? "font-semibold text-emerald-900 dark:text-emerald-100"
                                                  : "text-foreground"
                                              }`}
                                            >
                                              {String.fromCharCode(
                                                65 + optIndex
                                              )}
                                              . {option.text}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <div>
                                      <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-1">
                                        Explanation
                                      </div>
                                      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                                        {question.explanation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedQuestion(question);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteQuestionId(question.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedQuestion && (
        <EditQuestionModal
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setSelectedQuestion(null);
          }}
          question={selectedQuestion}
          onSuccess={() => {
            onRefetch();
            setIsEditModalOpen(false);
            setSelectedQuestion(null);
          }}
        />
      )}

      <Dialog
        open={!!deleteQuestionId}
        onOpenChange={() => setDeleteQuestionId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestionId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
