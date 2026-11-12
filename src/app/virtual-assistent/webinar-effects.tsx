"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const range = (value: number, from: number, to: number) =>
  clamp((value - from) / Math.max(0.0001, to - from));
const ease = (value: number) => value * value * (3 - 2 * value);
const percent = (value: number) => value.toFixed(2) + "%";

function current(element: Element, value: string | null) {
  if (value === null) element.removeAttribute("aria-current");
  else if (element.getAttribute("aria-current") !== value)
    element.setAttribute("aria-current", value);
}

function drawHero(hero: HTMLElement, progress: number) {
  const clear = ease(range(progress, 0, 0.31));
  const pullback = ease(range(progress, 0.05, 0.69));
  const light = ease(range(progress, 0.31, 0.74));
  const values = {
    "--photo-x": percent(6 * (1 - pullback)),
    "--photo-y": percent(9 * (1 - pullback)),
    "--photo-scale": (1.02 + 0.18 * (1 - pullback)).toFixed(4),
    "--photo-light": (0.62 + 0.38 * light).toFixed(4),
    "--window-y": percent(8 * (1 - light)),
    "--window-light": (0.08 + 0.63 * light).toFixed(4),
    "--near-x": percent(-21 + 115 * pullback),
    "--near-opacity": (0.95 - 0.35 * pullback).toFixed(4),
    "--haze": (0.78 * (1 - clear)).toFixed(4),
    "--haze-x": percent(83 * clear),
    "--handoff": ease(range(progress, 0.69, 1)).toFixed(4),
  };
  for (const [name, value] of Object.entries(values))
    hero.style.setProperty(name, value);
}

