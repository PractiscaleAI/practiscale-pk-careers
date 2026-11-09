"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  jobRoles,
  jobTeams,
  type JobRole,
  type JobTeam,
  type WorkMode,
} from "./jobs-data";
import styles from "./jobs.module.css";

function RoleCard({ role }: { role: JobRole }) {
  return (
    <article className={styles.roleCard}>
      <div className={styles.roleIdentity}>
        <div className={styles.roleTop}>
          <span className={styles.mode}>{role.mode}</span>
        </div>
        <h4>{role.title}</h4>
        <p className={styles.roleSummary}>{role.summary}</p>
      </div>
      <dl className={styles.roleFacts}>
        <div className={styles.payFact}>
          <dt>Monthly pay</dt>
          <dd>{role.earnings}</dd>
        </div>
        <div>
          <dt>Experience</dt>
          <dd>{role.experience}</dd>
        </div>
        {role.schedule && (
          <div>
            <dt>Shift</dt>
            <dd>{role.schedule}</dd>
          </div>
        )}
      </dl>
      <div className={styles.roleDetails}>
        <p>
          <strong>What you will do</strong>
          {role.duties}
        </p>
        <p>
          <strong>What we look for</strong>
          {role.requirements}
        </p>
      </div>
      <a
        className={styles.roleApply}
        href={role.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Apply for this role: ${role.title}`}
      >
        Apply for this role{" "}
        <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
      </a>
    </article>
  );
}

export default function JobsExplorer() {
  const [team, setTeam] = useState<JobTeam | "All">("All");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const matchingRoles = jobRoles.filter(
    (role) =>
      (team === "All" || role.team === team) &&
      (mode === "All" || role.mode === mode),
  );

  return (
    <section
      className={styles.explorer}
      id="open-roles"
      aria-labelledby="roles-title"
    >
      <div className={styles.explorerInner}>
        <div className={styles.explorerHead}>
          <div>
            <span className={styles.eyebrow}>Find your fit</span>
            <h2 id="roles-title">Explore open roles</h2>
          </div>
          <p>
            Choose a team or work mode. Each role shows what you will do and
            what we look for.
          </p>
        </div>
        <div className={styles.filterBar}>
          <div
            className={styles.teamFilters}
            role="group"
            aria-label="Filter by team"
          >
            <button
              type="button"
              aria-pressed={team === "All"}
              onClick={() => setTeam("All")}
            >
              All
            </button>
            {jobTeams.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={team === item.name}
                onClick={() => setTeam(item.name)}
              >
                {item.short}
              </button>
            ))}
          </div>
          <label className={styles.modeFilter}>
            <span>Work mode</span>
            <select
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as WorkMode | "All")
              }
            >
              <option value="All">All modes</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
            </select>
          </label>
        </div>
        <div className={styles.resultsMeta}>
          <p className={styles.count} aria-live="polite">
            {matchingRoles.length} {matchingRoles.length === 1 ? "role" : "roles"}{" "}
            shown
          </p>
          <p className={styles.earningsNote}>
            <strong>About compensation</strong> Pay figures are role ranges or
            upper limits from the hiring brief, not guaranteed earnings. Exact
            compensation is confirmed during screening.
          </p>
        </div>
        {jobTeams.map((item) => {
          const roles = matchingRoles.filter((role) => role.team === item.name);
          if (!roles.length) return null;
          return (
            <section
              key={item.id}
              className={styles.teamSection}
              id={item.id}
              aria-labelledby={`${item.id}-title`}
            >
              <div className={styles.teamHeading}>
                <span className={styles.teamCount}>
                  {String(roles.length).padStart(2, "0")} roles
                </span>
                <h3 id={`${item.id}-title`}>{item.name}</h3>
              </div>
              <div className={styles.roleGrid}>
                {roles.map((role) => (
                  <RoleCard key={role.title} role={role} />
                ))}
              </div>
              {item.id === "sales" && (
                <p className={styles.freshersLine}>
                  New to sales?{" "}
                  <Link href="/training-programs/appointment-setter">
                    Start with the Appointment Setter Program{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </p>
              )}
            </section>
          );
        })}
        {matchingRoles.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No roles match that combination.</h3>
            <p>Try another team or work mode to see the available roles.</p>
            <button
              type="button"
              onClick={() => {
                setTeam("All");
                setMode("All");
              }}
            >
              Show all roles
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
