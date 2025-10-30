"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
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
  GripVertical,
  FileQuestion,
  Award,
  Layers,
  Eye,
  Upload,
  MoreVertical,
} from "lucide-react";
import {
  useSectionQuestions,
  useDeleteSection,
  Section,
  Question,
} from "@/hooks/test-series";
import { EditSectionModal } from "./edit-section-modal";
import { BulkAddQuestionsModal } from "./bulk-add-questions-modal";
import { CsvImportQuestionsModal } from "./csv-import-questions-modal";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SectionManagerProps {
  section: Section;
  testId: string;
  testSeriesId: string;
  index: number;
  onAddQuestion: () => void;
  onRefetch: () => void;
}

export function SectionManager({
  section,
  testId: _testId,
  testSeriesId,
  index,
  onAddQuestion,
  onRefetch,
}: SectionManagerProps) {
  // removed collapsible open state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);

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
        <Card className="overflow-hidden border-2 hover:border-primary/20 transition-colors">
          <CardHeader className="px-6 py-4">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                    }}
                    className="h-8"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBulkAddModalOpen(true);
                        }}
                      >
                        <Layers className="mr-2 h-4 w-4" /> Add Questions
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCsvImportModalOpen(true);
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/admin/test-series/${testSeriesId}/tests/${section.testId}/sections/${section.id}/questions`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="inline-flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Questions
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
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

      <CsvImportQuestionsModal
        open={isCsvImportModalOpen}
        onOpenChange={setIsCsvImportModalOpen}
        testId={section.testId}
        onSuccess={() => {
          refetchQuestions();
          onRefetch();
          setIsCsvImportModalOpen(false);
        }}
      />
    </>
  );
}
