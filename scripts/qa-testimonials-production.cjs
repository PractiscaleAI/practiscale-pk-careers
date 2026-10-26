const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const dir = require("node:path").join(
  __dirname,
  "../docs/qa/testimonials/v056",
);
(async () => {
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
  const result = { checks: [], errors: [] };
  const check = (name, pass, detail) =>
    result.checks.push({ name, pass, detail });
  try {
    for (const [width, height] of [
      [1440, 900],
      [768, 1024],
      [320, 568],
    ]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on("pageerror", (e) => result.errors.push(e.message));
      const response = await page.goto(
        "http://127.0.0.1:3000/?review=v056-testimonials",
        { waitUntil: "networkidle" },
      );
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      await page.locator("#testimonials").evaluate((el) =>
        scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(1000);
      await page.mouse.move(1, 1);
      await page.screenshot({ path: `${dir}/production-${width}.png` });
      check(
        `Production page ${width}`,
        response.status() === 200 &&
          (await page.locator("#testimonials blockquote").count()) === 4,
      );
      const section = page.locator("#testimonials");
      if (width === 1440) {
        const viewport = page.locator("[data-testimonial-viewport]");
        const b = await viewport.boundingBox();
        await page.mouse.move(b.x + b.width * 0.6, b.y + 120);
        await page.mouse.down();
        await page.mouse.move(b.x + b.width * 0.4, b.y + 120, { steps: 8 });
        await viewport.dispatchEvent("pointercancel", {
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        });
        await page.mouse.up();
        await page.waitForTimeout(750);
        const cancelled = await section.evaluate((el) => {
          const host = el.querySelector('[aria-roledescription="carousel"]');
          const v = el
            .querySelector("[data-testimonial-viewport]")
            .getBoundingClientRect();
          const c = el
            .querySelector('[data-testimonial-card][aria-hidden="false"]')
            .getBoundingClientRect();
          return {
            dragging: host.dataset.dragging,
            center: Math.abs((c.left + c.right - v.left - v.right) / 2),
          };
        });
        check(
          "Cancelled drag releases and settles",
          !cancelled.dragging && cancelled.center < 1.5,
          cancelled,
        );
        await page.mouse.move(1, 1);
        const writes = await page.evaluate(
          () =>
            new Promise((resolve) => {
              let count = 0;
              const observer = new MutationObserver(
                (records) => (count += records.length),
              );
              observer.observe(
                document.querySelector("[data-testimonial-track]"),
                { attributes: true, subtree: true },
              );
              setTimeout(() => {
                observer.disconnect();
                resolve(count);
              }, 350);
            }),
        );
        check("No animation writes while idle", writes === 0, writes);
        await section
          .getByRole("button", { name: "Show testimonial from Kashaf Abbasi" })
          .click();
        await page.waitForTimeout(700);
        await page.mouse.move(b.x + b.width * 0.5, b.y + 120);
        await page.mouse.down();
        await page.mouse.move(b.x + b.width * 0.85, b.y + 120, { steps: 8 });
        const x = await page
          .locator("[data-testimonial-track]")
          .evaluate(
            (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
          );
        check("Endpoint drag resistance is bounded", x <= 65 && x >= 0, x);
        await page.mouse.up();
        await page.waitForTimeout(700);
        check(
          "Endpoint release retains first quote",
          (await section
            .locator('[aria-roledescription="carousel"]')
            .getAttribute("data-active")) === "0",
        );
        await page.mouse.move(1, 1);
        await page.screenshot({ path: `${dir}/production-1440.png` });
      }
      await context.close();
    }
  } catch (e) {
    result.errors.push(e.stack);
  } finally {
    await browser.close();
    fs.writeFileSync(
      `${dir}/production-checks.json`,
      JSON.stringify(result, null, 2),
    );
  }
  console.log(JSON.stringify(result));
  if (result.errors.length || result.checks.some((c) => !c.pass))
    process.exitCode = 1;
})();
