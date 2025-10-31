import { EngineSection, TestData } from "@/lib/types/test-engine";

// Returns deterministic mock test data for demos and local development
export function generateMockTest(): TestData {
  const options = ["A", "B", "C", "D"];
  const sections: EngineSection[] = Array.from({ length: 3 }).map((_, si) => ({
    id: `section-${si + 1}`,
    name: `Section ${si + 1}`,
    questions: Array.from({ length: 10 }).map((__, qi) => ({
      id: `q-${si + 1}-${qi + 1}`,
      text: `Q${qi + 1}. This is a sample question in section ${si + 1}.`,
      type: "MCQ",
      imageUrl:
        qi === 0
          ? "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200&q=80&auto=format&fit=crop"
          : undefined,
      options: options.map((o, oi) => ({
        id: `opt-${si}-${qi}-${oi}`,
        text: `${o}`,
        imageUrl:
          qi === 0 && oi === 0
            ? "https://images.unsplash.com/photo-1520975922203-b8ad9a8a8d2a?w=800&q=80&auto=format&fit=crop"
            : undefined,
      })),
      marks: 4,
      negativeMarks: 1,
    })),
  }));
  return { durationMinutes: 60, sections };
}
