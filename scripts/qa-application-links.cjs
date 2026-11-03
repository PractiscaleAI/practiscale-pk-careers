const { chromium } = require("@playwright/test");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const form =
  "https://docs.google.com/forms/d/e/1FAIpQLSeVnz71TpOc4h6MiOE7gRY6_cCfJdHCkNZmzj22PCh1d20f5w/viewform?usp=header";
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

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  let checks = 0;
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
        const links = await page.locator("a[href]").evaluateAll((anchors) =>
          anchors.map((anchor) => ({
            href: anchor.href,
            label: anchor.textContent.replace(/\s+/g, " ").trim(),
          })),
        );
        if (links.some(({ href }) => href.includes("wa.me/"))) {
          throw new Error(`${width}px ${route}: old WhatsApp application link`);
        }
        const applicationLinks = links.filter(({ href }) => href === form);
        if (!applicationLinks.length) {
          throw new Error(`${width}px ${route}: application form link missing`);
        }
        if (
          route === "/" &&
          !applicationLinks.some(({ label }) => label === "Apply Now")
        ) {
          throw new Error(
            `${width}px homepage: primary Apply Now label missing`,
          );
        }
        if (
          route === "/jobs" &&
          !applicationLinks.some(({ label }) =>
            label.toLowerCase().includes("this role"),
          )
        ) {
          throw new Error(`${width}px jobs: role application link missing`);
        }
        checks += 1;
        await page.close();
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`${checks} route and viewport application-link checks passed`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
