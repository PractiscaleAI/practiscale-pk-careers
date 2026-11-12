"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { nav } from "./content";
import { onFrame, scrollToHash } from "./va-motion";
import styles from "./webinar.module.css";

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute("href");
  if (!hash?.startsWith("#")) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

/** In-page link that glides to its section instead of jumping. */
export function JumpLink(props: React.ComponentProps<"a">) {
  return <a {...props} onClick={(e) => go(e)} />;
}

export function Header({ cta }: { cta: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const links = [...ref.current!.querySelectorAll<HTMLAnchorElement>("[data-chapter]")];
    const sections = links.map((a) => document.querySelector<HTMLElement>(a.hash));
    const hero = document.querySelector<HTMLElement>("[data-va-hero]");
    let lastSolid: boolean | null = null;
    let lastActive = -2;
    return onFrame(() => {
      const header = ref.current;
      if (!header) return;
      const solid = (hero?.getBoundingClientRect().bottom ?? 0) < 90;
      if (solid !== lastSolid) {
        lastSolid = solid;
        header.dataset.solid = String(solid);
      }
      const mid = window.innerHeight * 0.4;
      let active = -1;
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top <= mid) active = i;
      });
      if (active !== lastActive) {
        lastActive = active;
        links.forEach((a, i) => {
          if (i === active) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} className={styles.header} data-open={open}>
      <div className={styles.headerBar}>
        <a href="/" className={styles.brand} aria-label="PractiScale home">
          <Image
            src="/brand/logos/practiscale-logo-reversed.png"
            alt="PractiScale"
            width={272}
            height={86}
            preload
          />
        </a>
        <nav aria-label="Webinar sections" className={styles.nav}>
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} data-chapter>
              {item.label}
            </a>
          ))}
          <a href="#reserve" onClick={(e) => go(e)} className={styles.navCta}>
            {cta}
          </a>
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="va-menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div id="va-menu" className={styles.menu} inert={!open}>
        {[...nav, { label: "Register", href: "#reserve" }].map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))}>
            <span>0{i + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

/** Adds `data-in` to every `[data-reveal]` the first time it is seen. */
export function Reveals() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

/** Ticking countdown; shows dashes until a target is configured. */
export function Countdown({ target, label }: { target?: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const ms = target && now !== null ? Math.max(0, new Date(target).getTime() - now) : null;
  const s = ms === null ? null : Math.floor(ms / 1000);
  const units: [string, number | null][] = [
    ["Days", s === null ? null : Math.floor(s / 86400)],
    ["Hrs", s === null ? null : Math.floor((s % 86400) / 3600)],
    ["Min", s === null ? null : Math.floor((s % 3600) / 60)],
    ["Sec", s === null ? null : s % 60],
  ];
  const [d, h, m] = units.map(([, v]) => v);

  return (
    <div className={styles.countdown}>
      <p className={styles.label}>{label}</p>
      <div
        className={styles.countdownUnits}
        role="timer"
        aria-label={
          s === null
            ? "Countdown starts once the webinar date is confirmed"
            : `${d} days, ${h} hours, ${m} minutes until registration closes`
        }
      >
        {units.map(([unit, v]) => (
          <div key={unit} className={styles.brackets}>
            <span>{v === null ? "--" : String(v).padStart(2, "0")}</span>
            <small>{unit}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
