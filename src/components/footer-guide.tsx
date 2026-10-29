"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./footer.module.css";

const FooterGuideScene = dynamic(() => import("./footer-guide-scene"), {
  ssr: false,
});

export default function FooterGuide() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleFailure = useCallback(() => setReady(false), []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const syncPreference = () => {
      setMotionAllowed(
        finePointer.matches && !reducedMotion.matches && !connection.connection?.saveData,
      );
    };
    syncPreference();
    reducedMotion.addEventListener("change", syncPreference);
    finePointer.addEventListener("change", syncPreference);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPreference);
      finePointer.removeEventListener("change", syncPreference);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.film} aria-hidden="true">
      <img
        className={`${styles.guidePoster} ${ready ? styles.guidePosterHidden : ""}`}
        src="/media/mascot/practiscale-guide-v2.webp"
        width="1142"
        height="1377"
        alt=""
        loading="lazy"
        decoding="async"
      />
      {near && motionAllowed && (
        <FooterGuideScene onReady={handleReady} onFailure={handleFailure} />
      )}
    </div>
  );
}
