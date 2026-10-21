const { chromium } = require("@playwright/test");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const sharp = require("sharp");

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
      }),
      page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/#career-training", {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await dismissIntroduction(page);
    await page.waitForFunction(
      () =>
        document.querySelector("[data-career-world]")?.dataset.ready === "true",
    );
    await page.addStyleTag({
      content:
        "header,.site-header,.skip-link,nextjs-portal{visibility:hidden!important}[data-career-world-panel]{position:fixed!important;left:0!important;top:0!important;width:720px!important;height:720px!important;transform:none!important;border-radius:0!important;z-index:10000!important}[data-career-panels]{overflow:visible!important;border-radius:0!important}",
    });
    await page.evaluate(() => dispatchEvent(new Event("resize")));
    await page.waitForTimeout(1400);
    const png = await page.locator("[data-career-world] canvas").screenshot();
    fs.mkdirSync("docs/qa/typography", { recursive: true });
    fs.writeFileSync("docs/qa/typography/brain-poster-source.png", png);
    await sharp(png)
      .webp({ quality: 94 })
      .toFile("public/media/career-paths/training-refined.webp");
    console.log(
      JSON.stringify(
        {
          output: "public/media/career-paths/training-refined.webp",
          bytes: fs.statSync("public/media/career-paths/training-refined.webp")
            .size,
          source: await page.locator("[data-career-world]").evaluate((el) => ({
            ...el.dataset,
            width: el.clientWidth,
            height: el.clientHeight,
          })),
        },
        null,
        2,
      ),
    );
    await context.close();
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
