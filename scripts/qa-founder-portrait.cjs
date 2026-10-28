const { chromium } = require('@playwright/test');
const { dismissIntroduction } = require('./qa-helpers.cjs');
const fs = require('node:fs');
const out = 'docs/qa/founder/v073';
(async () => {
  const results = [];
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    for (const [width,height] of [[320,568],[360,640],[360,800],[390,844],[430,932],[768,1024],[1440,900]]) {
      const page = await browser.newPage({viewport:{width,height}});
      let release;
      const hold = new Promise(resolve => release = resolve);
      await page.route('**/media/founder/*.mp4', async route => { await hold; await route.abort(); });
      await page.goto('http://127.0.0.1:3000/#background-lines');
      await dismissIntroduction(page);
      await page.waitForTimeout(1800);
      const portrait = width < 1024 && height > width;
      for (const progress of [0,.4,.735,.85]) {
        await page.evaluate(p => {
          const r = document.querySelector('#background-lines');
          scrollTo({top:r.getBoundingClientRect().top+scrollY+Math.max(0,r.offsetHeight-innerHeight)*p,behavior:'instant'});
        },progress);
        await page.waitForTimeout(750);
        const data = await page.evaluate(() => {
          const root=document.querySelector('#background-lines');
          const img=root.querySelector('[data-founder-poster]');
          const video=root.querySelector('video');
          const frame=root.querySelector('[data-founder-frame]');
          const bounds=frame.getBoundingClientRect();
          if(root.dataset.enhanced!=='true') return {fallback:true,poster:video.poster,ratio:bounds.width/bounds.height,paused:video.paused};
          const r=img.getBoundingClientRect();
          const scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);
          const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
          const left=r.left+(r.width-w)/2,top=r.top+(r.height-h)/2;
          const clip=getComputedStyle(frame).clipPath;
          const match=clip.match(/inset\((.*?)(?: round|\))/);
          if(!match) return {fallback:false,source:img.currentSrc,paused:video.paused,safe:[false],clip,progress:root.dataset.founderProgress};
          const p=match[1].split(' ').map(parseFloat);
          const inset=[p[0],p[1]??p[0],p[2]??p[0],p[3]??p[1]??p[0]];
          // Bounds inspected against the actual portrait artwork: all lettering
          // and the complete head/face, rather than only the image element box.
          return {fallback:false,source:img.currentSrc,paused:video.paused,safe:[left+w*.135>=bounds.left+inset[3]-1,left+w*.86<=bounds.right-inset[1]+1,top+h*.092>=bounds.top+inset[0]-1,top+h*.71<=bounds.bottom-inset[2]+1]};
        });
        const pass=data.paused && (data.fallback ? data.poster.includes(portrait?'portrait-v073':'v063') && (!portrait || Math.abs(data.ratio-941/1672)<.01) : data.source.includes(portrait?'portrait-v073':'v063') && (!portrait || data.safe.every(Boolean)));
        results.push({width,height,progress,pass,data});
        if(!pass) console.error(results.at(-1));
        if(progress===.735 && portrait) await page.screenshot({path:`${out}/${width}x${height}-portrait-expanded.png`});
      }
      release();
      await page.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(`${out}/portrait-safe-area.json`,JSON.stringify(results,null,2));
  }
  console.log(`${results.filter(x=>x.pass).length}/${results.length} portrait checks passed`);
  if(results.some(x=>!x.pass)) process.exitCode=1;
})();
