const { chromium } = require("@playwright/test");
const path = require("node:path");

const baseURL = process.env.FAQ_BASE_URL || "http://127.0.0.1:3000";
const cases = [
  [320, 568],
  [390, 844],
  [424, 668],
  [768, 600],
  [768, 1024],
  [1536, 696],
  [1440, 900],
  [1900, 861],
];

async function dismissIntroduction(page) {
  await page.waitForTimeout(350);
  const intro = page.locator(".preloader");
  if (await intro.isVisible()) {
    await page.keyboard.press("Escape");
    await intro.waitFor({ state: "hidden" });
  }
}

async function goToQuestion(page, index) {
  await page.evaluate((itemIndex) => {
    const item = document.querySelectorAll("[data-faq-item]")[itemIndex];
    const focus = innerHeight * (innerWidth <= 600 ? 0.38 : 0.5);
    scrollTo({
      top: item.getBoundingClientRect().top + scrollY - focus + 10,
      behavior: "instant",
    });
  }, index);
  await page.waitForFunction(
    (itemIndex) =>
      document.querySelector("#questions")?.dataset.active ===
      String(itemIndex),
    index,
  );
  await page.waitForTimeout(450);
}

async function capture(page, width, height, scene) {
  if (
    !process.env.FAQ_SHOTS ||
    ![320, 424, 768, 1440, 1536, 1900].includes(width)
  )
    return;
  await page.screenshot({
    path: path.join(
      process.env.FAQ_SHOTS,
      `faq-reference-match-${width}x${height}-${scene}.png`,
    ),
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    for (const [width, height] of cases) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "no-preference",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(baseURL, { waitUntil: "domcontentloaded" });
      await dismissIntroduction(page);
      await page.evaluate(() => document.fonts.ready);
      const headingAlignment = await page
        .locator("#questions")
        .evaluate((section) => {
          const eyebrow = section.querySelector("[data-faq-intro-track] p");
          const heading = section.querySelector("[data-faq-intro-track] h2");
          const labelRect = eyebrow.getBoundingClientRect();
          const headingRect = heading.getBoundingClientRect();
          return Math.abs(
            labelRect.left +
              labelRect.width / 2 -
              (headingRect.left + headingRect.width / 2),
          );
        });
      if (headingAlignment > 2)
        throw Error(
          `${width}x${height}: FAQ eyebrow is off-center by ${headingAlignment}px`,
        );
      const boundaryLine = await page.locator("#apply").evaluate((section) => {
        const decoration = getComputedStyle(section, "::after");
        return (
          decoration.content !== "none" &&
          decoration.content !== "normal" &&
          parseFloat(decoration.height) > 0
        );
      });
      if (boundaryLine)
        throw Error(`${width}x${height}: stray divider above the FAQ`);
      await page.waitForFunction(
        () => document.querySelector("#questions")?.dataset.enhanced === "true",
      );

      await page.evaluate(() => {
        const intro = document.querySelector("[data-faq-intro-track]");
        scrollTo({
          top: intro.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        });
      });
      await page.waitForFunction(
        () =>
          document.querySelector("[data-faq-intro-scene]")?.dataset.ready ===
          "true",
      );
      await page.waitForTimeout(550);
      await capture(page, width, height, "intro");

      for (const progress of [0.25, 0.5, 0.72, 0.86, 0.94, 0.99]) {
        await page.evaluate((p) => {
          const intro = document.querySelector("[data-faq-intro-track]");
          scrollTo({
            top:
              intro.getBoundingClientRect().top +
              scrollY +
              (intro.offsetHeight - innerHeight) * p,
            behavior: "instant",
          });
        }, progress);
        await page.waitForFunction(
          (p) =>
            Math.abs(
              Number(
                getComputedStyle(
                  document.querySelector("#questions"),
                ).getPropertyValue("--faq-intro-progress"),
              ) - p,
            ) < 0.025,
          progress,
        );
        if (progress >= 0.94) {
          await page.waitForFunction(
            () =>
              Number(
                document
                  .querySelector("#questions")
                  ?.style.getPropertyValue("--faq-floor-close"),
              ) >= 0.99,
          );
          await page.waitForFunction(
            () =>
              Number(
                document
                  .querySelector("#questions")
                  ?.style.getPropertyValue("--faq-question-reveal"),
              ) >= 0.98,
          );
          const handoff = await page.evaluate(() => {
            const section = document.querySelector("#questions");
            const question = section.querySelector("[data-faq-item] h3");
            const rect = question.getBoundingClientRect();
            return {
              top: rect.top,
              bottom: rect.bottom,
              opacity: Number(
                section.style.getPropertyValue("--faq-question-reveal"),
              ),
              viewport: innerHeight,
            };
          });
          if (
            handoff.opacity < 0.98 ||
            handoff.top > handoff.viewport * 0.78 ||
            handoff.bottom > handoff.viewport
          )
            throw Error(
              `${width}x${height} at ${progress}: blank FAQ handoff ${JSON.stringify(handoff)}`,
            );
        }
        await capture(page, width, height, `intro-${progress}`);
      }

      if ([424, 1536].includes(width)) {
        await page.evaluate(() => {
          const intro = document.querySelector("[data-faq-intro-track]");
          scrollTo({
            top:
              intro.getBoundingClientRect().top +
              scrollY +
              (intro.offsetHeight - innerHeight) * 0.5,
            behavior: "instant",
          });
        });
        await page.waitForFunction(() => {
          const section = document.querySelector("#questions");
          return (
            Math.abs(
              Number(section.style.getPropertyValue("--faq-intro-progress")) -
                0.5,
            ) < 0.005 &&
            Number(section.style.getPropertyValue("--faq-floor-close")) <
              0.01 &&
            Number(section.style.getPropertyValue("--faq-question-reveal")) <
              0.01
          );
        });
        await capture(page, width, height, "intro-reverse-0.5");
      }

      for (const index of [0, 3, 6, 0]) {
        await goToQuestion(page, index);
        const state = await page.evaluate(() => {
          const section = document.querySelector("#questions");
          const items = [...section.querySelectorAll("[data-faq-item]")];
          const active = items.find((item) => item.dataset.active === "true");
          const activeAnswer = active.querySelector("[data-faq-answer]");
          return {
            active: section.dataset.active,
            visibleQuestions: items.filter(
              (item) => item.getClientRects().length,
            ).length,
            openAnswers: items.filter(
              (item) =>
                item.querySelector("[data-faq-answer]").getBoundingClientRect()
                  .height > 3,
            ).length,
            answerBottom: activeAnswer.getBoundingClientRect().bottom,
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        });
        if (
          state.active !== String(index) ||
          state.visibleQuestions !== 7 ||
          state.openAnswers !== 1 ||
          state.answerBottom > height + 8 ||
          state.overflow > 1 ||
          errors.length
        )
          throw Error(
            `${width}x${height} question ${index + 1}: ${JSON.stringify({ state, errors })}`,
          );
        if ([0, 6].includes(index))
          await capture(page, width, height, `question-${index + 1}`);
      }
      console.log(
        `PASS ${width}x${height}: 3D entrance, questions 01 -> 04 -> 07 -> 01`,
      );
      await page.close();
    }

    const touch = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const touchPage = await touch.newPage();
    await touchPage.goto(baseURL, { waitUntil: "domcontentloaded" });
    await dismissIntroduction(touchPage);
    await goToQuestion(touchPage, 6);
    const touchState = await touchPage.evaluate(() => ({
      active: document.querySelector("#questions")?.dataset.active,
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    if (touchState.active !== "6" || touchState.overflow > 1)
      throw Error(`Touch layout: ${JSON.stringify(touchState)}`);
    console.log(
      "PASS touch emulation: final answer and no horizontal overflow",
    );
    await touch.close();

    const reduced = await browser.newPage({
      viewport: { width: 424, height: 668 },
      reducedMotion: "reduce",
    });
    await reduced.goto(baseURL, { waitUntil: "domcontentloaded" });
    await dismissIntroduction(reduced);
    const fallback = await reduced.evaluate(() => {
      const section = document.querySelector("#questions");
      return {
        enhanced: section.dataset.enhanced,
        openAnswers: [...section.querySelectorAll("[data-faq-answer]")].filter(
          (answer) => answer.getBoundingClientRect().height > 3,
        ).length,
      };
    });
    if (fallback.enhanced !== "false" || fallback.openAnswers !== 7)
      throw Error(`Reduced-motion fallback: ${JSON.stringify(fallback)}`);
    console.log(
      "PASS reduced motion: all seven answers in normal reading order",
    );
    await reduced.close();

    const noScript = await browser.newContext({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: false,
    });
    const noScriptPage = await noScript.newPage();
    await noScriptPage.goto(baseURL, { waitUntil: "domcontentloaded" });
    const noScriptAnswers = await noScriptPage
      .locator("[data-faq-answer]")
      .count();
    if (noScriptAnswers !== 7)
      throw Error(`No-JavaScript fallback: ${noScriptAnswers} answers`);
    console.log("PASS no JavaScript: seven answers in document order");
    await noScript.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
