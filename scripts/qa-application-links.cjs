const { chromium } = require("@playwright/test");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const form = (id) => `https://docs.google.com/forms/d/e/${id}/viewform`;

// Every open role on /jobs must open its own Google Form.
const roleForms = {
  // Sales
  "Onsite Sales Closer": form("1FAIpQLSeRjN3wxPGVbLnqgEMONaZL-ma5KxsyMo94R-CDkIBgwqXwDQ"),
  "Onsite Appointment Setter": form("1FAIpQLSfY-KNuiBVQWo5ZCGNvg4KFZWHLku8zcieyJnt6e7Eng_ppTw"),
  "Remote Sales Closer": form("1FAIpQLSf0Isf_bbOa6Tt0ntPcX9Pj_JrrX3QEZElx5e3VBjC9ExWokw"),
  "Remote Appointment Setter": form("1FAIpQLSchmjp3-kiZUvu0b2EotiH8nm8dqPnROuwN5qOzzGQXSERZQg"),
  // Media
  Copywriter: form("1FAIpQLScDn984Le0mqs0f85k9lWHrDf-d-LX1QIymSl2UWwsUaHdi7Q"),
  "Female Content Creator": form("1FAIpQLSdDVpEuKpmi9uK6kXjcJTy6m9tZQCSou7F0Rmu0rqt-ZNWVGg"),
  Videographer: form("1FAIpQLSflw_yogBZ6MEkWdxm1pa1K6VxzcwLJ45j6VJUzmdZ44WmmYg"),
  "Social Media Manager": form("1FAIpQLSeuxPB9mBX9zNFw6fuiIXLjAuihsxcZobbl9s4wZY2nCskpug"),
  "Content Strategist": form("1FAIpQLSdUFAAIPwvG7j14QfKm-TpJgNB8LMztGwU4BLoGClKz70AWiw"),
  "Video Editor": form("1FAIpQLScX3NJToMfQv6EyoCOk66sI28HTUb6QvutPiCA8oE-3tJq6XA"),
  "Graphic Designer": form("1FAIpQLSe14Xwb1z8tnTndJyZTciag5LH3hb62sfWvqRx2d4yJYKg55g"),
  // Operations
  "CRM + AI Expert": form("1FAIpQLSeOAAoRFKj_6RBcBPXGpfp-BDYTLlFsMU3ObDKrd7gHKG6NKA"),
  "IT Support Executive": form("1FAIpQLSf0CMB7ZvQDU3lw2lBvSIiIGo7MurSQIUMPZ5HBa0Kopvt16Q"),
  "Onsite HR Recruiter": form("1FAIpQLSceGHzscBn9jUPZfqUblDuJcj_-eYiQ3YHvqYOb0KB_63AK8Q"),
  "Full-Stack Marketer": form("1FAIpQLSe_h1qtsFv5QYd7LmhCXx6oPqEb_kYc2wOXOGBbmuIb3jwqmw"),
  "Remote HR Recruiter": form("1FAIpQLSdJldcrw82OMMKrian_-QQf5Bn2nlGVDxrlHiyC-pMGUTo5BA"),
};
const virtualAssistantForm = form(
  "1FAIpQLSczW0ij76HC5QlBHH6p-8l1Zc23n6Z5Fn7FTwyAuRYkNIrNuQ",
);
const retiredSharedForms = [
  "1FAIpQLSdnu6NQ0gvWKLKgGrS1zUbi_GKyWCLSn35ATJchiUszKiVBEg", // old shared Media form
  "1FAIpQLScvwNjI0FKQAH2pdhy5-Ig6Gob9NHxEBX-QfGa39PNaiinffA", // old shared Operations form
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
          throw new Error(`${width}px ${route}: retired shared Media/Operations form`);
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
