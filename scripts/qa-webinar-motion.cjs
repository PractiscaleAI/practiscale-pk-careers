/**
 * QA for /virtual-assistent: no sideways scroll, the hero's haze clears
 * while the moon is still rising, she and the title share the scene with
 * the title above her and clear of her on wide screens, the stories reel always focuses the card
 * nearest its focus line, and the career path finishes fully inked.
 *
 * QA_BASE_URL (default http://127.0.0.1:3000) — server to test.
 * QA_ARTIFACTS_DIR — when set, screenshots of every checked state land here.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const url = (process.env.QA_BASE_URL || "http://127.0.0.1:3000") + "/virtual-assistent?still";
const sizes = [
  [1920, 1080],
  [1440, 900],
  [1280, 720],
  [1192, 800],
  [1024, 768],
  [768, 1024],
  [530, 900],
  [390, 844],
  [320, 640],
];

const frames = (page, n = 3) =>
  page.evaluate(
    (count) =>
      new Promise((resolve) => {
        let left = count;
        const step = () => (--left ? requestAnimationFrame(step) : resolve());
        requestAnimationFrame(step);
      }),
    n,
  );

async function pinTo(page, selector, p) {
  await page.locator(selector).evaluate((el, progress) => {
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (el.offsetHeight - innerHeight) * progress, behavior: "instant" });
  }, p);
  await frames(page);
}

async function shot(page, name) {
  if (!process.env.QA_ARTIFACTS_DIR) return;
  await page.screenshot({ path: path.join(process.env.QA_ARTIFACTS_DIR, `va-${name}.png`) });
}

async function noSideways(page, where) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  assert.ok(sw <= cw, `sideways scroll at ${where}: ${sw} > ${cw}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const failures = [];

  // Regression (user report, Nov 2026): if the frame loop has not run — before
  // hydration, in a background tab, or after a script error — the hero must
  // still show its opening pose, never the finished composite over the title.
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1898, height: 835 } });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const st = await page.evaluate(() => {
        const op = (n) => Number(getComputedStyle(document.querySelector(`[data-layer="${n}"]`)).opacity);
        const title = document.querySelector("[data-va-title]");
        const layers = [...document.querySelectorAll("[data-layer]")];
        return {
          room: op("room"),
          desk: op("desk"),
          her: op("her"),
          titleOnTop: layers.every((l) => l.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      assert.equal(st.room + st.desk + st.her, 0, `no-JS hero shows the composite: ${JSON.stringify(st)}`);
      assert.ok(st.titleOnTop, "hero title is not above every layer");
      console.log("ok no-js start pose");
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL no-js: ${error.message}`);
    } finally {
      await ctx.close();
    }
  }

  for (const [w, h] of sizes) {
    const tag = `${w}x${h}`;
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await frames(page, 4);

      // Hero.
      for (const p of [0, 0.12, 0.3, 0.5, 0.66, 0.9]) {
        await pinTo(page, "[data-va-hero]", p);
        await noSideways(page, `${tag} hero ${p}`);
        await shot(page, `${tag}-hero-${p}`);
      }
      await pinTo(page, "[data-va-hero]", 0.18);
      const hero = await page.evaluate(() => ({
        veil: Number(getComputedStyle(document.querySelector("[data-va-veil]")).opacity),
        moon: new DOMMatrix(getComputedStyle(document.querySelector('[data-layer="moon"]')).transform).m42,
      }));
      assert.ok(hero.veil < 0.01, `${tag}: haze not cleared at 0.18 (${hero.veil})`);
      assert.ok(hero.moon > 0, `${tag}: moon already risen when the haze clears`);
      // Regression (user report, Nov 2026): her hands must stay on the laptop,
      // so her layer and the desk layer always share one position.
      for (const p of [0.15, 0.3, 0.85]) {
        await pinTo(page, "[data-va-hero]", p);
        const pair = await page.evaluate(() => [
          document.querySelector('[data-layer="desk"]').style.transform,
          document.querySelector('[data-layer="her"]').style.transform,
        ]);
        assert.equal(pair[0], pair[1], `${tag} hero ${p}: desk and her drift apart`);
      }
      // Regression (user report, Nov 2026): she must be in the scene while
      // FROM HOME reads, and on wide screens the title must end before her.
      for (const p of [0.4, 0.5, 0.6]) {
        await pinTo(page, "[data-va-hero]", p);
        const t = await page.evaluate(() => {
          const h1 = document.querySelector("[data-va-title] h1");
          // Measure only the visible words; the heading also holds visually
          // hidden screen-reader text.
          const r = document.createRange();
          r.selectNodeContents(h1.lastChild);
          const box = r.getBoundingClientRect();
          return {
            title: Number(getComputedStyle(document.querySelector("[data-va-title]")).opacity),
            her: Number(getComputedStyle(document.querySelector('[data-layer="her"]')).opacity),
            right: box.right / innerWidth,
            wide: innerWidth >= innerHeight,
          };
        });
        assert.ok(t.title > 0.98 && t.her > 0.98, `${tag} hero ${p}: title ${t.title} / her ${t.her} not both shown`);
        if (t.wide) assert.ok(t.right <= 0.62, `${tag} hero ${p}: title runs to ${(t.right * 100).toFixed(0)}% of the width, into her`);
      }

      // VSL + metrics.
      await page.locator("#watch").scrollIntoViewIfNeeded();
      await page.locator("[data-va-vsl]").evaluate((el) =>
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.15, behavior: "instant" }),
      );
      await frames(page, 4);
      await page.waitForTimeout(1100);
      await noSideways(page, `${tag} watch`);
      await shot(page, `${tag}-watch`);
      await page.evaluate(() => window.scrollTo({ top: document.querySelector("#watch").offsetTop, behavior: "instant" }));
      await frames(page);
      await page.waitForTimeout(1100);
      await shot(page, `${tag}-watch-head`);

      // Reel: the card nearest the focus line is the one in focus.
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        await pinTo(page, "[data-va-reel]", p);
        await noSideways(page, `${tag} reel ${p}`);
        const r = await page.evaluate(() => {
          const root = document.querySelector("[data-va-reel]");
          const vw = document.documentElement.clientWidth;
          const focus = vw * (vw >= 900 ? 0.58 : 0.5);
          const cards = [...root.querySelectorAll("[data-va-card]")];
          const dist = cards.map((c) => {
            const b = c.getBoundingClientRect();
            return Math.abs(b.left + b.width / 2 - focus);
          });
          const opac = cards.map((c) => Number(c.style.opacity));
          return {
            active: Number(root.dataset.active),
            nearest: dist.indexOf(Math.min(...dist)),
            brightest: opac.indexOf(Math.max(...opac)),
            card: cards[0].getBoundingClientRect(),
          };
        });
        assert.equal(r.active, r.nearest, `${tag} reel ${p}: active ${r.active} != nearest ${r.nearest}`);
        assert.equal(r.brightest, r.nearest, `${tag} reel ${p}: brightest is not nearest`);
        await shot(page, `${tag}-reel-${p}`);
      }

      // Career path.
      for (const p of [0.1, 0.55, 1]) {
        await pinTo(page, "[data-va-path]", p);
        await noSideways(page, `${tag} path ${p}`);
        await shot(page, `${tag}-path-${p}`);
      }
      // Only the composition for this screen shape is shown and animated:
      // landscape draws left → right, portrait top → bottom.
      const route = await page.evaluate(() => {
        const shown = [...document.querySelectorAll("[data-va-path-layout]")].filter((svg) => getComputedStyle(svg).display !== "none");
        const box = shown[0]?.getBoundingClientRect();
        return {
          ids: shown.map((svg) => svg.dataset.vaPathLayout),
          inked: shown.flatMap((svg) => [...svg.querySelectorAll("[data-va-leg]")].map((l) => Number(l.style.strokeDashoffset))),
          size: box ? [box.width, box.height] : [0, 0],
        };
      });
      assert.deepEqual(route.ids, [w >= h ? "land" : "port"], `${tag}: wrong path composition ${route.ids}`);
      assert.ok(route.inked.length === 4 && route.inked.every((v) => v < 0.001), `${tag}: path not fully inked ${route.inked}`);
      assert.ok(route.size[1] > h * 0.3, `${tag}: path drawing too small (${route.size.map(Math.round)})`);

      for (const id of ["requirements", "agenda", "faq", "reserve"]) {
        await page.evaluate((s) => document.getElementById(s).scrollIntoView({ behavior: "instant" }), id);
        await page.waitForTimeout(1100);
        await noSideways(page, `${tag} ${id}`);
        await shot(page, `${tag}-${id}`);
      }
      console.log(`ok ${tag}`);
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL ${tag}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();
  if (failures.length) process.exit(1);
})();
