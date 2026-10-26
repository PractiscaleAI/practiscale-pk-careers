const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises"),
  path = require("node:path");
const report = { checks: [], samples: [], errors: [] };
const out = path.join(__dirname, "../docs/qa/performance/v052/fast-scroll");
function check(name, pass, data) {
  report.checks.push({ name, pass: !!pass, data });
  if (!pass) console.log("FAIL " + name + " " + JSON.stringify(data));
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height] of [
      [1440, 900],
      [390, 844],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } }),
        page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(String(e)));
      await page.goto("http://127.0.0.1:3000/", {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(
        () => document.querySelector(".hero-portrait").dataset.ready === "true",
      );
      async function burst(kind, points) {
        await page.evaluate(
          async ({ kind, points }) => {
            const phone = innerWidth < 768;
            let root, start, travel;
            if (kind === "hero") {
              root = document.querySelector(
                phone ? ".hero-visual" : ".hero-scroll",
              );
              const frame = document.querySelector(".hero-frame"),
                pin = phone ? parseFloat(getComputedStyle(frame).top) : 0;
              start = scrollY + root.getBoundingClientRect().top - pin;
              travel = phone
                ? root.offsetHeight - frame.offsetHeight
                : root.offsetHeight - innerHeight;
            } else {
              root = document.querySelector(
                kind === "who"
                  ? "[data-who-rail]"
                  : kind === "career"
                    ? "[data-career-rail]"
                    : "[data-laptop-rail]",
              );
              const top =
                kind === "career"
                  ? parseFloat(
                      getComputedStyle(
                        root.closest("section"),
                      ).getPropertyValue("--career-top"),
                    )
                  : 0;
              start = scrollY + root.getBoundingClientRect().top - top;
              travel =
                kind === "career"
                  ? parseFloat(root.style.getPropertyValue("--career-travel"))
                  : root.offsetHeight -
                    root.querySelector(
                      kind === "who"
                        ? "[data-who-viewport]"
                        : "[data-laptop-viewport]",
                    ).offsetHeight;
            }
            for (const p of points) {
              scrollTo({ top: start + travel * p, behavior: "instant" });
              await new Promise((r) => setTimeout(r, 24));
            }
          },
          { kind, points },
        );
      }
      for (const [points, frame] of [
        [[0.8, 0.2, 0.95, 0.05, 0.99], "119"],
        [[0.2, 0.75, 0.4, 0], "0"],
      ]) {
        const start = Date.now();
        await burst("hero", points);
        await page.waitForFunction(
          (frame) =>
            document.querySelector(".hero-portrait").dataset.frame === frame,
          frame,
          { timeout: 12000 },
        );
        check(
          `${width}: rapid hero reversal settles on original frame ${frame}`,
          true,
          { elapsedMs: Date.now() - start },
        );
      }
      if (width >= 1024) {
        await page
          .locator("#who-we-are")
          .evaluate((e) =>
            scrollTo({
              top: e.getBoundingClientRect().top + scrollY,
              behavior: "instant",
            }),
          );
        await page.waitForFunction(
          () =>
            document.querySelector("[data-who-rail]").dataset.ready === "true",
          null,
          { timeout: 20000 },
        );
        for (const points of [
          [0.8, 0.3, 0.9, 0.25, 0.66],
          [0.85, 0.22, 0.75, 0.38],
        ]) {
          const start = Date.now();
          await burst("who", points);
          await page.waitForFunction(
            (p) => {
              const r = document.querySelector("[data-who-rail]"),
                v = r.querySelector("video");
              return (
                Math.abs(Number(r.dataset.progress) - p) < 0.003 &&
                !v.seeking &&
                Math.abs(v.currentTime - Number(r.dataset.targetTime)) < 0.07
              );
            },
            points.at(-1),
            { timeout: 12000 },
          );
          const data = await page
            .locator("[data-who-rail]")
            .evaluate((r) => ({
              p: Number(r.dataset.progress),
              target: Number(r.dataset.targetTime),
              actual: r.querySelector("video").currentTime,
            }));
          check(
            `${width}: rapid film reversal reaches latest target ${points.at(-1)}`,
            true,
            { ...data, elapsedMs: Date.now() - start },
          );
        }
      }
      await page.locator("#career-paths").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          document.querySelector("[data-career-world]").dataset.ready ===
          "true",
        null,
        { timeout: 20000 },
      );
      for (const points of [
        [0.2, 0.8, 0.3, 0.95, 0.1, 0.9],
        [0.85, 0.35, 0.75, 0.1],
      ]) {
        const start = Date.now();
        await burst("career", points);
        await page.waitForFunction(
          (p) =>
            Math.abs(
              Number(
                document.querySelector("[data-career-rail]").dataset.progress,
              ) - p,
            ) < 0.003,
          points.at(-1),
          { timeout: 12000 },
        );
        const data = await page
          .locator("[data-career-rail]")
          .evaluate((r) => ({
            p: Number(r.dataset.progress),
            active: Number(r.dataset.active),
          }));
        check(
          `${width}: rapid cards settle without queued transitions`,
          data.active === (points.at(-1) > 0.5 ? 1 : 0),
          { ...data, elapsedMs: Date.now() - start },
        );
      }
      await page
        .locator("#the-proof")
        .evaluate((e) =>
          scrollTo({
            top: e.getBoundingClientRect().top + scrollY,
            behavior: "instant",
          }),
        );
      await page.waitForFunction(
        () => !!document.querySelector("[data-laptop-world] canvas"),
        null,
        { timeout: 20000 },
      );
      for (const points of [
        [0.38, 0.69, 0.33, 0.79, 0.5],
        [0.75, 0.34, 0.65, 0.326],
      ]) {
        const end = points.at(-1),
          expected = Math.floor((end - 0.3) / 0.052),
          start = Date.now();
        await burst("laptop", points);
        await page.waitForFunction(
          ({ end, expected }) => {
            const r = document.querySelector("[data-laptop-rail]"),
              c = r.querySelector("[data-laptop-world] canvas");
            return (
              Math.abs(Number(r.dataset.progress) - end) < 0.003 &&
              Number(c.dataset.record) === expected
            );
          },
          { end, expected },
          { timeout: 15000 },
        );
        check(
          `${width}: rapid earnings switches finish on record ${expected + 1}`,
          true,
          { elapsedMs: Date.now() - start },
        );
      }
      check(
        `${width}: fast journey has no horizontal overflow`,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await page.screenshot({
        path: path.join(out, `${width}-fast-earnings.png`),
      });
      await context.close();
    }
  } catch (e) {
    report.fatal = String(e);
    console.error(e);
  } finally {
    await browser.close();
    await fs.mkdir(out, { recursive: true });
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
