import { webinar } from "@/config/webinar";

/**
 * The visitor's details from the register popup, kept for the next step in
 * this tab only (sessionStorage), so the qualification answers can be sent to
 * GHL against the same contact. Never put these details in a URL.
 */
const KEY = "va-webinar-lead";

export type Lead = { name: string; email: string; phone: string };

export function saveLead(lead: Lead) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(lead));
  } catch {
    /* storage blocked: the next step falls back to the popup */
  }
}

export function loadLead(): Lead | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Lead) : null;
  } catch {
    return null;
  }
}

/** 03XX…, 3XX…, 923XX…, +923XX… → +923XXXXXXXXX, or null. */
export function pakistaniMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const m = digits.match(/^(?:0092|92|0)?(3\d{9})$/);
  return m ? `+92${m[1]}` : null;
}

export function postRegistration(
  body: Record<string, unknown>,
  timeoutMs = 10_000,
) {
  return fetch(webinar.FORM_ENDPOINT ?? "/api/webinar-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
}
