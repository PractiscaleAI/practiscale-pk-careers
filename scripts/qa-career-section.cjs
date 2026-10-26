const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const teamClearance = require("./qa-team-clearance.cjs");
const fs = require("node:fs"),
  sharp = require("sharp");
const dir = "docs/qa/career-section/v039-two-paths";
const bodies = [
  "Start with training. Learn the skill, pass the role assessment and move into a paid role on our team or our clients' accounts.",
  "Bring your experience in sales, design, video, development, AI, recruitment or operations. Apply directly for an open role.",
];
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const report = { checks: [], errors: [], consoleErrors: [], violations: [] };
  const check = (name, pass, detail) => {
    report.checks.push({ name, pass, detail });
    if (report.checks.length % 20 === 0)
      console.log(`Verified ${report.checks.length}: ${name}`);
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
  const open = async (options = {}, init) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...options,
    });
    if (init) await context.addInitScript(init);
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (
        m.type() === "error" &&
        !m.text().includes("Error creating WebGL context")
      )
        report.consoleErrors.push(m.text());
    });
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    if (options.javaScriptEnabled === false)
      await page.locator(".preloader").waitFor({ state: "hidden" });
    else await dismissIntroduction(page);
    await page.waitForTimeout(600);
    return { context, page };
  };
  try {
    const { context, page } = await open(),
      section = page.locator("#career-paths"),
      rail = section.locator("[data-career-rail]");
    const metrics = () =>
      rail.evaluate((el) => ({
        mode: el.dataset.mode,
        engine: el.dataset.engine,
        start:
          scrollY +
          el.getBoundingClientRect().top -
          parseFloat(
            getComputedStyle(el.closest("section")).getPropertyValue(
              "--career-top",
            ),
          ),
        travel: parseFloat(el.style.getPropertyValue("--career-travel")) || 0,
        top: parseFloat(
          getComputedStyle(el.closest("section")).getPropertyValue(
            "--career-top",
          ),
        ),
      }));
    const scroll = async (top) => {
      await page.evaluate(
        (y) => scrollTo({ top: y, behavior: "instant" }),
        top,
      );
      await page.waitForTimeout(900);
      // Check reading holds after the real scrub settles. A fixed delay alone
      // can sample an intentionally clipped incoming group on software WebGL.
      await page
        .waitForFunction(
          () => {
            const root = document.querySelector("[data-career-rail]");
            if (root.dataset.mode !== "pinned") return true;
            const top = parseFloat(
              getComputedStyle(root.closest("section")).getPropertyValue(
                "--career-top",
              ),
            );
            const start = scrollY + root.getBoundingClientRect().top - top;
            const travel = parseFloat(
              root.style.getPropertyValue("--career-travel"),
            );
            const expected = Math.max(
              0,
              Math.min(1, (scrollY - start) / travel),
            );
            return Math.abs(Number(root.dataset.progress) - expected) < 0.001;
          },
          null,
          { polling: 100, timeout: 15000 },
        )
        .catch(async (error) => {
          report.scrollFailure = { requestedTop: top, samples: [] };
          for (const delay of [0, 500, 1500]) {
            if (delay) await page.waitForTimeout(delay);
            report.scrollFailure.samples.push(
              await page.evaluate(() => {
                const data = (selector) => {
                  const el = document.querySelector(selector);
                  return (
                    el && {
                      ...el.dataset,
                      rect: el.getBoundingClientRect().toJSON(),
                      style: el.getAttribute("style"),
                    }
                  );
                };
                return {
                  scrollY,
                  width: innerWidth,
                  height: innerHeight,
                  career: data("[data-career-rail]"),
                  world: data("[data-career-world]"),
                  who: data("[data-who-rail]"),
                  problem: data("[data-problem-scene]"),
                };
              }),
            );
          }
          await page.screenshot({ path: `${dir}/scroll-failure.png` });
          throw error;
        });
    };
    check(
      "Career section follows the company film and preserved problem section",
      await page
        .locator("main>section")
        .evaluateAll(
          (els) =>
            els.length === 5 &&
            els[1].id === "the-problem" &&
            els[2].id === "who-we-are" &&
            els[3].id === "career-paths" &&
            els[4].id === "the-proof",
        ),
    );
    check(
      "Exactly two path cards with the requested buttons removed",
      (await section.locator("article").count()) === 2 &&
        (await section
          .getByRole("link", { name: "Start with training", exact: true })
          .count()) === 0 &&
        (await section
          .getByRole("link", { name: "I have experience", exact: true })
          .count()) === 0 &&
        (await section.locator("button").count()) === 0,
    );
    check(
      "Accessibility jump links remain visually absent until focused",
      await section
        .locator("[data-career-jump]")
        .evaluateAll(
          (links) =>
            links.length === 2 &&
            links.every(
              (link) =>
                link.getBoundingClientRect().width <= 1 &&
                getComputedStyle(link).clipPath === "inset(50%)",
            ),
        ),
    );
    check(
      "Exact path titles",
      JSON.stringify(await section.locator("h3").allTextContents()) ===
        JSON.stringify(["Training Programs", "Jobs"]),
    );
    check(
      "Exact revised body copy",
      JSON.stringify(
        await section
          .locator("article [data-career-group]:nth-child(2)>p")
          .allTextContents(),
      ) === JSON.stringify(bodies),
    );
    check(
      "Correct route CTA text and destinations",
      await section
        .locator("article .action")
        .evaluateAll(
          (els) =>
            els[0].textContent === "View Training Programs" &&
            els[0].getAttribute("href") ===
              "/training-programs/appointment-setter" &&
            els[1].textContent === "See Open Jobs" &&
            els[1].getAttribute("href") === "/jobs",
        ),
    );
    check(
      "Correct eligibility labels",
      (await section.locator("article").nth(0).textContent()).includes(
        "No experience needed",
      ) &&
        (await section.locator("article").nth(1).textContent()).includes(
          "For experienced professionals",
        ),
    );
    check(
      "No extra program chapters or earnings in two-path section",
      !(await section.textContent()).includes("Appointment Setter Program") &&
        !(await section.textContent()).includes("Virtual Assistant Program") &&
        !(await section.textContent()).includes("Rs "),
    );
    check(
      "Removed introductory sentence stays absent",
      !(await section.textContent()).includes(
        "Start with training, or bring your experience and apply directly.",
      ),
    );
    check(
      "No em dash in page copy",
      !(await page.locator("main").textContent()).includes(
        String.fromCharCode(8212),
      ),
    );
    for (const [width, height] of [
      [1440, 900],
      [1366, 768],
      [1024, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(600);
      let m = await metrics();
      await scroll(m.start + m.travel * 0.1);
      await page.waitForFunction(
        () =>
          Number(
            document.querySelector("[data-career-world]")?.dataset.frames,
          ) >= 5,
        null,
        { timeout: 10000 },
      );
      m = await metrics();
      check(
        `Horizontal pinned stage ${width}x${height}`,
        m.mode === "pinned" && m.engine === "three",
        m,
      );
      await page.evaluate(() => {
        window.__careerCanvas = document.querySelector(
          "[data-career-world] canvas",
        );
      });
      for (const [index, p] of [
        [0, 0.1],
        [1, 0.9],
      ]) {
        await scroll(m.start + m.travel * p);
        await page.waitForFunction(
          () =>
            document.querySelector("[data-career-world]")?.dataset.ready ===
            "true",
          null,
          { timeout: 5000 },
        );
        // Observe the completed scrub rather than assuming a fixed wall-clock
        // delay is enough when Chrome is using the software WebGL renderer.
        await page.waitForFunction(
          (target) =>
            Math.abs(
              Number(
                document.querySelector("[data-career-world]")?.dataset.morph,
              ) - target,
            ) < 0.003,
          index,
          { timeout: 5000 },
        );
        const g = await section.evaluate((el, index) => {
          const card = el.querySelectorAll("article")[index],
            text = card.querySelector("[data-career-text]"),
            poster = el.querySelector("[data-career-world-panel]"),
            cta = card.querySelector(".action"),
            viewport = el.querySelector("[data-career-viewport]");
          return {
            active: Number(
              el.querySelector("[data-career-rail]").dataset.active,
            ),
            morph: Number(
              el.querySelector("[data-career-world]").dataset.morph,
            ),
            rect: card.getBoundingClientRect().toJSON(),
            text: text.getBoundingClientRect().toJSON(),
            visual: poster.getBoundingClientRect().toJSON(),
            cta: cta.getBoundingClientRect().toJSON(),
            viewport: viewport.getBoundingClientRect().toJSON(),
            fits: text.scrollHeight <= text.clientHeight + 1,
            bodySize: parseFloat(
              getComputedStyle(
                card.querySelector("[data-career-group]:nth-child(2)>p"),
              ).fontSize,
            ),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            sameCanvas: window.__careerCanvas === el.querySelector("canvas"),
            inactive: [...el.querySelectorAll("article")]
              .filter((_, i) => i !== index)
              .every(
                (c) => c.inert && c.getAttribute("aria-hidden") === "true",
              ),
          };
        }, index);
        check(
          `Correct active path, same particle buffers ${width}/${index + 1}`,
          g.active === index &&
            Math.abs(g.morph - index) < 0.003 &&
            g.sameCanvas,
          g,
        );
        if (width === 1440 && index === 1) {
          check(
            "The next laptop does not allocate a renderer during career holds",
            (await page.locator("[data-laptop-world] canvas").count()) === 0,
          );
        }
        check(
          `Composition fits within 100vh ${width}/${index + 1}`,
          g.viewport.top >= m.top - 1 &&
            g.viewport.bottom <= height - 23 &&
            g.cta.bottom <= height - 24 &&
            g.cta.bottom < g.text.bottom - 20,
          g,
        );
        check(
          `Readable equal text and visual panels ${width}/${index + 1}`,
          g.fits &&
            !g.overflow &&
            g.bodySize >= 16 &&
            Math.abs(g.text.width - g.visual.width) < 2 &&
            (index === 0
              ? g.text.right < g.visual.left
              : g.visual.right < g.text.left),
          g,
        );
        check(
          `Only active card takes focus ${width}/${index + 1}`,
          g.inactive,
          g,
        );
        const pixels = await sharp(await section.locator("canvas").screenshot())
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        let lit = 0;
        for (let at = 0; at < pixels.data.length; at += 3)
          if (pixels.data[at] > 45 && pixels.data[at + 1] > 95) lit++;
        check(
          `Live particle sculpture is visible ${width}/${index + 1}`,
          lit > pixels.info.width * pixels.info.height * 0.003,
          { lit, pixels: pixels.info.width * pixels.info.height },
        );
        if (index === 1) {
          const distance = Number(
            await section
              .locator("[data-career-world]")
              .getAttribute("data-camera-distance"),
          );
          const clearance = await teamClearance(
            g.visual.width,
            g.visual.height,
            distance,
          );
          check(
            `Team nodes and nonincident links remain separate ${width}`,
            clearance.nodeGap > 12 && clearance.linkGap > 12,
            clearance,
          );
        }
        await page.screenshot({
          path: `${dir}/${width}-card-${index + 1}.png`,
        });
        if (width === 1440 && index === 0)
          await section.locator("[data-career-world-panel]").screenshot({
            path: `${dir}/brain-frontal-desktop.png`,
          });
        if (width === 1440 && index === 1)
          await section.locator("[data-career-world-panel]").screenshot({
            path: `${dir}/jobs-network-desktop.png`,
          });
      }
      await scroll(m.start + m.travel * 0.5);
      const mid = await section.evaluate((el) => ({
        texts: [...el.querySelectorAll("[data-career-text]")].map((c) =>
          c.getBoundingClientRect().toJSON(),
        ),
        visual: el
          .querySelector("[data-career-world-panel]")
          .getBoundingClientRect()
          .toJSON(),
        viewport: el
          .querySelector("[data-career-viewport]")
          .getBoundingClientRect()
          .toJSON(),
        groups: [...el.querySelectorAll("article")].map((c) =>
          [...c.querySelectorAll("[data-career-group]")].map((g) => ({
            y: new DOMMatrixReadOnly(getComputedStyle(g).transform).m42,
            opacity: Number(getComputedStyle(g).opacity),
          })),
        ),
        morph: Number(el.querySelector("[data-career-world]").dataset.morph),
        dispersion: Number(
          el.querySelector("[data-career-world]").dataset.dispersion,
        ),
        radius: parseFloat(
          getComputedStyle(el.querySelector("[data-career-panels]"))
            .borderRadius,
        ),
      }));
      check(
        `Reference motion: one visual crosses the fixed text as Jobs rises ${width}`,
        Math.abs(mid.texts[0].left - mid.viewport.left) < 1 &&
          mid.visual.left > mid.texts[0].left &&
          mid.visual.left < mid.texts[1].left &&
          Math.abs(mid.visual.width - mid.texts[0].width) < 1 &&
          mid.texts[1].top > mid.visual.top + 40 &&
          mid.texts[1].top < mid.visual.bottom - 40 &&
          Math.abs(mid.texts[0].top - mid.visual.top) < 1 &&
          mid.radius === 24,
        mid,
      );
      check(
        `Deterministic particle dispersal during exchange ${width}`,
        Math.abs(mid.morph - 0.5) < 0.02 && mid.dispersion > 0.98,
        mid,
      );
      check(
        `Staggered vertical text handoff follows scroll ${width}`,
        mid.groups[0].every((g) => g.y < 0 && g.opacity < 1) &&
          mid.groups[1].every((g) => g.y > 0 && g.opacity < 1) &&
          mid.groups[1][0].y < mid.groups[1][2].y,
        mid.groups,
      );
      await page.screenshot({ path: `${dir}/${width}-midpoint.png` });
      await scroll(m.start + m.travel * 0.1);
      check(
        `Reverse restores Training without recreating canvas ${width}`,
        (await rail.getAttribute("data-active")) === "0" &&
          (await page.evaluate(
            () =>
              window.__careerCanvas ===
              document.querySelector("[data-career-world] canvas"),
          )),
      );
      const clear = await page.evaluate(() => ({
        header: document.querySelector("header").getBoundingClientRect().bottom,
        stage: document
          .querySelector("[data-career-viewport]")
          .getBoundingClientRect().top,
      }));
      check(
        `Returning navigation clears the card stage ${width}`,
        clear.stage >= clear.header + 8,
        clear,
      );
      check(
        `Only one live career canvas ${width}`,
        (await section.locator("canvas").count()) === 1,
      );
    }
    let m = await metrics();
    await section
      .getByRole("link", { name: "Jump to Jobs", exact: true })
      .focus();
    check(
      "Keyboard-only link appears on focus",
      await section
        .locator("[data-career-jump='1']")
        .evaluate(
          (el) =>
            el.getBoundingClientRect().width > 44 &&
            getComputedStyle(el).clipPath === "none",
        ),
    );
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => document.activeElement?.id === "career-title-jobs",
      null,
      { timeout: 5000 },
    );
    check(
      "Keyboard-only jump reaches and focuses Jobs",
      (await rail.getAttribute("data-active")) === "1",
    );
    const training = section.getByRole("link", {
      name: "Jump to Training Programs",
      exact: true,
    });
    await training.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => document.activeElement?.id === "career-title-training",
      null,
      { timeout: 5000 },
    );
    await page.keyboard.press("Tab");
    check(
      "Keyboard reaches the active route CTA",
      await page.evaluate(() =>
        document.activeElement?.textContent.includes("View Training Programs"),
      ),
    );
    const routeChange = page.waitForURL(
      "**/training-programs/appointment-setter",
      { waitUntil: "domcontentloaded", timeout: 60000 },
    );
    await page.keyboard.press("Enter");
    await routeChange;
    check(
      "Training CTA navigates and disposes scene",
      (await page.locator("h1").innerText()) === "Appointment Setter Program" &&
        (await page.locator("[data-career-world] canvas").count()) === 0,
    );
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    m = await metrics();
    await scroll(m.start + m.travel * 0.1);
    check(
      "Returning home creates one scene",
      (await section.locator("canvas").count()) === 1,
    );
    // Native wheel input drives a continuous pass, with no wheel interception.
    const capture = [];
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, m.travel * 0.11);
      await page.waitForTimeout(180);
      capture.push(await rail.getAttribute("data-progress"));
      if ([1, 3, 5, 7].includes(i))
        await page.screenshot({ path: `${dir}/wheel-${i}.png` });
    }
    await page.waitForTimeout(700);
    check(
      "Continuous native scrolling advances through both cards",
      Number(capture.at(-1)) > 0.7 && Number(capture[1]) > Number(capture[0]),
      capture,
    );
    await page.evaluate(async ({ start, travel }) => {
      for (const p of [0.9, 0.2, 0.7, 0.1, 0.5, 0.9]) {
        scrollTo({ top: start + travel * p, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 40));
      }
    }, m);
    await page.waitForTimeout(1000);
    check(
      "Rapid scroll recovers final Jobs card",
      (await rail.getAttribute("data-active")) === "1" &&
        (await section.locator("canvas").count()) === 1,
    );
    await scroll(0);
    const frames = await section
      .locator("[data-career-world]")
      .getAttribute("data-frames");
    await page.waitForTimeout(350);
    check(
      "Rendering pauses outside the section",
      (await section
        .locator("[data-career-world]")
        .getAttribute("data-rendering")) === "false" &&
        frames ===
          (await section
            .locator("[data-career-world]")
            .getAttribute("data-frames")),
    );
    for (const [width, height] of [
      [768, 1024],
      [375, 812],
      [375, 667],
      [390, 844],
      [430, 932],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(550);
      const mobile = await metrics();
      check(
        `Mobile scroll stage ${width}x${height}`,
        mobile.mode === "pinned" &&
          mobile.engine === "three" &&
          (await rail.getAttribute("data-layout")) === "stacked",
        mobile,
      );
      const canvas = await section.locator("canvas").elementHandle();
      for (const [index, p] of [
        [0, 0.1],
        [1, 0.9],
      ]) {
        await scroll(mobile.start + mobile.travel * p);
        const g = await section.evaluate((el, index) => {
          const text = el.querySelectorAll("[data-career-text]")[index],
            visual = el.querySelector("[data-career-world-panel]"),
            cta = text.querySelector(".action");
          return {
            active: Number(
              el.querySelector("[data-career-rail]").dataset.active,
            ),
            text: text.getBoundingClientRect().toJSON(),
            visual: visual.getBoundingClientRect().toJSON(),
            cta: cta.getBoundingClientRect().toJSON(),
            fits: text.scrollHeight <= text.clientHeight + 1,
            particles: Number(
              el.querySelector("[data-career-world]").dataset.particles,
            ),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        }, index);
        check(
          `Mobile live artwork and readable card fit 100vh ${width}/${index + 1}`,
          g.active === index &&
            g.fits &&
            !g.overflow &&
            g.visual.top >= mobile.top - 1 &&
            g.text.top >= g.visual.bottom + 10 &&
            g.text.bottom <= height - 23 &&
            g.cta.bottom < g.text.bottom - 16 &&
            g.cta.right <= width - 20 &&
            g.particles === 4000,
          g,
        );
        await page.screenshot({
          path: `${dir}/${width}-mobile-card-${index + 1}.png`,
        });
      }
      await scroll(mobile.start + mobile.travel * 0.5);
      check(
        `Mobile horizontal card exchange is scroll driven ${width}`,
        await section.evaluate((el) => {
          const t = [...el.querySelectorAll("[data-career-text]")].map((t) =>
            t.getBoundingClientRect(),
          );
          return (
            t[0].left < 0 &&
            t[1].left > 0 &&
            t[1].left < innerWidth &&
            Math.abs(t[0].top - t[1].top) < 1
          );
        }),
      );
      await page.screenshot({ path: `${dir}/${width}-mobile-midpoint.png` });
      await scroll(mobile.start + mobile.travel * 0.1);
      check(
        `Mobile reverse restores the same live scene ${width}`,
        (await canvas.evaluate(
          (el) => el === document.querySelector("[data-career-world] canvas"),
        )) && (await rail.getAttribute("data-active")) === "0",
      );
      await canvas.dispose();
    }
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(600);
    const compact = await metrics();
    check(
      "Short phone retains scroll-driven cards without clipped artwork",
      compact.mode === "pinned" &&
        compact.engine === "cards" &&
        (await section.locator("canvas").count()) === 0,
      compact,
    );
    for (const [index, progress] of [
      [0, 0.1],
      [1, 0.9],
      [0, 0.1],
    ]) {
      await scroll(compact.start + compact.travel * progress);
      check(
        `Short phone readable forward/reverse hold ${index}`,
        await section
          .locator("[data-career-text]")
          .nth(index)
          .evaluate((el) => {
            const rect = el.getBoundingClientRect(),
              cta = el.querySelector("a").getBoundingClientRect();
            return (
              [...el.children].every((child) => {
                const bounds = child.getBoundingClientRect();
                return (
                  bounds.top >= rect.top + 16 &&
                  bounds.bottom <= rect.bottom - 16
                );
              }) &&
              rect.top >= 95 &&
              rect.bottom <= innerHeight - 23 &&
              cta.bottom < rect.bottom - 16 &&
              !el.closest("article").inert
            );
          }),
      );
      await page.screenshot({
        path: `${dir}/320-compact-card-${index + 1}.png`,
      });
    }
    await scroll(compact.start + compact.travel * 0.5);
    check(
      "Short phone still exchanges cards horizontally",
      await section.evaluate((el) => {
        const texts = [...el.querySelectorAll("[data-career-text]")].map((t) =>
          t.getBoundingClientRect(),
        );
        return (
          texts[0].left < 0 && texts[1].left > 0 && texts[1].left < innerWidth
        );
      }),
    );
    for (const [width, height] of [
      [320, 480],
      [1366, 540],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(500);
      check(
        `Readable flow fallback ${width}x${height}`,
        (await metrics()).mode === "flow" &&
          (await section.getByRole("article").count()) === 2 &&
          (await section.locator("canvas").count()) === 0,
      );
      for (let index = 0; index < 2; index++) {
        await section.locator("article").nth(index).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        const fit = await section
          .locator("article")
          .nth(index)
          .evaluate((el) => ({
            fits:
              el.querySelector("[data-career-text]").scrollHeight <=
              el.querySelector("[data-career-text]").clientHeight + 1,
            loaded:
              el.querySelector("img").complete &&
              el.querySelector("img").naturalWidth > 0,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            cta: el.querySelector("a").getBoundingClientRect().toJSON(),
          }));
        check(
          `Complete fallback card ${width}/${index + 1}`,
          fit.fits &&
            fit.loaded &&
            !fit.overflow &&
            fit.cta.left >= 16 &&
            fit.cta.right <= width - 16,
          fit,
        );
        if (width === 320)
          await page.screenshot({
            path: `${dir}/320-fallback-card-${index + 1}.png`,
          });
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(600);
    m = await metrics();
    await scroll(m.start + m.travel * 0.9);
    await page.waitForFunction(
      () =>
        document.querySelector("[data-career-rail]")?.dataset.mode ===
          "pinned" &&
        document.querySelectorAll("#career-paths canvas").length === 1 &&
        document.querySelector("[data-career-world]")?.dataset.ready === "true",
      null,
      { timeout: 10000 },
    );
    check(
      "Resize restores one live horizontal sequence",
      (await metrics()).mode === "pinned" &&
        (await section.locator("canvas").count()) === 1,
    );
    const axe = await new AxeBuilder({ page })
      .include("#career-paths")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.violations.push(...axe.violations);
    check(
      "No automated pinned accessibility violations",
      axe.violations.length === 0,
      axe.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
    await section
      .locator("canvas")
      .evaluate((el) =>
        el.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await page.waitForTimeout(300);
    check(
      "Context loss restores both complete cards",
      (await metrics()).mode === "flow" &&
        (await section.getByRole("article").count()) === 2 &&
        (await section.locator("canvas").count()) === 0,
    );
    await context.close();
    const touch = await open({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const touchRail = touch.page.locator("[data-career-rail]");
    const touchMetrics = await touchRail.evaluate((el) => ({
      start: scrollY + el.getBoundingClientRect().top - 96,
      travel: parseFloat(el.style.getPropertyValue("--career-travel")),
    }));
    await touch.page.evaluate(
      ({ start, travel }) =>
        scrollTo({ top: start + travel * 0.1, behavior: "instant" }),
      touchMetrics,
    );
    await touch.page.waitForTimeout(800);
    const client = await touch.context.newCDPSession(touch.page);
    const swipe = async (from, to) => {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 185, y: from }],
      });
      for (let i = 1; i <= 16; i++) {
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: 185, y: from + ((to - from) * i) / 16 }],
        });
        await touch.page.waitForTimeout(25);
      }
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await touch.page.waitForTimeout(700);
    };
    const beforeTouch = Number(await touchRail.getAttribute("data-progress"));
    await swipe(650, 250);
    const afterTouch = Number(await touchRail.getAttribute("data-progress"));
    check(
      "Native mobile touch scroll advances the live card sequence",
      afterTouch > beforeTouch + 0.12 &&
        (await touchRail.getAttribute("data-mode")) === "pinned",
      { beforeTouch, afterTouch },
    );
    await swipe(250, 650);
    check(
      "Native reverse touch scroll restores earlier progress",
      Number(await touchRail.getAttribute("data-progress")) < afterTouch - 0.1,
    );
    await touch.context.close();
    for (const scenario of [
      "reduced",
      "unsupported",
      "brainfailed",
      "nojs",
      "enlarged",
    ]) {
      const options =
        scenario === "reduced"
          ? { reducedMotion: "reduce" }
          : scenario === "nojs"
            ? {
                javaScriptEnabled: false,
                viewport: { width: 375, height: 812 },
              }
            : {};
      const init =
        scenario === "unsupported"
          ? () => {
              const original = HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext = function (
                type,
                ...args
              ) {
                return type.includes("webgl")
                  ? null
                  : original.call(this, type, ...args);
              };
            }
          : scenario === "brainfailed"
            ? () => {
                const original = window.fetch.bind(window);
                window.fetch = (...args) =>
                  String(args[0]).includes("brain-surface")
                    ? Promise.reject(Error("QC simulated missing brain asset"))
                    : original(...args);
              }
            : undefined;
      const fallback = await open(options, init),
        p = fallback.page,
        s = p.locator("#career-paths");
      if (scenario === "unsupported" || scenario === "brainfailed") {
        await s.locator("[data-career-viewport]").scrollIntoViewIfNeeded();
        await p.waitForFunction(
          () =>
            document.querySelector("[data-career-rail]")?.dataset.mode ===
            "flow",
          null,
          { timeout: 10000 },
        );
      }
      if (scenario === "enlarged") {
        await p.addStyleTag({
          content:
            "#career-paths p{font-size:36px!important;line-height:1.7!important;letter-spacing:.12em!important;word-spacing:.16em!important}#career-paths h3{font-size:108px!important}",
        });
        await p.waitForTimeout(500);
      }
      check(
        `${scenario}: two complete cards without pin`,
        (await s.getByRole("article").count()) === 2 &&
          (await s.locator("canvas").count()) === 0 &&
          (await s.locator("[data-career-rail]").getAttribute("data-mode")) ===
            "flow",
      );
      if (scenario !== "nojs") {
        const a = await new AxeBuilder({ page: p })
          .include("#career-paths")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        report.violations.push(...a.violations);
        check(
          `${scenario}: no automated accessibility violations`,
          a.violations.length === 0,
          a.violations.map((v) => v.id),
        );
      }
      if (scenario === "reduced") {
        await s
          .getByRole("link", { name: "See Open Jobs", exact: true })
          .focus();
        check(
          "Reduced-motion flow exposes the Jobs link in normal tab order",
          await p.evaluate(
            () => document.activeElement?.getAttribute("href") === "/jobs",
          ),
        );
      }
      await fallback.context.close();
    }
    const routes = await open({ viewport: { width: 375, height: 812 } });
    for (const path of [
      "/training-programs/appointment-setter",
      "/training-programs/virtual-assistant",
      "/jobs",
    ]) {
      const response = await routes.page.goto("http://127.0.0.1:3000" + path, {
        waitUntil: "networkidle",
      });
      check(
        `Destination resolves ${path}`,
        response.status() === 200 &&
          (await routes.page.locator("h1").count()) === 1,
      );
      check(
        `Destination fits mobile ${path}`,
        await routes.page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      check(
        `Destination returns to an existing homepage card ${path}`,
        (await routes.page
          .getByRole("link", { name: "Back to career paths", exact: true })
          .getAttribute("href")) ===
          (path === "/jobs" ? "/#career-jobs" : "/#career-training"),
      );
      await routes.page.screenshot({
        path: `${dir}/destination-${path.split("/").at(-1)}.png`,
      });
    }
    await routes.context.close();
    check(
      "No unexpected runtime or shader errors",
      !report.errors.length && !report.consoleErrors.length,
      { errors: report.errors, console: report.consoleErrors },
    );
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/career-section-qa.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          checks: report.checks.length,
          failed: report.checks.filter((c) => !c.pass),
          errors: report.errors,
          consoleErrors: report.consoleErrors,
          failure: report.failure,
        },
        null,
        2,
      ),
    );
  }
})();
