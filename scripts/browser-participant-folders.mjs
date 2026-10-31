// Isolated local UI harness: mocks the API and Clerk context; never calls Google or Clerk.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';
const ready = { state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/test-folder', documentUrl: 'https://docs.google.com/document/d/test-document/edit' };
let state = { state: 'empty' }, postCount = 0, mode = 'success';
const server = await createServer({
  server: { host: '127.0.0.1', port: 4187, strictPort: true },
  plugins: [{
    name: 'local-folder-test-harness',
    resolveId(id) { if (id === '/__research-folder-test.tsx') return id; },
    load(id) { if (id === '/__research-folder-test.tsx') return `
      import React from 'react';
      import {createRoot} from 'react-dom/client';
      import {AuthContext,initialAuth} from '/src/auth.tsx';
      import AcceptedAccount from '/src/pages/accepted-account.tsx';
      import '/src/styles.css';
      createRoot(document.getElementById('root')).render(<AuthContext.Provider value={{...initialAuth,status:'signed-in',access:'accepted',manageAccount(){document.body.dataset.accountOpened='true'}}}><AcceptedAccount/></AuthContext.Provider>);
    `; },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/participant-folder') {
          if (req.method === 'POST') {
            postCount++;
            await new Promise(resolve => setTimeout(resolve, 250));
            state = mode === 'success' ? ready : { state: mode };
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'private, no-store');
          res.statusCode = state.state === 'unavailable' ? 503 : state.state === 'processing' ? 202 : ['link-google', 'needs-review', 'identity-changed'].includes(state.state) ? 409 : 200;
          return res.end(JSON.stringify(state));
        }
        if (req.url === '/__research-folder-qa') {
          const html = await vite.transformIndexHtml(req.url, '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Research folder QA</title></head><body><main id="root"></main><script type="module" src="/__research-folder-test.tsx"></script></body></html>');
          res.setHeader('Content-Type', 'text/html'); return res.end(html);
        }
        next();
      });
    },
  }],
});
let browser;
const results = [];
const output = new URL('../docs/reviews/participant-folders/', import.meta.url);
await mkdir(output, { recursive: true });
try {
  await server.listen();
  browser = await puppeteer.launch({ headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = 'http://127.0.0.1:4187/__research-folder-qa';
  const button = () => page.$('#research-folder-title + p + p + .actions button');
  const waitText = text => page.waitForFunction(text => document.querySelector('[role="status"]')?.textContent.includes(text), {}, text);
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto(base, { waitUntil: 'networkidle0' });
  await waitText('Create your own');
  await page.focus('.actions button');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('.actions button')?.disabled === true);
  await page.evaluate(() => document.querySelector('.actions button').click());
  await waitText('are ready');
  assert.equal(postCount, 1, 'keyboard and repeated click must issue one request');
  assert.equal(await page.$eval('.actions a', el => el.href), ready.folderUrl);
  await page.screenshot({ path: new URL('desktop-ready.png', output).pathname, fullPage: true });
  results.push('Keyboard creation, disabled pending action, double-click prevention, and ready links');
  await page.reload({ waitUntil: 'networkidle0' });
  await waitText('are ready');
  assert.equal(postCount, 1);
  results.push('Reload opens saved folder without a creation request');
  state = { state: 'link-google' };
  await page.reload({ waitUntil: 'networkidle0' });
  await waitText('Link one Google');
  await (await button()).click();
  assert.equal(await page.evaluate(() => document.body.dataset.accountOpened), 'true');
  state = { state: 'empty' };
  await page.$eval('.actions button.secondary', el => el.click());
  await waitText('Create your own');
  results.push('Link-account action and read-only access recheck');
  mode = 'unavailable';
  await (await button()).click();
  await waitText('unavailable right now');
  mode = 'success';
  await (await button()).click();
  await waitText('are ready');
  results.push('Service failure and successful retry');
  for (const status of ['processing', 'needs-review', 'identity-changed']) {
    state = { state: status };
    await page.reload({ waitUntil: 'networkidle0' });
    if (status === 'processing') {
      await waitText('being prepared');
      assert(await button());
    } else {
      await waitText(status === 'needs-review' ? 'finished copying' : 'account has changed');
      assert.equal(await button(), null);
    }
  }
  results.push('Processing recheck and staff-review states');
  state = { state: 'empty' };
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await waitText('Create your own');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile content overflows');
  await page.screenshot({ path: new URL('mobile-create.png', output).pathname, fullPage: true });
  results.push('375px layout without horizontal overflow');
  assert.deepEqual(errors, []);
  results.push('No uncaught browser errors');
  console.log(JSON.stringify({ passed: results.length, checks: results }, null, 2));
} finally {
  if (browser) await browser.close();
  await server.close();
}
