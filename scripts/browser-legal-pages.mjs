// Requires the already-installed Puppeteer and a Chromium-based browser.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

const base = process.env.EBS_QA_BASE_URL || 'http://127.0.0.1:4175';
const output = resolve(import.meta.dirname, '..', 'docs/reviews/legal-pages');
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const errors = [];
const consoleErrors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
const passed = [];
async function check(name, run) { await run(); passed.push(name); console.log('PASS: ' + name); }
async function settledRoute(route) {
  await page.waitForFunction(route => document.body.dataset.reactPage === route && document.querySelector('.layout-legal'), {}, route);
}
try {
  await page.setViewport({ width: 1440, height: 1000 });
  for (const [route, count] of [['terms.html', 18], ['privacy.html', 16]]) {
    await page.goto(`${base}/${route}`, { waitUntil: 'networkidle2' });
    await check(`${route}: direct public load and contents`, async () => {
      await settledRoute(route);
      assert.equal(await page.$$eval('h1', nodes => nodes.length), 1);
      assert.equal(await page.$$eval('.legal-section', nodes => nodes.length), count);
      assert.equal(await page.$$eval('.legal-contents a', nodes => nodes.length), count);
      assert.equal(await page.$('.article-body .access-notice'), null);
    });
    await check(`${route}: desktop article beside contents`, async () => {
      const geometry = await page.evaluate(() => {
        const nav = document.querySelector('.legal-contents').getBoundingClientRect();
        const article = document.querySelector('.legal-copy').getBoundingClientRect();
        return { navWidth: nav.width, navRight: nav.right, navTop: nav.top, articleLeft: article.left, articleTop: article.top };
      });
      assert(geometry.navWidth > 0 && geometry.articleLeft > geometry.navRight && Math.abs(geometry.articleTop - geometry.navTop) < 2, JSON.stringify(geometry));
    });
    for (const width of [320, 375, 767, 768, 1100, 1440]) {
      await page.setViewport({ width, height: width < 768 ? 812 : 1000 });
      await check(`${route}: ${width}px layout`, async () => {
        const metrics = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyFont: parseFloat(getComputedStyle(document.querySelector('.legal-copy p')).fontSize),
          footerLinks: [...document.querySelectorAll('.footer-bottom a')].map(node => ({ left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right, height: node.getBoundingClientRect().height })),
        }));
        assert(metrics.scrollWidth <= metrics.width + 1, `Horizontal overflow: ${JSON.stringify(metrics)}`);
        assert(metrics.bodyFont >= 16);
        assert(metrics.footerLinks.every(link => link.left >= 0 && link.right <= width + 1 && link.height >= 44));
      });
      if ([375, 1440].includes(width)) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(output, `${route.replace('.html', '')}-${width}.png`) });
      }
    }
    await check(`${route}: native section navigation and focus`, async () => {
      await page.evaluate(() => { window.legalQaSentinel = true; });
      await page.click('.legal-contents a[href="#contact"]');
      await page.waitForFunction(() => location.hash === '#contact' && document.activeElement?.id === 'contact' && document.querySelector('#contact').getBoundingClientRect().top < 250);
      assert(await page.evaluate(() => window.legalQaSentinel));
    });
  }
  await check('footer navigation, cross-link, and browser history preserve the app', async () => {
    await page.click('.footer-bottom a[href="terms.html"]');
    await settledRoute('terms.html');
    assert(await page.evaluate(() => window.legalQaSentinel));
    assert.match(await page.title(), /^Terms of Use/);
    await page.click('.legal-copy a[href="privacy.html"]');
    await settledRoute('privacy.html');
    assert(await page.evaluate(() => window.legalQaSentinel));
    assert.match(await page.title(), /^Privacy Notice/);
    await page.goBack();
    await settledRoute('terms.html');
    await page.goForward();
    await settledRoute('privacy.html');
    assert(await page.evaluate(() => window.legalQaSentinel));
  });
  await check('mobile footer navigation', async () => {
    await page.setViewport({ width: 375, height: 812 });
    await page.click('.footer-bottom a[href="terms.html"]');
    await settledRoute('terms.html');
    assert(await page.evaluate(() => window.legalQaSentinel));
  });
  await check('site search includes both policy pages', async () => {
    await page.setViewport({ width: 1440, height: 1000 });
    await page.click('.nav-search');
    for (const [query, route] of [['privacy', 'privacy.html'], ['terms', 'terms.html']]) {
      await page.$eval('#search-input', (node, query) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(node, query); node.dispatchEvent(new Event('input', { bubbles: true }));
      }, query);
      await page.waitForSelector(`.search-results a[href="${route}"]`);
    }
    await page.keyboard.press('Escape');
  });
  await check('static policy content works without JavaScript', async () => {
    const staticPage = await browser.newPage();
    try {
      await staticPage.setJavaScriptEnabled(false);
      for (const route of ['terms.html', 'privacy.html']) {
        await staticPage.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
        assert(await staticPage.$('.legal-copy #contact'));
        assert.equal(await staticPage.$$eval('h1', nodes => nodes.length), 1);
        assert(await staticPage.$('.footer-bottom a[href="privacy.html"]'));
      }
    } finally { await staticPage.close(); }
  });
  assert.deepEqual(errors, [], 'No page JavaScript errors');
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify({ base, browser: await browser.version(), passed, pageErrors: errors, consoleErrors }, null, 2) + '\n');
  console.log(`PASS: ${passed.length} legal-page browser checks; screenshots and results in ${output}.`);
} finally { await browser.close(); }
