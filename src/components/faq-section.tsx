"use client";

import { useEffect, useRef } from "react";
import { homeFaqs } from "@/lib/content";
import { mountSceneAnchor } from "@/lib/scene-anchor.js";
import styles from "./faq-section.module.css";

const topics = [
  "Our company",
  "Experience",
  "Work mode",
  "Your team",
  "Earnings",
  "VA program",
  "Applying",
];

const last = homeFaqs.length - 1;
const mobilePoint = (step: number) => {
  const ratio = step / last;
  return {
    x: Number((24 + ratio * 512).toFixed(3)),
    y: Number((78 - 36 * Math.sin(Math.PI * ratio)).toFixed(3)),
  };
};

function orbitPoint(step: number) {
  const angle = ((-72 + (step / last) * 144) * Math.PI) / 180;
  return {
    x: Number((20 + Math.cos(angle) * 250).toFixed(3)),
    y: Number((280 + Math.sin(angle) * 250).toFixed(3)),
  };
}

function progressArc(step: number) {
  const segments = Math.max(1, Math.ceil(step * 8));
  return Array.from({ length: segments + 1 }, (_, index) => {
    const point = orbitPoint((step * index) / segments);
    return `${index === 0 ? "M" : "L"}${point.x} ${point.y}`;
  }).join(" ");
}
function mobileArc(step: number) {
  const segments = Math.max(1, Math.ceil(step * 8));
  return Array.from({ length: segments + 1 }, (_, index) => {
    const point = mobilePoint((step * index) / segments);
    return `${index === 0 ? "M" : "L"}${point.x} ${point.y}`;
  }).join(" ");
}

