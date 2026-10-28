const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const dir = process.env.HIRING_QA_OUT || "docs/qa/hiring/v068";
fs.mkdirSync(dir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const checks = [];
  const errors = [];
  const check = (name, pass, detail) => {
    checks.push({ name, pass, detail });
    if (!pass) console.log("FAIL", name, detail);
  };
  try {
    for (const [width, height, reduced] of [
      [1440, 900, false],
      [1366, 600, false],
      [1920, 686, false],
      [1505, 692, false],
      [1024, 768, false],
      [768, 1024, false],
      [390, 844, false],
      [360, 740, false],
      [320, 568, false],
      [844, 390, false],
      [390, 844, true],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        "http://127.0.0.1:3000/?review=v068-hiring#how-hiring-works",
      );
      await dismissIntroduction(page);
      await page.waitForTimeout(2800);
      const section = page.locator("#how-hiring-works");
      await section.evaluate((el) =>
        scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(800);
      const name = `${width}x${height}${reduced ? "-reduced" : ""}`;
      const state = () =>
        section.evaluate((el) => {
          const stage = el
            .querySelector("[data-hiring-stage]")
            .getBoundingClientRect();
          const visible = [
            ...el.querySelectorAll(
              "h2,[data-hiring-select],[data-hiring-step]",
            ),
          ]
            .filter((e) => e.getBoundingClientRect().width > 2)
            .map((e) => {
              const r = e.getBoundingClientRect();
              return {
                name: e.textContent.trim().slice(0, 30),
                x: r.x,
                y: r.y,
                right: r.right,
                bottom: r.bottom,
              };
            });
          const heading = el.querySelector("h2").getBoundingClientRect();
          const dial = el
            .querySelector('svg[viewBox="0 0 480 480"]')
            .getBoundingClientRect();
          const cards = [...el.querySelectorAll("[data-hiring-step]")]
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width > 2);
          const overlaps = cards.some((a, i) =>
            cards
              .slice(i + 1)
              .some(
                (b) =>
                  a.left < b.right &&
                  a.right > b.left &&
                  a.top < b.bottom &&
                  a.bottom > b.top,
              ),
          );
          const titles = [...el.querySelectorAll('[data-hiring-step] h3')].map(e=>e.getBoundingClientRect());
          const rowsAligned = innerWidth < 1000 || (Math.abs(titles[0].top-titles[1].top)<1 && Math.abs(titles[2].top-titles[3].top)<1);
          const footerTop = el.querySelector('[data-hiring-stage]').lastElementChild.getBoundingClientRect().top;
          const paras = [...el.querySelector("header").querySelectorAll("p")]
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width > 0);
          return {
            scroll: el.dataset.scroll,
            active: +el.dataset.active,
            angle: +el.dataset.angle,
            progress: +el.dataset.progress,
            overflow: document.documentElement.scrollWidth > innerWidth,
            stage: { top: stage.top, height: stage.height },
            fits: visible.every(
              (r) =>
                r.x >= 0 &&
                r.right <= innerWidth &&
                r.y >= -1 &&
                r.bottom <= innerHeight + 1,
            ),
            headingClear: heading.bottom < dial.top,
            noCardOverlap: !overlaps,
            rowsAligned,
            footerClear: Math.max(...cards.map(r=>r.bottom)) + 12 <= footerTop,
            centeredHeading: paras.every(
              (r) => Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2,
            ),
            visible,
            travel: el.offsetHeight - stage.height,
          };
        });
      let m = await state();
      check(name + " no horizontal overflow", !m.overflow, m);
      check(name + " centered header", m.centeredHeading, m);
      check(
        name + " scroll mode",
        m.scroll === String(!reduced && height >= (width >= 1000 ? 580 : 740)),
        m.scroll,
      );
      await page.screenshot({ path: `${dir}/${name}-apply.png` });
      if (m.scroll === "true") {
        for (const i of [0, 1, 2, 3, 2, 1, 0]) {
          await section.evaluate((el, i) => {
            const s = el.querySelector("[data-hiring-stage]");
            scrollTo({
              top:
                el.getBoundingClientRect().top +
                scrollY +
                ((el.offsetHeight - s.offsetHeight) * (i + 0.22)) / 4,
              behavior: "instant",
            });
          }, i);
          await page.waitForTimeout(750);
          m = await state();
          check(
            name + " station " + i,
            m.active === i &&
              m.noCardOverlap &&
              m.rowsAligned && m.footerClear &&
              Math.abs(m.angle - (-45 + i * 90)) < 0.1 &&
              m.fits &&
              m.headingClear,
            m,
          );
          if (i === 2)
            await page.screenshot({ path: `${dir}/${name}-task.png` });
        }
        // Actual wheel input, then a rapid reversal before scrub settles.
        await page.mouse.wheel(0, m.travel * 0.82);
        await page.waitForTimeout(55);
        await page.mouse.wheel(0, -m.travel * 0.5);
        await page.waitForTimeout(850);
        m = await state();
        check(name + " rapid reverse latest target", m.active === 1, m);
        await page
          .getByRole("button", { name: "04 Offer", exact: true })
          .click();
        await page.waitForTimeout(750);
        m = await state();
        check(
          name + " direct selection",
          m.active === 3 && Math.abs(m.angle - 225) < 0.1,
          m,
        );
        await page
          .getByRole("button", { name: "02 Screen", exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await page.waitForTimeout(750);
        m = await state();
        check(name + " keyboard selection", m.active === 1, m);
      } else {
        check(
          name + " static content accessible",
          (await section.locator("li").count()) === 4,
        );
      }
      if (width === 1440 || width === 390) {
        const a = await new AxeBuilder({ page })
          .include("#how-hiring-works")
          .analyze();
        check(
          name + " accessibility",
          a.violations.length === 0,
          a.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
        );
      }
      await context.close();
    }
    check("no runtime errors", errors.length === 0, errors);
  } finally {
    await browser.close();
  }
  fs.writeFileSync(`${dir}/report.json`, JSON.stringify(checks, null, 2));
  console.log(
    `${checks.filter((x) => x.pass).length}/${checks.length} checks passed`,
  );
  if (checks.some((x) => !x.pass)) process.exitCode = 1;
})();
