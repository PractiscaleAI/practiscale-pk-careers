const { dismissIntroduction } = require("./qa-helpers.cjs");
const { chromium } = require("@playwright/test");
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
  const report = { checks: [], errors: [], consoleErrors: [] };
  const check = (n, p, d) => {
    report.checks.push({ name: n, pass: p, detail: d });
    if (!p) throw Error(n + JSON.stringify(d));
  };
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") report.consoleErrors.push(m.text());
    });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page
      .locator(".preloader")
      .waitFor({ state: "hidden", timeout: 11000 });
    await page.waitForFunction(
      () =>
        document.querySelector(".hero-portrait")?.dataset.engine === "three",
      { timeout: 20000 },
    );
    check("Three.js frame renderer initialized", true);
    const manifest = await page.evaluate(() =>
      fetch("/media/hero-manifest.json").then((r) => r.json()),
    );
    const count = manifest.count;
    check(
      "Approved Prime sequence loaded",
      manifest.sourceJob === "5a9cf3ed-7741-427b-a175-55f4c55eb210",
      manifest.sourceJob,
    );
    check(
      "All native frames available at both resolutions",
      count === 120 &&
        manifest.desktop.length === count &&
        manifest.mobile.length === count,
      count,
    );
    const frame = () =>
      page.locator(".hero-portrait").getAttribute("data-frame").then(Number);
    const scrollProgress = (p, fraction) =>
      p.evaluate((f) => {
        const section = document.querySelector(".hero-scroll");
        const box = section.getBoundingClientRect();
        scrollTo({
          top: box.top + scrollY + Math.max(0, box.height - innerHeight) * f,
          behavior: "instant",
        });
      }, fraction);
    const a = await frame();
    await scrollProgress(page, 0.9);
    await page.waitForFunction(
      (n) =>
        Number(document.querySelector(".hero-portrait").dataset.frame) ===
        n - 1,
      count,
      { timeout: 12000 },
    );
    const b = await frame();
    check("Scroll advances to frontal end frame", b === count - 1 && b > a, {
      a,
      b,
    });
    await scrollProgress(page, 0.99);
    await page.waitForTimeout(1000);
    check(
      "Final pose remains fixed through final scroll segment",
      (await frame()) === b,
      { frame: await frame(), holdFraction: manifest.holdFraction },
    );
    await scrollProgress(page, 0.15);
    await page.waitForFunction(
      (n) =>
        Number(document.querySelector(".hero-portrait").dataset.frame) <
        n * 0.3,
      count,
      { timeout: 12000 },
    );
    const c = await frame();
    check("Reverse scroll reverses sequence", c < b, { b, c });
    await page
      .locator(".hero-portrait canvas")
      .evaluate((canvas) =>
        canvas.dispatchEvent(new Event("webglcontextlost")),
      );
    check(
      "Context loss shows poster",
      (await page.locator(".hero-portrait").getAttribute("data-engine")) ===
        "poster",
    );
    const fallback = await context.newPage();
    await fallback.goto("http://127.0.0.1:3000/?no3d=1", {
      waitUntil: "networkidle",
    });
    check(
      "No WebGL static fallback",
      (await fallback.locator(".hero-portrait canvas").count()) === 0,
    );
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 900 },
    });
    const mp = await mobile.newPage();
    await mp.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await mp.locator(".preloader").waitFor({ state: "hidden", timeout: 11000 });
    await mp.waitForFunction(
      () =>
        document.querySelector(".hero-portrait")?.dataset.engine === "three",
      { timeout: 20000 },
    );
    await mp.evaluate(() => {
      const scene = document.querySelector(".hero-visual"),
        frame = document.querySelector(".hero-frame");
      scrollTo({
        top:
          scene.getBoundingClientRect().top +
          scrollY -
          parseFloat(getComputedStyle(frame).top) +
          (scene.offsetHeight - frame.offsetHeight) * 0.45,
        behavior: "instant",
      });
    });
    await mp.waitForFunction(
      () =>
        Number(
          document.querySelector(".hero-portrait")?.getAttribute("data-frame"),
        ) > 30,
      undefined,
      { timeout: 12000 },
    );
    check(
      "Mobile sequence responds to scroll",
      Number(await mp.locator(".hero-portrait").getAttribute("data-frame")) > 0,
    );
    const slow = await browser.newContext({
      viewport: { width: 375, height: 900 },
    });
    const sp = await slow.newPage();
    await sp.route("**/media/ceo-prime-v1/poster.webp", (route) =>
      route.abort(),
    );
    await sp.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await sp.locator(".preloader").waitFor({ state: "hidden", timeout: 11000 });
    check(
      "Loader settles failed asset",
      await sp.evaluate(
        () => document.documentElement.style.overflow !== "hidden",
      ),
    );
    const stalled = await browser.newContext();
    const st = await stalled.newPage();
    await st.route("**/brand/fonts/**", async (route) => {
      await new Promise((r) => setTimeout(r, 10000));
      await route.abort().catch(() => {});
    });
    await st.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await st.locator(".preloader").waitFor({ state: "visible", timeout: 4000 });
    await dismissIntroduction(st);
    await st.locator(".preloader").waitFor({ state: "hidden", timeout: 3000 });
    check("Escape closes introduction during font stall", true);
    check("No runtime errors", !report.errors.length, report.errors);
    check(
      "No render/asset console errors",
      !report.consoleErrors.length,
      report.consoleErrors,
    );
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync("docs/motion-qa.json", JSON.stringify(report, null, 2));
    await browser.close();
    console.log(JSON.stringify(report, null, 2));
  }
})();
