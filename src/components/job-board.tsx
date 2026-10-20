"use client";
import { useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { roles, whatsapp } from "@/lib/content";
export default function JobBoard() {
  const [team, setTeam] = useState("All"),
    [mode, setMode] = useState("All"),
    [query, setQuery] = useState("");
  const results = roles.filter(
    (r) =>
      (team === "All" || r.team === team) &&
      (mode === "All" || r.mode.includes(mode)) &&
      `${r.title} ${r.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="job-board wrap">
      <div className="job-tools">
        <div>
          <label htmlFor="role-search">Find your role</label>
          <div className="search">
            <Search size={18} aria-hidden="true" />
            <input
              id="role-search"
              type="search"
              placeholder="Search roles or skills"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="work-mode">Work arrangement</label>
          <select
            id="work-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {["All", "Remote", "Onsite", "Hybrid"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="filters" role="group" aria-label="Filter by team">
        {["All", "Sales", "Creative", "Technology", "People & Operations"].map(
          (x) => (
            <button
              key={x}
              aria-pressed={team === x}
              onClick={() => setTeam(x)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <p className="result-count" aria-live="polite">
        {results.length} career {results.length === 1 ? "area" : "areas"} · Ask
        hiring about current openings
      </p>
      <div className="role-list">
        {results.map((r) => (
          <article key={r.title} className="role-row">
            <div>
              <span className="eyebrow">
                {r.team} / {r.mode}
              </span>
              <h2>{r.title}</h2>
              <p>{r.summary}</p>
              <p className="role-detail">
                {r.experience} · Compensation confirmed during screening
              </p>
            </div>
            <a href={whatsapp(r.title)} className="role-action">
              Ask about this role
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
      {!results.length && (
        <div className="empty-state">
          <h2>No roles match those filters.</h2>
          <p>
            Try a different skill or reset the filters to explore all career
            areas.
          </p>
          <button
            className="action"
            onClick={() => {
              setMode("All");
              setTeam("All");
              setQuery("");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}
