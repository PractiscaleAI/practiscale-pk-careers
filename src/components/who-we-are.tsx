import WhoWeAreStage from "./who-we-are-stage";
import { Eyebrow } from "./ui";
import styles from "./who-we-are.module.css";

export const officeFilm = "/media/who-we-are/office-scroll-v2.mp4";

export default function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className={styles.section}
      data-theme="fog"
      aria-labelledby="who-heading"
    >
      <WhoWeAreStage>
        <div className={styles.backdrop} data-who-background aria-hidden="true">
          <div
            className={styles.planeLeft}
            data-who-panel="left"
            aria-hidden="true"
          />
          <div className={styles.plane} data-who-plane aria-hidden="true" />
        </div>
        <div className={styles.copy} data-who-copy>
          <Eyebrow>Who we are</Eyebrow>
          <h2 id="who-heading" tabIndex={-1}>
            Step inside PractiScale.
          </h2>
        </div>
        <p className={styles.lede} data-who-description>
          PractiScale helps US healthcare businesses grow through professional
          referral relationships. We find the right referral partners in each
          client&apos;s area, reach out, qualify them and set up introductions.
          All of it is done here, by people we trained.
        </p>
        <figure className={styles.frame} data-who-frame>
          <div className={styles.matte} data-who-matte>
            <div className={styles.surface} data-who-surface>
              <video
                data-who-video
                poster="/media/who-we-are/opening.webp"
                preload="none"
                controls
                muted
                playsInline
                aria-label="Inside PractiScale, company film"
                aria-describedby="who-film-description"
                disablePictureInPicture
                controlsList="nodownload noremoteplayback"
              >
                <source
                  src={officeFilm}
                  type="video/mp4"
                  media="(min-width: 1024px)"
                />
                Your browser cannot play this film.{" "}
                <a href={officeFilm}>Open the film</a>.
              </video>
            </div>
          </div>
        </figure>
        <p className="sr-only" id="who-film-description">
          An Enter-key doorway leads into a film of PractiScale&apos;s building,
          reception and working team. The ending presents a future ambition:
          empowering 5,000 people to build meaningful careers in Pakistan. This
          is a vision, not the current team size.
        </p>
        <p className={styles.error} data-who-error hidden role="status">
          The film could not load. <a href={officeFilm}>Open the film</a>.
        </p>
        <a className={styles.skip} href="#career-heading" data-who-skip>
          Skip company film
        </a>
      </WhoWeAreStage>
    </section>
  );
}
