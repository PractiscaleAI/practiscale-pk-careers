"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { mountEarningsLaptop } from "@/lib/earnings-laptop/player.js";
import styles from "./earnings-section.module.css";

export default function EarningsStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () => (ref.current ? mountEarningsLaptop(ref.current) : undefined),
    [],
  );
  return (
    <div ref={ref} className={styles.rail} data-laptop-rail data-mode="static">
      <div className={styles.viewport} data-laptop-viewport>
        {children}
      </div>
    </div>
  );
}
