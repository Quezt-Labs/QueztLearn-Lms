"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  useGetSubject,
  useDeleteSubject,
  useGetChaptersBySubject,
  useDeleteChapter,
  useGetTopicsByChapter,
  useDeleteTopic,
} from "@/hooks";
import { CreateChapterModal } from "@/components/common/create-chapter-modal";
import { EditChapterModal } from "@/components/common/edit-chapter-modal";
import { CreateTopicModal } from "@/components/common/create-topic-modal";
import { EditTopicModal } from "@/components/common/edit-topic-modal";
import Image from "next/image";

interface Subject {
  id: string;
  name: string;
  batchId: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const subjectId = params.subjectId as string;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
  const [isEditChapterOpen, setIsEditChapterOpen] = useState(false);
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  const { data: subject, isLoading: subjectLoading } = useGetSubject(subjectId);
  const { data: chapters, isLoading: chaptersLoading } =
    useGetChaptersBySubject(subjectId);
  const deleteSubjectMutation = useDeleteSubject();
  const deleteChapterMutation = useDeleteChapter();
  const deleteTopicMutation = useDeleteTopic();

  const handleGoBack = () => {
    router.push(`/admin/courses/${courseId}`);
  };

  const handleDeleteSubject = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSubjectMutation.mutateAsync(subjectId);
      router.push(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  const handleAddChapter = () => {
    setIsCreateChapterOpen(true);
  };

  const handleChapterCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["chapters", "subject", subjectId],
    });
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsEditChapterOpen(true);
  };

  const handleChapterUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["chapters", "subject", subjectId],
    });
  };

  const handleDeleteChapter = async (chapter: Chapter) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${chapter.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteChapterMutation.mutateAsync(chapter.id);
        queryClient.invalidateQueries({
          queryKey: ["chapters", "subject", subjectId],
        });
      } catch (error) {
        console.error("Failed to delete chapter:", error);
      }
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleAddTopic = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChapter({ id: chapterId } as Chapter);
    setIsCreateTopicOpen(true);
  };

  const handleTopicCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["topics", "chapter", selectedChapter?.id],
    });
  };

  const handleEditTopic = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTopic(topic);
    setIsEditTopicOpen(true);
  };

  const handleTopicUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["topics", "chapter", selectedTopic?.chapterId],
    });
  };

  const handleDeleteTopic = async (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete "${topic.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteTopicMutation.mutateAsync(topic.id);
        queryClient.invalidateQueries({
          queryKey: ["topics", "chapter", topic.chapterId],
        });
      } catch (error) {
        console.error("Failed to delete topic:", error);
      }
    }
  };

  if (subjectLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Subject not found</h2>
            <Button onClick={handleGoBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjectData = subject.data || subject;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {subjectData.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage chapters, topics, and content for this subject
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleAddChapter}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
          <Button variant="outline" onClick={handleDeleteSubject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Subject
          </Button>
        </div>
      </div>

      {/* Subject Thumbnail */}
      {subjectData.thumbnailUrl && (
        <div className="mb-8">
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <Image
              src={subjectData.thumbnailUrl}
              alt={`Subject thumbnail for ${subjectData.name}`}
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle>Chapters ({chapters?.data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {chaptersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Loading chapters...
              </span>
            </div>
          ) : chapters?.data && chapters.data.length > 0 ? (
            <div className="space-y-3">
              {chapters.data.map((chapter: Chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  isExpanded={expandedChapters.has(chapter.id)}
                  onToggle={() => toggleChapter(chapter.id)}
                  onEdit={(e) => handleEditChapter(chapter)}
                  onDelete={() => handleDeleteChapter(chapter)}
                  onAddTopic={(e) => handleAddTopic(chapter.id, e)}
                  onEditTopic={(topic, e) => handleEditTopic(topic, e)}
                  onDeleteTopic={(topic, e) => handleDeleteTopic(topic, e)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No chapters yet</h3>
              <p className="text-muted-foreground mb-4">
                Click &quot;Add Chapter&quot; to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{subjectData.name}&quot;?
              This action cannot be undone. All chapters, topics, and content
              will be permanently removed.
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
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteSubjectMutation.isPending}
            >
              {deleteSubjectMutation.isPending
                ? "Deleting..."
                : "Delete Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <CreateChapterModal
        isOpen={isCreateChapterOpen}
        onClose={() => setIsCreateChapterOpen(false)}
        subjectId={subjectId}
        onSuccess={handleChapterCreated}
      />

      <EditChapterModal
        isOpen={isEditChapterOpen}
        onClose={() => {
          setIsEditChapterOpen(false);
          setSelectedChapter(null);
        }}
        chapter={selectedChapter}
        onSuccess={handleChapterUpdated}
      />

      <CreateTopicModal
        isOpen={isCreateTopicOpen}
        onClose={() => {
          setIsCreateTopicOpen(false);
          setSelectedChapter(null);
        }}
        chapterId={selectedChapter?.id || ""}
        onSuccess={handleTopicCreated}
      />

      <EditTopicModal
        isOpen={isEditTopicOpen}
        onClose={() => {
          setIsEditTopicOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onSuccess={handleTopicUpdated}
      />
    </div>
  );
}

function ChapterCard({
  chapter,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onAddTopic: (e: React.MouseEvent) => void;
  onEditTopic: (topic: Topic, e: React.MouseEvent) => void;
  onDeleteTopic: (topic: Topic, e: React.MouseEvent) => void;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const { data } = useGetTopicsByChapter(chapter.id);

  useState(() => {
    if (data?.data) {
      setTopics(data.data);
      setTopicsLoading(false);
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3">
            <ChevronRight
              className={`h-5 w-5 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">{chapter.name}</h3>
            {topics.length > 0 && (
              <Badge variant="secondary">{topics.length} topics</Badge>
            )}
          </div>
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/30">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Topics
                </h4>
                <Button variant="outline" size="sm" onClick={onAddTopic}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Topic
                </Button>
              </div>
              {topics.length > 0 ? (
                <div className="space-y-2">
                  {topics.map((topic: Topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 bg-background rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{topic.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => onEditTopic(topic, e)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => onDeleteTopic(topic, e)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No topics yet. Click &quot;Add Topic&quot; to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
