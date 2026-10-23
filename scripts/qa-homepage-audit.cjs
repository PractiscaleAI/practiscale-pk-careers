const { chromium } = require("@playwright/test");
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
const out = path.join(
  __dirname,
  "../docs/qa/proof-band/v044/visual",
  process.argv[2] || "after",
);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function ready(page) {
  await page.goto("http://127.0.0.1:3000/", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.waitForFunction(
    () =>
      document.querySelector("main") &&
      (document.querySelector("main").inert ||
        !document.querySelector(".preloader") ||
        document.querySelector(".preloader")?.getAttribute("aria-hidden") ===
          "true"),
    { timeout: 15000 },
  );
  if (
    await page
      .locator(".preloader")
      .isVisible()
      .catch(() => false)
  )
    await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("main")?.inert);
  await page.evaluate(() => document.fonts.ready);
  await pause(600);
}
async function move(page, selector, p = 0, kind = "normal") {
  await page.evaluate(
    ({ selector, p, kind }) => {
      const root = document.querySelector(selector),
        rect = root.getBoundingClientRect();
      let top = rect.top + scrollY,
        travel = 0;
      if (kind === "proof") {
        const view = root.querySelector("[data-proof-viewport]");
        const pin = root.dataset.mode === "pin";
        top -= pin
          ? Math.max(0, (innerHeight - view.offsetHeight) / 2)
          : innerHeight * 0.85;
        travel = pin
          ? root.offsetHeight - view.offsetHeight
          : innerHeight * 0.75;
      } else if (kind === "laptop")
        travel =
          root.offsetHeight -
          root.querySelector("[data-laptop-viewport]").offsetHeight;
      else travel = Math.max(0, root.offsetHeight - innerHeight);
      scrollTo({ top: Math.max(0, top + travel * p), behavior: "instant" });
    },
    { selector, p, kind },
  );
  await pause(650);
}
(async () => {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const report = { layouts: [], states: [], errors: [], a11y: [] };
  try {
    for (const [width, height] of [
      [1440, 900],
      [768, 1024],
      [390, 844],
    ]) {
      const ctx = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        hasTouch: width < 1024,
        isMobile: width < 768,
      });
      await ctx.addInitScript(() => {
        window.__audioCreated = 0;
        for (const k of ["AudioContext", "webkitAudioContext"])
          if (window[k]) {
            const Original = window[k];
            window[k] = new Proxy(Original, {
              construct(target, args) {
                window.__audioCreated++;
                return Reflect.construct(target, args);
              },
            });
          }
      });
      const page = await ctx.newPage();
      page.on("pageerror", (e) =>
        report.errors.push({ width, error: String(e) }),
      );
      await ready(page);
      const states = [
        ["hero", ".hero-scroll", 0],
        ["hero-end", ".hero-scroll", 0.85],
        ["problem", "#the-problem", 0.35],
        ["problem-read", "#the-problem", 0.83],
        ["career", "[data-career-rail]", 0.2],
        ["career-end", "[data-career-rail]", 0.8],
        ["career-read", "[data-career-rail]", 0.98],
        ["stats", "[data-proof-world]", 0.44, "proof"],
        ["stats-final", "[data-proof-world]", 1, "proof"],
        ["earnings", "[data-laptop-rail]", 0, "laptop"],
        ["record", "[data-laptop-rail]", 0.37, "laptop"],
      ];
      for (const [name, selector, p, kind] of states) {
        await move(page, selector, p, kind);
        await page.screenshot({ path: path.join(out, `${width}-${name}.png`) });
        report.states.push({
          width,
          name,
          ...(await page.evaluate(() => ({
            scrollY,
            overflow: document.documentElement.scrollWidth - innerWidth,
            proofMode:
              document.querySelector("[data-proof-world]").dataset.mode,
            proofProgress:
              document.querySelector("[data-proof-world]").dataset.progress,
            laptopMode:
              document.querySelector("[data-laptop-rail]").dataset.mode,
            audioContexts: window.__audioCreated,
          }))),
        });
      }
      report.layouts.push(
        await page.evaluate(() => {
          const box = (e) => {
            const r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          };
          const style = (e) => {
            const s = getComputedStyle(e);
            return {
              text: e.textContent.trim().slice(0, 130),
              font: s.fontFamily,
              size: s.fontSize,
              line: s.lineHeight,
              tracking: s.letterSpacing,
              color: s.color,
              bg: s.backgroundColor,
              background: s.backgroundImage,
              border: s.borderColor,
              radius: s.borderRadius,
              ...box(e),
            };
          };
          return {
            width: innerWidth,
            height: innerHeight,
            sections: [...document.querySelectorAll("main>section")].map(
              (e) => ({ id: e.id, ...style(e) }),
            ),
            type: [
              ...document.querySelectorAll(
                "h1,h2,[data-proof-stat] dt,[data-proof-stat] dd,.action,[data-problem-copy]>p,[data-career-text] p",
              ),
            ].map(style),
            stats: [...document.querySelectorAll("[data-proof-stat]")].map(
              style,
            ),
            footer: !!document.querySelector("[data-laptop-caption]"),
            sound: !!document.querySelector("[data-laptop-audio]"),
          };
        }),
      );
      await move(page, "[data-proof-world]", 1, "proof");
      const axe = await new AxeBuilder({ page }).analyze();
      report.a11y.push({
        width,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
      await ctx.close();
    }
  } finally {
    await browser.close();
    await fs.writeFile(
      path.join(out, "report.json"),
      JSON.stringify(report, null, 2),
    );
  }
  console.log(
    JSON.stringify(
      {
        output: out,
        states: report.states.length,
        errors: report.errors,
        a11y: report.a11y,
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
