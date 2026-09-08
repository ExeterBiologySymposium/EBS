const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const baseline=require('../docs/content-baseline.json');
const routes=['index.html',...Object.keys(baseline)];
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif'};
const dist=path.resolve('dist');
const server=http.createServer((req,res)=>{let file;try{file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}if(file===dist)file=path.join(dist,'index.html');if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
const report={viewports:[],interactions:[],errors:[],screenshots:[]};
function check(name,test){assert(test,name);report.interactions.push(name);}
(async()=>{
 await new Promise(resolve=>server.listen(4174,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:4174';const browser=await chromium.launch({headless:true});fs.mkdirSync('docs/qa',{recursive:true});
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error'&&/Hydration|Minified React|hydrating|validateDOMNesting/.test(message.text()))report.errors.push(message.text());});
  if(!process.argv.includes('--interactions-only')) for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    await page.goto(`${origin}/${route}`,{waitUntil:'load'});await page.waitForTimeout(80);
    const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,heading:document.querySelector('h1')?.textContent}));
    assert(metrics.scroll<=width+1,`${route}@${width}: overflow ${metrics.scroll}`);assert.equal(metrics.h1,1,route);
    if(width===390||width===1440){const file=`docs/qa/${route.replace('.html','')}-${width}.png`;await page.screenshot({path:file,fullPage:false});report.screenshots.push(file);
      if(['index.html','faq.html','about.html','team.html','schools.html','resources.html','python.html','register.html'].includes(route)){
        await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';}await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
        const full=file.replace('.png','-full.png');await page.screenshot({path:full,fullPage:true});report.screenshots.push(full);
      }
    }
    report.viewports.push({route,width,overflow:metrics.scroll-width});
   }
   console.log(`Verified all ${routes.length} routes at ${width}px`);
  }
  await page.goto(`${origin}/index.html`);await page.locator('.course-rail').scrollIntoViewIfNeeded();
  const first=await page.locator('.course-rail').evaluate(n=>n.scrollLeft);
  await page.getByRole('button',{name:'Next guide',exact:true}).click();await page.waitForTimeout(150);
  check('Carousel actually moves cards',await page.locator('.course-rail').evaluate(n=>n.scrollLeft)>first+100);
  check('Carousel selection follows position',(await page.locator('.course-card.is-active .course-meta').innerText()).includes('RStudio track'));
  await page.getByRole('button',{name:'Next guidance',exact:true}).click();check('Guidance changes content',(await page.locator('.guidance-copy h3').innerText()).includes('own pace'));
  await page.getByRole('button',{name:'Show Where',exact:true}).click();check('Hero controls update fact',(await page.locator('.hero-facts strong').innerText()).includes('online'));
  await page.locator('.home-faq summary').first().click();check('Home FAQ opens real answer',await page.locator('.home-faq details').first().getAttribute('open')!==null);
  await page.getByRole('button',{name:'Search EBS',exact:true}).last().click();await page.getByLabel('Page or topic').fill('python');check('Search finds coding route',await page.locator('.search-results a[href="python.html"]').count()===1);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.search-dialog').open);check('Native search dialog closes with Escape',!(await page.locator('.search-dialog').evaluate(n=>n.open)));
  await page.getByRole('button',{name:'Use dark theme',exact:true}).last().click();check('Theme updates DOM',await page.locator('html').getAttribute('data-theme')==='dark');
  await page.reload();check('Theme survives reload',await page.locator('html').getAttribute('data-theme')==='dark');
  await page.screenshot({path:'docs/qa/home-dark-1440.png'});
  await page.getByRole('button',{name:'Use light theme',exact:true}).last().click();
  await page.setViewportSize({width:390,height:844});await page.locator('.site-menu summary').click();check('Mobile menu opens',await page.locator('.site-menu').evaluate(n=>n.open));await page.keyboard.press('Escape');check('Mobile menu Escape closes',!await page.locator('.site-menu').evaluate(n=>n.open));
  await page.goto(`${origin}/faq.html#g3`);check('FAQ deep link opens answer',await page.locator('#g3').evaluate(n=>n.closest('details').open));
  check('FAQ has no quick-link sidebar',await page.locator('main aside').count()===0);
  await page.locator('#general').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa/faq-open-390.png'});
  await page.goto(`${origin}/python.html#dataset`);check('Copy controls match code blocks',await page.locator('.code-toolbar button').count()===await page.locator('pre').count());
  await page.context().clearPermissions();await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))}}));
  await page.reload();await page.locator('.code-toolbar button').first().click();check('Denied clipboard selects actual code',(await page.locator('.code-toolbar button').first().innerText()).includes('Code selected'));
  await page.goto(`${origin}/faq.html#contact`);let sends=0;let success=false;
  await page.route('https://api.web3forms.com/submit',async route=>{sends++;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success})});});
  await page.getByLabel('Your name',{exact:true}).fill('QA');await page.getByLabel('Email',{exact:true}).fill('qa@example.test');await page.getByLabel('Subject',{exact:true}).fill('Local mock only');await page.getByLabel('Message',{exact:true}).fill('Preserve this on failure');await page.getByRole('button',{name:'Send message',exact:true}).click();await page.waitForTimeout(100);
  check('Rejected contact preserves input',await page.getByLabel('Message',{exact:true}).inputValue()==='Preserve this on failure');check('Rejected contact never reports success',(await page.locator('#contact-status').innerText()).includes('could not send'));
  success=true;await page.getByRole('button',{name:'Send message',exact:true}).click();await page.waitForTimeout(100);check('Only provider-confirmed success hides form',await page.locator('#contact-form').isHidden());check('Mocked submissions only',sends===2);
  await page.route('**/collections/schedule_items/documents?**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({total:1,documents:[{time:'09:00',event:'Mock session',location:'Mock room'}]})}));
  await page.route('**/collections/session_info/documents?**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({total:2,documents:[{title:'Date',description:'Never display confirmed date'},{title:'Remote format',description:'Online'}]})}));
  await page.goto(`${origin}/schedule.html`);await page.waitForTimeout(150);check('Valid schedule renders in React',(await page.locator('#schedule-body').innerText()).includes('Mock session'));check('Remote date filtered',(await page.locator('#session-info-grid').innerText()).includes('Remote format')&&!(await page.locator('#session-info-grid').innerText()).includes('Never display'));
  await page.route('**/collections/schedule_items/documents?**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({total:3,documents:[{time:'bad'}]})}));
  await page.reload();await page.waitForTimeout(150);check('Invalid schedule retains complete fallback',await page.locator('#schedule-body tr').count()>1);
  await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});
  await page.goto(`${origin}/index.html`);await page.getByRole('button',{name:'Use dark theme',exact:true}).last().click();check('Blocked storage theme remains usable',await page.locator('html').getAttribute('data-theme')==='dark');
  await page.setViewportSize({width:720,height:450});check('Narrow desktop reflow remains within viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();
  for(const route of routes){await staticPage.goto(`${origin}/${route}`);check(`No-JS content: ${route}`,await staticPage.locator('main h1').isVisible());}
  await nojs.close();
  const animated=await browser.newContext({reducedMotion:'no-preference',viewport:{width:1440,height:900}});
  await animated.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const motionPage=await animated.newPage();await motionPage.goto(`${origin}/index.html`);await motionPage.waitForTimeout(100);
  await motionPage.evaluate(()=>{const n=document.querySelector('.story-sequence');window.scrollTo({top:n.getBoundingClientRect().top+scrollY+(n.offsetHeight-innerHeight)*.6,behavior:'instant'});});
  await motionPage.waitForTimeout(150);check('Scroll advances pinned story stage',(await motionPage.locator('.story-sticky h2').innerText())==='Make an analysis.');
  await motionPage.screenshot({path:'docs/qa/story-motion-1440.png'});await animated.close();
  assert.deepEqual(report.errors,[],'Hydration/runtime errors');
  fs.writeFileSync('docs/qa/browser-results.json',JSON.stringify(report,null,2));console.log(`BROWSER_VERIFIED ${report.viewports.length} route/viewports; ${report.interactions.length} behavior checks; ${report.errors.length} runtime errors`);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);fs.writeFileSync('docs/qa/browser-failure.json',JSON.stringify({error:error.message,...report},null,2));server.close();process.exitCode=1;});
