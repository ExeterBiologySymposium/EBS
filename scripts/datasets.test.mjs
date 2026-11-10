import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let catalog, tools, page, policy, access;
try {
  catalog = await vite.ssrLoadModule('/src/learning/datasets/catalog.ts');
  tools = await vite.ssrLoadModule('/src/learning/datasets/tools.ts');
  page = await vite.ssrLoadModule('/src/pages/datasets.tsx');
  policy = await vite.ssrLoadModule('/src/access-policy.ts');
  access = await vite.ssrLoadModule('/server/access.ts');
} finally { await vite.close(); }

const { datasets, fields } = catalog;
const { toolGuides, toolLabels, toolChoices } = tools;
const toolKeys = Object.keys(toolLabels);
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const sitePage = /^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/;
const plainText = value => typeof value === 'string' && value === value.trim() && value.length > 0 && !/[<>]/.test(value);
function assertLink(url, where) {
  if (sitePage.test(url)) return;
  assert.match(url, /^https:\/\/[^\s]+$/, `${where}: use https:// or a site page`);
  assert.doesNotThrow(() => new URL(url), `${where}: invalid URL`);
}

test('covers every requested research field with several datasets', () => {
  assert.deepEqual(fields.map(field => field.name), [
    'Systems biology', 'Evolutionary biology and phylogenetics', 'Microbiome science', 'Cancer genomics and precision medicine',
    'Epidemiology and public health', 'Biostatistics', 'Mathematical biology', 'Ecology and conservation data science',
    'Computational neuroscience', 'Pharmacology and cheminformatics', 'Health informatics', 'Machine learning in biology',
    'Bibliometrics (scientometrics)', 'Meta-research and meta-analysis',
  ]);
  for (const field of fields) {
    assert.ok(plainText(field.summary), field.key);
    assert.ok(datasets.filter(dataset => dataset.field === field.key).length >= 5, `${field.name} needs at least five datasets`);
  }
});

test('every dataset entry is complete, consistent and safely linked', () => {
  const ids = new Set();
  for (const dataset of datasets) {
    const where = `dataset ${dataset.id}`;
    assert.match(dataset.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, where);
    assert.ok(!ids.has(dataset.id), `${where} is duplicated`);
    ids.add(dataset.id);
    assert.ok(fields.some(field => field.key === dataset.field), `${where}: unknown field`);
    assert.ok(levels.includes(dataset.level), `${where}: unknown level`);
    assert.ok(dataset.tools.length > 0 && dataset.tools.every(tool => toolKeys.includes(tool)), `${where}: unknown tool`);
    assert.equal(new Set(dataset.tools).size, dataset.tools.length, `${where}: repeated tool`);
    for (const key of ['name', 'provider', 'format', 'access', 'summary', 'question']) assert.ok(plainText(dataset[key]), `${where}: ${key}`);
    assert.ok(dataset.question.endsWith('?'), `${where}: the starter question should be a question`);
    assert.ok(dataset.steps.length >= 2 && dataset.steps.every(plainText), `${where}: steps`);
    if (dataset.caution !== undefined) assert.ok(plainText(dataset.caution), `${where}: caution`);
    if (dataset.code) {
      assert.ok(['R', 'Python'].includes(dataset.code.language), `${where}: code language`);
      assert.ok(dataset.code.text.trim(), `${where}: code`);
    }
    assertLink(dataset.url, where);
    for (const link of dataset.links ?? []) { assert.ok(plainText(link.label), `${where}: link label`); assertLink(link.url, where); }
  }
});

