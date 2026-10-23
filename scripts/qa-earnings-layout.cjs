const { chromium } = require("@playwright/test");
const { AxeBuilder } = require("@axe-core/playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises"),
  path = require("node:path");
const mode = process.argv[2] || "main",
  out = path.join(__dirname, "../docs/qa/earnings/v050", mode);
const report = { checks: [], errors: [], layouts: [] };
const check = (name, pass, data) => {
  report.checks.push({ name, pass: !!pass, data });
  if (!pass) {
    console.log("FAIL " + name + " " + JSON.stringify(data));
    process.exitCode = 1;
  }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(page, hash = "") {
  await page.goto("http://127.0.0.1:3000/" + hash, {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await dismissIntroduction(page);
  await page.evaluate(() => document.fonts.ready);
  await wait(700);
}
async function move(page, p) {
  await page.evaluate((p) => {
    const r = document.querySelector("[data-laptop-rail]"),
      v = r.querySelector("[data-laptop-viewport]");
    scrollTo({
      top:
        r.getBoundingClientRect().top +
        scrollY +
        (r.offsetHeight - v.offsetHeight) * p,
      behavior: "instant",
    });
  }, p);
  await page.waitForFunction(
    (p) => {
      const r = document.querySelector("[data-laptop-rail]");
      if (r.dataset.mode === "static") return true;
      if (Math.abs(Number(r.dataset.progress) - p) > 0.003) return false;
      if (p >= 0.3 && p < 0.82) {
        const canvas = r.querySelector("[data-laptop-world] canvas");
        return Number(canvas?.dataset.record) === Math.floor((p - 0.3) / 0.052);
      }
      return true;
    },
    p,
    { timeout: 15000 },
  );
}
async function facts(page) {
  return page.evaluate(() => {
    const r = document.querySelector("[data-laptop-rail]"),
      v = r.querySelector("[data-laptop-viewport]");
    const box = (e) => {
      const b = e.getBoundingClientRect();
      return {
        x: b.x,
        y: b.y,
        r: b.right,
        b: b.bottom,
        w: b.width,
        h: b.height,
      };
    };
    const copy = r.querySelector("[data-laptop-copy]"),
      metrics = r.querySelector("[data-laptop-metrics]");
    return {
      w: innerWidth,
      h: innerHeight,
      mode: r.dataset.mode,
      ready: r.dataset.ready,
      p: Number(r.dataset.progress),
      introHidden: r.dataset.introHidden,
      rail: box(r),
      view: box(v),
      copy: box(copy),
      window: box(r.querySelector("[data-laptop-window]")),
      metrics: box(metrics),
      copyClip: getComputedStyle(copy).clipPath,
      metricClip: getComputedStyle(metrics).clipPath,
      stats: [...metrics.querySelectorAll("[data-proof-stat]")].map((e) => ({
        value: e.querySelector("dd").textContent,
        label: e.querySelector("dt").textContent,
        font: parseFloat(getComputedStyle(e.querySelector("dt")).fontSize),
        box: box(e),
      })),
      canvas: r.querySelector("[data-laptop-world] canvas")?.dataset,
      canvases: r.querySelectorAll("[data-laptop-world] canvas").length,
      overflow: document.documentElement.scrollWidth - innerWidth,
      removedCampus: !document.querySelector(
        "[data-proof-world],section#proof-band",
      ),
      audioControls: document.querySelectorAll(
        "[data-laptop-sound],[data-laptop-test],[data-laptop-caption],[data-laptop-index]",
      ).length,
    };
  });
}
async function deviceFill(page) {
  const b = await page.locator("[data-laptop-window]").boundingBox(),
    png = await page.screenshot({
      clip: {
        x: Math.ceil(b.x),
        y: Math.ceil(b.y),
        width: Math.floor(b.width) - 1,
        height: Math.floor(b.height) - 1,
      },
    });
  return page.evaluate(async (encoded) => {
    const bitmap = await createImageBitmap(
        new Blob([Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))], {
          type: "image/png",
        }),
      ),
      c = new OffscreenCanvas(bitmap.width, bitmap.height),
      ctx = c.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const d = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let l = bitmap.width,
      r = -1;
    for (let y = 0; y < bitmap.height; y++)
      for (let x = 0; x < bitmap.width; x++) {
        const i = (y * bitmap.width + x) * 4;
        if (d[i] > 120 && d[i + 1] > 145 && d[i + 2] > 145) {
          l = Math.min(l, x);
          r = Math.max(r, x);
        }
      }
    return (r - l + 1) / bitmap.width;
  }, png.toString("base64"));
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    if (mode === "links") {
      for (const [w, h, hash] of [
        [1440, 900, "#the-proof"],
        [390, 844, "#the-proof"],
        [320, 568, "#the-proof"],
        [1440, 900, "#proof-band"],
        [390, 844, "#proof-band-heading"],
      ]) {
        const ctx = await browser.newContext({
            viewport: { width: w, height: h },
          }),
          p = await ctx.newPage();
        p.on("pageerror", (e) => report.errors.push(String(e)));
        await ready(p, hash);
        await wait(1500);
        const f = await facts(p);
        check(
          `${w}/${hash}: current and legacy links reach the earnings section`,
          Math.abs(f.rail.y) < 3,
          f.rail,
        );
        check(`${w}/${hash}: removed campus stays absent`, f.removedCampus);
        await ctx.close();
      }
      return;
    }
    const sizes =
      mode === "edges"
        ? [[1440, 900]]
        : [
            [360, 800],
            [390, 844],
            [430, 932],
            [768, 1024],
            [1024, 768],
            [1280, 800],
            [1440, 900],
            [1920, 1080],
          ];
    for (const [w, h] of sizes) {
      const ctx = await browser.newContext({
          viewport: { width: w, height: h },
          hasTouch: w < 1024,
        }),
        page = await ctx.newPage();
      page.on("pageerror", (e) =>
        report.errors.push({ width: w, error: String(e) }),
      );
      await ctx.addInitScript(() => {
        window.__audioContexts = 0;
        for (const key of ["AudioContext", "webkitAudioContext"])
          if (window[key])
            window[key] = new Proxy(window[key], {
              construct(t, a) {
                window.__audioContexts++;
                return Reflect.construct(t, a);
              },
            });
      });
      await ready(page, "#the-proof");
      await wait(1000);
      await move(page, 0);
      await page.waitForFunction(
        () => {
          const r = document.querySelector("[data-laptop-rail]");
          return r.dataset.ready === "true" || r.dataset.mode === "static";
        },
        null,
        { timeout: 20000 },
      );
      let f = await facts(page);
      report.layouts.push(f);
      await page.screenshot({ path: path.join(out, `${w}-opening.png`) });
      check(`${w}: campus section and renderer removed`, f.removedCampus);
      check(
        `${w}: exactly four canonical facts`,
        JSON.stringify(f.stats.map((s) => s.value)) ===
          JSON.stringify(["500+", "100+", "46,000", "29"]) &&
          (await page.locator("[data-proof-stat]").count()) === 4,
        f.stats,
      );
      check(
        `${w}: labels remain readable`,
        f.stats.every((s) => s.font >= 16),
      );
      check(`${w}: no horizontal overflow`, f.overflow <= 1, f.overflow);
      check(`${w}: no sound or extra footer controls`, f.audioControls === 0);
      if (f.mode === "static") {
        check(
          `${w}: short-screen fallback has no extended rail`,
          f.rail.h < 1700,
          f.rail,
        );
        await ctx.close();
        continue;
      }
      check(
        `${w}: copy and device have separate space`,
        w < h ? f.copy.b + 20 <= f.window.y : f.copy.r + 20 <= f.window.x,
        f,
      );
      check(
        `${w}: facts fit below the opening with clear gutters`,
        f.stats.every(
          (s) =>
            s.box.y >= Math.max(f.copy.b, f.window.b) + 15 && s.box.b <= h - 20,
        ),
        f,
      );
      if (w < h) {
        const fill = await deviceFill(page);
        check(
          `${w}: closed device fills its opening panel`,
          fill >= 0.65,
          fill,
        );
      }
      check(
        `${w}: forward-facing laptop`,
        f.canvas?.frontYaw === "0",
        f.canvas,
      );
      for (const p of [0.02, 0.04, 0.06]) {
        await move(page, p);
        f = await facts(page);
        check(
          `${w}/${p}: complete text groups clear the expanding laptop`,
          f.metrics.y >= f.window.b - 1 &&
            (f.copy.b <= f.window.y + 1 || f.copy.r <= f.window.x + 1),
          f,
        );
      }
      await page.screenshot({ path: path.join(out, `${w}-intro-exit.png`) });
      await move(page, 0.15);
      f = await facts(page);
      check(
        `${w}: both text groups leave when expansion completes`,
        f.introHidden === "true" && f.copy.b < 0 && f.metrics.y > h,
        f,
      );
      check(
        `${w}: laptop window fits the viewport`,
        Math.abs(f.window.w - w) < 2 &&
          Math.abs(f.window.h - h) < 2 &&
          Math.abs(f.window.x) < 2 &&
          Math.abs(f.window.y) < 2,
        f.window,
      );
      await move(page, 0.44);
      f = await facts(page);
      await page.screenshot({ path: path.join(out, `${w}-earnings.png`) });
      check(
        `${w}: earnings begin after the lid opens`,
        Number(f.canvas?.record) >= 0 && Number(f.canvas?.lidOpen) > 0.9,
        f.canvas,
      );
      await move(page, 0.88);
      await page.screenshot({ path: path.join(out, `${w}-summary.png`) });
      await move(page, 0);
      f = await facts(page);
      check(
        `${w}: reverse scroll restores both text groups`,
        f.introHidden === "false" &&
          f.metrics.y >= 0 &&
          f.metrics.b <= h - 20 &&
          f.copy.y >= 80 &&
          f.copyClip === f.metricClip,
        f,
      );
      if (w === 390 || w === 1440) {
        const axe = await new AxeBuilder({ page }).analyze();
        check(
          `${w}: full-page accessibility`,
          axe.violations.length === 0,
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        );
      }
      if (mode === "edges") {
        const records = [];
        for (let i = 0; i < 10; i++) {
          await move(page, 0.3 + (i + 0.5) * 0.052);
          records.push(Number((await facts(page)).canvas?.record));
        }
        check(
          "All ten original records render in order",
          records.every((n, i) => n === i),
          records,
        );
        const before = await facts(page);
        await page.setViewportSize({ width: 1280, height: 800 });
        await wait(900);
        check(
          "Active resize preserves progress",
          Math.abs((await facts(page)).p - before.p) < 0.02,
        );
        await move(page, 0);
        const styles = await page.addStyleTag({
          content:
            "[data-proof-stat] dt{font-size:48px!important;line-height:1.8!important}[data-proof-stat] dd{font-size:112px!important}",
        });
        await wait(900);
        check(
          "Enlarged statistics release the pin",
          (await facts(page)).mode === "static",
        );
        check(
          "Content-fit fallback disposes the renderer",
          (await facts(page)).canvases === 0,
        );
        await styles.evaluate((e) => e.remove());
        await page.waitForFunction(
          () =>
            document.querySelector("[data-laptop-rail]").dataset.ready ===
            "true",
          null,
          { timeout: 15000 },
        );
        await wait(700);
        check(
          "Restoring text size recovers one live laptop",
          (await facts(page)).canvases === 1 &&
            (await facts(page)).mode === "motion",
        );
        await page.locator('a[href="#proof-end"]').focus();
        await page.keyboard.press("Enter");
        await wait(400);
        check(
          "Keyboard skip reaches the end",
          (await page.evaluate(() => document.activeElement?.id)) ===
            "proof-end",
        );
        check(
          "No audio contexts are created",
          (await page.evaluate(() => window.__audioContexts)) === 0,
        );
      }
      await ctx.close();
      console.log(`Earnings ${w} complete`);
    }
    if (mode === "main")
      for (const kind of ["reduced", "no-js", "save-data", "webgl-failure"]) {
        const ctx = await browser.newContext({
          viewport: { width: 390, height: 844 },
          javaScriptEnabled: kind !== "no-js",
          reducedMotion: kind === "reduced" ? "reduce" : "no-preference",
        });
        if (kind === "save-data")
          await ctx.addInitScript(() =>
            Object.defineProperty(navigator, "connection", {
              value: { saveData: true },
              configurable: true,
            }),
          );
        if (kind === "webgl-failure")
          await ctx.addInitScript(() => {
            const get = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
              return /webgl/.test(type) ? null : get.call(this, type, ...args);
            };
          });
        const page = await ctx.newPage();
        if (kind === "no-js") await page.goto("http://127.0.0.1:3000/");
        else await ready(page, "#the-proof");
        await page
          .locator("#the-proof")
          .evaluate((e) =>
            e.scrollIntoView({ block: "start", behavior: "instant" }),
          );
        await wait(1500);
        const f = await facts(page);
        check(
          `${kind}: normal-flow fallback retains all four facts`,
          f.mode === "static" && f.rail.h < 1700 && f.stats.length === 4,
          f,
        );
        check(
          `${kind}: masks reset`,
          !f.copyClip.includes("100%") && !f.metricClip.includes("100%"),
        );
        await page.screenshot({ path: path.join(out, `${kind}.png`) });
        await ctx.close();
      }
  } catch (error) {
    report.fatal = String(error);
    console.error(error);
  } finally {
    await browser.close();
    await fs.writeFile(
      path.join(out, "report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify({
        checks: report.checks.length,
        failed: report.checks.filter((c) => !c.pass).length,
        errors: report.errors.length,
        fatal: report.fatal,
      }),
    );
  }
  if (
    report.fatal ||
    report.errors.length ||
    report.checks.some((c) => !c.pass)
  )
    process.exitCode = 1;
})();
