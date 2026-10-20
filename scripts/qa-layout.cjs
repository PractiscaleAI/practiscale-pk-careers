const { dismissIntroduction } = require("./qa-helpers.cjs");
const { chromium } = require("@playwright/test");
const fs = require("fs");
(async () => {
  const b = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = { checks: [], errors: [] };
  fs.mkdirSync("docs/qa/hero", { recursive: true });
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + JSON.stringify(detail));
  };
  try {
    for (const [w, h] of [
      [320, 568],
      [375, 667],
      [375, 812],
      [375, 860],
      [375, 900],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1280, 720],
      [1440, 900],
      [1536, 696],
      [1920, 1080],
      [1858, 874],
      [844, 390],
      [720, 450],
    ]) {
      const p = await b.newPage({
        viewport: { width: w, height: h },
        reducedMotion: "reduce",
      });
      p.on("pageerror", (e) => report.errors.push(e.message));
      await p.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
      await dismissIntroduction(p);
      await p.locator(".preloader").waitFor({ state: "hidden" });
      await p.evaluate(() => document.fonts.ready);
      const g = await p.evaluate(() => {
        const r = (s) => {
          const q = document.querySelector(s).getBoundingClientRect();
          return {
            top: q.top,
            bottom: q.bottom,
            left: q.left,
            right: q.right,
            height: q.height,
          };
        };
        return {
          cards: [...document.querySelectorAll(".trust-card")].map((el) => {
            const box = (node) => {
              const q = node.getBoundingClientRect();
              return {
                top: q.top,
                bottom: q.bottom,
                left: q.left,
                height: q.height,
                width: q.width,
              };
            };
            return {
              card: box(el),
              number: box(el.querySelector("dd")),
              label: box(el.querySelector("dt")),
            };
          }),
          stage: r(".hero-stage"),
          copy: r(".hero-copy"),
          trust: r(".hero-trust"),
          footer: r(".hero-bottom-right"),
          header: r("header"),
          logo: r("header .brand img"),
          menu: r(".menu-toggle"),
          layout: document.querySelector(".hero-stage").dataset.layout,
          overflow: document.documentElement.scrollWidth > innerWidth,
          bg: getComputedStyle(document.querySelector("header"))
            .backgroundColor,
          logoSrc: document.querySelector("header .brand img").currentSrc,
        };
      });
      check(
        "Readable layout without horizontal overflow " + w + "x" + h,
        !g.overflow &&
          g.copy.bottom < g.trust.top &&
          g.footer.bottom <= g.stage.bottom + 1,
        g,
      );
      check(
        "Stat cards share heights and numeric/label rows " + w + "x" + h,
        Math.abs(g.cards[0].card.height - g.cards[1].card.height) < 1 &&
          Math.abs(g.cards[0].card.width - g.cards[1].card.width) < 1 &&
          Math.abs(g.cards[0].number.top - g.cards[1].number.top) < 1 &&
          Math.abs(g.cards[0].label.top - g.cards[1].label.top) < 1 &&
          Math.abs(
            g.cards[0].number.left -
              g.cards[0].card.left -
              (g.cards[1].number.left - g.cards[1].card.left),
          ) < 1,
        g.cards,
      );
      if (w >= 1200)
        check(
          "Stat cards align with the bottom hero link " + w + "x" + h,
          Math.abs(g.trust.bottom - g.footer.bottom) < 1 &&
            Math.abs(g.trust.left - g.copy.left) < 1,
          { trust: g.trust, footer: g.footer },
        );
      if (w >= 768 && w < 1200)
        check(
          "Tablet cards group below the CTA with clear spacing " + w + "x" + h,
          g.trust.top >= g.copy.bottom + 23 &&
            Math.abs(g.trust.left - g.copy.left) < 1 &&
            g.footer.top >= g.trust.bottom + 16,
          { copy: g.copy, trust: g.trust, footer: g.footer },
        );
      if (w >= 768 && h > 620)
        check(
          "Desktop footer and trust cards visible without scrolling " +
            w +
            "x" +
            h,
          g.footer.bottom <= h && g.trust.bottom <= h,
          g,
        );
      if (w < 768)
        check(
          "Phone stats and footer preserve reading gutters " + w + "x" + h,
          Math.abs(g.trust.left - g.copy.left) < 1 &&
            Math.abs(g.trust.right - g.copy.right) < 1 &&
            Math.abs(g.footer.left - g.copy.left) < 1 &&
            Math.abs(g.footer.right - g.copy.right) < 1,
          { copy: g.copy, trust: g.trust, footer: g.footer },
        );
      if (w < 768)
        check(
          "Reference mobile navbar " + w + "x" + h,
          g.bg === "rgb(243, 246, 246)" &&
            g.logoSrc.endsWith(
              w < 348 ? "practiscale-mark.png" : "practiscale-logo-primary.png",
            ) &&
            g.header.height <= 66 &&
            g.logo.right < g.menu.left &&
            g.logo.right <= g.header.right &&
            g.menu.right <= g.header.right,
          g,
        );
      if (
        (w === 375 && h === 900) ||
        (w === 1536 && h === 696) ||
        w === 1440 ||
        w === 1858
      )
        await p.screenshot({
          path: "docs/qa/hero/hero-" + w + "x" + h + ".png",
        });
      if (w === 375 && h === 900) {
        await p.addStyleTag({
          content:
            "h1,p,a,button,dt,dd{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}",
        });
        await p.waitForTimeout(400);
        const reflow = await p.evaluate(() => {
          const c = document
              .querySelector(".hero-copy")
              .getBoundingClientRect(),
            t = document.querySelector(".hero-trust").getBoundingClientRect(),
            s = document.querySelector(".hero-stage").getBoundingClientRect(),
            f = document
              .querySelector(".hero-bottom-right")
              .getBoundingClientRect();
          return {
            copy: c.bottom,
            trust: t.top,
            footer: f.bottom,
            stage: s.bottom,
            width: document.documentElement.scrollWidth,
          };
        });
        check(
          "Enlarged text spacing reflows without clipping",
          reflow.copy < reflow.trust &&
            reflow.footer <= reflow.stage + 1 &&
            reflow.width <= w,
          reflow,
        );
      }
      await p.close();
    }
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (e) {
    report.failure = e.stack;
    process.exitCode = 1;
  } finally {
    fs.writeFileSync("docs/layout-qa.json", JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    await b.close();
  }
})();
