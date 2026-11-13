/**
 * One rAF loop for the whole page. Every scroll-driven section subscribes,
 * reads its own rect and writes styles directly — nothing goes through React
 * state while scrolling, so the page never re-renders mid-scroll.
 *
 * Native scroll is kept (no scroll hijacking). Each section eases its own
 * rendered progress toward the real one, which gives the layers the glide of
 * a smooth-scroll library without taking the wheel away from the visitor.
 */

type Tick = (time: number, dt: number) => void;

const subscribers = new Set<Tick>();
let raf = 0;
let last = 0;

function loop(time: number) {
  const dt = last ? Math.min(0.1, (time - last) / 1000) : 1 / 60;
  last = time;
  // Schedule the next frame first and isolate each section, so one failing
  // frame (a ref missing mid hot-reload, say) can never stop the whole page.
  raf = subscribers.size ? requestAnimationFrame(loop) : 0;
  if (!raf) last = 0;
  subscribers.forEach((fn) => {
    try {
      fn(time, dt);
    } catch (error) {
      console.error(error);
    }
  });
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    subscribers.delete(fn);
  };
}

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where `v` sits between `a` and `b`, clamped to 0–1. */
export const range = (v: number, a: number, b: number) =>
  clamp((v - a) / (b - a));

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Scroll progress through a tall section whose child is `position: sticky`.
 * 0 when the section's top meets the viewport top, 1 when the sticky child
 * is about to unpin.
 */
export function pinProgress(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = Math.max(1, rect.height - vh);
  return { p: clamp(-rect.top / span), rect, vh };
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Eases a rendered value toward its target, frame-rate independent.
 * `?still` in the URL (used by visual QA) and reduced motion snap instantly.
 */
export function follower(rate = 9) {
  let value = -1;
  const snap =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("still");
  return (target: number, dt: number) => {
    if (value < 0 || snap || prefersReducedMotion()) value = target;
    else {
      value += (target - value) * (1 - Math.exp(-dt * rate));
      if (Math.abs(target - value) < 0.0002) value = target;
    }
    return value;
  };
}

/** Smooth-scrolls to an in-page hash, or to the top for `#top`. */
export function scrollToHash(hash: string) {
  const target = hash === "#top" ? null : document.querySelector<HTMLElement>(hash);
  if (hash !== "#top" && !target) return;
  const offset = target ? parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0;
  const top = target ? target.getBoundingClientRect().top + window.scrollY - offset : 0;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  history.replaceState(
    null,
    "",
    hash === "#top" ? location.pathname + location.search : hash,
  );
}
