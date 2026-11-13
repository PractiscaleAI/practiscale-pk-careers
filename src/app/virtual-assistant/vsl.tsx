"use client";

import Image from "next/image";
import { useState } from "react";
import { vsl } from "./content";
import styles from "./funnel.module.css";

/** The VSL: a poster until the visitor presses play, then YouTube (no autoplay before that). */
export default function Vsl() {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className={styles.vsl} data-vsl>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${vsl.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
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
          <Image
            src={vsl.poster}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 640px"
            priority
          />
          <span className={styles.play} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          </span>
          <span className={styles.srOnly}>Play video: watch this first</span>
        </button>
      )}
    </figure>
  );
}
