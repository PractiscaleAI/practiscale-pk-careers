"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
import {
  jobRoles,
  jobTeams,
  type JobRole,
  type JobTeam,
  type WorkMode,
} from "./jobs-data";
import styles from "./jobs.module.css";

const pageSize = 3;
const workModes = ["All", "Onsite", "Remote"] as const;
const rolesByTeam = jobTeams.map(({ name }) =>
  jobRoles.filter((role) => role.team === name),
);
const orderedRoles = Array.from(
  { length: Math.max(...rolesByTeam.map((roles) => roles.length)) },
  (_, index) => rolesByTeam.flatMap((roles) => roles.slice(index, index + 1)),
).flat();

function RoleCard({ role }: { role: JobRole }) {
  const [amount, qualifier] = role.earnings.split(
    / (?=\+ |based on performance)/,
    2,
  );

  return (
    <article className={styles.roleCard}>
      <div className={styles.roleHeader}>
        <span className={styles.teamIcon} aria-hidden="true">
          {role.team[0]}
        </span>
        <div>
          <h3>{role.title}</h3>
          <ul className={styles.roleFacts} aria-label="Role at a glance">
            <li>{role.team}</li>
            <li>{role.mode}</li>
            <li>{role.experience}</li>
            {role.schedule && <li>{role.schedule}</li>}
          </ul>
          <p className={styles.roleSummary}>{role.summary}</p>
        </div>
      </div>
      <div className={styles.roleCompensation}>
        <dl>
          <dt>Monthly pay</dt>
          <dd>
            <span className={styles.rolePay}>
              {amount.replace(/(\d) to (?=\d)/, "$1–")}
            </span>
            {qualifier && (
              <span className={styles.payQualifier}>{qualifier}</span>
            )}
          </dd>
        </dl>
        <a
          className={styles.roleApply}
          href={role.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={"Apply now for " + role.title}
        >
          Apply now <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <details className={styles.roleDetails}>
        <summary>
          Role details <ChevronDown size={15} aria-hidden="true" />
        </summary>
        <div className={styles.detailsBody}>
          <p>
            <strong>What you’ll do</strong>
            {role.duties}
          </p>
          <p>
            <strong>What you’ll need</strong>
            {role.requirements}
          </p>
        </div>
      </details>
    </article>
  );
}

export default function JobsExplorer() {
  const [team, setTeam] = useState<JobTeam | "All">("All");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [freshersOnly, setFreshersOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const searchInput = useRef<HTMLInputElement>(null);
  const filters = useRef<HTMLDetailsElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const nextRole = useRef<number | null>(null);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 760px)");
    const syncFilterPanel = () => {
      if (filters.current) filters.current.open = !compact.matches;
    };
    const syncTeamLink = () => {
      const linkedTeam = jobTeams.find(
        ({ id }) => window.location.hash === "#" + id,
      );
      if (linkedTeam) {
        setTeam(linkedTeam.name);
        setLimit(pageSize);
      }
    };
    syncFilterPanel();
    syncTeamLink();
    compact.addEventListener("change", syncFilterPanel);
    window.addEventListener("hashchange", syncTeamLink);
    return () => {
      compact.removeEventListener("change", syncFilterPanel);
      window.removeEventListener("hashchange", syncTeamLink);
    };
  }, []);

  useEffect(() => {
    if (nextRole.current === null) return;
    list.current?.querySelectorAll("summary")[nextRole.current]?.focus();
    nextRole.current = null;
  }, [limit]);

  const searchTerm = query.trim().toLowerCase();
  const activeFilters = Number(mode !== "All") + Number(freshersOnly);
  const hasFilters = team !== "All" || activeFilters > 0 || searchTerm !== "";
  const matchingRoles = orderedRoles.filter(
    (role) =>
      (team === "All" || role.team === team) &&
      (mode === "All" || role.mode === mode) &&
      (!freshersOnly || role.experience === "Freshers welcome") &&
      (!searchTerm ||
        [
          role.title,
          role.team,
          role.mode,
          role.summary,
          role.duties,
          role.requirements,
          role.experience,
          role.schedule ?? "",
        ].some((value) => value.toLowerCase().includes(searchTerm))),
  );
  const shown = matchingRoles.slice(0, limit);
  const nextCount = Math.min(pageSize, matchingRoles.length - shown.length);
  const resultCount = nextCount
    ? "Showing " + shown.length + " of " + matchingRoles.length + " roles"
    : matchingRoles.length + (matchingRoles.length === 1 ? " role" : " roles");

  function selectTeam(value: JobTeam | "All") {
    setTeam(value);
    setLimit(pageSize);
  }

  function clearSearch() {
    setQuery("");
    setLimit(pageSize);
    searchInput.current?.focus();
  }

  function clearFilters() {
    setTeam("All");
    setMode("All");
    setFreshersOnly(false);
    clearSearch();
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="jobs-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="jobs-heading">
              Open jobs at <span>PractiScale</span>
            </h1>
            <p>
              Explore Sales, Media and Operations roles. Compare work mode,
              experience and monthly pay before you apply.
            </p>
          </div>
          <div className={styles.heroMedia}>
            <Image
              src="/media/who-we-are/team.webp"
              alt="PractiScale colleagues working in the office"
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div
            className={styles.searchField}
            role="search"
            aria-label="Open roles"
          >
            <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            <label className={styles.srOnly} htmlFor="role-search">
              Search roles or skills
            </label>
            <input
              id="role-search"
              ref={searchInput}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(pageSize);
              }}
              placeholder="Search roles or skills"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
              >
                <X size={19} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section
        className={styles.board}
        id="open-roles"
        aria-labelledby="roles-title"
      >
        <details className={styles.filters} ref={filters}>
          <summary>
            Filters
            {activeFilters > 0 && <span> · {activeFilters} active</span>}
          </summary>
          <div className={styles.filterFields}>
            <fieldset>
              <legend>Work mode</legend>
              <div className={styles.workModes}>
                {workModes.map((item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="jobs-work-mode"
                      checked={mode === item}
                      onChange={() => {
                        setMode(item);
                        setLimit(pageSize);
                      }}
                    />
                    {item === "All" ? "All modes" : item}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Experience</legend>
              <label>
                <input
                  type="checkbox"
                  checked={freshersOnly}
                  onChange={(event) => {
                    setFreshersOnly(event.target.checked);
                    setLimit(pageSize);
                  }}
                />
                Freshers welcome
              </label>
            </fieldset>
            {hasFilters && (
              <button
                className={styles.clearFilters}
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </details>

        <div className={styles.results}>
          <div className={styles.resultsHead}>
            <h2 id="roles-title">Open roles</h2>
            <p className={styles.count} role="status">
              {resultCount}
            </p>
          </div>
          <div
            className={styles.teamFilters}
            role="group"
            aria-label="Filter by team"
          >
            <button
              type="button"
              aria-pressed={team === "All"}
              onClick={() => selectTeam("All")}
            >
              All roles
            </button>
            {jobTeams.map(({ id, name, short }) => (
              <button
                key={id}
                id={id}
                type="button"
                aria-pressed={team === name}
                onClick={() => selectTeam(name)}
              >
                {short}
              </button>
            ))}
          </div>
          <div className={styles.roleList} ref={list}>
            {shown.map((role) => (
              <RoleCard key={role.title} role={role} />
            ))}
          </div>
          {!shown.length && (
            <div className={styles.emptyState}>
              <h3>No roles match</h3>
              <p>Try a different search or change your filters.</p>
              <button
                className={styles.clearFilters}
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
          {nextCount > 0 && (
            <button
              className={styles.moreRoles}
              type="button"
              onClick={() => {
                nextRole.current = shown.length;
                setLimit(limit + pageSize);
              }}
            >
              Show {nextCount} more {nextCount === 1 ? "role" : "roles"}
            </button>
          )}
          <p className={styles.earningsNote}>
            Pay figures are role ranges or upper limits. Exact compensation is
            confirmed during screening.
          </p>
        </div>
      </section>
    </>
  );
}
