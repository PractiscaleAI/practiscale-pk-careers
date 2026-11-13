import type { Metadata } from "next";
import { contact, notEligible } from "../content";
import FunnelHeader from "../funnel-header";
import styles from "../funnel.module.css";

export const metadata: Metadata = {
  title: { absolute: "Thank you for your interest | PractiScale webinar" },
  robots: { index: false, follow: false },
};

export default function NotEligiblePage() {
  return (
    <>
      <FunnelHeader />
      <main id="main" className={styles.funnelPage}>
        <div
          className={`${styles.fcard} ${styles.fcardCenter}`}
          data-not-eligible
        >
          <div
            className={`${styles.badge} ${styles.badgeQuiet}`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.01" />
            </svg>
          </div>
          <h1 className={styles.fcardTitle}>{notEligible.title}</h1>
          <p className={styles.fcardSub}>{notEligible.body}</p>
          <a
            className={styles.pill}
            href={contact.siteHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn about PractiScale <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
    </>
  );
}
