import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Flag, Send } from "lucide-react";

// Displays timer, question position, violations, and actions
export function TestHeaderBar({
  remainingMinutes,
  remainingSeconds,
  currentIndex,
  totalQuestions,
  violations,
  maxViolations,
  markedForReview,
  onToggleReview,
  onSubmit,
}: {
  remainingMinutes: number;
  remainingSeconds: number;
  currentIndex: number;
  totalQuestions: number;
  violations: number;
  maxViolations: number;
  markedForReview: boolean;
  onToggleReview: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b bg-[radial-gradient(80rem_50rem_at_120%_-10%,theme(colors.primary/8),transparent_60%)] supports-[padding:max(0px)]
        pb-[max(theme(spacing.2),env(safe-area-inset-top))] pt-[max(theme(spacing.2),env(safe-area-inset-top))]"
    >
      <div className="flex items-center gap-2 text-sm">
        <Badge
          variant={remainingMinutes < 5 ? "destructive" : "secondary"}
          className="gap-1"
        >
          <Clock className="h-3.5 w-3.5" /> {remainingMinutes}:
          {remainingSeconds.toString().padStart(2, "0")}
        </Badge>
        <span className="text-muted-foreground">
          Q {currentIndex + 1} / {totalQuestions}
        </span>
        <Badge
          variant={violations > 0 ? "destructive" : "outline"}
          className="gap-1"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Violations: {violations}/
          {maxViolations}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={markedForReview ? "default" : "outline"}
          size="sm"
          onClick={onToggleReview}
        >
          <Flag className="mr-2 h-4 w-4" /> Mark for review
        </Button>
        <Button size="sm" onClick={onSubmit}>
          <Send className="mr-2 h-4 w-4" /> Submit
        </Button>
      </div>
    </div>
  );
}
