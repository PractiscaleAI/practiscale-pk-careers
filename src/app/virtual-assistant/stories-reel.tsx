"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { stories, storiesIntro } from "./content";
import { clamp, follower, onFrame, pinProgress, range } from "./va-motion";
import styles from "./webinar.module.css";

/**
 * Three stories as a reel of portraits. The section pins and the reel slides
 * sideways with the scroll; the portrait nearest the focus line is sharp, the
 * rest dim back, and each picture drifts against its frame.
 *
 * Travel is measured from layout (offsetLeft), never from the transformed
 * rect, so the first card starts on the focus line and the last one ends on
 * it at every width.
 */

const SECTION_VH = 320;

export default function StoriesReel() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const follow = follower(9);
    let lastP = -1;
    let lastW = 0;
    return onFrame((_, dt) => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const { p: target, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = follow(target, dt);
      const vw = document.documentElement.clientWidth;
      if (Math.abs(p - lastP) < 0.00005 && vw === lastW) return;
      lastP = p;
      lastW = vw;

      const k = range(p, 0.06, 0.94);
      const focus = vw * (vw >= 900 ? 0.58 : 0.5);
      const cards = cardRefs.current;
      const centre = (card: HTMLLIElement) =>
        track.offsetLeft + card.offsetLeft + card.offsetWidth / 2;
      const first = centre(cards[0]);
      const lastC = centre(cards[cards.length - 1]);
      const x = focus - (first + k * (lastC - first));
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const off = (centre(card) + x - focus) / vw;
        const a = clamp(Math.abs(off) * 1.7);
        card.style.opacity = String(1 - a * 0.6);
        card.style.transform = `scale(${(1 - a * 0.08).toFixed(4)})`;
        card.dataset.focus = a < 0.2 ? "true" : "false";
        const img = imgRefs.current[i];
        if (img) img.style.transform = `translate3d(${(off * -50).toFixed(2)}px, 0, 0) scale(1.12)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      root.dataset.active = String(nearest);
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section
      ref={rootRef}
      id="stories"
      aria-labelledby="stories-title"
      className={styles.reelSection}
      style={{ height: `${SECTION_VH}svh` }}
      data-va-reel
    >
      <div className={styles.reelStage}>
        <div className={styles.reelIntro}>
          <p className={styles.eyebrow}>{storiesIntro.eyebrow}</p>
          <h2 id="stories-title" className={styles.display}>
            {storiesIntro.heading}
          </h2>
          <p className={styles.reelBody}>{storiesIntro.body}</p>
          <div className={styles.reelCount} aria-hidden="true">
            <span>
              <span ref={countRef} className={styles.white}>
                01
              </span>{" "}
              / 0{stories.length}
            </span>
            <span className={styles.reelBar}>
              <span ref={barRef} style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>

        <ol ref={trackRef} className={styles.reelTrack}>
          {stories.map((story, i) => (
            <li
              key={story.name}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className={styles.reelCard}
              data-va-card
            >
              <figure>
                <div className={styles.reelPhoto}>
                  <Image
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={story.image}
                    alt={`Portrait of ${story.name}`}
                    fill
                    sizes="(max-width: 767px) 74vw, (max-width: 1100px) 40vw, 26rem"
                  />
                  <span className={styles.reelTag}>Path 0{i + 1}</span>
                  <span className={styles.reelEarn}>
                    <strong>{story.outcome}</strong>
                    <small>Per month · self-reported</small>
                  </span>
                </div>
                <figcaption className={styles.reelCaption}>
                  <span className={styles.reelIndex}>0{i + 1}</span>
                  <span>
                    <span className={styles.reelName}>{story.name}</span>
                    <span className={styles.reelRole}>{story.role}</span>
                    <span className={styles.reelStart}>{story.start}</span>
                    {story.linkedin && (
                      <a href={story.linkedin} target="_blank" rel="noopener noreferrer">
                        Verify on LinkedIn ↗
                      </a>
                    )}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
