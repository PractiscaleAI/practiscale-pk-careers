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

/**
 * Where the visitor came from, for GHL reporting: the ad/post tags in the
 * landing URL (utm_*, plus Meta's fbclid and Google's gclid), the external
 * referrer and the landing URL. Kept in localStorage for 30 days, so a woman
 * who clicks an ad and registers on a later visit is still credited to it. A
 * later tagged visit replaces the stored one; an untagged visit never does.
 */
const ATTRIBUTION_KEY = "va-webinar-attribution";
const ATTRIBUTION_TTL = 30 * 24 * 60 * 60 * 1000;
const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export type Attribution = Partial<
  Record<(typeof TRACKED_PARAMS)[number] | "referrer" | "landing_page", string>
>;

export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tags: Attribution = {};
    for (const key of TRACKED_PARAMS) {
      const value = params.get(key)?.trim();
      if (value) tags[key] = value.slice(0, 300);
    }
    const hasTags = Object.keys(tags).length > 0;
    if (!hasTags && loadAttribution()) return; // keep the ad that brought her

    const referrer = document.referrer;
    const external =
      referrer && new URL(referrer).origin !== window.location.origin;
    localStorage.setItem(
      ATTRIBUTION_KEY,
      JSON.stringify({
        ...tags,
        referrer: external ? referrer.slice(0, 500) : "",
        landing_page: (window.location.pathname + window.location.search).slice(
          0,
          500,
        ),
        savedAt: Date.now(),
      }),
    );
  } catch {
    /* storage blocked or malformed referrer: send without attribution */
  }
}

export function loadAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const { savedAt, ...attribution } = JSON.parse(raw) as Attribution & {
      savedAt?: number;
    };
    if (!savedAt || Date.now() - savedAt > ATTRIBUTION_TTL) return null;
    return attribution;
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
    // Both stages carry the attribution, so GHL has it whichever call it keeps.
    body: JSON.stringify({ ...body, attribution: loadAttribution() ?? {} }),
    signal: AbortSignal.timeout(timeoutMs),
  });
}
