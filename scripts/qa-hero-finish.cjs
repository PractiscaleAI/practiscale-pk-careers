const { chromium } = require("@playwright/test");
const sharp = require("sharp");
const fs = require("fs");
const { dismissIntroduction } = require("./qa-helpers.cjs");

(async () => {
  const report = { checks: [], errors: [], boundaries: [] };
  const check = (name, pass, detail) =>
    report.checks.push({ name, pass, detail });
  const dir = "docs/qa/hero-finish";
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({
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
  async function edge(page, name) {
    let rect = await page.locator(".hero-frame").boundingBox();
    const viewport = page.viewportSize();
    if (rect.y < 2 || rect.y >= viewport.height - 2) {
      await page.locator(".hero-frame").scrollIntoViewIfNeeded();
      rect = await page.locator(".hero-frame").boundingBox();
    }
    const png = await page.screenshot({ path: `${dir}/${name}.png` });
    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const before = Math.floor(rect.y) - 1,
      after = Math.ceil(rect.y) + 1;
    if (before < 0 || after >= info.height)
      throw Error("Boundary outside screenshot");
    let maxChannelStep = 0,
      totalStep = 0,
      samples = 0;
    for (let x = Math.ceil(rect.x + 8); x < rect.x + rect.width - 8; x += 4) {
      for (let c = 0; c < 3; c++) {
        const step = Math.abs(
          data[(after * info.width + x) * 3 + c] -
            data[(before * info.width + x) * 3 + c],
        );
        maxChannelStep = Math.max(maxChannelStep, step);
        totalStep += step;
        samples++;
      }
    }
    const result = {
      name,
      maxChannelStep,
      meanChannelStep: totalStep / samples,
      y: rect.y,
      samples,
    };
    report.boundaries.push(result);
    return result;
  }
  try {
    for (const [width, height] of [
      [320, 568],
      [375, 900],
      [430, 932],
      [530, 900],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(e.message));
      await page.goto("http://127.0.0.1:3000/", {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      const current = await edge(page, `${width}-gradient`);
      check(
        `No rectangular lighting step at ${width}px`,
        current.maxChannelStep <= 2,
        current,
      );
      await page.screenshot({
        path: `${dir}/${width}-full.png`,
        fullPage: true,
      });
      const circle = await page.locator(".hero-next-icon").evaluate((el) => {
        const r = el.getBoundingClientRect(),
          svg = el.querySelector("svg").getBoundingClientRect(),
          row = el.closest("a").getBoundingClientRect(),
          block = el.closest(".hero-bottom-right").getBoundingClientRect(),
          s = getComputedStyle(el);
        return {
          width: r.width,
          height: r.height,
          right: r.right,
          rowRight: row.right,
          blockCenterOffset:
            r.top + r.height / 2 - (block.top + block.height / 2),
          border: s.borderTopWidth,
          radius: s.borderTopLeftRadius,
          dx: svg.left + svg.width / 2 - (r.left + r.width / 2),
          dy: svg.top + svg.height / 2 - (r.top + r.height / 2),
        };
      });
      check(
        `Outlined circle and centered arrow at ${width}px`,
        circle.width === 44 &&
          circle.height === 44 &&
          circle.radius === "50%" &&
          circle.border === "1px" &&
          Math.abs(circle.dx) < 1 &&
          Math.abs(circle.dy) < 1 &&
          Math.abs(circle.right - circle.rowRight) < 1,
        circle,
      );
      check(
        `Circular arrow centers against the entire CTA block at ${width}px`,
        Math.abs(circle.blockCenterOffset) < 1,
        circle,
      );
      await page
        .locator(".hero-bottom-right")
        .screenshot({ path: `${dir}/${width}-cta.png` });
      await page.locator(".hero-bottom-right a").focus();
      check(
        `CTA keyboard focus remains visible at ${width}px`,
        await page
          .locator(".hero-bottom-right a")
          .evaluate((el) => getComputedStyle(el).outlineStyle !== "none"),
      );
      if (width === 375) {
        const old = await page.addStyleTag({
          content: ".hero-frame::before{inset:-12% -25% -8%;mask-image:none}",
        });
        const baseline = await edge(page, "375-reproduced-old-boundary");
        check(
          "Regression reproduces the reported clipped glow",
          baseline.maxChannelStep > current.maxChannelStep + 3,
          { old: baseline.maxChannelStep, current: current.maxChannelStep },
        );
        await old.evaluate((el) => el.remove());
      }
      await context.close();
    }
    // Check the actual text bounds as well as the icon center on every breakpoint.
    const alignment = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const ap = await alignment.newPage();
    ap.on("pageerror", (e) => report.errors.push(e.message));
    await ap.goto("http://127.0.0.1:3000/");
    await dismissIntroduction(ap);
    await ap.evaluate(() => document.fonts.ready);
    for (const width of [
      320, 375, 430, 530, 768, 1024, 1192, 1280, 1440, 1920,
    ]) {
      await ap.setViewportSize({ width, height: 900 });
      // Wait for the actual media-query layout after a viewport change.
      // Software-rendered Chrome can acknowledge a resize before applying it.
      await ap.waitForFunction(
        (phone) => {
          const hero = document.querySelector(".hero-scroll");
          return (
            parseFloat(getComputedStyle(hero).marginLeft) ===
              (phone ? 8 : 14) &&
            document.documentElement.scrollWidth <= innerWidth
          );
        },
        width < 768,
        { timeout: 5000 },
      );
      const g = await ap.locator(".hero-bottom-right").evaluate((el) => {
        const box = (s) => {
          const r = el.querySelector(s).getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        const block = el.getBoundingClientRect(),
          i = box(".hero-next-icon"),
          c = box(".eyebrow"),
          l = box(".hero-next-label"),
          a = box("a");
        return {
          icon: i,
          caption: c,
          label: l,
          anchor: a,
          centerOffset: i.top + i.height / 2 - (block.top + block.height / 2),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      check(
        `Caption and label clear the compact icon at ${width}px`,
        Math.max(g.caption.right, g.label.right) <= g.icon.left - 15 &&
          !g.overflow,
        g,
      );
      check(
        `Compact arrow stays centered and inside its link at ${width}px`,
        g.icon.width === 44 &&
          g.icon.height === 44 &&
          Math.abs(g.centerOffset) < 1 &&
          g.icon.top >= g.anchor.top &&
          g.icon.bottom <= g.anchor.bottom + 0.5,
        g,
      );
      await ap
        .locator(".hero-bottom-right")
        .screenshot({ path: `${dir}/${width}-cta-alignment.png` });
      if ([768, 1024, 1440].includes(width))
        await ap.screenshot({ path: `${dir}/${width}-desktop.png` });
      if (width === 320 || width === 430) {
        const extra = await ap.addStyleTag({
          content:
            ".hero-bottom-right span{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}",
        });
        const clear = await ap.locator(".hero-bottom-right").evaluate((el) => {
          const r = (s) => el.querySelector(s).getBoundingClientRect();
          return (
            Math.max(r(".eyebrow").right, r(".hero-next-label").right) <=
            r(".hero-next-icon").left - 15
          );
        });
        check(
          `Enlarged CTA text remains clear of the icon at ${width}px`,
          clear,
        );
        await ap
          .locator(".hero-bottom-right")
          .screenshot({ path: `${dir}/${width}-cta-enlarged.png` });
        await extra.evaluate((el) => el.remove());
      }
    }
    await alignment.close();
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:3000/");
    await dismissIntroduction(page);
    await page.waitForFunction(
      () => document.querySelector(".hero-portrait").dataset.engine === "three",
      undefined,
      { timeout: 20000 },
    );
    await page.evaluate(() => {
      const s = document.querySelector(".hero-visual"),
        f = document.querySelector(".hero-frame");
      const start =
        s.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(f).top);
      const travel = Math.min(
        s.offsetHeight - f.offsetHeight,
        document.documentElement.scrollHeight - innerHeight - start,
      );
      scrollTo({ top: start + travel * 0.45, behavior: "instant" });
    });
    await page.waitForFunction(
      () => Number(document.querySelector(".hero-portrait").dataset.frame) > 40,
      undefined,
      { timeout: 15000 },
    );
    const pinned = await edge(page, "375-pinned-gradient");
    check(
      "Lighting stays seamless while the portrait is pinned",
      pinned.maxChannelStep <= 2,
      pinned,
    );
    await context.close();
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
    fs.writeFileSync(
      "docs/hero-finish-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          checks: report.checks.length,
          failed: report.checks.filter((c) => !c.pass),
          boundaries: report.boundaries,
          errors: report.errors,
          failure: report.failure,
        },
        null,
        2,
      ),
    );
    await browser.close();
  }
})();
