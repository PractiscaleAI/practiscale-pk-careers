// Regression: a stopped scroll must never leave an incomplete earnings record.
const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const path = require("node:path");

const output =
  process.env.QA_OUTPUT_DIR ||
  path.join(process.env.TEMP || __dirname, "practiscale-proof-readability");
const fs = require("node:fs/promises");
const sizes = [
  [1265, 713],
  [1440, 900],
  [390, 844],
  [320, 700],
  [320, 568],
].filter(
  ([width, height]) =>
    !process.env.QA_ONLY ||
    process.env.QA_ONLY.split(",").includes(`${width}x${height}`),
);
const failures = [];

async function move(page, progress) {
  await page.evaluate((p) => {
    window.__proofTextCalls = [];
    const rail = document.querySelector("[data-laptop-rail]");
    const viewport = rail.querySelector("[data-laptop-viewport]");
    scrollTo({
      top:
        rail.getBoundingClientRect().top +
        scrollY +
        (rail.offsetHeight - viewport.offsetHeight) * p,
      behavior: "instant",
    });
  }, progress);
  await page.waitForFunction(
    (p) => {
      const rail = document.querySelector("[data-laptop-rail]");
      return (
        rail.dataset.mode === "static" ||
        Math.abs(Number(rail.dataset.progress) - p) < 0.00012
      );
    },
    progress,
    { timeout: 20000 },
  );
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height } });
      await context.addInitScript(() => {
        window.__proofTextCalls = [];
        const original = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (
          value,
          ...args
        ) {
          if (this.canvas.height / this.canvas.width === 0.625)
            window.__proofTextCalls.push({
              text: String(value),
              alpha: this.globalAlpha,
            });
          return original.call(this, value, ...args);
        };
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => failures.push(`${width}: ${error}`));
      await page.goto("http://127.0.0.1:3000/#the-proof", {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(
        () => {
          const rail = document.querySelector("[data-laptop-rail]");
          return (
            rail?.dataset.mode === "static" || rail?.dataset.ready === "true"
          );
        },
        null,
        { timeout: 30000 },
      );
      const mode = await page
        .locator("[data-laptop-rail]")
        .getAttribute("data-mode");
      if (mode === "static") {
        console.log(`${width}x${height}: static fallback`);
        if (!(await page.locator("[data-laptop-poster] img").isVisible()))
          failures.push(`${width}: static poster is missing`);
        await context.close();
        continue;
      }
      const rows = await page.locator("#proof-records li").allTextContents();
      const totalText = await page.locator("#proof-records p").textContent();
      const total = totalText.match(/Combined total: Rs ([\d,]+)/)?.[1];
      if (!total) throw new Error("Cannot parse accessible combined total");
      const parsed = rows.map((row) => {
        const match = row.trim().match(/^(.*?), (.*?): Rs ([\d,]+)\. (.*)\.$/);
        if (!match) throw new Error(`Cannot parse accessible record: ${row}`);
        return {
          name: match[1],
          role: match[2],
          amount: match[3],
          period: match[4],
        };
      });
      const edges = Array.from({ length: 9 }, (_, i) => 0.3 + (i + 1) * 0.052);
      const checkpoints = [];
      for (const edge of edges) checkpoints.push(edge - 0.0001, edge + 0.0001);
      checkpoints.push(0.8199, 0.8201);
      // Repeat in reverse so the frame content cannot depend on scroll direction.
      for (const [direction, points] of [
        ["forward", checkpoints],
        ["reverse", [...checkpoints].reverse()],
      ]) {
        // Force a different screen before the reverse sweep, so the first
        // checkpoint tests a new paint instead of reusing the last frame.
        if (direction === "reverse") await move(page, 0.81);
        for (const progress of points) {
          await move(page, progress);
          const result = await page.evaluate(() => {
            const canvas = document.querySelector("[data-laptop-world] canvas");
            return {
              record: Number(canvas.dataset.record),
              screenText: canvas.dataset.screenText,
              calls: window.__proofTextCalls,
              numberKey: canvas.dataset.numberKey,
            };
          });
          const isSummary = progress >= 0.82;
          const expected = isSummary ? null : parsed[result.record];
          const required = isSummary
            ? [
                "10 / 10",
                "10 people. Real commissions.",
                "Combined total",
                total,
              ]
            : [
                `${String(result.record + 1).padStart(2, "0")} / 10`,
                expected.name,
                expected.role,
                expected.amount,
                expected.period,
              ];
          const missing = required.filter(
            (value) =>
              !result.calls.some(
                (call) => call.text === value && call.alpha >= 0.98,
              ),
          );
          if (missing.length)
            failures.push(
              `${width} ${direction} p=${progress.toFixed(5)} missing ${missing.join(" / ")}`,
            );
          const key = isSummary ? "total" : `record:${result.record}`;
          if (result.numberKey !== key)
            failures.push(
              `${width} ${direction} p=${progress.toFixed(5)} key ${result.numberKey} != ${key}`,
            );
          if (
            progress === checkpoints[0] ||
            progress === checkpoints[1] ||
            progress === 0.8199 ||
            progress === 0.8201
          )
            await page.screenshot({
              path: path.join(
                output,
                `${width}-${direction}-${progress.toFixed(4)}.png`,
              ),
            });
        }
      }
      console.log(
        `${width}x${height}: ${checkpoints.length * 2} readable forward/reverse states`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Screenshots: ${output}`);
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
