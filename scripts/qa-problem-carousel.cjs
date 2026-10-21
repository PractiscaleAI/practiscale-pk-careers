const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs");
const dir = "docs/qa/problem-carousel";
const titles = [
  "A degree without a marketable skill",
  "More effort, little financial progress",
  "Income with no real stability",
];
const bodies = [
  "You did what was expected and completed your education, but employers still look for practical skills and real-world experience.",
  "You take on more work, grow your capabilities, and deliver stronger results, but your income rarely reflects the value you create.",
  "Freelancing can create short-term wins, but without structure or long-term security, income can disappear overnight.",
];
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const report = { checks: [], errors: [], violations: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (!pass) throw Error(name + ": " + JSON.stringify(detail));
  };
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
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page
      .locator(".preloader")
      .waitFor({ state: "hidden", timeout: 11000 });
    await page.locator('#the-problem [data-enhanced="true"]').waitFor();
    const section = page.locator("#the-problem");
    const carousel = section.locator('[aria-roledescription="carousel"]');
    const current = async () =>
      Number(await carousel.getAttribute("data-active"));
    const pick = async (index) => {
      await section
        .getByRole("button", { name: "Next problem", exact: true })
        .focus();
      await page.keyboard.press("Home");
      for (let step = 0; step < index; step++)
        await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        (expected) => {
          const root = document.querySelector(
            '#the-problem [data-enhanced="true"]',
          );
          return (
            Number(root?.getAttribute("data-active")) === expected &&
            root
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState !== "running")
          );
        },
        index,
        { timeout: 10000 },
      );
    };
    check(
      "Exactly two authorized homepage sections",
      (await page.locator("main > section").count()) === 2,
    );
    check(
      "No pagination dots",
      (await section.locator('[aria-label="Choose a problem"]').count()) ===
        0 && (await section.getByRole("button").count()) === 2,
    );
    check(
      "No em dashes in visible page copy",
      !(await page.locator("main").textContent()).includes(
        String.fromCharCode(8212),
      ),
    );
    check(
      "Exactly three original problem cards",
      (await section.locator("article").count()) === 3,
    );
    check(
      "Mobile body text stays at least 16px",
      await section
        .locator("[data-problem-copy] p")
        .evaluateAll(
          (elements) =>
            innerWidth >= 768 ||
            elements.every(
              (el) => parseFloat(getComputedStyle(el).fontSize) >= 16,
            ),
        ),
    );
    check(
      "Exact heading and eyebrow",
      (await section.locator("h2").innerText()) ===
        "Most careers in Pakistan get stuck for the same three reasons." &&
        (await section
          .locator("h2")
          .evaluate((el) => el.previousElementSibling.textContent)) ===
          "The problem",
    );
    check(
      "Exact card titles",
      JSON.stringify(await section.locator("h3").allTextContents()) ===
        JSON.stringify(titles),
    );
    check(
      "Exact card bodies",
      JSON.stringify(
        await section.locator("[data-problem-copy] p").allTextContents(),
      ) === JSON.stringify(bodies),
    );
    check(
      "One real section CTA",
      (await section.getByRole("link").count()) === 1 &&
        (await section.getByRole("link").innerText()) === "Explore training" &&
        (await section.getByRole("link").getAttribute("href")).includes(
          "wa.me/923334000600",
        ),
    );
    check(
      "Only one accessible slide",
      (await section.getByRole("group", { name: /^[1-3] of 3$/ }).count()) ===
        1,
    );
    await section
      .getByRole("button", { name: "Next problem", exact: true })
      .click();
    check("Next advances", (await current()) === 1);
    await section
      .getByRole("button", { name: "Previous problem", exact: true })
      .click();
    check("Previous reverses", (await current()) === 0);
    await section
      .getByRole("button", { name: "Previous problem", exact: true })
      .click();
    check("Previous wraps", (await current()) === 2);
    await section
      .getByRole("button", { name: "Next problem", exact: true })
      .click();
    check("Next wraps", (await current()) === 0);
    for (let i = 0; i < 3; i++) {
      await pick(i);
      check("Direct keyboard selection " + (i + 1), (await current()) === i);
    }
    await section
      .getByRole("button", { name: "Next problem", exact: true })
      .focus();
    for (const [key, expected] of [
      ["Home", 0],
      ["ArrowRight", 1],
      ["ArrowLeft", 0],
      ["End", 2],
    ]) {
      await page.keyboard.press(key);
      check("Keyboard " + key, (await current()) === expected);
    }
    const focus = await page.locator(":focus").evaluate((el) => ({
      outline: getComputedStyle(el).outlineStyle,
      width: parseFloat(getComputedStyle(el).outlineWidth),
    }));
    check(
      "Visible keyboard focus",
      focus.outline !== "none" && focus.width >= 2,
      focus,
    );
    await page.waitForTimeout(1000);
    check("No autoplay", (await current()) === 2);
    for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      for (let index = 0; index < 3; index++) {
        await pick(index);
        const geometry = await section
          .locator('article[data-position="active"]')
          .evaluate((el) => {
            const card = el.getBoundingClientRect(),
              h = el.querySelector("h3").getBoundingClientRect(),
              p = el.querySelector("p").getBoundingClientRect(),
              image = el.querySelector("img");
            const side = [...el.parentElement.querySelectorAll("article")]
              .filter((card) => card !== el)
              .map((card) => {
                const r = card.getBoundingClientRect();
                return {
                  x: r.x,
                  right: r.right,
                  width: r.width,
                  opacity: +getComputedStyle(card).opacity,
                  blur: getComputedStyle(card).filter,
                };
              });
            return {
              x: card.x,
              right: card.right,
              width: card.width,
              height: card.height,
              headingTop: h.top - card.top,
              textSize: parseFloat(
                getComputedStyle(el.querySelector("p")).fontSize,
              ),
              gap: p.top - h.bottom,
              copyFits:
                p.bottom <= card.bottom - 18 &&
                p.left >= card.left + 18 &&
                p.right <= card.right - 18,
              loaded: image.complete && image.naturalWidth > 0,
              side,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
        check(
          `Readable card ${index + 1} at ${width}`,
          geometry.copyFits &&
            geometry.loaded &&
            !geometry.overflow &&
            geometry.x >= 18 &&
            geometry.right <= width - 18 &&
            geometry.headingTop >= 170 &&
            (width >= 768 || geometry.textSize >= 16) &&
            geometry.gap >= 11,
          geometry,
        );
        check(
          `Layered previews ${index + 1} at ${width}`,
          geometry.side.every(
            (side) =>
              side.width < geometry.width &&
              side.opacity < 0.5 &&
              side.blur !== "none",
          ) &&
            geometry.side.some((side) => side.x < geometry.x - 12) &&
            geometry.side.some((side) => side.right > geometry.right + 12),
          geometry.side,
        );
        if ([320, 375, 430, 768, 1440].includes(width))
          await section.screenshot({
            path: `${dir}/${width}-card-${index + 1}.png`,
            style: "header, .skip-link { visibility: hidden !important; }",
          });
      }
      check(
        `Touch targets ${width}`,
        await section.getByRole("button").evaluateAll((els) =>
          els.every((el) => {
            const r = el.getBoundingClientRect();
            return r.width >= 44 && r.height >= 44;
          }),
        ),
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await pick(0);
    await section.evaluate((el) =>
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(400);
    check(
      "Navigation remains attached to hero above the carousel",
      await page
        .locator("header")
        .evaluate(
          (el) =>
            el.parentElement.classList.contains("hero-stage") &&
            getComputedStyle(el).position === "absolute" &&
            el.getBoundingClientRect().bottom <= 0,
        ),
    );
    await page.screenshot({ path: `${dir}/1440-section-in-viewport.png` });
    await page.setViewportSize({ width: 375, height: 812 });
    await pick(0);
    await section.evaluate((el) =>
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${dir}/375-section-in-viewport.png` });
    const active = section.locator('article[data-position="active"]');
    await active.scrollIntoViewIfNeeded();
    const box = await active.boundingBox();
    await page.mouse.move(box.x + box.width - 30, box.y + 150);
    await page.mouse.down();
    await page.mouse.move(box.x + 30, box.y + 150, { steps: 10 });
    await page.mouse.up();
    check("Horizontal drag advances", (await current()) === 1);
    // Native pan-y remains enabled so touch scrolling is not hijacked.
    check(
      "Touch scroll and pinch remain native",
      await active.evaluate((el) =>
        getComputedStyle(el.parentElement).touchAction.includes("pan-y"),
      ),
    );
    await page.addStyleTag({
      content:
        "#the-problem h2, #the-problem h3, #the-problem p, #the-problem a { font-size: 200% !important; line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }",
    });
    await page.waitForTimeout(500);
    const enlarged = await active.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        p = el.querySelector("p").getBoundingClientRect(),
        h = el.querySelector("h3").getBoundingClientRect();
      return {
        fits: p.bottom < r.bottom && h.top - r.top >= 170,
        photoHeight: el.querySelector("picture").getBoundingClientRect().height,
        photoMax: Math.max(
          parseFloat(
            getComputedStyle(el.parentElement.parentElement).getPropertyValue(
              "--card-min-height",
            ),
          ),
          r.width * 1.5,
        ),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    check(
      "Enlarged text and spacing remain readable",
      enlarged.fits &&
        !enlarged.overflow &&
        enlarged.photoHeight <= enlarged.photoMax + 1,
      enlarged,
    );
    await section.screenshot({
      path: `${dir}/375-enlarged.png`,
      style: "header, .skip-link { visibility: hidden !important; }",
    });
    await context.close();
    const rm = await browser.newContext({
      viewport: { width: 430, height: 932 },
      reducedMotion: "reduce",
    });
    const rp = await rm.newPage();
    await rp.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await rp.locator(".preloader").waitFor({ state: "hidden", timeout: 11000 });
    await rp.locator("#the-problem").scrollIntoViewIfNeeded();
    await rp.getByRole("button", { name: "Next problem", exact: true }).click();
    check(
      "Reduced motion advances without animated transition",
      await rp
        .locator('#the-problem article[data-position="active"]')
        .evaluate((el) => getComputedStyle(el).transitionDuration === "0s"),
    );
    const axe = await new AxeBuilder({ page: rp })
      .include("#the-problem")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.violations = axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    }));
    check(
      "No automated section accessibility violations",
      !report.violations.length,
      report.violations,
    );
    await rm.close();
    const nojs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 900 },
    });
    const np = await nojs.newPage();
    await np.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    check(
      "No JavaScript shows all three stories",
      await np
        .locator("#the-problem article")
        .evaluateAll(
          (els) =>
            els.length === 3 &&
            els.every(
              (el) =>
                !el.hasAttribute("aria-hidden") &&
                getComputedStyle(el).position === "relative",
            ),
        ),
    );
    check(
      "No JavaScript hides inactive controls",
      (await np.locator("#the-problem button:visible").count()) === 0,
    );
    await nojs.close();
    check("No runtime errors", !report.errors.length, report.errors);
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/problem-carousel-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  }
})();
