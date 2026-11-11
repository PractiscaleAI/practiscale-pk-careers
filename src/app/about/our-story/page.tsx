import type { Metadata } from "next";
import Image from "next/image";
import InteriorShell from "@/components/interior-shell";
import { Action } from "@/components/ui";
import {
  AboutCta,
  AboutHero,
  NumberedCard,
  SectionHeading,
} from "../about-components";
import styles from "../about.module.css";

export const metadata: Metadata = {
  title: { absolute: "Afrasyab Ahmed, Founder of PractiScale | Our Story" },
  description:
    "How Afrasyab Ahmed built PractiScale from a home office into a 100+ person team in Rawalpindi serving 500+ US healthcare businesses, and his mission to create 5,000 careers in Pakistan.",
  alternates: { canonical: "/about/our-story" },
};

const values = [
  [
    "Hunger over pedigree",
    "We care how badly you want it and how fast you learn, not where you studied.",
  ],
  [
    "Outcomes over hours",
    "Pay follows results. The more you deliver, the more you earn.",
  ],
  [
    "Results over tenure",
    "Promotions are earned by performance, never by time served.",
  ],
  [
    "Systems over heroics",
    "Good systems let ordinary days produce great results.",
  ],
  ["Clear ownership", "Every task has three answers: what, who and when."],
] as const;

const milestones = [
  ["500+", "US healthcare businesses served"],
  ["100+", "Team members in Pakistan"],
  ["46,000", "Candidates in our hiring portal"],
  ["10,000 sq. ft.", "Workspace, grown from a home office"],
  ["PKR 10 million", "Monthly payroll"],
  ["29", "Published client case studies"],
  [
    "In house systems",
    "Hiring, AI training, call scoring, quality, payroll and ERP",
  ],
] as const;

const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Afrasyab Ahmed",
  jobTitle: "Founder and CEO",
  worksFor: {
    "@type": "Organization",
    name: "PractiScale",
    url: "https://practiscale.pk/",
  },
};

export default function OurStoryPage() {
  return (
    <InteriorShell>
      <div className={styles.page}>
        <AboutHero
          eyebrow="Our story"
          title="Built in Pakistan, on one skill: sales"
          body="PractiScale started in a home office with no money and no connections. Today, 100+ people work here, serving 500+ healthcare businesses across the US. This is how it happened, and where it is going."
          image="/media/about/about-founder-desktop.webp"
          mobileImage="/media/about/about-founder-mobile.webp"
          imageAlt="Afrasyab Ahmed, founder of PractiScale"
          variant="story"
        />

        <section
          id="founder"
          className={`${styles.section} ${styles.founderSection}`}
          aria-labelledby="founder-heading"
        >
          <div className={styles.founderProfile}>
            <div className={styles.founderSheet}>
              <div className={styles.founderEditorial}>
                <div className={styles.founderHeading}>
                  <p className={styles.founderRole}>Founder and CEO</p>
                  <h2 id="founder-heading">Afrasyab Ahmed</h2>
                </div>
                <figure className={styles.founderPortraitFrame}>
                  <Image
                    className={styles.founderPortrait}
                    src="/media/about/ceo-image-3.webp"
                    alt="Afrasyab Ahmed, Founder and CEO of PractiScale"
                    width={1275}
                    height={2375}
                    unoptimized
                  />
                </figure>
                <div className={styles.founderNarrative}>
                  <p>
                    It took me nine years to learn sales. Rejection taught me to
                    listen, follow-up taught me discipline, and objections
                    taught me to ask better questions. Those lessons took
                    PractiScale from a home office to a 10,000&nbsp;sq.&nbsp;ft.
                    workspace.
                  </p>
                  <p>
                    Growth changed what I was responsible for. I went from
                    chasing a personal income target to overseeing a
                    PKR&nbsp;10&nbsp;million monthly payroll.
                  </p>
                  <p>
                    My goal is to build a 5,000-person company. That takes
                    systems for hiring, training and quality, and room for
                    people to step into leadership.
                  </p>
                </div>
              </div>
              <div className={styles.founderQuote}>
                <span className={styles.founderQuoteMark} aria-hidden="true">
                  “
                </span>
                <blockquote>
                  I did not start with capital or connections. I started by
                  learning how to sell.
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.section}
          aria-label="Mission, vision and values"
        >
          <div className={styles.container}>
            <SectionHeading
              eyebrow="What guides us"
              title="Mission, vision and values"
            />
            <div className={styles.missionGrid}>
              <article className={styles.missionCard}>
                <h3>Mission</h3>
                <p>
                  Find overlooked talent in Pakistan, train it in skills the
                  global market pays for, and reward it for results.
                </p>
              </article>
              <article className={styles.missionCard}>
                <h3>Vision</h3>
                <p>
                  Build a 5,000 person company from Pakistan and create 5,000
                  careers that did not exist before.
                </p>
              </article>
            </div>
            <div className={styles.valueGrid}>
              {values.map(([title, body], index) => (
                <article className={styles.valueCard} key={title}>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.sectionWhite}
          aria-labelledby="women-heading"
        >
          <div className={`${styles.container} ${styles.womenGrid}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.smallLabel}>
                Women Empowerment Program
              </span>
              <h2 id="women-heading">Talent is everywhere. Access is not.</h2>
              <p>
                Many capable women in Pakistan are held back by limited access
                to stable, professional work, not by ability. We are changing
                that in two ways.
              </p>
            </div>
            <div className={styles.womenDetails}>
              <NumberedCard index={1} title="Remote careers">
                Our Virtual Assistant Program is open only to women and fully
                remote, so the commute is never the barrier.
              </NumberedCard>
              <NumberedCard index={2} title="Leadership roles">
                We want women to grow into leadership as their experience and
                responsibilities grow.
              </NumberedCard>
              <Action href="/training-programs/virtual-assistant">
                Explore the VA Program
              </Action>
            </div>
          </div>
        </section>

        <section
          className={styles.sectionDark}
          aria-labelledby="milestones-heading"
        >
          <div className={styles.container}>
            <div
              className={`${styles.sectionHeading} ${styles.inverseHeading}`}
            >
              <span className={styles.smallLabel}>Milestones</span>
              <h2 id="milestones-heading">Where we stand today</h2>
            </div>
            <div className={styles.metricGrid}>
              {milestones.map(([value, label]) => (
                <div className={styles.metric} key={value}>
                  <strong>{value}</strong>
                  <span className={styles.metricLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AboutCta
          title="Be one of the next 5,000."
          body="Start with training or bring your experience. Either way, there is a seat for people who deliver."
          primaryLabel="Explore Training Programs"
          primaryHref="/training-programs/appointment-setter"
          secondaryLabel="See Open Jobs"
          secondaryHref="/jobs"
        />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
      />
    </InteriorShell>
  );
}
