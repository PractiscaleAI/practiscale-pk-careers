import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import InteriorShell from "@/components/interior-shell";
import JobsExplorer from "./jobs-explorer";
import { jobRoles, jobTeams } from "./jobs-data";
import styles from "./jobs.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "Open Jobs at PractiScale | Sales, Media and Operations",
  },
  description:
    "Explore current sales, media and operations roles at PractiScale. See each role's responsibilities, work mode, pay and application form.",
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
              Current openings in sales, media and operations. Compare the
              responsibilities, work mode and monthly pay for each role, then
              apply through the form for that role or team.
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
              <p>
                Build appointment-setting skills and move toward a paid sales
                role.
              </p>
              <Link href="/training-programs/appointment-setter">
                View program <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </article>
            <article className={styles.programCard}>
              <span>Women only / Remote</span>
              <h3>Virtual Assistant Program</h3>
              <p>
                Train for remote account support through the Women Empowerment
                Program.
              </p>
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

    </InteriorShell>
  );
}