export default function WebinarEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-webinar-page]");
    if (!root) return;
    const page = root;

    const header = page.querySelector("header");
    const hero = page.querySelector<HTMLElement>("[data-webinar-hero]");
    const stage = hero?.querySelector<HTMLElement>("[data-webinar-stage]");
    const stories = page.querySelector<HTMLElement>("[data-webinar-stories]");
    const reel = stories?.querySelector<HTMLElement>("[data-story-reel]");
    const track = reel?.querySelector<HTMLElement>("[data-story-track]");
    const cards = [
      ...(track?.querySelectorAll<HTMLElement>("[data-story-card]") ?? []),
    ];
    const picker = reel?.querySelector<HTMLElement>("[data-story-picker]");
    const storyButtons = [
      ...(picker?.querySelectorAll<HTMLButtonElement>("[data-story-select]") ??
        []),
    ];
    const agenda = page.querySelector<HTMLElement>("[data-webinar-agenda]");
    const agendaList = agenda?.querySelector<HTMLElement>("[data-agenda-list]");
    const rows = [
      ...(agendaList?.querySelectorAll<HTMLElement>("[data-agenda-row]") ?? []),
    ];
    const topicButtons = [
      ...(agendaList?.querySelectorAll<HTMLButtonElement>(
        "[data-agenda-select]",
      ) ?? []),
    ];
    const staticTopics = [
      ...(agendaList?.querySelectorAll<HTMLElement>("[data-agenda-static]") ??
        []),
    ];
    const answers = staticTopics.map(
      (topic) =>
        topic.querySelector("[data-agenda-answer]")?.textContent?.trim() ?? "",
    );
    const detail = agenda?.querySelector<HTMLElement>("[data-agenda-detail]");
    const minute = agenda?.querySelector<HTMLElement>("[data-agenda-minute]");
    const path = agenda?.querySelector<SVGPathElement>("[data-agenda-route]");
    const marker = agenda?.querySelector<SVGCircleElement>(
      "[data-agenda-marker]",
    );
    const pathLength = path?.getTotalLength() ?? 0;
    const requirements = [
      ...page.querySelectorAll<HTMLElement>("[data-requirement]"),
    ];
    const requirementSection = page.querySelector<HTMLElement>("#requirements");
    const washes = [
      ...page.querySelectorAll<HTMLElement>("[data-webinar-wash]"),
    ];
    const washProgress = new WeakMap<HTMLElement, string>();
    const nav = [
      ...page.querySelectorAll<HTMLAnchorElement>("[data-webinar-chapters] a"),
    ].map((link) => ({
      link,
      section: document.getElementById(link.hash.slice(1)),
    }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tallEnough = window.matchMedia("(min-height: 720px)");
    const still = new URLSearchParams(window.location.search).has("still");
    let frame = 0;
    let firstLayout = true;
    let motion = false;
    let pinned = false;
    let activeLink: HTMLAnchorElement | undefined;
    let lastHero = -1;
    let lastReel = -1;
    let lastAgenda = "";
    let activeStory = 0;
    let manualStory: number | null = null;
    let storyTravel: { from: number; to: number; start: number } | null = null;
    let manualTopic: number | null = null;

    const updateReel = (position: number) => {
      if (!track || position === lastReel) return;
      lastReel = position;
      activeStory = Math.round(position);
      track.style.setProperty("--reel-x", percent(-100 * position));
      cards.forEach((card, index) => {
        const selected = index === activeStory;
        card.inert = !selected;
        card.setAttribute("aria-hidden", String(!selected));
        const distance = clamp(Math.abs(index - position));
        card.style.setProperty(
          "--story-opacity",
          (1 - 0.31 * distance).toFixed(3),
        );
        card.style.setProperty("--story-depth", distance.toFixed(3));
        if (storyButtons[index])
          current(storyButtons[index], selected ? "true" : null);
      });
    };

    const updateAgenda = (fill: number, index: number) => {
      const key = index + "/" + fill.toFixed(3);
      if (key === lastAgenda || !rows[index]) return;
      const topicChanged = !lastAgenda.startsWith(index + "/");
      lastAgenda = key;
      agendaList?.style.setProperty("--agenda-progress", fill.toFixed(3));
      if (minute) minute.textContent = String(index * 12).padStart(2, "0");
      path?.setAttribute(
        "stroke-dashoffset",
        (motion ? 1 - fill : 0).toFixed(3),
      );
      if (path && marker) {
        const point = path.getPointAtLength(fill * pathLength);
        marker.setAttribute("cx", point.x.toFixed(2));
        marker.setAttribute("cy", point.y.toFixed(2));
      }
      rows.forEach((row, item) => {
        const active = item === index;
        row.toggleAttribute("data-current", active);
        if (topicButtons[item])
          current(topicButtons[item], active ? "step" : null);
      });
      if (detail && detail.textContent !== answers[index]) {
        detail.textContent = answers[index];
        if (motion && topicChanged)
          detail.animate(
            [
              { opacity: 0.45, transform: "translateY(5px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 220, easing: "ease-out" },
          );
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    function update(now: number) {
      frame = 0;
      const height = window.innerHeight;
      const headerHeight = header?.offsetHeight ?? 0;
      const readingLine = Math.max(headerHeight + 25, height * 0.29);
      const chapter = nav.findLast(
        ({ section }) =>
          section && section.getBoundingClientRect().top <= readingLine,
      );
      const pageBounds = page.getBoundingClientRect();
      const heroBounds = pinned ? hero?.getBoundingClientRect() : undefined;
      const heroTravel =
        heroBounds && stage ? heroBounds.height - stage.offsetHeight : 0;
      const reelBounds = reel?.getBoundingClientRect();
      const storyBounds = stories?.getBoundingClientRect();
      const agendaBounds = agenda?.getBoundingClientRect();
      const listBounds = agendaList?.getBoundingClientRect();
      const requirementsBounds = requirementSection?.getBoundingClientRect();
      const washBounds = motion
        ? washes.map(
            (section) => [section, section.getBoundingClientRect()] as const,
          )
        : [];

      if (chapter?.link !== activeLink) {
        if (activeLink) current(activeLink, null);
        if (chapter) current(chapter.link, "location");
        activeLink = chapter?.link;
      }

      if (motion) {
        const progress = clamp(
          -pageBounds.top / Math.max(1, pageBounds.height - height),
        );
        page.style.setProperty("--page-progress", progress.toFixed(4));
        for (const [section, bounds] of washBounds) {
          const value = range(
            height * 0.85 - bounds.top,
            0,
            Math.max(bounds.height * 0.72, height * 0.36),
          );
          const key = value.toFixed(3);
          if (washProgress.get(section) === key) continue;
          washProgress.set(section, key);
          section.style.setProperty("--wash-x", percent(43 + value * 29));
          section.style.setProperty("--section-progress", key);
        }
      }

      if (pinned && hero && heroBounds) {
        const position = range(headerHeight - heroBounds.top, 0, heroTravel);
        if (position !== lastHero) {
          drawHero(hero, position);
          lastHero = position;
        }
      }

      if (
        motion &&
        storyBounds &&
        (storyBounds.bottom < headerHeight || storyBounds.top > height)
      ) {
        manualStory = null;
        storyTravel = null;
      }
      if (motion && storyBounds && stories) {
        const entry = ease(
          range(height * 0.86 - storyBounds.top, 0, height * 0.5),
        );
        stories.style.setProperty("--story-entry", entry.toFixed(3));
      }
      if (reelBounds) {
        const progress = range(
          height * 0.79 - reelBounds.top,
          0,
          height * 0.56,
        );
        const scrollPosition =
          ease(range(progress, 0.13, 0.42)) + ease(range(progress, 0.52, 0.83));
        if (storyTravel) {
          const step = range(now - storyTravel.start, 0, 410);
          updateReel(
            storyTravel.from + (storyTravel.to - storyTravel.from) * ease(step),
          );
          if (step < 1) requestUpdate();
          else storyTravel = null;
        } else {
          updateReel(manualStory ?? (motion ? scrollPosition : activeStory));
        }
      }

      if (
        motion &&
        agendaBounds &&
        (agendaBounds.bottom < headerHeight || agendaBounds.top > height)
      )
        manualTopic = null;
      if (listBounds && rows.length) {
        const progress = motion
          ? range(height * 0.67 - listBounds.top, 0, listBounds.height)
          : 0;
        const index =
          manualTopic ??
          Math.min(rows.length - 1, Math.floor(progress * rows.length));
        const fill =
          manualTopic === null
            ? progress
            : index / Math.max(1, rows.length - 1);
        updateAgenda(fill, index);
      }

      if (requirementsBounds) {
        const progress = motion
          ? range(
              height * 0.7 - requirementsBounds.top,
              0,
              requirementsBounds.height * 0.68,
            )
          : 0.5;
        const active = Math.min(
          requirements.length - 1,
          Math.floor(progress * requirements.length),
        );
        requirements.forEach((item, index) =>
          item.toggleAttribute("data-current", active === index),
        );
      }
    }

    const selectStory = (index: number) => {
      if (!cards[index]) return;
      manualStory = index;
      storyTravel = motion
        ? { from: Math.max(0, lastReel), to: index, start: performance.now() }
        : null;
      requestUpdate();
    };

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const story = event.target.closest<HTMLButtonElement>(
        "[data-story-select]",
      );
      if (story) selectStory(Number(story.dataset.storySelect));
      const topic = event.target.closest<HTMLButtonElement>(
        "[data-agenda-select]",
      );
      if (topic) {
        manualTopic = Number(topic.dataset.agendaSelect);
        requestUpdate();
      }
      const anchor = event.target.closest<HTMLAnchorElement>("a");
      if (anchor?.getAttribute("href") === "#stories") {
        manualStory = 0;
        storyTravel = null;
      }
      if (anchor?.getAttribute("href") === "#agenda") manualTopic = 0;
    };

    const onStoryFocus = (event: FocusEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-story-card]")
      ) {
        manualStory = activeStory;
        storyTravel = null;
        requestUpdate();
      }
    };

    const syncPreference = () => {
      const previousPin = pinned;
      const anchorId = firstLayout
        ? window.location.hash.slice(1)
        : activeLink?.hash.slice(1);
      const anchor = anchorId ? document.getElementById(anchorId) : null;
      motion = !reduced.matches && !still;
      pinned = motion && tallEnough.matches;
      page.toggleAttribute("data-webinar-motion", motion);
      if (!pinned) {
        hero?.removeAttribute("style");
        lastHero = -1;
      }
      if (!motion) {
        storyTravel = null;
        stories?.style.removeProperty("--story-entry");
        agendaList?.style.removeProperty("--agenda-progress");
        page.style.removeProperty("--page-progress");
        for (const section of washes) {
          section.style.removeProperty("--wash-x");
          section.style.removeProperty("--section-progress");
          washProgress.delete(section);
        }
      }
      lastAgenda = "";
      if (
        (firstLayout || previousPin !== pinned) &&
        anchor &&
        page.contains(anchor)
      ) {
        if (anchor.id === "stories") manualStory = 0;
        if (anchor.id === "agenda") manualTopic = 0;
        anchor.scrollIntoView();
      }
      if (firstLayout && pinned && hero && window.scrollY < 4) {
        drawHero(hero, 0);
        lastHero = 0;
      }
      firstLayout = false;
      requestUpdate();
    };

    const countdown = page.querySelector<HTMLElement>("[data-countdown]");
    const countdownUnits = countdown?.querySelectorAll("[data-countdown-unit]");
    const closesAt = Date.parse(countdown?.dataset.countdown ?? "");
    const updateCountdown = () => {
      const seconds = Math.max(0, Math.floor((closesAt - Date.now()) / 1000));
      const values = [
        Math.floor(seconds / 86400),
        Math.floor(seconds / 3600) % 24,
        Math.floor(seconds / 60) % 60,
        seconds % 60,
      ];
      countdownUnits?.forEach((unit, index) => {
        unit.textContent = String(values[index]).padStart(2, "0");
      });
    };
    let countdownTimer: number | undefined;
    if (Number.isFinite(closesAt)) {
      updateCountdown();
      countdownTimer = window.setInterval(updateCountdown, 1000);
    }

    page.setAttribute("data-webinar-enhanced", "");
    if (picker) picker.hidden = false;
    if (detail) detail.hidden = false;
    topicButtons.forEach((button) => {
      button.hidden = false;
    });
    staticTopics.forEach((topic) => {
      topic.hidden = true;
    });
    updateReel(0);
    updateAgenda(0, 0);
    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(page);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    page.addEventListener("click", onClick);
    reel?.addEventListener("focusin", onStoryFocus);
    reduced.addEventListener("change", syncPreference);
    tallEnough.addEventListener("change", syncPreference);
    syncPreference();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      page.removeEventListener("click", onClick);
      reel?.removeEventListener("focusin", onStoryFocus);
      reduced.removeEventListener("change", syncPreference);
      tallEnough.removeEventListener("change", syncPreference);
      window.cancelAnimationFrame(frame);
      window.clearInterval(countdownTimer);
      page.removeAttribute("data-webinar-enhanced");
      page.removeAttribute("data-webinar-motion");
      page.style.removeProperty("--page-progress");
      hero?.removeAttribute("style");
      stories?.style.removeProperty("--story-entry");
      agendaList?.style.removeProperty("--agenda-progress");
      if (activeLink) current(activeLink, null);
      if (picker) picker.hidden = true;
      if (detail) detail.hidden = true;
      topicButtons.forEach((button) => {
        button.hidden = true;
      });
      staticTopics.forEach((topic) => {
        topic.hidden = false;
      });
      cards.forEach((card) => {
        card.inert = false;
        card.removeAttribute("aria-hidden");
      });
    };
  }, []);

  return null;
}
