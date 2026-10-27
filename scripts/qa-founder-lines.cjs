const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/founder/v061";
fs.mkdirSync(out, { recursive: true });
let results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.error(name, detail);
};
(async () => {
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [w, h] of [
      [1440, 900],
      [768, 1024],
      [390, 844],
    ]) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto("http://127.0.0.1:3000/");
      await dismissIntroduction(p);
      await p.waitForTimeout(1500);
      const svg = p.locator("[data-line-playback]");
      check(
        `${w}: lines exist before entering`,
        (await svg.locator("path").count()) === 42,
      );
      await p.evaluate(() => {
        const el = document.querySelector("#background-lines");
        scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        });
      });
      await p.waitForTimeout(70);
      const read = () =>
        svg.locator("path").evaluateAll((els) =>
          els.map((e) => {
            const s = getComputedStyle(e);
            return {
              offset: parseFloat(s.strokeDashoffset),
              opacity: +s.opacity,
              delay: parseFloat(s.animationDelay),
              play: s.animationPlayState,
            };
          }),
        );
      const first = await read();
      check(
        `${w}: immediate visible prephased lines`,
        first.every((x) => x.opacity > 0 && x.delay <= 0) &&
          new Set(first.map((x) => Math.round(x.offset))).size > 20,
        first.slice(0, 4),
      );
      await p.screenshot({ path: `${out}/${w}-arrival.png` });
      await p.waitForTimeout(300);
      const moved = await read();
      check(
        `${w}: moves without startup delay`,
        moved.some((x, i) => Math.abs(x.offset - first[i].offset) > 3),
      );
      await p.evaluate(
        () =>
          (window.__founderPath = document.querySelector(
            "[data-line-playback] path",
          )),
      );
      await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await p.waitForTimeout(250);
      const paused = await read();
      await p.waitForTimeout(300);
      const held = await read();
      check(
        `${w}: pauses offscreen`,
        held.every(
          (x, i) =>
            x.play === "paused" && Math.abs(x.offset - paused[i].offset) < 0.1,
        ),
      );
      await p.evaluate(() => {
        const el = document.querySelector("#background-lines");
        scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        });
      });
      await p.waitForTimeout(80);
      check(
        `${w}: return keeps same paths`,
        await p.evaluate(
          () =>
            window.__founderPath ===
            document.querySelector("[data-line-playback] path"),
        ),
      );
      const resumed = await read();
      check(
        `${w}: visible immediately on return`,
        resumed.every((x) => x.opacity > 0 && x.play === "running"),
      );
      await p.emulateMedia({ reducedMotion: "reduce" });
      await p.waitForTimeout(150);
      const still = await read();
      await p.waitForTimeout(250);
      const still2 = await read();
      check(
        `${w}: reduced motion stays static`,
        still2.every(
          (x, i) => Math.abs(x.offset - still[i].offset) < 0.1 && x.opacity > 0,
        ),
      );
      check(`${w}: no browser errors`, errors.length === 0, errors);
      await p.close();
    }
    const p = await b.newPage({ javaScriptEnabled: false });
    await p.goto("http://127.0.0.1:3000/");
    check(
      "Lines included in initial HTML",
      (await p.locator("[data-line-playback] path").count()) === 42,
    );
    await p.close();
  } finally {
    await b.close();
    fs.writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
  }
  console.log(
    `${results.filter((r) => r.pass).length}/${results.length} passed`,
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
})();
