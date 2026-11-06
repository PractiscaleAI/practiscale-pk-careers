const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const outputDir = process.env.QA_OUTPUT_DIR;
const expectedProfiles = {
  Instagram:
    "https://www.instagram.com/practiscale_pk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  TikTok: "https://www.tiktok.com/@practiscale.pk?_r=1&_t=ZS-99NJtAMBTRC",
  Threads:
    "https://www.threads.com/@practiscale_pk?igshid=NTc4MTIwNjQ2YQ%3D%3D",
  Facebook:
    "https://www.facebook.com/practiscale.pk?rdid=NOTizFiVS413xo5T&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FPgXYejpx%2F#",
};

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    for (const device of [
      { name: "desktop", width: 1440, height: 900, touch: false },
      { name: "tablet", width: 768, height: 1024, touch: true },
      { name: "phone", width: 390, height: 844, touch: true },
    ]) {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        hasTouch: device.touch,
        isMobile: device.touch,
      });
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}/jobs`, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response.status(), 200);
      const dock = page.getByLabel("PractiScale social profiles");
      const trigger = dock.getByRole("button", { name: "Open social profiles" });
      await trigger.waitFor({ state: "visible" });
      await page.locator(".preloader").waitFor({ state: "hidden", timeout: 12000 });
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");

      if (outputDir && device.name === "desktop") {
        fs.mkdirSync(outputDir, { recursive: true });
        await page.screenshot({ path: path.join(outputDir, "social-dock-desktop-closed.png") });
      }

      if (device.touch) {
        await trigger.tap();
      } else {
        await trigger.hover();
      }
      const closeTrigger = dock.getByRole("button", { name: "Close social profiles" });
      await closeTrigger.waitFor({ state: "visible" });
      assert.equal(await closeTrigger.getAttribute("aria-expanded"), "true");
      await page.waitForFunction(() => {
        const panel = document.querySelector("[aria-label='Follow PractiScale']");
        return panel && getComputedStyle(panel).opacity === "1";
      });

      for (const [name, url] of Object.entries(expectedProfiles)) {
        const link = dock.getByRole("link", { name: `${name}, opens in a new tab` });
        assert.equal(await link.getAttribute("href"), url);
        assert.equal(await link.getAttribute("target"), "_blank");
        assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
        const box = await link.boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44, `${name} touch target`);
      }

      if (!device.touch) {
        const firstLink = dock.getByRole("link", { name: "Instagram, opens in a new tab" });
        const triggerBox = await closeTrigger.boundingBox();
        const linkBox = await firstLink.boundingBox();
        await page.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
        await page.mouse.move(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2, { steps: 12 });
        assert.equal(await dock.locator("button").getAttribute("aria-expanded"), "true", "mouse can reach profiles");
      }

      const geometry = await page.evaluate(() => {
        const panel = document.querySelector("[aria-label='Follow PractiScale']");
        const box = panel.getBoundingClientRect();
        return {
          x: box.x,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
          height: window.innerHeight,
        };
      });
      assert.ok(geometry.x >= 0 && geometry.right <= geometry.viewport, "panel fits width");
      assert.ok(geometry.top >= 0 && geometry.bottom <= geometry.height, "panel fits height");
      assert.ok(geometry.width <= geometry.viewport, "no horizontal overflow");

      if (outputDir) {
        await page.screenshot({ path: path.join(outputDir, `social-dock-${device.name}-open.png`) });
      }

      await page.keyboard.press("Escape");
      assert.equal(
        await dock.getByRole("button", { name: "Open social profiles" }).getAttribute("aria-expanded"),
        "false",
      );
      console.log(`${device.name}: dock appearance, links, targets, and Escape passed`);
      await context.close();
    }

    const homePage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const homeResponse = await homePage.goto(baseUrl, {
      waitUntil: "domcontentloaded",
    });
    assert.equal(homeResponse.status(), 200);
    await homePage
      .getByLabel("PractiScale social profiles")
      .getByRole("button", { name: "Open social profiles" })
      .waitFor({ state: "visible" });
    if (outputDir) {
      await homePage.locator(".preloader").waitFor({ state: "hidden", timeout: 12000 });
      await homePage.screenshot({ path: path.join(outputDir, "social-dock-home-closed.png") });
    }
    console.log("home: global social dock rendered");
    await homePage.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
