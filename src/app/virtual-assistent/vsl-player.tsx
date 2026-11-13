"use client";

import { useEffect, useRef, useState } from "react";
import { vsl } from "./content";
import { clamp, easeOutCubic, follower, onFrame, range } from "./va-motion";
import styles from "./webinar.module.css";

/**
 * The VSL. A still poster with a play control until the visitor asks for the
 * video — YouTube is only contacted on click. While it scrolls in, the frame
 * opens from a letterbox to its full size, like a lens coming into focus.
 */
export default function VslPlayer() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const follow = follower(10);
    let last = -1;
    return onFrame((_, dt) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top > vh || rect.bottom < 0) return;
      // 0 as the frame's top enters the screen, 1 once it's well inside.
      const k = follow(easeOutCubic(range(vh - rect.top, 0, vh * 0.7)), dt);
      if (Math.abs(k - last) < 0.0005) return;
      last = k;
      el.style.setProperty("--open", clamp(k).toFixed(4));
    });
  }, []);

  return (
    <div ref={frameRef} className={styles.vslFrame} data-va-vsl>
      <div className={styles.vslInner}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${vsl.id}?autoplay=1&rel=0&modestbranding=1`}
            title={vsl.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.vslPoster}
            onClick={() => setPlaying(true)}
          >
            {/* The visible caption is the button's name, prefixed for clarity. */}
            <span className={styles.srOnly}>Play video: </span>
            <img
              src={vsl.poster}
              alt=""
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
            />
            <span className={styles.vslPlay} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            </span>
            <span className={styles.vslCap}>
              <span>
                <b>Work from home in Pakistan</b>
                <small>Afrasyab Ahmed, Founder &amp; CEO</small>
              </span>
              <span className={styles.vslWatch}>
                <span aria-hidden="true">▶ </span>Watch
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
