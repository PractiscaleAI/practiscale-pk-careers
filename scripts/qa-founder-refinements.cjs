const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/founder/v062";
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.error("FAIL", name, detail);
};
(async () => {
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height] of [
      [1366, 600],
      [390, 844],
    ]) {
      const p = await b.newPage({ viewport: { width, height } });
      const requests = [];
      p.on("request", (r) => {
        if (r.url().includes("/media/founder/") && r.url().endsWith(".mp4"))
          requests.push(r.url());
      });
      await p.goto("http://127.0.0.1:3000/");
      await dismissIntroduction(p);
      await p.waitForTimeout(2000);
      check(
        `${width}: video not fetched from page top`,
        requests.length === 0,
        [...requests],
      );
      const jump = async (fraction) => {
        await p.evaluate((fraction) => {
          const e = document.querySelector("#background-lines");
          window.scrollTo({
            top:
              e.getBoundingClientRect().top +
              scrollY +
              (e.offsetHeight - innerHeight) * fraction,
            behavior: "instant",
          });
        }, fraction);
        await p.waitForTimeout(600);
      };
      await jump(0);
      const initial = await p.locator("[data-founder-slot]").boundingBox();
      check(
        `${width}: appropriately sized opening`,
        width > 1000 ? initial.width >= 480 : initial.height >= 400,
        initial,
      );
      await jump(0.1);
      check(
        `${width}: text held at start`,
        await p
          .locator("[data-founder-copy]")
          .evaluate((e) => +getComputedStyle(e).opacity > 0.95),
      );
      await jump(0.2);
      check(
        `${width}: gradual text departure`,
        await p.locator("[data-founder-copy]").evaluate((e) => {
          let a = +getComputedStyle(e).opacity;
          return a > 0.2 && a < 0.6;
        }),
      );
      await jump(0.7);
      check(
        `${width}: waits for completed expansion`,
        await p.locator("[data-founder-video]").evaluate((v) => v.paused),
      );
      await jump(0.8);
      await p.waitForTimeout(1000);
      const state = await p
        .locator("[data-founder-video]")
        .evaluate((v) => ({
          width: v.videoWidth,
          height: v.videoHeight,
          duration: v.duration,
          src: v.currentSrc,
          track: v.textTracks[0]?.mode,
          cues: v.textTracks[0]?.cues?.length,
        }));
      check(
        `${width}: correct rendition and full duration`,
        Math.abs(state.duration - 100.33) < 0.2 &&
          (width < 1000
            ? state.width === 540 && state.height === 960
            : state.width === 1600 && state.height === 900),
        state,
      );
      check(
        `${width}: no captions or subtitle tracks`,
        await p
          .locator("[data-founder-video]")
          .evaluate(
            (v) =>
              v.textTracks.length === 0 &&
              v.querySelectorAll("track").length === 0,
          ),
      );
      await p.locator("[data-founder-video]").evaluate((v) => {
        v.pause();
        v.currentTime = 59.5;
      });
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${out}/${width}-playback.png` });
      if (width < 1000) {
        await p.setViewportSize({ width: 844, height: 390 });
        await p.waitForTimeout(1500);
        const rotated = await p
          .locator("[data-founder-video]")
          .evaluate((v) => ({
            time: v.currentTime,
            src: v.currentSrc,
            error: v.error?.message,
          }));
        check(
          "Rotation selects landscape and retains time",
          rotated.src.includes("desktop-v062") &&
            Math.abs(rotated.time - 59.5) < 1 &&
            !rotated.error,
          rotated,
        );
      }
      await p.close();
    }
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    await p.goto("http://127.0.0.1:3000/");
    await dismissIntroduction(p);
    await p.waitForTimeout(1800);
    const cdp = await p.context().newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 100000,
    });
    const started = Date.now();
    await p.evaluate(() => {
      const e = document.querySelector("#background-lines");
      scrollTo({
        top:
          e.getBoundingClientRect().top +
          scrollY +
          (e.offsetHeight - innerHeight) * 0.8,
        behavior: "instant",
      });
    });
    await p.waitForFunction(
      () => {
        const v = document.querySelector("[data-founder-video]");
        return v.currentTime > 0.3 && !v.paused;
      },
      {},
      { timeout: 15000 },
    );
    check(
      "Playback starts on simulated 1.6 Mbps connection",
      Date.now() - started < 15000,
      { startupMs: Date.now() - started },
    );
    await p.close();
  } finally {
    await b.close();
    fs.writeFileSync(
      `${out}/refinements.json`,
      JSON.stringify(results, null, 2),
    );
  }
  console.log(
    `${results.filter((r) => r.pass).length}/${results.length} refinement checks passed`,
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
})();

