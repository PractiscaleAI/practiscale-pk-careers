"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { contact, popup, routes } from "./content";
import styles from "./funnel.module.css";
import { pakistaniMobile, postRegistration, saveLead } from "./lead";

const OpenRegister = createContext<() => void>(() => {});

/**
 * Owns the register popup for the landing page. Every "register" button opens
 * the same native <dialog> (focus is trapped, Esc closes it). Visiting with
 * ?register opens it straight away — used when a later step needs the
 * visitor's details again.
 */
export function RegisterProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("register")) open();
  }, [open]);

  return (
    <OpenRegister.Provider value={open}>
      {children}
      <RegisterDialog dialogRef={ref} />
    </OpenRegister.Provider>
  );
}

export function RegisterButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const open = useContext(OpenRegister);
  return (
    <button
      type="button"
      className={className ?? styles.cta}
      onClick={open}
      aria-haspopup="dialog"
      data-register
    >
      {children}
    </button>
  );
}

function RegisterDialog({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "")
      .trim()
      .replace(/\s+/g, " ");
    const email = String(data.get("email") ?? "").trim();
    const phone = pakistaniMobile(String(data.get("whatsapp") ?? ""));
    if (!phone) {
      setError("Enter your WhatsApp number, for example 300 1234567.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const response = await postRegistration({
        stage: "lead",
        name,
        email,
        whatsapp: phone,
        website: String(data.get("website") ?? ""),
      });
      if (response.status === 422) {
        setError("Please check your name, WhatsApp number and email.");
        setSending(false);
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      saveLead({ name, email, phone });
      router.push(routes.qualify);
    } catch {
      setError(
        `We couldn't save your details. Please try again, or email ${contact.email}.`,
      );
      setSending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="register-title"
      onClick={(e) => {
        // A click on the backdrop (outside the form) closes the popup.
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <form className={styles.sheet} onSubmit={submit} noValidate={false}>
        <button
          type="button"
          className={styles.close}
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
        <div className={styles.steps} aria-hidden="true">
          <i data-on="true" />
          <i />
        </div>
        <h2 id="register-title" className={styles.sheetTitle}>
          {popup.title}
        </h2>
        <p className={styles.sheetSub}>{popup.step}</p>

        <div className={styles.field}>
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            name="name"
            autoComplete="name"
            placeholder="e.g. Ayesha Khan"
            required
            minLength={2}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="reg-whatsapp">WhatsApp number</label>
          <div className={styles.phone}>
            <span aria-hidden="true">+92</span>
            <input
              id="reg-whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="300 1234567"
              aria-describedby={error ? "reg-error" : undefined}
              required
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="reg-email">Email address</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        {/* Spam trap: hidden from people and assistive tech, filled by bots. */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="reg-website">Website</label>
          <input
            id="reg-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {error && (
          <p id="reg-error" className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <button
          className={`${styles.cta} ${styles.block}`}
          type="submit"
          disabled={sending}
        >
          {sending ? "Saving…" : popup.cta} <span aria-hidden="true">→</span>
        </button>
        <p className={styles.privacy}>
          <span aria-hidden="true">🔒 </span>
          {popup.privacy}
        </p>
      </form>
    </dialog>
  );
}
