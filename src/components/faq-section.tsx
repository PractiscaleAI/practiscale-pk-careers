"use client";

import { useEffect, useRef } from "react";
import { homeFaqs } from "@/lib/content";
import { mountSceneAnchor } from "@/lib/scene-anchor.js";
import styles from "./faq-section.module.css";

const last = homeFaqs.length - 1;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function FaqSection() {
  const root = useRef<HTMLElement>(null);

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
    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-item]"),
    );
    const answers = Array.from(
      section.querySelectorAll<HTMLElement>("[data-faq-answer]"),
    );
    if (
      !introTrack ||
      !introScene ||
      !canvas ||
      !list ||
      items.length !== homeFaqs.length
    )
      return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    let active = -1;
    let enhanced = false;
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

    function activate(index: number) {
      if (index === active) return;
      active = index;
      section!.dataset.active = String(index);
      items.forEach((item, itemIndex) => {
        const selected = itemIndex === index;
        item.dataset.active = String(selected);
        const answer = answers[itemIndex];
        answer.inert = enhanced && !selected;
        if (enhanced && !selected) answer.setAttribute("aria-hidden", "true");
        else answer.removeAttribute("aria-hidden");
      });
    }

    function paint(now: number) {
      paintFrame = 0;
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
      const closingProgress = clamp((introPainted - 0.84) / 0.1);
      const floorClose =
        closingProgress * closingProgress * (3 - 2 * closingProgress);
      section!.style.setProperty("--faq-floor-close", floorClose.toFixed(4));
      section!.style.setProperty(
        "--faq-question-reveal",
        floorClose.toFixed(4),
      );
      sculpture?.render(introPainted, pointerX, pointerY);
      if (introPainted !== introTarget)
        paintFrame = requestAnimationFrame(paint);
    }

    function read() {
      readFrame = 0;
      if (!enhanced) return;
      const introRect = introTrack!.getBoundingClientRect();
      const travel = Math.max(1, introTrack!.offsetHeight - innerHeight);
      introTarget = clamp(-introRect.top / travel);
      if (Math.abs(introTarget - introPainted) > 0.002 && !paintFrame)
        paintFrame = requestAnimationFrame(paint);

      const focusLine = innerHeight * (innerWidth <= 600 ? 0.38 : 0.5);
      let next = 0;
      items.forEach((item, index) => {
        if (item.getBoundingClientRect().top <= focusLine) next = index;
      });
      if (!answers[active]?.contains(document.activeElement)) activate(next);
    }

    function schedule() {
      if (!readFrame) readFrame = requestAnimationFrame(read);
    }

    function setup() {
      enhanced = !reduced.matches;
      section!.dataset.enhanced = String(enhanced);
      answers.forEach((answer, index) => {
        answer.style.height = "auto";
        items[index].style.setProperty(
          "--faq-answer-height",
          `${answer.scrollHeight}px`,
        );
        answer.style.removeProperty("height");
      });
      if (enhanced) {
        active = -1;
        activate(0);
        read();
      } else {
        active = -1;
        items.forEach((item) => (item.dataset.active = "false"));
        answers.forEach((answer) => {
          answer.inert = false;
          answer.removeAttribute("aria-hidden");
        });
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
    section.addEventListener("focusout", schedule, { signal: abort.signal });
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
      data-active="0"
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
            data-active={index === 0}
          >
            <div className={styles.question}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{question}</h3>
            </div>
            <div className={styles.answerBody} data-faq-answer>
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
