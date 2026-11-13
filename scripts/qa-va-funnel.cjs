/**
 * QA for the /virtual-assistant webinar funnel:
 *   landing → register popup → qualify → thank-you / not-eligible.
 *
 * The registration endpoint is intercepted, so no GHL webhook is needed and
 * nothing is sent anywhere. Checks layout (no sideways scroll, video near the
 * top on phones), the popup (opens from every CTA, validates, Esc closes),
 * both qualification branches and the payloads sent, the direct-visit guard,
 * the phone sticky bar, and axe on every screen.
 *
 * QA_BASE_URL (default http://127.0.0.1:3000) — server to test.
 * QA_ARTIFACTS_DIR — when set, screenshots of every checked state land here.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");

const base =
  (process.env.QA_BASE_URL || "http://127.0.0.1:3000") + "/virtual-assistant";
const sizes = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 640],
];

async function shot(page, name) {
  if (!process.env.QA_ARTIFACTS_DIR) return;
  await page.screenshot({
    path: path.join(process.env.QA_ARTIFACTS_DIR, `va-funnel-${name}.png`),
  });
}

async function noSideways(page, where) {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  assert.ok(sw <= cw, `sideways scroll at ${where}: ${sw} > ${cw}`);
}

async function axe(page, where, include) {
  let builder = new AxeBuilder({ page });
  if (include) builder = builder.include(include);
  const r = await builder.analyze();
  const list = r.violations.map(
    (v) => `${v.id} (${v.nodes.length}): ${v.help}`,
  );
  assert.equal(list.length, 0, `axe at ${where}: ${list.join("; ")}`);
}

/** Intercepts the registration endpoint and records what the page sends. */
async function recordRegistrations(context) {
  const sent = [];
  await context.route("**/api/webinar-register", async (route) => {
    sent.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  return sent;
}

const dialogOpen = (page) =>
  page.evaluate(() => Boolean(document.querySelector("dialog[open]")));

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const failures = [];
  const run = async (name, fn) => {
    try {
      await fn();
      console.log(`ok ${name}`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.error(`FAIL ${name}: ${error.message}`);
    }
  };

  // Layout at every size.
  for (const [w, h] of sizes) {
    await run(`layout ${w}x${h}`, async () => {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
      });
      const page = await ctx.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await noSideways(page, `${w}x${h}`);
      const r = await page.evaluate(() => {
        const vsl = document
          .querySelector("[data-vsl]")
          .getBoundingClientRect();
        const h1 = document.querySelector("h1").getBoundingClientRect();
        return {
          vslTop: vsl.top,
          vslH: vsl.height,
          h1Bottom: h1.bottom,
          ctas: document.querySelectorAll("[data-register]").length,
        };
      });
      assert.ok(r.ctas >= 6, `${r.ctas} register buttons`);
      // The video is part of the first impression: it starts within 1.4 screens.
      assert.ok(
        r.vslTop < h * 1.4,
        `video starts at ${Math.round(r.vslTop)}px`,
      );
      await shot(page, `${w}x${h}-hero`);
      await page.evaluate(() =>
        scrollTo(0, document.documentElement.scrollHeight),
      );
      await page.waitForTimeout(400);
      await noSideways(page, `${w}x${h} bottom`);
      await ctx.close();
    });
  }

  // Popup: opens from every button, validates, Esc and backdrop close it.
  await run("popup open/validate/close", async () => {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const sent = await recordRegistrations(ctx);
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    const buttons = page.locator("[data-register]");
    const n = await buttons.count();
    for (let i = 0; i < n; i++) {
      const b = buttons.nth(i);
      if (!(await b.isVisible())) continue;
      await b.scrollIntoViewIfNeeded();
      await b.click();
      assert.ok(await dialogOpen(page), `button ${i} did not open the popup`);
      await page.keyboard.press("Escape");
      assert.ok(!(await dialogOpen(page)), "Esc did not close the popup");
    }
    await buttons.first().click();
    // Empty submit is blocked by the browser.
    await page.click("dialog button[type=submit]");
    assert.ok(await dialogOpen(page), "empty form submitted");
    // A bad number shows an error and sends nothing.
    await page.fill("#reg-name", "Ayesha Khan");
    await page.fill("#reg-whatsapp", "12345");
    await page.fill("#reg-email", "ayesha@example.com");
    await page.click("dialog button[type=submit]");
    await page.waitForSelector("#reg-error");
    assert.equal(sent.length, 0, "a request was sent for an invalid number");
    await shot(page, "popup-error");
    // Backdrop click closes.
    await page.mouse.click(20, 450);
    assert.ok(
      !(await dialogOpen(page)),
      "backdrop click did not close the popup",
    );
    await ctx.close();
  });

  // Full journeys: yes/yes → thank-you, yes/no → not eligible.
  for (const [label, a1, a2, expect] of [
    ["qualified", "yes", "yes", "/thank-you"],
    ["not eligible", "yes", "no", "/not-eligible"],
    ["not a woman", "no", "yes", "/not-eligible"],
  ]) {
    for (const [w, h] of [
      [1440, 900],
      [390, 844],
    ]) {
      await run(`journey ${label} ${w}x${h}`, async () => {
        const ctx = await browser.newContext({
          viewport: { width: w, height: h },
        });
        const sent = await recordRegistrations(ctx);
        const page = await ctx.newPage();
        await page.goto(base, { waitUntil: "networkidle" });
        await page.locator("[data-register]").first().click();
        await page.fill("#reg-name", "  Ayesha   Khan ");
        await page.fill("#reg-whatsapp", "0300-123 4567");
        await page.fill("#reg-email", "ayesha@example.com");
        await shot(page, `${w}x${h}-popup`);
        await page.click("dialog button[type=submit]");
        await page.waitForURL("**/virtual-assistant/qualify");
        assert.deepEqual(
          {
            stage: sent[0].stage,
            name: sent[0].name,
            whatsapp: sent[0].whatsapp,
            email: sent[0].email,
          },
          {
            stage: "lead",
            name: "Ayesha Khan",
            whatsapp: "+923001234567",
            email: "ayesha@example.com",
          },
        );
        await page.waitForSelector("[data-qualify]");
        const next = page.locator("[data-qualify] button");
        assert.ok(await next.isDisabled(), "Continue enabled before answering");
        await page
          .locator(`input[name=q1][value=${a1}]`)
          .check({ force: true });
        assert.ok(await next.isDisabled(), "Continue enabled with one answer");
        await page
          .locator(`input[name=q2][value=${a2}]`)
          .check({ force: true });
        await shot(page, `${w}x${h}-qualify-${a1}-${a2}`);
        await next.click();
        await page.waitForURL(`**/virtual-assistant${expect}`);
        const q = sent[1];
        assert.equal(q.stage, "qualification");
        assert.equal(q.isWoman, a1 === "yes");
        assert.equal(q.hasLaptop, a2 === "yes");
        assert.equal(q.whatsapp, "+923001234567");
        await noSideways(page, `${label} result`);
        await shot(page, `${w}x${h}-${expect.slice(1)}`);
        await ctx.close();
      });
    }
  }

  // Someone opening the qualify step directly is sent to register first.
  await run("qualify guard", async () => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    await page.goto(base + "/qualify", { waitUntil: "networkidle" });
    await page.waitForURL("**/virtual-assistant?register");
    await page.waitForFunction(() =>
      Boolean(document.querySelector("dialog[open]")),
    );
    await ctx.close();
  });

  // The phone sticky bar appears after the hero and hides at the final CTA.
  await run("sticky bar", async () => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    const shown = () =>
      page.evaluate(
        () => document.querySelector("[data-sticky-bar]").dataset.on === "true",
      );
    assert.ok(!(await shown()), "shown over the hero");
    await page.evaluate(() => scrollTo(0, innerHeight * 3));
    await page.waitForTimeout(500);
    assert.ok(await shown(), "not shown after the hero");
    await shot(page, "390x844-sticky");
    await page.locator("#final").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    assert.ok(!(await shown()), "shown over the final call to action");
    await ctx.close();
  });

  // Accessibility on every screen.
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
  ]) {
    await run(`axe ${w}x${h}`, async () => {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
      });
      await recordRegistrations(ctx);
      const page = await ctx.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      await axe(page, "landing");
      await page.locator("[data-register]").first().click();
      // Scan once the entrance animation has finished (mid-fade colours are not final).
      await page.waitForFunction(() =>
        document
          .querySelector("dialog[open]")
          .getAnimations()
          .every((x) => x.playState === "finished"),
      );
      await axe(page, "popup", "dialog");
      await page.keyboard.press("Escape");
      await page.evaluate(() =>
        sessionStorage.setItem(
          "va-webinar-lead",
          JSON.stringify({
            name: "Ayesha Khan",
            email: "a@example.com",
            phone: "+923001234567",
          }),
        ),
      );
      await page.goto(base + "/qualify", { waitUntil: "networkidle" });
      await page.waitForSelector("[data-qualify]");
      await axe(page, "qualify");
      await page.goto(base + "/thank-you", { waitUntil: "networkidle" });
      await axe(page, "thank-you");
      await page.goto(base + "/not-eligible", { waitUntil: "networkidle" });
      await axe(page, "not-eligible");
      await ctx.close();
    });
  }

  await browser.close();
  if (failures.length) {
    console.error(`\n${failures.length} failed`);
    process.exit(1);
  }
})();
