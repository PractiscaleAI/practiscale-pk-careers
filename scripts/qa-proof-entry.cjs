const {chromium}=require('@playwright/test');
const {dismissIntroduction}=require('./qa-helpers.cjs');
const fs=require('node:fs');
const out=process.env.QA_OUTPUT_DIR||'docs/qa/earnings/v067/before';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 try {
 for(const [width,height] of [[390,844],[768,1024],[1440,900]]) {
 const p=await b.newPage({viewport:{width,height}});
 await p.addInitScript(()=>{
  window.entryLong=[];new PerformanceObserver(l=>window.entryLong.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
 });
 await p.goto('http://127.0.0.1:3000/');await dismissIntroduction(p);await p.waitForTimeout(2000);
 const cdp=await p.context().newCDPSession(p);if(process.env.PROFILE){await cdp.send('Profiler.enable');await cdp.send('Profiler.start');}
 const data=await p.evaluate(async()=>{
  const r=document.querySelector('[data-laptop-rail]'),v=r.querySelector('[data-laptop-viewport]');
  const start=performance.now(),frames=[]; let ready=null;
  scrollTo(0,r.getBoundingClientRect().top+scrollY-innerHeight*.25);
  await new Promise(resolve=>{function tick(t){
   frames.push({time:t,ready:r.dataset.ready,p:r.dataset.progress,rendered:r.querySelector('.laptop-3d')?.dataset.renderedAt});
   if(r.dataset.ready==='true'&&ready===null)ready=t-start;
   if(t-start<4500)requestAnimationFrame(tick);else resolve();
  }requestAnimationFrame(tick)});
  return {start,ready,mode:r.dataset.mode,frames,long:window.entryLong.filter(e=>e.start>=start),src:r.querySelector('picture img').currentSrc};
 });
 await p.screenshot({path:`${out}/${width}-entry.png`});
 if(process.env.PROFILE){const profile=await cdp.send('Profiler.stop');fs.writeFileSync(`${out}/${width}-cpu.json`,JSON.stringify(profile));}
 results.push({width,height,...data,maxGap:Math.max(...data.frames.slice(1).map((f,i)=>f.time-data.frames[i].time))});
 const check=await p.locator('[data-laptop-rail]').evaluate(r=>({
  ready:r.dataset.ready,rendered:!!r.querySelector('.laptop-3d')?.dataset.renderedAt,
  opening:r.querySelector('[data-laptop-opening] img').complete&&r.querySelector('[data-laptop-opening] img').naturalWidth>0,
  source:r.querySelector('[data-laptop-opening] img').currentSrc,
  canvases:r.querySelectorAll('[data-laptop-world] canvas').length
 }));
 results[results.length-1].handoff=check;
 await p.close();
 }
 }finally{await b.close()}
 fs.writeFileSync(`${out}/report.json`,JSON.stringify(results,null,2));
 console.log(results.map(({width,ready,maxGap,long,mode,src})=>({width,ready,maxGap,long,mode,src})));
 if(results.some(r=>r.mode==='motion'&&(!r.handoff.rendered||r.handoff.ready!=='true'||!r.handoff.opening||r.handoff.canvases!==1)))process.exitCode=1;
})();