test('tool guides match the requested tools and each has matching datasets', () => {
  assert.deepEqual(toolGuides.map(guide => guide.key), ['esquisse', 'galaxy', 'idep', 'biblioshiny']);
  const requested = {
    esquisse: 'https://dreamrs.github.io/esquisse/',
    galaxy: 'https://galaxy-main.usegalaxy.org/',
    idep: 'https://bioinformatics.sdstate.edu/idep/',
    biblioshiny: 'https://www.bibliometrix.org/biblioshiny/',
  };
  for (const guide of toolGuides) {
    assert.ok(guide.links.some(link => link.url === requested[guide.key]), `${guide.key} links to the requested site`);
    assert.match(guide.links[0].url, /^https:\/\//, `${guide.key}: the first link opens the tool`);
    for (const link of guide.links) assertLink(link.url, guide.key);
    assert.ok(guide.steps.length >= 5 && guide.steps.every(step => plainText(step.title) && plainText(step.detail)), `${guide.key}: steps`);
    assert.ok(guide.tips.length >= 3 && guide.tips.every(plainText), `${guide.key}: tips`);
    for (const key of ['tagline', 'summary', 'bestFor', 'accepts', 'runsIn', 'account']) assert.ok(plainText(guide[key]), `${guide.key}: ${key}`);
    assert.ok(datasets.filter(dataset => dataset.tools.includes(guide.key)).length >= 5, `${guide.key} needs datasets`);
    assert.ok(toolChoices.some(choice => choice.tool === guide.key), `${guide.key}: missing from the tool chooser`);
  }
});

test('the page renders every guide and dataset with unique anchors and safe links', () => {
  const html = renderToStaticMarkup(h(page.default));
  assert.equal(html.match(/<h1[ >]/g).length, 1);
  assert.equal(html.match(/class="dataset-card"/g).length, datasets.length);
  assert.ok(html.includes(`Showing ${datasets.length} datasets across ${fields.length} fields.`));
  for (const guide of toolGuides) assert.ok(html.includes(`id="${guide.key}"`), guide.key);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'element ids must be unique');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `#${target} has no target`);
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener noreferrer"/);
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) assert.match(href, /^(?:https:\/\/|#|mailto:|[a-z0-9-]+\.html$)/, href);
});

test('the dataset library is an Accepted-member page on every route check', async () => {
  assert.ok(policy.isLearningPage('datasets.html') && policy.isMemberPage('datasets.html'));
  for (const path of ['/datasets.html', '/DATASETS.html', '/%64atasets.html', '/datasets', '/datasets.html;x', '//datasets.html']) assert.ok(policy.isProtectedPath(path), path);
  assert.equal(policy.safeReturnTo('/datasets.html#galaxy'), '/datasets.html#galaxy');
  const handlers = membership => access.createAccessHandlers({
    authenticate: async () => membership ? 'user_1' : null,
    membership: async () => membership,
    enrollPending: async () => {},
  });
  const request = new Request('https://ebs.test/datasets.html');
  assert.equal(await handlers('accepted').protect(request), null);
  for (const [membership, location] of [[null, '/register.html?access=required&returnTo=%2Fdatasets.html'], ['pending', '/account.html?access=required&returnTo=%2Fdatasets.html']]) {
    const response = await handlers(membership).protect(request);
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), location);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
});

test('built output keeps the catalog out of public JavaScript and HTML', async t => {
  const dist = resolve(root, 'dist');
  if (!existsSync(resolve(dist, 'protected-assets'))) { t.skip('Run `npm run build` first to check the built output.'); return; }
  const marker = 'Palmer Station LTER';
  const publicFiles = [...(await readdir(resolve(dist, 'assets'))).map(file => resolve(dist, 'assets', file)), ...(await readdir(dist)).filter(file => file.endsWith('.html')).map(file => resolve(dist, file))];
  for (const file of publicFiles) assert.ok(!(await readFile(file, 'utf8')).includes(marker), `${file} contains member content`);
  const protectedFiles = (await readdir(resolve(dist, 'protected-assets'))).filter(file => file.startsWith('learning-datasets-'));
  assert.equal(protectedFiles.length, 1, 'expected one dataset library chunk');
  assert.ok((await readFile(resolve(dist, 'protected-assets', protectedFiles[0]), 'utf8')).includes(marker));
});
