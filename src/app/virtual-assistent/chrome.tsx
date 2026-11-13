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

/**
 * "Registration closes in 2 days, 14 hours" as a line of text. Shows the
 * fallback until a closing time is configured.
 */
export function ClosesIn({ target, fallback }: { target?: string; fallback: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [target]);

  let text = fallback;
  if (target) {
    if (now === null) text = "Registration closes soon";
    else {
      const mins = Math.max(0, Math.floor((new Date(target).getTime() - now) / 60000));
      const d = Math.floor(mins / 1440);
      const h = Math.floor((mins % 1440) / 60);
      const m = mins % 60;
      const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
      text =
        mins === 0
          ? "Registration has closed"
          : `Registration closes in ${d > 0 ? `${unit(d, "day")}, ${unit(h, "hour")}` : `${unit(h, "hour")}, ${unit(m, "minute")}`}`;
    }
  }
  return <p className={styles.passNote}>{text}</p>;
}
