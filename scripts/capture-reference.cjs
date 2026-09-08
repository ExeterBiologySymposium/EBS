const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  const manifest=[];
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      for(const route of ['faq','about','courses']) {
        await page.goto(`https://www.instituteofhealth.com/${route}`,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForTimeout(2000);
        await page.screenshot({path:`.firecrawl/reference-${route}-${width}.png`,fullPage:true});
        manifest.push(await page.evaluate(()=>({url:location.href,width:innerWidth,title:document.title,headings:[...document.querySelectorAll('h1,h2')].map(n=>({text:n.textContent,box:n.getBoundingClientRect().toJSON()}))})));
        console.log(`Captured ${route} at ${width}`);
      }
      await page.close();
    }
    fs.writeFileSync('.firecrawl/reference-layouts.json',JSON.stringify(manifest,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
