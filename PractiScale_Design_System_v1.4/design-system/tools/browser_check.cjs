/* Component verification only. This fixture is not an approved website layout. */
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
let chromium;try{({chromium}=require('playwright'))}catch{({chromium}=require('C:/Users/e laptop/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))}
const root=path.resolve(__dirname,'..'),dir=path.join(root,'verification');
const out={scope:'Local reusable component fixture; website layouts remain pending.',checks:[],viewports:[],consoleErrors:[],externalRequests:[]};
function assert(ok,name,detail){out.checks.push({name,passed:!!ok,detail});if(!ok)throw Error(name+' '+JSON.stringify(detail))}
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PRACTISCALE_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
const page=await browser.newPage({viewport:{width:1100,height:900},deviceScaleFactor:1});
page.on('pageerror',e=>out.consoleErrors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))out.externalRequests.push(r.url())});
await page.goto(pathToFileURL(path.join(dir,'component-fixture.html')).href);await page.evaluate(()=>document.fonts.ready);
out.browser=browser.version();
for(const [family,weight] of [['Sora',600],['Sora',700],['Manrope',400],['Manrope',500],['Manrope',700],['JetBrains Mono',400],['JetBrains Mono',500],['Noto Nastaliq Urdu',400],['Noto Nastaliq Urdu',700]]){
  const n=await page.evaluate(async([f,w])=>(await document.fonts.load(`${w} 16px "${f}"`)).length,[family,weight]);assert(n>0,'Local font loads: '+family+' '+weight,n);
}
const chain=await page.locator('#dark').evaluate(e=>{const s=getComputedStyle(e);return {bg:s.getPropertyValue('--bg').trim(),font:s.fontFamily}});
assert(chain.bg==='#134143'&&chain.font.includes('Manrope'),'Imported stylesheet chain applies tokens and component rules',chain);
const style=sel=>page.locator(sel).evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,image:s.backgroundImage,color:s.color,border:s.borderTopColor,radius:s.borderTopLeftRadius,height:e.getBoundingClientRect().height,font:s.fontFamily,weight:s.fontWeight,opacity:s.opacity,outline:s.outlineStyle,outlineColor:s.outlineColor,outlineWidth:s.outlineWidth,outlineOffset:s.outlineOffset,transform:s.transform,transition:s.transitionDuration}});
const normal={};
for(const id of ['dark','light']){
  await page.mouse.move(1,1);const s=await style('#'+id+' .primary');normal[id]=s;
  assert(s.image.includes('rgb(15, 130, 114)')&&s.image.includes('rgb(11, 107, 152)'),'Default gradient: '+id,s.image);
  assert(s.color==='rgb(255, 255, 255)'&&s.weight==='700'&&s.font.includes('Manrope'),'White Manrope Bold label: '+id,s);
  assert(s.height>=48&&s.radius==='11px','Primary size/radius: '+id,s);
  await page.locator('#'+id+' .primary').hover();let h=await style('#'+id+' .primary');
  assert(h.image.includes('rgb(13, 118, 104)')&&h.image.includes('rgb(9, 95, 135)'),'Hover gradient: '+id,h.image);
  await page.mouse.down();let a=await style('#'+id+' .primary');assert(a.image.includes('rgb(11, 105, 93)')&&a.image.includes('rgb(8, 84, 119)'),'Pressed gradient: '+id,a.image);await page.mouse.up();
  await page.mouse.move(1,1);await page.locator('#'+id+' .primary').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  let f=await style('#'+id+' .primary');assert(f.outline==='solid'&&f.outlineWidth==='2px'&&f.outlineOffset==='2px','Keyboard focus visible: '+id,f);
  const d=await style('#'+id+' .disabled');assert(d.opacity==='1'&&d.image==='none','Explicit disabled state: '+id,d);
  const disabled=await page.locator('#'+id+' .disabled').isDisabled();assert(disabled,'Native disabled semantics: '+id);
  const logo=await page.locator('#'+id+' img').evaluate(e=>({complete:e.complete,natural:e.naturalWidth,width:e.getBoundingClientRect().width}));assert(logo.complete&&logo.natural===363&&logo.width>=240,'Original logo loaded at minimum width: '+id,logo);
}
assert(normal.dark.image===normal.light.image,'Primary identity identical across themes');
assert(normal.dark.border==='rgb(214, 230, 230)','Dark CTA pale boundary',normal.dark.border);
const alias=await page.evaluate(()=>['alias-dark','alias-light'].map(id=>getComputedStyle(document.getElementById(id)).backgroundColor));assert(alias[0]==='rgb(19, 65, 67)'&&alias[1]==='rgb(243, 246, 246)','Deprecated aliases use new values',alias);
for(const width of [360,375,768,1024,1440]){await page.setViewportSize({width,height:900});const d=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));assert(d.scrollWidth===width,'No fixture horizontal overflow: '+width,d);out.viewports.push(d);}
await page.setViewportSize({width:375,height:900});assert((await page.locator('.body').evaluate(e=>getComputedStyle(e).fontSize))==='16px','Mobile body default is 16px');
const long=await page.locator('.long').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight}));assert(long.scroll<=long.client&&long.height>48,'Long labels wrap without truncation',long);
await page.screenshot({path:path.join(dir,'fixture-mobile.png'),fullPage:true});
await page.setViewportSize({width:1100,height:900});await page.screenshot({path:path.join(dir,'fixture-desktop.png'),fullPage:true});
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#dark .primary').hover();await page.mouse.down();const rm=await style('#dark .primary');await page.mouse.up();assert(rm.transform==='none'&&rm.transition==='0s','Reduced motion removes scaling and transitions',rm);
await page.emulateMedia({forcedColors:'active'});await page.mouse.move(1,1);const fc=await style('#dark .primary');assert(fc.image==='none'&&fc.color!==fc.background,'Forced colors retain discernible controls',fc);
assert(out.consoleErrors.length===0,'No JavaScript errors',out.consoleErrors);assert(out.externalRequests.length===0,'No external requests',out.externalRequests);
out.passed=true;fs.writeFileSync(path.join(dir,'component-checks.json'),JSON.stringify(out,null,2));console.log('BROWSER CHECKS PASSED:',out.checks.length);
}finally{await browser.close()}
})().catch(e=>{out.passed=false;out.error=e.stack;fs.writeFileSync(path.join(dir,'component-checks.json'),JSON.stringify(out,null,2));console.error(e);process.exit(1)});
