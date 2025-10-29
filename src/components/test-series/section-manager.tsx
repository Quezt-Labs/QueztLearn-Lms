"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  FileQuestion,
  Award,
  Eye,
  Layers,
} from "lucide-react";
import {
  useSectionQuestions,
  useDeleteSection,
  Section,
  Question,
} from "@/hooks/test-series";
import { EditSectionModal } from "./edit-section-modal";
import { ViewQuestionsModal } from "./view-questions-modal";
import { BulkAddQuestionsModal } from "./bulk-add-questions-modal";

interface SectionManagerProps {
  section: Section;
  testId: string;
  index: number;
  onAddQuestion: () => void;
  onRefetch: () => void;
}

export function SectionManager({
  section,
  testId: _testId,
  index,
  onAddQuestion,
  onRefetch,
}: SectionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewQuestionsModalOpen, setIsViewQuestionsModalOpen] =
    useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);

  const { data: questionsData, refetch: refetchQuestions } =
    useSectionQuestions(section.id);
  const deleteSectionMutation = useDeleteSection();

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="shrink-0">
                      <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="text-xl font-bold mb-1 text-foreground">
                        {section.name}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className="bg-background border-border px-3 py-1"
                      >
                        <FileQuestion className="h-3 w-3 mr-1.5" />
                        {section.questionCount || 0} Questions
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
                      >
                        <Award className="h-3 w-3 mr-1.5" />
                        {section.totalMarks} Marks
                      </Badge>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="px-6 py-5 bg-muted/20">
                {/* Section Actions Bar */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/50">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Section {section.displayOrder}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {questions.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsViewQuestionsModalOpen(true);
                        }}
                        className="h-9"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Questions ({questions.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditModalOpen(true);
                      }}
                      className="h-9"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Section
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBulkAddModalOpen(true);
                      }}
                      className="h-9"
                    >
                      <Layers className="mr-2 h-4 w-4" />
                      Bulk Add
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddQuestion();
                      }}
                      className="h-9"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add One
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteDialogOpen(true);
                      }}
                      className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Questions Summary */}
                {questions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50"
                  >
                    <HelpCircle className="h-14 w-14 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      No Questions Yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Add questions to this section to get started. You can add
                      them one by one or in bulk.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBulkAddModalOpen(true);
                        }}
                        size="lg"
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        Bulk Add Questions
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddQuestion();
                        }}
                        size="lg"
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Single Question
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                      <FileQuestion className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        {questions.length} Question
                        {questions.length !== 1 ? "s" : ""} in this section
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Click &quot;View Questions&quot; to see and manage all questions
                    </p>
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

      <ViewQuestionsModal
        open={isViewQuestionsModalOpen}
        onOpenChange={setIsViewQuestionsModalOpen}
        sectionName={section.name}
        questions={questions}
        onRefetch={() => {
          refetchQuestions();
          onRefetch();
        }}
      />

      <BulkAddQuestionsModal
        open={isBulkAddModalOpen}
        onOpenChange={setIsBulkAddModalOpen}
        sectionId={section.id}
        onSuccess={() => {
          refetchQuestions();
          onRefetch();
          setIsBulkAddModalOpen(false);
        }}
      />
    </>
  );
}
