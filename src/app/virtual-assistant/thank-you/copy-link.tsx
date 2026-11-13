"use client";

import { useState } from "react";
import styles from "../funnel.module.css";

export default function CopyLink({
  link,
  label,
}: {
  link: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.copy}>
      <p id="wa-link-label">{label}</p>
      <div>
        <input
          readOnly
          value={link}
          aria-labelledby="wa-link-label"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard blocked: the field is selectable */
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <span className={styles.srOnly} role="status">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
