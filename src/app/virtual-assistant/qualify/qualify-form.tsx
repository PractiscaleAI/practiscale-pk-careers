"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { qualify, routes } from "../content";
import styles from "../funnel.module.css";
import { loadLead, postRegistration, type Lead } from "../lead";

type Answer = "" | "yes" | "no";

/**
 * Step 2: two yes/no questions. Any "no" → not eligible; both "yes" →
 * thank-you. The answers are sent to GHL against the contact captured in the
 * popup. Without that contact (someone landing here directly) the visitor is
 * sent back to the landing page with the popup open.
 */
export default function QualifyForm() {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [a1, setA1] = useState<Answer>("");
  const [a2, setA2] = useState<Answer>("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = loadLead();
    if (!saved) router.replace(`${routes.landing}?register`);
    else setLead(saved);
  }, [router]);

  async function next() {
    if (!lead || !a1 || !a2 || sending) return;
    setSending(true);
    const qualified = a1 === "yes" && a2 === "yes";
    try {
      await postRegistration(
        {
          stage: "qualification",
          name: lead.name,
          email: lead.email,
          whatsapp: lead.phone,
          isWoman: a1 === "yes",
          hasLaptop: a2 === "yes",
        },
        6000,
      );
    } catch {
      // The contact was already captured in step 1; never strand the visitor.
    }
    router.push(qualified ? routes.thanks : routes.notEligible);
  }

  if (!lead) return <div className={styles.fcard} aria-busy="true" />;

  const question = (
    n: 1 | 2,
    text: string,
    value: Answer,
    set: (v: Answer) => void,
  ) => (
    <fieldset className={styles.q}>
      <legend>
        <span className={styles.qn}>Question {n}</span>
        {text}
      </legend>
      <div className={styles.yn}>
        {(["yes", "no"] as const).map((v) => (
          <label key={v} data-no={v === "no" ? "" : undefined}>
            <input
              type="radio"
              name={`q${n}`}
              value={v}
              checked={value === v}
              onChange={() => set(v)}
            />
            <span>{v === "yes" ? "Yes" : "No"}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className={styles.fcard} data-qualify>
      <div className={styles.steps} aria-hidden="true">
        <i data-on="true" />
        <i data-on="true" />
      </div>
      <h1 className={styles.fcardTitle}>{qualify.title}</h1>
      <p className={styles.fcardSub}>{qualify.sub}</p>
      {question(1, qualify.q1, a1, setA1)}
      {question(2, qualify.q2, a2, setA2)}
      <button
        type="button"
        className={`${styles.cta} ${styles.block} ${styles.qNext}`}
        disabled={!a1 || !a2 || sending}
        onClick={next}
      >
        {sending ? "One moment…" : qualify.cta}{" "}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
