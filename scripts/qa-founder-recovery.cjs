const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/founder/v069";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const checks = [];
  const check = (name, pass, detail) => {
    checks.push({ name, pass, detail });
    if (!pass) console.log("FAIL", name, detail);
  };
  try {
    for (const [width, height, reduced] of [
      [1440, 900, false],
      [390, 844, false],
      [390, 844, true],
    ]) {
      const p = await b.newPage({
        viewport: { width, height },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      let blocked = true,
        attempts = 0;
      await p.route("**/media/founder/*.mp4", (r) => {
        attempts++;
        return blocked ? r.abort("failed") : r.continue();
      });
      await p.goto("http://127.0.0.1:3000/#background-lines");
      await dismissIntroduction(p);
      await p.waitForTimeout(5000);
      const v = p.locator("[data-founder-video]");
      const id = `${width}${reduced ? "-static" : ""}`;
      check(id + " bounded retries", attempts === 3, { attempts });
      check(
        id + " exhausted request shows retry",
        (await p
          .getByRole("button", { name: "Retry video", exact: true })
          .filter({ visible: true })
          .count()) === 1,
      );
      if (!reduced) {
        check(
          id + " no overlay on thumbnail",
          !(await p.locator("[data-founder-error]").isVisible()),
        );
        await p.screenshot({ path: `${out}/${id}-preview-error.png` });
        await p.locator("[data-founder-watch]").click();
        await p.waitForTimeout(3200);
        check(
          id + " expanded error recovery controls visible",
          await p.locator("[data-founder-error]").isVisible(),
        );
        await p.screenshot({ path: `${out}/${id}-expanded-error.png` });
      }
      check(
        id + " correct direct source",
        (
          await p.locator("[data-founder-error] a").getAttribute("href")
        ).includes(width < 1024 ? "portrait" : "desktop"),
      );
      blocked = false;
      await p.locator("[data-founder-error] button").click();
      await p.waitForFunction(
        () => {
          const v = document.querySelector("[data-founder-video]");
          return (
            !v.error && v.readyState >= 2 && !v.paused && v.currentTime > 0.05
          );
        },
        null,
        { timeout: 12000 },
      );
      check(
        id + " explicit retry plays",
        await v.evaluate((v) => !v.error && !v.paused && v.currentTime > 0),
      );
      check(
        id + " error cleared",
        (await p.locator("[data-founder-error]").count()) === 0,
      );
      await p.screenshot({ path: `${out}/${id}-recovered.png` });
      if (!reduced) {
        await p
          .locator("#background-lines")
          .evaluate((el) =>
            scrollTo({
              top: el.getBoundingClientRect().top + scrollY,
              behavior: "instant",
            }),
          );
        await p.waitForTimeout(700);
        check(
          id + " recovery preserves pause on reverse",
          await v.evaluate((v) => v.paused),
        );
      }
      await p.close();
    }
    // A single transient request failure recovers silently, before expansion.
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    let requests = 0;
    await p.route("**/media/founder/*.mp4", (r) =>
      ++requests === 1 ? r.abort("failed") : r.continue(),
    );
    await p.goto("http://127.0.0.1:3000/#background-lines");
    await dismissIntroduction(p);
    await p.waitForFunction(
      () => {
        const v = document.querySelector("[data-founder-video]");
        return v.readyState >= 2 && !v.error;
      },
      null,
      { timeout: 12000 },
    );
    check(
      "transient failure recovers without starting early",
      await p
        .locator("[data-founder-video]")
        .evaluate((v) => v.paused && v.currentTime < 0.05),
    );
    check(
      "transient failure leaves no error box",
      (await p.locator("[data-founder-error]").count()) === 0,
    );
    await p.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + "/recovery.json", JSON.stringify(checks, null, 2));
  }
  console.log(
    `${checks.filter((x) => x.pass).length}/${checks.length} recovery checks passed`,
  );
  if (checks.some((x) => !x.pass)) process.exitCode = 1;
})();
