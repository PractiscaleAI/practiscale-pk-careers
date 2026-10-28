const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = process.env.FOUNDER_QA_OUT || "docs/qa/founder/v060";
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.error("FAIL", name, detail);
}
async function snapshot(page) {
  return page.locator("#background-lines").evaluate((root) => {
    const q = (n) => root.querySelector(`[data-founder-${n}]`),
      rect = (e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom };
      };
    return {
      enhanced: root.dataset.enhanced,
      expanded: root.dataset.expanded,
      progress: root.dataset.founderProgress,
      stage: rect(q("stage")),
      slot: rect(q("slot")),
      copy: rect(q("copy")),
      frame: rect(q("frame")),
      clip: q("frame").style.clipPath,
      opacity: +getComputedStyle(q("copy")).opacity,
      paused: q("video").paused,
      time: q("video").currentTime,
      muted: q("video").muted,
      controls: q("video").controls,
      overflow: document.documentElement.scrollWidth - innerWidth,
      paths: [...root.querySelectorAll("svg path")].map((e) =>
        e.getAttribute("d"),
      ),
      heading: root.querySelector("h2").textContent,
      mediaError: q("video").error?.message || null,
      errorMessage: !!root.querySelector("[role=status]"),
    };
  });
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [w, h, reduced] of [
      [1440, 900, false],
      [1920, 686, false],
      [1366, 600, false],
      [768, 1024, false],
      [390, 844, false],
      [390, 600, false],
      [1440, 900, true],
    ]) {
      const name = `${w}x${h}${reduced ? "-reduced" : ""}`;
      const page = await browser.newPage({
        viewport: { width: w, height: h },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${process.env.QA_BASE_URL || "http://127.0.0.1:3000"}/#background-lines`, {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.waitForTimeout(3500);
      await page.mouse.wheel(0, 1);
      const position = async (p) => {
        await page.evaluate((p) => {
          const el = document.querySelector("#background-lines");
          window.scrollTo({
            top:
              el.getBoundingClientRect().top +
              scrollY +
              (el.offsetHeight - innerHeight) * p,
            behavior: "instant",
          });
        }, p);
        await page.waitForTimeout(850);
      };
      await position(0);
      let start = await snapshot(page);
      check(`${name}: no overflow`, start.overflow === 0, start);
      check(
        `${name}: copy centered and fits`,
        Math.abs(start.copy.x + start.copy.w / 2 - w / 2) < 2 &&
          start.copy.y >= -1 &&
          start.copy.b < h,
        start.copy,
      );
      check(
        `${name}: straight lines only`,
        start.paths.length === 42 &&
          start.paths.every((p) => /^M720 450L[-\d.]+ [-\d.]+$/.test(p)),
        start.paths.length,
      );
      check(`${name}: does not autoplay early`, start.paused, start.time);
      await page.screenshot({ path: `${out}/${name}-intro.png` });
      if (start.enhanced === "true") {
        await position(0.32);
        const mid = await snapshot(page);
        check(
          `${name}: expands before playing`,
          mid.paused &&
            mid.opacity === 0 &&
            Number(mid.progress) > 0.25 &&
            Number(mid.progress) < 0.4,
          mid,
        );
        await page.screenshot({ path: `${out}/${name}-mid.png` });
        await position(0.8);
        await page.waitForTimeout(1800);
        const full = await snapshot(page);
        check(
          `${name}: viewport fit`,
          Math.abs(full.stage.y) < 2 &&
            Math.abs(full.stage.h - h) < 2 &&
            full.expanded === "true",
          full,
        );
        check(
          `${name}: playback at full size`,
          !full.paused && full.time > 0 && full.controls,
          full,
        );
        await page.screenshot({ path: `${out}/${name}-full.png` });
        check(`${name}: no overlay sound button`, await page.locator("[data-founder-sound]").count() === 0);
        await page.locator("[data-founder-video]").evaluate((v) => v.pause());
        await page.waitForTimeout(400);
        check(`${name}: manual pause respected`, (await snapshot(page)).paused);
        await position(0);
        const reverse = await snapshot(page);
        check(
          `${name}: reverse restores intro and pauses`,
          reverse.opacity > 0.99 &&
            reverse.paused &&
            Number(reverse.progress) < 0.01,
          reverse,
        );
        await page.locator("[data-founder-watch]").click();
        await page.waitForTimeout(1200);
        check(
          `${name}: watch button opens and plays`,
          (await snapshot(page)).expanded === "true" &&
            !(await snapshot(page)).paused &&
            !(await snapshot(page)).muted,
        );
        // A fast reverse/forward jump must settle at the latest scroll target.
        await position(0.05);
        await position(0.9);
        check(
          `${name}: fast scroll settles`,
          (await snapshot(page)).expanded === "true",
        );
      } else {
        check(
          `${name}: native controls fallback`,
          start.controls && start.paused,
          start,
        );
      }
      const final = await snapshot(page);
      check(
        `${name}: no media failure message`,
        !final.mediaError && !final.errorMessage,
        final.mediaError,
      );
      check(`${name}: no browser errors`, errors.length === 0, errors);
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
  }
  console.log(
    `${results.filter((r) => r.pass).length}/${results.length} checks passed`,
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
})();
