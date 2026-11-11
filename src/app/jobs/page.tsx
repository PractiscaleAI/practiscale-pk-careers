import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import InteriorShell from "@/components/interior-shell";
import JobsExplorer from "./jobs-explorer";
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
      <div className={styles.page}>
        <JobsExplorer />

        <section
          className={styles.training}
          aria-labelledby="jobs-training-heading"
        >
          <div className={styles.trainingInner}>
            <h2 id="jobs-training-heading">
              No experience yet? Start with a training program.
            </h2>
            <div className={styles.programGrid}>
              <article className={styles.programCard}>
                <span>Freshers welcome / Onsite</span>
                <h3>Appointment Setter Program</h3>
                <p>
                  Build appointment-setting skills and move toward a paid sales
                  role.
                </p>
                <Link
                  href="/training-programs/appointment-setter"
                  aria-label="View program: Appointment Setter Program"
                >
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
                <Link
                  href="/training-programs/virtual-assistant"
                  aria-label="View program: Virtual Assistant Program"
                >
                  View program <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section
          className={styles.hiring}
          aria-labelledby="jobs-process-heading"
        >
          <div className={styles.hiringInner}>
            <div className={styles.hiringIntro}>
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
      </div>
    </InteriorShell>
  );
}
