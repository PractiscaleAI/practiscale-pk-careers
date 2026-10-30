const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const url = "http://127.0.0.1:3000/";

async function openFooter(page) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const preloader = page.locator(".preloader");
  if ((await preloader.count()) && (await preloader.isVisible())) {
    await page.keyboard.press("Escape");
    await preloader.waitFor({ state: "hidden", timeout: 15000 });
  }
  await page.evaluate(() => {
    const footer = document.querySelector("#site-footer");
    scrollTo({ top: footer.offsetTop, behavior: "instant" });
  });
}

async function pose(page) {
  return page.locator("[data-guide-ready]").evaluate((element) => ({
    yaw: Number(element.dataset.headYaw),
    eye: Number(element.dataset.eyeX),
    animating: element.dataset.guideAnimating,
  }));
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  try {
    const desktop = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    desktop.on("pageerror", (error) => errors.push(error.message));
    await openFooter(desktop);
    const guide = desktop.locator("[data-guide-ready]");
    await guide.waitFor({ timeout: 15000 });
    const box = await guide.boundingBox();
    assert(box, "the footer canvas must have a layout box");
    const y = box.y + box.height * 0.3;
    await desktop.mouse.move(box.x + box.width / 2, y);
    await desktop.waitForTimeout(1100);
    assert(
      Math.abs((await pose(desktop)).yaw) < 0.03,
      "head should return near neutral",
    );

    await desktop.mouse.move(box.x + box.width - 80, y);
    await desktop.waitForTimeout(90);
    const leading = await pose(desktop);
    assert(leading.eye > leading.yaw / 0.18 + 0.1, "eyes should lead the head");
    await desktop.waitForTimeout(750);
    const right = await pose(desktop);
    assert(
      right.yaw > 0.13 && right.yaw <= 0.181,
      "head should turn right within its limit",
    );

    await desktop.mouse.move(box.x + 80, y);
    await desktop.waitForTimeout(950);
    const left = await pose(desktop);
    assert(
      left.yaw < -0.13 && left.yaw >= -0.181,
      "head should reverse smoothly",
    );

    await desktop.waitForTimeout(3600);
    const idle = await pose(desktop);
    assert(
      Math.abs(idle.yaw) < 0.04,
      "head should settle after pointer inactivity",
    );
    let pausedBetweenBeats = idle.animating === "false";
    for (let i = 0; i < 16 && !pausedBetweenBeats; i++) {
      await desktop.waitForTimeout(100);
      pausedBetweenBeats = (await pose(desktop)).animating === "false";
    }
    assert(
      pausedBetweenBeats,
      "WebGL should pause between interaction and idle beats",
    );
    assert.deepEqual(errors, [], "desktop should have no runtime errors");
    console.log("desktop", { leading, right, left, idle, pausedBetweenBeats });

    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    await openFooter(mobile);
    await mobile.locator("#site-footer").scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(500);
    assert.equal(
      await mobile.locator("#site-footer canvas").count(),
      0,
      "touch must keep the still",
    );
    console.log("touch still: passed");

    const reduced = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await openFooter(reduced);
    await reduced.waitForTimeout(500);
    assert.equal(
      await reduced.locator("#site-footer canvas").count(),
      0,
      "reduced motion must keep the still",
    );
    console.log("reduced-motion still: passed");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
