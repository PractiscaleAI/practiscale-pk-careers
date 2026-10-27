"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { mountWhoWeAre } from "@/lib/who-we-are-player";
import styles from "./who-we-are.module.css";

const mobileQuery = "(max-width: 1023px)";
const subscribe = (notify: () => void) => {
  const media = matchMedia(mobileQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
export default function WhoWeAreStage({
  children,
  introduction,
}: {
  children: ReactNode;
  introduction: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mobile = useSyncExternalStore(
    subscribe,
    () => matchMedia(mobileQuery).matches,
    () => false,
  );
  useEffect(
    () => (root.current ? mountWhoWeAre(root.current) : undefined),
    [mobile],
  );
  return (
    <div ref={root} className={styles.rail} data-who-rail data-mode="static">
      {mobile && (
        <div className={styles.mobileIntroduction} data-who-introduction>
          {introduction}
        </div>
      )}
      <div className={styles.viewport} data-who-viewport>
        {!mobile && introduction}
        {children}
      </div>
    </div>
  );
}
