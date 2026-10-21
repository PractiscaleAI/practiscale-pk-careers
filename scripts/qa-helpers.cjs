async function dismissIntroduction(page) {
  await page.waitForFunction(
    () =>
      !document.querySelector(".preloader") ||
      document.querySelector("main")?.inert,
  );
  if (await page.locator(".preloader").isVisible()) {
    await page.keyboard.press("Escape");
  }
  await page.locator(".preloader").waitFor({ state: "hidden" });
}
module.exports = { dismissIntroduction };
