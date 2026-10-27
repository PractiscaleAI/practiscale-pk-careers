const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const p=await b.newPage();await p.goto('http://127.0.0.1:3000/proof-render');
 await p.waitForFunction(()=>window.__proofExport||window.__proofExportError,null,{timeout:90000});
 for(const variant of ['desktop','mobile']) {
 const data=await p.evaluate(v=>window.__proofExport.laptopPoster(v,true),variant);
 const bytes=Buffer.from(data.split(',')[1],'base64');
 fs.writeFileSync(`public/media/earnings-laptop/${variant}-opening-v067.webp`,bytes);
 console.log(variant,bytes.length);
 }
 }finally{await b.close()}
})();
