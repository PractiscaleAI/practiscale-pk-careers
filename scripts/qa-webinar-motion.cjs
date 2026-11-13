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
const { default: AxeBuilder } = require("@axe-core/playwright");

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

// Agenda conversation: which messages are shown, and is the newest in view?
const chatState = (page) =>
  page.evaluate(() => {
    const root = document.querySelector("[data-va-agenda]");
    const feed = root.querySelector("[data-chat-feed]").parentElement.getBoundingClientRect();
    const shown = (sel) => [...root.querySelectorAll(sel)].filter((el) => getComputedStyle(el).display !== "none");
    const all = shown("[data-chat-q], [data-chat-typing], [data-chat-a], [data-chat-end]");
    const last = all.at(-1)?.getBoundingClientRect();
    return {
      live: root.hasAttribute("data-live"),
      q: shown("[data-chat-q]").length,
      a: shown("[data-chat-a]").length,
      end: shown("[data-chat-end]").length,
      lastInView: !last || (last.top >= feed.top - 1 && last.bottom <= feed.bottom + 1),
    };
  });

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
          seat: op("seat"),
          titleOnTop: layers.every((l) => l.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING),
        };
      });
      assert.equal(st.room + st.seat, 0, `no-JS hero shows the composite: ${JSON.stringify(st)}`);
      assert.ok(st.titleOnTop, "hero title is not above every layer");
      const chat = await chatState(page);
      assert.ok(!chat.live && chat.q === 5 && chat.a === 5 && chat.end === 1, `no-JS agenda hides messages: ${JSON.stringify(chat)}`);
      console.log("ok no-js start pose and full agenda");
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL no-js: ${error.message}`);
    } finally {
      await ctx.close();
    }
  }

  // Reduced motion: the agenda does not pin and shows every message; axe
  // finds no violations in the section.
  {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.locator("#agenda").scrollIntoViewIfNeeded();
      await frames(page, 4);
      const chat = await chatState(page);
      assert.ok(!chat.live && chat.q === 5 && chat.a === 5 && chat.end === 1, `reduced-motion agenda: ${JSON.stringify(chat)}`);
      const axe = await new AxeBuilder({ page }).include("#agenda").analyze();
      assert.equal(axe.violations.length, 0, `axe (agenda): ${axe.violations.map((v) => `${v.id}: ${v.help}`).join("; ")}`);
      console.log("ok reduced-motion agenda + axe");
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL reduced-motion: ${error.message}`);
    } finally {
      await ctx.close();
    }
  }

  // Regression (user report, Nov 2026): on phones her hands must rest on the
  // laptop keys. Compares the settled phone hero's hands area against the
  // approved render. Refresh deliberately with QA_UPDATE_BASELINE=1 after an
  // approved image change.
  {
    const sharp = require("sharp");
    const fs = require("node:fs");
    const baseline = path.join(__dirname, "assets", "va-hero-phone-hands.png");
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        const e = document.querySelector("[data-va-hero]");
        scrollTo(0, (e.offsetHeight - innerHeight) * 0.5);
      });
      await page.waitForFunction(() => document.querySelector('[data-layer="seat"] img').complete);
      await page.waitForTimeout(900);
      const shot = await page.screenshot({ clip: { x: 60, y: 560, width: 300, height: 220 } });
      if (process.env.QA_UPDATE_BASELINE === "1" || !fs.existsSync(baseline)) {
        fs.writeFileSync(baseline, shot);
        console.log("ok phone hands baseline written");
      } else {
        const raw = (b) => sharp(b).removeAlpha().raw().toBuffer();
        const [a, b] = await Promise.all([raw(shot), raw(fs.readFileSync(baseline))]);
        let e = 0;
        for (let i = 0; i < a.length; i++) e += Math.abs(a[i] - b[i]);
        const diff = e / a.length;
        assert.ok(diff < 6, `phone hero hands differ from the approved render (mean diff ${diff.toFixed(1)})`);
        console.log(`ok phone hands on the keys (diff ${diff.toFixed(2)})`);
      }
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL phone hands: ${error.message}`);
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
      // Regression (user report, Nov 2026): her hands must stay on the laptop
      // on every screen — desk and she are one layer, so there is nothing to
      // drift. Guard against the layers being split again.
      const layers = await page.evaluate(() => [...document.querySelectorAll("[data-layer]")].map((l) => l.dataset.layer));
      assert.deepEqual(layers, ["sky", "moon", "city", "room", "seat"], `${tag}: hero layers ${layers}`);

      // Regression (user report, Nov 2026): the message is readable from the
      // first frame, then shares the scene with her; on wide screens the
      // heading ends before she begins.
      for (const p of [0, 0.4, 0.5, 0.6]) {
        await pinTo(page, "[data-va-hero]", p);
        const t = await page.evaluate(() => {
          const big = document.querySelector("[data-va-title] h1 span");
          const r = document.createRange();
          r.selectNodeContents(big);
          const box = r.getBoundingClientRect();
          const cta = document.querySelector("[data-va-title] a").getBoundingClientRect();
          return {
            title: Number(getComputedStyle(document.querySelector("[data-va-title]")).opacity),
            seat: Number(getComputedStyle(document.querySelector('[data-layer="seat"]')).opacity),
            right: box.right / innerWidth,
            left: box.left,
            ctaIn: cta.top >= 0 && cta.bottom <= innerHeight,
            wide: innerWidth >= innerHeight,
          };
        });
        assert.ok(t.title > 0.98, `${tag} hero ${p}: message not readable (${t.title})`);
        assert.ok(t.ctaIn, `${tag} hero ${p}: the reserve button is off screen`);
        assert.ok(t.left >= 0 && t.right <= 1, `${tag} hero ${p}: FROM HOME runs off screen`);
        if (p > 0) assert.ok(t.seat > 0.98, `${tag} hero ${p}: she is not in the scene`);
        if (t.wide && p > 0) assert.ok(t.right <= 0.62, `${tag} hero ${p}: heading runs to ${(t.right * 100).toFixed(0)}% of the width, into her`);
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

      // The conversation only ever grows, ends complete, keeps the newest
      // message fully in view, and fits the screen.
      let prev = { q: 0, a: 0 };
      for (const p of [0.1, 0.3, 0.55, 0.8, 1]) {
        await pinTo(page, "[data-va-agenda]", p);
        await page.waitForTimeout(500);
        await noSideways(page, `${tag} agenda ${p}`);
        const chat = await chatState(page);
        assert.ok(chat.live, `${tag} agenda not live`);
        assert.ok(chat.q >= prev.q && chat.a >= prev.a, `${tag} agenda ${p}: messages went backwards`);
        assert.ok(chat.lastInView, `${tag} agenda ${p}: newest message is cut off`);
        prev = chat;
        await shot(page, `${tag}-agenda-${p}`);
      }
      assert.ok(prev.q === 5 && prev.a === 5 && prev.end === 1, `${tag} agenda incomplete at the end: ${JSON.stringify(prev)}`);

      for (const id of ["requirements", "faq", "reserve"]) {
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
