// Grid of question buttons showing current/answered/review states
export function QuestionPalette({
  total,
  currentIndex,
  answeredMap,
  reviewMap,
  onSelect,
}: {
  total: number;
  currentIndex: number;
  answeredMap: Record<number, boolean>;
  reviewMap: Record<number, boolean>;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="mb-2 text-sm font-medium">Question Palette</div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const answered = Boolean(answeredMap[idx]);
          const isCurrent = idx === currentIndex;
          const review = Boolean(reviewMap[idx]);
          return (
            <button
              key={idx}
              className={
                "h-9 rounded text-xs font-medium border transition-colors " +
                (isCurrent
                  ? "bg-primary text-primary-foreground"
                  : answered
                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800"
                  : review
                  ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-800"
                  : "hover:bg-muted")
              }
              onClick={() => onSelect(idx)}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
