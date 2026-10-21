"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./problem-cards.module.css";

type CareerProblem = {
  id: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

export default function ProblemCards({ items }: { items: CareerProblem[] }) {
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [layout, setLayout] = useState<"fan" | "stack" | "stage" | "list">(
    "list",
  );
  const activeIndex = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => setEnhanced(true), []);

  useEffect(() => {
    const element = root.current;
    if (!element || !enhanced) return;
    const section = element.closest("section");
    const scene = section?.querySelector<HTMLElement>("[data-problem-scene]");
    const heading = section?.querySelector<HTMLElement>(
      "[data-problem-heading]",
    );
    const cta = section?.querySelector<HTMLElement>("[data-problem-cta]");
    const deck = element.querySelector<HTMLElement>("[data-problem-deck]");
    const shells = [
      ...element.querySelectorAll<HTMLElement>("[data-problem-shell]"),
    ];
    const rotors = [
      ...element.querySelectorAll<HTMLElement>("[data-problem-rotor]"),
    ];
    const backs = [
      ...element.querySelectorAll<HTMLElement>("[data-problem-back]"),
    ];
    const copies = [
      ...element.querySelectorAll<HTMLElement>("[data-problem-copy]"),
    ];
    if (!section || !scene || !heading || !cta || !deck) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let context: gsap.Context | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const configure = () => {
      if (disposed) return;
      context?.revert();
      context = undefined;
      section.dataset.motion = "static";
      element.dataset.motion = "static";
      section.style.removeProperty("--scroll-travel");
      section.style.removeProperty("--scene-height");
      ["--scroll-travel", "--stage-height", "--stage-top"].forEach((name) =>
        element.style.removeProperty(name),
      );
      const fan = innerWidth >= 1024;
      let mode: "fan" | "stack" | "stage" | "list" = fan
        ? "fan"
        : reduced.matches
          ? "list"
          : "stack";
      section.dataset.cardLayout = mode;
      element.dataset.layout = mode;
      const copyHeight = Math.ceil(
        Math.max(...copies.map((copy) => copy.offsetHeight)),
      );
      const viewportHeight = document.documentElement.clientHeight;
      const clearance = parseFloat(
        getComputedStyle(section).getPropertyValue("--nav-clearance"),
      );
      const measureOverhead = () => {
        const s = getComputedStyle(scene);
        return (
          parseFloat(s.paddingTop) +
          parseFloat(s.paddingBottom) +
          heading.offsetHeight +
          parseFloat(getComputedStyle(heading).marginBottom) +
          cta.offsetHeight +
          parseFloat(getComputedStyle(cta).marginTop) +
          parseFloat(getComputedStyle(element).getPropertyValue("--deck-space"))
        );
      };
      let overhead = measureOverhead();
      let cardHeight = Math.max(
        copyHeight + (mode === "stack" ? 128 : 144),
        Math.min(fan ? 540 : 520, viewportHeight - overhead),
      );
      let stageHeight = 0;
      // On short phones, pin only the cards. Keep the heading and CTA in flow.
      if (mode === "stack" && cardHeight + overhead > viewportHeight + 1) {
        stageHeight = viewportHeight - clearance - 24;
        mode = copyHeight + 160 + 48 <= stageHeight ? "stage" : "list";
        section.dataset.cardLayout = mode;
        element.dataset.layout = mode;
        overhead = measureOverhead();
        cardHeight =
          mode === "stage"
            ? Math.min(520, stageHeight - 48)
            : Math.max(
                copyHeight + 170,
                Math.min(520, viewportHeight - overhead),
              );
        if (mode === "stage") stageHeight = cardHeight + 48;
      }
      setLayout(mode);
      element.style.setProperty("--copy-height", `${copyHeight}px`);
      element.style.setProperty("--card-height", `${Math.ceil(cardHeight)}px`);
      element.style.setProperty(
        "--card-min-height",
        `${Math.ceil(cardHeight)}px`,
      );
      if (
        mode === "list" ||
        reduced.matches ||
        (mode !== "stage" && cardHeight + overhead > viewportHeight + 1)
      ) {
        element.dataset.progress = "1";
        ScrollTrigger.refresh();
        return;
      }
      const width = shells[0].offsetWidth;
      const gap = Math.min(30, innerWidth * 0.02);
      const travel = Math.round(
        fan
          ? Math.max(600, viewportHeight * 1.1)
          : Math.max(960, viewportHeight * (mode === "stage" ? 1.8 : 2.2)),
      );
      if (mode === "stage") {
        element.style.setProperty("--scroll-travel", `${travel}px`);
        element.style.setProperty("--stage-height", `${stageHeight}px`);
        element.style.setProperty("--stage-top", `${clearance}px`);
        section.dataset.motion = "stage";
      } else {
        section.style.setProperty("--scroll-travel", `${travel}px`);
        section.style.setProperty("--scene-height", `${viewportHeight}px`);
        section.dataset.motion = "scroll";
      }
      element.dataset.motion = "scroll";
      context = gsap.context(() => {
        if (mode === "stack" || mode === "stage") {
          const updateActive = (index: number) => {
            if (activeIndex.current === index) return;
            activeIndex.current = index;
            setActive(index);
          };
          updateActive(0);
          gsap.set(shells, {
            x: 0,
            y: (index) => (index === 0 ? 0 : cardHeight + 90),
            rotation: (index) => [0, 3, -3][index],
            scale: 1,
            zIndex: (index) => index + 1,
          });
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "problem-card-stack",
              trigger: mode === "stage" ? element : section,
              start: mode === "stage" ? `top ${clearance}px` : "top top",
              end: `+=${travel}`,
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
            onUpdate() {
              const p = this.progress();
              element.dataset.progress = p.toFixed(4);
              updateActive(p < 0.36 ? 0 : p < 0.76 ? 1 : 2);
            },
          });
          timeline
            .to(
              shells[0],
              { scale: 0.96, y: -10, rotation: -2, duration: 0.18 },
              0.24,
            )
            .to(
              shells[1],
              { y: 0, rotation: 0, duration: 0.18, ease: "power1.inOut" },
              0.24,
            )
            .to(shells[0], { scale: 0.93, y: -18, duration: 0.18 }, 0.64)
            .to(
              shells[1],
              { scale: 0.96, y: -8, rotation: 2, duration: 0.18 },
              0.64,
            )
            .to(
              shells[2],
              { y: 0, rotation: 0, duration: 0.18, ease: "power1.inOut" },
              0.64,
            )
            .to({}, { duration: 0.18 }, 0.82);
          return;
        }
        gsap.set(deck, { scale: 1.02, y: 8 });
        gsap.set(shells, {
          x: (index) => (index - 1) * width,
          y: 0,
          rotation: 0,
          scale: 1,
        });
        gsap.set(rotors, { rotationY: 0 });
        gsap.set(backs[0], { borderRadius: "24px 0 0 24px" });
        gsap.set(backs[1], { borderRadius: 0 });
        gsap.set(backs[2], { borderRadius: "0 24px 24px 0" });
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "problem-card-reveal",
              trigger: section,
              start: "top top",
              end: `+=${travel}`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
            onUpdate() {
              element.dataset.progress = this.progress().toFixed(4);
            },
          })
          .to(deck, { scale: 1, y: 0, duration: 0.1 }, 0)
          .to(
            shells,
            { x: (index) => (index - 1) * (width + gap), duration: 0.12 },
            0.08,
          )
          .to(backs, { borderRadius: 24, duration: 0.12 }, 0.08)
          .to(
            rotors,
            {
              rotationY: 180,
              duration: 0.22,
              stagger: 0.02,
              ease: "power1.inOut",
            },
            0.18,
          )
          .to(
            shells,
            {
              rotation: (index) => (index - 1) * 2.5,
              y: (index) => (index === 1 ? 0 : 10),
              scale: 1,
              duration: 0.14,
            },
            0.34,
          )
          .to({}, { duration: 0.52 }, 0.48);
      }, element);
      ScrollTrigger.refresh();
    };
    const schedule = () => {
      if (disposed) return;
      clearTimeout(timer);
      timer = setTimeout(configure, 120);
    };
    const observer = new ResizeObserver(schedule);
    copies.forEach((copy) => observer.observe(copy));
    observer.observe(heading);
    observer.observe(cta);
    addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    const main = section.closest("main");
    const introObserver = new MutationObserver(() => {
      if (main && !main.inert) schedule();
    });
    if (main)
      introObserver.observe(main, {
        attributes: true,
        attributeFilter: ["inert"],
      });
    void document.fonts.ready.then(schedule);
    configure();
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      introObserver.disconnect();
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      context?.revert();
      delete section.dataset.motion;
      delete section.dataset.cardLayout;
      section.style.removeProperty("--scroll-travel");
      section.style.removeProperty("--scene-height");
      ["--scroll-travel", "--stage-height", "--stage-top"].forEach((name) =>
        element.style.removeProperty(name),
      );
    };
  }, [enhanced, items.length]);

  return (
    <div
      ref={root}
      className={styles.cards}
      data-enhanced={enhanced}
      data-layout={layout}
      data-active={active}
      role="group"
      aria-label="Three career problems"
    >
      <div className={styles.viewport}>
        <div className={styles.deck} data-problem-deck>
          {items.map((item, index) => (
            <div
              className={styles.shell}
              data-problem-shell
              data-position={index === active ? "active" : "inactive"}
              key={item.id}
              style={{ "--index": index } as CSSProperties}
            >
              <div className={styles.rotor} data-problem-rotor>
                <div
                  className={styles.back}
                  data-problem-back
                  aria-hidden="true"
                />
                <article
                  id={`problem-${item.id}`}
                  className={styles.card}
                  data-story={item.id}
                  data-position={index === active ? "active" : "inactive"}
                  aria-labelledby={`problem-title-${item.id}`}
                >
                  <picture>
                    <source
                      srcSet={`${item.image.replace(".webp", "-480.webp")} 480w, ${item.image} 960w`}
                      sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 360px, 340px"
                    />
                    <img
                      src={item.image}
                      alt={item.alt}
                      width={960}
                      height={1440}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </picture>
                  <span className={styles.number} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.copy} data-problem-copy>
                    <h3 id={`problem-title-${item.id}`}>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
