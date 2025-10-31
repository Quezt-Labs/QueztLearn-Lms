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
  useGetContentsByTopic,
  useDeleteContent,
} from "@/hooks";
import { CreateChapterModal } from "@/components/common/create-chapter-modal";
import { EditChapterModal } from "@/components/common/edit-chapter-modal";
import { CreateTopicModal } from "@/components/common/create-topic-modal";
import { EditTopicModal } from "@/components/common/edit-topic-modal";
import { CreateContentModal } from "@/components/common/create-content-modal";
import { EditContentModal } from "@/components/common/edit-content-modal";
import Image from "next/image";

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

interface Content {
  id: string;
  name: string;
  topicId: string;
  type: string;
  url?: string;
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
  const [isCreateContentOpen, setIsCreateContentOpen] = useState(false);
  const [isEditContentOpen, setIsEditContentOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );

  const { data: subject, isLoading: subjectLoading } = useGetSubject(subjectId);
  const { data: chapters, isLoading: chaptersLoading } =
    useGetChaptersBySubject(subjectId);
  const deleteSubjectMutation = useDeleteSubject();
  const deleteChapterMutation = useDeleteChapter();
  const deleteTopicMutation = useDeleteTopic();
  const deleteContentMutation = useDeleteContent();

  const handleGoBack = () => {
    router.push(`/teacher/courses/${courseId}`);
  };

  const confirmDelete = async () => {
    try {
      await deleteSubjectMutation.mutateAsync(subjectId);
      router.push(`/teacher/courses/${courseId}`);
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

  const handleChapterUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["chapters", "subject", subjectId],
    });
  };

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsEditChapterOpen(true);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    if (window.confirm(`Are you sure you want to delete ${chapter.name}?`)) {
      deleteChapterMutation.mutate(chapter.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["chapters", "subject", subjectId],
          });
        },
      });
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
    const chapter = chapters?.data?.find((c: Chapter) => c.id === chapterId);
    if (chapter) {
      setSelectedChapter(chapter);
      setIsCreateTopicOpen(true);
    }
  };

  const handleEditTopic = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTopic(topic);
    setIsEditTopicOpen(true);
  };

  const handleDeleteTopic = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${topic.name}?`)) {
      deleteTopicMutation.mutate(topic.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["topics", "chapter"],
          });
        },
      });
    }
  };

  const handleAddContent = (topicId: string) => {
    const topic = chapters?.data
      ?.flatMap((c: Chapter) => {
        const topics = chapters?.data?.find((ch: Chapter) => ch.id === c.id);
        return topics ? [] : [];
      })
      .find((t: Topic) => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setIsCreateContentOpen(true);
    }
  };

  const handleContentCreated = () => {
    queryClient.invalidateQueries({
      queryKey: ["contents", "topic"],
    });
  };

  const handleContentUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ["contents", "topic"],
    });
  };

  const handleEditContent = (content: Content, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContent(content);
    setIsEditContentOpen(true);
  };

  const handleDeleteContent = (content: Content) => {
    if (window.confirm(`Are you sure you want to delete ${content.name}?`)) {
      deleteContentMutation.mutate(content.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["contents", "topic"],
          });
        },
      });
    }
  };

  if (subjectLoading || chaptersLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subject...</p>
          </CardContent>
        </Card>
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
        </div>
      </div>

      {/* Subject Thumbnail */}
      {subjectData.thumbnailUrl && (
        <div className="mb-8">
          <div className="h-64 w-full rounded-lg overflow-hidden relative">
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
                  onEdit={() => handleEditChapter(chapter)}
                  onDelete={() => handleDeleteChapter(chapter)}
                  onAddTopic={(e) => handleAddTopic(chapter.id, e)}
                  onEditTopic={(topic, e) => handleEditTopic(topic, e)}
                  onDeleteTopic={(topic, e) => handleDeleteTopic(topic, e)}
                  onAddContent={handleAddContent}
                  onEditContent={handleEditContent}
                  onDeleteContent={handleDeleteContent}
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
              Are you sure you want to delete this subject? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {deleteSubjectMutation.isPending ? "Deleting..." : "Delete"}
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
      />

      <EditTopicModal
        isOpen={isEditTopicOpen}
        onClose={() => {
          setIsEditTopicOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
      />

      <CreateContentModal
        isOpen={isCreateContentOpen}
        onClose={() => {
          setIsCreateContentOpen(false);
          setSelectedTopic(null);
        }}
        topicId={selectedTopic?.id || ""}
      />

      <EditContentModal
        isOpen={isEditContentOpen}
        onClose={() => {
          setIsEditContentOpen(false);
          setSelectedContent(null);
        }}
        // @ts-expect-error - Content types mismatch between files
        content={selectedContent}
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
  onAddContent,
  onEditContent,
  onDeleteContent,
}: {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onAddTopic: (e: React.MouseEvent) => void;
  onEditTopic: (topic: Topic, e: React.MouseEvent) => void;
  onDeleteTopic: (topic: Topic, e: React.MouseEvent) => void;
  onAddContent: (topicId: string) => void;
  onEditContent: (content: Content, e: React.MouseEvent) => void;
  onDeleteContent: (content: Content) => void;
}) {
  const { data: topicsData } = useGetTopicsByChapter(chapter.id);
  const topics = topicsData?.data || [];

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
            <div className="p-4 space-y-3">
              {topics.length > 0 ? (
                topics.map((topic: Topic) => (
                  <TopicContentDisplay
                    key={topic.id}
                    topic={topic}
                    onEdit={(e) => onEditTopic(topic, e)}
                    onDelete={(e) => onDeleteTopic(topic, e)}
                    onAddContent={onAddContent}
                    onEditContent={onEditContent}
                    onDeleteContent={onDeleteContent}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No topics yet
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onAddTopic}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopicContentDisplay({
  topic,
  onEdit,
  onDelete,
  onAddContent,
  onEditContent,
  onDeleteContent,
}: {
  topic: Topic;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onAddContent: (topicId: string) => void;
  onEditContent: (content: Content, e: React.MouseEvent) => void;
  onDeleteContent: (content: Content) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: contents } = useGetContentsByTopic(topic.id);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-lg bg-background">
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center space-x-2 flex-1">
          <button
            onClick={toggleExpanded}
            className="flex items-center space-x-2 flex-1"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{topic.name}</span>
            {contents?.data && contents.data.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {contents.data.length} content
              </Badge>
            )}
          </button>
        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isExpanded && contents?.data && contents.data.length > 0 && (
        <div className="border-t p-3 space-y-2">
          {contents.data.map((content: Content) => (
            <div
              key={content.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {getContentTypeIcon(content.type)}
                <span className="text-sm">{content.name}</span>
              </div>
              <div
                className="flex space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onEditContent(content, e)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteContent(content)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddContent(topic.id)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      )}
    </div>
  );
}

function getContentTypeIcon(type: string) {
  switch (type) {
    case "Video":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "PDF":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "Assignment":
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
}
