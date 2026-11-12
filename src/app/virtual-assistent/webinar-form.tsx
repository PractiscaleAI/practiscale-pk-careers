"use client";

import { useState, type FormEvent } from "react";
import { webinar } from "@/config/webinar";
import styles from "./webinar.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";

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
        }),
      });
      if (!response.ok)
        throw new Error(`Registration failed: ${response.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("We couldn't confirm your registration. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.formSuccess} role="status">
        <h3>You&apos;re in.</h3>
        {webinar.WHATSAPP_GROUP_URL ? (
          <>
            <p>Join the webinar WhatsApp group for your link and reminders.</p>
            <a
              className={styles.reserveLink}
              href={webinar.WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the WhatsApp group <span aria-hidden="true">↗</span>
            </a>
          </>
        ) : (
          <p>
            Your registration was received. Joining instructions will be shared
            once confirmed.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formHeader}>Your details</h3>
      <div className={styles.field}>
        <label htmlFor="webinar-name">
          Full name <span>*</span>
        </label>
        <input
          id="webinar-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={!webinar.FORM_ENDPOINT}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="webinar-whatsapp">
          WhatsApp number <span>*</span>
        </label>
        <input
          id="webinar-whatsapp"
          name="whatsapp"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="03XX XXXXXXX"
          required
          disabled={!webinar.FORM_ENDPOINT}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="webinar-email">
          Email <span>*</span>
        </label>
        <input
          id="webinar-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!webinar.FORM_ENDPOINT}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="webinar-city">
          City <small>Optional</small>
        </label>
        <input
          id="webinar-city"
          name="city"
          type="text"
          autoComplete="address-level2"
          disabled={!webinar.FORM_ENDPOINT}
        />
      </div>
      <label className={styles.checkbox}>
        <input
          name="requirements"
          type="checkbox"
          required
          disabled={!webinar.FORM_ENDPOINT}
        />
        <span>
          I meet the requirements listed above, including the 6 PM–3 AM hours
          and the unpaid first month.
        </span>
      </label>
      <button
        className={styles.submit}
        type="submit"
        disabled={!webinar.FORM_ENDPOINT || status === "sending"}
      >
        {status === "sending" ? "Reserving your seat…" : "Reserve my free seat"}
        <span aria-hidden="true">↗</span>
      </button>
      {!webinar.FORM_ENDPOINT && (
        <p className={styles.formNotice} role="status">
          Registration is not open yet. We&apos;ll add the confirmed date, time
          and registration destination here.
        </p>
      )}
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      {webinar.FORM_ENDPOINT && (
        <p className={styles.formFootnote}>
          Your details will only be used for this webinar and its follow-up.
        </p>
      )}
    </form>
  );
}
