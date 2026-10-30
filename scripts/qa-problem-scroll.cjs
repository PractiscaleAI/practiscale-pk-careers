const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const sharp = require("sharp");
const fs = require("node:fs");
const dir = "docs/qa/problem-scroll/v038";
const titles = [
  "A degree without a marketable skill",
  "More effort, little financial progress",
  "Income with no real stability",
];
const bodies = [
  "You have the qualification. Employers also need practical skills and experience you can bring to the job.",
  "You take on more responsibility and deliver better results, but your income does not reflect the value you create.",
  "Freelancing brings opportunity. Inconsistent projects and demand make it hard to rely on a steady income.",
];
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const report = { checks: [], errors: [] };
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
  const open = async (options) => {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    await page.goto("http://127.0.0.1:3000/", {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page
      .locator(".preloader")
      .waitFor({ state: "hidden", timeout: 11000 });
    await page.waitForTimeout(450);
    return page;
  };
  try {
    const page = await open({ viewport: { width: 1536, height: 696 } });
    const section = page.locator("#the-problem"),
      root = section.locator("[data-enhanced]");
    const scroll = async (y) => {
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(850);
    };
    const metrics = () =>
      section.evaluate((el) => {
        const root = el.querySelector("[data-layout]");
        const stage = root.dataset.layout === "stage";
        const top = scrollY + el.getBoundingClientRect().top;
        const clearance = parseFloat(
          getComputedStyle(el).getPropertyValue("--nav-clearance"),
        );
        return {
          top,
          start: stage
            ? scrollY + root.getBoundingClientRect().top - clearance
            : top,
          clearance,
          travel:
            parseFloat(
              (stage ? root : el).style.getPropertyValue("--scroll-travel"),
            ) || 0,
          mode: el.dataset.motion,
          layout: root.dataset.layout,
          stageHeight:
            parseFloat(root.style.getPropertyValue("--stage-height")) || 0,
          sceneHeight: el.firstElementChild.offsetHeight,
        };
      });
    check(
      "Ten current homepage sections including team testimonials",
      (await page.locator("main > section").count()) === 10,
    );
    check(
      "Exact problem titles",
      JSON.stringify(await section.locator("h3").allTextContents()) ===
        JSON.stringify(titles),
    );
    check(
      "Exact problem descriptions",
      JSON.stringify(
        await section.locator("[data-problem-copy] p").allTextContents(),
      ) === JSON.stringify(bodies),
    );
    check(
      "Exact heading",
      (await section.locator("h2").innerText()) ===
        "Why careers in Pakistan get stuck.",
    );
    check(
      "Exactly one training CTA",
      (await section.getByRole("link").count()) === 1 &&
        (await section.getByRole("link").innerText()) === "Explore training" &&
        (await section.getByRole("link").getAttribute("href")).includes(
          "wa.me/923334000600",
        ),
    );
    check(
      "No arrows, pagination or carousel role",
      (await section
        .locator(
          "button,[aria-roledescription='carousel'],[aria-label='Choose a problem']",
        )
        .count()) === 0,
    );
    check(
      "No em dash in site copy",
      !(await page.locator("main").textContent()).includes(
        String.fromCharCode(8212),
      ),
    );
    check(
      "Accepted front photographs unchanged",
      JSON.stringify(
        await section
          .locator("article img")
          .evaluateAll((els) => els.map((el) => el.getAttribute("src"))),
      ) ===
        JSON.stringify([
          "/media/career-problems/graduate-v1.webp",
          "/media/career-problems/professional-v2.webp",
          "/media/career-problems/freelancer-v1.webp",
        ]),
    );
    for (const [width, height] of [
      [1024, 900],
      [1192, 768],
      [1440, 900],
      [1536, 696],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(450);
      await page.mouse.wheel(0, 1);
      await page.waitForTimeout(250);
      const m = await metrics();
      check(
        `Desktop scroll scene ${width}x${height}`,
        m.mode === "scroll" && m.layout === "fan",
        m,
      );
      await scroll(m.top);
      const start = await section
        .locator("[data-problem-shell]")
        .evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().toJSON()),
        );
      check(
        `Artwork joins at start ${width}`,
        Math.abs(start[0].right - start[1].left) < 2 &&
          Math.abs(start[1].right - start[2].left) < 2,
        start,
      );
      check(
        `Teal artwork is active ${width}`,
        await section
          .locator("[data-problem-back]")
          .first()
          .evaluate((el) =>
            getComputedStyle(el).backgroundImage.includes(
              "teal-landscape-v1.webp",
            ),
          ),
      );
      const corners = await section
        .locator("[data-problem-back]")
        .evaluateAll((els) =>
          els.map((el) => {
            const s = getComputedStyle(el);
            return [
              s.borderTopLeftRadius,
              s.borderTopRightRadius,
              s.borderBottomRightRadius,
              s.borderBottomLeftRadius,
            ].map(parseFloat);
          }),
        );
      check(
        `Joined internal corners stay square ${width}`,
        JSON.stringify(corners) ===
          JSON.stringify([
            [24, 0, 0, 24],
            [0, 0, 0, 0],
            [0, 24, 24, 0],
          ]),
        corners,
      );
      const pixels = await sharp(await page.screenshot())
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const seams = [];
      for (const x of [start[0].right, start[1].right])
        for (const fraction of [0.1, 0.5, 0.9])
          for (const offset of [-1, 0, 1]) {
            const y = Math.floor(start[0].top + start[0].height * fraction),
              at = (y * pixels.info.width + Math.round(x) + offset) * 3;
            seams.push([...pixels.data.subarray(at, at + 3)]);
          }
      check(
        `Panel joins have teal pixels without light gaps ${width}`,
        seams.every(([r, g, b]) => g > r * 1.15 && b > r * 1.1),
        seams,
      );
      for (const progress of [0, 0.2, 0.5, 0.85]) {
        await scroll(m.top + m.travel * progress);
        const g = await section.evaluate((el) => ({
          sceneTop: el.firstElementChild.getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }));
        check(
          `Aligned scroll scene ${width}/${progress}`,
          Math.abs(g.sceneTop) < 2 && !g.overflow,
          g,
        );
        if ([1440, 1536].includes(width))
          await page.screenshot({ path: `${dir}/${width}-${progress}.png` });
      }
      const end = await section.evaluate((el) => ({
        cta: el.querySelector("a").getBoundingClientRect().toJSON(),
        cards: [...el.querySelectorAll("article")].map((card) => ({
          rect: card.getBoundingClientRect().toJSON(),
          bodySize: parseFloat(
            getComputedStyle(card.querySelector("p")).fontSize,
          ),
          loaded:
            card.querySelector("img").complete &&
            card.querySelector("img").naturalWidth > 0,
        })),
      }));
      check(
        `Readable fan and CTA fit ${width}x${height}`,
        end.cards.every(
          (c) =>
            c.loaded &&
            c.bodySize >= 16 &&
            c.rect.left >= 16 &&
            c.rect.right <= width - 16 &&
            c.rect.top >= 0 &&
            c.rect.bottom < end.cta.top - 10,
        ) && end.cta.bottom <= height + 1,
        end,
      );
      check(
        `All three stories accessible ${width}`,
        (await section.getByRole("article").count()) === 3,
      );
      const rest = await section
        .locator("[data-problem-shell]")
        .evaluateAll((els) =>
          els.map((el) => {
            const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
            return {
              angle: (Math.atan2(m.b, m.a) * 180) / Math.PI,
              scale: Math.hypot(m.a, m.b),
            };
          }),
        );
      check(
        `Calm desktop reading angles ${width}`,
        rest.every(
          (r, i) =>
            Math.abs(r.angle - (i - 1) * 2.5) < 0.1 &&
            Math.abs(r.scale - 1) < 0.001,
        ),
        rest,
      );
      await scroll(m.top);
      const reverse = await section
        .locator("[data-problem-shell]")
        .evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().toJSON()),
        );
      check(
        `Reverse scroll reunites artwork ${width}`,
        Math.abs(reverse[0].right - reverse[1].left) < 2 &&
          Math.abs(reverse[1].right - reverse[2].left) < 2,
      );
    }
    check(
      "No decorative WebGL renderer",
      (await section.locator("canvas").count()) === 0,
    );
    for (const [width, height, expectedLayout] of [
      [320, 568, "stage"],
      [443, 646, "stage"],
      [375, 812, "stack"],
      [430, 932, "stack"],
      [768, 900, "stack"],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(450);
      const m = await metrics();
      await scroll(m.start);
      check(
        `Responsive reading mode ${width}x${height}`,
        m.layout === expectedLayout &&
          m.mode === (expectedLayout === "stage" ? "stage" : "scroll"),
        m,
      );
      check(
        `No arrow controls ${width}`,
        (await section.locator("button").count()) === 0,
      );
      check(
        `All stories accessible ${width}`,
        (await section.getByRole("article").count()) === 3 &&
          (await section.locator("article[aria-hidden]").count()) === 0,
      );
      for (let index = 0; index < 3; index++) {
        const card = section.locator("article").nth(index);
        await scroll(m.start + m.travel * [0.1, 0.52, 0.91][index]);
        const g = await card.evaluate((el) => ({
          rect: el.getBoundingClientRect().toJSON(),
          copyBottom: el.querySelector("p").getBoundingClientRect().bottom,
          bodySize: parseFloat(
            getComputedStyle(el.querySelector("p")).fontSize,
          ),
          loaded:
            el.querySelector("img").complete &&
            el.querySelector("img").naturalWidth > 0,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          angle: (() => {
            const m = new DOMMatrixReadOnly(
              getComputedStyle(el.closest("[data-problem-shell]")).transform,
            );
            return (Math.atan2(m.b, m.a) * 180) / Math.PI;
          })(),
        }));
        check(
          `Readable story ${width}/${index + 1}`,
          g.loaded &&
            !g.overflow &&
            g.bodySize >= 16 &&
            g.rect.left >= 18 &&
            g.rect.right <= width - 18 &&
            g.copyBottom <= g.rect.bottom - 18,
          g,
        );
        {
          const cta = await section.locator("a").boundingBox();
          check(
            `Scroll selects story ${width}/${index + 1}`,
            (await root.getAttribute("data-active")) === String(index),
          );
          check(
            `Story fits its reading area ${width}/${index + 1}`,
            g.rect.top >= m.clearance &&
              g.rect.bottom <= height - 20 &&
              g.rect.bottom < cta.y - 12,
            g,
          );
          check(
            `Active mobile card is upright ${width}/${index + 1}`,
            Math.abs(g.angle) < 0.05,
            g.angle,
          );
        }
        await page.screenshot({
          path: `${dir}/${width}-story-${index + 1}.png`,
        });
      }
      {
        check(
          `Pinned reading scene fits ${width}x${height}`,
          expectedLayout === "stage"
            ? m.stageHeight + m.clearance <= height - 24
            : m.sceneHeight <= height + 2,
          m,
        );
        await scroll(m.start);
        const before = await section
          .locator("[data-problem-shell]")
          .nth(1)
          .evaluate((el) => el.getBoundingClientRect().top);
        await scroll(m.start + m.travel * 0.52);
        const after = await section
          .locator("[data-problem-shell]")
          .nth(1)
          .evaluate((el) => el.getBoundingClientRect().top);
        check(
          `Next card rises instead of moving sideways ${width}`,
          before - after > 250,
          { before, after },
        );
        await scroll(m.start + m.travel * 0.91);
        await scroll(m.start + m.travel * 0.52);
        check(
          `Reverse restores previous story ${width}`,
          (await root.getAttribute("data-active")) === "1",
        );
        await scroll(m.top);
        const clearance = await page.evaluate(() => ({
          heading: document
            .querySelector("#problem-heading")
            .getBoundingClientRect().top,
          header: document.querySelector(".site-header").getBoundingClientRect()
            .bottom,
          placement: document.querySelector(".site-header").dataset.placement,
        }));
        check(
          `Upward navigation clears heading ${width}`,
          clearance.placement === "up" &&
            clearance.heading >= clearance.header + 12,
          clearance,
        );
        if (expectedLayout === "stage") {
          await page.screenshot({
            path: `${dir}/${width}-heading-navigation.png`,
          });
          await scroll(m.start + m.travel);
          const pinned = await section
            .locator("[data-problem-deck]")
            .boundingBox();
          await scroll(m.start + m.travel + 100);
          const released = await section
            .locator("[data-problem-deck]")
            .boundingBox();
          const cta = await section.locator("a").boundingBox();
          check(
            `Card stage releases naturally for CTA ${width}`,
            released.y < pinned.y - 20 &&
              cta.y + cta.height <= height + 1 &&
              cta.y > released.y + released.height,
            { pinned, released, cta },
          );
          await page.screenshot({ path: `${dir}/${width}-stage-release.png` });
        }
        await scroll(m.start);
        check(
          `Reverse reaches first story ${width}`,
          (await root.getAttribute("data-active")) === "0",
        );
        if (width === 375) {
          await page.keyboard.press("PageDown");
          await page.waitForTimeout(1000);
          check(
            "Native PageDown advances the stack movement",
            Number(await root.getAttribute("data-progress")) > 0.2 &&
              (
                await section
                  .locator("[data-problem-shell]")
                  .nth(1)
                  .boundingBox()
              ).y < height,
            {
              progress: await root.getAttribute("data-progress"),
              scroll: await page.evaluate(() => scrollY),
            },
          );
          await page.keyboard.press("PageUp");
          await page.waitForTimeout(1000);
          check(
            "Native PageUp reverses the stack",
            (await root.getAttribute("data-active")) === "0" &&
              Number(await root.getAttribute("data-progress")) < 0.01,
          );
        }
      }
      check(
        `Native touch scroll and zoom ${width}`,
        await section
          .locator("[data-problem-deck]")
          .evaluate((el) =>
            getComputedStyle(el.parentElement).touchAction.includes("pan-y"),
          ),
      );
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addStyleTag({
      content:
        "#the-problem h2,#the-problem h3,#the-problem p,#the-problem a{font-size:200%!important;line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}",
    });
    await page.waitForTimeout(500);
    check("Enlarged text removes the pin", (await metrics()).mode === "static");
    check(
      "Enlarged text stays inside cards",
      await section
        .locator("article")
        .evaluateAll((els) =>
          els.every(
            (el) =>
              el.querySelector("p").getBoundingClientRect().bottom <=
              el.getBoundingClientRect().bottom,
          ),
        ),
    );
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForFunction(
      () =>
        document.querySelector("#the-problem [data-layout]")?.dataset.layout ===
        "list",
      null,
      { timeout: 3000 },
    );
    check(
      "Enlarged phone text uses a complete list",
      (await metrics()).layout === "list" &&
        (await section.getByRole("article").count()) === 3,
      {
        metrics: await metrics(),
        accessible: await section.getByRole("article").count(),
      },
    );
    await page.close();
    const reduced = await open({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    check(
      "Reduced motion shows the completed desktop fan",
      await reduced
        .locator("#the-problem")
        .evaluate(
          (el) =>
            el.dataset.motion === "static" &&
            el.offsetHeight < innerHeight * 1.5,
        ),
    );
    await reduced.setViewportSize({ width: 375, height: 812 });
    await reduced.waitForTimeout(450);
    check(
      "Reduced motion shows every phone story in a natural list",
      await reduced
        .locator("#the-problem")
        .evaluate(
          (el) =>
            el.dataset.motion === "static" &&
            el.querySelector("[data-layout]").dataset.layout === "list" &&
            el.querySelectorAll("article:not([aria-hidden])").length === 3,
        ),
    );
    const axe = await new AxeBuilder({ page: reduced })
      .include("#the-problem")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.violations = axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    }));
    check(
      "No automated section accessibility violations",
      report.violations.length === 0,
      report.violations,
    );
    await reduced.close();
    const nojs = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 812 },
    });
    await nojs.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
    check(
      "No JavaScript keeps all stories in normal flow",
      await nojs
        .locator("#the-problem [data-problem-shell]")
        .evaluateAll(
          (els) =>
            els.length === 3 &&
            els.every((el) => getComputedStyle(el).position === "relative"),
        ),
    );
    check(
      "No JavaScript has no inactive controls",
      (await nojs.locator("#the-problem button").count()) === 0,
    );
    await nojs.close();
    check("No runtime errors", report.errors.length === 0, report.errors);
  } catch (error) {
    report.failure = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/problem-scroll-qa.json",
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
