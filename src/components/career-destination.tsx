import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Action, Eyebrow } from "@/components/ui";
import {
  careerChapters,
  careerPrograms,
  type CareerChapter,
} from "@/lib/career-content";
import { whatsapp } from "@/lib/content";
import JobBoard from "./job-board";
import styles from "./career-destination.module.css";

export default function CareerDestination({
  chapter,
}: {
  chapter: CareerChapter;
}) {
  const jobs = chapter.id === "jobs";
  return (
    <main id="main" className={styles.page} tabIndex={-1}>
      <header className={styles.header}>
        <Link href="/" aria-label="PractiScale home">
          <img
            src="/brand/logos/practiscale-logo-primary.png"
            width={260}
            height={48}
            alt="PractiScale, built for growth"
          />
        </Link>
        <Link href={`/#career-${jobs ? "jobs" : "training"}`}>
          Back to career paths
        </Link>
      </header>
      <div className={styles.overview}>
        <div className={styles.copy}>
          <Eyebrow>{chapter.eligibility}</Eyebrow>
          <h1>{chapter.title}</h1>
          <p>{chapter.body}</p>
          {chapter.location && (
            <p className={styles.location}>{chapter.location}</p>
          )}
          {chapter.earnings && (
            <p className={styles.earnings}>
              <span>Monthly earning range after hiring</span>
              <strong>{chapter.earnings}</strong>
            </p>
          )}
          <Action
            href={whatsapp(
              jobs ? "current open roles" : `the ${chapter.title}`,
            )}
          >
            {jobs ? "Ask hiring about open roles" : "Ask about this program"}
          </Action>
        </div>
        <div className={styles.visual} aria-hidden="true">
          <img
            src={`/media/career-paths/${chapter.id}.svg`}
            alt=""
            width={720}
            height={720}
          />
        </div>
      </div>
      {jobs && <JobBoard />}
      <nav className={styles.related} aria-label="Other career opportunities">
        {[...careerPrograms, careerChapters[1]]
          .filter((item) => item.id !== "training" && item.id !== chapter.id)
          .map((item) => (
            <Link href={item.href} key={item.id}>
              {item.id === "jobs" ? "Explore career opportunities" : item.title}
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          ))}
      </nav>
    </main>
  );
}
