const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const dir = "docs/qa/testimonials/v056";
const report = { checks: [], errors: [] };
function check(name, pass, detail) {
  report.checks.push({ name, pass, detail });
  if (!pass) console.error("FAIL", name, detail);
}
(async () => {
  fs.mkdirSync(dir, { recursive: true });
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
      [1536, 686],
      [768, 1024],
      [390, 844],
      [375, 667],
      [320, 568],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        hasTouch: width < 600,
        isMobile: width < 600,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(e.message));
      await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      const scene = await page.locator("#testimonials").evaluate((el) => {
        const stage = el.querySelector("[data-testimonial-stage]");
        return {
          start:
            el.getBoundingClientRect().top +
            scrollY +
            Math.max(0, stage.offsetHeight - innerHeight),
          stride: Math.max(420, innerHeight * 0.7),
          enabled: el.dataset.scrollTestimonials,
        };
      });
      const state = () =>
        page.locator("#testimonials").evaluate((el) => {
          const card = el
            .querySelector('[data-testimonial-card][aria-hidden="false"]')
            .getBoundingClientRect();
          const buttons = [...el.querySelectorAll("button")].map((b) =>
            b.getBoundingClientRect(),
          );
          return {
            active: Number(el.querySelector("[data-active]").dataset.active),
            center: Math.abs((card.left + card.right) / 2 - innerWidth / 2),
            cardFits: card.top >= 0 && card.bottom <= innerHeight,
            controlsFit: buttons.every(
              (b) => b.top >= 0 && b.bottom <= innerHeight,
            ),
            top: el
              .querySelector("[data-testimonial-stage]")
              .getBoundingClientRect().top,
            y: scrollY,
          };
        });
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        scene.start,
      );
      await page.waitForTimeout(900);
      if (scene.enabled === "true") {
        for (let i = 0; i < 4; i++) {
          if (i) await page.mouse.wheel(0, scene.stride);
          await page.waitForTimeout(800);
          const m = await state();
          check(
            `${width} forward ${i}`,
            m.active === i && m.center < 1.5 && m.cardFits && m.controlsFit,
            m,
          );
          await page.screenshot({ path: `${dir}/scroll-${width}-${i}.png` });
        }
        for (let i = 2; i >= 0; i--) {
          await page.mouse.wheel(0, -scene.stride);
          await page.waitForTimeout(800);
          const m = await state();
          check(`${width} reverse ${i}`, m.active === i && m.center < 1.5, m);
        }
        // A fast change replaces the target instead of queuing old transitions.
        await page.mouse.wheel(0, scene.stride * 2.9);
        await page.waitForTimeout(60);
        await page.mouse.wheel(0, -scene.stride * 1.9);
        await page.waitForTimeout(850);
        const fast = await state();
        check(
          `${width} rapid reversal settles latest target`,
          fast.active === 1 && fast.center < 1.5,
          fast,
        );
        const focus = await page.evaluate(() => document.activeElement.tagName);
        check(
          `${width} scrolling does not move focus`,
          focus === "BODY",
          focus,
        );
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          scene.start + scene.stride * 3.5,
        );
        await page.waitForTimeout(750);
        check(
          `${width} rail reaches final quote`,
          (await state()).active === 3,
        );
        // Last section is the end of the document: the rail must not trap scrolling.
        await page.mouse.wheel(0, 2000);
        await page.waitForTimeout(300);
        check(
          `${width} native document end reachable`,
          await page.evaluate(
            () =>
              Math.abs(
                scrollY + innerHeight - document.documentElement.scrollHeight,
              ) < 3,
          ),
        );
      } else {
        check(
          `${width} short-screen fallback releases pin`,
          await page
            .locator("[data-testimonial-stage]")
            .evaluate((el) => getComputedStyle(el).position !== "sticky"),
        );
      }
      if (width === 1440) {
        await page
          .getByRole("button", { name: "Show testimonial from Hassan Ali" })
          .click();
        await page.waitForTimeout(700);
        for (const [w, h] of [
          [320, 568],
          [1440, 900],
          [390, 844],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width: w, height: h });
          await page.waitForTimeout(850);
          const resized = await state();
          check(
            `Resize to ${w} preserves reading state`,
            resized.active === 3 && resized.center < 1.5 && resized.cardFits,
            resized,
          );
        }
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(250);
      check(
        `${width} reduced motion releases rail`,
        (await page
          .locator("#testimonials")
          .getAttribute("data-scroll-testimonials")) === "false",
      );
      await context.close();
    }
  } catch (e) {
    report.errors.push(e.stack);
    console.error(e);
  } finally {
    await browser.close();
    fs.writeFileSync(
      `${dir}/scroll-report.json`,
      JSON.stringify(report, null, 2),
    );
  }
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      failed: report.checks.filter((c) => !c.pass).length,
      errors: report.errors,
    }),
  );
  if (report.errors.length || report.checks.some((c) => !c.pass))
    process.exitCode = 1;
})();
