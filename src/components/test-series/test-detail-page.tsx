"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  List,
  HelpCircle,
  GripVertical,
  Settings,
} from "lucide-react";
import {
  useTest,
  useDeleteTest,
  useUpdateTest,
  useTestSections,
  useCreateTestSection,
  useDeleteSection,
  useSectionQuestions,
  useCreateSectionQuestion,
  useDeleteQuestion,
  Test,
  Section,
  Question,
} from "@/hooks/test-series";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { SectionManager } from "./section-manager";
import { CreateSectionModal } from "./create-section-modal";
import { CreateQuestionModal } from "./create-question-modal";

interface TestDetailPageProps {
  basePath?: "admin" | "teacher";
}

export function TestDetailPage({ basePath = "admin" }: TestDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.id as string;
  const testId = params.testId as string;
  const [activeTab, setActiveTab] = useState("sections");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateSectionModalOpen, setIsCreateSectionModalOpen] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] =
    useState(false);

  // Data fetching
  const { data: testData, isLoading, refetch: refetchTest } = useTest(testId);
  const { data: sectionsData, refetch: refetchSections } =
    useTestSections(testId);

  // Mutations
  const deleteMutation = useDeleteTest();

  const test = testData?.data as Test | undefined;
  const sections = (sectionsData?.data as Section[]) || [];

  const handleGoBack = () => {
    router.push(`/${basePath}/test-series/${testSeriesId}`);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(testId);
      router.push(`/${basePath}/test-series/${testSeriesId}`);
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  };

  const handleCreateSection = () => {
    setSelectedSection(null);
    setIsCreateSectionModalOpen(true);
  };

  const handleCreateQuestion = (section: Section) => {
    setSelectedSection(section);
    setIsCreateQuestionModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Test Not Found</h3>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Test Series
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Test Series
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight mb-4">
                {test.title}
              </h1>
              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{test.durationMinutes} minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{test.totalMarks} marks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>{test.sectionCount} sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>{test.questionCount} questions</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <Badge
                  variant={test.isPublished ? "default" : "secondary"}
                  className={
                    test.isPublished
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : ""
                  }
                >
                  {test.isPublished ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Published
                    </>
                  ) : (
                    <>
                      <Settings className="mr-1 h-3 w-3" />
                      Draft
                    </>
                  )}
                </Badge>
                {test.isFree && (
                  <Badge variant="outline" className="bg-blue-50">
                    Free
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Test Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Passing Marks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{test.passingMarks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{test.sectionCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {test.questionCount || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{test.attemptCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="sections">
              Sections
              {sections.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {sections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sections</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Organize questions into sections for better structure
                  </p>
                </div>
                <Button onClick={handleCreateSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <List className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Sections Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first section to start adding questions
                    </p>
                    <Button onClick={handleCreateSection}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Section
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {sections.map((section, index) => (
                        <SectionManager
                          key={section.id}
                          section={section}
                          testId={testId}
                          index={index}
                          onAddQuestion={() => handleCreateQuestion(section)}
                          onRefetch={() => {
                            refetchSections();
                            refetchTest();
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      Show Answers After Submit
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {test.showAnswersAfterSubmit ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Allow Review</p>
                    <p className="text-sm text-muted-foreground">
                      {test.allowReview ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Shuffle Questions</p>
                    <p className="text-sm text-muted-foreground">
                      {test.shuffleQuestions ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(test.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateSectionModal
          open={isCreateSectionModalOpen}
          onOpenChange={setIsCreateSectionModalOpen}
          testId={testId}
          onSuccess={() => {
            refetchSections();
            refetchTest();
            setIsCreateSectionModalOpen(false);
          }}
        />

        {selectedSection && (
          <CreateQuestionModal
            open={isCreateQuestionModalOpen}
            onOpenChange={setIsCreateQuestionModalOpen}
            sectionId={selectedSection.id}
            onSuccess={() => {
              refetchSections();
              refetchTest();
              setIsCreateQuestionModalOpen(false);
              setSelectedSection(null);
            }}
          />
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Test</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this test? This action cannot be
                undone and will delete all sections and questions.
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
                onClick={handleDelete}
                variant="destructive"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
