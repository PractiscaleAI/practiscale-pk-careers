"use client";
import { useEffect, useRef, useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Eyebrow } from "./ui";
import { mountFounderFilm } from "@/lib/founder-film";
import styles from "./founder-section.module.css";
const brandLines = [
  "var(--link)",
  "var(--accent)",
  "var(--deep)",
  "var(--surface)",
];
const film = "/media/founder/ceo-story-desktop-v062.mp4";
export default function FounderSection() {
  const section = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);
  useEffect(() => {
    if (!section.current) return;
    return mountFounderFilm(section.current);
  }, []);
  return (
    <section
      ref={section}
      id="background-lines"
      className={styles.section}
      aria-labelledby="founder-heading"
      data-theme="fog"
    >
      <div className={styles.stage} data-founder-stage>
        <div
          className={styles.background}
          data-founder-background
          aria-hidden="true"
        >
          <BackgroundLines
            className="h-full md:h-full bg-white dark:bg-white"
            svgOptions={{ colors: brandLines, straight: true, duration: 12 }}
          >
            {null}
          </BackgroundLines>
        </div>
        <div className={styles.inner} data-founder-inner>
          <div className={styles.copy} data-founder-copy>
            <Eyebrow>Our founder</Eyebrow>
            <h2 id="founder-heading">
              He started with no money and no connections.{" "}
              <span>Just a skill.</span>
            </h2>
            <p>
              Afrasyab Ahmed spent nine years mastering sales. That skill took
              PractiScale from a home office to a 10,000 sq. ft. workspace and a
              team of 100+. His next goal: 5,000 careers, built in Pakistan.
            </p>
          </div>
          <div className={styles.slot} data-founder-slot>
            <button className={styles.watch} data-founder-watch type="button">
              <span aria-hidden="true">▶</span> Watch his story
            </button>
          </div>
          <p className={styles.hint} data-founder-hint>
            Scroll to watch his story <span aria-hidden="true">↓</span>
          </p>
        </div>
        <div className={styles.frame} data-founder-frame>
          <video
            className={styles.video}
            data-founder-video
            poster="/media/founder/founder-dream-v063.webp"
            preload="none"
            controls
            muted
            playsInline
            aria-label="Afrasyab Ahmed, the story behind PractiScale"
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            onError={(event) => {
              if (event.currentTarget.error) setFailed(true);
            }}
            onLoadedData={() => setFailed(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
          >
            <source
              src="/media/founder/ceo-story-portrait-v062.mp4"
              type="video/mp4"
              media="(max-width: 1023px) and (orientation: portrait)"
            />
            <source src={film} type="video/mp4" />
            Your browser cannot play this video.{" "}
            <a href={film}>Open the founder film</a>.
          </video>
          <picture className={styles.poster} aria-hidden="true">
            <source
              srcSet="/media/founder/founder-dream-v063.avif"
              type="image/avif"
            />
            <img
              data-founder-poster
              src="/media/founder/founder-dream-v063.webp"
              alt=""
              width="1672"
              height="941"
              loading="lazy"
              decoding="async"
            />
          </picture>
          {buffering && (
            <p className={styles.loading} role="status">
              Loading video...
            </p>
          )}
          <button
            className={styles.sound}
            data-founder-sound
            type="button"
            onClick={() => {
              const video = section.current?.querySelector("video");
              if (video) video.muted = !video.muted;
            }}
          >
            {muted ? "Turn sound on" : "Mute sound"}
          </button>
        </div>
        {failed && (
          <p className={styles.error} role="status">
            The film could not load. <a href={film}>Open the video directly</a>.
          </p>
        )}
      </div>
      <span id="founder-film-end" className={styles.end} />
    </section>
  );
}
