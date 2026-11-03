const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = path.join(process.cwd(), "docs", "qa", "preloader");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const report = { baseUrl, checks: [], errors: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + (detail ? ` | ${JSON.stringify(detail)}` : ""));
  };
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = async (options = {}) => {
    const tab = await browser.newPage(options);
    tab.on("pageerror", (error) => report.errors.push(error.message));
    return tab;
  };
  try {
    const html = await fetch(baseUrl).then((response) => response.text());
    check(
      "Loader and its critical styles are in the initial HTML before the page",
      html.includes("id=\"site-preloader\"") &&
        html.indexOf("id=\"site-preloader\"") < html.indexOf("<main") &&
        html.includes("html:has(#site-preloader)"),
    );
    check(
      "Hero poster and critical fonts have preload hints",
      /<link(?=[^>]*href="\/media\/ceo-prime-v1\/poster\.webp")(?=[^>]*as="image")[^>]*>/.test(html) &&
        html.includes('href="/brand/fonts/Manrope400.ttf" as="font"') &&
        html.includes('href="/brand/fonts/Sora600.ttf" as="font"'),
    );
    check(
      "Original loader artwork is restored with a first-paint fallback",
      html.includes('src="/preloader/embedded.html"') &&
        html.includes("preloader-first-ring") &&
        !html.includes("preloader-fast-ring"),
    );

    const slow = await page({ viewport: { width: 1440, height: 900 } });
    await slow.addInitScript(() => {
      window.__preloaderLayerStates = { fallback: 0, artwork: 0, overlap: 0, blank: 0 };
      let seen = false;
      const sample = () => {
        const root = document.querySelector("#site-preloader");
        if (root) {
          seen = true;
          const fallback = root.querySelector(".preloader-first-frame");
          const artwork = root.querySelector(".preloader-original-frame");
          if (fallback && artwork) {
            const firstVisible = getComputedStyle(fallback).visibility === "visible";
            const artworkVisible = getComputedStyle(artwork).visibility === "visible";
            if (firstVisible && artworkVisible) window.__preloaderLayerStates.overlap++;
            else if (firstVisible) window.__preloaderLayerStates.fallback++;
            else if (artworkVisible) window.__preloaderLayerStates.artwork++;
            else window.__preloaderLayerStates.blank++;
          }
        }
        if (!seen || root) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    let heroRequestStarted = false;
    await slow.route("**/preloader/embedded.html", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.continue();
    });
    await slow.route("**/media/hero-manifest.json", async (route) => {
      heroRequestStarted = true;
      await new Promise((resolve) => setTimeout(resolve, 2600));
      await route.continue();
    });
    await slow.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await slow.locator("#site-preloader").waitFor({ state: "visible" });
    await slow.screenshot({ path: path.join(output, "desktop-loading.png") });
    await slow.waitForTimeout(600);
    const pending = await slow.evaluate(() => ({
      count: Number(
        document.querySelector('[aria-label="Critical assets loaded"]')?.getAttribute("aria-valuenow"),
      ),
      locked: getComputedStyle(document.documentElement).overflow === "hidden",
      inert: !!document.querySelector("main")?.inert,
      heroLoading: document.querySelector(".hero-portrait")?.dataset.initialized !== "true",
      visualProgress: Number(
        document.querySelector(".preloader-original-frame")?.contentDocument
          ?.getElementById("pre")?.getAttribute("aria-valuenow"),
      ),
    }));
    check(
      "Real progress waits for the delayed first hero frame",
      pending.count > 0 &&
        pending.count < 3 &&
        pending.locked &&
        pending.inert &&
        pending.heroLoading &&
        pending.visualProgress === Math.round((pending.count / 3) * 100),
      pending,
    );
    check("Other assets load while the overlay is visible", heroRequestStarted);
    await slow.locator("#site-preloader").waitFor({ state: "detached", timeout: 12000 });
    const layers = await slow.evaluate(() => window.__preloaderLayerStates);
    check(
      "First-paint artwork hands off without duplicate or blank loader frames",
      layers.fallback > 0 && layers.artwork > 0 && layers.overlap === 0 && layers.blank === 0,
      layers,
    );
    const finished = await slow.evaluate(() => ({
      initialized: document.querySelector(".hero-portrait")?.dataset.initialized,
      locked: getComputedStyle(document.documentElement).overflow === "hidden",
      inert: !!document.querySelector("main")?.inert,
    }));
    check(
      "Hero is ready before the overlay is removed and scrolling is restored",
      finished.initialized === "true" && !finished.locked && !finished.inert,
      finished,
    );
    await slow.screenshot({ path: path.join(output, "desktop-ready.png") });
    check(
      "Repeat visit is recorded for a faster cached path",
      (await slow.evaluate(() => sessionStorage.getItem("practiscale-intro-seen"))) === "1",
    );

    const mobile = await page({ viewport: { width: 375, height: 812 } });
    await mobile.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await mobile.locator("#site-preloader").waitFor({ state: "visible" });
    const ring = await mobile.locator(".preloader-first-ring").boundingBox();
    check("Loading visual fits a 375px phone", ring && ring.width <= 375 && ring.height <= 812, ring);
    await mobile.screenshot({ path: path.join(output, "mobile-loading.png") });
    await mobile.locator("#site-preloader").waitFor({ state: "detached", timeout: 12000 });
    await mobile.screenshot({ path: path.join(output, "mobile-ready.png") });

    const reduced = await page({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    await reduced.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await reduced.locator("#site-preloader").waitFor({ state: "detached", timeout: 12000 });
    check("Reduced motion also releases the page", await reduced.locator("h1").isVisible());

    const noJs = await page({
      viewport: { width: 375, height: 812 },
      javaScriptEnabled: false,
    });
    await noJs.goto(baseUrl, { waitUntil: "domcontentloaded" });
    check(
      "No JavaScript leaves the hero readable",
      !(await noJs.locator("#site-preloader").isVisible()) &&
        (await noJs.locator("h1").isVisible()),
    );

    const stalled = await page({ viewport: { width: 1440, height: 900 } });
    await stalled.route("**/media/hero-manifest.json", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 9500));
      await route.continue().catch(() => {});
    });
    await stalled.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const began = Date.now();
    await stalled.locator("#site-preloader").waitFor({ state: "detached", timeout: 11000 });
    const fallbackMs = Date.now() - began;
    check(
      "Stalled hero cannot trap a visitor beyond the fallback",
      fallbackMs >= 7000 && fallbackMs < 10000 &&
        (await stalled.evaluate(() => getComputedStyle(document.documentElement).overflow !== "hidden")),
      fallbackMs,
    );
    check("No page errors", report.errors.length === 0, report.errors);
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(output, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
  }
})();
