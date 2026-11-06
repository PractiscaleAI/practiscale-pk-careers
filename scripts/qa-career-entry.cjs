const assert = require("node:assert/strict");
const { chromium } = require("@playwright/test");
const sharp = require("sharp");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { dismissIntroduction } = require("./qa-helpers.cjs");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.QA_OUTPUT || path.join(os.tmpdir(), "practiscale-career-entry-qa");

(async () => {
  const poster = path.join(
    __dirname,
    "../public/media/career-paths/training-refined.webp",
  );
  const corner = await sharp(poster)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer();
  const expectedBackground = `rgb(${corner[0]}, ${corner[1]}, ${corner[2]})`;
  fs.mkdirSync(output, { recursive: true });

  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--use-angle=swiftshader"],
  });
  try {
    for (const width of [1440, 768, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
      });
      const page = await context.newPage();
      let releaseBrain;
      const brainGate = new Promise((resolve) => {
        releaseBrain = resolve;
      });
      await page.route("**/media/career-paths/brain-*.bin*", async (route) => {
        await brainGate;
        await route.continue();
      });
      try {
        await page.goto(base, { waitUntil: "domcontentloaded" });
        await dismissIntroduction(page);
        await page.locator("#career-paths").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const rail = document.querySelector("[data-career-rail]");
          const image = document.querySelector(
            "[data-career-world-panel] img",
          );
          return rail?.dataset.mode === "pinned" && image?.complete && image.naturalWidth > 0;
        });
        const entry = await page.locator("[data-career-world-panel]").evaluate(
          (panel) => ({
            background: getComputedStyle(panel).backgroundColor,
            image: getComputedStyle(panel).backgroundImage,
            ready: panel.querySelector("[data-ready='true']") !== null,
          }),
        );
        assert.equal(entry.ready, false, `${width}px entered after WebGL ready`);
        assert.equal(entry.background, expectedBackground);
        assert.equal(entry.image, "none");
        await page.screenshot({
          path: path.join(output, `entry-${width}.png`),
        });
        releaseBrain();
        await page.waitForSelector(
          "[data-career-world-panel] [data-ready='true']",
          { timeout: 20000 },
        );
        const live = await page.locator("[data-career-world-panel]").evaluate(
          (panel) => ({
            background: getComputedStyle(panel).backgroundColor,
            image: getComputedStyle(panel).backgroundImage,
            posterOpacity: getComputedStyle(panel.querySelector("img")).opacity,
          }),
        );
        assert.equal(live.background, expectedBackground);
        assert.equal(live.image, "none");
        await page.waitForFunction(() => {
          const image = document.querySelector("[data-career-world-panel] img");
          return image && getComputedStyle(image).opacity === "0";
        }, null, { timeout: 10000 });
        await page.screenshot({
          path: path.join(output, `live-${width}.png`),
        });
        console.log(`${width}px: poster surface and live handoff passed`);
      } finally {
        releaseBrain();
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`Screenshots: ${output}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
