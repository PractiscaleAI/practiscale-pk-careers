/**
 * VA webinar funnel → GoHighLevel inbound webhook.
 *
 * The /virtual-assistant funnel posts here twice (same origin):
 *   1. stage "lead"           name, WhatsApp, email from the register popup
 *   2. stage "qualification"  the two yes/no answers, for the same contact
 * Each is validated and forwarded to the GHL workflow's inbound webhook, so
 * the contact exists even if the visitor drops off before step 2. Keeping the
 * webhook server-side means its URL never reaches the browser.
 *
 * Configure with the GHL_WEBINAR_WEBHOOK_URL environment variable (Vercel
 * project settings, or the Docker/compose environment). Without it the
 * handler answers 503 and the popup shows its retry message.
 */

type Body = {
  stage?: unknown;
  name?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  isWoman?: unknown;
  hasLaptop?: unknown;
  website?: unknown; // honeypot: real visitors never fill it
};

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** 03XXXXXXXXX / 3XXXXXXXXX / 923XXXXXXXXX / +923XXXXXXXXX / 00923… → +923XXXXXXXXX */
function pakistaniMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const m = digits.match(/^(?:0092|92|0)?(3\d{9})$/);
  return m ? `+92${m[1]}` : null;
}

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const yesNo = (v: boolean) => (v ? "yes" : "no");

export async function POST(request: Request) {
  const webhook = process.env.GHL_WEBINAR_WEBHOOK_URL;
  if (!webhook)
    return json(503, { ok: false, error: "Registration is not configured." });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(400, { ok: false, error: "Invalid request." });
  }

  // Bots that fill every field get a quiet success and nothing is sent.
  if (str(body.website, 200)) return json(200, { ok: true });

  const stage = body.stage === "qualification" ? "qualification" : "lead";
  const name = str(body.name, 120).replace(/\s+/g, " ");
  const email = str(body.email, 200).toLowerCase();
  const phone = pakistaniMobile(str(body.whatsapp, 30));

  const invalid: string[] = [];
  if (name.length < 2) invalid.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) invalid.push("email");
  if (!phone) invalid.push("whatsapp");
  if (
    stage === "qualification" &&
    (typeof body.isWoman !== "boolean" || typeof body.hasLaptop !== "boolean")
  )
    invalid.push("answers");
  if (invalid.length)
    return json(422, {
      ok: false,
      error: "Please check your details.",
      fields: invalid,
    });

  const [firstName, ...rest] = name.split(" ");
  // Flat keys, so every value is selectable in the GHL workflow's
  // "Create/Update Contact" mapping. Email and phone identify the contact
  // across both stages.
  const payload: Record<string, string> = {
    stage,
    first_name: firstName,
    last_name: rest.join(" "),
    full_name: name,
    email,
    phone: phone!,
    whatsapp: phone!,
    source: "VA webinar landing page",
    page_url: request.headers.get("referer") ?? "",
    submitted_at: new Date().toISOString(),
  };
  if (stage === "lead") {
    payload.tag = "va-webinar-lead";
  } else {
    const qualified = body.isWoman === true && body.hasLaptop === true;
    payload.is_woman = yesNo(body.isWoman === true);
    payload.has_laptop_and_internet = yesNo(body.hasLaptop === true);
    payload.qualified = yesNo(qualified);
    payload.tag = qualified
      ? "va-webinar-qualified"
      : "va-webinar-not-eligible";
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`GHL webhook responded ${response.status}`);
      return json(502, { ok: false, error: "We couldn't save your details." });
    }
  } catch (error) {
    console.error("GHL webhook request failed", error);
    return json(502, { ok: false, error: "We couldn't save your details." });
  }

  return json(200, { ok: true });
}
