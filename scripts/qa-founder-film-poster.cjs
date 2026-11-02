const { chromium } = require("playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs/promises");
const path = require("node:path");

(async () => {
  const out =
    process.argv[2] || path.join(process.cwd(), "tmp", "founder-film-poster");
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  let failed = 0;
  try {
    for (const [width, height] of [
      [1440, 900],
      [1192, 768],
      [1024, 768],
      [768, 1024],
      [767, 1024],
      [600, 900],
      [390, 844],
      [320, 700],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("http://127.0.0.1:3000/#background-lines", {
        waitUntil: "domcontentloaded",
      });
      await dismissIntroduction(page);
      await page.waitForTimeout(500);
      for (const progress of [0, 0.2, 0.35, 0.5, 0.78, 0]) {
        await page.evaluate((p) => {
          const root = document.querySelector("#background-lines");
          scrollTo({
            top:
              root.getBoundingClientRect().top +
              scrollY +
              Math.max(0, root.offsetHeight - innerHeight) * p,
            behavior: "instant",
          });
        }, progress);
        await page.waitForTimeout(progress === 0.78 ? 1100 : 650);
        const state = await page.evaluate(() => {
          const root = document.querySelector("#background-lines");
          const image = root.querySelector("[data-founder-poster]");
          const thumbnail = root.querySelector("[data-founder-thumbnail]");
          const thumbnailImage = thumbnail.querySelector("img");
          const video = root.querySelector("[data-founder-video]");
          const dialogVideo = root.querySelector("[data-founder-dialog-video]");
          const slot = root.querySelector("[data-founder-slot]");
          const paragraph = root.querySelector(
            "[data-founder-copy] > p:last-child",
          );
          return {
            enhanced: root.dataset.enhanced,
            expanded: root.dataset.expanded,
            filmReady: root.dataset.filmReady,
            imageReady: image.complete && image.naturalWidth > 0,
            src: image.currentSrc,
            thumbnailReady:
              thumbnailImage.complete && thumbnailImage.naturalWidth > 0,
            thumbnailSrc: thumbnailImage.currentSrc,
            thumbnailOpacity: Number(getComputedStyle(thumbnail).opacity),
            posterOpacity: getComputedStyle(image.parentElement).opacity,
            videoPoster: video.poster,
            dialogPoster: dialogVideo.poster,
            videoPaused: video.paused,
            slotWidth: slot.getBoundingClientRect().width,
            paragraphWidth: paragraph.getBoundingClientRect().width,
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        });
        const key = String(progress).replace(".", "_");
        await page.screenshot({ path: path.join(out, `${width}-${key}.png`) });
        const phoneWide = width <= 1023 && height > width;
        const format = phoneWide
          ? "mobile-wide"
          : width <= 1023 && height > width
            ? "portrait"
            : "desktop";
        const thumbnailName = phoneWide
          ? "founder-thumbnail-mobile-wide-v4"
          : `founder-thumbnail-${format}-v3`;
        const nativePoster = phoneWide
          ? "founder-thumbnail-portrait-v3.webp"
          : `${thumbnailName}.webp`;
        const ok =
          state.imageReady &&
          state.src.includes("founder-film-still-") &&
          state.videoPoster.includes(nativePoster) &&
          state.dialogPoster.includes("founder-film-still-") &&
          (state.enhanced !== "true" ||
            (state.thumbnailReady &&
              state.thumbnailSrc.includes(thumbnailName) &&
              state.slotWidth >= state.paragraphWidth - 1 &&
              (progress === 0
                ? state.thumbnailOpacity > 0.95
                : state.thumbnailOpacity < 0.05))) &&
          state.overflow <= 1 &&
          !errors.length;
        if (!ok) failed++;
        console.log(
          JSON.stringify({ width, height, progress, ok, state, errors }),
        );
      }
      const watchButton = page.locator("[data-founder-watch]");
      if (await watchButton.isVisible()) {
        await watchButton.click();
      } else {
        await page.mouse.move(width / 2, height / 2);
        await page.mouse.wheel(0, 1600);
      }
      await page.locator("[data-founder-dialog-continue]").waitFor({
        state: "visible",
      });
      const skipState = await page.evaluate(() => {
        const dialog = document.querySelector("[data-founder-dialog]");
        const video = document.querySelector("[data-founder-dialog-video]");
        const button = document.querySelector("[data-founder-dialog-continue]");
        const buttonRect = button.getBoundingClientRect();
        const videoRect = video.getBoundingClientRect();
        const hit = document.elementFromPoint(
          buttonRect.left + buttonRect.width / 2,
          buttonRect.top + buttonRect.height / 2,
        );
        return {
          open: dialog.open,
          text: button.textContent.trim(),
          bottomClearance: videoRect.bottom - buttonRect.bottom,
          rightClearance: videoRect.right - buttonRect.right,
          buttonWidth: buttonRect.width,
          hit: hit === button || button.contains(hit),
          scrollBeforeSkip: scrollY,
        };
      });
      await page.screenshot({ path: path.join(out, `${width}-dialog.png`) });
      await page.locator("[data-founder-dialog-continue]").click();
      const afterSkip = await page.evaluate(() => ({
        dialogOpen: document.querySelector("[data-founder-dialog]").open,
        scrollY,
        focusedSection: document.activeElement?.id === "background-lines",
      }));
      const skipOk =
        skipState.open &&
        skipState.text.includes("Skip the video") &&
        skipState.bottomClearance >= 60 &&
        skipState.rightClearance >= 0 &&
        skipState.buttonWidth >= 120 &&
        skipState.hit &&
        !afterSkip.dialogOpen &&
        afterSkip.scrollY > skipState.scrollBeforeSkip &&
        afterSkip.focusedSection &&
        !errors.length;
      if (!skipOk) failed++;
      console.log(
        JSON.stringify({ width, height, skipOk, skipState, afterSkip, errors }),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (failed) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
