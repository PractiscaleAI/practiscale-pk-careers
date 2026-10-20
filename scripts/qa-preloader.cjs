const { dismissIntroduction } = require("./qa-helpers.cjs");
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = { checks: [], errors: [] };
  const dir = "docs/qa/preloader";
  fs.mkdirSync(dir, { recursive: true });
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + JSON.stringify(detail));
  };
  const done = (p) =>
    p.locator(".preloader").waitFor({ state: "hidden", timeout: 11000 });
  const childOf = async (p) => {
    await p
      .frameLocator(".preloader-original-frame")
      .locator(".ring")
      .waitFor({ state: "attached" });
    return p.frames().find((f) => f.url().endsWith("/preloader/embedded.html"));
  };
  try {
    const source = fs.readFileSync("public/preloader/original.html", "utf8"),
      embedded = fs.readFileSync("public/preloader/embedded.html", "utf8");
    check(
      "Original animation script preserved verbatim",
      embedded.includes(source.match(/<script>[\s\S]*?<\/script>/)[0]),
    );
    check(
      "Original SVG/template preserved verbatim",
      embedded.includes(
        source.match(/<template id="stage">[\s\S]*?<\/template>/)[0],
      ),
    );
    check(
      "Original visual CSS preserved verbatim",
      embedded.includes(source.match(/<style>[\s\S]*?<\/style>/)[0]),
    );
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.addInitScript(() => {
      window.__introEvents = [];
      window.addEventListener("message", (e) => {
        if (e.data?.source === "practiscale-original-preloader")
          window.__introEvents.push(e.data.type);
      });
    });
    await p.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await p.locator(".preloader").waitFor({ state: "visible" });
    const child = await childOf(p);
    check(
      "No visible skip control is rendered",
      (await p.locator(".loader-skip").count()) === 0,
    );
    await child.waitForFunction(
      () =>
        Number(document.querySelector("#pre").getAttribute("aria-valuenow")) >=
        35,
    );
    const state = await child.evaluate(() => ({
      progress: Number(
        document.querySelector("#pre").getAttribute("aria-valuenow"),
      ),
      hole: document.querySelector(".hole").getAttribute("opacity"),
      clip: Number(document.querySelector(".clip").getAttribute("height")),
      circles: [...document.querySelectorAll("circle")].map((e) =>
        e.getAttribute("r"),
      ),
      controls: getComputedStyle(document.querySelector("#ctl")).display,
      wordmark: getComputedStyle(document.querySelector(".stage .logo")).filter,
    }));
    check(
      "Original broad annulus and bottom-up mark fill",
      state.progress >= 35 &&
        state.progress < 100 &&
        state.clip > 0 &&
        state.circles.join(",") === "191,88",
      state,
    );
    check(
      "No early aperture or visible preview controls",
      state.hole === "0" && state.controls === "none",
      state,
    );
    check(
      "Original white wordmark filter preserved",
      state.wordmark.includes("brightness(0)") &&
        state.wordmark.includes("invert(1)"),
      state.wordmark,
    );
    await p.screenshot({ path: path.join(dir, "desktop-fill.png") });
    await child.waitForFunction(() =>
      document.querySelector("#pre").classList.contains("exit"),
    );
    await p.waitForTimeout(130);
    await p.screenshot({ path: path.join(dir, "desktop-open.png") });
    const first = await child.locator(".hole").getAttribute("transform");
    await p.waitForTimeout(650);
    const second = await child.locator(".hole").getAttribute("transform");
    check("Original upper-wing zoom advances", first !== second, {
      first,
      second,
    });
    check(
      "Scroll and underlying controls locked through reveal",
      await p.evaluate(
        () =>
          document.documentElement.style.overflow === "hidden" &&
          document.querySelector("main").inert,
      ),
    );
    await p.screenshot({ path: path.join(dir, "desktop-zoom.png") });
    await done(p);
    check(
      "Original completion releases overlay; guard not used",
      await p.evaluate(
        () =>
          window.__introEvents.includes("complete") &&
          !document.querySelector("main").inert &&
          document.documentElement.style.overflow !== "hidden",
      ),
    );
    await p.screenshot({ path: path.join(dir, "desktop-complete.png") });
    for (let i = 0; i < 2; i++) {
      await p.reload({ waitUntil: "domcontentloaded" });
      await p.locator(".preloader").waitFor({ state: "visible" });
      await childOf(p);
      check("Original replays on cached refresh " + i, true);
      await dismissIntroduction(p);
      await done(p);
    }
    const kp = await browser.newPage();
    await kp.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await kp.waitForFunction(() => document.querySelector("main").inert);
    await kp.locator(".preloader").focus();
    await kp.keyboard.press("Tab");
    check(
      "Keyboard focus remains in introduction",
      await kp
        .locator(".preloader")
        .evaluate((e) => e === document.activeElement),
    );
    await kp.keyboard.press("Shift+Tab");
    check(
      "Reverse Tab remains in introduction",
      await kp
        .locator(".preloader")
        .evaluate((e) => e === document.activeElement),
    );
    await kp.keyboard.press("Escape");
    await done(kp);
    check(
      "Escape skips and restores scroll",
      await kp.evaluate(
        () => document.documentElement.style.overflow !== "hidden",
      ),
    );
    const mp = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mp.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    const mf = await childOf(mp);
    await mf.waitForFunction(
      () =>
        Number(document.querySelector("#pre").getAttribute("aria-valuenow")) >=
        85,
    );
    await mp.screenshot({ path: path.join(dir, "mobile-fill.png") });
    const bounds = await mf.locator(".ring").boundingBox();
    check(
      "Original ring fits phone screen",
      bounds.width <= 375 && bounds.height <= 812,
      bounds,
    );
    await mp.setViewportSize({ width: 844, height: 390 });
    await done(mp);
    check("Orientation change completes without stuck overlay", true);
    const rm = await browser.newPage({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
    });
    await rm.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    const rf = await childOf(rm);
    check(
      "Original reduced-motion fill duration retained",
      (await rf.locator("#duration").inputValue()) === "1",
    );
    await done(rm);
    check(
      "Reduced motion leaves visible static portrait",
      await rm.locator(".portrait-poster").isVisible(),
    );
    const nojs = await browser.newPage({
      viewport: { width: 375, height: 812 },
      javaScriptEnabled: false,
    });
    await nojs.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    check(
      "No-JavaScript hero visible without overlay",
      (await nojs.locator("h1").isVisible()) &&
        !(await nojs.locator(".preloader").isVisible()),
    );
    const stalled = await browser.newPage();
    await stalled.route("**/preloader/embedded.html", (r) =>
      r.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>QA bridge stall</title>",
      }),
    );
    await stalled.goto("http://127.0.0.1:3000/?no3d=1", {
      waitUntil: "domcontentloaded",
    });
    await stalled.waitForFunction(() => document.querySelector("main").inert);
    await done(stalled);
    check(
      "Failed introduction bridge cannot trap visitor",
      await stalled.evaluate(
        () =>
          !document.querySelector("main").inert &&
          document.documentElement.style.overflow !== "hidden",
      ),
    );
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync("docs/preloader-qa.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
  }
})();
