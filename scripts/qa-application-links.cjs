const { chromium } = require("@playwright/test");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const form = (id) => `https://link.practiscale.com/widget/form/${id}`;

// Every open role on /jobs must open its own GoHighLevel form.
const roleForms = {
  // Sales
  "Onsite Sales Closer": form("qcTlIJxYxseCnhUMOBRz"),
  "Onsite Appointment Setter": form("zOeM1tmNGSXwetp6TDGt"),
  "Remote Sales Closer": form("pqlrMGAIxi2KigEb1W6U"),
  "Remote Appointment Setter": form("l3FoIaB404B7qj6XCEOb"),
  // Media
  Copywriter: form("HOn9HxuaPh5VeYdPfin9"),
  "Female Content Creator": form("NgyiB7wjWpg5riVQR2RH"),
  Videographer: form("Fj8smXEkpXITBjqUFMic"),
  "Social Media Manager": form("scLU16aQTGYeucjlXVMl"),
  "Content Strategist": form("4oEBlDAILk3koAuBC9Oa"),
  "Video Editor": form("XJTs4cAm3Y2SAmWIdBdZ"),
  "Graphic Designer": form("ZPpdG3v40ATs8Rp9QyQG"),
  // Operations
  "CRM + AI Expert": form("gyRcZNfwsc6CngDNgdlo"),
  "IT Support Executive": form("ClQMrqX7MKVBry6lU5hA"),
  "Onsite HR Recruiter": form("6t4u871kWCADUWWT6ajv"),
  "Full-Stack Marketer": form("9SnH0FvJOQ6D1lYfgZ7b"),
  "Remote HR Recruiter": form("l9F8gBTOMDWzSeDOPVYR"),
};
const virtualAssistantForm = form("neakhQd3mrDkmjEMjimG");
// Google Forms that the roles and the VA program used before GoHighLevel.
const retiredSharedForms = [
  "1FAIpQLSdnu6NQ0gvWKLKgGrS1zUbi_GKyWCLSn35ATJchiUszKiVBEg", // old shared Media form
  "1FAIpQLScvwNjI0FKQAH2pdhy5-Ig6Gob9NHxEBX-QfGa39PNaiinffA", // old shared Operations form
  "1FAIpQLSeRjN3wxPGVbLnqgEMONaZL-ma5KxsyMo94R-CDkIBgwqXwDQ",
  "1FAIpQLSf0Isf_bbOa6Tt0ntPcX9Pj_JrrX3QEZElx5e3VBjC9ExWokw",
  "1FAIpQLSchmjp3-kiZUvu0b2EotiH8nm8dqPnROuwN5qOzzGQXSERZQg",
  "1FAIpQLScDn984Le0mqs0f85k9lWHrDf-d-LX1QIymSl2UWwsUaHdi7Q",
  "1FAIpQLSdDVpEuKpmi9uK6kXjcJTy6m9tZQCSou7F0Rmu0rqt-ZNWVGg",
  "1FAIpQLSflw_yogBZ6MEkWdxm1pa1K6VxzcwLJ45j6VJUzmdZ44WmmYg",
  "1FAIpQLSeuxPB9mBX9zNFw6fuiIXLjAuihsxcZobbl9s4wZY2nCskpug",
  "1FAIpQLSdUFAAIPwvG7j14QfKm-TpJgNB8LMztGwU4BLoGClKz70AWiw",
  "1FAIpQLScX3NJToMfQv6EyoCOk66sI28HTUb6QvutPiCA8oE-3tJq6XA",
  "1FAIpQLSe14Xwb1z8tnTndJyZTciag5LH3hb62sfWvqRx2d4yJYKg55g",
  "1FAIpQLSeOAAoRFKj_6RBcBPXGpfp-BDYTLlFsMU3ObDKrd7gHKG6NKA",
  "1FAIpQLSf0CMB7ZvQDU3lw2lBvSIiIGo7MurSQIUMPZ5HBa0Kopvt16Q",
  "1FAIpQLSceGHzscBn9jUPZfqUblDuJcj_-eYiQ3YHvqYOb0KB_63AK8Q",
  "1FAIpQLSe_h1qtsFv5QYd7LmhCXx6oPqEb_kYc2wOXOGBbmuIb3jwqmw",
  "1FAIpQLSdJldcrw82OMMKrian_-QQf5Bn2nlGVDxrlHiyC-pMGUTo5BA",
  "1FAIpQLSczW0ij76HC5QlBHH6p-8l1Zc23n6Z5Fn7FTwyAuRYkNIrNuQ", // old VA program form
];
const routes = [
  "/",
  "/jobs",
  "/training-programs/appointment-setter",
  "/training-programs/virtual-assistant",
  "/about/our-story",
  "/about/how-we-work",
  "/about/why-practiscale",
  "/who-we-serve",
];

async function collectLinks(page) {
  return page.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.href,
      aria: anchor.getAttribute("aria-label") || "",
      label: anchor.textContent.replace(/\s+/g, " ").trim(),
    })),
  );
}

async function checkJobs(page, width) {
  const showMore = page.locator("button", { hasText: /^Show \d+ more roles?$/ });
  await page.locator('a[aria-label^="Apply now for "]').first().waitFor();
  while (await showMore.count()) {
    await showMore.first().click();
  }
  const applyLinks = (await collectLinks(page))
    .filter(({ aria }) => aria.startsWith("Apply now for "))
    .map(({ aria, href }) => ({ title: aria.slice("Apply now for ".length), href }));

  const titles = applyLinks.map(({ title }) => title);
  const expected = Object.keys(roleForms);
  const missing = expected.filter((title) => !titles.includes(title));
  const extra = titles.filter((title) => !expected.includes(title));
  if (missing.length || extra.length) {
    throw new Error(
      `${width}px jobs: role mismatch. Missing: ${missing.join(", ") || "none"}. Unexpected: ${extra.join(", ") || "none"}`,
    );
  }
  for (const { title, href } of applyLinks) {
    if (href !== roleForms[title]) {
      throw new Error(`${width}px jobs: "${title}" links to ${href}, expected ${roleForms[title]}`);
    }
  }
  const unique = new Set(applyLinks.map(({ href }) => href));
  if (unique.size !== applyLinks.length) {
    throw new Error(`${width}px jobs: two roles share one application form`);
  }
  return applyLinks.length;
}

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  let checks = 0;
  let roleChecks = 0;
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      for (const route of routes) {
        const page = await context.newPage();
        const response = await page.goto(new URL(route, base).href, {
          waitUntil: "domcontentloaded",
        });
        if (response.status() !== 200) {
          throw new Error(`${width}px ${route}: HTTP ${response.status()}`);
        }
        const links = await collectLinks(page);
        if (links.some(({ href }) => href.includes("wa.me/"))) {
          throw new Error(`${width}px ${route}: old WhatsApp application link`);
        }
        if (links.some(({ href }) => retiredSharedForms.some((id) => href.includes(id)))) {
          throw new Error(`${width}px ${route}: retired Google Form for a role or the VA program`);
        }
        if (route === "/jobs") roleChecks += await checkJobs(page, width);
        if (
          route === "/training-programs/virtual-assistant" &&
          !links.some(({ href }) => href === virtualAssistantForm)
        ) {
          throw new Error(`${width}px virtual assistant: program form link missing`);
        }
        checks += 1;
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(
    `${checks} route and viewport checks passed; ${roleChecks} per-role application links verified`,
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
