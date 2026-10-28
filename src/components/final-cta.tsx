"use client";
import { useEffect, useRef } from "react";
import { mountSceneAnchor } from "@/lib/scene-anchor.js";
import { mountCtaWaves } from "@/lib/cta-wave";
import { Action, Eyebrow } from "./ui";
import styles from "./final-cta.module.css";

function ArrivalArc() {
  return (
    <div className={styles.arcScene} aria-hidden="true">
      <svg className={styles.arc} viewBox="0 0 1200 410" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id="cta-arrival-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#20bfa8" />
            <stop offset="100%" stopColor="#0d77a9" />
          </linearGradient>
        </defs>
        <path className={styles.arcGuide} d="M-40 390 C245 45 955 45 1240 390" />
        <path className={styles.arcFill} data-cta-arc-fill d="M-40 390 C245 45 955 45 1240 390" />
      </svg>
      <img className={styles.mark} src="/brand/logos/practiscale-mark.png" width="64" height="60" alt="" />
    </div>
  );
}

export default function FinalCTA() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!section.current) return;
    const unanchor = mountSceneAnchor(section.current, {
      hashes: ["#apply", "#apply-heading"],
    });
    const stopArc = mountCtaWaves(section.current);
    return () => {
      stopArc();
      unanchor();
    };
  }, []);
  return (
    <section ref={section} id="apply" className={styles.section} aria-labelledby="apply-heading" data-theme="fog">
      <ArrivalArc />
      <div className={styles.inner}>
        <div className={styles.content}>
          <Eyebrow>Your next chapter</Eyebrow>
          <h2 id="apply-heading" className={styles.heading}>
            <span>Your next <span className={styles.monday}>Monday</span></span>
            <span>could be your first day.</span>
          </h2>
          <p className={styles.body}>
            Send your CV and a 60 second video. If you are the right fit, you start the following Monday.
          </p>
          <div className={styles.actions}>
            <Action href="https://wa.me/923334000600">Apply on WhatsApp</Action>
            <Action href="mailto:hiring@practiscale.com" secondary>Email Your CV</Action>
          </div>
          <p className={styles.call}>Or call <a href="tel:+923334000600">0333 4000 600</a></p>
        </div>
      </div>
    </section>
  );
}
