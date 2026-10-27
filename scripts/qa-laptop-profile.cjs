const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
    await dismissIntroduction(page);
    for (const selector of [
      "#the-problem",
      "#who-we-are",
      "[data-career-rail]",
      "[data-laptop-rail]",
    ]) {
      await page.locator(selector).evaluate((el) =>
        scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(2200);
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.start");
    const frames = await page.evaluate(async () => {
      const el = document.querySelector("[data-laptop-rail]");
      const top = el.getBoundingClientRect().top + scrollY,
        travel = el.offsetHeight - innerHeight,
        rows = [];
      const start = performance.now();
      await new Promise((resolve) => {
        function step(now) {
          const p = Math.min(1, (now - start) / 4000);
          scrollTo({ top: top + travel * p, behavior: "instant" });
          rows.push({ now, p, shown: el.dataset.progress });
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
      return rows;
    });
    const result = await cdp.send("Profiler.stop");
    fs.writeFileSync(
      "docs/qa/smoothness/v058/laptop-profile.json",
      JSON.stringify({ frames, ...result }),
    );
    console.log(
      frames.flatMap((r, i) =>
        i && r.now - frames[i - 1].now > 60
          ? [{ gap: r.now - frames[i - 1].now, p: r.p }]
          : [],
      ),
    );
  } finally {
    await browser.close();
  }
})();
