const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const report = { checks: [], violations: [], errors: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + ": " + JSON.stringify(detail));
  };
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    const r = await page.goto("http://127.0.0.1:3000", {
      waitUntil: "networkidle",
    });
    await page
      .locator(".preloader")
      .waitFor({ state: "hidden", timeout: 12000 });
    check("Homepage returns 200", r.status() === 200);
    check(
      "Hero, problem, company film, career paths, laptop earnings and testimonials",
      (await page.locator("main>section").count()) === 6 &&
        (await page
          .locator("#testimonials [data-testimonial-card]")
          .count()) === 4 &&
        (await page.locator("#who-we-are").count()) === 1 &&
        (await page.locator("#the-proof").count()) === 1 &&
        (await page.locator("#the-proof [data-proof-stat]").count()) === 4 &&
        (await page
          .locator("[data-proof-world], section#proof-band")
          .count()) === 0 &&
        (await page.locator("#the-problem article").count()) === 3 &&
        (await page.locator("#career-paths article").count()) === 2,
    );
    check(
      "No footer or unrequested homepage sections",
      (await page.locator("footer,.intro-section,.path-section").count()) === 0,
    );
    check("One H1", (await page.locator("h1").count()) === 1);
    check(
      "Original logo 240px minimum",
      (await page.locator("header .brand img").boundingBox()).width >= 240,
    );
    check(
      "No corrupted text",
      !(await page
        .locator("body")
        .innerText()
        .then((s) => /[Ãâ�]/.test(s))),
    );
    check(
      "Exact trust figures",
      JSON.stringify(await page.locator(".trust-card dd").allTextContents()) ===
        JSON.stringify(["100+", "46,000"]),
    );
    check(
      "Visible founder caption removed",
      (await page.locator(".founder-caption").count()) === 0,
    );
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
      await page
        .locator(".preloader")
        .waitFor({ state: "hidden", timeout: 11000 });
      const size = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      check("No overflow " + width, size.document <= size.viewport + 1, size);
      const a = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      report.violations.push(
        ...a.violations.map((v) => ({
          width,
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      check("H1 visible " + width, await page.locator("h1").isVisible());
    }
    await page.getByRole("button", { name: "About", exact: true }).click();
    check(
      "Founder menu works",
      await page.getByRole("link", { name: "Meet our founder" }).isVisible(),
    );
    await page.keyboard.press("Escape");
    check(
      "Escape returns focus",
      await page
        .getByRole("button", { name: "About", exact: true })
        .evaluate((e) => e === document.activeElement),
    );
    await page.getByRole("button", { name: "Training", exact: true }).click();
    const href = await page
      .getByRole("link", { name: "Appointment Setter", exact: true })
      .getAttribute("href");
    check(
      "Program enquiry has real destination",
      href.startsWith("https://wa.me/") &&
        decodeURIComponent(href).includes("Appointment Setter"),
    );
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 375, height: 900 });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("button", { name: "About", exact: true }).click();
    await page.getByRole("link", { name: "Meet our founder" }).click();
    check(
      "Mobile menu closes after anchor",
      await page.getByRole("button", { name: "Open navigation" }).isVisible(),
    );
    const nojs = await browser.newContext({
      viewport: { width: 375, height: 900 },
      javaScriptEnabled: false,
    });
    const np = await nojs.newPage();
    await np.goto("http://127.0.0.1:3000");
    check(
      "No-JavaScript hero remains visible",
      (await np.locator("h1").isVisible()) &&
        (await np.locator(".portrait-poster").isVisible()),
    );
    const rm = await browser.newContext({
      viewport: { width: 375, height: 900 },
      reducedMotion: "reduce",
    });
    const rp = await rm.newPage();
    await rp.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await rp.locator(".preloader").waitFor({ state: "hidden", timeout: 12000 });
    check(
      "Reduced motion static portrait",
      (await rp.locator(".hero-portrait canvas").count()) === 0,
    );
    check("No runtime errors", !report.errors.length, report.errors);
    check(
      "No automated accessibility violations",
      !report.violations.length,
      report.violations,
    );
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync("docs/hero-qa.json", JSON.stringify(report, null, 2));
    await browser.close();
    console.log(JSON.stringify(report, null, 2));
  }
})();
