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
  const report = { date: new Date().toISOString(), checks: [], errors: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + ": " + JSON.stringify(detail));
  };
  const waitEngine = (p, engine) =>
    p.waitForFunction(
      (e) => document.querySelector(".hero-portrait").dataset.engine === e,
      engine,
      { timeout: 15000 },
    );
  const frame = (p) =>
    p.locator(".hero-portrait").getAttribute("data-frame").then(Number);
  const open = async (context) => {
    const p = await context.newPage();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await dismissIntroduction(p);
    await p.locator(".preloader").waitFor({ state: "hidden" });
    return p;
  };
  fs.mkdirSync("docs/qa/whole-hero", { recursive: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const p = await open(context);
    await waitEngine(p, "three");
    const training = p.getByRole("link", {
      name: "Explore training",
      exact: true,
    });
    check(
      "Bottom skill action opens approved training enquiry",
      (await p
        .getByRole("link", { name: "Starts with a skill" })
        .getAttribute("href")) === (await training.getAttribute("href")),
    );
    await training.focus();
    await p.keyboard.press("Escape");
    check(
      "Escape with navigation closed preserves focus",
      await training.evaluate((e) => e === document.activeElement),
    );
    const before = await training.boundingBox();
    await training.hover();
    await p.waitForTimeout(400);
    const after = await training.boundingBox();
    check(
      "Primary hover does not move or resize the button",
      JSON.stringify(before) === JSON.stringify(after),
      { before, after },
    );
    await p.screenshot({ path: "docs/qa/whole-hero/desktop.png" });
    await p.emulateMedia({ reducedMotion: "reduce" });
    await waitEngine(p, "poster");
    await p
      .locator(".portrait-poster")
      .waitFor({ state: "visible", timeout: 3000 });
    check(
      "Live reduced-motion change removes animated canvas",
      (await p.locator(".hero-portrait canvas").count()) === 0,
    );
    check(
      "Live reduced-motion change reveals the portrait poster",
      await p.locator(".portrait-poster").isVisible(),
    );
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await waitEngine(p, "three");
    check(
      "Restoring motion creates one renderer",
      (await p.locator(".hero-portrait canvas").count()) === 1,
    );
    const requests = [];
    p.on("request", (r) => {
      if (r.url().includes("/media/ceo-prime-v1/")) requests.push(r.url());
    });
    for (const [w, h] of [
      [375, 900],
      [1440, 900],
      [375, 667],
    ]) {
      requests.length = 0;
      const expectedPath =
        w < 768 ? "/ceo-prime-v1/mobile/" : "/ceo-prime-v1/desktop/";
      const resolutionRequest = p.waitForRequest(
        (r) => r.url().includes(expectedPath),
        { timeout: 15000 },
      );
      await p.setViewportSize({ width: w, height: h });
      await resolutionRequest;
      await waitEngine(p, "three");
      check(
        "One renderer after breakpoint change " + w + "x" + h,
        (await p.locator(".hero-portrait canvas").count()) === 1,
      );
      check(
        "Appropriate frame resolution after breakpoint change " + w + "x" + h,
        requests.some((u) =>
          u.includes(
            w < 768 ? "/ceo-prime-v1/mobile/" : "/ceo-prime-v1/desktop/",
          ),
        ),
      );
      await p.evaluate(() =>
        scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "instant",
        }),
      );
      await p.waitForFunction(
        () =>
          Number(document.querySelector(".hero-portrait").dataset.frame) >= 115,
        undefined,
        { timeout: 15000 },
      );
      check(
        "Resized scroll reaches the end frame " + w + "x" + h,
        (await frame(p)) >= 115,
      );
      await p.screenshot({
        path: "docs/qa/whole-hero/end-" + w + "x" + h + ".png",
      });
    }
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.waitForFunction(
      () => Number(document.querySelector(".hero-portrait").dataset.frame) < 3,
      undefined,
      { timeout: 15000 },
    );
    check(
      "Reverse scroll after breakpoint refresh returns to the first pose",
      (await frame(p)) < 3,
    );
    await p.setViewportSize({ width: 1440, height: 900 });
    await waitEngine(p, "three");
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.addStyleTag({
      content:
        ".hero-copy h1{font-size:85px!important}.hero-copy p{font-size:25px!important;line-height:1.8!important}",
    });
    await p.waitForFunction(
      () => document.querySelector(".hero-stage").dataset.layout === "content",
    );
    await p.waitForTimeout(300);
    const reflow = await p.evaluate(() => ({
      copy: document.querySelector(".hero-copy").getBoundingClientRect().bottom,
      trust: document.querySelector(".hero-trust").getBoundingClientRect().top,
      width: document.documentElement.scrollWidth,
    }));
    check(
      "Enlarged desktop copy grows without trust-card overlap",
      reflow.copy < reflow.trust && reflow.width <= 1440,
      reflow,
    );
    await p.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    await p.waitForFunction(
      () =>
        Number(document.querySelector(".hero-portrait").dataset.frame) >= 115,
      undefined,
      { timeout: 15000 },
    );
    check(
      "Content-driven height change refreshes scroll endpoint",
      (await frame(p)) >= 115,
    );
    await p.screenshot({
      path: "docs/qa/whole-hero/desktop-enlarged-text-end.png",
    });
    await p.emulateMedia({ reducedMotion: "reduce" });
    await waitEngine(p, "poster");
    await p.waitForTimeout(200);
    const reducedFlow = await p.evaluate(() => ({
      stage:
        document.querySelector(".hero-stage").getBoundingClientRect().bottom +
        scrollY,
      scroll:
        document.querySelector(".hero-scroll").getBoundingClientRect().bottom +
        scrollY,
    }));
    check(
      "Reduced-motion content flow has no empty animation runway",
      Math.abs(reducedFlow.scroll - reducedFlow.stage) < 2,
      reducedFlow,
    );
    check(
      "Reduced motion hides the animation scroll prompt",
      await p.locator(".scroll-note").isHidden(),
    );
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.screenshot({
      path: "docs/qa/whole-hero/desktop-enlarged-text-top.png",
    });
    await context.close();
    const mobile = await browser.newContext({
      viewport: { width: 375, height: 900 },
      reducedMotion: "reduce",
    });
    const mp = await open(mobile);
    check(
      "Mobile divider stroke hidden",
      await mp
        .locator(".hero-topline")
        .evaluate(
          (e) => getComputedStyle(e).borderTopColor === "rgba(0, 0, 0, 0)",
        ),
    );
    await mp.screenshot({ path: "docs/qa/whole-hero/mobile.png" });
    await mp.getByRole("button", { name: "Open navigation" }).click();
    await mp.getByRole("button", { name: "Training", exact: true }).click();
    check(
      "Mobile programme links readable in expanded menu",
      await mp
        .getByRole("link", { name: "Appointment Setter", exact: true })
        .isVisible(),
    );
    await mp.screenshot({ path: "docs/qa/whole-hero/mobile-menu.png" });
    await mp
      .getByRole("link", { name: "Apply on WhatsApp", exact: true })
      .focus();
    await mp.keyboard.press("Tab");
    check(
      "Tabbing out closes the mobile disclosure",
      await mp.locator("#main-navigation").isHidden(),
    );
    check(
      "Tabbing out reaches the unobscured hero action",
      await mp
        .getByRole("link", { name: "Explore training", exact: true })
        .evaluate((e) => e === document.activeElement),
    );
    await mobile.close();
    const slow = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const sp = await slow.newPage();
    sp.on("pageerror", (e) => report.errors.push(e.message));
    await sp.route("**/media/hero-manifest.json", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.continue().catch(() => {});
    });
    await sp.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await sp.emulateMedia({ reducedMotion: "reduce" });
    await sp.waitForTimeout(1200);
    check(
      "Changing preference during startup cannot resurrect animation",
      (await sp.locator(".hero-portrait canvas").count()) === 0,
    );
    await slow.close();
    const loss = await browser.newContext({
        viewport: { width: 375, height: 900 },
      }),
      lp = await loss.newPage();
    const loads = [];
    lp.on("request", (r) => {
      if (r.url().includes("/media/ceo-prime-v1/")) loads.push(r.url());
    });
    await lp.route("**/media/ceo-prime-v1/**", async (route) => {
      await new Promise((r) => setTimeout(r, 100));
      await route.continue().catch(() => {});
    });
    await lp.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
    await waitEngine(lp, "three");
    await lp
      .locator(".hero-portrait canvas")
      .evaluate((el) => el.dispatchEvent(new Event("webglcontextlost")));
    const atLoss = loads.length;
    await lp.waitForTimeout(500);
    check(
      "Context loss cancels remaining frame downloads",
      loads.length === atLoss,
      { atLoss, after: loads.length },
    );
    check(
      "Context loss restores visible static portrait",
      (await lp.locator(".portrait-poster").isVisible()) &&
        (await lp.locator(".hero-portrait canvas").count()) === 0,
    );
    await loss.close();
    check(
      "No runtime errors during lifecycle checks",
      report.errors.length === 0,
      report.errors,
    );
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      "docs/whole-hero-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
    await browser.close();
  }
})();
