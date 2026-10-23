import ProofBandStage from "./proof-band-stage";
import styles from "./proof-band.module.css";

export default function ProofBand() {
  return (
    <section
      id="proof-band"
      className={styles.section}
      data-theme="deep-teal"
      aria-labelledby="proof-band-heading"
    >
      <ProofBandStage>
        <h2 id="proof-band-heading" className={styles.heading} tabIndex={-1}>
          The work behind the numbers
        </h2>
        <figure
          className={styles.scene}
          data-proof-figure
          role="img"
          aria-label="An illustrative campus connects healthcare businesses, a workplace, a hiring portal and published case studies."
        >
          <picture data-proof-poster>
            <source
              media="(max-width: 767px)"
              srcSet="/media/proof-band/mobile-final.webp"
            />
            <img
              src="/media/proof-band/desktop-final.webp"
              alt=""
              width={1440}
              height={680}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className={styles.canvas} data-proof-canvas-host />
        </figure>
        <a className={styles.skip} href="#proof-heading">
          Skip proof animation
        </a>
      </ProofBandStage>
      <noscript>
        <style>{`[data-proof-world]{height:auto!important}[data-proof-viewport]{position:relative!important;top:auto!important;height:auto!important}`}</style>
      </noscript>
    </section>
  );
}
