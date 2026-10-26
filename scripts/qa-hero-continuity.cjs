const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");

const out = path.join(__dirname, "../docs/qa/hero/v053");
const report = {
  method:
    "Four-second continuous native-scroll sweeps in isolated local Chrome. The 40ms case adds asynchronous decoder latency; it is a robustness simulation, not a physical-device benchmark.",
  checks: [],
  cases: [],
  errors: [],
};
function check(name, pass, data) {
  report.checks.push({ name, pass: !!pass, data });
  if (!pass) console.log("FAIL " + name + " " + JSON.stringify(data));
}

(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height, delay] of [
      [1440, 900, 0],
      [1440, 900, 40],
      [390, 844, 0],
    ]) {
      const name = `${width}x${height}, extra decode latency ${delay}ms`;
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(`${name}: ${e.message}`));
      await page.addInitScript((delay) => {
        const stats = {
          frames: [],
          decodes: [],
          textures: 0,
          mipmaps: 0,
          active: 0,
          peakActive: 0,
          live: 0,
          peakLive: 0,
        };
        window.heroContinuity = stats;
        const heroBlobs = new WeakSet(),
          fetchOriginal = window.fetch;
        window.fetch = async function (...args) {
          const response = await fetchOriginal.apply(this, args);
          const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
          if (/\/media\/ceo-prime-v1\/(desktop|mobile)\//.test(url || "")) {
            const blobOriginal = response.blob.bind(response);
            response.blob = async () => {
              const blob = await blobOriginal();
              heroBlobs.add(blob);
              return blob;
            };
          }
          return response;
        };
        const decodeOriginal = window.createImageBitmap;
        window.createImageBitmap = async function (...args) {
          if (!heroBlobs.has(args[0])) return decodeOriginal.apply(this, args);
          const start = performance.now();
          stats.active++;
          stats.peakActive = Math.max(stats.peakActive, stats.active);
          try {
            const bitmap = await decodeOriginal.apply(this, args);
            stats.live++;
            stats.peakLive = Math.max(stats.peakLive, stats.live);
            const closeOriginal = bitmap.close.bind(bitmap);
            let closed = false;
            bitmap.close = () => {
              if (!closed) {
                closed = true;
                stats.live--;
              }
              closeOriginal();
            };
            if (delay)
              await new Promise((resolve) => setTimeout(resolve, delay));
            stats.decodes.push({ start, end: performance.now() });
            return bitmap;
          } finally {
            stats.active--;
          }
        };
        for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
          for (const method of ["createTexture", "generateMipmap"]) {
            const original = type.prototype[method];
            type.prototype[method] = function (...args) {
              if (method === "createTexture") stats.textures++;
              else stats.mipmaps++;
              return original.apply(this, args);
            };
          }
        }
        new MutationObserver(() => {
          const el = document.querySelector(".hero-portrait");
          if (el && !el.__continuityObserved) {
            el.__continuityObserved = true;
            new MutationObserver((list) => {
              for (const m of list)
                if (m.attributeName === "data-frame")
                  stats.frames.push({
                    at: performance.now(),
                    frame: Number(el.dataset.frame),
                  });
            }).observe(el, {
              attributes: true,
              attributeFilter: ["data-frame"],
            });
          }
        }).observe(document, { childList: true, subtree: true });
      }, delay);
      await page.goto("http://127.0.0.1:3000/", {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(
        () =>
          document.querySelector(".hero-portrait")?.dataset.ready === "true",
      );
      await page.waitForTimeout(1500);
      const baseline = await page.evaluate(() => ({
        textures: window.heroContinuity.textures,
        mipmaps: window.heroContinuity.mipmaps,
      }));
      for (const [label, from, to] of [
        ["forward", 0, 0.84],
        ["reverse", 0.84, 0],
      ]) {
        const data = await page.evaluate(
          async ({ label, from, to }) => {
            const phone = innerWidth < 768;
            const scene = document.querySelector(
                phone ? ".hero-visual" : ".hero-scroll",
              ),
              frame = document.querySelector(".hero-frame");
            const pin = phone ? parseFloat(getComputedStyle(frame).top) : 0;
            const start = scrollY + scene.getBoundingClientRect().top - pin;
            const travel = phone
              ? scene.offsetHeight - frame.offsetHeight
              : scene.offsetHeight - innerHeight;
            scrollTo({ top: start + travel * from, behavior: "instant" });
            await new Promise((resolve) => setTimeout(resolve, 800));
            const mark = performance.now();
            await new Promise((resolve) => {
              function tick(now) {
                const progress = Math.min(1, (now - mark) / 4000);
                scrollTo({
                  top: start + travel * (from + (to - from) * progress),
                  behavior: "instant",
                });
                if (progress < 1) requestAnimationFrame(tick);
                else resolve();
              }
              requestAnimationFrame(tick);
            });
            const end = performance.now();
            await new Promise((resolve) => setTimeout(resolve, 800));
            const stats = window.heroContinuity,
              frames = stats.frames.filter(
                (frame) => frame.at >= mark && frame.at <= end,
              ),
              gaps = [];
            let previous = mark;
            for (const frame of frames) {
              gaps.push(frame.at - previous);
              previous = frame.at;
            }
            gaps.push(end - previous);
            const sorted = gaps.toSorted((a, b) => a - b);
            return {
              label,
              mark,
              end,
              renderedFrames: frames.length,
              maxHoldMs: Math.max(...gaps),
              p95HoldMs: sorted[Math.floor(sorted.length * 0.95)],
              frames,
              shown: Number(
                document.querySelector(".hero-portrait").dataset.frame,
              ),
            };
          },
          { label, from, to },
        );
        report.cases.push({ width, height, decodeDelayMs: delay, ...data });
        check(
          `${name}: ${label} keeps presenting frames during scrolling`,
          data.renderedFrames >= (delay ? 40 : 80),
          { renderedFrames: data.renderedFrames },
        );
        check(
          `${name}: ${label} has no long frozen hold`,
          data.maxHoldMs < 500,
          { maxHoldMs: data.maxHoldMs, p95HoldMs: data.p95HoldMs },
        );
        check(
          `${name}: ${label} preserves directional frame order`,
          data.frames.every(
            (frame, i, all) =>
              !i ||
              (label === "forward"
                ? frame.frame > all[i - 1].frame
                : frame.frame < all[i - 1].frame),
          ),
        );
        check(
          `${name}: ${label} settles at its source frame`,
          data.shown === (label === "forward" ? 118 : 0),
          data.shown,
        );
      }
      const resources = await page.evaluate(() => {
        const { active, peakActive, live, peakLive, textures, mipmaps } =
          window.heroContinuity;
        return { active, peakActive, live, peakLive, textures, mipmaps };
      });
      check(
        `${name}: parallel decoding stays bounded`,
        resources.peakActive <= 2,
        resources,
      );
      check(
        `${name}: bitmap memory stays bounded including in-flight work`,
        resources.peakLive <= 10 && resources.live <= 8,
        resources,
      );
      check(
        `${name}: continuous playback reuses its GPU texture`,
        resources.textures === baseline.textures,
        { baseline, resources },
      );
      check(
        `${name}: playback does not rebuild mipmaps`,
        resources.mipmaps === baseline.mipmaps,
        { baseline, resources },
      );
      await page
        .locator(".hero-portrait canvas")
        .evaluate((canvas) =>
          canvas.dispatchEvent(new Event("webglcontextlost")),
        );
      await page.waitForTimeout(300);
      const cleanup = await page.evaluate(() => ({
        live: window.heroContinuity.live,
        active: window.heroContinuity.active,
        engine: document.querySelector(".hero-portrait").dataset.engine,
      }));
      check(
        `${name}: fallback closes all decoded bitmaps`,
        cleanup.live === 0 &&
          cleanup.active === 0 &&
          cleanup.engine === "poster",
        cleanup,
      );
      await context.close();
    }
    check("No runtime errors", report.errors.length === 0, report.errors);
  } catch (error) {
    report.failure = String(error.stack || error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    await fs.writeFile(
      path.join(out, "continuity-qa.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          checks: report.checks,
          errors: report.errors,
          failure: report.failure,
        },
        null,
        2,
      ),
    );
    if (report.checks.some((check) => !check.pass)) process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
