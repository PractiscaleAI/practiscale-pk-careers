"use client";

import { useEffect, useState } from "react";
import styles from "./webinar.module.css";

function shiftTime(progress: number) {
  const minutes = Math.min(540, Math.max(0, Math.round(progress * 540)));
  const hour24 = (18 + Math.floor(minutes / 60)) % 24;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes % 60).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
}

export default function WebinarEffects() {
  const [time, setTime] = useState("6:00 PM");
  const [still, setStill] = useState(true);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>("[data-webinar-page]");
    if (!page) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stillQuery = new URLSearchParams(window.location.search).has("still");
    let frame = 0;

    const update = () => {
      frame = 0;
      const motionOff = reducedMotion.matches || stillQuery;
      setStill(motionOff);
      if (motionOff) {
        page.style.setProperty("--night-progress", "0.5");
        return;
      }
      const rect = page.getBoundingClientRect();
      const travel = Math.max(1, page.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      page.style.setProperty("--night-progress", progress.toFixed(4));
      setTime(shiftTime(progress));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    reducedMotion.addEventListener("change", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (still) return null;
  return <span className={styles.clock} aria-hidden="true">PKT / {time}</span>;
}
