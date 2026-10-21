import { Action, Eyebrow } from "@/components/ui";
import { careerChapters } from "@/lib/career-content";
import CareerStage from "@/components/career-stage";
import styles from "./career-section.module.css";

export default function CareerSection() {
  return (
    <section
      id="career-paths"
      className={styles.section}
      aria-labelledby="career-heading"
    >
      <div className={styles.intro}>
        <Eyebrow>Two ways in</Eyebrow>
        <h2 id="career-heading">
          Two ways to start your career at PractiScale
        </h2>
      </div>
      <CareerStage>
        {careerChapters.map((chapter, index) => (
          <article
            className={styles.chapter}
            id={`career-${chapter.id}`}
            key={chapter.id}
            data-career-chapter={index}
            aria-labelledby={`career-title-${chapter.id}`}
          >
            <div className={styles.textPanel} data-career-text>
              <div className={styles.labels} data-career-group>
                <p className={styles.path}>{chapter.pathLabel}</p>
                <p className={styles.eligibility}>{chapter.eligibility}</p>
              </div>
              <div className={styles.mainCopy} data-career-group>
                <h3 id={`career-title-${chapter.id}`} tabIndex={-1}>
                  {chapter.title}
                </h3>
                <p className={styles.body}>{chapter.body}</p>
              </div>
              <div className={styles.details} data-career-group>
                <Action href={chapter.href}>{chapter.cta}</Action>
              </div>
            </div>
            <div
              className={styles.poster}
              data-career-poster
              aria-hidden="true"
            >
              <img
                src={
                  chapter.id === "training"
                    ? "/media/career-paths/training-refined.webp"
                    : `/media/career-paths/${chapter.id}.svg`
                }
                alt=""
                width={720}
                height={720}
                loading="lazy"
                decoding="async"
              />
            </div>
          </article>
        ))}
      </CareerStage>
    </section>
  );
}
