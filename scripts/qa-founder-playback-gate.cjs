const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = process.env.FOUNDER_QA_OUT || "docs/qa/founder/v064";
const results = [];
function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.error(name, detail);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height, dpr] of [
      [1440, 900, 1],
      [1366, 600, 1.25],
      [768, 1024, 2],
      [390, 844, 2],
      [360, 640, 1],
      [844, 390, 1],
    ]) {
      const name = `${width}x${height}-${dpr}`;
      const p = await b.newPage({
        viewport: { width, height },
        deviceScaleFactor: dpr,
      });
      await p.goto("http://127.0.0.1:3000/#background-lines");
      await dismissIntroduction(p);
      await p.waitForTimeout(2600);
      const jump = async (f, wait = 650) => {
        await p.evaluate((f) => {
          const r = document.querySelector("#background-lines");
          scrollTo({
            top:
              r.getBoundingClientRect().top +
              scrollY +
              Math.max(0, r.offsetHeight - innerHeight) * f,
            behavior: "instant",
          });
        }, f);
        if (wait) await p.waitForTimeout(wait);
      };
      await jump(0);
      const enhanced = await p
        .locator("#background-lines")
        .getAttribute("data-enhanced");
      if (enhanced === "true") {
        check(
          `${name}: preview has neutral depth`,
          await p.locator("[data-founder-slot]").evaluate((el) => {
            const style = getComputedStyle(el, "::before");
            return style.boxShadow !== "none" && +style.opacity === 1;
          }),
        );
        check(
          `${name}: underlying film hidden at preview`,
          await p
            .locator("[data-founder-video]")
            .evaluate((v) => getComputedStyle(v).visibility === "hidden"),
        );
        await p.evaluate(() => {
          window.__founderStarts = [];
          const v = document.querySelector("[data-founder-video]");
          v.addEventListener("playing", () => {
            const r = document.querySelector("#background-lines");
            window.__founderStarts.push({
              progress: +r.dataset.founderProgress,
              poster: +getComputedStyle(r.querySelector("picture")).opacity,
              top: r
                .querySelector("[data-founder-stage]")
                .getBoundingClientRect().top,
            });
          });
        });
        for (const point of [0, 0.1, 0.19, 0.4, 0.7, 0.735]) {
          await jump(point);
          const s = await p
            .locator("[data-founder-video]")
            .evaluate((v) => ({ paused: v.paused, time: v.currentTime }));
          check(
            `${name}: no advance at ${point}`,
            s.paused && s.time < 0.05,
            s,
          );
          if (point === 0.19) {
            await p.screenshot({ path: `${out}/${name}-edges.png` });
            check(
              `${name}: no teal backing`,
              await p
                .locator("[data-founder-frame]")
                .evaluate(
                  (f) =>
                    getComputedStyle(f).backgroundColor !== "rgb(11, 36, 38)" &&
                    getComputedStyle(f.querySelector("picture"))
                      .backgroundColor !== "rgb(11, 36, 38)",
                ),
            );
          }
        }
        await jump(0.85);
        await p.waitForFunction(
          () => !document.querySelector("[data-founder-video]").paused,
        );
        await p.waitForTimeout(350);
        const starts = await p.evaluate(() => window.__founderStarts);
        check(
          `${name}: depth clears at full view`,
          await p
            .locator("[data-founder-slot]")
            .evaluate((el) => +getComputedStyle(el, "::before").opacity === 0),
        );
        check(
          `${name}: starts only after full view and poster departure`,
          starts.length > 0 &&
            starts.every(
              (s) =>
                s.progress >= 0.74 && s.poster === 0 && Math.abs(s.top) < 2,
            ),
          starts,
        );
        await jump(0, 40);
        check(
          `${name}: immediate reverse pause`,
          await p
            .locator("video[data-founder-video]")
            .evaluate((v) => v.paused),
        );
        const time = await p
          .locator("[data-founder-video]")
          .evaluate((v) => v.currentTime);
        await p.waitForTimeout(800);
        check(
          `${name}: no hidden advancement`,
          await p
            .locator("[data-founder-video]")
            .evaluate((v, t) => Math.abs(v.currentTime - t) < 0.05, time),
        );
        await p.locator("[data-founder-video]").evaluate((v) => {
          v.play().catch(() => {});
        });
        await p.waitForTimeout(150);
        check(
          `${name}: premature play rejected`,
          await p.locator("[data-founder-video]").evaluate((v) => v.paused),
        );
        await p.screenshot({ path: `${out}/${name}-restored.png` });
      } else {
        check(
          `${name}: short-screen fallback stays paused`,
          await p
            .locator("[data-founder-video]")
            .evaluate((v) => v.paused && v.controls),
        );
        await p.screenshot({ path: `${out}/${name}-fallback.png` });
      }
      await p.close();
    }
    const delayed = await b.newPage({ viewport: { width: 390, height: 844 } });
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    await delayed.route("**/media/founder/*.mp4", async (route) => {
      await held;
      await route.continue();
    });
    await delayed.goto("http://127.0.0.1:3000/");
    await dismissIntroduction(delayed);
    await delayed.waitForTimeout(1200);
    const move = async (fraction) => {
      await delayed.evaluate((f) => {
        const r = document.querySelector("#background-lines");
        scrollTo({
          top:
            r.getBoundingClientRect().top +
            scrollY +
            (r.offsetHeight - innerHeight) * f,
          behavior: "instant",
        });
      }, fraction);
      await delayed.waitForTimeout(600);
    };
    await move(0.85);
    await move(0);
    release();
    await delayed.waitForTimeout(2500);
    check(
      "Delayed media cannot start after visitor reverses",
      await delayed
        .locator("[data-founder-video]")
        .evaluate((v) => v.paused && v.currentTime < 0.05),
    );
    await delayed.close();
  } finally {
    await b.close();
    fs.writeFileSync(
      `${out}/playback-gate.json`,
      JSON.stringify(results, null, 2),
    );
  }
  console.log(
    `${results.filter((r) => r.pass).length}/${results.length} playback gate checks passed`,
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
})();
