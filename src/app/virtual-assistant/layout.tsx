import { sans, serif } from "./fonts";
import styles from "./funnel.module.css";

/** Shared shell for every step of the VA webinar funnel. */
export default function FunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.root} ${serif.variable} ${sans.variable}`}>
      {children}
    </div>
  );
}
