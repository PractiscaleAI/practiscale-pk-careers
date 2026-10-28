const { chromium } = require('@playwright/test');
const { dismissIntroduction } = require('./qa-helpers.cjs');
const fs = require('node:fs');
const out = 'docs/qa/founder/v080-fast-scroll';

(async () => {
  fs.mkdirSync(out,{recursive:true});
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    for (const [width,height] of [[1440,900],[390,844]]) {
      const page = await browser.newPage({viewport:{width,height}});
      await page.goto('http://127.0.0.1:3000/#background-lines', {waitUntil:'domcontentloaded'});
      await dismissIntroduction(page);
      await page.waitForTimeout(900);
      await page.locator('#background-lines').evaluate(root => scrollTo({top:root.getBoundingClientRect().top+scrollY,behavior:'instant'}));
      await page.waitForTimeout(400);
      const initial = await page.locator('#background-lines').evaluate(root=>({enhanced:root.dataset.enhanced,height:root.getBoundingClientRect().height,top:root.getBoundingClientRect().top}));
      if (width===1440) await page.screenshot({path:`${out}/1440-initial.png`});
      await page.mouse.move(width/2,height/2);
      await page.mouse.wheel(0,height*2.6);
      await page.waitForTimeout(1800);
      const after = await page.locator('#background-lines').evaluate(root=>({top:root.getBoundingClientRect().top,bottom:root.getBoundingClientRect().bottom,expanded:root.dataset.expanded,progress:root.dataset.founderProgress,videoPaused:root.querySelector('video').paused,filmReady:root.dataset.filmReady}));
      const caught = initial.enhanced==='true' && after.expanded==='true' && +after.progress >= .8 && !after.videoPaused && after.filmReady==='true';
      await page.screenshot({path:`${out}/${width}-checkpoint.png`});
      await page.mouse.wheel(0,height*2);
      await page.waitForTimeout(550);
      const continued = await page.locator('#background-lines').evaluate(root=>({bottom:root.getBoundingClientRect().bottom,paused:root.querySelector('video').paused}));
      const released = continued.bottom < height*.5 && continued.paused;
      console.log(JSON.stringify({width,height,caught,released,initial,after,continued}));
      if (!caught || !released) process.exitCode=1;
      await page.close();
    }
    const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:3000/#background-lines', {waitUntil:'domcontentloaded'});
    await dismissIntroduction(page);
    await page.waitForTimeout(600);
    await page.locator('#background-lines').evaluate(root=>scrollTo({top:root.getBoundingClientRect().top+scrollY,behavior:'instant'}));
    await page.mouse.wheel(0,844*2.6);
    await page.waitForTimeout(500);
    const fallback = await page.locator('#background-lines').evaluate(root=>({enhanced:root.dataset.enhanced,bottom:root.getBoundingClientRect().bottom}));
    const fallbackPass = fallback.enhanced!=='true' && fallback.bottom<844;
    console.log(JSON.stringify({reducedMotion:true,pass:fallbackPass,fallback}));
    if (!fallbackPass) process.exitCode=1;
    await page.close();
    const touchContext = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const touchPage = await touchContext.newPage();
    await touchPage.goto('http://127.0.0.1:3000/#background-lines', {waitUntil:'domcontentloaded'});
    await dismissIntroduction(touchPage);
    await touchPage.waitForTimeout(800);
    await touchPage.locator('#background-lines').evaluate(root=>scrollTo({top:root.getBoundingClientRect().top+scrollY,behavior:'instant'}));
    await touchPage.waitForTimeout(300);
    // Chromium's synthetic touch gesture does not scroll this page in headless
    // mode. Reproduce the native touchstart + one-frame scroll jump instead.
    await touchPage.evaluate(() => {
      dispatchEvent(new Event('touchstart'));
      const root=document.querySelector('#background-lines');
      scrollTo({top:scrollY+root.getBoundingClientRect().height,behavior:'instant'});
    });
    await touchPage.waitForTimeout(1500);
    const touch = await touchPage.locator('#background-lines').evaluate(root=>({enhanced:root.dataset.enhanced,expanded:root.dataset.expanded,progress:root.dataset.founderProgress,bottom:root.getBoundingClientRect().bottom,paused:root.querySelector('video').paused}));
    const touchPass=touch.enhanced==='true'&&touch.expanded==='true'&&!touch.paused;
    console.log(JSON.stringify({touchFling:true,pass:touchPass,touch}));
    if (!touchPass) process.exitCode=1;
    await touchContext.close();
    const slowPage = await browser.newPage({viewport:{width:1440,height:900}});
    await slowPage.goto('http://127.0.0.1:3000/#background-lines',{waitUntil:'domcontentloaded'});
    await dismissIntroduction(slowPage);
    await slowPage.waitForTimeout(800);
    await slowPage.locator('#background-lines').evaluate(root=>{
      const top=root.getBoundingClientRect().top+scrollY;
      scrollTo({top:top+(root.offsetHeight-innerHeight)*.82,behavior:'instant'});
    });
    await slowPage.waitForTimeout(850);
    await slowPage.mouse.wheel(0,1800);
    await slowPage.waitForTimeout(650);
    const slowExit=await slowPage.locator('#background-lines').evaluate(root=>({bottom:root.getBoundingClientRect().bottom,paused:root.querySelector('video').paused}));
    const slowPass=slowExit.bottom<450&&slowExit.paused;
    console.log(JSON.stringify({normalExit:true,pass:slowPass,slowExit}));
    if(!slowPass)process.exitCode=1;
    await slowPage.close();
    const linkPage=await browser.newPage({viewport:{width:1440,height:900}});
    await linkPage.goto('http://127.0.0.1:3000/#apply',{waitUntil:'domcontentloaded'});
    await dismissIntroduction(linkPage);
    await linkPage.waitForTimeout(1700);
    const anchor=await linkPage.locator('#apply').evaluate(root=>({top:root.getBoundingClientRect().top,bottom:root.getBoundingClientRect().bottom}));
    const anchorPass=anchor.top<900&&anchor.bottom>0;
    console.log(JSON.stringify({directApplyLink:true,pass:anchorPass,anchor}));
    if(!anchorPass)process.exitCode=1;
    await linkPage.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
