const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("fs");
(async () => {
  const report = { checks: [], errors: [], viewports: [] };
  const check = (name, pass, detail) =>
    report.checks.push({ name, pass, detail });
  const b = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const dir = "docs/qa/mobile-editorial";
  fs.mkdirSync(dir, { recursive: true });
  try {
    for (const [width, height] of [
      [320, 568],
      [348, 740],
      [360, 800],
      [375, 667],
      [390, 844],
      [414, 896],
      [430, 932],
      [530, 900],
    ]) {
      const context = await b.newContext({
          viewport: { width, height },
          reducedMotion: "reduce",
        }),
        p = await context.newPage();
      p.on("pageerror", (e) => report.errors.push(e.message));
      await p.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded" });
      await dismissIntroduction(p);
      await p.evaluate(() => document.fonts.ready);
      const g = await p.evaluate(() => {
        const box = (s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        const link = document.querySelector(".hero-bottom-right a"),
          range = document.createRange();
        range.selectNodeContents(link.querySelector(".hero-next-label"));
        const text = range.getBoundingClientRect(),
          arrow = link.querySelector("svg").getBoundingClientRect();
        return {
          copy: box(".hero-copy"),
          visual: box(".hero-visual"),
          portrait: box(".hero-portrait"),
          trust: box(".hero-trust"),
          footer: box(".hero-bottom-right"),
          action: box(".hero-copy .action"),
          header: box("header"),
          menu: box(".menu-toggle"),
          overflow: document.documentElement.scrollWidth > innerWidth,
          arrowGap: arrow.left - text.right,
          secondaryHeight: link.getBoundingClientRect().height,
          circle: box(".hero-next-icon"),
          labelRight: text.right,
          divider: getComputedStyle(document.querySelector(".hero-topline"))
            .borderTopColor,
          labels: [
            document.querySelector(".hero-copy .action").textContent.trim(),
            document
              .querySelector(".hero-bottom-right .eyebrow")
              .textContent.trim(),
            link.querySelector(".hero-next-label").textContent.trim(),
            document.querySelector(".nav-cta").textContent.trim(),
          ],
          numbers: [...document.querySelectorAll(".trust-card dd")].map(
            (e) => e.textContent,
          ),
          scrollHeight: document.querySelector(".hero-scroll").offsetHeight,
          stageHeight: document.querySelector(".hero-stage").offsetHeight,
        };
      });
      report.viewports.push({ width, height, ...g });
      check(
        `Exact CTA copy ${width}`,
        JSON.stringify(g.labels) ===
          JSON.stringify([
            "Explore training",
            "Your next chapter",
            "Starts with a skill",
            "Apply on WhatsApp",
          ]),
        g.labels,
      );
      check(
        `Exact trust figures ${width}`,
        JSON.stringify(g.numbers) === JSON.stringify(["100+", "46,000"]),
      );
      check(`No horizontal overflow ${width}`, !g.overflow);
      check(
        `Face stays above the lower portrait fade ${width}`,
        g.portrait.top + g.portrait.height * 0.58 <= g.visual.bottom - 80,
        g,
      );
      check(
        `Distinct reading, portrait, proof and invitation zones ${width}`,
        g.visual.top >= g.copy.bottom + 24 &&
          g.trust.top >= g.visual.bottom - 1 &&
          g.footer.top >= g.trust.bottom + 23,
        g,
      );
      check(
        `Reading gutters and proof align ${width}`,
        Math.abs(g.copy.left - g.trust.left) < 1 &&
          Math.abs(g.copy.right - g.trust.right) < 1 &&
          Math.abs(g.copy.left - g.footer.left) < 1,
        g,
      );
      check(
        `Circular secondary arrow balances the full CTA row ${width}`,
        g.circle.width === 44 &&
          g.circle.height === 44 &&
          Math.abs(g.circle.right - g.footer.right) < 1 &&
          g.labelRight <= g.circle.left - 16 &&
          g.secondaryHeight >= 44,
        g,
      );
      check(
        `Touch targets and header clearance ${width}`,
        g.menu.width >= 44 &&
          g.menu.height >= 44 &&
          g.action.height >= 50 &&
          g.header.bottom < g.copy.top,
        g,
      );
      check(
        `No hero header divider ${width}`,
        g.divider === "rgba(0, 0, 0, 0)",
        g.divider,
      );
      check(
        `Reduced motion has no artificial runway ${width}`,
        Math.abs(g.scrollHeight - g.stageHeight) <= 2,
        { scroll: g.scrollHeight, stage: g.stageHeight },
      );
      await p.screenshot({ path: `${dir}/${width}-full.png`, fullPage: true });
      await p
        .getByRole("button", { name: "Open navigation", exact: true })
        .click();
      const panel = p.locator("#main-navigation");
      await panel.waitFor({ state: "visible" });
      check(
        `Menu accessible and fits viewport ${width}`,
        await panel.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight
          );
        }),
      );
      await p.getByRole("button", { name: "Training", exact: true }).click();
      check(
        `Training disclosure works ${width}`,
        await p
          .getByRole("link", { name: "Appointment Setter", exact: true })
          .isVisible(),
      );
      await p.screenshot({ path: `${dir}/${width}-menu.png` });
      await p.keyboard.press("Escape");
      check(
        `Escape closes menu and restores focus ${width}`,
        (await panel.isVisible()) === false &&
          (await p
            .locator(".menu-toggle")
            .evaluate((el) => el === document.activeElement)),
      );
      if (width === 320 || width === 430) {
        await p.addStyleTag({
          content:
            "h1,p,a,button,dt,dd{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}",
        });
        await p.waitForTimeout(200);
        const expanded = await p.evaluate(() => {
          const r = (s) => document.querySelector(s).getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            clear: r(".hero-copy").bottom < r(".hero-visual").top,
            footer: r(".hero-bottom-right").bottom <= r(".hero-stage").bottom,
          };
        });
        check(
          `Enlarged text flows ${width}`,
          !expanded.overflow && expanded.clear && expanded.footer,
          expanded,
        );
        await p.screenshot({
          path: `${dir}/${width}-enlarged.png`,
          fullPage: true,
        });
      }
      await context.close();
    }
    // Sweep every requested CSS width, including both sides of the logo breakpoint.
    const sweep = await b.newPage({
      viewport: { width: 320, height: 812 },
      reducedMotion: "reduce",
    });
    await sweep.goto("http://127.0.0.1:3000/");
    await dismissIntroduction(sweep);
    const badWidths = [];
    for (let width = 320; width <= 430; width++) {
      await sweep.setViewportSize({ width, height: 812 });
      const g = await sweep.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect(),
          h = r("header"),
          l = r("header .brand img"),
          m = r(".menu-toggle");
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          clear: l.right + 7 <= m.left && m.right <= h.right - 8,
        };
      });
      if (g.overflow || !g.clear) badWidths.push({ width, ...g });
    }
    check(
      "Every width from 320 to 430 preserves header clearance and no overflow",
      badWidths.length === 0,
      badWidths,
    );
    await sweep.close();
    const context = await b.newContext({
        viewport: { width: 375, height: 812 },
      }),
      p = await context.newPage();
    p.on("pageerror", (e) => report.errors.push(e.message));
    await p.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded" });
    await dismissIntroduction(p);
    await p.waitForFunction(
      () => document.querySelector(".hero-portrait").dataset.engine === "three",
      undefined,
      { timeout: 20000 },
    );
    const progress = async (f) => {
      await p.evaluate((f) => {
        const scene = document.querySelector(".hero-visual"),
          frame = document.querySelector(".hero-frame");
        const start =
          scene.getBoundingClientRect().top +
          scrollY -
          parseFloat(getComputedStyle(frame).top);
        scrollTo({
          top:
            start +
            Math.max(
              0,
              Math.min(
                scene.offsetHeight - frame.offsetHeight,
                document.documentElement.scrollHeight - innerHeight - start,
              ),
            ) *
              f,
          behavior: "instant",
        });
      }, f);
    };
    for (const [label, f] of [
      ["start", 0],
      ["turn", 0.45],
      ["front", 0.95],
    ]) {
      await progress(f);
      await p.waitForFunction(
        ({ f }) => {
          const n = Number(
            document.querySelector(".hero-portrait").dataset.frame,
          );
          return Math.abs(n - Math.min(119, Math.round((119 * f) / 0.85))) < 4;
        },
        { f },
        { timeout: 20000 },
      );
      const metrics = await p.evaluate(() => {
        const r = document
          .querySelector(".hero-visual")
          .getBoundingClientRect();
        return {
          frame: Number(document.querySelector(".hero-portrait").dataset.frame),
          top: r.top,
          bottom: r.bottom,
          viewport: innerHeight,
        };
      });
      check(
        `Live ${label} portrait remains visible`,
        metrics.bottom > 100 && metrics.top < metrics.viewport - 100,
        metrics,
      );
      await p.screenshot({ path: `${dir}/375-motion-${label}.png` });
    }
    await progress(0.15);
    await p.waitForFunction(
      () => Number(document.querySelector(".hero-portrait").dataset.frame) < 30,
      undefined,
      { timeout: 12000 },
    );
    check("Phone reverse scroll preserves the approved sequence", true);
    await context.close();
    for (const [width, height] of [
      [320, 568],
      [430, 932],
    ]) {
      const c = await b.newContext({ viewport: { width, height } }),
        q = await c.newPage();
      q.on("pageerror", (e) => report.errors.push(e.message));
      await q.goto("http://127.0.0.1:3000/");
      await dismissIntroduction(q);
      await q.waitForFunction(
        () =>
          document.querySelector(".hero-portrait").dataset.engine === "three",
        undefined,
        { timeout: 20000 },
      );
      for (const f of [0, 0.45, 0.95]) {
        await q.evaluate((f) => {
          const s = document.querySelector(".hero-visual"),
            v = document.querySelector(".hero-frame");
          scrollTo({
            top:
              s.getBoundingClientRect().top +
              scrollY -
              parseFloat(getComputedStyle(v).top) +
              Math.max(
                0,
                Math.min(
                  s.offsetHeight - v.offsetHeight,
                  document.documentElement.scrollHeight -
                    innerHeight -
                    (s.getBoundingClientRect().top +
                      scrollY -
                      parseFloat(getComputedStyle(v).top)),
                ),
              ) *
                f,
            behavior: "instant",
          });
        }, f);
        await q.waitForFunction(
          (f) =>
            Math.abs(
              Number(document.querySelector(".hero-portrait").dataset.frame) -
                Math.min(119, Math.round((119 * f) / 0.85)),
            ) < 4,
          f,
          { timeout: 15000 },
        );
        const g = await q.evaluate(() => {
          const h = document.querySelector("header").getBoundingClientRect(),
            p = document
              .querySelector(".hero-portrait")
              .getBoundingClientRect(),
            v = document.querySelector(".hero-frame").getBoundingClientRect();
          return {
            header: h.bottom,
            top: p.top,
            bottom: p.top + p.height * 0.58,
            viewport: innerHeight,
            frameBottom: v.bottom,
          };
        });
        check(
          `Full face in viewport during pinned turn ${width} at ${f}`,
          g.top >= g.header + 20 &&
            g.bottom <= g.viewport - 16 &&
            g.bottom <= g.frameBottom - 80,
          g,
        );
        await q.screenshot({ path: `${dir}/${width}-motion-${f}.png` });
      }
      await c.close();
    }
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
    fs.writeFileSync(
      "docs/mobile-editorial-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          checks: report.checks.length,
          failed: report.checks.filter((c) => !c.pass),
          errors: report.errors,
          failure: report.failure,
        },
        null,
        2,
      ),
    );
    await b.close();
  }
})();
