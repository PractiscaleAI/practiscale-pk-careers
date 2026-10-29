"use client";

import { useEffect, useRef } from "react";
import gazeFrames from "./footer-gaze-frames.json";
import styles from "./footer.module.css";

const TAU = Math.PI * 2;

function timeForAngle(angle: number) {
  const target = ((angle % TAU) + TAU) % TAU;
  let nearestTime = gazeFrames[0][1];
  let nearestDistance = Infinity;
  for (const [sampleAngle, time] of gazeFrames) {
    const difference = Math.abs(target - sampleAngle);
    const distance = Math.min(difference, TAU - difference);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestTime = time;
    }
  }
  return nearestTime + 1 / 240;
}

export default function FooterFilm() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const videoElement = videoRef.current;
    if (!wrapperElement || !videoElement) return;
    const wrapper: HTMLDivElement = wrapperElement;
    const video: HTMLVideoElement = videoElement;

    const mobile = matchMedia("(max-width: 900px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    let loaded = false;
    let visible = false;
    let frame = 0;
    let desiredTime = 0;
    let pointer: { x: number; y: number } | null = null;

    function schedule() {
      if (!frame) frame = requestAnimationFrame(seek);
    }

    function seek() {
      frame = 0;
      if (mobile.matches || !visible || video.readyState < 2 || video.seeking)
        return;
      const target = Math.min(desiredTime, video.duration - 1 / 24);
      if (Math.abs(video.currentTime - target) > 1 / 48)
        video.currentTime = target;
    }

    function updateTarget() {
      if (mobile.matches || !visible || !pointer) return;
      const rect = video.getBoundingClientRect();
      const scale = Math.max(rect.width / 1920, rect.height / 1080);
      const eyeX = rect.left + rect.width / 2 + (948 - 960) * scale;
      const eyeY = rect.top + rect.height / 2 + (418 - 540) * scale;
      const dx = pointer.x - eyeX;
      const dy = pointer.y - eyeY;
      if (Math.hypot(dx, dy) <= 8) return;
      desiredTime = timeForAngle(Math.atan2(dy, dx));
      wrapper.dataset.targetTime = desiredTime.toFixed(5);
      schedule();
    }

    function syncPlayback() {
      video.loop = mobile.matches;
      if (visible && mobile.matches && !reducedMotion.matches) {
        void video.play().catch(() => {
          // The poster or decoded frame remains visible if autoplay is blocked.
        });
      } else {
        video.pause();
        if (!mobile.matches) updateTarget();
      }
    }

    function loadFilm() {
      if (loaded) return;
      loaded = true;
      video.src = "/media/footer/footer-gaze-source.mp4";
      video.load();
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        updateTarget();
      },
      { passive: true, signal: abort.signal },
    );
    window.addEventListener("resize", updateTarget, { signal: abort.signal });
    window.addEventListener("scroll", updateTarget, {
      passive: true,
      signal: abort.signal,
    });
    video.addEventListener("seeked", schedule, { signal: abort.signal });
    video.addEventListener("loadeddata", syncPlayback, {
      signal: abort.signal,
    });
    mobile.addEventListener("change", syncPlayback, { signal: abort.signal });
    reducedMotion.addEventListener("change", syncPlayback, {
      signal: abort.signal,
    });

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) loadFilm();
      },
      { rootMargin: "200% 0px" },
    );
    preloadObserver.observe(wrapper);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        syncPlayback();
        if (visible) updateTarget();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(wrapper);

    return () => {
      abort.abort();
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      video.pause();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.film} aria-hidden="true">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="none"
        poster="/media/footer/footer-gaze-poster.webp"
      />
    </div>
  );
}
