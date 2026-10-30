"use client";
import { useEffect, useRef, useState } from "react";

export default function Preloader() {
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [landed, setLanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const finishRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const content = [
      ...document.querySelectorAll<HTMLElement>("main,header,footer"),
    ].map((el) => ({ el, inert: el.inert }));
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    content.forEach(({ el }) => {
      el.inert = true;
    });
    const focus = requestAnimationFrame(() =>
      root.current?.focus({ preventScroll: true }),
    );
    let finished = false;
    let release: ReturnType<typeof setTimeout> | undefined;
    const finish = (fade: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      if (fade && root.current) {
        root.current.style.transition = "opacity 180ms ease";
        root.current.style.opacity = "0";
        release = setTimeout(() => setActive(false), 200);
      } else setActive(false);
    };
    finishRef.current = () => finish(true);
    const message = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== location.origin ||
        event.data?.source !== "practiscale-original-preloader"
      )
        return;
      switch (event.data.type) {
        case "ready":
          setReady(true);
          break;
        case "progress":
          if (Number.isFinite(event.data.value))
            setProgress(Math.max(0, Math.min(100, event.data.value)));
          break;
        case "landed":
          setLanded(true);
          break;
        case "complete":
          finish(false);
          break;
      }
    };
    const guard = setTimeout(() => finish(true), 9000);
    window.addEventListener("message", message);
    // The iframe starts with the server-rendered page. Request its current
    // state in case it sent ready or complete before React hydrated.
    const sync = () =>
      frame.current?.contentWindow?.postMessage(
        { source: "practiscale-host-preloader", type: "sync" },
        location.origin,
      );
    const currentFrame = frame.current;
    currentFrame?.addEventListener("load", sync);
    sync();
    return () => {
      clearTimeout(guard);
      cancelAnimationFrame(focus);
      clearTimeout(release);
      window.removeEventListener("message", message);
      currentFrame?.removeEventListener("load", sync);
      document.documentElement.style.overflow = overflow;
      content.forEach(({ el, inert }) => {
        el.inert = inert;
      });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active]);
  return (
    <>
      <noscript>
        <style>{`html:has(.preloader){overflow:auto!important}.preloader{display:none!important}.preloader~main .hero-stage{transform:none!important;opacity:1!important}`}</style>
      </noscript>
      {active && (
        <>
          <style>{`html:has(.preloader){overflow:hidden}`}</style>
          <div
            ref={root}
            className="preloader preloader-original"
            tabIndex={-1}
            data-ready={ready}
            data-landed={landed}
            role="dialog"
            aria-modal="true"
            aria-label="PractiScale introduction"
            aria-description="Press Escape to close the introduction."
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                finishRef.current();
              }
              if (event.key === "Tab") {
                event.preventDefault();
                root.current?.focus({ preventScroll: true });
              }
            }}
          >
            <iframe
              ref={frame}
              className="preloader-original-frame"
              src="/preloader/embedded.html"
              title="Original PractiScale logo introduction"
              aria-hidden="true"
              tabIndex={-1}
              onError={() => finishRef.current()}
            />
            <div
              className="sr-only"
              role="progressbar"
              aria-label="Introduction progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            />
          </div>
        </>
      )}
    </>
  );
}
