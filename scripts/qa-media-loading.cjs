const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");
const out = path.join(__dirname, "../docs/qa/performance/v052");
const report = { checks: [], errors: [] };
function check(name, pass, data) {
  report.checks.push({ name, pass: !!pass, data });
  if (!pass) console.log("FAIL " + name + " " + JSON.stringify(data));
}
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      }),
      page = await context.newPage(),
      requests = [];
    page.on("pageerror", (e) => report.errors.push(String(e)));
    page.on("request", (r) => {
      if (/ceo-prime-v1\/desktop\//.test(r.url())) requests.push(r.url());
    });
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "domcontentloaded",
    });
    await dismissIntroduction(page);
    await page.waitForFunction(
      () => document.querySelector(".hero-portrait").dataset.ready === "true",
    );
    await page.waitForTimeout(3500);
    check(
      "Idle hero does not download the entire sequence",
      requests.length > 0 && requests.length <= 17,
      { requests: requests.length },
    );
    const frame = () =>
      page.locator(".hero-portrait").getAttribute("data-frame");
    const seek = async (p) => {
      await page.evaluate((p) => {
        const hero = document.querySelector(".hero-scroll");
        scrollTo({
          top:
            hero.getBoundingClientRect().top +
            scrollY +
            (hero.offsetHeight - innerHeight) * p,
          behavior: "instant",
        });
      }, p);
    };
    await seek(0.99);
    await page.waitForFunction(
      () => document.querySelector(".hero-portrait").dataset.frame === "119",
      null,
      { timeout: 12000 },
    );
    check(
      "A distant scroll still reaches the original final frame",
      (await frame()) === "119",
    );
    await seek(0);
    await page.waitForFunction(
      () => document.querySelector(".hero-portrait").dataset.frame === "0",
      null,
      { timeout: 12000 },
    );
    check(
      "Reverse scroll reloads the original first frame",
      (await frame()) === "0",
    );
    await page.evaluate(() => {
      const hero = document.querySelector(".hero-scroll");
      scrollTo({
        top:
          hero.getBoundingClientRect().top + scrollY + hero.offsetHeight + 300,
        behavior: "instant",
      });
    });
    await page.waitForTimeout(1200);
    const before = requests.length;
    await page.waitForTimeout(1800);
    check(
      "Offscreen hero stops speculative requests",
      requests.length === before,
      { before, after: requests.length },
    );
    const source = await context.request.get(
      "http://127.0.0.1:3000/media/hero-manifest.json",
    );
    const manifest = await source.json();
    check(
      "All 120 native frames remain declared at both resolutions",
      manifest.desktop.length === 120 && manifest.mobile.length === 120,
    );
    const immutable = await context.request.head(
      "http://127.0.0.1:3000" + manifest.desktop[0],
    );
    check(
      "Versioned frames are reusable from browser cache",
      /max-age=31536000/.test(immutable.headers()["cache-control"]) &&
        /immutable/.test(immutable.headers()["cache-control"]),
      immutable.headers()["cache-control"],
    );
    check(
      "Mutable frame manifest is not immutable",
      !source.headers()["cache-control"]?.includes("immutable"),
      source.headers()["cache-control"],
    );
    const video = await context.request.get(
      "http://127.0.0.1:3000/media/who-we-are/office-scroll-v2.mp4",
      { headers: { Range: "bytes=0-4095" } },
    );
    check(
      "Smaller film retains byte-range seeking",
      video.status() === 206 &&
        (await video.body()).length === 4096 &&
        video.headers()["content-range"] === "bytes 0-4095/22092382",
      video.headers(),
    );
    check(
      "New versioned film is cacheable",
      video.headers()["cache-control"]?.includes("immutable"),
      video.headers()["cache-control"],
    );
    await context.close();
  } catch (e) {
    report.fatal = String(e);
    console.error(e);
  } finally {
    await browser.close();
    await fs.mkdir(out, { recursive: true });
    await fs.writeFile(
      path.join(out, "loading-regression.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify({
        checks: report.checks.length,
        failed: report.checks.filter((c) => !c.pass).length,
        errors: report.errors.length,
        fatal: report.fatal,
      }),
    );
  }
  if (
    report.fatal ||
    report.errors.length ||
    report.checks.some((c) => !c.pass)
  )
    process.exitCode = 1;
})();
