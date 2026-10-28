const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs");
const out = "docs/qa/cta/v081";
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
      await page.goto("http://127.0.0.1:3000/?review=v081-paths#apply", {waitUntil:"domcontentloaded"});
      if (await page.locator(".preloader").isVisible()) {
        await page.keyboard.press("Escape");
        await page.locator(".preloader").waitFor({state:"hidden",timeout:12000});
      }
      await page.locator("#apply").scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      const data = await page.locator("#apply").evaluate(root => {
        const mark=root.querySelector("img");
        const paths=[...root.querySelectorAll("[data-cta-motif] svg path")];
        const visiblePaths=paths.filter(path=>getComputedStyle(path.closest("svg")).display!=="none");
        const heading=root.querySelector("h2");
        const links=[...root.querySelectorAll("a")];
        return {
          heading:heading?.innerText.replace(/\s+/g," ").trim(),
          links:links.map(a=>a.getAttribute("href")),
          markLoaded:mark?.complete&&mark?.naturalWidth===64,
          pathCount:paths.length,
          markAboveHeading:mark.getBoundingClientRect().bottom < heading.getBoundingClientRect().top,
          markSize:[mark.getBoundingClientRect().width,mark.getBoundingClientRect().height],
          pathTransforms:visiblePaths.map(path=>getComputedStyle(path).transform),
          markTransform:getComputedStyle(mark).transform,
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          actions:links.slice(0,2).map(a=>{const r=a.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}})
        };
      });
      const before = await page.locator("#apply").evaluate(root => {
        const paths=[...root.querySelectorAll("[data-cta-motif] svg path")].filter(path=>getComputedStyle(path.closest("svg")).display!=="none");
        return paths.map(path=>path.getAttribute("d"));
      });
      await page.waitForTimeout(850);
      const after = await page.locator("#apply").evaluate(root => {
        const paths=[...root.querySelectorAll("[data-cta-motif] svg path")].filter(path=>getComputedStyle(path.closest("svg")).display!=="none");
        return paths.map(path=>path.getAttribute("d"));
      });
      data.pathsRippled=before.length===2&&after.every((value,index)=>value!==before[index]);
      const axe = await new AxeBuilder({page}).include("#apply").analyze();
      const pass = data.heading === "Your next Monday could be your first day." &&
        JSON.stringify(data.links) === JSON.stringify(["https://wa.me/923334000600","mailto:hiring@practiscale.com","tel:+923334000600"]) &&
        data.markLoaded && data.pathCount===4 && data.markAboveHeading &&
        JSON.stringify(data.markSize)==="[64,60]" &&
        data.pathTransforms.every(transform=>transform==="none") && data.pathsRippled && !data.overflow &&
        data.actions.every(a=>a.width>160&&a.height>=44&&a.left>=0&&a.right<=width) &&
        axe.violations.length===0 && errors.length===0;
      results.push({width,height,pass,data,axe:axe.violations.map(x=>x.id),errors});
      await page.locator("#apply").screenshot({path:out+"/"+width+"x"+height+".png"});
      await context.close();
    }
    const context = await browser.newContext({ viewport: {width:390,height:844}, reducedMotion:"reduce" });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/?review=v081-paths#apply", {waitUntil:"domcontentloaded"});
    if (await page.locator(".preloader").isVisible()) {
      await page.keyboard.press("Escape");
      await page.locator(".preloader").waitFor({state:"hidden",timeout:12000});
    }
    const before = await page.locator("#apply").evaluate(root => [...root.querySelectorAll("[data-cta-motif] svg path")].map(path=>path.getAttribute("d")));
    await page.waitForTimeout(850);
    const after = await page.locator("#apply").evaluate(root => [...root.querySelectorAll("[data-cta-motif] svg path")].map(path=>path.getAttribute("d")));
    results.push({width:390,height:844,reducedMotion:true,pass:before.length===4&&after.every((value,index)=>value===before[index]),staticPaths:after});
    await context.close();
  } finally {
    await browser.close();
  }
  fs.writeFileSync(out+"/results.json",JSON.stringify(results,null,2));
  console.log(results.map(x=>x.width+"x"+x.height+":"+x.pass).join(" "));
  if (results.some(x=>!x.pass)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});


