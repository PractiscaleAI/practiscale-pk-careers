const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const dir = "docs/qa/testimonials/v056";
const report = { checks: [], errors: [], accessibility: [] };
const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
  if (!pass) console.error("FAIL", name, JSON.stringify(detail));
};
const quotes = [
  "I started at 197k a month. Three months later I closed 707k in a single month. I never knew remote work could pay like this.",
  "Five months in, I have earned over 3.3 million. Whatever ceiling I felt at my old job, it does not exist here.",
  "Came in as a new addition and did 410k my first month. By month three I had crossed a million.",
  "The leads, the training, the support, it is all built so you actually win. I doubled my month in 90 days.",
];
const names = ["Kashaf Abbasi", "Jason Brown", "James Ephrim", "Hassan Ali"];
(async () => {
  fs.mkdirSync(dir, { recursive: true });
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
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 90000,
    });
    await dismissIntroduction(page);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#testimonials").evaluate((el) =>
      scrollTo({
        top: el.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(1000);
    const section = page.locator("#testimonials");
    const viewport = page.locator("[data-testimonial-viewport]");
    const carousel = section.locator('[aria-roledescription="carousel"]');
    const active = () => carousel.getAttribute("data-active");
    async function centered(label) {
      // Wait for the actual presented endpoint, including upstream resize work.
      await page.waitForFunction(
        () => {
          const v = document
            .querySelector("[data-testimonial-viewport]")
            .getBoundingClientRect();
          const c = document
            .querySelector('[data-testimonial-card][aria-hidden="false"]')
            .getBoundingClientRect();
          return (
            Math.abs((c.left + c.right) / 2 - (v.left + v.right) / 2) < 1.5
          );
        },
        null,
        { timeout: 10000 },
      );
      const m = await section.evaluate((el) => {
        const v = el
          .querySelector("[data-testimonial-viewport]")
          .getBoundingClientRect();
        const card = el.querySelector(
          '[data-testimonial-card][aria-hidden="false"]',
        );
        const c = card.getBoundingClientRect();
        const q = card.querySelector("blockquote").getBoundingClientRect();
        const p = card.querySelector("figcaption").getBoundingClientRect();
        const art = card.querySelector("svg").getBoundingClientRect();
        const text = card.querySelector("blockquote p").getBoundingClientRect();
        return {
          center: Math.abs((c.left + c.right) / 2 - (v.left + v.right) / 2),
          overflow: document.documentElement.scrollWidth - innerWidth,
          quoteFits:
            q.left >= c.left && q.right <= c.right && q.bottom <= p.top,
          personFits: p.bottom <= c.bottom,
          motifWidthRatio: art.width / c.width,
          motifHeightRatio: art.height / c.height,
          decorative:
            card.querySelector("svg").getAttribute("aria-hidden") === "true",
          opacity: getComputedStyle(card).opacity,
        };
      });
      check(
        label,
        m.center < 1.5 &&
          m.overflow <= 1 &&
          m.quoteFits &&
          m.personFits &&
          m.motifWidthRatio >= 0.65 &&
          m.motifHeightRatio >= 1 &&
          m.decorative &&
          Number(m.opacity) > 0.99,
        m,
      );
    }
    check(
      "Exact four supplied quotes",
      JSON.stringify(
        await section.locator("blockquote p").allTextContents(),
      ) === JSON.stringify(quotes),
    );
    check(
      "Original sections retained before testimonials",
      JSON.stringify(
        await page
          .locator("main>section")
          .evaluateAll((es) => es.slice(0, 6).map((e) => e.id)),
      ) ===
        JSON.stringify([
          "",
          "the-problem",
          "who-we-are",
          "career-paths",
          "the-proof",
          "testimonials",
        ]),
    );
    check(
      "No extra portrait/image/video/GPU assets",
      (await section.locator("img,video,canvas").count()) === 0,
    );
    await centered("Initial desktop center and full copy");
    await page.screenshot({ path: `${dir}/desktop-first.png` });
    // Use real pointer motion; check each direction and momentum/settling.
    let b = await viewport.boundingBox();
    await page.mouse.move(b.x + b.width * 0.7, b.y + b.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.35, b.y + b.height * 0.45, {
      steps: 12,
    });
    await page.screenshot({ path: `${dir}/desktop-drag.png` });
    await page.mouse.up();
    await page.waitForTimeout(750);
    check(
      "Horizontal drag advances",
      Number(await active()) > 0,
      await active(),
    );
    await centered("Drag settles exactly centered");
    await viewport.focus();
    await page.keyboard.press("End");
    await page.waitForTimeout(750);
    check("End selects Hassan", (await active()) === "3");
    check(
      "Only four named selectors, no navigation arrows",
      (await section.getByRole("button").count()) === 4 &&
        (await section
          .getByRole("button", {
            name: /Previous testimonial|Next testimonial/,
          })
          .count()) === 0,
    );
    await page.screenshot({ path: `${dir}/desktop-last.png` });
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(700);
    check("Keyboard previous selects James", (await active()) === "2");
    await page.keyboard.press("Home");
    await page.waitForTimeout(80);
    await page.keyboard.press("End");
    await page.waitForTimeout(60);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(750);
    check(
      "Rapid commands interrupt without stale settlement",
      (await active()) === "2",
    );
    await centered("Rapid input settlement");
    await section
      .getByRole("button", { name: "Show testimonial from Jason Brown" })
      .click();
    await page.waitForTimeout(700);
    check("Named selector works", (await active()) === "1");
    b = await viewport.boundingBox();
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.7, b.y + b.height * 0.45, {
      steps: 12,
    });
    await page.mouse.up();
    await page.waitForTimeout(750);
    check(
      "Reverse drag returns to first",
      (await active()) === "0",
      await active(),
    );
    await centered("Reverse settlement");
    for (const [w, h] of [
      [1920, 1080],
      [1536, 686],
      [1024, 600],
      [768, 1024],
      [530, 900],
      [390, 844],
      [375, 667],
      [320, 568],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(650);
      await section
        .locator("[data-testimonial-stage]")
        .scrollIntoViewIfNeeded();
      for (let i = 0; i < 4; i++) {
        await section
          .getByRole("button", { name: `Show testimonial from ${names[i]}` })
          .click();
        await page.waitForTimeout(680);
        await centered(`${w}x${h} slide ${i + 1} fits`);
        if (i === 0 || (w === 390 && i === 3))
          await page.screenshot({ path: `${dir}/${w}x${h}-${i + 1}.png` });
      }
      if ([1440, 768, 390, 320].includes(w)) {
        const a = await new AxeBuilder({ page })
          .include("#testimonials")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        report.accessibility.push({
          width: w,
          violations: a.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        });
        check(
          `Accessibility ${w}`,
          a.violations.length === 0,
          report.accessibility.at(-1),
        );
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(650);
    await centered("Resize preserves selected Hassan");
    check("Resize retains selected person", (await active()) === "3", {
      active: await active(),
      geometry: await section.evaluate((el) => ({
        top: el.getBoundingClientRect().top,
        y: scrollY,
        height: el.offsetHeight,
      })),
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await section
      .getByRole("button", { name: "Show testimonial from Kashaf Abbasi" })
      .click();
    await centered("Reduced motion selection is immediate");
    check(
      "No floating cursor obscures testimonial copy",
      (await section.locator("[data-testimonial-cursor]").count()) === 0,
    );
    await page.screenshot({ path: `${dir}/reduced-motion.png` });
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const touch = await mobile.newPage();
    touch.on("pageerror", (e) => report.errors.push(e.message));
    await touch.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 90000,
    });
    await dismissIntroduction(touch);
    await touch.locator("#testimonials").evaluate((el) =>
      scrollTo({
        top: el.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      }),
    );
    await touch.waitForTimeout(700);
    const session = await mobile.newCDPSession(touch);
    const tb = await touch.locator("[data-testimonial-viewport]").boundingBox();
    const ty = Math.min(500, tb.y + tb.height * 0.4);
    async function swipe(x, y, dx, dy) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let i = 1; i <= 12; i++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * i) / 12, y: y + (dy * i) / 12 }],
        });
        await touch.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await touch.waitForTimeout(750);
    }
    await swipe(320, ty, -240, 0);
    const ta = touch.locator('#testimonials [aria-roledescription="carousel"]');
    check(
      "Real touch swipe advances",
      Number(await ta.getAttribute("data-active")) > 0,
    );
    await touch.screenshot({ path: `${dir}/touch-swipe.png` });
    const before = await touch.evaluate(() => scrollY);
    const beforeActive = await ta.getAttribute("data-active");
    await swipe(180, ty, 0, 200);
    check(
      "Vertical touch remains native page scroll",
      Math.abs((await touch.evaluate(() => scrollY)) - before) > 40,
    );
    check(
      "Vertical gesture selects the testimonial at native scroll progress",
      await touch.evaluate(() => {
        const section = document.querySelector("#testimonials");
        const stage = section.querySelector("[data-testimonial-stage]");
        const start =
          section.getBoundingClientRect().top +
          scrollY +
          Math.max(0, stage.offsetHeight - innerHeight);
        const index = Math.max(
          0,
          Math.min(
            3,
            Math.floor(
              (scrollY - start) / Math.max(420, innerHeight * 0.7) + 0.25,
            ),
          ),
        );
        return (
          Number(section.querySelector("[data-active]").dataset.active) ===
          index
        );
      }),
    );
    await mobile.close();
    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const fallback = await nojs.newPage();
    await fallback.goto("http://127.0.0.1:3000/", {
      waitUntil: "load",
      timeout: 90000,
    });
    const f = fallback.locator("#testimonials");
    await f.scrollIntoViewIfNeeded();
    check(
      "No-JS retains all complete quotes",
      JSON.stringify(await f.locator("blockquote p").allTextContents()) ===
        JSON.stringify(quotes),
    );
    check(
      "No-JS has native horizontal overflow and no dead controls",
      (await f
        .locator("[data-testimonial-viewport]")
        .evaluate(
          (e) =>
            getComputedStyle(e).overflowX === "auto" &&
            e.scrollWidth > e.clientWidth,
        )) && (await f.locator("button:visible").count()) === 0,
    );
    await f.screenshot({ path: `${dir}/no-javascript.png` });
    await nojs.close();
    check("No runtime errors", report.errors.length === 0, report.errors);
  } catch (e) {
    report.errors.push(e.stack);
    console.error(e);
  } finally {
    await browser.close();
    fs.writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2));
  }
  const failed = report.checks.filter((c) => !c.pass);
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      failed: failed.length,
      errors: report.errors.length,
      report: `${dir}/report.json`,
    }),
  );
  if (failed.length || report.errors.length) process.exitCode = 1;
})();
