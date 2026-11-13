/**
 * Webinar registration → GoHighLevel inbound webhook.
 *
 * The /virtual-assistent form posts here (same origin), and this handler
 * validates the submission and forwards it to the GHL workflow's inbound
 * webhook. Keeping the webhook server-side means its URL never reaches the
 * browser and the browser never makes a cross-site request.
 *
 * Configure with the GHL_WEBINAR_WEBHOOK_URL environment variable (Vercel
 * project settings, or the Docker/compose environment). Without it the
 * handler answers 503 and the form shows its retry message.
 */

type Body = {
  name?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  city?: unknown;
  meetsRequirements?: unknown;
  website?: unknown; // honeypot: real visitors never fill it
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** 03XXXXXXXXX / 923XXXXXXXXX / +923XXXXXXXXX / 00923XXXXXXXXX → +923XXXXXXXXX */
function pakistaniMobile(raw: string): string | null {
  const digits = raw.replace(/[\s()-]/g, "");
  const m = digits.match(/^(?:\+92|0092|92|0)(3\d{9})$/);
  return m ? `+92${m[1]}` : null;
}

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const webhook = process.env.GHL_WEBINAR_WEBHOOK_URL;
  if (!webhook) return json(503, { ok: false, error: "Registration is not configured." });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(400, { ok: false, error: "Invalid request." });
  }

  // Bots that fill every field get a quiet success and nothing is sent.
  if (str(body.website, 200)) return json(200, { ok: true });

  const name = str(body.name, 120).replace(/\s+/g, " ");
  const email = str(body.email, 200).toLowerCase();
  const city = str(body.city, 80);
  const phone = pakistaniMobile(str(body.whatsapp, 30));
  const meetsRequirements = body.meetsRequirements === true;

  const invalid: string[] = [];
  if (name.length < 2) invalid.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) invalid.push("email");
  if (!phone) invalid.push("whatsapp");
  if (!meetsRequirements) invalid.push("requirements");
  if (invalid.length) return json(422, { ok: false, error: "Please check your details.", fields: invalid });

  const [firstName, ...rest] = name.split(/\s+/);
  // Flat keys, so every value is selectable in the GHL workflow's
  // "Create/Update Contact" mapping.
  const payload = {
    first_name: firstName,
    last_name: rest.join(" "),
    full_name: name,
    email,
    phone,
    whatsapp: phone,
    city,
    meets_requirements: meetsRequirements ? "yes" : "no",
    source: "VA webinar landing page",
    page_url: request.headers.get("referer") ?? "",
    submitted_at: new Date().toISOString(),
  };

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
      return json(502, { ok: false, error: "We couldn't confirm your registration." });
    }
  } catch (error) {
    console.error("GHL webhook request failed", error);
    return json(502, { ok: false, error: "We couldn't confirm your registration." });
  }

  return json(200, { ok: true });
}
