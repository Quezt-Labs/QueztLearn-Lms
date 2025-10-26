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
  type: "Lecture" | "Video" | "PDF" | "Assignment";
  pdfUrl?: string;
  videoUrl?: string;
  videoType?: "HLS" | "MP4";
  videoThumbnail?: string;
  videoDuration?: number;
  isCompleted: boolean;
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

  const handleAddContent = (topicId: string) => {
    setSelectedTopic({ id: topicId } as Topic);
    setIsCreateContentOpen(true);
  };

  const handleContentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["contents"] });
  };

  const handleEditContent = (content: Content, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContent(content);
    setIsEditContentOpen(true);
  };

  const handleContentUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["contents"] });
  };

  const handleDeleteContent = async (content: Content) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${content.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteContentMutation.mutateAsync(content.id);
        queryClient.invalidateQueries({
          queryKey: ["contents", "topic", content.topicId],
        });
      } catch (error) {
        console.error("Failed to delete content:", error);
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

      <CreateContentModal
        isOpen={isCreateContentOpen}
        onClose={() => {
          setIsCreateContentOpen(false);
          setSelectedTopic(null);
        }}
        topicId={selectedTopic?.id || ""}
        onSuccess={handleContentCreated}
      />

      <EditContentModal
        isOpen={isEditContentOpen}
        onClose={() => {
          setIsEditContentOpen(false);
          setSelectedContent(null);
        }}
        content={selectedContent}
        onSuccess={handleContentUpdated}
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
                    <TopicContentDisplay
                      key={topic.id}
                      topic={topic}
                      onEdit={(e) => onEditTopic(topic, e)}
                      onDelete={(e) => onDeleteTopic(topic, e)}
                      onAddContent={onAddContent}
                      onEditContent={onEditContent}
                      onDeleteContent={onDeleteContent}
                    />
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
  const { data: contents, isLoading: contentsLoading } = useGetContentsByTopic(
    topic.id
  );

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return "🎥";
      case "PDF":
        return "📄";
      case "Assignment":
        return "📝";
      default:
        return "📚";
    }
  };

  const getContentTypeBadge = (type: string) => {
    const badges = {
      Lecture: "bg-blue-100 text-blue-800",
      Video: "bg-green-100 text-green-800",
      PDF: "bg-purple-100 text-purple-800",
      Assignment: "bg-orange-100 text-orange-800",
    };
    return badges[type as keyof typeof badges] || badges.Lecture;
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

      {isExpanded && (
        <div className="border-t bg-muted/20 p-3">
          {contentsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          ) : contents?.data && contents.data.length > 0 ? (
            <div className="space-y-2">
              {contents.data.map((content: Content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-2 bg-background rounded border text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getContentTypeIcon(content.type)}
                    </span>
                    <span className="font-medium">{content.name}</span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getContentTypeBadge(content.type)}`}
                    >
                      {content.type}
                    </Badge>
                  </div>
                  {content.isCompleted && (
                    <Badge variant="default" className="bg-green-600">
                      Completed
                    </Badge>
                  )}
                  <div
                    className="flex space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={(e) => onEditContent(content, e)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-red-500 hover:text-red-700"
                      onClick={() => onDeleteContent(content)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-muted-foreground text-xs">
              No content available yet
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => onAddContent(topic.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Content
          </Button>
        </div>
      )}
    </div>
  );
}
