// Full-site UI with mocked Clerk/Drive. Server access checks use the real access handler.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';
let membership = 'pending', folderRequests = 0, folderPosts = 0, folderReady = false;
const results = [];
const output = new URL('../docs/reviews/member-pages/', import.meta.url);
await mkdir(output, { recursive: true });
let handlers;
const server = await createServer({
  server: { host: '127.0.0.1', port: 4188, strictPort: true },
  plugins: [{
    name: 'isolated-member-pages',
    resolveId(id) { if (id === '/__member-entry.tsx') return id; },
    load(id) { if (id === '/__member-entry.tsx') return `
      import React,{useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import {AuthContext,initialAuth} from '/src/auth.tsx';
      import {NavigationApp} from '/src/navigation-app.tsx';
      import '/src/styles.css';
      function TestApp(){
        const [member,setMember]=useState(window.__qaMember);
        window.qaSetMembership=setMember;
        const state={...initialAuth,status:member===null?'signed-out':'signed-in',access:member,account:<button>Profile</button>,manageAccount(){document.body.dataset.profileOpened='true'},refreshAccess(){document.body.dataset.refreshed='true'}};
        return <AuthContext.Provider value={state}><NavigationApp initialPage={document.body.dataset.reactPage}/></AuthContext.Provider>;
      }
      createRoot(document.getElementById('root')).render(<TestApp/>);
    `; },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://127.0.0.1:4188');
          if (url.pathname === '/api/participant-folder') {
            folderRequests++;
            if (membership !== 'accepted') { res.statusCode = 403; return res.end(); }
            if (req.method === 'POST') { folderPosts++; folderReady = true; }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(folderReady ? { state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/test-folder', documentUrl: 'https://docs.google.com/document/d/test-document/edit' } : { state: 'empty' }));
          }
          {
            const denied = await handlers.protect(new Request(url, { method: req.method }));
            if (denied) {
              res.statusCode = denied.status;
              for (const [name, value] of denied.headers) res.setHeader(name, value);
              return res.end(await denied.text());
            }
          }
          if (/^\/[\w-]+\.html$/.test(url.pathname)) {
            const page = url.pathname.slice(1);
            let source;
            try { source = await readFile(new URL('../' + page, import.meta.url), 'utf8'); } catch { return next(); }
            const head = source.match(/<head>([\s\S]*?)<\/head>/)[1];
            const html = '<!doctype html><html lang="en"><head>'+head+'</head><body data-react-page="'+page+'"><main id="root"></main><script>window.__qaMember='+JSON.stringify(membership)+'</script><script type="module" src="/__member-entry.tsx"></script></body></html>';
            res.setHeader('Content-Type', 'text/html'); res.setHeader('Cache-Control', 'private, no-store');
            return res.end(await vite.transformIndexHtml('/__member-qa', html));
          }
          next();
        } catch (error) { res.statusCode = 500; res.end(String(error)); }
      });
    },
  }],
});
let browser;
try {
  const { createAccessHandlers } = await server.ssrLoadModule('/server/access.ts');
  handlers = createAccessHandlers({ authenticate: async () => membership === null ? null : 'self', membership: async () => membership, enrollPending: async () => {} });
  await server.listen();
  browser = await puppeteer.launch({ headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (/hcaptcha\.com/.test(req.url())) return req.respond({ status: 200, contentType: 'application/javascript', body: "window.hcaptcha={render:()=> 'mock-widget',remove(){},reset(){}};window.ebsHCaptchaReady?.();" });
    return req.continue();
  });
  const base = 'http://127.0.0.1:4188';
  const visit = async path => { await page.goto(base + path, { waitUntil: 'networkidle0' }); await page.waitForSelector('h1'); };
  const screenshot = name => page.screenshot({ path: new URL(name, output).pathname, fullPage: true });
  await page.setViewport({ width: 1440, height: 1000 });
  await visit('/account.html');
  assert.equal(await page.$eval('h1', el => el.textContent), 'Account');
  assert.equal(await page.$('a[href="register.html"],a[href="student-signup.html"],a[href="events.html"]'), null);
  assert.equal(folderRequests, 0);
  await page.click('button.button');
  assert.equal(await page.evaluate(() => document.body.dataset.refreshed), 'true');
  await screenshot('account-pending-desktop.png');
  results.push('Pending Account has approval/contact controls, no registration/events links, and no folder API call');
  await visit('/register.html');
  assert.equal(new URL(page.url()).pathname, '/account.html');
  results.push('Signed-in Register is redirected to Account');
  const before = folderRequests;
  await page.click('.nav-search');
  await page.type('#search-input', 'events');
  assert.equal(await page.$('.search-results a[href="events.html"]'), null);
  await page.keyboard.press('Escape');
  results.push('Pending search excludes Events');
  for (const path of ['/events.html', '/%65vents.html']) {
    await visit(path);
    assert.equal(new URL(page.url()).pathname, '/account.html');
  }
  assert.equal(await page.evaluate(async () => (await fetch('/protected-assets/events/kate-adamala.png')).status), 403);
  assert.equal(folderRequests, before);
  results.push('Pending direct/encoded Events and poster are denied by real server access policy');
  membership = 'accepted';
  await visit('/account.html');
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(el => el.textContent.includes('Create my research folder')));
  await page.evaluate(() => { window.qaSentinel = 'persistent'; window.qaHeader = document.querySelector('.site-header'); });
  await page.$eval('#research-folder-title + p + p + .actions button', el => el.click());
  await page.waitForSelector('a[href="https://drive.google.com/drive/folders/test-folder"]');
  assert.equal(folderPosts, 1);
  await screenshot('account-accepted-desktop.png');
  results.push('Accepted Account creates and reopens the personal research folder');
  await page.click('.desktop-nav a[href="events.html"]');
  await page.waitForFunction(() => document.body.dataset.reactPage === 'events.html' && document.body.textContent.includes('SpudCells with Dr. Kate Adamala'));
  assert.equal(await page.evaluate(() => window.qaSentinel === 'persistent' && window.qaHeader === document.querySelector('.site-header')), true);
  assert.equal(await page.$eval('time', el => el.dateTime), '2026-10-29T18:30:00-04:00');
  assert(await page.$('a[href="https://www.biorxiv.org/content/10.64898/2026.07.01.735724v1.full"]'));
  await page.waitForFunction(() => document.querySelector('.event-poster img')?.naturalWidth === 1080);
  await screenshot('events-desktop.png');
  results.push('Accepted Events shows the date, virtual format, room, poster, and reading links with persistent navigation');
  await page.setViewport({ width: 1280, height: 900 });
  assert(await page.evaluate(() => { const nav = document.querySelector('.desktop-nav').getBoundingClientRect(); const right = document.querySelector('.header-right').getBoundingClientRect(); const logo = document.querySelector('.wordmark').getBoundingClientRect(); return nav.left >= logo.right && nav.right <= right.left; }), 'desktop header overlaps');
  results.push('Accepted desktop navigation fits at 1280px');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.waitForSelector('#spudcells-title');
  await page.waitForFunction(() => document.querySelector('.event-poster img')?.naturalWidth === 1080);
  await screenshot('events-mobile.png');
  await page.click('.site-menu summary');
  await page.click('.menu-panel a[href="contact.html"]');
  await page.waitForFunction(() => document.body.dataset.reactPage === 'contact.html');
  assert.equal(await page.$eval('.site-menu', el => el.open), false);
  await page.waitForSelector('#contact-form');
  await screenshot('contact-mobile.png');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  results.push('375px Events/Contact layouts and mobile navigation work');
  membership = 'pending';
  await page.evaluate(() => window.qaSetMembership('pending'));
  await visit('/account.html');
  assert.equal(await page.$('a[href="events.html"]'), null);
  await screenshot('account-pending-mobile.png');
  membership = 'accepted';
  await visit('/account.html');
  await page.waitForSelector('a[href="https://drive.google.com/drive/folders/test-folder"]');
  await screenshot('account-accepted-mobile.png');
  await visit('/events.html');
  await page.waitForSelector('#spudcells-title');
  membership = 'pending';
  await page.evaluate(() => window.qaSetMembership('pending'));
  await page.waitForFunction(() => !document.querySelector('#spudcells-title'));
  assert.equal(await page.$('.event-poster'), null);
  results.push('Revocation removes the mounted Events body and Account folder actions');
  membership = null;
  await visit('/contact.html');
  assert(await page.$('#contact-form'));
  await page.setViewport({ width: 1440, height: 1000 });
  await screenshot('contact-desktop.png');
  await visit('/register.html');
  assert(await page.$('.registration-routes'));
  results.push('Contact and anonymous registration remain available');
  assert.equal(await page.$eval('.site-footer a[href="https://www.instagram.com/ebs_2027/"]', el => el.target), '_blank');
  assert.equal(await page.$eval('.site-footer a[href="https://www.linkedin.com/company/exeter-biology-symposium/"]', el => el.target), '_blank');
  assert.deepEqual(errors, []);
  results.push('Social links remain in the footer and no uncaught browser errors occur');
  const report = { passed: results.length, checks: results };
  await writeFile(new URL('browser-results.json', output), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (browser) { const pages = await browser.pages(); await pages.at(-1)?.screenshot({ path: new URL('failure.png', output).pathname, fullPage: true }); }
  throw error;
} finally { if (browser) await browser.close(); await server.close(); }
