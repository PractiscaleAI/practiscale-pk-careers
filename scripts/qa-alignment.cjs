const { dismissIntroduction } = require("./qa-helpers.cjs");
const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = { checks: [], errors: [] };
  fs.mkdirSync("docs/qa/alignment", { recursive: true });
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + JSON.stringify(detail));
  };
  try {
    for (const [w, h] of [
      [320, 568],
      [360, 800],
      [375, 900],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1200, 900],
      [1201, 900],
      [1440, 900],
      [1536, 696],
      [1920, 1080],
    ]) {
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        reducedMotion: "reduce",
      });
      const p = await context.newPage();
      p.on("pageerror", (e) => report.errors.push(e.message));
      await p.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
      await dismissIntroduction(p);
      await p.locator(".preloader").waitFor({ state: "hidden" });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(100);
      const g = await p.evaluate(() => {
        const r = (s) => {
          const a = document.querySelector(s).getBoundingClientRect();
          return {
            left: a.left,
            right: a.right,
            top: a.top,
            bottom: a.bottom,
            width: a.width,
            height: a.height,
            centerY: (a.top + a.bottom) / 2,
          };
        };
        const heading = document.querySelector("h1");
        return {
          header: r("header"),
          brand: r(".brand"),
          logo: r(".brand img"),
          nav: r(innerWidth > 1200 ? ".nav-panel" : ".menu-toggle"),
          divider: r(".hero-topline"),
          copy: r(".hero-copy"),
          editorial: r(".hero-editorial"),
          aside: r(".hero-aside"),
          trust: r(".hero-trust"),
          footer: r(".hero-bottom-right"),
          stage: r(".hero-stage"),
          overflow: document.documentElement.scrollWidth > innerWidth,
          logoSrc: document.querySelector(".brand img").currentSrc,
          lines:
            heading.getBoundingClientRect().height /
            parseFloat(getComputedStyle(heading).lineHeight),
        };
      });
      const id = w + "x" + h;
      check(
        "Header/divider breathing room " + id,
        Math.abs(g.divider.top - g.header.bottom - 24) < 1,
        g,
      );
      check(
        "Copy, trust and footer share content gutters " + id,
        Math.abs(g.copy.left - g.divider.left) < 1 &&
          Math.abs(g.trust.left - g.divider.left) < 1 &&
          Math.abs(g.footer.right - g.divider.right) < 1,
        g,
      );
      check(
        "Logo and navigation vertically centered " + id,
        Math.abs(g.logo.centerY - g.nav.centerY) < 1,
        g,
      );
      check(
        "No overlaps or horizontal overflow " + id,
        !g.overflow &&
          g.logo.right + 8 <= g.nav.left &&
          g.copy.bottom + 16 < g.trust.top,
        g,
      );
      if (w >= 768) {
        check(
          "Desktop header shares hero grid " + id,
          Math.abs(g.logo.left - g.divider.left) < 1 &&
            Math.abs(g.nav.right - g.divider.right) < 1,
          g,
        );
        check(
          "Supporting block shares editorial anchor " + id,
          Math.abs(g.aside.top - g.editorial.top) < 1,
          g,
        );
        check(
          "Headline has no isolated final word " + id,
          g.lines <= 2.05,
          g.lines,
        );
      } else {
        check(
          "Phone card floats inside hero " + id,
          Math.abs(g.header.left - g.stage.left - 8) < 1 &&
            Math.abs(g.header.top - g.stage.top - 8) < 1 &&
            Math.abs(g.stage.right - g.header.right - 8) < 1,
          g,
        );
        check(
          "Approved artwork with readable size " + id,
          w < 348
            ? g.logoSrc.endsWith("practiscale-mark.png") && g.logo.width === 32
            : g.logoSrc.endsWith("practiscale-logo-primary.png") &&
                g.logo.width >= 240,
          g,
        );
      }
      await p.screenshot({ path: "docs/qa/alignment/" + id + ".png" });
      if (w === 375) {
        await p.getByRole("button", { name: "Open navigation" }).click();
        await p.getByRole("button", { name: "Training", exact: true }).click();
        check(
          "Mobile menu and CTA remain usable",
          (await p.locator(".nav-cta").isVisible()) &&
            (await p
              .getByRole("link", { name: "Appointment Setter", exact: true })
              .isVisible()),
        );
        await p.screenshot({ path: "docs/qa/alignment/mobile-menu.png" });
        await p.keyboard.press("Escape");
      }
      if (w === 1440) {
        await p.emulateMedia({ reducedMotion: "no-preference" });
        await p.evaluate(() => scrollTo({ top: 240, behavior: "instant" }));
        await p.waitForTimeout(300);
        const scroll = await p.evaluate(() => {
          const brand = document.querySelector(".brand"),
            c = getComputedStyle(brand, "::before");
          return {
            background: getComputedStyle(document.querySelector("header"))
              .backgroundColor,
            backing: c.opacity,
            clearance: [
              -parseFloat(c.top),
              -parseFloat(c.bottom),
              -parseFloat(c.left),
              -parseFloat(c.right),
            ],
          };
        });
        check(
          "Scrolled logo backing protects all artwork",
          scroll.backing === "1" &&
            scroll.background === "rgba(0, 0, 0, 0)" &&
            scroll.clearance.every((v) => v >= 16),
          scroll,
        );
        await p.screenshot({ path: "docs/qa/alignment/desktop-scrolled.png" });
        await p.evaluate(() => {
          const el = document.createElement("section");
          el.id = "qa-light-surface";
          el.style.cssText = "height:1200px;background:white";
          document.querySelector("main").append(el);
          scrollTo({ top: el.offsetTop + 100, behavior: "instant" });
        });
        await p.screenshot({
          path: "docs/qa/alignment/desktop-light-surface.png",
        });
      }
      await context.close();
    }
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync("docs/alignment-qa.json", JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify({
        checks: report.checks.length,
        passed: report.checks.filter((c) => c.pass).length,
        failure: report.failure,
        errors: report.errors,
      }),
    );
    await browser.close();
  }
})();
