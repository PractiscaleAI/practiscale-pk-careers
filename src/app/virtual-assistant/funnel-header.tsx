import Image from "next/image";
import styles from "./funnel.module.css";

/** Logo-only header for the steps after the landing page. */
export default function FunnelHeader() {
  return (
    <header className={styles.top}>
      <div className={`${styles.wrap} ${styles.topCenter}`}>
        <a href="/" aria-label="PractiScale home">
          <Image
            src="/brand/logos/practiscale-logo-reversed.png"
            alt="PractiScale"
            width={363}
            height={67}
            priority
            className={styles.logo}
          />
        </a>
      </div>
    </header>
  );
}
