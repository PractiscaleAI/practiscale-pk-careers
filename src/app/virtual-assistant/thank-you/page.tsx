import type { Metadata } from "next";
import { webinar } from "@/config/webinar";
import { thanks } from "../content";
import FunnelHeader from "../funnel-header";
import styles from "../funnel.module.css";
import CopyLink from "./copy-link";

export const metadata: Metadata = {
  title: { absolute: "You're qualified | PractiScale webinar" },
  robots: { index: false, follow: false },
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

export default function ThankYouPage() {
  const link = webinar.WHATSAPP_GROUP_URL;
  return (
    <>
      <FunnelHeader />
      <main id="main" className={styles.funnelPage}>
        <div className={`${styles.fcard} ${styles.fcardCenter}`} data-thanks>
          <div className={styles.badge} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h1 className={styles.fcardTitle}>{thanks.title}</h1>
          <p className={styles.fcardSub}>{thanks.sub}</p>
          <div className={styles.waList}>
            <h2>{thanks.listTitle}</h2>
            <ul className={styles.ticks}>
              {thanks.list.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          {link ? (
            <>
              <p className={styles.waIntro}>{thanks.buttonIntro}</p>
              <a
                className={styles.wa}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                {thanks.button}
              </a>
              <p className={styles.warn}>{thanks.warn}</p>
              <CopyLink link={link} label={thanks.fallback} />
            </>
          ) : (
            <p className={styles.warn}>
              Our team will send you the WhatsApp community link shortly.
            </p>
          )}
          <p className={styles.closing}>{thanks.closing}</p>
        </div>
      </main>
    </>
  );
}
