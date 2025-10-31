import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";
import { MutableRefObject } from "react";

// Shows camera status, video preview and enable/fullscreen controls
export function ProctoringPanel({
  mediaStream,
  isRequestingMedia,
  startMedia,
  mediaError,
  videoRef,
  isFullscreen,
  enterFullscreen,
}: {
  mediaStream: MediaStream | null;
  isRequestingMedia: boolean;
  startMedia: () => Promise<boolean> | boolean;
  mediaError: string | null;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  isFullscreen: boolean;
  enterFullscreen: () => Promise<boolean> | boolean;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4" /> Proctoring
        </div>
        {mediaStream ? (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isRequestingMedia}
            onClick={() => startMedia()}
          >
            {isRequestingMedia ? "Requesting…" : "Enable"}
          </Button>
        )}
      </div>
      {mediaError ? (
        <div className="text-xs text-destructive">
          {mediaError}. Please allow camera and microphone in your browser
          permissions and click Enable again.
        </div>
      ) : null}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className="w-full h-28 sm:h-40 object-cover rounded-md bg-black"
      />
      {!isFullscreen && (
        <Button
          size="sm"
          className="w-full"
          variant="secondary"
          onClick={() => enterFullscreen()}
        >
          Enter Fullscreen
        </Button>
      )}
    </div>
  );
}
