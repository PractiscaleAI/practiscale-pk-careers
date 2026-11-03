"use client";

import { useEffect, useRef, useState } from "react";

const MAX_WAIT_MS = 8000;
const EXIT_MS = 420;
const FRAME_GRACE_MS = 650;
const FIRST_VISIT_MIN_MS = 160;
const SESSION_KEY = "practiscale-intro-seen";
// Count independent readiness milestones, not multiple callbacks for the same
// font download. The visual ring is therefore an honest asset-group counter.
const CRITICAL_COUNT = 3;

function heroElement(): Promise<HTMLElement> {
  const existing = document.querySelector<HTMLElement>(".hero-portrait");
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const element = document.querySelector<HTMLElement>(".hero-portrait");
      if (!element) return;
      observer.disconnect();
      resolve(element);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

function imageReady(image: HTMLImageElement | null): Promise<void> {
  if (!image) return Promise.resolve();
  if (image.complete) {
    return image.naturalWidth
      ? image.decode().catch(() => {})
      : Promise.resolve();
  }
  return new Promise((resolve) => {
    image.addEventListener("load", () => {
      void image.decode().catch(() => {}).then(() => resolve());
    }, { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

function firstHeroFrame(element: HTMLElement): Promise<void> {
  if (element.dataset.initialized === "true") return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (element.dataset.initialized !== "true") return;
      observer.disconnect();
      resolve();
    });
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-initialized"],
    });
  });
}

export default function Preloader() {
  const [active, setActive] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const [landed, setLanded] = useState(false);
  const [completed, setCompleted] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    if (!active) return;
    const started = performance.now();
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.documentElement.style.overflow;
    const content = [
      ...document.querySelectorAll<HTMLElement>("main,header,footer"),
    ].map((element) => ({ element, inert: element.inert }));
    content.forEach(({ element }) => (element.inert = true));
    document.documentElement.style.overflow = "hidden";
    root.current?.focus({ preventScroll: true });

    let settled = 0;
    let frameIsReady = false;
    let releasing = false;
    let leaving = false;
    let removed = false;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let minimumTimer: ReturnType<typeof setTimeout> | undefined;
    let frameGraceTimer: ReturnType<typeof setTimeout> | undefined;
    const repeatVisit = (() => {
      try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        return false;
      }
    })();
    const send = (type: "sync" | "progress" | "release", value?: number) => {
      frame.current?.contentWindow?.postMessage(
        { source: "practiscale-host-preloader", type, value },
        location.origin,
      );
    };
    const finish = () => {
      if (leaving || removed) return;
      leaving = true;
      setExiting(true);
      root.current?.setAttribute("data-exiting", "true");
      root.current?.setAttribute("aria-hidden", "true");
      const delay = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : EXIT_MS;
      exitTimer = setTimeout(() => {
        removed = true;
        setActive(false);
      }, delay);
    };
    skip.current = finish;
    const release = () => {
      if (releasing || leaving || removed) return;
      if (!frameIsReady) {
        if (!frameGraceTimer)
          frameGraceTimer = setTimeout(finish, FRAME_GRACE_MS);
        return;
      }
      clearTimeout(frameGraceTimer);
      frameGraceTimer = undefined;
      releasing = true;
      setRevealReady(true);
      root.current?.setAttribute("data-ready", "true");
      send("progress", 100);
      send("release");
    };
    const finishWhenReady = () => {
      const minimum = repeatVisit ? 0 : FIRST_VISIT_MIN_MS;
      minimumTimer = setTimeout(
        release,
        Math.max(0, minimum - (performance.now() - started)),
      );
    };
    const settle = () => {
      if (removed || leaving) return;
      settled += 1;
      setCompleted(settled);
      if (frameIsReady)
        send("progress", Math.round((settled / CRITICAL_COUNT) * 100));
      if (settled === CRITICAL_COUNT) finishWhenReady();
    };
    const track = (promise: Promise<unknown>) => {
      void promise.then(settle, settle);
    };
    const onMessage = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== location.origin ||
        event.data?.source !== "practiscale-original-preloader"
      ) return;
      if (event.data.type === "ready") {
        frameIsReady = true;
        setFrameReady(true);
        send("progress", Math.round((settled / CRITICAL_COUNT) * 100));
        if (settled === CRITICAL_COUNT) release();
      } else if (event.data.type === "landed") {
        setLanded(true);
      } else if (event.data.type === "complete") {
        removed = true;
        setActive(false);
      }
    };
    window.addEventListener("message", onMessage);
    const onFrameLoad = () => send("sync");
    frame.current?.addEventListener("load", onFrameLoad);

    // Fonts are one milestone. Counting both font requests and fonts.ready as
    // three separate assets made the ring jump ahead while the hero was pending.
    // A failed request still settles and the poster remains a usable fallback.
    track(
      Promise.allSettled([
        document.fonts.load("400 16px Manrope", "PractiScale"),
        document.fonts.load("600 16px Sora", "PractiScale"),
        document.fonts.ready,
      ]),
    );
    const portrait = heroElement();
    track(
      portrait.then((element) =>
        imageReady(element.querySelector(".portrait-poster")),
      ),
    );
    track(portrait.then(firstHeroFrame));

    const timeout = setTimeout(finish, MAX_WAIT_MS);
    const watchdog = () => finish();
    window.addEventListener("practiscale:preloader-timeout", watchdog);
    send("sync");
    return () => {
      clearTimeout(timeout);
      clearTimeout(exitTimer);
      clearTimeout(minimumTimer);
      clearTimeout(frameGraceTimer);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("practiscale:preloader-timeout", watchdog);
      frame.current?.removeEventListener("load", onFrameLoad);
      document.documentElement.style.overflow = previousOverflow;
      content.forEach(({ element, inert }) => (element.inert = inert));
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage may be disabled; readiness still controls the loader.
      }
    };
  }, [active]);

  return (
    <>
      <noscript>
        <style>{`#site-preloader{display:none!important}html:has(#site-preloader){overflow:auto!important}`}</style>
      </noscript>
      {active && (
        <div
          id="site-preloader"
          ref={root}
          className="preloader preloader-original"
          data-frame-ready={frameReady ? "true" : "false"}
          data-ready={revealReady ? "true" : "false"}
          data-landed={landed ? "true" : "false"}
          data-exiting={exiting ? "true" : "false"}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          aria-label="Loading PractiScale"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              skip.current();
            } else if (event.key === "Tab") {
              event.preventDefault();
              root.current?.focus({ preventScroll: true });
            }
          }}
        >
          <div className="preloader-first-frame" aria-hidden="true">
            <svg className="preloader-first-ring" viewBox="0 0 560 560">
              <circle cx="280" cy="280" r="191" />
              <circle cx="280" cy="280" r="88" />
            </svg>
            <img
              src="/brand/logos/practiscale-mark.png"
              alt=""
              className="preloader-first-mark"
            />
            <img
              src="/brand/logos/practiscale-logo-reversed.png"
              alt=""
              className="preloader-first-logo"
            />
          </div>
          <iframe
            ref={frame}
            className="preloader-original-frame"
            src="/preloader/embedded.html"
            title="PractiScale loading animation"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="sr-only">Loading</span>
          <span
            className="sr-only"
            role="progressbar"
            aria-label="Critical assets loaded"
            aria-valuemin={0}
            aria-valuemax={CRITICAL_COUNT}
            aria-valuenow={completed}
          />
        </div>
      )}
    </>
  );
}
