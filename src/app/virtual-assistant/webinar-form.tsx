"use client";

import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { webinar } from "@/config/webinar";
import { JumpLink } from "./chrome";
import { contact } from "./content";
import styles from "./webinar.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";

const steps = ["Register here", "Get the link on WhatsApp", "Join live and ask questions"];

/**
 * The action side of the registration pass. Three states:
 * - closed (no form endpoint yet): an honest "opening soon" panel with
 *   things to do now, never a greyed-out form;
 * - open: the form;
 * - sent: confirmation, plus the WhatsApp group link when there is one.
 */
export default function WebinarForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!webinar.FORM_ENDPOINT || status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const whatsapp = String(data.get("whatsapp") ?? "").replace(/[\s()-]/g, "");
    if (!/^(?:\+92|0092|0)3\d{9}$/.test(whatsapp)) {
      setError("Enter a Pakistani mobile number, for example 03XX XXXXXXX.");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const response = await fetch(webinar.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          whatsapp,
          email: String(data.get("email") ?? "").trim(),
          city: String(data.get("city") ?? "").trim(),
          meetsRequirements: data.get("requirements") === "on",
          website: String(data.get("website") ?? ""),
        }),
      });
      if (response.status === 422) {
        setStatus("error");
        setError("Please check your name, WhatsApp number and email, then try again.");
        return;
      }
      if (!response.ok) throw new Error(`Registration failed: ${response.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
      setError(`We couldn't confirm your registration. Please try again, or email ${contact.email}.`);
    }
  }

  if (!webinar.FORM_ENDPOINT) {
    return (
      <div className={styles.regSoon} data-reg-state="soon">
        <span className={styles.passTag}>Opening soon</span>
        <h3>Seats open when the date is announced.</h3>
        <p>
          We&apos;re confirming the date now. Until then, watch the video to see the work, and
          email us if you have a question.
        </p>
        <div className={styles.regSoonActions}>
          <JumpLink className={styles.regButton} href="#watch">
            <span aria-hidden="true">▶</span> Watch the video
          </JumpLink>
          <a className={styles.regGhost} href={`mailto:${contact.email}`}>
            Ask a question
          </a>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={styles.regSuccess} role="status" data-reg-state="sent">
        <span className={styles.passTag}>Seat reserved</span>
        <h3>You&apos;re in.</h3>
        {webinar.WHATSAPP_GROUP_URL ? (
          <>
            <p>Join the webinar WhatsApp group for your link and reminders.</p>
            <a
              className={styles.regButton}
              href={webinar.WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the WhatsApp group <span aria-hidden="true">↗</span>
            </a>
          </>
        ) : (
          <p>We&apos;ll send the webinar link and reminders on WhatsApp.</p>
        )}
      </div>
    );
  }

  return (
    <div data-reg-state="open">
      <h3 className={styles.regTitle}>Your details</h3>
      <p className={styles.regSub}>Takes under a minute. We&apos;ll send the link on WhatsApp.</p>
      <form className={styles.regForm} onSubmit={handleSubmit}>
        <div className={styles.regField}>
          <label htmlFor="webinar-name">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input id="webinar-name" name="name" type="text" autoComplete="name" required />
        </div>
        <div className={styles.regField}>
          <label htmlFor="webinar-whatsapp">
            WhatsApp number <span aria-hidden="true">*</span>
          </label>
          <input
            id="webinar-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="03XX XXXXXXX"
            required
          />
        </div>
        <div className={styles.regField}>
          <label htmlFor="webinar-email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="webinar-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className={styles.regField}>
          <label htmlFor="webinar-city">
            City <small>Optional</small>
          </label>
          <input id="webinar-city" name="city" type="text" autoComplete="address-level2" />
        </div>
        {/* Spam trap: hidden from people and assistive tech, filled by bots. */}
        <div className={styles.regTrap} aria-hidden="true">
          <label htmlFor="webinar-website">Website</label>
          <input id="webinar-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <label className={styles.regCheck}>
          <input name="requirements" type="checkbox" required />
          <span>
            I can work 6 PM–3 AM after training, and I understand the first training month is
            unpaid.
          </span>
        </label>
        <button className={styles.regSubmit} type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Reserving your seat…" : "Reserve my free seat"}
          <span aria-hidden="true">↗</span>
        </button>
        {error && (
          <p className={styles.regError} role="alert">
            {error}
          </p>
        )}
        <p className={styles.regSafe}>
          <Lock aria-hidden="true" size={13} strokeWidth={2.2} /> Used only for this webinar and
          its follow-up.
        </p>
      </form>
      <ol className={styles.regSteps}>
        {steps.map((step, i) => (
          <li key={step}>
            <b>0{i + 1}</b>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
