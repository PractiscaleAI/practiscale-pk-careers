const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
(async () => {
  const results = [];
  const check = (name, pass, detail) => {
    results.push({ name, pass: !!pass, detail });
    if (!pass) console.error("FAIL", name, detail);
  };
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto("http://127.0.0.1:3000/#background-lines");
    await dismissIntroduction(p);
    await p.waitForTimeout(4000);
    await p.mouse.wheel(0, 1);
    const jump = async (n) => {
      await p.evaluate((n) => {
        const r = document.querySelector("#background-lines");
        scrollTo(
          0,
          r.getBoundingClientRect().top +
            scrollY +
            (r.offsetHeight - innerHeight) * n,
        );
      }, n);
      await p.waitForTimeout(700);
    };
    await jump(0.8);
    await p.setViewportSize({ width: 1280, height: 720 });
    await p.waitForTimeout(1000);
    await jump(0);
    check(
      "Resize then reverse reaches original copy",
      await p
        .locator("[data-founder-copy]")
        .evaluate((el) => +getComputedStyle(el).opacity > 0.99),
    );
    check(
      "Resize keeps preview centered",
      await p.locator("[data-founder-slot]").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2;
      }),
    );
    await p.evaluate(() => {
      const root = document.querySelector("#background-lines");
      scrollTo(
        0,
        root.getBoundingClientRect().top +
          scrollY +
          (root.offsetHeight - innerHeight) * 0.85,
      );
    });
    const samples = await p.evaluate(
      () =>
        new Promise((resolve) => {
          const a = [];
          let start = performance.now();
          function frame() {
            a.push(
              +document.querySelector("#background-lines").dataset
                .founderProgress,
            );
            if (performance.now() - start < 700) requestAnimationFrame(frame);
            else resolve(a);
          }
          requestAnimationFrame(frame);
        }),
    );
    check(
      "Fast forward presents monotonic progress",
      samples.every((x, i) => i === 0 || x >= samples[i - 1] - 0.002),
      samples,
    );
    check(
      "Fast forward settles at latest target",
      samples.at(-1) > 0.84 && samples.at(-1) < 0.86,
      samples.at(-1),
    );
    // Wait for the first-frame handoff; this check specifically covers a film
    // that was already playing, not a still-pending autoplay request.
    await p.waitForFunction(
      () => !document.querySelector("[data-founder-video]").paused,
    );
    await p.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    check(
      "Hidden tab pauses film",
      await p.locator("video[data-founder-video]").evaluate((v) => v.paused),
    );
    await p.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForTimeout(700);
    check(
      "Visible tab resumes previously playing film",
      await p.locator("video[data-founder-video]").evaluate((v) => !v.paused),
    );
    await p.setViewportSize({ width: 1280, height: 400 });
    await p.waitForTimeout(800);
    check(
      "Short viewport falls back to normal controls",
      await p
        .locator("#background-lines")
        .evaluate(
          (r) =>
            r.dataset.enhanced !== "true" && r.querySelector("video").controls,
        ),
    );
    await p.close();
    const reduced = await b.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await reduced.goto("http://127.0.0.1:3000/#background-lines");
    await dismissIntroduction(reduced);
    await reduced.waitForTimeout(2500);
    check(
      "Reduced motion uses stationary lines",
      (await reduced
        .locator("#background-lines [data-background-lines]")
        .getAttribute("data-background-lines")) === "static",
    );
    await reduced.close();
    const save = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await save.addInitScript(() =>
      Object.defineProperty(navigator, "connection", {
        value: { saveData: true },
        configurable: true,
      }),
    );
    await save.goto("http://127.0.0.1:3000/#background-lines");
    await dismissIntroduction(save);
    await save.waitForTimeout(2500);
    check(
      "Save Data prevents scroll pin and autoplay",
      await save
        .locator("#background-lines")
        .evaluate(
          (r) =>
            r.dataset.enhanced !== "true" &&
            r.querySelector("video").paused &&
            r.querySelector("video").preload === "none",
        ),
    );
    await save.close();
    const nojs = await b.newPage({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    await nojs.goto("http://127.0.0.1:3000/");
    check(
      "No JavaScript retains founder copy and controlled video",
      (await nojs.locator("#founder-heading").count()) === 1 &&
        (await nojs.locator("[data-founder-video][controls]").count()) === 1,
    );
    await nojs.close();
  } finally {
    await b.close();
    fs.writeFileSync(
      `${process.env.FOUNDER_QA_OUT || "docs/qa/founder/v060"}/edges.json`,
      JSON.stringify(results, null, 2),
    );
  }
  console.log(
    `${results.filter((r) => r.pass).length}/${results.length} edge checks passed`,
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
})();
