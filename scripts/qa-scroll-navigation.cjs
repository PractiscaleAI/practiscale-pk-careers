const { chromium } = require("@playwright/test");
const fs = require("node:fs");
(async () => {
  const report = { checks: [], errors: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + ": " + JSON.stringify(detail));
  };
  const dir = "docs/qa/scroll-navigation";
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
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page
      .locator(".preloader")
      .waitFor({ state: "hidden", timeout: 11000 });
    const header = page.locator("header");
    const scroll = async (top) => {
      await page.evaluate(
        (y) =>
          new Promise((resolve) => {
            window.scrollTo({ top: y, behavior: "instant" });
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          }),
        top,
      );
    };
    const settle = (mode) =>
      page.waitForFunction(
        (expected) =>
          document.querySelector("header")?.dataset.placement === expected,
        mode,
        { timeout: 5000 },
      );
    const placement = () =>
      header.evaluate((el) => {
        const r = el.getBoundingClientRect(),
          parent = el.parentElement.getBoundingClientRect(),
          css = getComputedStyle(el);
        return {
          top: r.top,
          bottom: r.bottom,
          relativeTop: r.top - parent.top,
          position: css.position,
          visibility: css.visibility,
          transform: css.transform,
          inHero: el.parentElement.classList.contains("hero-stage"),
          mode: el.dataset.placement,
          pageTop: r.top + window.scrollY,
        };
      });
    for (const [width, height] of [
      [320, 568],
      [375, 812],
      [430, 932],
      [443, 646],
      [768, 900],
      [1192, 768],
      [1440, 900],
      [1536, 696],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => document.activeElement?.blur());
      await scroll(1);
      await scroll(0);
      const first = await placement();
      check(
        `Header is anchored to hero ${width}`,
        first.inHero &&
          first.position === "absolute" &&
          first.visibility === "visible" &&
          first.top >= 0,
        first,
      );
      if (width < 1200) {
        await page.getByRole("button", { name: "Open navigation" }).click();
        check(
          `Mobile menu remains usable ${width}`,
          await page
            .getByRole("button", { name: "Close navigation" })
            .isVisible(),
        );
        await page.keyboard.press("Escape");
        await page.evaluate(() => document.activeElement?.blur());
      }
      await scroll(260);
      const moved = await placement();
      check(
        `Header keeps its hero position through scrolling ${width}`,
        Math.abs(first.relativeTop - moved.relativeTop) < 1 &&
          moved.visibility === "visible" &&
          moved.transform === "none",
        moved,
      );
      if ([375, 1536].includes(width))
        await page.screenshot({ path: `${dir}/${width}-hero-scroll.png` });
      const section = page.locator("#the-problem");
      const geometry = await section.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const heading = el.querySelector("h2").getBoundingClientRect();
        const cta = el.querySelector("a").getBoundingClientRect();
        const card = el
          .querySelector('[data-position="active"]')
          .getBoundingClientRect();
        return {
          height: el.querySelector("[data-problem-scene]").offsetHeight,
          layout: el.querySelector("[data-layout]").dataset.layout,
          stageHeight:
            parseFloat(
              el
                .querySelector("[data-layout]")
                .style.getPropertyValue("--stage-height"),
            ) || 0,
          clearance: parseFloat(
            getComputedStyle(el).getPropertyValue("--nav-clearance"),
          ),
          viewport: innerHeight,
          ctaAfterCarousel:
            cta.top >= card.bottom + 12 && heading.bottom < card.top,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      check(
        `CTA below the carousel ${width}`,
        geometry.ctaAfterCarousel,
        geometry,
      );
      check(
        `Both sections have no horizontal overflow ${width}`,
        !geometry.overflow,
        geometry,
      );
      if (geometry.layout !== "list")
        check(
          `Problem reading scene fits viewport ${width}x${height}`,
          geometry.layout === "stage"
            ? geometry.stageHeight + geometry.clearance <= height - 24
            : geometry.height <= height + 2,
          geometry,
        );
      const top = await section.evaluate(
        (el) => window.scrollY + el.getBoundingClientRect().top,
      );
      const depth = Math.max(300, top - 120);
      await scroll(depth);
      check(
        `Header naturally leaves with hero ${width}`,
        (await placement()).bottom <= 0 && (await placement()).mode === "hero",
        await placement(),
      );
      const beforeUp = await page.evaluate(() => window.scrollY);
      await scroll(beforeUp - 32);
      await settle("up");
      check(
        `Upward scroll reveals navigation ${width}`,
        (await placement()).mode === "up" &&
          (await placement()).position === "fixed" &&
          (await placement()).top >= 0 &&
          (await page.locator("header").count()) === 1,
        await placement(),
      );
      if ([375, 1536].includes(width))
        await page.screenshot({ path: `${dir}/${width}-upward-reveal.png` });
      if (width < 1200) {
        await page.getByRole("button", { name: "Open navigation" }).click();
        check(
          `Revealed mobile menu works ${width}`,
          await page
            .getByRole("button", { name: "Close navigation" })
            .isVisible(),
        );
        await page.keyboard.press("Escape");
        await page.evaluate(() => document.activeElement?.blur());
      }
      const beforeDown = await page.evaluate(() => window.scrollY);
      await scroll(beforeDown + 16);
      await settle("released");
      const released = await placement();
      check(
        `Downward scroll releases navigation into page flow ${width}`,
        released.mode === "released" &&
          released.position === "absolute" &&
          released.visibility === "visible" &&
          released.transform === "none",
        released,
      );
      await scroll(beforeDown + 32);
      const flowed = await placement();
      check(
        `Released header stays at its document position ${width}`,
        flowed.mode === "released" &&
          Math.abs(flowed.pageTop - released.pageTop) <= 1 &&
          flowed.top < released.top - 12,
        { released, flowed },
      );
      await scroll(top);
      if ([375, 768, 1536].includes(width))
        await page.screenshot({ path: `${dir}/${width}-section-flow.png` });
      await page.evaluate(() => document.activeElement?.blur());
      await scroll(0);
      await settle("hero");
      check(
        `Header returns to original hero position ${width}`,
        (await placement()).inHero &&
          Math.abs((await placement()).top - first.top) < 1,
        await placement(),
      );
      if ([375, 1536].includes(width))
        await page.screenshot({ path: `${dir}/${width}-hero-top.png` });
    }
    check(
      "User-selected image versions retained",
      JSON.stringify(
        await page
          .locator("#the-problem img")
          .evaluateAll((images) =>
            images.map((img) => img.getAttribute("src")),
          ),
      ) ===
        JSON.stringify([
          "/media/career-problems/graduate-v1.webp",
          "/media/career-problems/professional-v2.webp",
          "/media/career-problems/freelancer-v1.webp",
        ]),
    );
    await scroll(0);
    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    check(
      "Skip link bypasses navigation and focuses hero content",
      await page.evaluate(
        () =>
          document.activeElement?.id === "main" &&
          document.activeElement.classList.contains("hero-copy"),
      ),
    );
    check(
      "No automatic hide state remains",
      (await header.getAttribute("data-scroll-hidden")) === null,
    );
    await page.evaluate(() => document.activeElement?.blur());
    const problemTop = await page
      .locator("#the-problem")
      .evaluate((el) => scrollY + el.getBoundingClientRect().top);
    await scroll(problemTop);
    await page.keyboard.press("Tab");
    await settle("up");
    await page.waitForFunction(() =>
      document.querySelector("header")?.contains(document.activeElement),
    );
    check(
      "Keyboard can reveal and focus navigation",
      await header.evaluate(
        (el) =>
          el.dataset.placement === "up" && el.contains(document.activeElement),
      ),
    );
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/scroll-navigation-qa.json",
      JSON.stringify(report, null, 2),
    );
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
  }
})();
