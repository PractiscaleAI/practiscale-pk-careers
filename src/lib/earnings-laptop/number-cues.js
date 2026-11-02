// Pure presentation state shared by the deterministic laptop canvas.
import { range } from "./earnings-data.js";

export function recordMotionAt(phase) {
  // Keep the complete record readable even if scrolling stops at a boundary.
  // A small vertical drift gives the transition direction without hiding digits.
  return { y: (1 - range(phase, 0, 0.15)) * 14 - range(phase, 0.85, 1) * 14 };
}
export function numberPresentationAt(story) {
  if (story.staticMode || story.screen < 0.99) return null;
  if (story.summary && story.p >= 0.82 && story.p <= 0.927)
    return { key: "total", kind: "total" };
  if (!story.showingRecords) return null;
  return { key: `record:${story.record}`, kind: "record" };
}
