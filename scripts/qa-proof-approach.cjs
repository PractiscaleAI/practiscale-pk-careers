const {chromium}=require('@playwright/test');
const {dismissIntroduction}=require('./qa-helpers.cjs');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
 try{
 for(const [width,height] of [[390,844],[768,1024],[1440,900]]){
  const p=await b.newPage({viewport:{width,height}});await p.goto('http://127.0.0.1:3000/');await dismissIntroduction(p);await p.waitForTimeout(1800);
  // Follow the preceding section as a scrolling visitor would, rather than
  // teleporting over lazy pin setup with a stale document-coordinate target.
  await p.locator('[data-career-rail]').evaluate(r=>scrollTo({top:r.getBoundingClientRect().top+scrollY,behavior:"instant"}));
  await p.waitForTimeout(2200);
  await p.locator('[data-laptop-rail]').evaluate(r=>scrollTo({top:r.getBoundingClientRect().top+scrollY-innerHeight-800,behavior:"instant"}));
  // Let preceding lazy sections commit their pin measurements, then simulate
  // the visitor arriving at the measured approach position.
  await p.waitForTimeout(1500);
  await p.locator('[data-laptop-rail]').evaluate(r=>scrollTo({top:r.getBoundingClientRect().top+scrollY-innerHeight-800,behavior:"instant"}));
  await p.waitForFunction(()=>document.querySelector('[data-laptop-rail]').dataset.ready==='true',null,{timeout:20000});
  await p.waitForTimeout(1000);
  const result=await p.evaluate(async()=>{
   const r=document.querySelector('[data-laptop-rail]'),v=r.querySelector('[data-laptop-viewport]');
   const top=r.getBoundingClientRect().top+scrollY,travel=r.offsetHeight-v.clientHeight,frames=[];
   const start=performance.now();const readyBeforeEntry=r.dataset.ready==='true'&&r.getBoundingClientRect().top>innerHeight;
   await new Promise(resolve=>{function step(now){const t=Math.min(1,(now-start)/1600);scrollTo({top:top+travel*.29*t,behavior:"instant"});frames.push(now);if(t<1)requestAnimationFrame(step);else resolve()}requestAnimationFrame(step)});
   await new Promise(r=>setTimeout(r,500));
   return {readyBeforeEntry,maxGap:Math.max(...frames.slice(1).map((t,i)=>t-frames[i])),progress:+r.dataset.progress,open:+r.querySelector('.laptop-3d').dataset.lidOpen,canvases:r.querySelectorAll('.laptop-3d').length};
  });
  results.push({width,...result,pass:result.readyBeforeEntry&&Math.abs(result.progress-.29)<.002&&result.open>.99&&result.canvases===1});
  await p.close();
 }
 }finally{await b.close()}
 fs.writeFileSync('docs/qa/earnings/v067/approach.json',JSON.stringify(results,null,2));console.log(results);if(results.some(x=>!x.pass))process.exitCode=1;
})();

