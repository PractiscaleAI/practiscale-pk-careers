import type { Metadata } from "next";
import Link from "next/link";
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
      "How PractiScale Works | Remote Healthcare Outreach Jobs in Pakistan",
  },
  description:
    "See what our Pakistan teams do for US healthcare businesses, where sales, VA, creative and tech roles fit, and how we train, coach and measure performance.",
  alternates: { canonical: "/about/how-we-work" },
};

const process = [
  ["Research", "Identify the referral partners in each client's area."],
  [
    "Outreach",
    "Reach licensed professionals who work with the patients our client serves.",
  ],
  ["Qualify", "Confirm each partner is a genuine fit before anyone meets."],
  [
    "Introduce",
    "Book the introduction. The client approves the partner and builds the relationship.",
  ],
] as const;

const roles = [
  {
    team: "Sales",
    roles: "Appointment Setter, Closer",
    contribution:
      "Start conversations, book meetings and bring new clients on board.",
  },
  {
    team: "Account support",
    roles: "Virtual Assistant",
    contribution:
      "Research, organize and support the accounts our teams manage.",
  },
  {
    team: "Creative",
    roles: "Graphic Designer, Video Editor, Script Writer",
    contribution:
      "Create the content that builds the PractiScale brand in the US and in Pakistan.",
  },
  {
    team: "Technology",
    roles: "AI Engineer, CRM and AI Expert, WordPress Developer, Web Developer",
    contribution:
      "Build the websites, internal tools and AI systems the company runs on.",
  },
  {
    team: "People and operations",
    roles: "HR Recruiter, Associate Manager",
    contribution:
      "Hire the next team members and keep daily operations on track.",
  },
] as const;

const systems = [
  ["AI training platform", "Lessons and tests assigned to each role."],
  [
    "Call scoring",
    "Sales calls are reviewed and scored, and the scores guide coaching.",
  ],
  ["Targets and leaderboards", "Everyone knows the goal and where they stand."],
  ["Quality checks", "Work is reviewed before it reaches a client."],
  ["Performance based pay", "Payroll connects directly to results."],
] as const;

const modes = [
  [
    "Remote",
    "Work from anywhere in Pakistan on roles such as Remote Closer, Virtual Assistant and Remote HR Recruiter.",
  ],
  ["Onsite", "Work from our offices in Rawalpindi or Islamabad."],
  ["Hybrid", "Split between home and office, currently for creative roles."],
] as const;

export default function HowWeWorkPage() {
  return (
    <InteriorShell>
      <div className={styles.page}>
        <AboutHero
          eyebrow="How we work"
          title="Every role here serves one outcome"
          body="We help US healthcare businesses build relationships with the professionals who refer patients to them. Here is how the work gets done, and where you fit."
          image="/media/about/about-how-we-work-desktop.webp"
          mobileImage="/media/about/about-how-we-work-mobile.webp"
          imageAlt="Recreated view of work inside PractiScale's Rawalpindi office"
        />

        <section
          className={styles.sectionWhite}
          aria-labelledby="trust-heading"
        >
          <div className={`${styles.container} ${styles.trustGrid}`}>
            <div className={styles.sectionHeading}>
              <span className={styles.smallLabel}>What our clients need</span>
              <h2 id="trust-heading">Healthcare growth runs on trust</h2>
            </div>
            <div className={styles.trustCopy}>
              <p>
                In the US, many patients reach a home care agency or assisted
                living community through a referral. Discharge planners, case
                managers and social workers make those referrals. A healthcare
                business grows when those professionals know it and trust it.
              </p>
              <strong>
                Being known gets attention. Being trusted gets the call.
              </strong>
            </div>
          </div>
        </section>

        <section
          className={styles.sectionDark}
          aria-labelledby="work-steps-heading"
        >
          <div className={styles.container}>
            <div
              className={`${styles.sectionHeading} ${styles.inverseHeading}`}
            >
              <span className={styles.smallLabel}>What our teams do</span>
              <h2 id="work-steps-heading">
                Four steps, done by people we trained
              </h2>
            </div>
            <div className={styles.processGrid}>
              {process.map(([title, body], index) => (
                <NumberedCard index={index + 1} title={title} key={title}>
                  {body}
                </NumberedCard>
              ))}
            </div>
            <Link
              className={styles.processLink}
              href="https://practiscale.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              US healthcare business? See how referral partnerships work at
              practiscale.com
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="roles-heading">
          <div className={styles.container}>
            <SectionHeading
              id="roles-heading"
              eyebrow="Where you fit"
              title="Where each role fits"
            />
            <div className={styles.rolesGrid}>
              {roles.map(({ team, roles: roleNames, contribution }) => (
                <article className={styles.roleCard} key={team}>
                  <h3>{team}</h3>
                  <div className={styles.roleDetail}>
                    <p className={styles.smallLabel}>Roles</p>
                    <p>{roleNames}</p>
                  </div>
                  <div className={styles.roleDetail}>
                    <p className={styles.smallLabel}>What you contribute</p>
                    <p>{contribution}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.sectionWhite}
          aria-labelledby="systems-heading"
        >
          <div className={styles.container}>
            <SectionHeading
              id="systems-heading"
              eyebrow="How we train and measure"
              title="Hiring gives you people. Systems turn them into a company."
              body="We built our own systems so every person gets training, feedback and a fair measure of performance."
            />
            <div className={styles.systemsGrid}>
              {systems.map(([title, body], index) => (
                <NumberedCard index={index + 1} title={title} key={title}>
                  {body}
                </NumberedCard>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="modes-heading">
          <div className={styles.container}>
            <SectionHeading
              id="modes-heading"
              eyebrow="Work modes"
              title="Remote, onsite or hybrid"
            />
            <div className={styles.modeGrid}>
              {modes.map(([title, body], index) => (
                <NumberedCard index={index + 1} title={title} key={title}>
                  {body}
                </NumberedCard>
              ))}
            </div>
          </div>
        </section>

        <AboutCta
          title="Find the role that fits you."
          primaryLabel="See Open Jobs"
          primaryHref="/jobs"
          secondaryLabel="Explore Training Programs"
          secondaryHref="/training-programs/appointment-setter"
        />
      </div>
    </InteriorShell>
  );
}
