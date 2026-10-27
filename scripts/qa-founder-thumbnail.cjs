const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/founder/v063";
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  if (!pass) console.error(name, detail);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height, reduced] of [
      [1440, 900, false],
      [1366, 600, false],
      [768, 1024, false],
      [390, 844, false],
      [360, 640, false],
      [390, 844, true],
    ]) {
      const name = `${width}x${height}${reduced ? "-reduced" : ""}`;
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      await page.goto("http://127.0.0.1:3000/#background-lines");
      await dismissIntroduction(page);
      await page.waitForTimeout(2800);
      const jump = async (progress) => {
        await page.evaluate((p) => {
          const root = document.querySelector("#background-lines");
          scrollTo({
            top:
              root.getBoundingClientRect().top +
              scrollY +
              Math.max(0, root.offsetHeight - innerHeight) * p,
            behavior: "instant",
          });
        }, progress);
        await page.waitForTimeout(750);
      };
      await jump(0);
      const intro = await page.locator("#background-lines").evaluate((root) => {
        const img = root.querySelector("[data-founder-poster]");
        const slot = root.querySelector("[data-founder-slot]");
        const rect = slot.getBoundingClientRect();
        const button = root
          .querySelector("[data-founder-watch]")
          .getBoundingClientRect();
        const imageRect = img.getBoundingClientRect();
        return {
          enhanced: root.dataset.enhanced === "true",
          src: img.currentSrc,
          complete: img.complete && img.naturalWidth > 0,
          ratio: rect.width / rect.height,
          poster: root.querySelector("video").poster,
          imageWidth: Math.min(
            imageRect.width,
            (imageRect.height * img.naturalWidth) / img.naturalHeight,
          ),
          width: rect.width,
          clearance: button.top - rect.bottom,
          buttonBottom: button.bottom,
          overflow: document.documentElement.scrollWidth - innerWidth,
          tracks: root.querySelectorAll("track").length,
        };
      });
      check(
        `${name}: supplied artwork and no captions`,
        intro.poster.includes("founder-dream-v063") &&
          intro.tracks === 0 &&
          intro.overflow === 0,
        intro,
      );
      if (intro.enhanced) {
        check(
          `${name}: full thumbnail fits preview`,
          intro.complete &&
            Math.abs(intro.ratio - 1672 / 941) < 0.01 &&
            Math.abs(intro.imageWidth - intro.width) < 2,
          intro,
        );
        check(
          `${name}: button clear of artwork and viewport edge`,
          intro.clearance >= 10 && intro.buttonBottom < height - 12,
          intro,
        );
      }
      await page.screenshot({ path: `${out}/${name}-intro.png` });
      if (intro.enhanced) {
        await jump(0.5);
        await page.screenshot({ path: `${out}/${name}-transition.png` });
        await jump(0.85);
        await page.waitForFunction(
          () =>
            document.querySelector("#background-lines").dataset.filmReady ===
            "true",
        );
        await page.waitForTimeout(350);
        check(
          `${name}: thumbnail yields to playing film`,
          await page
            .locator("[data-founder-poster]")
            .evaluate(
              (img) =>
                +getComputedStyle(img.parentElement).opacity === 0 &&
                !document.querySelector("[data-founder-video]").paused,
            ),
        );
        await page.screenshot({ path: `${out}/${name}-playback.png` });
        await jump(0);
        check(
          `${name}: reverse restores thumbnail`,
          await page
            .locator("[data-founder-poster]")
            .evaluate(
              (img) =>
                +getComputedStyle(img.parentElement).opacity === 1 &&
                document.querySelector("[data-founder-video]").paused,
            ),
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(`${out}/thumbnail.json`, JSON.stringify(checks, null, 2));
  }
  console.log(
    `${checks.filter((x) => x.pass).length}/${checks.length} thumbnail checks passed`,
  );
  if (checks.some((x) => !x.pass)) process.exitCode = 1;
})();
