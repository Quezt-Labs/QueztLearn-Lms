"use client";

import { useState } from "react";
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
import { useCreateContent } from "@/hooks";
import { Video, FileText, BookOpen } from "lucide-react";
import { FileUpload } from "@/components/common/file-upload";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  onSuccess?: () => void;
}

export function CreateContentModal({
  isOpen,
  onClose,
  topicId,
  onSuccess,
}: CreateContentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Lecture" as "Lecture" | "PDF",
    pdfUrl: "",
    videoUrl: "",
    videoType: "YOUTUBE" as "YOUTUBE" | "HLS",
    videoThumbnail: "",
    videoDuration: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<string>("");
  const [videoFile, setVideoFile] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<string>("");

  const createContentMutation = useCreateContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    // Validate videoDuration for Lecture type
    if (
      formData.type === "Lecture" &&
      (!formData.videoDuration || formData.videoDuration <= 0)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contentData = {
        name: formData.name,
        topicId: topicId,
        type: formData.type,
        pdfUrl: pdfFile || formData.pdfUrl || undefined,
        videoUrl:
          formData.videoType === "YOUTUBE"
            ? formData.videoUrl
            : videoFile || formData.videoUrl || undefined,
        videoType: formData.videoType,
        videoThumbnail: thumbnailFile || formData.videoThumbnail || undefined,
        videoDuration: formData.videoDuration,
      };

      await createContentMutation.mutateAsync(contentData);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create content:", error);
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
      videoType: "YOUTUBE",
      videoThumbnail: "",
      videoDuration: 0,
    });
    setPdfFile("");
    setVideoFile("");
    setThumbnailFile("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogDescription>
            Add content to this topic (Lecture or PDF).
          </DialogDescription>
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
                <SelectItem value="PDF">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields based on Type */}
          {formData.type === "Lecture" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="videoType">Video Type *</Label>
                <Select
                  value={formData.videoType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoType: value as typeof formData.videoType,
                      videoUrl: "", // Reset URL when changing type
                      videoDuration: 0, // Reset duration when changing type
                    }))
                  }
                >
                  <SelectTrigger id="videoType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YOUTUBE">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4" />
                        <span>YouTube</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="HLS">HLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* YouTube URL Input */}
              {formData.videoType === "YOUTUBE" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube URL *</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        videoUrl: e.target.value,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full YouTube video URL or video ID
                  </p>
                </div>
              )}

              {/* Video Upload for HLS */}
              {formData.videoType === "HLS" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUpload">Upload Video *</Label>
                  <FileUpload
                    accept="video/*"
                    maxSize={500}
                    onUploadComplete={(fileData) => {
                      setVideoFile(fileData.url);
                    }}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Or Enter Video URL</Label>
                    <Input
                      id="videoUrl"
                      placeholder="Enter video URL (optional)"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          videoUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="videoThumbnail">Video Thumbnail</Label>
                <FileUpload
                  accept="image/*"
                  maxSize={10}
                  onUploadComplete={(fileData) => {
                    setThumbnailFile(fileData.url);
                  }}
                />
                <div className="space-y-2">
                  <Label htmlFor="videoThumbnailUrl">
                    Or Enter Thumbnail URL
                  </Label>
                  <Input
                    id="videoThumbnailUrl"
                    placeholder="Enter thumbnail URL (optional)"
                    value={formData.videoThumbnail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        videoThumbnail: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoDuration">Duration (seconds) *</Label>
                <Input
                  id="videoDuration"
                  type="number"
                  placeholder="Enter duration in seconds"
                  value={formData.videoDuration || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoDuration: Number(e.target.value) || 0,
                    }))
                  }
                  required
                  min="1"
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
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                (formData.type === "Lecture" &&
                  (!formData.videoDuration || formData.videoDuration <= 0))
              }
            >
              {isSubmitting ? "Creating..." : "Create Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