export default function FaqSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current!;
    const marker =
      section.querySelector<SVGCircleElement>("[data-faq-marker]")!;
    const progress = section.querySelector<SVGPathElement>(
      "[data-faq-progress]",
    )!;
    const mobileMarker = section.querySelector<SVGCircleElement>(
      "[data-faq-mobile-marker]",
    )!;
    const mobileProgress = section.querySelector<SVGPathElement>(
      "[data-faq-mobile-progress]",
    )!;
    const panels = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-panel]"),
    );
    const buttons = Array.from(
      section.querySelectorAll<HTMLButtonElement>("[data-faq-select]"),
    );
    const select =
      section.querySelector<HTMLSelectElement>("[data-faq-choice]")!;
    const previous = section.querySelector<HTMLButtonElement>(
      "[data-faq-previous]",
    )!;
    const next = section.querySelector<HTMLButtonElement>("[data-faq-next]")!;
    const viewAll = section.querySelector<HTMLButtonElement>("[data-faq-all]")!;
    const hint = section.querySelector<HTMLElement>("[data-faq-hint]")!;
    const visual = section.querySelector<HTMLElement>("[data-faq-visual]")!;
    const heading = section.querySelector<HTMLElement>("[data-faq-heading]")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    let enhanced = false;
    let showAll = false;
    let target = 0;
    let current = 0;
    let active = -1;
    let frame = 0;
    let lastTime = 0;

    function setActive(index: number) {
      if (active === index) return;
      active = index;
      section.dataset.active = String(index);
      select.value = String(index);
      previous.disabled = index === 0;
      next.disabled = index === last;
      hint.textContent =
        index === last
          ? "Last question · continue scrolling"
          : "Scroll or choose a question";
      panels.forEach((panel, i) => {
        const selected = i === index;
        panel.dataset.active = String(selected);
        panel.inert = enhanced && !selected;
        if (enhanced && !selected) panel.setAttribute("aria-hidden", "true");
        else panel.removeAttribute("aria-hidden");
      });
      buttons.forEach((button, i) => {
        const selected = i === index;
        button.dataset.active = String(selected);
        if (selected) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
    }

    function paint(now: number) {
      frame = 0;
      const elapsed = lastTime ? Math.min(64, now - lastTime) : 16;
      lastTime = now;
      current += (target - current) * (1 - Math.exp(-elapsed / 90));
      if (Math.abs(target - current) < 0.004) current = target;
      const point = orbitPoint(current);
      progress.setAttribute("d", progressArc(current));
      marker.setAttribute("cx", String(point.x));
      marker.setAttribute("cy", String(point.y));
      const smallPoint = mobilePoint(current);
      mobileProgress.setAttribute("d", mobileArc(current));
      mobileMarker.setAttribute("cx", String(smallPoint.x));
      mobileMarker.setAttribute("cy", String(smallPoint.y));
      if (current !== target) frame = requestAnimationFrame(paint);
    }

    function read() {
      if (!enhanced) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const travel = Math.max(1, section.offsetHeight - innerHeight - 180);
      target = Math.max(0, Math.min(last, (-rect.top / travel) * last));
      if (!panels[active]?.contains(document.activeElement)) {
        const candidate = Math.round(target);
        if (
          Math.abs(target - active) > 0.55 ||
          candidate === 0 ||
          candidate === last
        )
          setActive(candidate);
      }
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function setup() {
      const compact = innerWidth <= 900;
      const ringSize = Math.min(
        520,
        visual.clientWidth - 150,
        innerHeight - heading.offsetHeight - 100,
      );
      section.style.setProperty(
        "--faq-ring-size",
        `${Math.max(0, ringSize)}px`,
      );
      const longest = Math.max(...panels.map((panel) => panel.scrollHeight));
      enhanced =
        !showAll &&
        !reduced.matches &&
        (compact
          ? innerWidth >= 350 &&
            innerHeight >= 720 &&
            longest + 120 <= innerHeight * 0.68
          : innerHeight >= 700 &&
            ringSize >= 380 &&
            longest + 150 <= innerHeight);
      section.dataset.enhanced = String(enhanced);
      section.dataset.mode = showAll ? "all" : enhanced ? "guided" : "flow";
      if (enhanced)
        section.style.setProperty(
          "--faq-travel",
          `${last * Math.max(270, Math.min(360, innerHeight * (compact ? 0.37 : 0.42))) + 180}px`,
        );
      else section.style.removeProperty("--faq-travel");
      if (!enhanced) {
        panels.forEach((panel) => {
          panel.removeAttribute("aria-hidden");
          panel.inert = false;
        });
        return;
      }
      read();
    }

    window.addEventListener("scroll", read, {
      passive: true,
      signal: abort.signal,
    });
    window.addEventListener("resize", setup, {
      passive: true,
      signal: abort.signal,
    });
    window.visualViewport?.addEventListener("resize", setup, {
      passive: true,
      signal: abort.signal,
    });
    reduced.addEventListener("change", setup, { signal: abort.signal });
    buttons.forEach((button, index) =>
      button.addEventListener(
        "click",
        () => {
          if (!enhanced) return;
          const travel = section.offsetHeight - innerHeight - 180;
          const start = window.scrollY + section.getBoundingClientRect().top;
          window.scrollTo({
            top: start + (travel * index) / last,
            behavior: "instant",
          });
          target = current = index;
          setActive(index);
          if (!frame) frame = requestAnimationFrame(paint);
          read();
        },
        { signal: abort.signal },
      ),
    );
    const jump = (index: number) => {
      if (!enhanced) return;
      const travel = section.offsetHeight - innerHeight - 180;
      window.scrollTo({
        top:
          scrollY +
          section.getBoundingClientRect().top +
          (travel * index) / last,
        behavior: "instant",
      });
      target = current = index;
      setActive(index);
      if (!frame) frame = requestAnimationFrame(paint);
    };
    select.addEventListener("change", () => jump(Number(select.value)), {
      signal: abort.signal,
    });
    previous.addEventListener("click", () => jump(Math.max(0, active - 1)), {
      signal: abort.signal,
    });
    next.addEventListener("click", () => jump(Math.min(last, active + 1)), {
      signal: abort.signal,
    });
    viewAll.addEventListener(
      "click",
      () => {
        const start = scrollY + section.getBoundingClientRect().top;
        showAll = true;
        setup();
        viewAll.hidden = true;
        window.scrollTo({ top: start, behavior: "instant" });
      },
      { signal: abort.signal },
    );
    section.addEventListener("focusout", () => requestAnimationFrame(read), {
      signal: abort.signal,
    });
    setup();
    document.fonts.ready.then(() => {
      if (!abort.signal.aborted) setup();
    });
    const unanchor = mountSceneAnchor(section, { hashes: ["#questions"] });
    return () => {
      abort.abort();
      unanchor();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="questions"
      ref={root}
      className={styles.section}
      aria-labelledby="questions-heading"
      data-theme="fog"
      data-active="0"
    >
      <div className={styles.stage}>
        <a className={styles.skip} href="#questions-end">
          Skip questions
        </a>
        <div className={styles.visual} data-faq-visual>
          <header className={styles.heading} data-faq-heading>
            <p className={styles.eyebrow}>FAQ</p>
            <h2 id="questions-heading">Questions candidates ask us</h2>
          </header>
          <div className={styles.orbit}>
            <svg
              className={styles.desktopRing}
              viewBox="0 0 560 560"
              aria-hidden="true"
              focusable="false"
            >
              <circle className={styles.innerRing} cx="20" cy="280" r="204" />
              <circle className={styles.outerRing} cx="20" cy="280" r="250" />
              <circle className={styles.edgeRing} cx="20" cy="280" r="298" />
              <path
                data-faq-progress
                className={styles.progressRing}
                d={progressArc(0)}
              />
              {homeFaqs.map((_, index) => {
                const { x, y } = orbitPoint(index);
                return (
                  <circle
                    key={index}
                    className={styles.station}
                    cx={x}
                    cy={y}
                    r="4"
                  />
                );
              })}
              <circle
                data-faq-marker
                className={styles.marker}
                cx={orbitPoint(0).x}
                cy={orbitPoint(0).y}
                r="13"
              />
            </svg>
            <svg
              className={styles.mobileArc}
              viewBox="0 0 560 120"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path className={styles.outerRing} d={mobileArc(last)} />
              <path
                data-faq-mobile-progress
                className={styles.progressRing}
                d={mobileArc(0)}
              />
              {homeFaqs.map((_, index) => (
                <circle
                  key={index}
                  className={styles.station}
                  cx={mobilePoint(index).x}
                  cy={mobilePoint(index).y}
                  r="4"
                />
              ))}
              <circle
                data-faq-mobile-marker
                className={styles.marker}
                cx={mobilePoint(0).x}
                cy={mobilePoint(0).y}
                r="10"
              />
            </svg>
            <div className={styles.topicButtons}>
              {homeFaqs.map(([question], index) => {
                const { x, y } = orbitPoint(index);
                return (
                  <button
                    key={question}
                    type="button"
                    data-faq-select
                    data-active={index === 0}
                    aria-label={`${topics[index]}: ${question}`}
                    aria-current={index === 0 ? "step" : undefined}
                    style={{
                      left: `${(x / 560) * 100}%`,
                      top: `${(y / 560) * 100}%`,
                    }}
                  >
                    {topics[index]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.answerWindow}>
          <div className={styles.answers}>
            {homeFaqs.map(([question, answer], index) => (
              <article
                key={question}
                className={styles.answerCard}
                data-faq-panel
                data-active={index === 0}
              >
                <p className={styles.count}>
                  Question {index + 1} of {homeFaqs.length}
                </p>
                <h3>{question}</h3>
                <p className={styles.answer}>
                  {index === 0 ? (
                    <>
                      Yes. Our head office is on Imran Khan Ave, Chaklala Scheme
                      3, Rawalpindi. 100+ people work here, serving 500+
                      healthcare businesses in the US. You can see our client
                      work at{" "}
                      <a href="https://practiscale.com">practiscale.com</a>.
                    </>
                  ) : index === last ? (
                    <>
                      Apply on WhatsApp at{" "}
                      <a href="https://wa.me/923334000600">0333 4000 600</a> or
                      email your CV to{" "}
                      <a href="mailto:hiring@practiscale.com">
                        hiring@practiscale.com
                      </a>
                      .
                    </>
                  ) : (
                    answer
                  )}
                </p>
              </article>
            ))}
          </div>
          <div className={styles.controls}>
            <p className={styles.hint} data-faq-hint>
              Scroll or choose a question
            </p>
            <label className={styles.choiceLabel}>
              Choose a question
              <select data-faq-choice defaultValue="0">
                {homeFaqs.map(([question], index) => (
                  <option key={question} value={index}>
                    {question}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.navigation}>
              <button type="button" data-faq-previous disabled>
                Previous
              </button>
              <button type="button" data-faq-next>
                Next
              </button>
            </div>
            <button className={styles.viewAll} type="button" data-faq-all>
              View all questions
            </button>
          </div>
        </div>
      </div>
      <span id="questions-end" className={styles.end} aria-hidden="true" />
    </section>
  );
}
