// Optional real-browser QA: requires an installed Puppeteer and Chromium executable.
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const base=process.env.EBS_QA_BASE_URL || 'http://127.0.0.1:4173';
const browser=await puppeteer.launch({headless:true,executablePath:process.env.PUPPETEER_EXECUTABLE_PATH,args:['--no-sandbox']});
const page=await browser.newPage();
const results=[];
async function test(name,fn){await fn();results.push(name);console.log('PASS: '+name)}
async function visit(href){await page.evaluate(href=>{let a=document.querySelector('#qa-link');if(!a){a=document.createElement('a');a.id='qa-link';a.textContent='QA destination';a.style.cssText='position:fixed;top:150px;left:10px;z-index:99999;background:white;padding:10px';document.body.append(a)}a.href=href},href);await page.click('#qa-link')}
try{
 await page.setViewport({width:1280,height:900});
 await page.goto(base+'/about.html',{waitUntil:'networkidle2'});
 await page.evaluate(()=>{window.qaSentinel='persistent';window.qaAccount=document.querySelector('.account-controls');window.qaHeader=document.querySelector('.site-header')});
 await test('persistent account/header nodes and destination metadata',async()=>{await page.click('.desktop-nav a[href="faq.html"]');await page.waitForFunction(()=>document.body.dataset.reactPage==='faq.html');assert(await page.evaluate(()=>window.qaSentinel==='persistent'&&window.qaAccount===document.querySelector('.account-controls')&&window.qaHeader===document.querySelector('.site-header')));assert.match(await page.title(),/FAQ/)});
 await test('browser back and forward',async()=>{await page.goBack();await page.waitForFunction(()=>document.body.dataset.reactPage==='about.html');await page.goForward();await page.waitForFunction(()=>document.body.dataset.reactPage==='faq.html');assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent')});
 await test('same-page anchors and disclosures',async()=>{await visit('/faq.html#contact');await page.waitForFunction(()=>document.querySelector('#contact').getBoundingClientRect().top<200);assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent')});
 await test('history restores manual scroll after an anchor visit',async()=>{await page.evaluate(()=>scrollTo({top:1000,behavior:'instant'}));await page.waitForFunction(()=>Math.abs(history.state.ebsScroll?.[1]-1000)<5);await visit('/about.html');await page.waitForFunction(()=>document.body.dataset.reactPage==='about.html');await page.goBack();await page.waitForFunction(()=>document.body.dataset.reactPage==='faq.html');await new Promise(r=>setTimeout(r,700));assert(Math.abs(await page.evaluate(()=>scrollY)-1000)<10,'Back must restore the saved scroll instead of jumping to the old hash')});
 await test('all public route transitions',async()=>{for(const route of ['index','team','schedule','schools','judges','register','researchers','student-signup','about','faq','contact','account']){await visit('/'+route+'.html');await page.waitForFunction(route=>document.body.dataset.reactPage===route+'.html',{},route);assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent');assert.equal(await page.$$eval('h1',x=>x.length),1)}});
 await test('mobile menu closes after internal navigation',async()=>{await page.setViewport({width:375,height:812,isMobile:true,hasTouch:true});await page.waitForSelector('.site-menu summary');await page.evaluate(()=>{window.qaSentinel='persistent';scrollTo({top:0,behavior:'instant'})});await page.tap('.site-menu summary');await page.tap('.menu-panel a[href="team.html"]');await page.waitForFunction(()=>document.body.dataset.reactPage==='team.html');assert(await page.$eval('.site-menu',x=>!x.open));assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent')});
 await page.setViewport({width:1280,height:900});
 await page.evaluate(()=>{window.qaSentinel='persistent'});
 await page.setRequestInterception(true);
 const interception=async req=>{
  const url=new URL(req.url());
  if(req.resourceType()==='fetch'&&url.origin===base&&url.pathname==='/judges.html')return req.respond({status:503,contentType:'text/html',body:'Unavailable'});
  if(req.resourceType()==='fetch'&&url.origin===base&&url.pathname==='/resources.html')return req.respond({status:302,headers:{location:'/register.html?access=required&returnTo=%2Fresources.html'}});
  if(req.resourceType()==='fetch'&&url.origin===base&&url.pathname==='/schedule.html'){await new Promise(r=>setTimeout(r,500));try{return await req.continue()}catch{return}}
  return req.continue();
 };
 page.on('request',interception);
 await test('server denial redirect remains authoritative',async()=>{await visit('/resources.html');await page.waitForFunction(()=>location.pathname==='/register.html'&&location.search.includes('access=required')&&document.body.dataset.reactPage==='register.html');assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent');assert.equal(await page.$('.article-body'),null)});
 await test('rapid navigation keeps the latest destination',async()=>{await page.evaluate(()=>{for(const path of ['/schedule.html','/about.html']){const a=document.createElement('a');a.href=path;document.body.append(a);a.click();a.remove()}});await page.waitForFunction(()=>document.body.dataset.reactPage==='about.html');await new Promise(r=>setTimeout(r,800));assert.equal(new URL(page.url()).pathname,'/about.html');assert.equal(await page.evaluate(()=>window.qaSentinel),'persistent')});
 await test('failed enhanced navigation falls back to a normal page load',async()=>{await visit('/judges.html');await page.waitForFunction(()=>location.pathname==='/judges.html'&&document.body.dataset.reactPage==='judges.html');assert.equal(await page.evaluate(()=>window.qaSentinel),undefined)});
 console.log(JSON.stringify({passed:results.length,checks:results},null,2));
}catch(error){await page.screenshot({path:'/private/tmp/ebs-navigation-failure.png',fullPage:true});throw error}finally{await browser.close()}
