const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output =
  process.env.QA_ARTIFACTS_DIR ||
  path.join(os.tmpdir(), "practiscale-interior-qa");
const routes = [
  "/about/our-story",
  "/about/how-we-work",
  "/about/why-practiscale",
  "/training-programs/appointment-setter",
  "/training-programs/virtual-assistant",
  "/jobs",
  "/who-we-serve",
];
const sizes = [
  { width: 1440, height: 900, name: "desktop" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 390, height: 844, name: "phone" },
  { width: 320, height: 640, name: "small-phone" },
];

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader"],
  });
  const report = { checks: [], errors: [], violations: [] };
  const check = (name, pass, details) => {
    report.checks.push({ name, pass, details });
    if (!pass) process.exitCode = 1;
  };
  try {
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        report.errors.push({ route: page.url(), message: error.message }),
      );
      for (const route of routes) {
        const response = await page.goto(base + route, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.evaluate(() => document.fonts.ready);
        const state = await page.evaluate(() => {
          const heading = document.querySelector("main h1");
          const header = document.querySelector("header.site-header");
          const h = heading?.getBoundingClientRect();
          const nav = header?.getBoundingClientRect();
          return {
            h1Count: document.querySelectorAll("main h1").length,
            mainCount: document.querySelectorAll("main#main").length,
            footerCount: document.querySelectorAll("footer#site-footer").length,
            viewportWidth: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            headingTop: h?.top,
            headingBottom: h?.bottom,
            headerBottom: nav?.bottom,
            font: heading ? getComputedStyle(heading).fontFamily : "",
            emptyLinks: document.querySelectorAll('main a[href="#"]').length,
            preloaderCount: document.querySelectorAll(".preloader").length,
          };
        });
        const key = `${size.name} ${route}`;
        check(
          `${key}: page renders`,
          response?.status() === 200 &&
            state.mainCount === 1 &&
            state.h1Count === 1 &&
            state.footerCount === 1,
          state,
        );
        check(
          `${key}: no horizontal overflow`,
          state.documentWidth <= state.viewportWidth + 1,
          state,
        );
        check(
          `${key}: heading clears header`,
          state.headingTop >= state.headerBottom - 3 &&
            state.headingBottom <= size.height + 200,
          state,
        );
        check(
          `${key}: design type and working links`,
          state.font.includes("Sora") && state.emptyLinks === 0,
          state,
        );
        check(
          `${key}: no intro on direct visit`,
          state.preloaderCount === 0,
          state,
        );
        if (size.name === "desktop" || size.name === "phone") {
          const name = route.split("/").filter(Boolean).join("-");
          await page.screenshot({
            path: path.join(output, `${size.name}-${name}.png`),
          });
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          for (const violation of axe.violations) {
            report.violations.push({
              key,
              id: violation.id,
              impact: violation.impact,
              targets: violation.nodes.map((node) => node.target),
            });
          }
        }
      }
      await context.close();
    }
    check("No runtime errors", report.errors.length === 0, report.errors);
    check(
      "No accessibility violations",
      report.violations.length === 0,
      report.violations,
    );
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      path.join(output, "report.json"),
      JSON.stringify(report, null, 2),
    );
    await browser.close();
    console.log(
      JSON.stringify(
        {
          total: report.checks.length,
          failed: report.checks.filter((item) => !item.pass),
          errors: report.errors,
          violations: report.violations,
          failure: report.failure,
          output,
        },
        null,
        2,
      ),
    );
  }
})();
