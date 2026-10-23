"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountProofBand } from "@/lib/proof-world/player";
import styles from "./proof-band.module.css";

export default function ProofBandStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? mountProofBand(ref.current) : undefined), []);
  return (
    <div ref={ref} className={styles.rail} data-proof-world data-mode="static">
      <div className={styles.viewport} data-proof-viewport>
        {children}
      </div>
    </div>
  );
}
