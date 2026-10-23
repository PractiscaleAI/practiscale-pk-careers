// Number opacity and cue eligibility use the very same functions as the canvas.
// A swish belongs to committed text movement, never to an independent timer.
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

export function createLidCueTracker(emit) {
  let anchor = null,
    direction = 0,
    previousP = null,
    needsBaseline = true;
  return {
    baseline() {
      needsBaseline = true;
    },
    commit(story, visualTime) {
      const jumped = previousP !== null && Math.abs(story.p - previousP) > 0.18;
      previousP = story.p;
      if (needsBaseline || story.staticMode || jumped) {
        anchor = story.open;
        direction = 0;
        needsBaseline = false;
        return null;
      }
      if (story.open <= 0.0001 || story.open >= 0.9999) {
        anchor = story.open;
        direction = 0;
        return null;
      }
      const distance = story.open - anchor;
      const nextDirection = distance > 0.018 ? 1 : distance < -0.018 ? -1 : 0;
      let event = null;
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        event = {
          kind: direction > 0 ? "lid-open" : "lid-close",
          key: direction > 0 ? "lid:open" : "lid:close",
          visualTime,
          progress: story.p,
        };
        emit(event);
      }
      if (direction > 0) anchor = Math.max(anchor, story.open);
      else if (direction < 0) anchor = Math.min(anchor, story.open);
      return event;
    },
  };
}

export function createNumberCueTracker(emit) {
  let lastKey = null,
    needsBaseline = true;
  return {
    baseline() {
      needsBaseline = true;
    },
    commit(story, visualTime) {
      const presentation = numberPresentationAt(story);
      if (needsBaseline || story.staticMode) {
        lastKey = presentation?.key ?? null;
        needsBaseline = false;
        return null;
      }
      if (story.p < 0.29 || story.p > 0.94) lastKey = null;
      if (!presentation || presentation.key === lastKey) return null;
      lastKey = presentation.key;
      const event = { ...presentation, visualTime, progress: story.p };
      emit(event);
      return event;
    },
  };
}
