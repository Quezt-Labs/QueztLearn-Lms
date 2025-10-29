"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  HelpCircle,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import {
  useSectionQuestions,
  useDeleteSection,
  useDeleteQuestion,
  Section,
  Question,
} from "@/hooks/test-series";
import { QuestionItem } from "./question-item";
import { EditSectionModal } from "./edit-section-modal";

interface SectionManagerProps {
  section: Section;
  testId: string;
  index: number;
  onAddQuestion: () => void;
  onRefetch: () => void;
}

export function SectionManager({
  section,
  testId,
  index,
  onAddQuestion,
  onRefetch,
}: SectionManagerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const { data: questionsData, refetch: refetchQuestions } =
    useSectionQuestions(section.id);
  const deleteSectionMutation = useDeleteSection();
  const deleteQuestionMutation = useDeleteQuestion();

  const questions = (questionsData?.data as Question[]) || [];

  const handleDeleteSection = async () => {
    try {
      await deleteSectionMutation.mutateAsync(section.id);
      setIsDeleteDialogOpen(false);
      onRefetch();
    } catch (error) {
      console.error("Failed to delete section:", error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;
    try {
      await deleteQuestionMutation.mutateAsync(deleteQuestionId);
      setDeleteQuestionId(null);
      refetchQuestions();
      onRefetch();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <CardTitle className="text-lg mb-1">
                        {section.name}
                      </CardTitle>
                      {section.description && (
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        {section.questionCount || 0} Questions
                      </Badge>
                      <Badge variant="secondary">
                        {section.totalMarks} Marks
                      </Badge>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="text-sm text-muted-foreground">
                    Section {section.displayOrder}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Section
                    </Button>
                    <Button variant="outline" size="sm" onClick={onAddQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Questions Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add questions to this section to get started
                    </p>
                    <Button onClick={onAddQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question, qIndex) => (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        index={qIndex}
                        onDelete={() => setDeleteQuestionId(question.id)}
                        onRefetch={() => {
                          refetchQuestions();
                          onRefetch();
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      <EditSectionModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        section={section}
        onSuccess={() => {
          onRefetch();
          setIsEditModalOpen(false);
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This will also
              delete all questions in this section. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSection}
              variant="destructive"
              disabled={deleteSectionMutation.isPending}
            >
              {deleteSectionMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={handleDeleteQuestion}
              variant="destructive"
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
