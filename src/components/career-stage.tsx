"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  careerChapters,
  careerFrame,
  careerMotion,
  clamp,
  smooth,
} from "@/lib/career-content";
import { createCareerWorld, type CareerWorld } from "./career-world";
import { loadCareerBrain } from "@/lib/career-brain";
import styles from "./career-section.module.css";

export default function CareerStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = root.current;
    if (!rail) return;
    const section = rail.closest("section")!;
    const viewport = rail.querySelector<HTMLElement>("[data-career-viewport]")!;
    const cards = [
      ...rail.querySelectorAll<HTMLElement>("[data-career-chapter]"),
    ];
    const texts = cards.map((card) =>
      card.querySelector<HTMLElement>("[data-career-text]")!,
    );
    const host = rail.querySelector<HTMLElement>("[data-career-world]")!;
    const groups = cards.map((card) => [
      ...card.querySelectorAll<HTMLElement>("[data-career-group]"),
    ]);
    const visual = rail.querySelector<HTMLElement>(
      "[data-career-world-panel]",
    )!;
    const jumps = [
      ...rail.querySelectorAll<HTMLAnchorElement>("[data-career-jump]"),
    ];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    gsap.registerPlugin(ScrollTrigger);
    let context: gsap.Context | undefined,
      timeline: gsap.core.Timeline | undefined,
      world: CareerWorld | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined,
      focusTimer: ReturnType<typeof setTimeout> | undefined;
    let pendingTarget: number | undefined;
    let disposed = false,
      failed = false,
      visible = false,
      hashHandled = false,
      travel = 0,
      revision = 0,
      lastCard = -1;
    const reset = () => {
      context?.revert();
      context = undefined;
      timeline = undefined;
      rail.dataset.mode = "flow";
      delete rail.dataset.compact;
      rail.dataset.progress = "0";
      lastCard = -1;
      cards.forEach((card) => {
        card.inert = false;
        card.removeAttribute("aria-hidden");
        card.style.removeProperty("transform");
        card.style.removeProperty("visibility");
      });
      texts.forEach((text) => text.style.removeProperty("transform"));
      visual.style.removeProperty("transform");
      [
        "--career-stage-height",
        "--career-panel-height",
        "--career-panel-width",
        "--career-visual-height",
        "--career-travel",
      ].forEach((name) => rail.style.removeProperty(name));
      jumps.forEach((link) => link.removeAttribute("aria-current"));
      groups.flat().forEach((group) => {
        group.style.removeProperty("transform");
        group.style.removeProperty("opacity");
      });
    };
    const flow = () => {
      reset();
      world?.dispose();
      world = undefined;
      rail.dataset.engine = failed ? "fallback" : "static";
    };
    const navigate = (index: number, focus = true, instant = false) => {
      const immediate = instant || reduced.matches;
      if (rail.dataset.mode === "pinned" && !timeline?.scrollTrigger) {
        pendingTarget = index;
        rail.scrollIntoView({
          block: "start",
          behavior: immediate ? "instant" : "smooth",
        });
        return;
      }
      if (rail.dataset.mode === "pinned" && timeline?.scrollTrigger) {
        const target =
          timeline.scrollTrigger.start + travel * careerMotion.holds[index];
        if (Math.abs(scrollY - target) > 16)
          scrollTo({ top: target, behavior: immediate ? "instant" : "smooth" });
      } else
        cards[index].scrollIntoView({
          block: "start",
          behavior: immediate ? "instant" : "smooth",
        });
      if (focus) {
        clearTimeout(focusTimer);
        focusTimer = setTimeout(
          () => {
            if (!disposed && !cards[index].inert)
              cards[index]
                .querySelector<HTMLElement>("h3")
                ?.focus({ preventScroll: true });
          },
          immediate ? 0 : 1500,
        );
      }
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>(
        "[data-career-jump]",
      );
      if (
        !link ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      history.replaceState(null, "", link.hash);
      navigate(Number(link.dataset.careerJump));
    };
    const configure = async () => {
      if (disposed) return;
      const current = ++revision;
      reset();
      const top = parseFloat(
        getComputedStyle(section).getPropertyValue("--career-top"),
      );
      const stageHeight = document.documentElement.clientHeight - top - 24;
      const stacked = innerWidth < 1024;
      const gap = parseFloat(
        getComputedStyle(section).getPropertyValue("--career-gap"),
      );
      let visualHeight = stacked
        ? clamp(stageHeight * 0.34, 176, 280)
        : stageHeight;
      let panelHeight = stacked
        ? stageHeight - visualHeight - gap
        : stageHeight;
      if (
        reduced.matches ||
        failed ||
        new URLSearchParams(location.search).has("no3d") ||
        (!stacked && panelHeight < 460)
      ) {
        flow();
        ScrollTrigger.refresh();
        return;
      }
      const stageWidth = rail.clientWidth,
        panelWidth = stacked ? stageWidth : (stageWidth - gap) / 2,
        visualOffset = stacked ? 0 : panelWidth + gap;
      rail.style.setProperty("--career-stage-height", `${stageHeight}px`);
      rail.style.setProperty("--career-panel-height", `${panelHeight}px`);
      rail.style.setProperty("--career-panel-width", `${panelWidth}px`);
      rail.style.setProperty("--career-visual-height", `${visualHeight}px`);
      rail.dataset.layout = stacked ? "stacked" : "split";
      rail.dataset.mode = "pinned";
      if (stacked) {
        // Measure the copy at its real mobile width. Give it the space it
        // needs before allocating artwork, rather than disabling the entire
        // scroll interaction on shorter phones.
        const required = Math.ceil(
          Math.max(
            ...texts.map((text) => {
              const css = getComputedStyle(text);
              return (
                parseFloat(css.paddingTop) +
                parseFloat(css.paddingBottom) +
                4 +
                [...text.children].reduce((height, child) => {
                  const style = getComputedStyle(child);
                  return (
                    height +
                    child.getBoundingClientRect().height +
                    (child === text.lastElementChild
                      ? 0
                      : parseFloat(style.marginTop) || 0) +
                    (parseFloat(style.marginBottom) || 0)
                  );
                }, 0)
              );
            }),
          ),
        );
        if (required > stageHeight) {
          flow();
          ScrollTrigger.refresh();
          return;
        }
        const available = stageHeight - required - gap;
        visualHeight = available >= 120 ? Math.min(visualHeight, available) : 0;
        panelHeight = stageHeight - (visualHeight ? visualHeight + gap : 0);
        rail.dataset.compact = String(visualHeight === 0);
        rail.style.setProperty("--career-panel-height", `${panelHeight}px`);
        rail.style.setProperty("--career-visual-height", `${visualHeight}px`);
      }
      if (texts.some((text) => text.scrollHeight > text.clientHeight + 1)) {
        flow();
        ScrollTrigger.refresh();
        return;
      }
      travel = Math.round(
        Math.max(
          stacked ? 900 : 1000,
          stageHeight * careerMotion.travelScreens,
        ),
      );
      rail.style.setProperty("--career-travel", `${travel}px`);
      visual.style.transform = `translate3d(${visualOffset}px,0,0)`;
      texts[1].style.transform = stacked
        ? `translate3d(${stageWidth + gap}px,0,0)`
        : `translate3d(0,${panelHeight}px,0)`;
      cards[1].inert = true;
      cards[1].setAttribute("aria-hidden", "true");
      const compact = rail.dataset.compact === "true";
      if (compact) {
        world?.dispose();
        world = undefined;
      }
      if (!compact && !world && (!visible || section.closest("main")?.inert)) {
        rail.dataset.engine = "poster";
        ScrollTrigger.refresh();
        return;
      }
      try {
        if (!compact && !world) {
          const brain = await loadCareerBrain();
          if (disposed || current !== revision) return;
          world = createCareerWorld(host, brain, () => {
            failed = true;
            flow();
            ScrollTrigger.refresh();
          });
        }
      } catch {
        if (disposed || current !== revision) return;
        failed = true;
        flow();
        ScrollTrigger.refresh();
        return;
      }
      world?.resize();
      world?.setActive(visible);
      rail.dataset.engine = compact ? "cards" : "three";
      const paint = (progress: number) => {
        const frame = careerFrame(progress);
        const swap = smooth(frame.exchange);
        const rise = smooth((frame.exchange - 0.16) / 0.72);
        if (stacked) {
          visual.style.transform = "translate3d(0,0,0)";
          texts[0].style.transform = `translate3d(${-(stageWidth + gap) * swap}px,0,0)`;
          texts[1].style.transform = `translate3d(${(stageWidth + gap) * (1 - swap)}px,0,0)`;
        } else {
          visual.style.transform = `translate3d(${visualOffset * (1 - swap)}px,0,0)`;
          texts[1].style.transform = `translate3d(0,${panelHeight * (1 - rise)}px,0)`;
        }
        cards.forEach((card, index) => {
          const readable =
            index === 0 ? 1 - smooth((frame.exchange - 0.15) / 0.6) : rise;
          card.inert = index !== frame.chapter || readable < 0.85;
          card.setAttribute("aria-hidden", String(index !== frame.chapter));
          groups[index].forEach((group, order) => {
            const incoming = smooth(
              (frame.exchange - 0.22 - order * 0.04) / (0.7 - order * 0.04),
            );
            const outgoing = smooth(
              (frame.exchange - 0.24 - order * 0.03) / (0.62 - order * 0.03),
            );
            group.style.transform = `translate3d(0,${index === 0 ? -40 * outgoing : 32 * (1 - incoming)}px,0)`;
            group.style.opacity = String(index === 0 ? 1 - outgoing : incoming);
          });
        });
        if (lastCard !== frame.chapter) {
          lastCard = frame.chapter;
          rail.dataset.active = String(lastCard);
          jumps.forEach((link, index) => {
            if (index === lastCard) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        }
        rail.dataset.progress = progress.toFixed(4);
        world?.update(frame);
      };
      context = gsap.context(() => {
        const model = { progress: 0 };
        timeline = gsap.timeline({
          scrollTrigger: {
            id: "career-story",
            trigger: rail,
            start: `top ${top}px`,
            end: `+=${travel}`,
            scrub: careerMotion.scrub,
            invalidateOnRefresh: true,
          },
        });
        timeline.to(model, {
          progress: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => paint(clamp(model.progress)),
        });
        careerChapters.forEach((card, index) =>
          timeline!.addLabel(card.id, careerMotion.holds[index]),
        );
        paint(0);
      }, rail);
      ScrollTrigger.refresh();
      // A late layout refresh or deferred GPU initialization can happen after
      // the visitor has already scrolled into Jobs. Rebuild at the measured
      // scroll position instead of painting the Training hold until a new event.
      const trigger = timeline?.scrollTrigger;
      if (trigger && timeline) {
        trigger.update();
        const progress = clamp(
          (scrollY - trigger.start) / (trigger.end - trigger.start),
        );
        timeline.progress(progress, true);
        paint(progress);
      }
      if (pendingTarget !== undefined) {
        const target = pendingTarget;
        pendingTarget = undefined;
        navigate(target);
      }
      if (!hashHandled && !section.closest("main")?.inert) {
        hashHandled = true;
        const target = careerChapters.findIndex(
          (card) => location.hash === `#career-${card.id}`,
        );
        if (target >= 0) navigate(target, false, true);
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(configure, 140);
    };
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        world?.setActive(visible);
        if (visible && !world && !failed) schedule();
      },
      { threshold: 0 },
    );
    intersection.observe(viewport);
    const resize = new ResizeObserver(schedule);
    texts.forEach((text) =>
      [...text.children].forEach((child) => resize.observe(child)),
    );
    const main = section.closest("main");
    const intro = new MutationObserver(() => {
      if (!main?.inert) schedule();
    });
    if (main)
      intro.observe(main, { attributes: true, attributeFilter: ["inert"] });
    rail.addEventListener("click", click);
    addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    void document.fonts.ready.then(() => {
      if (!disposed) schedule();
    });
    configure();
    return () => {
      disposed = true;
      revision++;
      clearTimeout(timer);
      clearTimeout(focusTimer);
      intersection.disconnect();
      resize.disconnect();
      intro.disconnect();
      rail.removeEventListener("click", click);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      reset();
      world?.dispose();
    };
  }, []);
  return (
    <div
      ref={root}
      className={styles.rail}
      data-career-rail
      data-mode="flow"
      data-active="0"
    >
      <div className={styles.viewport} data-career-viewport>
        <nav
          className={styles.keyboardNav}
          aria-label="Career section navigation"
        >
          <a href="#career-training" data-career-jump="0">
            Jump to Training Programs
          </a>
          <a href="#career-jobs" data-career-jump="1">
            Jump to Jobs
          </a>
        </nav>
        <div className={styles.panels} data-career-panels>
          {children}
          <div
            className={styles.worldPanel}
            data-career-world-panel
            aria-hidden="true"
          >
            <img
              src="/media/career-paths/training-refined.webp"
              alt=""
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
              className={styles.loadingPoster}
            />
            <div className={styles.worldHost} data-career-world />
          </div>
        </div>
      </div>
    </div>
  );
}
