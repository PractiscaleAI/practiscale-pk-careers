const { chromium } = require('@playwright/test');
const { dismissIntroduction } = require('./qa-helpers.cjs');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  fs.mkdirSync('docs/qa/earnings',{recursive:true});
  const records=[];
  try {
    for (const [width,height] of [[1440,900],[375,812],[320,568],[768,1024]]) {
      const context=await browser.newContext({viewport:{width,height}});
      const page=await context.newPage();
      page.on('pageerror',e=>console.log('ERROR',e.message));
      await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle',timeout:60000});
      await dismissIntroduction(page);
      await page.evaluate(()=>document.fonts.ready);
      const rail=page.locator('[data-earnings-scroll]');
      await page.waitForTimeout(500);
      for (const [label,expand,play] of [['entry',0,0],['expand',0.5,0],['full',1,0],['play',1,0.5]]) {
        for(let n=0;n<2;n++) {
          await rail.evaluate((el,{expand,play})=>{const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top+Number(el.dataset.expandTravel||0)*expand+Number(el.dataset.playTravel||0)*play,behavior:'instant'});},{expand,play});
          await page.waitForTimeout(450);
        }
        await page.waitForTimeout(400);
        const data=await rail.evaluate(el=>{
          const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}};
          const h=el.querySelector('h2');const cs=getComputedStyle(h);
          return {dataset:{...el.dataset},rail:rect(el),layout:rect(el.querySelector('[data-earnings-layout]')),surface:rect(el.querySelector('[data-earnings-surface]')),slot:rect(el.querySelector('[data-earnings-slot]')),copy:rect(el.querySelector('[data-earnings-copy]')),heading:cs.fontSize,overflow:document.documentElement.scrollWidth-innerWidth};
        });
        records.push({width,height,label,...data});
        if(label==='entry'||label==='play'||(width===1440&&label==='expand')) await page.screenshot({path:`docs/qa/earnings/${width}-${height}-${label}.png`});
      }
      await context.close();
    }
  }finally{fs.writeFileSync('docs/qa/earnings/inspection.json',JSON.stringify(records,null,2));console.log(JSON.stringify(records,null,2));await browser.close();}
})();
