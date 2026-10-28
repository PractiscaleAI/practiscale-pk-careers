const { chromium } = require('@playwright/test');
const { dismissIntroduction } = require('./qa-helpers.cjs');
const fs = require('node:fs');
const out = process.env.WHO_QA_OUT || 'docs/qa/who-we-are/v066';
(async () => {
 const b = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try {
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.goto('http://127.0.0.1:3000/'); await dismissIntroduction(p); await p.waitForTimeout(2000);
  for(const [width,height] of [[390,844],[844,390],[768,1024],[1024,768],[390,844],[390,900]]) {
   await p.setViewportSize({width,height}); await p.waitForTimeout(1800);
   await p.evaluate(()=>{const r=document.querySelector('[data-who-rail]');scrollTo(0,r.getBoundingClientRect().top+scrollY+(r.querySelector('[data-who-introduction]')?.offsetHeight||0)+parseFloat(r.style.getPropertyValue('--who-travel'))*.5)});
   await p.waitForTimeout(1800);
   const before=await p.locator('[data-who-rail]').evaluate(r=>({nativeProgress:-(r.getBoundingClientRect().top+(r.querySelector('[data-who-introduction]')?.offsetHeight||0))/parseFloat(r.style.getPropertyValue('--who-travel')),progress:+r.dataset.progress,src:r.querySelector('video').currentSrc}));
   await p.setViewportSize({width,height:height-50}); await p.waitForTimeout(1800);
   const after=await p.locator('[data-who-rail]').evaluate(r=>({nativeProgress:-(r.getBoundingClientRect().top+(r.querySelector('[data-who-introduction]')?.offsetHeight||0))/parseFloat(r.style.getPropertyValue('--who-travel')),progress:+r.dataset.progress,src:r.querySelector('video').currentSrc,mode:r.dataset.mode,overflow:document.documentElement.scrollWidth>innerWidth,heads:document.querySelectorAll('#who-heading').length}));
   results.push({width,before,after,pass:Math.abs(before.progress-.5)<.015&&Math.abs(after.progress-.5)<.015&&Math.abs(after.nativeProgress-after.progress)<.015&&!after.overflow&&after.heads===1&&after.src.includes(width<1024?'office-mobile':'office-scroll')});
  }
  console.log(JSON.stringify(results,null,2));
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(`${out}/resize.json`,JSON.stringify(results,null,2));
  if(results.some(x=>!x.pass))process.exitCode=1;
 } finally {await b.close()}
})();
