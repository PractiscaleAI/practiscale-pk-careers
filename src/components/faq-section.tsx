"use client";

import { useEffect, useRef, useState } from "react";
import { homeFaqs } from "@/lib/content";
import { mountSceneAnchor } from "@/lib/scene-anchor.js";
import styles from "./faq-section.module.css";

const last = homeFaqs.length - 1;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function FaqSection() {
  const root = useRef<HTMLElement>(null);
  const [interactive, setInteractive] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;

    const introTrack = section.querySelector<HTMLElement>(
      "[data-faq-intro-track]",
    );
    const introScene = section.querySelector<HTMLElement>(
      "[data-faq-intro-scene]",
    );
    const canvas =
      section.querySelector<HTMLCanvasElement>("[data-faq-canvas]");
    const list = section.querySelector<HTMLElement>("[data-faq-list]");
    const heading = introTrack?.querySelector<HTMLElement>("h2");
    const firstQuestion =
      list?.querySelector<HTMLElement>("[data-faq-item] h3");
    const answers = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-answer]"),
    );
    if (
      !introTrack ||
      !introScene ||
      !canvas ||
      !list ||
      !heading ||
      !firstQuestion ||
      answers.length !== homeFaqs.length
    )
      return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    let motion = false;
    let readFrame = 0;
    let paintFrame = 0;
    let introTarget = 0;
    let introPainted = 0;
    let lastPaint = 0;
    let pointerX = 0;
    let pointerY = 0;
    let sculptureRequested = false;
    let sculpture: {
      render: (progress: number, x?: number, y?: number) => void;
      resize: () => void;
      destroy: () => void;
    } | null = null;

    function paint(now: number) {
      paintFrame = 0;
      // Scroll moves the list immediately, while the sculpture and text ease
      // toward it. Hide the title if a fast fling brings the first question
      // close before the normal title fade has caught up.
      const titleClearance =
        firstQuestion!.getBoundingClientRect().top -
        heading!.getBoundingClientRect().bottom;
      const geometryProgress = clamp((120 - titleClearance) / 56);
      const geometryExit =
        geometryProgress * geometryProgress * (3 - 2 * geometryProgress);
      section!.style.setProperty(
        "--faq-geometric-exit",
        geometryExit.toFixed(4),
      );
      const elapsed = lastPaint ? Math.min(64, now - lastPaint) : 16;
      lastPaint = now;
      introPainted +=
        (introTarget - introPainted) * (1 - Math.exp(-elapsed / 145));
      if (Math.abs(introTarget - introPainted) < 0.002)
        introPainted = introTarget;
      section!.style.setProperty(
        "--faq-intro-progress",
        introPainted.toFixed(4),
      );
      const closingProgress = clamp((introPainted - 0.61) / 0.07);
      const floorClose =
        closingProgress * closingProgress * (3 - 2 * closingProgress);
      const headingProgress = clamp((introPainted - 0.78) / 0.14);
      const headingExit =
        headingProgress * headingProgress * (3 - 2 * headingProgress);
      section!.style.setProperty("--faq-heading-exit", headingExit.toFixed(4));
      const answerProgress = clamp((introPainted - 0.61) / 0.07);
      const answerReveal =
        answerProgress * answerProgress * (3 - 2 * answerProgress);
      section!.style.setProperty("--faq-floor-close", floorClose.toFixed(4));
      section!.style.setProperty("--faq-scene-exit", floorClose.toFixed(4));
      section!.style.setProperty(
        "--faq-question-reveal",
        answerReveal.toFixed(4),
      );
      const handoffProgress = clamp((introPainted - 0.86) / 0.13);
      const handoffRise =
        handoffProgress * handoffProgress * (3 - 2 * handoffProgress);
      section!.style.setProperty("--faq-handoff-rise", handoffRise.toFixed(4));
      // Keep answer links out of keyboard navigation until the first row is
      // visibly readable. Restore them as soon as the handoff completes.
      list!.inert = motion && answerReveal < 0.25;
      sculpture?.render(introPainted, pointerX, pointerY);
      if (introPainted !== introTarget)
        paintFrame = requestAnimationFrame(paint);
    }

    function read() {
      readFrame = 0;
      if (!motion) return;
      const introRect = introTrack!.getBoundingClientRect();
      const travel = Math.max(1, introTrack!.offsetHeight - innerHeight);
      introTarget = clamp(-introRect.top / travel);
      if (Math.abs(introTarget - introPainted) > 0.002 && !paintFrame)
        paintFrame = requestAnimationFrame(paint);
    }

    function schedule() {
      if (!readFrame) readFrame = requestAnimationFrame(read);
    }

    function setup() {
      motion = !reduced.matches;
      section!.dataset.motion = String(motion);
      list!.inert = motion && introPainted < 0.63;
      answers.forEach((answer, index) => {
        answer.style.height = "auto";
        answer.parentElement?.style.setProperty(
          "--faq-answer-height",
          `${answer.scrollHeight}px`,
        );
        answer.style.removeProperty("height");
      });
      if (motion) {
        read();
        if (!paintFrame) paintFrame = requestAnimationFrame(paint);
      } else {
        if (paintFrame) cancelAnimationFrame(paintFrame);
        paintFrame = 0;
        introTarget = 0;
        introPainted = 0;
        lastPaint = 0;
        section!.style.setProperty("--faq-intro-progress", "0");
      }
      sculpture?.resize();
      sculpture?.render(introPainted, pointerX, pointerY);
    }

    window.addEventListener("scroll", schedule, {
      passive: true,
      signal: abort.signal,
    });
    window.addEventListener("resize", setup, { signal: abort.signal });
    window.visualViewport?.addEventListener("resize", setup, {
      signal: abort.signal,
    });
    reduced.addEventListener("change", setup, { signal: abort.signal });
    introScene.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch" || reduced.matches) return;
        const rect = introScene!.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        sculpture?.render(introPainted, pointerX, pointerY);
      },
      { passive: true, signal: abort.signal },
    );
    introScene.addEventListener(
      "pointerleave",
      () => {
        pointerX = 0;
        pointerY = 0;
        sculpture?.render(introPainted);
      },
      { signal: abort.signal },
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !entries[0]?.isIntersecting ||
          sculptureRequested ||
          reduced.matches
        )
          return;
        sculptureRequested = true;
        import("@/lib/faq-sculpture").then(({ mountFaqSculpture }) => {
          if (abort.signal.aborted) return;
          try {
            sculpture = mountFaqSculpture(canvas!);
            introScene!.dataset.ready = "true";
            sculpture.render(introPainted, pointerX, pointerY);
          } catch {
            // The static sculpture remains available without WebGL.
          }
        });
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(introTrack);

    setup();
    setInteractive(true);
    document.fonts.ready.then(() => {
      if (!abort.signal.aborted) setup();
    });
    const unanchor = mountSceneAnchor(section, { hashes: ["#questions"] });

    return () => {
      abort.abort();
      observer.disconnect();
      unanchor();
      sculpture?.destroy();
      if (readFrame) cancelAnimationFrame(readFrame);
      if (paintFrame) cancelAnimationFrame(paintFrame);
    };
  }, []);

  return (
    <section
      id="questions"
      ref={root}
      className={styles.section}
      aria-labelledby="questions-heading"
      data-theme="fog"
      data-active={active ?? -1}
      data-enhanced={interactive}
    >
      <div className={styles.introTrack} data-faq-intro-track>
        <div className={styles.introStage}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>Frequently asked questions</p>
            <h2 id="questions-heading">Questions candidates ask us</h2>
          </div>
          <div
            className={styles.introScene}
            data-faq-intro-scene
            aria-hidden="true"
          >
            <div className={styles.sculptureFallback}>
              <span>?</span>
              <i />
            </div>
            <canvas className={styles.sculptureCanvas} data-faq-canvas />
          </div>
        </div>
      </div>

      <div className={styles.answers} data-faq-list>
        {homeFaqs.map(([question, answer], index) => (
          <article
            key={question}
            className={styles.item}
            data-faq-item
            data-active={active === index}
            onPointerMove={(event) => {
              if (event.pointerType !== "mouse" || !interactive) return;
              const focusedAnswer = root.current?.querySelector<HTMLElement>(
                `[data-faq-item][data-active="true"] [data-faq-answer]`,
              );
              if (focusedAnswer?.contains(document.activeElement)) return;
              setActive(index);
            }}
          >
            <div className={styles.question}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>
                <button
                  type="button"
                  className={styles.questionButton}
                  data-faq-trigger
                  disabled={!interactive}
                  aria-expanded={!interactive || active === index}
                  aria-controls={`faq-answer-${index + 1}`}
                  onClick={(event) => {
                    if (
                      event.nativeEvent instanceof PointerEvent &&
                      event.nativeEvent.pointerType === "mouse"
                    ) {
                      setActive(index);
                      return;
                    }
                    setActive((current) => (current === index ? null : index));
                  }}
                >
                  <span>{question}</span>
                </button>
              </h3>
            </div>
            <div
              id={`faq-answer-${index + 1}`}
              className={styles.answerBody}
              data-faq-answer
              inert={interactive && active !== index}
              aria-hidden={interactive && active !== index ? true : undefined}
            >
              <p>
                {index === 0 ? (
                  <>
                    Yes. Our head office is on Imran Khan Ave, Chaklala Scheme
                    3, Rawalpindi. 100+ people work here, serving 500+
                    healthcare businesses in the US. You can see our client work
                    at <a href="https://practiscale.com">practiscale.com</a>.
                  </>
                ) : index === last ? (
                  <>
                    <a href="/jobs">
                      Choose an open role and apply
                    </a>{" "}
                    or email your CV to{" "}
                    <a href="mailto:hiring@practiscale.com">
                      hiring@practiscale.com
                    </a>
                    .
                  </>
                ) : (
                  answer
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
