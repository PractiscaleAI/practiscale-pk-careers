const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/background-lines/v059";
const report = { checks: [], errors: [] };
const check = (name, pass, detail) => {
  report.checks.push({ name, pass: !!pass, detail });
  if (!pass) console.error("FAIL", name, detail);
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const reference = fs.readFileSync(
    "C:/Users/e laptop/.codex/attachments/1fe71e31-4767-40ce-bcad-95458f2140ba/Pasted text.txt",
    "utf8",
  );
  const implementation = fs.readFileSync(
    "src/components/ui/background-lines.tsx",
    "utf8",
  );
  const paths = (text) => [...text.matchAll(/"(M7[^"\n]+)"/g)].map((m) => m[1]);
  check(
    "Every supplied path is preserved in order",
    JSON.stringify(paths(reference)) === JSON.stringify(paths(implementation)),
    paths(reference).length,
  );
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height, colorScheme, reducedMotion] of [
      [1440, 900, "light", "no-preference"],
      [768, 1024, "light", "no-preference"],
      [390, 844, "light", "no-preference"],
      [1440, 900, "dark", "no-preference"],
      [390, 844, "light", "reduce"],
    ]) {
      const id = `${width}-${colorScheme}-${reducedMotion}`;
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme,
        reducedMotion,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(`${id}: ${String(e)}`));
      await page.goto("http://127.0.0.1:3000/#background-lines", {
        waitUntil: "networkidle",
      });
      await dismissIntroduction(page);
      await page.waitForTimeout(2400);
      await page.locator("#background-lines").scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      const state = await page
        .locator("[data-background-lines]")
        .evaluate((el) => ({
          mode: el.dataset.backgroundLines,
          paths: el.querySelectorAll("path").length,
          height: el.clientHeight,
          background: getComputedStyle(el).backgroundColor,
          content: el.textContent.trim(),
          previous: el.parentElement.previousElementSibling.id,
          sections: document.querySelectorAll("main > section").length,
          overflow: document.documentElement.scrollWidth - innerWidth,
          decorative: el.querySelector("svg")?.getAttribute("aria-hidden"),
        }));
      check(
        `${id}: follows testimonials without changing section order`,
        state.previous === "testimonials" && state.sections === 7,
        state,
      );
      check(
        `${id}: both sets of source paths render`,
        state.paths === paths(reference).length * 2,
        state,
      );
      check(
        `${id}: original responsive height and no overflow`,
        state.height === (width < 768 ? 320 : height) && state.overflow === 0,
        state,
      );
      check(
        `${id}: correct theme`,
        state.background ===
          (colorScheme === "dark" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"),
        state.background,
      );
      check(
        `${id}: no invented copy and decorative semantics`,
        state.content === "" && state.decorative === "true",
        state,
      );
      const sample = () =>
        page
          .locator("#background-lines path")
          .first()
          .evaluate((el) => ({
            offset: getComputedStyle(el).strokeDashoffset,
            opacity: getComputedStyle(el).opacity,
          }));
      const before = await sample();
      await page.waitForTimeout(700);
      const after = await sample();
      check(
        `${id}: ${reducedMotion === "reduce" ? "static reduced-motion fallback" : "lines actually animate"}`,
        reducedMotion === "reduce"
          ? JSON.stringify(before) === JSON.stringify(after) &&
              state.mode === "static"
          : before.offset !== after.offset && state.mode === "running",
        { before, after },
      );
      await page
        .locator("#background-lines")
        .screenshot({ path: `${out}/${id}.png` });
      if (reducedMotion !== "reduce") {
        await page.mouse.wheel(0, -10);
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(400);
        check(
          `${id}: animation unmounted offscreen`,
          (await page.locator("#background-lines svg").count()) === 0,
        );
        await page.locator("#background-lines").scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        check(
          `${id}: resumes on re-entry`,
          (await page
            .locator("[data-background-lines]")
            .getAttribute("data-background-lines")) === "running",
        );
        await page.evaluate(() => {
          Object.defineProperty(document, "hidden", {
            configurable: true,
            value: true,
          });
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await page.waitForTimeout(200);
        check(
          `${id}: hidden-tab simulation stops motion`,
          (await page.locator("#background-lines svg").count()) === 0,
        );
      }
      await context.close();
    }
  } catch (e) {
    report.errors.push(String(e));
  } finally {
    await browser.close();
    fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify({
        checks: report.checks.length,
        failed: report.checks.filter((c) => !c.pass).length,
        errors: report.errors,
      }),
    );
    if (report.errors.length || report.checks.some((c) => !c.pass))
      process.exitCode = 1;
  }
})();
