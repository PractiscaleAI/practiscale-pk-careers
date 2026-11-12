const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

const url =
  (process.env.QA_BASE_URL || "http://127.0.0.1:3000") + "/virtual-assistent";
const hero = "[data-webinar-hero]";
const stage = "[data-webinar-stage]";
const reel = "[data-story-reel]";
const agenda = "[data-webinar-agenda]";
const widths = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 640],
];

function frame(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function showAt(page, selector, top) {
  await page.locator(selector).evaluate((element, target) => {
    window.scrollTo({
      top: scrollY + element.getBoundingClientRect().top - target,
      behavior: "instant",
    });
  }, top);
  await frame(page);
}

async function heroProgress(page, progress) {
  await page.locator(hero).evaluate((element, p) => {
    const heroStage = element.querySelector("[data-webinar-stage]");
    window.scrollTo({
      top: (element.offsetHeight - heroStage.offsetHeight) * p,
      behavior: "instant",
    });
  }, progress);
  await frame(page);
}

async function screenshot(page, name) {
  if (process.env.QA_ARTIFACTS_DIR) {
    await page.screenshot({
      path: path.join(
        process.env.QA_ARTIFACTS_DIR,
        "va-webinar-" + name + ".png",
      ),
      animations: "disabled",
    });
  }
}

(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: "chrome" }),
    headless: true,
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const activeStory = page.locator(
      reel + " [data-story-card][aria-hidden=false] h3",
    );
    const activeTopic = page.locator(agenda + " [aria-current=step]");
    const detail = page.locator("[data-agenda-detail]");
    const sectionNav = page.getByRole("navigation", {
      name: "Webinar sections",
    });
    const property = (name) =>
      page
        .locator(hero)
        .evaluate(
          (element, prop) => element.style.getPropertyValue(prop),
          name,
        );
    for (const [width, height] of widths) {
      await page.setViewportSize({ width, height });
      const response = await page.goto(url);
      assert.equal(response.status(), 200);
      await page.waitForSelector("[data-webinar-enhanced]");
      await page.evaluate(() => document.fonts.ready.then(() => null));
      await frame(page);
      assert.equal(
        await page.getByRole("heading", { level: 1 }).innerText(),
        "Start a remote VA career from home.",
      );
      const shift = page.getByText("After training · 6 PM to 3 AM PKT", {
        exact: true,
      });
      assert.ok(await shift.isVisible());
      const shiftBox = await shift.boundingBox();
      assert.ok(
        shiftBox.y + shiftBox.height <= height,
        "shift hours must appear in the first viewport",
      );
      const source = await page
        .locator(hero + " picture img")
        .evaluate((img) => [img.currentSrc, img.naturalWidth]);
      assert.ok(
        source[0].includes(
          width <= 680 ? "home-workspace-mobile" : "home-workspace-desktop",
        ),
      );
      assert.ok(source[1] > 0);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
      );
      const pin = await page
        .locator(stage)
        .evaluate((element) => getComputedStyle(element).position);
      assert.equal(pin, height >= 720 ? "sticky" : "relative");
      if ([1440, 768, 390, 320].includes(width))
        await screenshot(page, width + "-start");
      if (height >= 720) {
        assert.equal(await property("--haze"), "0.7800");
        await heroProgress(page, 0.32);
        assert.equal(await property("--haze"), "0.0000");
        assert.ok(Number(await property("--photo-light")) < 0.65);
        await heroProgress(page, 0.83);
        assert.equal(await property("--photo-light"), "1.0000");
        if ([1440, 768, 390].includes(width))
          await screenshot(page, width + "-revealed");
        await heroProgress(page, 1.08);
        const handoff = await page.evaluate(() => ({
          stageBottom: document
            .querySelector("[data-webinar-stage]")
            .getBoundingClientRect().bottom,
          storyTop: document
            .querySelector("[data-webinar-stories]")
            .getBoundingClientRect().top,
        }));
        assert.ok(Math.abs(handoff.stageBottom - handoff.storyTop) < 2);
        await heroProgress(page, 0);
        assert.equal(await property("--haze"), "0.7800");
      }

      for (const [position, name] of [
        [0.77, "Kanwal Fayaz"],
        [0.52, "Mahnoor Naeem"],
        [0.27, "Nayab Fatima"],
      ]) {
        await showAt(page, reel, height * position);
        assert.equal(await activeStory.textContent(), name);
      }
      await sectionNav.getByRole("link", { name: "Stories" }).click();
      await page.waitForURL(/#stories$/);
      await frame(page);
      assert.equal(await activeStory.textContent(), "Kanwal Fayaz");
      await page.getByRole("button", { name: "Mahnoor Naeem" }).click();
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-story-track]")
            .style.getPropertyValue("--reel-x") === "-100.00%",
      );
      assert.equal(await activeStory.textContent(), "Mahnoor Naeem");
      await showAt(page, reel, height * 0.3);
      assert.equal(await activeStory.textContent(), "Mahnoor Naeem");
      if ([1440, 390].includes(width))
        await screenshot(page, width + "-stories");

      await sectionNav.getByRole("link", { name: "Agenda" }).click();
      await page.waitForURL(/#agenda$/);
      await frame(page);
      assert.match(await activeTopic.textContent(), /remote VA work/);
      await page.getByRole("button", { name: /hours and earnings/ }).click();
      await frame(page);
      assert.match(await detail.textContent(), /shift requirements/);
      const offset = await page
        .locator("[data-agenda-route]")
        .evaluate((path) =>
          parseFloat(getComputedStyle(path).strokeDashoffset),
        );
      assert.ok(
        Math.abs(offset - 0.25) < 0.005,
        "the active topic and drawn route must agree",
      );
      await showAt(page, "[data-agenda-list]", height * 0.31);
      assert.match(await activeTopic.textContent(), /hours and earnings/);
      if ([1440, 390].includes(width))
        await screenshot(page, width + "-agenda");

      await sectionNav.getByRole("link", { name: "FAQ" }).click();
      const firstQuestion = page.getByText("Do I need experience?", {
        exact: true,
      });
      await firstQuestion.focus();
      await page.keyboard.press("Enter");
      assert.equal(await firstQuestion.locator("..").getAttribute("open"), "");
      await page
        .getByText("What happens after the webinar?", { exact: true })
        .click();
      assert.equal(await page.locator("#webinar-faq details[open]").count(), 1);
      await sectionNav.getByRole("link", { name: "Register" }).click();
      await page.waitForURL(/#reserve$/);
      const form = page.locator("#reserve form");
      assert.equal(await form.count(), 1);
      const closed = await form.getByRole("status").isVisible();
      assert.equal(
        await form
          .getByRole("button", { name: "Reserve my free seat" })
          .isDisabled(),
        closed,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
      );
      if ([1440, 390].includes(width))
        await screenshot(page, width + "-registration");
      console.log(width + "x" + height + " passed");
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url + "#agenda");
    await page.waitForSelector("[data-webinar-enhanced]");
    await frame(page);
    const anchor = await page.locator("#agenda").boundingBox();
    assert.ok(
      anchor.y >= 55 && anchor.y < 110,
      "deep link must survive hero height enhancement",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () => !document.querySelector("[data-webinar-motion]"),
    );
    assert.equal(
      await page
        .locator(stage)
        .evaluate((element) => getComputedStyle(element).position),
      "relative",
    );
    assert.equal(await property("--haze"), "");
    await sectionNav.getByRole("link", { name: "Stories" }).click();
    await page.getByRole("button", { name: "Nayab Fatima" }).click();
    await frame(page);
    assert.equal(await activeStory.textContent(), "Nayab Fatima");
    const accessibility = await new AxeBuilder({ page })
      .include("[data-webinar-page]")
      .analyze();
    assert.deepEqual(
      accessibility.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
      [],
    );

    const noScript = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const staticPage = await noScript.newPage();
    await staticPage.goto(url);
    assert.equal(
      await staticPage.locator("[data-story-card]:visible").count(),
      3,
    );
    assert.equal(
      await staticPage.locator("[data-agenda-static]:visible").count(),
      5,
    );
    assert.equal(
      await staticPage.locator("[data-story-select]:visible").count(),
      0,
    );
    assert.deepEqual(errors, []);
    console.log(
      "Reduced motion, accessibility, and no-JavaScript reading order passed",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
