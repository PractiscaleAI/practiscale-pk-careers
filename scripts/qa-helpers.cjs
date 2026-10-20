async function dismissIntroduction(page) {
  await page.waitForFunction(() => document.querySelector("main")?.inert);
  await page.locator(".preloader").focus();
  await page.keyboard.press("Escape");
  await page.locator(".preloader").waitFor({ state: "hidden" });
}
module.exports = { dismissIntroduction };
