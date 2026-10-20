"use client";
import { useEffect } from "react";

export default function HeroLayout() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>(".hero-stage");
    const editorial = document.querySelector<HTMLElement>(".hero-editorial");
    const copy = document.querySelector<HTMLElement>(".hero-copy");
    const trust = document.querySelector<HTMLElement>(".hero-trust");
    const scroll = document.querySelector<HTMLElement>(".hero-scroll");
    if (!stage || !editorial || !copy || !trust || !scroll) return;
    let disposed = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (disposed) return;
      const mobile = innerWidth < 768;
      const available = innerHeight - (mobile ? 16 : 28);
      stage.style.setProperty(
        "--hero-copy-bottom",
        `${editorial.offsetTop + copy.offsetHeight}px`,
      );
      const required =
        editorial.offsetTop +
        copy.offsetHeight +
        trust.offsetHeight +
        (mobile ? 336 : 100);
      const flow =
        required > available ||
        (mobile ? innerHeight <= 860 : innerHeight <= 620);
      stage.dataset.layout = flow ? "content" : "viewport";
      stage.style.minHeight =
        flow && !mobile ? `${Math.max(required, 740)}px` : "";
      scroll.style.minHeight = motion.matches
        ? "0px"
        : flow
          ? `${Math.max(required, available) + innerHeight * 0.35}px`
          : "";
    };
    const observer = new ResizeObserver(update);
    observer.observe(copy);
    observer.observe(trust);
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    document.fonts.ready.then(update);
    update();
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", update);
      delete stage.dataset.layout;
      stage.style.minHeight = "";
      stage.style.removeProperty("--hero-copy-bottom");
      scroll.style.minHeight = "";
    };
  }, []);
  return null;
}
