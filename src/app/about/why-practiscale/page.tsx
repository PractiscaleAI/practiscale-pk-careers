import type { Metadata } from "next";
import InteriorShell from "@/components/interior-shell";
import {
  AboutCta,
  AboutHero,
  NumberedCard,
  SectionHeading,
} from "../about-components";
import styles from "../about.module.css";

export const metadata: Metadata = {
  title: {
    absolute:
      "Why Work at PractiScale | Career Growth and High Earning Jobs in Pakistan",
  },
  description:
    "We hire for hunger, pay for outcomes and promote on results. See real growth stories from the PractiScale team in Rawalpindi, Islamabad and remote.",
  alternates: { canonical: "/about/why-practiscale" },
};

const reasons = [
  [
    "A skill that travels",
    "Sales, communication, design and technical skills are paid wherever business exists. What you learn here stays valuable wherever you go next.",
  ],
  [
    "Pay tied to results",
    "The more you deliver, the more you earn. Your effort shows up in your paycheck, not only in your appraisal.",
  ],
  [
    "Promotion on merit",
    "When a leadership seat opens, someone from the team steps into it. Results decide who.",
  ],
  [
    "Training and coaching",
    "You are never left to figure it out alone. Training, call reviews and managers help you improve every week.",
  ],
  [
    "International exposure",
    "You work on accounts for US healthcare businesses and build experience most local jobs cannot offer.",
  ],
  [
    "Clear targets, no busywork",
    "No politics and no corporate noise. Know the target, do the work and move the numbers.",
  ],
] as const;

const stories = [
  {
    name: "Mahnoor",
    start: "PKR 5,000",
    result: "PKR 159,000",
    note: "Later promoted to Team Lead",
  },
  { name: "Nayab", start: "PKR 5,000", result: "PKR 134,000" },
  { name: "Abdul Waris", start: "PKR 2,000", result: "PKR 118,000" },
  {
    name: "Hanzala",
    start: "PKR 16,000",
    result: "PKR 85,000",
    startNote: "By day 12",
    note: "In month 2",
  },
] as const;

const thrives = [
  "People who want growth more than comfort.",
  "Fast learners who take feedback and use it.",
  "People who own their results, good or bad.",
  "Clear communicators, or people ready to become one.",
] as const;

export default function WhyPractiScalePage() {
  return (
    <InteriorShell>
      <div className={styles.page}>
        <AboutHero
          eyebrow="Why PractiScale"
          title="Why build your career here"
          body="We hire for hunger, not pedigree. We pay for outcomes, not hours. We promote on results, not time served."
          image="/media/about/about-why-practiscale-desktop.webp"
          mobileImage="/media/about/about-why-practiscale-mobile.webp"
          imageAlt="Art-directed recreation of colleagues collaborating in PractiScale's office"
        />

        <section className={styles.section} aria-labelledby="reasons-heading">
          <div className={styles.container}>
            <SectionHeading
              id="reasons-heading"
              eyebrow="Six reasons"
              title="What you can build here"
            />
            <div className={styles.reasonGrid}>
              {reasons.map(([title, body], index) => (
                <NumberedCard index={index + 1} title={title} key={title}>
                  {body}
                </NumberedCard>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.sectionDark}
          aria-labelledby="growth-heading"
        >
          <div className={styles.container}>
            <div
              className={`${styles.sectionHeading} ${styles.inverseHeading}`}
            >
              <span className={styles.smallLabel}>Growth stories</span>
              <h2 id="growth-heading">
                Where our people started, and where they are now
              </h2>
            </div>
            <div className={styles.growthGrid}>
              {stories.map(({ name, start, result, ...details }) => (
                <article className={styles.growthCard} key={name}>
                  <h3>{name}</h3>
                  <dl>
                    <div className={styles.growthStart}>
                      <dt>Started at</dt>
                      <dd>
                        <span className={styles.growthCurrency}>PKR</span>
                        <span>{start.slice(4)}</span>
                      </dd>
                      {"startNote" in details && (
                        <dd className={styles.growthNote}>
                          {details.startNote}
                        </dd>
                      )}
                    </div>
                    <div className={styles.growthResult}>
                      <dt>Grew to</dt>
                      <dd>
                        <span className={styles.growthCurrency}>PKR</span>
                        <span>{result.slice(4)}</span>
                      </dd>
                      {"note" in details && (
                        <dd className={styles.growthNote}>{details.note}</dd>
                      )}
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <p className={styles.disclaimer}>
              Amounts shown are individual results, not guarantees.
            </p>
          </div>
        </section>

        <section
          className={styles.sectionWhite}
          aria-labelledby="thrives-heading"
        >
          <div className={`${styles.container} ${styles.honestGrid}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.smallLabel}>The honest fit</span>
              <h2 id="thrives-heading">Who thrives here</h2>
              <p className={styles.honestNote}>
                If you want a fixed routine and the same paycheck regardless of
                output, PractiScale may not be the right fit. We would rather
                tell you now.
              </p>
            </div>
            <ul className={styles.thriveList}>
              {thrives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <AboutCta
          title="Your ceiling here is the one you set."
          primaryLabel="See Open Jobs"
          primaryHref="/jobs"
          secondaryLabel="Explore Training Programs"
          secondaryHref="/training-programs/appointment-setter"
        />
      </div>
    </InteriorShell>
  );
}
