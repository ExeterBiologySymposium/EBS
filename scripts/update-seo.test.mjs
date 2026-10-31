import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const projectConfig = JSON.parse(await readFile(resolve(root, 'seo.config.json'), 'utf8'));
const token = '2Z5fl97yNeITcjZHCFydWygaEzeAIWNtDmKmB74A_E0';
const privateRoutes = ['admin.html', 'accept-invitation.html', 'account.html', 'events.html', 'resources.html', 'datascience.html', 'python.html', 'rstudio.html', 'opensource.html'];
const publicRoutes = ['index.html', 'about.html', 'team.html', 'schedule.html', 'schools.html', 'researchers.html', 'judges.html', 'student-signup.html', 'register.html', 'faq.html', 'contact.html', 'terms.html', 'privacy.html'];

async function fixture(t, change = () => {}) {
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'ebs-seo-'));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  // Keep traversal-test output inside the disposable fixture even if validation regresses.
  const directory = resolve(temporaryRoot, 'site');
  await mkdir(resolve(directory, 'scripts'), { recursive: true });
  await copyFile(resolve(root, 'scripts/update-seo.mjs'), resolve(directory, 'scripts/update-seo.mjs'));
  const config = structuredClone(projectConfig);
  config.googleSiteVerification = token;
  for (const [route, page] of Object.entries(config.pages)) {
    page.lastmod = '2020-02-29';
    page.noindex = privateRoutes.includes(route);
  }
  change(config);
  await writeFile(resolve(directory, 'seo.config.json'), JSON.stringify(config));
  const run = (...args) => spawnSync(process.execPath, [resolve(directory, 'scripts/update-seo.mjs'), ...args], { encoding: 'utf8' });
  const read = file => readFile(resolve(directory, file), 'utf8');
  return { config, directory, run, read };
}

function succeeds(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('project policy indexes only the 13 public pages and describes unfinished lessons honestly', () => {
  assert.deepEqual(Object.keys(projectConfig.pages).filter(route => !projectConfig.pages[route].noindex).sort(), publicRoutes.toSorted());
  assert.equal(projectConfig.googleSiteVerification, token);
  for (const route of ['datascience.html', 'python.html', 'rstudio.html']) {
    assert.match(projectConfig.pages[route].description, /coming soon/i);
  }
});

test('regeneration retains one exact homepage verification tag and valid metadata', async t => {
  const { run, read, config } = await fixture(t);
  succeeds(run());
  for (const route of Object.keys(config.pages)) {
    const head = (await read(route)).split('</head>')[0];
    const tags = head.match(/<meta\b[^>]*name="google-site-verification"[^>]*>/g) ?? [];
    assert.equal(tags.length, route === 'index.html' ? 1 : 0, route);
    if (tags.length) assert.ok(tags[0].includes(`content="${token}"`));
    const schema = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.dateModified, '2020-02-29');
    assert.equal(schema.url, `${config.siteUrl}/${route === 'index.html' ? '' : route}`);
  }
  const first = await read('index.html');
  succeeds(run());
  assert.equal(await read('index.html'), first);
});

test('sitemap uses configured modification dates and excludes every private page', async t => {
  const { run, read, config } = await fixture(t);
  succeeds(run());
  const sitemap = await read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls.toSorted(), publicRoutes.map(route => `${config.siteUrl}/${route === 'index.html' ? '' : route}`).sort());
  const dates = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(match => match[1]);
  assert.equal(dates.length, 13);
  assert.ok(dates.every(date => date === '2020-02-29'));
});

test('robots excludes service and private-file paths but permits reading HTML noindex directives', async t => {
  const { run, read, config } = await fixture(t);
  succeeds(run());
  const robots = await read('robots.txt');
  const disallowed = [...robots.matchAll(/^Disallow: (.+)$/gm)].map(match => match[1]);
  assert.deepEqual(disallowed, ['/api/', '/protected-assets/', '/guides/', '/enzyme_activity.csv']);
  assert.ok(robots.includes(`Sitemap: ${config.siteUrl}/sitemap.xml`));
  for (const route of privateRoutes) {
    assert.match(await read(route), /<meta name="robots" content="noindex,nofollow">/);
    assert.ok(!disallowed.some(path => `/${route}`.startsWith(path)));
  }
});

test('--check is repeatable and reports stale files without changing them', async t => {
  const { run, read, directory, config } = await fixture(t);
  succeeds(run());
  succeeds(run('--check'));
  const files = [...Object.keys(config.pages), 'sitemap.xml', 'robots.txt'];
  await writeFile(resolve(directory, 'index.html'), 'stale verification page');
  const before = await Promise.all(files.map(read));
  const result = run('--check');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SEO output is stale: index.html/);
  assert.deepEqual(await Promise.all(files.map(read)), before);
});

test('invalid configuration fails before overwriting page files', async t => {
  const cases = [
    ['invalid calendar date', config => { config.pages['index.html'].lastmod = '2026-02-29'; }, /lastmod/],
    ['missing modification date', config => { delete config.pages['about.html'].lastmod; }, /lastmod/],
    ['empty verification token', config => { config.googleSiteVerification = ''; }, /verification/i],
    ['noncanonical origin', config => { config.siteUrl += '/nested'; }, /siteUrl/],
    ['unsafe output path', config => { config.pages['../escape.html'] = config.pages['about.html']; }, /route/i],
  ];
  for (const [label, change, pattern] of cases) {
    await t.test(label, async t => {
      const { run, read, directory } = await fixture(t, change);
      await writeFile(resolve(directory, 'index.html'), 'existing page');
      const result = run();
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, pattern);
      assert.equal(await read('index.html'), 'existing page');
    });
  }
});

test('HTML and JSON-LD safely represent special characters', async t => {
  const title = 'Biology <research> & "evidence" </script>';
  const { run, read } = await fixture(t, config => { config.pages['index.html'].title = title; });
  succeeds(run());
  const html = await read('index.html');
  assert.ok(html.includes('<title>Biology &lt;research&gt; &amp; &quot;evidence&quot; &lt;/script&gt;</title>'));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.name, title);
});
