"use client";

import { useEffect, useRef, useState } from "react";
import { path as content } from "./content";
import { clamp, easeOutCubic, follower, onFrame, pinProgress, range } from "./va-motion";
import styles from "./webinar.module.css";

/**
 * Webinar → paid role, drawn as you scroll. The section pins while four legs
 * ink themselves one after another, a marker riding the leg being drawn;
 * training progress ticks to 100% across the long leg.
 *
 * The route runs from her, at her desk at home (a crop of the opening scene),
 * to the same woman at work inside PractiScale's office, its real reception
 * and logos behind her — night teal on her side, a warm amber morning around
 * the paid role. Landscape screens draw it left → right;
 * portrait screens get their own top → bottom composition instead of a
 * shrunken wide one.
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;

const HOME_IMAGE = "/media/va-hero/home-orb.webp";
const ROLE_IMAGE = "/media/va-hero/practiscale-office-orb-v1.webp";

type Orb = { cx: number; cy: number; r: number; ring: number };
type Layout = {
  id: "land" | "port";
  viewBox: string;
  home: Orb;
  role: Orb;
  legs: string[];
  train: { x1: number; y1: number; x2: number; y2: number };
  homeLabel: [number, number];
  roleLabel: [number, number];
  stars: (x: number, y: number) => boolean;
};

const ring = (o: Orb) => `a${o.ring} ${o.ring} 0 1 1 -0.1 0`;

const LAND: Layout = (() => {
  const home = { cx: 230, cy: 300, r: 92, ring: 128 };
  const role = { cx: 960, cy: 290, r: 92, ring: 128 };
  return {
    id: "land",
    viewBox: "90 30 1020 520",
    home,
    role,
    legs: [
      // Webinar: a lap and a bit around home.
      `M${home.cx} ${home.cy - home.ring} ${ring(home)} a${home.ring} ${home.ring} 0 0 1 106 57`,
      // Qualification: a short climb out.
      `M${home.cx + 106} ${home.cy - home.ring + 57} C 380 190, 420 150, 470 130`,
      // Training: the long arc across.
      `M470 130 C 620 50, 820 50, ${role.cx} ${role.cy - role.ring}`,
      // Paid role: a ring closes around PractiScale, then touches it.
      `M${role.cx} ${role.cy - role.ring} ${ring(role)} L ${role.cx} ${role.cy - role.r}`,
    ],
    train: { x1: 470, y1: 0, x2: 960, y2: 0 },
    homeLabel: [home.cx, home.cy + home.ring + 46],
    roleLabel: [role.cx, role.cy + role.ring + 46],
    stars: (x) => x < 620,
  };
})();

const PORT: Layout = (() => {
  const home = { cx: 300, cy: 200, r: 92, ring: 128 };
  const role = { cx: 300, cy: 700, r: 92, ring: 128 };
  const out = { x: home.cx + 90.5, y: home.cy + 90.5 };
  return {
    id: "port",
    viewBox: "40 10 520 920",
    home,
    role,
    legs: [
      `M${home.cx} ${home.cy - home.ring} ${ring(home)} a${home.ring} ${home.ring} 0 0 1 90.5 218.5`,
      `M${out.x} ${out.y} C 430 340, 450 380, 430 420`,
      `M430 420 C 400 480, 150 470, 180 525 S 290 560, ${role.cx} ${role.cy - role.ring}`,
      `M${role.cx} ${role.cy - role.ring} ${ring(role)} L ${role.cx} ${role.cy - role.r}`,
    ],
    train: { x1: 0, y1: 420, x2: 0, y2: 572 },
    homeLabel: [home.cx, home.cy - home.ring - 24],
    roleLabel: [role.cx, role.cy + role.ring + 46],
    stars: (_, y) => y < 470,
  };
})();

const LAYOUTS = [LAND, PORT];
const STROKES = ["#9be3d6", "#9be3d6", "train", "#f5b041"];

export default function CareerPath() {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<Record<Layout["id"], SVGPathElement[]>>({ land: [], port: [] });
  const markerRefs = useRef<Partial<Record<Layout["id"], SVGGElement>>>({});
  const pctRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    const follow = follower(9);
    const portrait = window.matchMedia("(max-aspect-ratio: 1/1)");
    let lastP = -1;
    let lastLayout = "";
    let current = 0;
    return onFrame((_, dt) => {
      const root = rootRef.current;
      if (!root) return;
      const { p: target, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = follow(target, dt);
      // Only the visible composition is measured (hidden SVG has no geometry).
      const id: Layout["id"] = portrait.matches ? "port" : "land";
      if (Math.abs(p - lastP) < 0.00005 && id === lastLayout) return;
      lastP = p;
      lastLayout = id;

      const legs = legRefs.current[id];
      const u = range(p, ...WINDOW) * legs.length;
      const s = clamp(Math.floor(u), 0, legs.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legs.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          markerRefs.current[id]?.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        }
      });
      root.dataset.step = String(s);
      const training = easeOutCubic(clamp(u - 2));
      pctRef.current!.textContent = String(Math.round(training * 100));
    });
  }, []);

  const current = content.legs[leg];

  const scene = (L: Layout) => (
    <svg
      key={L.id}
      viewBox={L.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={L.id === "land" ? styles.pathLand : styles.pathPort}
      role="img"
      aria-label="Your path from working at home to a paid role inside PractiScale, drawn in four steps: webinar, qualification, training and paid role."
      data-va-path-layout={L.id}
    >
      <defs>
        <clipPath id={`va-${L.id}-home`}>
          <circle cx={L.home.cx} cy={L.home.cy} r={L.home.r} />
        </clipPath>
        <clipPath id={`va-${L.id}-role`}>
          <circle cx={L.role.cx} cy={L.role.cy} r={L.role.r} />
        </clipPath>
        <radialGradient id={`va-${L.id}-glow`}>
          <stop offset="0.8" stopColor="#9be3d6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#9be3d6" stopOpacity="0" />
        </radialGradient>
        {/* Training runs the brand gradient, teal into blue. */}
        <linearGradient id={`va-${L.id}-train`} gradientUnits="userSpaceOnUse" {...L.train}>
          <stop offset="0" stopColor="#20bfa8" />
          <stop offset="1" stopColor="#3aa6dd" />
        </linearGradient>
      </defs>

      {/* Stars on her (night) side only, thinning towards the morning. */}
      <g fill="#fff">
        {Array.from({ length: 90 }, (_, i) => {
          const x = (i * 173) % 1200;
          const y = (i * 97) % 940;
          return L.stars(x, y) ? (
            <circle key={i} cx={x} cy={y} r={i % 7 === 0 ? 1.4 : 0.75} opacity={0.15 + ((i * 37) % 50) / 120} />
          ) : null;
        })}
      </g>

      <circle cx={L.home.cx} cy={L.home.cy} r={L.home.r * 1.18} fill={`url(#va-${L.id}-glow)`} />
      <image
        href={HOME_IMAGE}
        x={L.home.cx - L.home.r}
        y={L.home.cy - L.home.r}
        width={L.home.r * 2}
        height={L.home.r * 2}
        clipPath={`url(#va-${L.id}-home)`}
        preserveAspectRatio="xMidYMid slice"
      />
      {/* The paid role is the milestone, so it carries Proof Amber. */}
      <circle cx={L.role.cx} cy={L.role.cy} r={L.role.r + 10} fill="none" stroke="#f5b041" strokeOpacity="0.35" strokeWidth="2" />
      <image
        href={ROLE_IMAGE}
        x={L.role.cx - L.role.r}
        y={L.role.cy - L.role.r}
        width={L.role.r * 2}
        height={L.role.r * 2}
        clipPath={`url(#va-${L.id}-role)`}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Ghost of the full route, then the inked legs over it. */}
      {L.legs.map((d, i) => (
        <path key={`g${i}`} d={d} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="3 6" />
      ))}
      {L.legs.map((d, i) => (
        <path
          key={i}
          ref={(el) => {
            if (el) legRefs.current[L.id][i] = el;
          }}
          d={d}
          pathLength={1}
          fill="none"
          stroke={STROKES[i] === "train" ? `url(#va-${L.id}-train)` : STROKES[i]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          data-va-leg
        />
      ))}

      <g
        ref={(el) => {
          if (el) markerRefs.current[L.id] = el;
        }}
        transform={`translate(${L.home.cx} ${L.home.cy - L.home.ring})`}
      >
        <circle r="12" fill="#9be3d6" opacity="0.28" />
        <circle r="5" fill="#fff" />
      </g>

      <g className={styles.pathLabels}>
        <text x={L.homeLabel[0]} y={L.homeLabel[1]} textAnchor="middle">
          YOU · AT HOME
        </text>
        <text x={L.roleLabel[0]} y={L.roleLabel[1]} textAnchor="middle">
          PRACTISCALE
        </text>
        <text x={L.roleLabel[0]} y={L.roleLabel[1] + 30} textAnchor="middle" className={styles.pathLabelGold}>
          PAID ROLE
        </text>
      </g>
    </svg>
  );

  return (
    <section
      ref={rootRef}
      id="path"
      aria-labelledby="path-title"
      className={styles.pathSection}
      style={{ height: `${SECTION_VH}svh` }}
      data-va-path
    >
      <div className={styles.pathStage}>
        <div className={styles.pathHead}>
          <div>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 id="path-title" className={`${styles.display} ${styles.pathTitle}`}>
              {content.heading}
            </h2>
          </div>
          <p className={styles.label} aria-live="off">
            Training <span ref={pctRef} className={styles.white}>0</span>%
          </p>
        </div>

        <div className={styles.pathCanvas}>{LAYOUTS.map(scene)}</div>

        {/* Current leg. */}
        <div className={styles.pathLeg}>
          <p className={styles.eyebrow}>
            {current.when} · Step {leg + 1}/{content.legs.length}
          </p>
          <div key={leg} className={styles.legIn} aria-live="polite">
            <h3>{current.title}</h3>
            <p>{current.body}</p>
          </div>
          <div className={styles.legDots} aria-hidden="true">
            {content.legs.map((_, i) => (
              <span key={i} data-on={i <= leg} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
