"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./funnel.module.css";

type Left = { d: number; h: number; m: number; s: number } | null;

/** Time left until `target`, ticking every second. null before hydration. */
function useTimeLeft(target: string): Left {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (now === null) return null;
  const total = Math.max(
    0,
    Math.floor((new Date(target).getTime() - now) / 1000),
  );
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({
  target,
  dark = false,
}: {
  target: string;
  dark?: boolean;
}) {
  const left = useTimeLeft(target);
  const units: [string, number | undefined][] = [
    ["Days", left?.d],
    ["Hours", left?.h],
    ["Mins", left?.m],
    ["Secs", left?.s],
  ];
  return (
    <div
      className={`${styles.count} ${dark ? styles.countDark : ""}`}
      role="timer"
      aria-label={
        left
          ? `${left.d} days, ${left.h} hours and ${left.m} minutes left to register`
          : "Registration countdown"
      }
    >
      {units.map(([unit, v]) => (
        <div key={unit} aria-hidden="true">
          <b>{v === undefined ? "--" : pad(v)}</b>
          <small>{unit}</small>
        </div>
      ))}
    </div>
  );
}

/** "02d 14h 05m" for the header and the sticky phone bar. */
export function ShortCountdown({ target }: { target: string }) {
  const left = useTimeLeft(target);
  return (
    <b className={styles.shortCount}>
      {left ? `${pad(left.d)}d ${pad(left.h)}h ${pad(left.m)}m` : "--"}
    </b>
  );
}

/**
 * Phone-only bar with the action, shown once the hero has scrolled away and
 * hidden again near the final call to action.
 */
export function StickyBar({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const final = document.getElementById("final");
    if (!hero) return;
    let heroGone = false;
    let finalIn = false;
    const update = () => setOn(heroGone && !finalIn);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero)
          heroGone = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === final) finalIn = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    if (final) io.observe(final);
    return () => io.disconnect();
  }, []);
  return (
    <div className={styles.stick} data-on={on} data-sticky-bar inert={!on}>
      {children}
    </div>
  );
}
