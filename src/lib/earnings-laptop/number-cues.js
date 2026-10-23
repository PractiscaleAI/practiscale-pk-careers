// Pure presentation state shared by the deterministic laptop canvas.
import { clamp, range } from "./earnings-data.js";

export const digitRevealAt = (phase, index) =>
  range(phase, 0.04 + index * 0.008, 0.2 + index * 0.008);
export function recordMotionAt(phase) {
  const enter = 1 - Math.pow(1 - clamp(phase / 0.19), 3);
  const leave = range(phase, 0.85, 1);
  return { alpha: enter * (1 - leave), y: (1 - enter) * 115 - leave * 135 };
}
export function numberPresentationAt(story) {
  if (story.staticMode || story.screen < 0.99) return null;
  if (story.summary && story.p >= 0.823 && story.p <= 0.927)
    return { key: "total", kind: "total" };
  if (!story.showingRecords) return null;
  // Start the airy swish while the text is moving, before the reading hold.
  if (recordMotionAt(story.phase).alpha < 0.18) return null;
  return { key: `record:${story.record}`, kind: "record" };
}
