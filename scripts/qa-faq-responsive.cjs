const { chromium } = require("@playwright/test");
const path = require("node:path");

const baseURL = process.env.FAQ_BASE_URL || "http://127.0.0.1:3000";
const cases = process.env.FAQ_CASE
  ? [process.env.FAQ_CASE.split("x").map(Number)]
  : [
      [320, 568],
      [390, 844],
      [424, 668],
      [768, 600],
      [768, 1024],
      [1100, 700],
      [1280, 720],
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
  await page.evaluate(() => {
    const intro = document.querySelector("[data-faq-intro-track]");
    scrollTo({
      top:
        intro.getBoundingClientRect().top +
        scrollY +
        intro.offsetHeight -
        innerHeight,
      behavior: "instant",
    });
  });
  await page.waitForFunction(
    () =>
      Number(
        document
          .querySelector("#questions")
          ?.style.getPropertyValue("--faq-intro-progress"),
      ) > 0.99,
  );
  await page.evaluate((itemIndex) => {
    const item = document.querySelectorAll("[data-faq-item]")[itemIndex];
    const focus = innerHeight * (innerWidth <= 600 ? 0.38 : 0.5);
    scrollTo({
      // The first row can already be near the top of the viewport at the
      // end of the intro. Scrolling backwards to center it reopens the 3D
      // scene and tests the wrong state.
      top: Math.max(
        scrollY,
        item.getBoundingClientRect().top + scrollY - focus + 10,
      ),
      behavior: "instant",
    });
  }, index);
  await page.waitForFunction(
    () => !document.querySelector("[data-faq-list]")?.inert,
  );
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

async function assertNoTitleQuestionCollision(page, label, frames = 1) {
  const samples = await page.evaluate(async (count) => {
    const title = document.querySelector("#questions h2");
    const titleLayer = title.parentElement;
    const firstRow = document.querySelector("#questions [data-faq-item]");
    const result = [];
    for (let frame = 0; frame < count; frame++) {
      await new Promise(requestAnimationFrame);
      const titleRect = title.getBoundingClientRect();
      const rowRect = firstRow.getBoundingClientRect();
      const horizontalOverlap =
        Math.min(titleRect.right, rowRect.right) -
        Math.max(titleRect.left, rowRect.left);
      const verticalOverlap =
        Math.min(titleRect.bottom, rowRect.bottom) -
        Math.max(titleRect.top, rowRect.top);
      const titleOpacity = Number(getComputedStyle(titleLayer).opacity);
      const rowOpacity = Number(getComputedStyle(firstRow).opacity);
      if (
        titleOpacity > 0.05 &&
        rowOpacity > 0.05 &&
        horizontalOverlap > 0 &&
        verticalOverlap > 0
      ) {
        result.push({
          frame,
          titleOpacity,
          rowOpacity,
          verticalOverlap,
          introProgress: document
            .querySelector("#questions")
            .style.getPropertyValue("--faq-intro-progress"),
        });
      }
    }
    return result;
  }, frames);
  if (samples.length)
    throw Error(
      `${label}: FAQ title overlaps first question ${JSON.stringify(samples[0])}`,
    );
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
        await assertNoTitleQuestionCollision(
          page,
          `${width}x${height} at ${progress}`,
        );
        await capture(page, width, height, `intro-${progress}`);
      }

      // A fast wheel or touch fling moves the document before eased visual
      // progress catches up. Check every painted frame in both directions.
      for (const target of [0, 1, 0]) {
        await page.evaluate((p) => {
          const intro = document.querySelector("[data-faq-intro-track]");
          scrollTo({
            top:
              intro.getBoundingClientRect().top +
              scrollY +
              (intro.offsetHeight - innerHeight) * p,
            behavior: "instant",
          });
        }, target);
        await assertNoTitleQuestionCollision(
          page,
          `${width}x${height} fast scroll to ${target}`,
          50,
        );
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

      let previousHover = -1;
      for (const index of [0, 3, 6, 0]) {
        await goToQuestion(page, index);
        const beforeHover = await page
          .locator("#questions")
          .getAttribute("data-active");
        if (beforeHover !== String(previousHover))
          throw Error(
            `${width}x${height}: scrolling changed the open answer from ${previousHover} to ${beforeHover}`,
          );
        await page.locator("[data-faq-trigger]").nth(index).hover();
        await page.waitForFunction(
          (itemIndex) =>
            document.querySelector("#questions")?.dataset.active ===
            String(itemIndex),
          index,
        );
        await page.waitForFunction(
          (itemIndex) => {
            const section = document.querySelector("#questions");
            const items = [...section.querySelectorAll("[data-faq-item]")];
            return (
              section.dataset.active === String(itemIndex) &&
              items.every((item, currentIndex) => {
                const answer = item.querySelector("[data-faq-answer]");
                const height = answer.getBoundingClientRect().height;
                return currentIndex === itemIndex
                  ? Math.abs(height - answer.scrollHeight) <= 3
                  : height <= 3;
              })
            );
          },
          index,
          { timeout: 1600 },
        );
        const state = await page.evaluate(() => {
          const section = document.querySelector("#questions");
          const items = [...section.querySelectorAll("[data-faq-item]")];
          const active = items.find((item) => item.dataset.active === "true");
          const activeAnswer = active.querySelector("[data-faq-answer]");
          return {
            active: section.dataset.active,
            expanded: active
              .querySelector("[data-faq-trigger]")
              .getAttribute("aria-expanded"),
            visibleQuestions: items.filter(
              (item) => item.getClientRects().length,
            ).length,
            openAnswers: items.filter(
              (item) =>
                item.querySelector("[data-faq-answer]").getBoundingClientRect()
                  .height > 3,
            ).length,
            answerHeights: items.map(
              (item) =>
                Math.round(
                  item
                    .querySelector("[data-faq-answer]")
                    .getBoundingClientRect().height * 10,
                ) / 10,
            ),
            answerBottom: activeAnswer.getBoundingClientRect().bottom,
            overflow: document.documentElement.scrollWidth - innerWidth,
            scrollY,
            questionTop: active.getBoundingClientRect().top,
            introProgress: document
              .querySelector("#questions")
              .style.getPropertyValue("--faq-intro-progress"),
          };
        });
        if ([0, 6].includes(index))
          await capture(page, width, height, `question-${index + 1}`);
        if (
          state.active !== String(index) ||
          state.expanded !== "true" ||
          state.visibleQuestions !== 7 ||
          state.openAnswers !== 1 ||
          state.answerBottom > height + 8 ||
          state.overflow > 1 ||
          errors.length
        )
          throw Error(
            `${width}x${height} question ${index + 1}: ${JSON.stringify({ state, errors })}`,
          );
        await page.mouse.move(5, 10);
        if (
          (await page.locator("#questions").getAttribute("data-active")) !==
          String(index)
        )
          throw Error(
            `${width}x${height}: leaving a question closed its answer`,
          );
        previousHover = index;
      }
      if (width === 1440) {
        const keyboardTrigger = page.locator("[data-faq-trigger]").nth(3);
        await keyboardTrigger.focus();
        await keyboardTrigger.press("Enter");
        const enterState = await page
          .locator("#questions")
          .getAttribute("data-active");
        if (enterState !== "3")
          throw Error(
            `Keyboard Enter did not open the focused FAQ answer: ${JSON.stringify(await page.evaluate(() => ({ active: document.querySelector("#questions").dataset.active, focus: document.activeElement?.tagName, disabled: document.querySelectorAll("[data-faq-trigger]")[3].disabled, inert: document.querySelector("[data-faq-list]").inert, scrollY, progress: document.querySelector("#questions").style.getPropertyValue("--faq-intro-progress") })))}`,
          );
        await keyboardTrigger.press("Space");
        if (
          (await page.locator("#questions").getAttribute("data-active")) !==
          "-1"
        )
          throw Error("Keyboard Space did not close the focused FAQ answer");
      }
      console.log(
        `PASS ${width}x${height}: 3D entrance and pointer-hover answers`,
      );
      await page.close();
    }

    for (const [width, height] of [
      [320, 568],
      [390, 844],
    ]) {
      const touch = await browser.newContext({
        viewport: { width, height },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      const touchPage = await touch.newPage();
      await touchPage.goto(baseURL, { waitUntil: "domcontentloaded" });
      await dismissIntroduction(touchPage);
      await goToQuestion(touchPage, 6);
      await touchPage.locator("[data-faq-trigger]").nth(6).tap();
      const touchState = await touchPage.evaluate(() => ({
        active: document.querySelector("#questions")?.dataset.active,
        overflow: document.documentElement.scrollWidth - innerWidth,
      }));
      if (touchState.active !== "6" || touchState.overflow > 1)
        throw Error(`Touch layout ${width}: ${JSON.stringify(touchState)}`);
      await touchPage.locator("[data-faq-trigger]").nth(6).tap();
      if (
        (await touchPage.locator("#questions").getAttribute("data-active")) !==
        "-1"
      )
        throw Error(
          `Touch ${width}: tapping an open question did not close it`,
        );
      console.log(
        `PASS touch ${width}x${height}: tap opens and closes an answer, no horizontal overflow`,
      );
      await touch.close();
    }

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
        motion: section.dataset.motion,
        openAnswers: [...section.querySelectorAll("[data-faq-answer]")].filter(
          (answer) => answer.getBoundingClientRect().height > 3,
        ).length,
      };
    });
    if (
      fallback.enhanced !== "true" ||
      fallback.motion !== "false" ||
      fallback.openAnswers !== 0
    )
      throw Error(`Reduced-motion fallback: ${JSON.stringify(fallback)}`);
    await reduced.locator("[data-faq-trigger]").first().click();
    if (
      (await reduced.locator("#questions").getAttribute("data-active")) !== "0"
    )
      throw Error("Reduced-motion FAQ did not open on click");
    console.log(
      "PASS reduced motion: static introduction and click-to-open answers",
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
    const visibleNoScriptAnswers = await noScriptPage
      .locator("[data-faq-answer]")
      .evaluateAll(
        (nodes) =>
          nodes.filter((answer) => answer.getBoundingClientRect().height > 3)
            .length,
      );
    if (visibleNoScriptAnswers !== 7)
      throw Error(
        `No-JavaScript fallback: only ${visibleNoScriptAnswers} visible answers`,
      );
    console.log("PASS no JavaScript: seven answers in document order");
    await noScript.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
