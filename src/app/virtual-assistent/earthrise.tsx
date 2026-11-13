"use client";

import { useEffect, useRef } from "react";
import { JumpLink } from "./chrome";
import { hero } from "./content";
import {
  clamp,
  easeOutCubic,
  follower,
  lerp,
  onFrame,
  pinProgress,
  prefersReducedMotion,
  range,
} from "./va-motion";
import styles from "./webinar.module.css";

/**
 * The opening: 6 PM in Pakistan. Five photographic layers cut from one
 * generated scene (a VA on a client call at her desk at home, the city and
 * the moon through her window), stacked and pinned; one scroll range moves
 * each at its own rate:
 *
 *   0.00 – 0.18  a light evening haze lifts off the lens
 *   0.04 – 0.50  the moon rises over the rooftops
 *   0.04 – 0.30  the window and room close in around the view
 *   0.08 – 0.36  she rises into place at her desk (one layer, so her hands
 *                can never leave the keyboard)
 *   0.70 – 1.00  everything tilts away upward and dissolves into night
 *                teal, which is where the page continues
 *
 * The message — who it's for, what it is, the action — is readable from the
 * first frame over a soft night-teal shade; only "FROM HOME" tightens as the
 * scene resolves.
 *
 * Landscape screens use the 16:9 `d` cut; portrait screens use a separately
 * composed 9:16 `m` cut rather than a crop of the landscape one.
 */

const STAGE_VH = 320;
// Versioned folder: replacing files under the same name let browsers keep
// stale, misaligned copies.
const LAYERS = "/media/va-hero/layers-v3";

type LayerName = "sky" | "moon" | "city" | "room" | "seat";
const ORDER: LayerName[] = ["sky", "moon", "city", "room", "seat"];

/**
 * The p = 0 pose, rendered into the HTML, so the stage shows the opening —
 * never the finished composite — until the first frame runs.
 */
const START: Record<LayerName, React.CSSProperties> = {
  sky: { transform: "translate3d(0, 0vh, 0) scale(1.14)" },
  moon: { transform: "translate3d(0, 34vh, 0) scale(0.92)" },
  city: { transform: "translate3d(0, 9vh, 0) scale(1)" },
  room: { transform: "translate3d(0, 0vh, 0) scale(1.6)", opacity: 0 },
  seat: { transform: "translate3d(0, 32vh, 0) scale(1)", opacity: 0 },
};

type Mote = { x: number; y: number; r: number; s: number; a: number };

export default function Earthrise({ ctaLabel }: { ctaLabel: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLSpanElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  // Dust canvas size.
  useEffect(() => {
    const c = dustRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current!;
    const ctx = canvas.getContext("2d")!;
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes: Mote[] = Array.from({ length: 90 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.4,
      s: 0.3 + rand(),
      a: 0.15 + rand() * 0.45,
    }));
    const follow = follower(8);
    let lastP = -1;

    const set = (name: LayerName, y: number, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y.toFixed(3)}vh, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((_, dt) => {
      const root = rootRef.current;
      if (!root) return;
      const { p: target, rect } = pinProgress(root);
      if (rect.bottom < 0) return;
      const p = follow(target, dt);
      root.dataset.progress = p.toFixed(3);

      // Dust drifts every frame while it's visible.
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        const still = prefersReducedMotion();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#dff5f0";
        for (const m of motes) {
          if (!still) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      // A light haze that clears upward; the city reads through it.
      const veilEl = veilRef.current!;
      veilEl.style.opacity = String(veil);
      veilEl.style.visibility = veil < 0.001 ? "hidden" : "";
      canvas.style.opacity = String(veil);

      // Far → near, each faster than the one behind it.
      set("sky", lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set("moon", lerp(34, 0, rise) - exit * 12, lerp(0.92, 1, rise));
      set("city", lerp(9, 0, settle) - exit * 26);
      const rim = easeOutCubic(range(p, 0.04, 0.3));
      set("room", -exit * 44, lerp(1.6, 1, rim), rim);
      const seat = easeOutCubic(range(p, 0.08, 0.36));
      set("seat", lerp(32, 0, seat) - exit * 78, 1, clamp(seat * 2));

      // The message is there from frame one; FROM HOME tightens as the
      // scene resolves, then everything leaves with the scene.
      const tIn = easeOutCubic(range(p, 0, 0.22));
      const out = range(p, 0.66, 0.78);
      bigRef.current!.style.setProperty("--track", `${lerp(0.3, 0.16, tIn)}em`);
      const intro = introRef.current!;
      intro.style.opacity = String(1 - out);
      intro.style.visibility = out > 0.999 ? "hidden" : "";
      intro.style.translate = `0 ${(-p * 4).toFixed(2)}vh`;
      scrimRef.current!.style.opacity = String(0.55 + 0.45 * range(p, 0.05, 0.3));

      cueRef.current!.style.opacity = String(1 - range(p, 0.05, 0.15));
      fadeRef.current!.style.opacity = String(range(p, 0.74, 0.97));
    });
  }, []);

  const layer = (name: LayerName) => (
    <div
      key={name}
      ref={(el) => {
        if (el) layerRefs.current[name] = el;
      }}
      className={styles.layer}
      style={START[name]}
      data-layer={name}
    >
      <picture>
        <source media="(max-aspect-ratio: 1/1)" srcSet={`${LAYERS}/m/${name}.webp`} />
        <img
          src={`${LAYERS}/d/${name}.webp`}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority={name === "sky" ? "high" : "auto"}
        />
      </picture>
      {/* The nearest layer carries a night-teal apron below it, so when it
          climbs it fills the screen and hands straight over to the page. */}
      {name === "seat" && <div className={styles.apron} />}
    </div>
  );

  return (
    <section
      id="top"
      ref={rootRef}
      aria-labelledby="va-title"
      className={styles.hero}
      style={{ height: `${STAGE_VH}svh` }}
      data-va-hero
    >
      <div className={styles.heroStage}>
        {ORDER.map(layer)}
        <div ref={scrimRef} className={styles.heroScrim} aria-hidden="true" style={{ opacity: 0.55 }} />

        {/* Haze on the lens. */}
        <div ref={veilRef} aria-hidden="true" className={styles.veil} data-va-veil />
        <canvas ref={dustRef} aria-hidden="true" className={styles.dust} />

        <div ref={introRef} className={styles.heroIntro} data-va-title>
          <p className={styles.heroChip}>
            <i aria-hidden="true" />
            {hero.kicker}
          </p>
          <h1 id="va-title">
            {hero.lead}
            <span ref={bigRef} className={styles.heroBig}>
              {hero.title}
            </span>
          </h1>
          <p className={styles.heroSub}>{hero.sub}</p>
          <div className={styles.heroCtas}>
            <JumpLink className={styles.primary} href="#reserve">
              {ctaLabel} <span aria-hidden="true">↗</span>
            </JumpLink>
            <JumpLink className={`${styles.secondary} ${styles.heroGhost}`} href="#watch">
              <span aria-hidden="true">▶</span> Watch the video
            </JumpLink>
          </div>
          <p className={`${styles.label} ${styles.heroFacts}`}>{hero.facts}</p>
        </div>

        <div ref={cueRef} className={styles.heroCue} aria-hidden="true">
          {hero.veil} <span className={styles.bounce}>↓</span>
        </div>
        <div ref={fadeRef} className={styles.heroFade} aria-hidden="true" />
      </div>
    </section>
  );
}
