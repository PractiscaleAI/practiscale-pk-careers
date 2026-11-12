"use client";

import { useEffect, useRef } from "react";
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
 * The opening: 6 PM in Pakistan. Six photographic layers cut from one
 * generated scene (a VA on a client call at her desk at home, the city and
 * the moon through her window), stacked and pinned; one scroll range moves
 * each at its own rate:
 *
 *   0.00 – 0.18  evening haze lifts off the lens
 *   0.04 – 0.50  the moon rises over the rooftops
 *   0.04 – 0.30  the window and room close in around the view
 *   0.08 – 0.36  her desk and she rise into place together — she is the point of
 *                the scene, so she is there for almost all of it
 *   0.16 – 0.72  FROM HOME resolves above every layer and holds over the
 *                finished scene; on wide screens it sits left, over the
 *                window, clear of her
 *   0.70 – 1.00  everything tilts away upward and dissolves into night
 *                teal, which is where the page continues
 *
 * Landscape screens use the 16:9 `d` cut; portrait screens use a separately
 * composed 9:16 `m` cut rather than a crop of the landscape one.
 *
 * The HUD is the shift itself: Pakistan time runs 18:00 → 03:00 while US
 * Eastern runs 08:00 → 17:00 — the night shift is the US working day.
 */

const STAGE_VH = 420;
const LAYERS = "/media/va-hero/layers";

type LayerName = "sky" | "moon" | "city" | "room" | "desk" | "her";
const ORDER: LayerName[] = ["sky", "moon", "city", "room", "desk", "her"];

/**
 * The p = 0 pose, rendered into the HTML. Until the first frame runs the
 * stage must show the opening, never the finished composite — otherwise the
 * room, desk and her would sit over the title.
 */
const START: Record<LayerName, React.CSSProperties> = {
  sky: { transform: "translate3d(0, 0vh, 0) scale(1.14)" },
  moon: { transform: "translate3d(0, 34vh, 0) scale(0.92)" },
  city: { transform: "translate3d(0, 9vh, 0) scale(1)" },
  room: { transform: "translate3d(0, 0vh, 0) scale(1.6)", opacity: 0 },
  desk: { transform: "translate3d(0, 32vh, 0) scale(1)", opacity: 0 },
  her: { transform: "translate3d(0, 32vh, 0) scale(1)", opacity: 0 },
};

type Mote = { x: number; y: number; r: number; s: number; a: number };

const clock = (startHour: number, hours: number) => {
  const total = (startHour + hours) * 60;
  const h = Math.floor(total / 60) % 24;
  const m = Math.floor(total % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function Earthrise() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const pktRef = useRef<HTMLParagraphElement>(null);
  const usRef = useRef<HTMLSpanElement>(null);

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
    const motes: Mote[] = Array.from({ length: 140 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.6,
      s: 0.3 + rand(),
      a: 0.2 + rand() * 0.6,
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
      fadeRef.current!.style.opacity = String(range(p, 0.74, 0.97));
      const settle = easeOutCubic(range(p, 0, 0.5));

      // Veil clears upward.
      const veilEl = veilRef.current!;
      veilEl.style.opacity = String(veil);
      veilEl.style.visibility = veil < 0.001 ? "hidden" : "";
      veilEl.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      // Far → near, each faster than the one behind it.
      set("sky", lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set("moon", lerp(34, 0, rise) - exit * 12, lerp(0.92, 1, rise));
      set("city", lerp(9, 0, settle) - exit * 26);
      const rim = easeOutCubic(range(p, 0.04, 0.3));
      set("room", -exit * 44, lerp(1.6, 1, rim), rim);
      // Her desk and she move as one piece, so her hands stay on the keys
      // through the rise and the exit.
      const seat = easeOutCubic(range(p, 0.08, 0.36));
      const seatY = lerp(32, 0, seat) - exit * 78;
      set("desk", seatY, 1, clamp(seat * 2));
      set("her", seatY, 1, clamp(seat * 2));

      // Title: resolves (tracking closes in), holds over the scene, then
      // leaves with it.
      const tIn = easeOutCubic(range(p, 0.16, 0.32));
      const tOut = range(p, 0.62, 0.72);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.setProperty("--track", `${lerp(0.45, 0.24, tIn)}em`);
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : "";

      // The shift clock, on its own shade so it reads over the photo.
      hudRef.current!.style.opacity = String(
        range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)),
      );
      pktRef.current!.textContent = `PKT ${clock(18, p * 9)}`;
      usRef.current!.textContent = `US Eastern ${clock(8, p * 9)}`;
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
      {name === "her" && <div className={styles.apron} />}
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

        {/* The title sits above every layer, so nothing can ever cover it;
            the timing clears it before the room and her arrive. */}
        <div ref={titleRef} className={styles.heroTitle} style={{ opacity: 0 }} data-va-title>
          <h1 id="va-title">
            <span className={styles.srOnly}>{hero.srTitle}</span>
            {hero.title}
          </h1>
          <p className={styles.label}>{hero.kicker}</p>
        </div>
        <div ref={fadeRef} className={styles.heroFade} aria-hidden="true" />

        {/* Dust on the lens. */}
        <div ref={veilRef} aria-hidden="true" className={styles.veil} data-va-veil>
          <div className={styles.veilCopy}>
            <p className={styles.label}>{hero.kicker}</p>
            <p className={styles.veilCall}>{hero.veil}</p>
            <span className={styles.bounce}>↓</span>
          </div>
        </div>
        <canvas ref={dustRef} aria-hidden="true" className={styles.dust} />

        {/* Shift HUD. */}
        <div ref={hudRef} aria-hidden="true" className={styles.hud} style={{ opacity: 0 }}>
          <div className={styles.hudScrim} />
          <div className={`${styles.brackets} ${styles.hudFrame}`} />
          <div className={styles.hudTL}>
            <p ref={pktRef}>PKT 18:00</p>
            <p className={styles.hudDim}>Your shift</p>
          </div>
          <div className={styles.hudTR}>
            <p>
              <span ref={usRef} className={styles.hudEarth}>
                US Eastern 08:00
              </span>
            </p>
            <p className={styles.hudDim}>Clinics open</p>
          </div>
          <div className={styles.hudBL}>{hero.route}</div>
          <div className={styles.hudBR}>
            Scroll <span className={styles.bounce}>↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
