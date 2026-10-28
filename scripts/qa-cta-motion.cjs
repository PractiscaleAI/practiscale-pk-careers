const {chromium}=require("@playwright/test");
const {dismissIntroduction}=require("./qa-helpers.cjs");
const fs=require("node:fs");
(async()=>{
  const browser=await chromium.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
  const results=[];
  try {
    for(const [width,height] of [[1440,900],[768,1024],[390,844]]) {
      const page=await browser.newPage({viewport:{width,height}});
      await page.goto("http://127.0.0.1:3000/#apply");
      await dismissIntroduction(page);
      await page.locator("#apply").scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      const pose=()=>page.evaluate(()=>{
        const root=document.querySelector("#apply"),photo=root.querySelector("[data-cta-photo]");
        const r=root.getBoundingClientRect();
        return {y:scrollY,top:r.top,bottom:r.bottom,height:r.height,scale:new DOMMatrix(getComputedStyle(photo).transform).a};
      });
      // Finish at the section's own bottom. A large page jump may first land
      // on an upstream pin; use the measured section edge to finish the jump.
      for(let i=0;i<3;i++){
        await page.evaluate(()=>{const r=document.querySelector("#apply").getBoundingClientRect();scrollTo({top:scrollY+r.bottom-innerHeight,behavior:"instant"});});
        await page.waitForTimeout(450);
        if((await pose()).bottom<=height+3)break;
      }
      await page.waitForTimeout(450);
      const finish=await pose();
      await page.evaluate(()=>{const r=document.querySelector("#apply").getBoundingClientRect();scrollTo({top:scrollY+r.top-innerHeight-30,behavior:"instant"});});
      await page.waitForTimeout(850);
      const reverse=await pose();
      const pass=finish.bottom<=height+5&&finish.scale>1.08&&finish.scale<1.13&&reverse.scale>=.99&&reverse.scale<1.03;
      results.push({width,height,pass,finish,reverse});
      if(!pass)console.error(results.at(-1));
      await page.close();
    }
  } finally {
    await browser.close();
    fs.mkdirSync("docs/qa/cta/v076",{recursive:true});
    fs.writeFileSync("docs/qa/cta/v076/motion.json",JSON.stringify(results,null,2));
  }
  console.log(results.filter(x=>x.pass).length+"/"+results.length+" CTA motion checks passed");
  if(results.some(x=>!x.pass))process.exitCode=1;
})();
