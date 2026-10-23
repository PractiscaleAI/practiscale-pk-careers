const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");

const url = "http://127.0.0.1:3000/";
const output = "docs/qa/earnings";
const report = { checks: [], errors: [], screenshots: [] };
const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
  if (!pass) throw Error(`${name}: ${JSON.stringify(detail)}`);
};
async function open(browser, viewport, options = {}, init) {
  const context = await browser.newContext({ viewport, ...options });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  const requests = [];
  page.on("request", (req) => {
    if (/\/earnings-v7\/.*frame-\d+\.webp/.test(req.url()))
      requests.push(req.url());
  });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  if (options.javaScriptEnabled !== false) {
    await dismissIntroduction(page);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
  }
  return {
    context,
    page,
    requests,
    rail: page.locator("[data-earnings-scroll]"),
  };
}
async function seek(page, expansion, playback = 0) {
  for (let i = 0; i < 2; i++) {
    await page.locator("[data-earnings-scroll]").evaluate(
      (el, { expansion, playback }) => {
        const top = el.getBoundingClientRect().top + scrollY;
        scrollTo({
          top:
            top +
            Number(el.dataset.expandTravel) * expansion +
            Number(el.dataset.playTravel) * playback,
          behavior: "instant",
        });
      },
      { expansion, playback },
    );
    await page.waitForTimeout(160);
  }
}
async function settled(page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("[data-earnings-scroll]");
      return (
        el.dataset.target === el.dataset.drawn && el.dataset.ready === "true"
      );
    },
    { timeout: 12000 },
  );
}
async function metrics(rail) {
  return rail.evaluate((el) => {
    const rect = (selector) => {
      const b = el.querySelector(selector).getBoundingClientRect();
      return {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        right: b.right,
        bottom: b.bottom,
      };
    };
    return {
      data: { ...el.dataset },
      surface: rect("[data-earnings-surface]"),
      slot: rect("[data-earnings-slot]"),
      copy: rect("[data-earnings-copy]"),
      overflow: document.documentElement.scrollWidth - innerWidth,
      copyOpacity: getComputedStyle(el.querySelector("[data-earnings-copy]"))
        .opacity,
    };
  });
}
async function screenshot(page, name) {
  await page.screenshot({ path: `${output}/${name}.png` });
  report.screenshots.push(`${name}.png`);
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    for (const [width, height] of [
      [1440, 900],
      [1920, 1080],
      [1536, 696],
      [768, 1024],
      [1024, 1366],
      [667, 375],
      [844, 390],
      [375, 812],
      [320, 568],
    ]) {
      const { context, page, rail, requests } = await open(browser, {
        width,
        height,
      });
      const label = `${width}x${height}`;
      check(
        `${label}: supplied frame indicator is the only progress treatment`,
        (await page
          .locator(
            '#the-proof [data-earnings-playhead],#the-proof [role="progressbar"]',
          )
          .count()) === 0,
      );
      check(
        `${label}: exact heading`,
        (await page.locator("#proof-heading").textContent()) ===
          "What our closers actually took home",
      );
      check(
        `${label}: exact supporting copy`,
        (
          await page.locator("#the-proof [data-earnings-copy]").innerText()
        ).includes(
          "Real commissions paid to our sales team. Not projections. Not averages.",
        ),
      );
      check(
        `${label}: earnings follows career paths`,
        await page.evaluate(
          () =>
            document.querySelector("#career-paths").nextElementSibling.id ===
            "the-proof",
        ),
      );
      await seek(page, 0);
      await settled(page);
      let m = await metrics(rail);
      check(`${label}: motion enabled`, m.data.mode === "motion", m.data);
      check(`${label}: no overflow`, m.overflow === 0, m);
      check(
        `${label}: starts smaller than viewport`,
        m.surface.width < width - 20 && m.surface.height < height - 20,
        m.surface,
      );
      check(
        `${label}: requested initial layout`,
        width < 768 && height > width
          ? m.copy.bottom < m.slot.y
          : m.copy.right < m.slot.x,
        m,
      );
      check(
        `${label}: intro frame zero`,
        m.data.target === "0" && m.data.drawn === "0",
        m.data,
      );
      await screenshot(page, `${label}-entry`);
      await seek(page, 0.5);
      await settled(page);
      m = await metrics(rail);
      check(
        `${label}: expansion holds original first frame`,
        m.data.target === "0" && m.data.drawn === "0",
        m.data,
      );
      check(
        `${label}: copy clears before overlap`,
        Number(m.copyOpacity) === 0,
        m.copyOpacity,
      );
      if (width === 1440 || width === 375)
        await screenshot(page, `${label}-expanding`);
      await seek(page, 1);
      await settled(page);
      m = await metrics(rail);
      check(
        `${label}: surface fills viewport before playback`,
        Math.abs(m.surface.width - width) < 2 &&
          Math.abs(m.surface.height - height) < 2 &&
          Math.abs(m.surface.x) < 2 &&
          Math.abs(m.surface.y) < 2 &&
          Number(m.data.target) <= 1,
        m,
      );
      const sequence = [];
      for (const p of [0.15, 0.37, 0.62, 0.85, 1]) {
        await seek(page, 1, p);
        await settled(page);
        m = await metrics(rail);
        sequence.push(Number(m.data.drawn));
        check(
          `${label}: exact supplied frame at ${p}`,
          Math.abs(Number(m.data.drawn) - Math.round(p * 599)) <= 1,
          m.data,
        );
        check(
          `${label}: bounded decoded frames`,
          Number(m.data.cached) <= (m.data.variant === "mobile" ? 12 : 16) &&
            Number(m.data.inflight) <= 3,
          m.data,
        );
      }
      check(
        `${label}: chapters advance in source order`,
        sequence.every((v, i) => !i || v > sequence[i - 1]),
        sequence,
      );
      await screenshot(page, `${label}-ending`);
      const still = await rail.getAttribute("data-target");
      await page.waitForTimeout(700);
      check(
        `${label}: scroll-driven, no autoplay`,
        (await rail.getAttribute("data-target")) === still,
      );
      await seek(page, 1, 0.37);
      await settled(page);
      await screenshot(page, `${label}-playback`);
      check(
        `${label}: reverses to the same source frame`,
        Math.abs(Number(await rail.getAttribute("data-drawn")) - 222) <= 1,
      );
      await seek(page, 0);
      await settled(page);
      m = await metrics(rail);
      check(
        `${label}: reverse restores opening`,
        m.data.target === "0" && Number(m.copyOpacity) === 1,
        m.data,
      );
      const expected = height > width ? "mobile" : "desktop";
      check(
        `${label}: only matching source sequence requested`,
        requests.length > 0 &&
          requests.every((v) => v.includes(`/earnings-v7/${expected}/`)),
        requests.filter((v) => !v.includes(`/${expected}/`)),
      );
      await page.mouse.wheel(0, Math.round(height * 2));
      await page.waitForTimeout(600);
      check(
        `${label}: native wheel controls playback`,
        Number(await rail.getAttribute("data-target")) > 0,
      );
      const before = Number(await rail.getAttribute("data-target"));
      if (width === 1440) {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(700);
        await settled(page);
        check(
          "Desktop-to-mobile resize preserves story position",
          Math.abs(Number(await rail.getAttribute("data-target")) - before) < 4,
          { before, after: await rail.getAttribute("data-target") },
        );
        check(
          "Only one earnings canvas after resize",
          (await page.locator("#the-proof canvas").count()) === 1,
        );
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(700);
      }
      const skip = page.locator("[data-earnings-skip]");
      await skip.focus();
      await page.keyboard.press("Enter");
      check(
        `${label}: keyboard skip focuses earnings records`,
        await page
          .locator("#proof-records")
          .evaluate((el) => document.activeElement === el),
      );
      await page.locator("#proof-records summary").click();
      check(
        `${label}: all ten exact records available`,
        (await page.locator("#proof-records li").count()) === 10 &&
          (await page.locator("#proof-records").innerText()).includes(
            "9,596,865",
          ),
      );
      await context.close();
    }
    for (const [name, options, init] of [
      ["reduced-motion", { reducedMotion: "reduce" }, undefined],
      [
        "save-data",
        {},
        () =>
          Object.defineProperty(navigator, "connection", {
            value: {
              saveData: true,
              addEventListener() {},
              removeEventListener() {},
            },
          }),
      ],
    ]) {
      const { context, page, rail, requests } = await open(
        browser,
        { width: 375, height: 812 },
        options,
        init,
      );
      await page.locator("#the-proof").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      check(
        `${name}: no extended scroll scene`,
        (await rail.getAttribute("data-mode")) === "static" &&
          (await rail.getAttribute("data-reason")) === name,
      );
      check(
        `${name}: no animation frames fetched`,
        requests.every((v) => v.endsWith("frame-0000.webp")),
        requests,
      );
      check(
        `${name}: final poster shown`,
        (
          await page.locator("[data-earnings-poster]").getAttribute("src")
        ).endsWith("poster.webp"),
      );
      await page.locator("#proof-records summary").click();
      check(
        `${name}: records readable`,
        (await page.locator("#proof-records li").count()) === 10,
      );
      const axe = await new AxeBuilder({ page })
        .include("#the-proof")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      check(
        `${name}: accessibility scan`,
        axe.violations.length === 0,
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      await screenshot(page, name);
      await context.close();
    }
    for (const [width, height] of [
      [375, 812],
      [1024, 1366],
      [1440, 900],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      await page.goto(`${url}#the-proof`, { waitUntil: "networkidle" });
      await dismissIntroduction(page);
      await page.waitForFunction(() => {
        const rect = document
          .getElementById("the-proof")
          .getBoundingClientRect();
        return Math.abs(rect.top) < 2;
      });
      await page.waitForTimeout(500);
      check(
        `Deep link lands on the proof introduction ${width}`,
        await page.locator("#proof-heading").evaluate((el) => {
          const box = el.getBoundingClientRect();
          return (
            box.top >= 0 &&
            box.bottom < innerHeight &&
            Math.abs(
              document.getElementById("the-proof").getBoundingClientRect().top,
            ) < 2
          );
        }),
      );
      check(
        `Deep link preserves starting frame ${width}`,
        (await page
          .locator("[data-earnings-scroll]")
          .getAttribute("data-target")) === "0",
      );
      await context.close();
    }
    const textCase = await open(browser, { width: 375, height: 812 });
    await seek(textCase.page, 1, 0.35);
    await textCase.page.addStyleTag({
      content:
        "#the-proof [data-earnings-copy] h2{font-size:64px!important} #the-proof [data-earnings-copy] p{font-size:28px!important;line-height:1.8!important;letter-spacing:.12em!important}",
    });
    await textCase.page.waitForFunction(
      () =>
        document.querySelector("[data-earnings-scroll]").dataset.mode ===
        "static",
    );
    check(
      "Enlarged copy releases the pin instead of collapsing the preview",
      (await textCase.rail.getAttribute("data-reason")) === "content-fit",
    );
    check(
      "Enlarged copy and supplied poster remain visible",
      (await textCase.page
        .locator("[data-earnings-copy]")
        .evaluate((el) => getComputedStyle(el).opacity === "1")) &&
        (await textCase.page
          .locator("[data-earnings-poster]")
          .evaluate((el) => el.getBoundingClientRect().height > 200)),
    );
    check(
      "Enlarged text keeps the whole page within its viewport",
      await textCase.page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await textCase.context.close();

    const nojs = await open(
      browser,
      { width: 375, height: 812 },
      { javaScriptEnabled: false },
    );
    await nojs.page.locator("#the-proof").scrollIntoViewIfNeeded();
    check(
      "No JavaScript: real copy and supplied picture",
      (await nojs.page.locator("#proof-heading").isVisible()) &&
        (await nojs.page.locator("[data-earnings-poster]").isVisible()),
    );
    await nojs.page.locator("#proof-records summary").click();
    check(
      "No JavaScript: full earnings breakdown works",
      (await nojs.page.locator("#proof-records li").count()) === 10,
    );
    await nojs.context.close();

    const failure = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    await failure.route("**/earnings-v7/**/frame-*.webp", (route) =>
      route.request().url().endsWith("frame-0000.webp")
        ? route.continue()
        : route.fulfill({ status: 503, body: "Unavailable" }),
    );
    const fp = await failure.newPage();
    await fp.goto(url, { waitUntil: "networkidle" });
    await dismissIntroduction(fp);
    await fp.waitForTimeout(400);
    await seek(fp, 1, 0.5);
    await fp.waitForFunction(
      () =>
        document.querySelector("[data-earnings-scroll]").dataset.mode ===
        "static",
    );
    check(
      "Missing target frame releases scene and shows final poster",
      (await fp
        .locator("[data-earnings-scroll]")
        .getAttribute("data-reason")) === "frame-unavailable",
    );
    check(
      "Missing frame leaves records reachable",
      await fp.locator("#proof-records summary").isVisible(),
    );
    await failure.close();
    check("No runtime errors", report.errors.length === 0, report.errors);
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
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
    await browser.close();
  }
})();
