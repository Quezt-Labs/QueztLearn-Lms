"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateContent } from "@/hooks";
import { Video, FileText, BookOpen, Clipboard } from "lucide-react";
import { FileUpload } from "@/components/common/file-upload";

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

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onSuccess?: () => void;
}

export function EditContentModal({
  isOpen,
  onClose,
  content,
  onSuccess,
}: EditContentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Lecture" as "Lecture" | "Video" | "PDF" | "Assignment",
    pdfUrl: "",
    videoUrl: "",
    videoType: "HLS" as "HLS" | "MP4" | "YouTube",
    videoThumbnail: "",
    videoDuration: 0,
    isCompleted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<string>("");
  const [videoFile, setVideoFile] = useState<string>("");

  const updateContentMutation = useUpdateContent();

  // Initialize form data when content changes
  useEffect(() => {
    if (content) {
      setFormData({
        name: content.name || "",
        type: content.type || "Lecture",
        pdfUrl: content.pdfUrl || "",
        videoUrl: content.videoUrl || "",
        videoType: content.videoType || "HLS",
        videoThumbnail: content.videoThumbnail || "",
        videoDuration: content.videoDuration || 0,
        isCompleted: content.isCompleted || false,
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !content) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contentData = {
        name: formData.name,
        type: formData.type,
        pdfUrl: pdfFile || formData.pdfUrl || undefined,
        videoUrl: videoFile || formData.videoUrl || undefined,
        videoType: formData.videoType,
        videoThumbnail: formData.videoThumbnail || undefined,
        videoDuration: formData.videoDuration,
        isCompleted: formData.isCompleted,
      };

      await updateContentMutation.mutateAsync({
        id: content.id,
        data: contentData,
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "Lecture",
      pdfUrl: "",
      videoUrl: "",
      videoType: "HLS",
      videoThumbnail: "",
      videoDuration: 0,
      isCompleted: false,
    });
    setPdfFile("");
    setVideoFile("");
    onClose();
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
          <DialogDescription>Update content information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Content Name *</Label>
            <Input
              id="name"
              placeholder="Enter content name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Content Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as typeof formData.type,
                }))
              }
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lecture">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Lecture</span>
                  </div>
                </SelectItem>
                <SelectItem value="Video">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Video</span>
                  </div>
                </SelectItem>
                <SelectItem value="PDF">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="Assignment">
                  <div className="flex items-center space-x-2">
                    <Clipboard className="h-4 w-4" />
                    <span>Assignment</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Type */}
          {formData.type === "Video" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="videoFile">Upload Video File</Label>
                <FileUpload
                  accept="video/*"
                  onUploadComplete={(fileData) => {
                    setVideoFile(fileData.url);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Upload video files (MP4, WebM, etc.) or use YouTube URLs
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  placeholder={
                    formData.videoType === "YouTube"
                      ? "https://www.youtube.com/watch?v=VIDEO_ID"
                      : "Enter video URL"
                  }
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoUrl: e.target.value,
                    }))
                  }
                />
                {formData.videoType === "YouTube" && (
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube URLs (youtube.com or youtu.be)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoType">Video Type</Label>
                <Select
                  value={formData.videoType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoType: value as typeof formData.videoType,
                    }))
                  }
                >
                  <SelectTrigger id="videoType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HLS">HLS (Streaming)</SelectItem>
                    <SelectItem value="MP4">MP4 (Direct)</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoThumbnail">Video Thumbnail URL</Label>
                <Input
                  id="videoThumbnail"
                  placeholder="Enter thumbnail URL"
                  value={formData.videoThumbnail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoThumbnail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duration (seconds)</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  placeholder="0"
                  value={formData.videoDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoDuration: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </>
          )}

          {formData.type === "PDF" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">Upload PDF</Label>
                <FileUpload
                  accept=".pdf"
                  onUploadComplete={(fileData) => {
                    setPdfFile(fileData.url);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">Or Enter PDF URL</Label>
                <Input
                  id="pdfUrl"
                  placeholder="Or enter PDF URL"
                  value={formData.pdfUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, pdfUrl: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "Updating..." : "Update Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
