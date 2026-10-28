const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = process.env.HIRING_QA_OUT || "docs/qa/hiring/v068";
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
    const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await c.newPage();
    await p.goto("http://127.0.0.1:3000/#how-hiring-works");
    await dismissIntroduction(p);
    await p.waitForTimeout(2800);
    const jump = async (v) => {
      await p.locator("#how-hiring-works").evaluate(
        (el, v) =>
          scrollTo({
            top:
              el.getBoundingClientRect().top +
              scrollY +
              (el.offsetHeight -
                el.querySelector("[data-hiring-stage]").offsetHeight) *
                v,
            behavior: "instant",
          }),
        v,
      );
      await p.waitForTimeout(750);
    };
    await jump(0);
    const distance = await p.locator('#how-hiring-works').evaluate(el=>el.offsetHeight-el.querySelector('[data-hiring-stage]').offsetHeight);
    check('reading travel is four viewport heights',Math.abs(distance-3600)<2,{distance});
    await p.mouse.wheel(0,400);
    await p.waitForTimeout(850);
    check('400px scroll retains first reading hold',await p.locator('#how-hiring-works').evaluate(el=>el.dataset.active==='0' && Math.abs(+el.dataset.angle+45)<.1));
    await jump(0);
    for (const reverse of [false, true]) {
      const frames = await p.evaluate(async (reverse) => {
        const el = document.querySelector("#how-hiring-works"),
          s = el.querySelector("[data-hiring-stage]");
        const top = scrollY + el.getBoundingClientRect().top,
          travel = el.offsetHeight - s.offsetHeight;
        const frames = [];
        let start;
        await new Promise((resolve) => {
          function frame(now) {
            start ??= now;
            const f = Math.min(1, (now - start) / 1600);
            scrollTo({
              top: top + travel * (reverse ? 1 - f : f),
              behavior: "instant",
            });
            frames.push({
              t: now,
              angle: +el.dataset.angle,
              svg: el
                .querySelector("[data-hiring-pointer]")
                .getAttribute("transform"),
            });
            if (f < 1) requestAnimationFrame(frame);
            else resolve();
          }
          requestAnimationFrame(frame);
        });
        await new Promise((r) => setTimeout(r, 750));
        frames.push({ t: performance.now(), angle: +el.dataset.angle });
        return frames;
      }, reverse);
      const monotonic = frames.every(
        (x, i) =>
          !i ||
          (reverse
            ? x.angle <= frames[i - 1].angle + 0.05
            : x.angle >= frames[i - 1].angle - 0.05),
      );
      const moving = frames.filter(
        (x, i) => i && Math.abs(x.angle - frames[i - 1].angle) > 0.05,
      ).length;
      check(
        (reverse ? "reverse" : "forward") + " continuous sweep",
        monotonic &&
          moving > 15 &&
          Math.abs(frames.at(-1).angle - (reverse ? -45 : 225)) < 0.1,
        {
          monotonic,
          moving,
          maxFrameGap: Math.max(
            ...frames.slice(1, -1).map((x, i) => x.t - frames[i].t),
          ),
        },
      );
    }
    for (const [width, height] of [
      [390, 844],
      [844, 390],
      [1366, 600],
      [1440, 900],
    ]) {
      await p.setViewportSize({ width, height });
      await p.waitForTimeout(500);
      await jump(0.56);
      const m = await p.locator("#how-hiring-works").evaluate((el) => ({
        mode: el.dataset.scroll,
        active: el.dataset.active,
        angle: +el.dataset.angle,
        progress: +el.dataset.progress,
        nativeProgress: -el.getBoundingClientRect().top/(el.offsetHeight-innerHeight),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      check(
        `resize ${width}x${height}`,
        !m.overflow &&
          (m.mode === "false" ||
            (m.active === "2" && Math.abs(m.angle - 135) < 0.1)),
        m,
      );
    }
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForTimeout(500);
    check(
      "live reduced motion releases sticky",
      (await p.locator("#how-hiring-works").getAttribute("data-scroll")) ===
        "false",
    );
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.waitForTimeout(500);
    await jump(0.56);
    const restored = await p.locator('#how-hiring-works').evaluate(el => ({active: el.dataset.active, progress: +el.dataset.progress, nativeProgress: -el.getBoundingClientRect().top/(el.offsetHeight-innerHeight)}));
    check(
      "restored motion retains scroll mapping",
      restored.active === "2",
      restored,
    );
    // A global refresh used to invalidate the scalar tween and leave the dial
    // at zero although native scroll was already inside Task. Exercise rebuilds.
    const rebuilds = [];
    for (let i = 0; i < 8; i++) {
      await p.emulateMedia({ reducedMotion: "reduce" });
      await p.waitForTimeout(500);
      await p.emulateMedia({ reducedMotion: "no-preference" });
      await p.waitForTimeout(500);
      await jump(0.56);
      rebuilds.push(await p.locator('#how-hiring-works').evaluate(el => ({
        progress: +el.dataset.progress,
        nativeProgress: -el.getBoundingClientRect().top/(el.offsetHeight-innerHeight),
      })));
    }
    check('repeated rebuilds retain native scroll progress', rebuilds.every(x => Math.abs(x.progress-x.nativeProgress)<.002), rebuilds);
    check(
      "founder paused offscreen",
      await p.locator("[data-founder-video]").evaluate((v) => v.paused),
    );
    const ids = await p
      .locator("main > section")
      .evaluateAll((es) => es.map((e) => e.id));
    check(
      "existing section order preserved",
      JSON.stringify(ids) ===
        JSON.stringify([
          "",
          "the-problem",
          "who-we-are",
          "career-paths",
          "the-proof",
          "testimonials",
          "background-lines",
          "how-hiring-works",
        ]),
      ids,
    );
    check(
      "no em dash in new copy",
      !(await p.locator("#how-hiring-works").textContent()).includes("\u2014"),
    );
    await p.setViewportSize({ width: 390, height: 844 });
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForTimeout(500);
    await jump(0);
    check(
      "static mobile intro clears navigation",
      await p
        .locator("#how-hiring-works header p")
        .first()
        .evaluate((el) => el.getBoundingClientRect().top >= 96),
    );
    await p
      .locator("#how-hiring-works")
      .screenshot({ path: out + "/mobile-static-full.png" });
    await c.close();
    const n = await b.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const np = await n.newPage();
    await np.goto("http://127.0.0.1:3000/#how-hiring-works");
    check(
      "no JavaScript retains four descriptions",
      (await np.locator("#how-hiring-works li").count()) === 4,
    );
    await n.close();
  } finally {
    await b.close();
  }
  fs.writeFileSync(out + "/edges.json", JSON.stringify(checks, null, 2));
  console.log(
    `${checks.filter((x) => x.pass).length}/${checks.length} edge checks passed`,
  );
  if (checks.some((x) => !x.pass)) process.exitCode = 1;
})();
