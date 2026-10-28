"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountSceneAnchor } from "@/lib/scene-anchor.js";
import styles from "./hiring-section.module.css";

const steps = [
  {
    title: "Apply",
    detail: "Send your CV and a 60 second video on why you fit.",
  },
  {
    title: "Screen",
    detail:
      "A 20 minute call to confirm fit and compensation. Straight numbers.",
  },
  {
    title: "Task",
    detail: "A real role test, such as a sales call, a workflow or a design.",
  },
  {
    title: "Offer",
    detail:
      "A conversation with leadership. If approved, you start the following Monday.",
  },
];

function point(angle: number, radius: number) {
  const a = (angle * Math.PI) / 180;
  return [
    Number((240 + Math.sin(a) * radius).toFixed(3)),
    Number((240 - Math.cos(a) * radius).toFixed(3)),
  ];
}

export default function HiringSection() {
  const root = useRef<HTMLElement>(null);
  const selectStep = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const section = root.current!;
    const stage = section.querySelector<HTMLElement>("[data-hiring-stage]")!;
    const dial = section.querySelector<SVGElement>("[data-hiring-pointer]")!;
    const arc = section.querySelector<SVGCircleElement>("[data-hiring-arc]")!;
    const buttons = Array.from(
      section.querySelectorAll<HTMLButtonElement>("[data-hiring-select]"),
    );
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>("[data-hiring-step]"),
    );
    const centers = Array.from(
      section.querySelectorAll<HTMLElement>("[data-hiring-center]"),
    );
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let tween: gsap.core.Tween | undefined;
    let resizeFrame = 0;
    let disposed = false;
    let lastIndex = -1;
    const state = { value: 0 };

    function paint() {
      // Four reading holds; only the last part of each hold travels to the next
      // station. Scrubbing always follows the latest position, never a queue.
      const position = Math.min(3, state.value * 4);
      const base = Math.floor(position);
      const t = Math.max(0, (position - base - 0.55) / 0.45);
      const eased = t * t * (3 - 2 * t);
      const station = Math.min(3, base + eased);
      const angle = -45 + station * 90;
      dial.setAttribute("transform", `rotate(${angle} 240 240)`);
      arc.style.strokeDasharray = `${station * 25} 100`;
      section.dataset.progress = state.value.toFixed(4);
      section.dataset.angle = angle.toFixed(2);
      const index = Math.round(station);
      if (index === lastIndex) return;
      lastIndex = index;
      section.dataset.active = String(index);
      buttons.forEach((button, i) => {
        button.dataset.active = String(i === index);
        if (i === index) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      cards.forEach((card, i) => (card.dataset.active = String(i === index)));
      centers.forEach(
        (center, i) => (center.dataset.active = String(i === index)),
      );
    }

    gsap.registerPlugin(ScrollTrigger);
    function setup() {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      const wide = innerWidth >= 1000;
      const fits = innerHeight >= (wide ? 580 : innerWidth <= 600 ? 540 : 740);
      section.dataset.scroll = String(!motion.matches && fits);
      if (motion.matches || !fits) {
        state.value = 0;
        paint();
        return;
      }
      tween = gsap.fromTo(
        state,
        { value: 0 },
        {
          value: 1,
          ease: "none",
          onUpdate: paint,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
            scrub: 0.55,
            // The scalar endpoints never change. Invalidating this fromTo can
            // repaint zero after another scene refreshes without a new scroll.
            onRefresh: (trigger) => {
              trigger.animation?.totalProgress(trigger.progress);
              state.value = trigger.progress;
              paint();
            },
          },
        },
      );
    }
    selectStep.current = (index) => {
      if (section.dataset.scroll === "true") {
        const trigger = tween?.scrollTrigger;
        if (trigger)
          window.scrollTo({
            top:
              trigger.start +
              ((trigger.end - trigger.start) * (index + 0.22)) / 4,
            behavior: "instant",
          });
      } else {
        state.value = index / 4;
        paint();
      }
    };
    function resize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(setup);
    }
    setup();
    paint();
    window.addEventListener("resize", resize, { passive: true });
    motion.addEventListener("change", resize);
    document.fonts.ready.then(() => {
      if (!disposed) tween?.scrollTrigger?.refresh();
    });
    const removeAnchor = mountSceneAnchor(section, {
      hashes: ["#how-hiring-works"],
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(resizeFrame);
      removeAnchor();
      window.removeEventListener("resize", resize);
      motion.removeEventListener("change", resize);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      selectStep.current = () => {};
    };
  }, []);

  return (
    <section
      id="how-hiring-works"
      ref={root}
      className={styles.section}
      aria-labelledby="hiring-heading"
      data-theme="dark"
      data-active="0"
    >
      <div className={styles.stage} data-hiring-stage>
        <svg
          className={styles.contours}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse
              key={i}
              cx="720"
              cy="520"
              rx={330 + i * 62}
              ry={260 + i * 49}
            />
          ))}
        </svg>
        <a className={styles.skip} href="#hiring-end">
          Skip hiring animation
        </a>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Your next chapter</p>
          <h2 id="hiring-heading">How hiring works</h2>
          <p className={styles.subtitle}>
            Four steps. No long forms. No unnecessary rounds.
          </p>
        </header>

        <div className={styles.journey}>
          <div className={styles.dial}>
            <svg
              className={styles.instrument}
              viewBox="0 0 480 480"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="hiring-disc">
                  <stop stopColor="var(--raised)" />
                  <stop offset="1" stopColor="var(--deep)" />
                </radialGradient>
                <linearGradient
                  id="hiring-rim"
                  x1="70"
                  y1="50"
                  x2="410"
                  y2="440"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--accent)" stopOpacity=".65" />
                  <stop
                    offset=".5"
                    stopColor="var(--line-dark)"
                    stopOpacity=".2"
                  />
                  <stop
                    offset="1"
                    stopColor="var(--accent)"
                    stopOpacity=".35"
                  />
                </linearGradient>
              </defs>
              <circle
                cx="240"
                cy="240"
                r="210"
                fill="url(#hiring-disc)"
                stroke="url(#hiring-rim)"
              />
              <circle
                cx="240"
                cy="240"
                r="194"
                className={styles.track}
                strokeWidth="4"
              />
              <circle
                cx="240"
                cy="240"
                r="194"
                className={styles.progress}
                strokeWidth="4"
                pathLength="100"
                strokeDasharray="0 100"
                transform="rotate(-135 240 240)"
                data-hiring-arc
              />
              <g className={styles.ticks}>
                {Array.from({ length: 80 }, (_, i) => {
                  const a = point(i * 4.5, i % 5 === 0 ? 167 : 173);
                  const b = point(i * 4.5, 180);
                  return (
                    <path
                      key={i}
                      d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`}
                      strokeWidth={i % 5 === 0 ? 1.4 : 0.7}
                    />
                  );
                })}
              </g>
              <circle cx="240" cy="240" r="151" className={styles.innerRing} />
              <circle
                cx="240"
                cy="240"
                r="137"
                className={styles.innerRing}
                strokeDasharray="1 8"
              />
              {steps.map((_, i) => {
                const a = point(-45 + i * 90, 210);
                const b = point(-45 + i * 90, 235);
                return (
                  <g key={i} className={styles.connector}>
                    <path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} />
                    <circle cx={b[0]} cy={b[1]} r="3" />
                  </g>
                );
              })}
              <g transform="rotate(-45 240 240)" data-hiring-pointer>
                <path d="M240 52L233 71L247 71Z" className={styles.needle} />
                <path d="M240 80V108" className={styles.needleLine} />
                <circle cx="240" cy="63" r="12" className={styles.halo} />
              </g>
            </svg>
            <div className={styles.center} aria-hidden="true">
              <span className={styles.centerLabel}>Hiring process</span>
              {steps.map((step, i) => (
                <div
                  className={styles.centerStep}
                  data-hiring-center
                  data-active={i === 0}
                  key={step.title}
                >
                  <span className={styles.number}>0{i + 1}</span>
                  <span className={styles.centerTitle}>{step.title}</span>
                  <span className={styles.centerDetail}>{step.detail}</span>
                </div>
              ))}
            </div>
            <nav className={styles.stations} aria-label="Hiring steps">
              {steps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  className={styles.station}
                  data-hiring-select
                  data-active={i === 0}
                  aria-label={`0${i + 1} ${step.title}`}
                  aria-current={i === 0 ? "step" : undefined}
                  aria-controls={`hiring-step-${i + 1}`}
                  onClick={() => selectStep.current(i)}
                >
                  <span>0{i + 1} </span>
                  <span>{step.title}</span>
                </button>
              ))}
            </nav>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li
                key={step.title}
                id={`hiring-step-${i + 1}`}
                className={styles.step}
                data-hiring-step
                data-active={i === 0}
              >
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>0{i + 1}</span>
                  <h3>{step.title}</h3>
                </div>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.footer}>
          <span className={styles.hint}>
            Scroll to explore <span aria-hidden="true">↓</span>
          </span>
        </div>
      </div>
      <div id="hiring-end" tabIndex={-1} className={styles.end} />
    </section>
  );
}
