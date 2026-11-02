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

const journey = [
  ["The beginning", "A young man from Pakistan with a point to prove."],
  [
    "No connections",
    "No money. No contacts. Only ambition and a skill to build.",
  ],
  ["The early days", "We built at night while everyone else slept."],
  ["The first office", "The home office became 1,000 sq. ft."],
  ["Filling up", "One by one, the seats filled."],
  [
    "Raising the ceiling",
    "We did not move to a bigger office. We kept the old one full and started a new one from zero.",
  ],
  ["The new home", "10,000 sq. ft. Brick by brick, this became home."],
  ["Our team", "100+ people. The ones who made it real."],
] as const;

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
          imageAlt="Art-directed portrait of Afrasyab Ahmed, Founder and CEO of PractiScale"
          variant="portrait"
        />

        <section className={styles.section} aria-labelledby="journey-heading">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.smallLabel}>01 / The journey</span>
              <h2 id="journey-heading">From a home office to 10,000 sq. ft.</h2>
            </div>
            <div className={styles.journey}>
              <ol className={styles.journeyList}>
                {journey.map(([title, body], index) => (
                  <li key={title}>
                    <span className={styles.stepIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </li>
                ))}
              </ol>
              <aside
                className={styles.journeyAside}
                aria-label="PractiScale office interior"
              >
                <div className={styles.imagePanel}>
                  <Image
                    src="/media/about/about-office-reception-branded-v2.webp"
                    alt="Recreated view of PractiScale's Rawalpindi office reception"
                    fill
                    sizes="(max-width: 760px) 100vw, 40vw"
                  />
                </div>
                <p className={styles.imageCaption}>
                  <span>PractiScale, Rawalpindi</span>
                  <span>Office recreation</span>
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section
          id="founder"
          className={styles.sectionDark}
          aria-labelledby="founder-heading"
        >
          <div className={`${styles.container} ${styles.founderGrid}`}>
            <aside className={styles.founderAside}>
              <div className={styles.imagePanel}>
                <Image
                  src="/media/about/about-founder-desktop.webp"
                  alt="Art-directed portrait of Afrasyab Ahmed, Founder and CEO of PractiScale"
                  fill
                  sizes="(max-width: 760px) 100vw, 40vw"
                />
              </div>
              <p className={styles.founderVoice}>
                I did not start with capital or connections. I started by
                learning how to sell.
              </p>
            </aside>
            <div className={styles.founderContent}>
              <div
                className={`${styles.sectionHeading} ${styles.inverseHeading}`}
              >
                <span className={styles.smallLabel}>Founder and CEO</span>
                <h2 id="founder-heading">Afrasyab Ahmed</h2>
              </div>
              <div className={styles.storyChapter}>
                <h3>The skill</h3>
                <p>
                  Sales took me nine years to learn properly. Rejection taught
                  me to listen. Follow up taught me discipline. Objections
                  taught me that a &quot;no&quot; is usually a question nobody
                  has answered yet. Sales did not just change my income. It
                  changed the size of my ambition.
                </p>
              </div>
              <div className={styles.storyChapter}>
                <h3>The offices</h3>
                <p>
                  Sales took me from a home office to 1,000 sq. ft., then to
                  10,000 sq. ft. When an office filled up, I did not move
                  everyone into a bigger one. I kept the old one full and
                  started the new one at zero. New seats. New people. New
                  managers.
                </p>
                <p>
                  My offices got bigger because my ability to sell got better.
                </p>
              </div>
              <div className={styles.storyChapter}>
                <h3>The responsibility</h3>
                <p>
                  My goal used to be earning PKR 1 million a month. Today,
                  responsibility looks like a PKR 10 million monthly payroll,
                  and hundreds of families who depend on this company working.
                  Money stopped being about what I take home. It became about
                  what the team takes home.
                </p>
              </div>
              <div className={styles.storyChapter}>
                <h3>The system</h3>
                <p>
                  When I said I wanted to build a 5,000 person company, I
                  realized ambition was not the problem. Infrastructure was. So
                  I stopped posting and started building: a hiring engine, an AI
                  training platform, call scoring, quality checks, payroll and
                  our own ERP.
                </p>
                <p>
                  You cannot build a 5,000 person company with 50 person
                  systems.
                </p>
              </div>
              <div className={styles.storyChapter}>
                <h3>The people</h3>
                <p>
                  AI is not replacing my team. It is helping me build a bigger
                  one, and making every person on it more capable.
                </p>
                <p>
                  When two of our managers left, I told the office it was a day
                  to celebrate. Two leadership seats had opened, and people who
                  had been waiting could finally step up. A company should never
                  depend on a few irreplaceable people. It should keep producing
                  leaders.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.beliefs} aria-label="Founder beliefs">
              <blockquote>
                Hiring gives you people. Systems turn them into a company.
              </blockquote>
              <blockquote>
                You can recruit talent with money. You retain it with
                opportunity.
              </blockquote>
              <blockquote>
                Learn a skill that gets paid wherever business exists.
              </blockquote>
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
                Our Associate Manager role is open to women, so the path leads
                beyond entry level.
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
