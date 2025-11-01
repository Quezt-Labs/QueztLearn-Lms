"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetContentsByTopic } from "@/hooks";
import { Video, FileText, Download, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Topic {
  id: string;
  name: string;
  chapterId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ViewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
}

export function ViewTopicModal({
  isOpen,
  onClose,
  topic,
}: ViewTopicModalProps) {
  const { data: contentsData, isLoading: contentsLoading } =
    useGetContentsByTopic(topic?.id || "");

  const contents = contentsData?.data || [];

  const videos = contents.filter(
    (content: Content) => content.type === "Video" && content.videoUrl
  );
  const pdfs = contents.filter(
    (content: Content) => content.type === "PDF" && content.pdfUrl
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{topic?.name || "View Topic"}</DialogTitle>
          <DialogDescription>
            View all videos and PDFs associated with this topic
          </DialogDescription>
        </DialogHeader>

        {contentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Loading content...
            </span>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No content available</h3>
            <p className="text-muted-foreground">
              This topic doesn&apos;t have any videos or PDFs yet.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({contents.length})</TabsTrigger>
              <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
              <TabsTrigger value="pdfs">PDFs ({pdfs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {contents.map((content: Content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4 mt-4">
              {videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No videos available
                </div>
              ) : (
                videos.map((content: Content) => (
                  <ContentCard key={content.id} content={content} />
                ))
              )}
            </TabsContent>

            <TabsContent value="pdfs" className="space-y-4 mt-4">
              {pdfs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No PDFs available
                </div>
              ) : (
                pdfs.map((content: Content) => (
                  <ContentCard key={content.id} content={content} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContentCard({ content }: { content: Content }) {
  const isVideo = content.type === "Video" && content.videoUrl;
  const isPdf = content.type === "PDF" && content.pdfUrl;

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank");
  };

  const handleOpenVideo = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {isVideo && <Video className="h-5 w-5 text-green-600" />}
            {isPdf && <FileText className="h-5 w-5 text-purple-600" />}
            <h4 className="font-semibold">{content.name}</h4>
            <Badge
              variant="secondary"
              className={
                content.type === "Video"
                  ? "bg-green-100 text-green-800"
                  : content.type === "PDF"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              {content.type}
            </Badge>
            {content.isCompleted && (
              <Badge variant="default" className="bg-green-600">
                Completed
              </Badge>
            )}
          </div>
          {isVideo && content.videoDuration && (
            <p className="text-sm text-muted-foreground ml-8">
              Duration: {formatDuration(content.videoDuration)}
            </p>
          )}
          {content.videoThumbnail && (
            <div className="mt-3 ml-8">
              <img
                src={content.videoThumbnail}
                alt={content.name}
                className="w-full max-w-md h-auto rounded-md"
              />
            </div>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          {isVideo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                content.videoUrl && handleOpenVideo(content.videoUrl)
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch
            </Button>
          )}
          {isPdf && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => content.pdfUrl && handleOpenPdf(content.pdfUrl)}
            >
              <Download className="h-4 w-4 mr-2" />
              Open PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
