import { Eyebrow } from "@/components/ui";
import EarningsStage from "@/components/earnings-stage";
import { earningsRecords, earningsTotal } from "@/lib/earnings-content";
import { proofMetrics } from "@/lib/proof-content";
import styles from "./earnings-section.module.css";

export default function EarningsSection() {
  return (
    <section
      id="the-proof"
      className={styles.section}
      data-theme="deep-teal"
      aria-labelledby="proof-heading"
    >
      <EarningsStage>
        <div className={styles.copy} data-laptop-copy>
          <Eyebrow>The proof</Eyebrow>
          <h2 id="proof-heading" tabIndex={-1}>
            What our closers actually took home
          </h2>
          <p className={styles.subheadline}>
            Real commissions paid to our sales team. Not projections. Not
            averages.
          </p>
          <p className={styles.scrollNote} data-laptop-note>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 3v13m-5-5 5 5 5-5" />
            </svg>
            Scroll to see the numbers
          </p>
        </div>
        <div className={styles.window} data-laptop-window aria-hidden="true">
          <picture data-laptop-poster>
            <source
              media="(orientation: portrait)"
              srcSet="/media/earnings-laptop/mobile-summary.webp"
            />
            <img
              src="/media/earnings-laptop/desktop-summary.webp"
              alt=""
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <canvas className={styles.texture} data-laptop-texture />
          <div className={styles.world} data-laptop-world>
            <picture data-laptop-opening>
              <source
                media="(orientation: portrait)"
                srcSet="/media/earnings-laptop/mobile-opening-v067.webp"
              />
              <img
                src="/media/earnings-laptop/desktop-opening-v067.webp"
                alt=""
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>
        <dl
          className={styles.metrics}
          data-laptop-metrics
          data-proof-metrics
          aria-label="PractiScale in numbers"
        >
          {proofMetrics.map((metric, index) => (
            <div
              key={metric.id}
              className={styles.metric}
              data-proof-stat={index}
            >
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
        <a className={styles.skip} href="#proof-end">
          Skip earnings animation
        </a>
      </EarningsStage>
      <div
        className="sr-only"
        id="proof-records"
        aria-label="Sales team earnings"
      >
        <ol>
          {earningsRecords.map((record) => (
            <li key={record.name}>
              {record.name}, {record.role}: Rs{" "}
              {record.amount.toLocaleString("en-US")}. {record.period}.
            </li>
          ))}
        </ol>
        <p>
          Combined total: Rs {earningsTotal.toLocaleString("en-US")}. The
          amounts cover different reporting periods.
        </p>
      </div>
      <div id="proof-end" className={styles.end} tabIndex={-1}>
        <span className="sr-only">End of earnings presentation</span>
      </div>
      <noscript>
        <style>{`[data-laptop-rail]{height:auto!important}[data-laptop-viewport]{position:relative!important;height:auto!important;padding:72px var(--section-gutter) 56px!important}[data-laptop-copy]{position:relative!important;transform:none!important;width:auto!important;left:auto!important;top:auto!important}[data-laptop-window]{position:relative!important;width:100%!important;height:auto!important;aspect-ratio:3/2;transform:none!important}[data-laptop-texture],[data-laptop-world],[data-laptop-note]{display:none!important}`}</style>
      </noscript>
    </section>
  );
}
