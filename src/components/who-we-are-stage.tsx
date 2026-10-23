"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountWhoWeAre } from "@/lib/who-we-are-player";
import styles from "./who-we-are.module.css";

export default function WhoWeAreStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? mountWhoWeAre(root.current) : undefined), []);
  return (
    <div ref={root} className={styles.rail} data-who-rail data-mode="static">
      <div className={styles.viewport} data-who-viewport>
        {children}
      </div>
    </div>
  );
}
