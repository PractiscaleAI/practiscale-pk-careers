const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = process.env.WHO_QA_OUT || "docs/qa/who-we-are/v066";
const results = [];
const errors = [];
const check = (name, pass, detail) => {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.log("FAIL", name, detail);
};
async function jump(p, f) {
  await p.evaluate((f) => {
    const r = document.querySelector("[data-who-rail]"),
      v = r.querySelector("[data-who-viewport]"),
      intro = r.querySelector("[data-who-introduction]")?.offsetHeight || 0;
    scrollTo({
      top:
        r.getBoundingClientRect().top +
        scrollY +
        intro +
        parseFloat(r.style.getPropertyValue("--who-travel")) * f,
      behavior: "instant",
    });
  }, f);
  await p.waitForTimeout(900);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [w, h] of [
      [390, 844],
      [360, 800],
      [550, 694],
      [320, 568],
      [430, 932],
      [768, 1024],
      [844, 390],
      [1440, 900],
      [1366, 600],
    ]) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      p.on("pageerror", (e) => errors.push(e.message));
      const requests = [];
      p.on("request", (r) => {
        if (r.url().includes("/who-we-are/") && r.url().endsWith(".mp4"))
          requests.push(r.url());
      });
      await p.goto("http://127.0.0.1:3000/");
      await dismissIntroduction(p);
      await p.waitForTimeout(1500);
      check(`${w}: no office download at page start`, requests.length === 0, [
        ...requests,
      ]);
      await p.locator("#who-we-are").evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await p.waitForTimeout(800);
      await p.screenshot({ path: `${out}/${w}-introduction.png` });
      check(
        `${w}: one heading and no overflow`,
        await p.evaluate(
          () =>
            document.querySelectorAll("#who-heading").length === 1 &&
            document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await jump(p, 0);
      await p.waitForFunction(
        () =>
          document.querySelector("[data-who-rail]").dataset.ready === "true",
        {},
        { timeout: 30000 },
      );
      const start = await p.locator("[data-who-rail]").evaluate((r) => {
        const v = r.querySelector("video");
        return {
          mode: r.dataset.mode,
          time: v.currentTime,
          src: v.currentSrc,
          duration: v.duration,
          width: v.videoWidth,
          height: v.videoHeight,
          travel: r.style.getPropertyValue("--who-travel"),
        };
      });
      check(
        `${w}: correct rendition and motion`,
        start.mode === "motion" &&
          start.src.includes(
            w < 1024 ? "office-mobile-v066" : "office-scroll-v2",
          ) &&
          start.time < 0.05,
        start,
      );
      check(
        `${w}: only matching film downloaded`,
        requests.every((x) =>
          x.includes(w < 1024 ? "office-mobile-v066" : "office-scroll-v2"),
        ),
        [...requests],
      );
      await p.screenshot({ path: `${out}/${w}-opening.png` });
      for (const f of [0.1, 0.2, 0.5, 0.94, 0]) {
        await jump(p, f);
        await p.waitForFunction(
          () => {
            const r = document.querySelector("[data-who-rail]"),
              v = r.querySelector("video");
            return (
              !v.seeking &&
              Math.abs(v.currentTime - Number(r.dataset.targetTime)) < 0.08
            );
          },
          {},
          { timeout: 15000 },
        );
        const s = await p.locator("[data-who-rail]").evaluate((r) => {
          const v = r.querySelector("video"),
            frame = r.querySelector("[data-who-frame]").getBoundingClientRect();
          return {
            progress: +r.dataset.progress,
            time: v.currentTime,
            paused: v.paused,
            target: +r.dataset.targetTime,
            expanded: r.dataset.expanded,
            frame: {
              x: frame.x,
              y: frame.y,
              width: frame.width,
              height: frame.height,
            },
          };
        });
        check(
          `${w}: scroll pose ${f}`,
          s.paused &&
            Math.abs(s.progress - f) < 0.003 &&
            (f < 0.205 ? s.time < 0.05 : true),
          s,
        );
        if (f === 0.1) {
          const backing = await p.locator('[data-who-rail]').evaluate(r =>
            ['frame','matte'].map(n => getComputedStyle(r.querySelector(`[data-who-${n}]`)).backgroundColor));
          check(`${w}: no black expansion backing`, backing.every(c => c === 'rgb(19, 65, 67)'), backing);
          if (w < 1024) {
            const edgeError = await p.locator('[data-who-rail]').evaluate(r=>{
              const frame=r.querySelector('[data-who-frame]'),surface=r.querySelector('[data-who-surface]');
              const f=frame.getBoundingClientRect(),s=surface.getBoundingClientRect();
              const values=frame.style.clipPath.match(/inset\(([^r]+)round/)[1].trim().split(/\s+/).map(parseFloat);
              const [top,right=top,bottom=top,left=right]=values;
              return Math.max(Math.abs(f.top+top-Math.max(f.top,s.top)),Math.abs(f.right-right-Math.min(f.right,s.right)),Math.abs(f.bottom-bottom-Math.min(f.bottom,s.bottom)),Math.abs(f.left+left-Math.max(f.left,s.left)));
            });
            check(`${w}: expansion edge follows film without empty bands`,edgeError<1,edgeError);
          }
          await p.screenshot({path: `${out}/${w}-expanding.png`});
        }
        if (w < 1024 && f >= 0.2) {
          const fit = await p.locator('[data-who-rail]').evaluate(r => {
            const viewport=r.querySelector('[data-who-viewport]').getBoundingClientRect();
            const surface=r.querySelector('[data-who-surface]').getBoundingClientRect();
            const frame=r.querySelector('[data-who-frame]');
            const insets=frame.style.clipPath.match(/inset\(([^r)]+)/)[1].trim().split(/\s+/).map(parseFloat);
            const panel = new DOMMatrix(getComputedStyle(r.querySelector('[data-who-panel="left"]')).transform);
            return {coverage:[viewport.left-surface.left,viewport.top-surface.top,surface.right-viewport.right,surface.bottom-viewport.bottom],insets,panelX:panel.m41,width:viewport.width};
          });
          check(`${w}: expanded film covers viewport at ${f}`,fit.coverage.every(n=>n>=-1)&&fit.insets.every(n=>Math.abs(n)<1),fit);
          check(`${w}: split panels fully clear at ${f}`,Math.abs(fit.panelX)>=fit.width,fit);
        }
        if (f === 0.2 || f === 0.5 || f === 0.94)
          await p.screenshot({ path: `${out}/${w}-${f}.png` });
      }
      if (w === 390) {
        // Observe presented media frames during continuous native scrolling, not only seek targets.
        await jump(p, 0.25);
        const sweeps = await p.evaluate(async () => {
          const r = document.querySelector("[data-who-rail]"),
            v = r.querySelector("video");
          const samples = [];
          let running = true;
          function capture(_, m) {
            samples.push({
              time: m.mediaTime,
              now: performance.now(),
              scroll: scrollY,
            });
            if (running) v.requestVideoFrameCallback(capture);
          }
          v.requestVideoFrameCallback(capture);
          const base =
              r.getBoundingClientRect().top +
              scrollY +
              (r.querySelector("[data-who-introduction]")?.offsetHeight || 0),
            travel = parseFloat(r.style.getPropertyValue("--who-travel"));
          const sweep = (a, z) =>
            new Promise((resolve) => {
              const start = performance.now();
              function step(now) {
                const t = Math.min(1, (now - start) / 3000);
                scrollTo(0, base + travel * (a + (z - a) * t));
                if (t < 1) requestAnimationFrame(step);
                else setTimeout(resolve, 700);
              }
              requestAnimationFrame(step);
            });
          await sweep(0.25, 0.85);
          const split = samples.length;
          await sweep(0.85, 0.25);
          running = false;
          return {
            forward: samples.slice(0, split),
            reverse: samples.slice(split),
          };
        });
        for (const dir of ["forward", "reverse"]) {
          const a = sweeps[dir];
          const backwards = a.filter(
            (s, i) =>
              i > 0 &&
              (dir === "forward"
                ? s.scroll > a[i - 1].scroll
                : s.scroll < a[i - 1].scroll) &&
              (dir === "forward"
                ? s.time < a[i - 1].time - 0.04
                : s.time > a[i - 1].time + 0.04),
          );
          check(
            `Phone ${dir}: presented frames follow scroll`,
            a.length >= 20 && backwards.length === 0,
            {
              updates: a.length,
              backwards,
              maxGap: Math.max(
                0,
                ...a.slice(1).map((s, i) => s.now - a[i].now),
              ),
            },
          );
        }
        fs.writeFileSync(
          `${out}/continuity.json`,
          JSON.stringify(sweeps, null, 2),
        );
      }
      await p.close();
    }
    for (const kind of ["reduced", "save-data", "failed"]) {
      const p = await b.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: kind === "reduced" ? "reduce" : "no-preference",
      });
      if (kind === "save-data")
        await p.addInitScript(() =>
          Object.defineProperty(navigator, "connection", {
            value: { saveData: true },
            configurable: true,
          }),
        );
      if (kind === "failed")
        await p.route("**/who-we-are/*.mp4", (r) => r.abort("failed"));
      await p.goto("http://127.0.0.1:3000/");
      await dismissIntroduction(p);
      await p.waitForTimeout(1800);
      await p.locator("#who-we-are").evaluate((e) => e.scrollIntoView());
      await p.waitForTimeout(2000);
      if (kind === "failed")
        await p.waitForFunction(
          () => document.querySelector("[data-who-error]").hidden === false,
        );
      check(
        `${kind}: readable native fallback`,
        await p
          .locator("[data-who-rail]")
          .evaluate(
            (r) =>
              r.dataset.mode === "static" &&
              r.querySelector("video").controls &&
              r.querySelector("video").paused,
          ),
      );
      await p.screenshot({ path: `${out}/${kind}.png` });
      await p.close();
    }
  } catch (e) {
    errors.push(String(e));
    console.log(e);
  } finally {
    await b.close();
    fs.writeFileSync(
      `${out}/report.json`,
      JSON.stringify({ results, errors }, null, 2),
    );
  }
  console.log(
    `${results.filter((x) => x.pass).length}/${results.length} checks; ${errors.length} errors`,
  );
  if (errors.length || results.some((x) => !x.pass)) process.exitCode = 1;
})();
