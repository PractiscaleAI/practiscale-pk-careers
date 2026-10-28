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
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [activeFilm, setActiveFilm] = useState(film);
  useEffect(() => {
    if (!section.current) return;
    return mountFounderFilm(section.current, {
      onLoading: () => {
        setFailed(false);
        setBuffering(false);
      },
      onFailure: () => {
        setFailed(true);
        setBuffering(false);
      },
      onSourceChange: setActiveFilm,
    });
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
              <span aria-hidden="true">▶</span>{" "}
              {failed ? "Retry video" : "Watch his story"}
            </button>
          </div>
          <p className={styles.hint} data-founder-hint>
            {failed ? (
              "Video connection interrupted. Please retry."
            ) : (
              <>
                Scroll to watch his story <span aria-hidden="true">↓</span>
              </>
            )}
          </p>
        </div>
        <div className={styles.frame} data-founder-frame>
          <video
            className={styles.video}
            data-founder-video
            poster="/media/founder/founder-dream-v063.webp"
            preload="none"
            controls
            playsInline
            aria-label="Afrasyab Ahmed, the story behind PractiScale"
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
              media="(max-width: 1023px) and (orientation: portrait)"
              srcSet="/media/founder/founder-dream-portrait-v073.avif"
              type="image/avif"
              width="941"
              height="1672"
            />
            <source
              media="(max-width: 1023px) and (orientation: portrait)"
              srcSet="/media/founder/founder-dream-portrait-v073.webp"
              type="image/webp"
              width="941"
              height="1672"
            />
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
          {failed && (
            <div className={styles.error} data-founder-error role="status">
              <p>The video couldn’t load. Please try again.</p>
              <div className={styles.errorActions}>
                <button
                  type="button"
                  onClick={() =>
                    section.current?.dispatchEvent(new Event("founder:retry"))
                  }
                >
                  Retry video
                </button>
                <a href={activeFilm}>Open video directly</a>
              </div>
            </div>
          )}
        </div>
      </div>
      <span id="founder-film-end" className={styles.end} />
    </section>
  );
}
