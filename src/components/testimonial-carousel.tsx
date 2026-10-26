"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./testimonials.module.css";

type Controller = { select: (index: number) => void };

export default function TestimonialCarousel({
  children,
  names,
}: {
  children: ReactNode;
  names: string[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const host = root.current!;
    const section = host.closest("section")!;
    const stage = section.querySelector<HTMLElement>(
      "[data-testimonial-stage]",
    )!;
    const viewport = host.querySelector<HTMLElement>(
      "[data-testimonial-viewport]",
    )!;
    const track = host.querySelector<HTMLElement>("[data-testimonial-track]")!;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-testimonial-card]"),
    );
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let step = 1,
      position = 0,
      selected = 0,
      raf = 0;
    let stride = 500,
      overhang = 0,
      scrollEnabled = false,
      inScene = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let viewportWidth = innerWidth,
      viewportHeight = innerHeight;
    const scrollStart = () =>
      section.getBoundingClientRect().top + scrollY + overhang;
    let gesture: {
      id: number;
      x: number;
      y: number;
      origin: number;
      lastX: number;
      time: number;
      velocity: number;
      dragging: boolean;
    } | null = null;
    const clamp = (n: number) => Math.max(0, Math.min(cards.length - 1, n));

    function paint() {
      track.style.transform = `translate3d(${-position}px,0,0)`;
      cards.forEach((card, i) => {
        const distance = Math.min(1, Math.abs(position / step - i));
        // Recede the surface and ornament, preserving text/badge contrast.
        card.style.setProperty("--presence", String(1 - distance));
        card.style.setProperty(
          "--motif-shift",
          `${(position / step - i) * 14}px`,
        );
      });
    }
    function mark(index: number) {
      selected = clamp(index);
      host.dataset.active = String(selected);
      cards.forEach((card, i) =>
        card.setAttribute("aria-hidden", String(i !== selected)),
      );
      setActive(selected);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    function select(index: number, fromScroll = false) {
      stop();
      mark(index);
      if (scrollEnabled && !fromScroll) {
        window.scrollTo({
          top: scrollStart() + selected * stride,
          behavior: "instant",
        });
      }
      const start = position,
        end = selected * step,
        startTime = performance.now();
      if (reduce.matches || document.hidden || Math.abs(end - start) < 0.5) {
        position = end;
        paint();
        return;
      }
      const duration = Math.min(620, 380 + Math.abs(end - start) * 0.24);
      function tick(now: number) {
        const t = Math.min(1, (now - startTime) / duration);
        position = start + (end - start) * (1 - (1 - t) ** 4);
        paint();
        if (t < 1) raf = requestAnimationFrame(tick);
        else raf = 0;
      }
      raf = requestAnimationFrame(tick);
    }
    function measure() {
      stop();
      gesture = null;
      delete host.dataset.dragging;
      step =
        cards[0].getBoundingClientRect().width +
        parseFloat(getComputedStyle(track).gap);
      position = selected * step;
      paint();
      const height = stage.offsetHeight;
      overhang = Math.max(0, height - innerHeight);
      stride = Math.max(420, innerHeight * 0.7);
      scrollEnabled = !reduce.matches && host.offsetHeight <= innerHeight - 24;
      section.dataset.scrollTestimonials = String(scrollEnabled);
      section.style.setProperty("--testimonial-pin-top", `${-overhang}px`);
      section.style.height = scrollEnabled
        ? `${height + stride * (cards.length - 0.5)}px`
        : "";
    }
    function onScroll() {
      // Browser scroll anchoring can fire before its resize event. Preserve the
      // last reading state rather than interpreting that reflow as user input.
      if (viewportWidth !== innerWidth || viewportHeight !== innerHeight) {
        resize();
        return;
      }
      if (!scrollEnabled || gesture?.dragging || resizeTimer !== undefined)
        return;
      const distance = scrollY - scrollStart();
      inScene =
        distance >= -overhang && distance <= stride * (cards.length - 0.5);
      const index = clamp(Math.floor(distance / stride + 0.25));
      if (index !== selected) select(index, true);
    }
    function resize() {
      viewportWidth = innerWidth;
      viewportHeight = innerHeight;
      const preserve = inScene;
      const retained = selected;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = undefined;
        measure();
        if (preserve && scrollEnabled) select(retained);
        else onScroll();
      }, 400);
    }
    function down(event: PointerEvent) {
      if (
        !event.isPrimary ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      stop();
      gesture = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        origin: position,
        lastX: event.clientX,
        time: performance.now(),
        velocity: 0,
        dragging: false,
      };
      viewport.setPointerCapture(event.pointerId);
    }
    function move(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x,
        dy = event.clientY - gesture.y;
      if (
        !gesture.dragging &&
        Math.abs(dx) > 6 &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        gesture.dragging = true;
        host.dataset.dragging = "true";
      }
      if (!gesture.dragging) return;
      const now = performance.now();
      const velocity =
        (event.clientX - gesture.lastX) / Math.max(1, now - gesture.time);
      gesture.velocity = gesture.velocity * 0.35 + velocity * 0.65;
      gesture.lastX = event.clientX;
      gesture.time = now;
      const raw = gesture.origin - dx,
        max = (cards.length - 1) * step;
      // Bounded resistance at either end, with no cloned/duplicate testimonials.
      position =
        raw < 0
          ? -Math.min(65, -raw * 0.18)
          : raw > max
            ? max + Math.min(65, (raw - max) * 0.18)
            : raw;
      paint();
    }
    function finish(event: PointerEvent) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const ended = gesture;
      gesture = null;
      delete host.dataset.dragging;
      if (viewport.hasPointerCapture(event.pointerId))
        viewport.releasePointerCapture(event.pointerId);
      // A vertical touch belongs to the page, not to the drag-to-select path.
      if (!ended.dragging) {
        onScroll();
        return;
      }
      const velocity =
        event.type === "pointercancel" || performance.now() - ended.time > 100
          ? 0
          : ended.velocity;
      let next = clamp(Math.round((position - velocity * 160) / step));
      const moved = position - ended.origin;
      if (
        ended.dragging &&
        next === selected &&
        Math.abs(moved) > Math.min(80, step * 0.18)
      )
        next = clamp(selected + Math.sign(moved));
      select(next);
    }
    const visibility = () => {
      if (document.hidden) {
        gesture = null;
        delete host.dataset.dragging;
        select(selected, true);
      }
    };
    const preferences = () => {
      measure();
      select(selected, true);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(cards[0]);
    observer.observe(stage);
    measure();
    viewport.scrollLeft = 0;
    host.dataset.enhanced = "true";
    mark(0);
    onScroll();
    controller.current = { select };
    viewport.addEventListener("pointerdown", down);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", finish);
    viewport.addEventListener("pointercancel", finish);
    viewport.addEventListener("lostpointercapture", finish);
    document.addEventListener("visibilitychange", visibility);
    reduce.addEventListener("change", preferences);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      stop();
      clearTimeout(resizeTimer);
      observer.disconnect();
      controller.current = null;
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", finish);
      viewport.removeEventListener("pointercancel", finish);
      viewport.removeEventListener("lostpointercapture", finish);
      document.removeEventListener("visibilitychange", visibility);
      reduce.removeEventListener("change", preferences);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      delete section.dataset.scrollTestimonials;
      section.style.removeProperty("height");
      section.style.removeProperty("--testimonial-pin-top");
      delete host.dataset.enhanced;
      delete host.dataset.dragging;
      track.style.removeProperty("transform");
      cards.forEach((card) => {
        card.removeAttribute("aria-hidden");
        card.style.removeProperty("opacity");
        card.style.removeProperty("--presence");
        card.style.removeProperty("--motif-shift");
      });
    };
  }, []);

  return (
    <div
      ref={root}
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Team testimonials"
    >
      <p id="testimonial-instructions" className="sr-only">
        Scroll to advance through the testimonials, or drag and swipe. Choose a
        person with the four buttons below, or focus the cards and use Left,
        Right, Home and End keys.
      </p>
      <div
        id="testimonial-viewport"
        className={styles.viewport}
        data-testimonial-viewport
        tabIndex={0}
        aria-label="Testimonial cards"
        aria-describedby="testimonial-instructions"
        onKeyDown={(event) => {
          const index =
            event.key === "ArrowRight"
              ? active + 1
              : event.key === "ArrowLeft"
                ? active - 1
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? names.length - 1
                    : null;
          if (index === null || !controller.current) return;
          event.preventDefault();
          controller.current.select(index);
        }}
      >
        <div className={styles.track} data-testimonial-track>
          {children}
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.pagination} aria-label="Choose a testimonial">
          {names.map((name, i) => (
            <button
              key={name}
              type="button"
              aria-label={`Show testimonial from ${name}`}
              aria-controls="testimonial-viewport"
              aria-current={active === i ? "true" : undefined}
              onClick={() => controller.current?.select(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <span className={styles.hint} aria-hidden="true">
          <span className={styles.scrollHint}>
            Scroll to hear from the team
          </span>
          <span className={styles.mouseHint}>Drag to explore</span>
          <span className={styles.touchHint}>Swipe to explore</span>
        </span>
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {names[active]}, testimonial {active + 1} of {names.length}.
      </p>
    </div>
  );
}
