const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs");
const out = "docs/qa/cta/v078";
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const results = [];
  try {
    for (const [width, height] of [[1440,900],[1366,600],[768,1024],[390,844],[320,568]]) {
      const context = await browser.newContext({ viewport: {width, height} });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("http://127.0.0.1:3001/?review=v078-paths#apply", {waitUntil:"domcontentloaded"});
      if (await page.locator(".preloader").isVisible()) {
        await page.keyboard.press("Escape");
        await page.locator(".preloader").waitFor({state:"hidden",timeout:12000});
      }
      await page.locator("#apply").scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const data = await page.locator("#apply").evaluate(root => {
        const mark=root.querySelector("img");
        const paths=[...root.querySelectorAll("[data-cta-motif] svg path")];
        const links=[...root.querySelectorAll("a")];
        return {
          heading:root.querySelector("h2")?.innerText.replace(/\s+/g," ").trim(),
          links:links.map(a=>a.getAttribute("href")),
          markLoaded:mark?.complete&&mark?.naturalWidth===64,
          pathCount:paths.length,
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          actions:links.slice(0,2).map(a=>{const r=a.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}})
        };
      });
      const axe = await new AxeBuilder({page}).include("#apply").analyze();
      const pass = data.heading === "Your next Monday could be your first day." &&
        JSON.stringify(data.links) === JSON.stringify(["https://wa.me/923334000600","mailto:hiring@practiscale.com","tel:+923334000600"]) &&
        data.markLoaded && data.pathCount===4 && !data.overflow &&
        data.actions.every(a=>a.width>160&&a.height>=44&&a.left>=0&&a.right<=width) &&
        axe.violations.length===0 && errors.length===0;
      results.push({width,height,pass,data,axe:axe.violations.map(x=>x.id),errors});
      await page.locator("#apply").screenshot({path:out+"/"+width+"x"+height+".png"});
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(out+"/results.json",JSON.stringify(results,null,2));
  console.log(results.map(x=>x.width+"x"+x.height+":"+x.pass).join(" "));
  if (results.some(x=>!x.pass)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
