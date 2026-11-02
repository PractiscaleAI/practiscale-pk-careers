import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import InteriorShell from "@/components/interior-shell";
import { Action } from "@/components/ui";
import JobsExplorer from "./jobs-explorer";
import { jobRoles, jobTeams } from "./jobs-data";
import styles from "./jobs.module.css";

export const metadata: Metadata = {
  title: {
    absolute:
      "Jobs at PractiScale | Sales, Design, Developer and AI Jobs in Pakistan",
  },
  description:
    "Open roles in sales, graphic design, video editing, AI engineering, WordPress and web development, recruitment and operations. Remote, onsite and hybrid in Rawalpindi and Islamabad.",
  alternates: { canonical: "/jobs" },
};

const hiringSteps = [
  {
    title: "Apply",
    body: "Send your CV and a 60 second video on why you fit.",
  },
  {
    title: "Screen",
    body: "A 20 minute call to confirm fit and compensation. Straight numbers.",
  },
  {
    title: "Task",
    body: "A real role test, such as a sales call, a workflow or a design.",
  },
  {
    title: "Offer",
    body: "A conversation with leadership. If approved, you start the following Monday.",
  },
];

export default function JobsPage() {
  return (
    <InteriorShell>
      <section className={styles.hero} aria-labelledby="jobs-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Now hiring</span>
            <h1 id="jobs-heading">
              Open jobs at <span>PractiScale</span>
            </h1>
            <p>
              Sales, creative, tech and operations roles in Rawalpindi,
              Islamabad and remote. Explore each role&apos;s responsibilities
              and work mode. We confirm pay and experience details during
              screening where they are not listed.
            </p>
            <a className={styles.heroLink} href="#open-roles">
              Explore roles <ArrowDownRight size={18} aria-hidden="true" />
            </a>
          </div>
          <nav className={styles.teamIndex} aria-label="Job teams">
            <span className={styles.indexLabel}>Explore by team</span>
            {jobTeams.map((team, index) => (
              <a key={team.id} href={`#${team.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{team.short}</strong>
                <small>
                  {jobRoles.filter((role) => role.team === team.name).length}{" "}
                  roles
                </small>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </section>

      <JobsExplorer />

      <section
        className={styles.training}
        aria-labelledby="jobs-training-heading"
      >
        <div className={styles.trainingInner}>
          <div className={styles.trainingIntro}>
            <span className={styles.eyebrow}>A place to begin</span>
            <h2 id="jobs-training-heading">
              No experience yet? Start with a training program.
            </h2>
          </div>
          <div className={styles.programGrid}>
            <article className={styles.programCard}>
              <span>Freshers welcome / Onsite</span>
              <h3>Appointment Setter Program</h3>
              <p>Rs 30,000 to Rs 200,000 per month after hiring.</p>
              <Link href="/training-programs/appointment-setter">
                View program <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </article>
            <article className={styles.programCard}>
              <span>Women only / Remote</span>
              <h3>Virtual Assistant Program</h3>
              <p>Rs 20,000 to Rs 150,000 per month after hiring.</p>
              <Link href="/training-programs/virtual-assistant">
                View program <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.hiring} aria-labelledby="jobs-process-heading">
        <div className={styles.hiringInner}>
          <div className={styles.hiringIntro}>
            <span className={styles.eyebrow}>Your next chapter</span>
            <h2 id="jobs-process-heading">How hiring works</h2>
            <p>Four steps. No long forms. No unnecessary rounds.</p>
          </div>
          <ol className={styles.steps}>
            {hiringSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="jobs-open-heading">
        <div className={styles.closingInner}>
          <div>
            <span className={styles.eyebrow}>Open application</span>
            <h2 id="jobs-open-heading">Don&apos;t see your role?</h2>
            <p>
              If you can sell, build or create, we still want to hear from you.
            </p>
          </div>
          <Action href="https://wa.me/923334000600">Pitch us anyway</Action>
        </div>
        <p className={styles.earningsNote}>
          Earning ranges include performance based pay where applicable. Your
          exact compensation is confirmed during the screening call.
        </p>
      </section>
    </InteriorShell>
  );
}
