const { chromium } = require("@playwright/test");
const { default: AxeBuilder } = require("@axe-core/playwright");
const { dismissIntroduction } = require("./qa-helpers.cjs");
const fs = require("node:fs");
const out = "docs/qa/cta/v076";
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  if (!pass) console.error(name, detail);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    for (const [width, height] of [[1440,900],[1366,600],[1024,768],[768,1024],[390,844],[320,568]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("http://127.0.0.1:3000/#apply");
      await dismissIntroduction(page);
      await page.locator("#apply").scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      const data = await page.locator("#apply").evaluate(root => {
        const photo = root.querySelector("[data-cta-photo]");
        const image = root.querySelector("img");
        const frame = image.parentElement;
        const visual = frame.getBoundingClientRect();
        const links = [...root.querySelectorAll("a")];
        return {
          links: links.map(x => x.getAttribute("href")),
          loaded: image.complete && image.naturalWidth > 0,
          imageSize: [image.naturalWidth, image.naturalHeight],
          photoClip: getComputedStyle(frame).overflow === "hidden",
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          title: root.querySelector("h2").innerText.replace(/\s+/g, " ").trim(),
          widths: links.slice(0,2).map(x => {const r=x.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}}),
          photoScale: getComputedStyle(photo).transform
        };
      });
      const name = width+"x"+height;
      check(name+": exact heading", data.title === "Your next Monday could be your first day.", data.title);
      check(name+": exact destinations", JSON.stringify(data.links) === JSON.stringify(["https://wa.me/923334000600","mailto:hiring@practiscale.com","tel:+923334000600"]));
      check(name+": image loads and clips", data.loaded && data.photoClip && data.imageSize[0]===900, data);
      check(name+": no horizontal overflow", !data.overflow, data);
      check(name+": usable buttons", data.widths.every(x => x.width>160 && x.height>=44 && x.left>=0 && x.right<=width),data.widths);
      const axe = await new AxeBuilder({ page }).include("#apply").analyze();
      check(name+": scoped accessibility", axe.violations.length === 0, axe.violations.map(x=>x.id));
      check(name+": no runtime errors", errors.length===0, errors);
      await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})});
      await page.waitForTimeout(400);
      await page.locator("#apply").screenshot({path:out+"/"+name+".png"});
      await context.close();
    }
    const reduced = await browser.newPage({ viewport: {width:390,height:844}, reducedMotion:"reduce" });
    await reduced.goto("http://127.0.0.1:3000/#apply");
    await dismissIntroduction(reduced);
    check("Reduced motion: still image", await reduced.locator("[data-cta-photo]").evaluate(e => getComputedStyle(e).transform==="none"));
    await reduced.close();
    const plain = await browser.newPage({ viewport: {width:390,height:844}, javaScriptEnabled:false });
    await plain.goto("http://127.0.0.1:3000/#apply");
    check("No JavaScript: all actions present", await plain.locator("#apply a").count()===3);
    check("No JavaScript: image present", await plain.locator("#apply img").count()===1);
    await plain.close();
  } finally {
    await browser.close();
    fs.writeFileSync(out+"/results.json", JSON.stringify(checks,null,2));
  }
  console.log(checks.filter(x=>x.pass).length+"/"+checks.length+" CTA checks passed");
  if(checks.some(x=>!x.pass)) process.exitCode=1;
})();
