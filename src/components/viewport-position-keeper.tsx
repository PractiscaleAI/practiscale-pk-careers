"use client";

import { useEffect } from "react";

type SectionAnchor = {
  section: HTMLElement;
  progress: number;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Keep the same chapter in view while browser zoom changes scroll geometry. */
export default function ViewportPositionKeeper() {
  useEffect(() => {
    const main = document.querySelector("main");
    const footer = document.getElementById("site-footer");
    if (!main) return;

    const sections = Array.from(main.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.tagName === "SECTION",
    );
    if (footer) sections.push(footer);

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = window.devicePixelRatio || 1;
    let stable: SectionAnchor | null = null;
    let pending: SectionAnchor | null = null;
    let guardFrame = 0;
    let deepLinkFrame = 0;
    let deepLinkUntil = 0;
    let deepLinkDeadline = 0;
    let settleTimer = 0;
    let releaseTimer = 0;

    function sectionAtCenter() {
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      let node = document.elementFromPoint(x, y);
      while (node && node !== main) {
        if (sections.includes(node as HTMLElement)) {
          const section = node as HTMLElement;
          const rect = section.getBoundingClientRect();
          if (rect.top <= y && rect.bottom >= y) return section;
        }
        node = node.parentElement;
      }
      return (
        sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= y && rect.bottom >= y;
        }) ?? null
      );
    }

    function capture() {
      const section = sectionAtCenter();
      if (!section) return;
      const rect = section.getBoundingClientRect();
      stable = {
        section,
        progress: clamp(
          (window.innerHeight / 2 - rect.top) / Math.max(1, rect.height),
        ),
      };
    }

    function restore() {
      if (!pending?.section.isConnected || main?.inert) return;
      if (sectionAtCenter() === pending.section) return;

      const rect = pending.section.getBoundingClientRect();
      const maxScroll = Math.max(
        0,
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
        ) - window.innerHeight,
      );
      const destination = Math.max(
        0,
        Math.min(
          maxScroll,
          rect.top +
            window.scrollY +
            pending.progress * rect.height -
            window.innerHeight / 2,
        ),
      );
      if (Math.abs(window.scrollY - destination) > 2)
        window.scrollTo({ top: destination, behavior: "instant" });
    }

    function stop() {
      pending = null;
      cancelAnimationFrame(guardFrame);
      cancelAnimationFrame(deepLinkFrame);
      deepLinkUntil = 0;
      deepLinkDeadline = 0;
      clearTimeout(settleTimer);
      clearTimeout(releaseTimer);
    }

    function alignFooterDeepLink() {
      if (!footer || location.hash !== "#site-footer") return;
      if (main?.inert) {
        if (performance.now() < deepLinkDeadline)
          deepLinkFrame = requestAnimationFrame(alignFooterDeepLink);
        return;
      }
      if (!deepLinkUntil) deepLinkUntil = performance.now() + 4000;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const target = Math.max(
        0,
        Math.min(maxScroll, window.scrollY + footer.getBoundingClientRect().top),
      );
      if (Math.abs(window.scrollY - target) > 2)
        window.scrollTo({ top: target, behavior: "instant" });
      if (performance.now() < deepLinkUntil)
        deepLinkFrame = requestAnimationFrame(alignFooterDeepLink);
      else deepLinkUntil = 0;
    }

    function startFooterDeepLink() {
      if (!footer || location.hash !== "#site-footer") return;
      cancelAnimationFrame(deepLinkFrame);
      // Pinned scenes above the footer can change document height after the
      // browser's native hash jump. Keep the requested anchor in view while
      // those scenes settle, then release control to normal scrolling.
      deepLinkUntil = 0;
      deepLinkDeadline = performance.now() + 15000;
      deepLinkFrame = requestAnimationFrame(alignFooterDeepLink);
    }

    function hashchange() {
      stop();
      startFooterDeepLink();
    }

    function guard() {
      if (!pending) return;
      restore();
      guardFrame = requestAnimationFrame(guard);
    }

    function resize() {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const nextRatio = window.devicePixelRatio || 1;
      const layoutChanged =
        Math.abs(nextWidth - width) > 1 ||
        Math.abs(nextRatio - pixelRatio) > 0.01 ||
        (matchMedia("(pointer: fine)").matches &&
          Math.abs(nextHeight - height) > 48);
      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextRatio;
      if (!layoutChanged) {
        if (!pending) capture();
        return;
      }
      if (!pending) pending = stable;
      if (!pending) return;

      cancelAnimationFrame(guardFrame);
      clearTimeout(settleTimer);
      clearTimeout(releaseTimer);
      restore();
      guardFrame = requestAnimationFrame(guard);
      // Other scroll scenes measure after resize. Correct again once their
      // ScrollTrigger refresh and media-query changes have settled.
      settleTimer = window.setTimeout(() => {
        restore();
        releaseTimer = window.setTimeout(() => {
          restore();
          pending = null;
          cancelAnimationFrame(guardFrame);
          capture();
        }, 350);
      }, 650);
    }

    function scroll() {
      if (
        window.innerWidth !== width ||
        window.innerHeight !== height ||
        Math.abs((window.devicePixelRatio || 1) - pixelRatio) > 0.01
      ) {
        resize();
        return;
      }
      if (pending) restore();
      else capture();
    }

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey) {
        if (!pending) capture();
      } else if (pending || deepLinkDeadline) stop();
    }

    function keydown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["+", "=", "-", "_", "0"].includes(event.key)
      ) {
        if (!pending) capture();
      } else if (
        (pending || deepLinkDeadline) &&
        [
          "PageDown",
          "PageUp",
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        stop();
    }

    capture();
    startFooterDeepLink();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true, capture: true });
    window.addEventListener("keydown", keydown, { capture: true });
    window.addEventListener("touchstart", stop, {
      passive: true,
      capture: true,
    });
    window.addEventListener("pointerdown", stop, {
      passive: true,
      capture: true,
    });
    window.addEventListener("hashchange", hashchange);
    return () => {
      stop();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", wheel, { capture: true });
      window.removeEventListener("keydown", keydown, { capture: true });
      window.removeEventListener("touchstart", stop, { capture: true });
      window.removeEventListener("pointerdown", stop, { capture: true });
      window.removeEventListener("hashchange", hashchange);
    };
  }, []);

  return null;
}
