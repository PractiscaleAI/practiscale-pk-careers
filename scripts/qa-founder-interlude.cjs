const { chromium } = require("playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const out =
    process.argv[2] || path.join(process.cwd(), "tmp", "founder-interlude");
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  let failures = 0;
  try {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1366, 600],
      [1366, 768],
      [1440, 900],
    ]) {
      if (process.argv[3] && process.argv[3] !== `${width}x${height}`) continue;
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:3000/#background-lines", {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.waitForTimeout(550);
      const root = page.locator("#background-lines");
      await page.evaluate(() => {
        const section = document.querySelector("#background-lines");
        scrollTo({ top: section.getBoundingClientRect().top + scrollY });
      });
      await page.waitForTimeout(550);
      const intro = await page.evaluate(() => {
        const section = document.querySelector("#background-lines");
        const img = section.querySelector("[data-founder-poster]");
        return {
          enhanced: section.dataset.enhanced === "true",
          posterReady: img.complete && img.naturalWidth > 0,
          overflow: document.documentElement.scrollWidth - innerWidth,
          top: section.getBoundingClientRect().top,
          height: section.offsetHeight,
          scrollY,
        };
      });
      await page.screenshot({
        path: path.join(out, `${width}x${height}-intro.png`),
      });
      let modal = null;
      if (intro.enhanced) {
        await page.mouse.move(width / 2, height / 2);
        await page.mouse.wheel(0, height * 4);
        await page.waitForTimeout(600);
        modal = await page.evaluate(() => {
          const dialog = document.querySelector("[data-founder-dialog]");
          const player = dialog.querySelector("video");
          return {
            open: dialog.open,
            paused: player.paused,
            muted: player.muted,
            scrollY,
            bodyOverflow: document.body.style.overflow,
            top: document
              .querySelector("#background-lines")
              .getBoundingClientRect().top,
            progress:
              document.querySelector("#background-lines").dataset
                .founderProgress,
          };
        });
        await page.screenshot({
          path: path.join(out, `${width}x${height}-dialog.png`),
        });
        if (modal.open) {
          await page.mouse.wheel(0, height * 3);
          await page.waitForTimeout(120);
          const lockedY = await page.evaluate(() => scrollY);
          await page.locator("[data-founder-dialog-play]").click();
          await page.waitForTimeout(1800);
          const playing = await page.evaluate(() => {
            const dialog = document.querySelector("[data-founder-dialog]");
            const player = document.querySelector(
              "[data-founder-dialog-video]",
            );
            return {
              open: dialog.open,
              state: dialog.dataset.playing,
              message: dialog.querySelector("[data-founder-dialog-message]")
                .textContent,
              paused: player.paused,
              muted: player.muted,
              volume: player.volume,
              time: player.currentTime,
            };
          });
          await page.screenshot({
            path: path.join(out, `${width}x${height}-playing.png`),
          });
          await page.locator("[data-founder-dialog-continue]").click();
          await page.waitForTimeout(220);
          const closed = await page.evaluate(() => ({
            open: document.querySelector("[data-founder-dialog]").open,
            overflow: document.body.style.overflow,
            scrollY,
          }));
          await page.mouse.wheel(0, -Math.min(height, 700));
          await page.waitForTimeout(180);
          const reverse = await page.evaluate(() => ({
            open: document.querySelector("[data-founder-dialog]").open,
            scrollY,
          }));
          const ok =
            intro.posterReady &&
            intro.overflow <= 1 &&
            !errors.length &&
            modal.open &&
            modal.paused &&
            !modal.muted &&
            modal.bodyOverflow === "hidden" &&
            Math.abs(lockedY - modal.scrollY) <= 2 &&
            !playing.paused &&
            playing.open &&
            playing.state === "true" &&
            playing.message === "" &&
            !playing.muted &&
            playing.volume === 1 &&
            !closed.open &&
            closed.overflow !== "hidden" &&
            !reverse.open &&
            reverse.scrollY < closed.scrollY;
          if (!ok) failures++;
          console.log(
            JSON.stringify({
              width,
              height,
              ok,
              intro,
              modal,
              lockedY,
              playing,
              closed,
              reverse,
              errors,
            }),
          );
        } else {
          failures++;
          console.log(
            JSON.stringify({ width, height, ok: false, intro, modal, errors }),
          );
        }
      } else {
        const fallback = await root
          .locator("video")
          .first()
          .evaluate((video) => ({
            controls: video.controls,
            muted: video.muted,
          }));
        await page.mouse.move(width / 2, height / 2);
        await page.mouse.wheel(0, height * 4);
        await page.waitForTimeout(600);
        const fallbackDialog = await page.evaluate(() => {
          const dialog = document.querySelector("[data-founder-dialog]");
          return {
            open: dialog.open,
            muted: dialog.querySelector("video").muted,
            scrollLocked: document.body.style.overflow === "hidden",
          };
        });
        if (fallbackDialog.open)
          await page.locator("[data-founder-dialog-continue]").click();
        const ok =
          intro.posterReady &&
          intro.overflow <= 1 &&
          fallback.controls &&
          !fallback.muted &&
          fallbackDialog.open &&
          !fallbackDialog.muted &&
          fallbackDialog.scrollLocked &&
          !errors.length;
        if (!ok) failures++;
        console.log(
          JSON.stringify({
            width,
            height,
            ok,
            intro,
            fallback,
            fallbackDialog,
            errors,
          }),
        );
      }
      if (width === 320) {
        await page.goto("http://127.0.0.1:3000/", {
          waitUntil: "domcontentloaded",
        });
        await dismissIntroduction(page);
        await page.waitForTimeout(550);
        await page.mouse.wheel(0, 40);
        await page.evaluate(() => {
          location.hash = "#how-hiring-works";
        });
        await page.waitForTimeout(650);
        const hashJumpOpenedFilm = await page.evaluate(
          () => document.querySelector("[data-founder-dialog]").open,
        );
        if (hashJumpOpenedFilm) failures++;
        console.log(JSON.stringify({ width, hashJumpOpenedFilm }));
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (failures) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
