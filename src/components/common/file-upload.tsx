"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useDirectUpload } from "@/hooks";

interface FileUploadProps {
  onUploadComplete: (fileData: {
    key: string;
    url: string;
    bucket: string;
    originalName: string;
    size: number;
    mimeType: string;
  }) => void;
  accept?: string;
  maxSize?: number; // in MB
  folder?: string;
  className?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  result?: unknown;
}

export function FileUpload({
  onUploadComplete,
  accept = "image/*,video/*,.pdf",
  maxSize = 100, // 100MB default
  folder = "uploads", // eslint-disable-line @typescript-eslint/no-unused-vars
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedFilesRef = useRef<Set<string>>(new Set());

  const directUploadMutation = useDirectUpload();

  // Auto-upload pending files
  useEffect(() => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    pendingFiles.forEach((file) => {
      const fileKey = `${file.file?.name}-${file.file?.size}`;
      if (!processedFilesRef.current.has(fileKey)) {
        processedFilesRef.current.add(fileKey);
        const fileIndex = files.findIndex((f) => f === file);
        uploadFile(file, fileIndex);
      }
    });
  }, [files]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      // Remove from processed files tracking
      if (file?.file) {
        const fileKey = `${file.file.name}-${file.file.size}`;
        processedFilesRef.current.delete(fileKey);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (file: UploadedFile, index: number) => {
    try {
      // Update status to uploading
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: "uploading",
          progress: 0,
        };
        return newFiles;
      });

      // Create FormData for direct upload
      const formData = new FormData();
      formData.append("file", file.file);

      const result = await directUploadMutation.mutateAsync(formData);

      // Update with success
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: "success",
          progress: 100,
          result: result.data,
        };
        return newFiles;
      });

      // Call the completion callback
      onUploadComplete(result.data);
    } catch (error) {
      // Update with error
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          ...newFiles[index],
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
        return newFiles;
      });
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.findIndex((f) => f === pendingFiles[i]);
      await uploadFile(pendingFiles[i], fileIndex);
    }
  };

  const getFileIcon = (file: File | undefined) => {
    if (!file || !file.type) return <File className="h-4 w-4" />;
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (file.type.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (file.type === "application/pdf")
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const hasPendingFiles = pendingFiles.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          Max {maxSize}MB • {accept}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview of ${file.file?.name || "file"}`}
                      className="h-8 w-8 object-cover rounded"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file.file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.file?.name || "Unknown file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.file?.size
                        ? formatFileSize(file.file.size)
                        : "Unknown size"}
                    </p>
                  </div>
                  {file.status === "uploading" && (
                    <div className="w-16">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                  {file.status === "success" && (
                    <Badge variant="default" className="text-xs">
                      Success
                    </Badge>
                  )}
                  {file.status === "error" && (
                    <Badge variant="destructive" className="text-xs">
                      Error
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
