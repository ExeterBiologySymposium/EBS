import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const unescape = text => text.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
  return named[entity] ?? String.fromCodePoint(entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10));
});
const plain = html => unescape(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, '');
const seo = JSON.parse(await read('seo.config.json'));
const search = JSON.parse(await read('src/search-data.json'));
const sitemap = await read('dist/sitemap.xml');

for (const [route, draft, title, sectionCount, other] of [
  ['terms.html', 'terms-of-use-copy.md', 'Terms of Use', 18, 'privacy.html'],
  ['privacy.html', 'privacy-notice-copy.md', 'Privacy Notice', 16, 'terms.html'],
]) {
  const html = await read(`dist/${route}`);
  assert(html.includes(`data-react-page="${route}"`), `${route}: page shell`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: one h1`);
  assert(html.includes(`<h1>${title}</h1>`), `${route}: public policy content`);
  assert(html.includes(`<title>${seo.pages[route].title}</title>`), `${route}: title`);
  assert(html.includes(`name="description" content="${seo.pages[route].description}"`), `${route}: description`);
  assert(html.includes(`rel="canonical" href="${seo.siteUrl}/${route}"`), `${route}: canonical`);
  assert(html.includes('name="robots" content="index,follow"'), `${route}: indexable public page`);
  assert(html.includes('dateTime="2026-10-31"') || html.includes('datetime="2026-10-31"'), `${route}: revision date`);
  assert(sitemap.includes(`/${route}</loc>`), `${route}: sitemap`);
  assert.equal(search.filter(item => item.url === route).length, 1, `${route}: search entry`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${route}: unique IDs`);
  const contents = html.match(/<nav\b[^>]*aria-label="[^"]* contents"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert(contents, `${route}: labeled contents`);
  const anchors = [...contents.matchAll(/href="#([^"]+)"/g)];
  assert.equal(anchors.length, sectionCount, `${route}: every section in contents`);
  for (const [, target] of anchors) assert(ids.includes(target), `${route}: anchor ${target}`);
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert(article, `${route}: article`);
  assert.equal((article.match(/<h2\b/g) || []).length, sectionCount, `${route}: section headings`);
  assert(article.includes(`href="${other}"`), `${route}: other policy link`);
  assert(article.includes('href="contact.html"'), `${route}: contact link`);
  assert(!html.includes('Draft for approval'), `${route}: omit planning notes`);
  const markdown = (await read(`.planning/specs/${draft}`)).split(/^## /m).slice(1).map(block =>
    block.replace(/^\s*- /gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '')
  ).join('');
  assert.equal(plain(article), markdown.replace(/\s+/g, ''), `${route}: approved substantive copy preserved`);
  if (route === 'privacy.html') assert(article.includes('href="https://exeter.edu/privacy-notice/"'), 'Retain Academy privacy link');
}

const pages = (await readdir(resolve(root, 'dist'))).filter(file => file.endsWith('.html'));
for (const route of pages) {
  const footer = (await read(`dist/${route}`)).match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert(footer, `${route}: footer`);
  for (const [href, label] of [['terms.html', 'Terms of Use'], ['privacy.html', 'Privacy Notice']]) {
    assert.equal((footer.match(new RegExp(`<a href="${href.replace('.', '\\.')}"`, 'g')) || []).length, 1, `${route}: one ${label} link`);
    assert(footer.includes(`<a href="${href}">${label}</a>`), `${route}: ${label} footer label`);
  }
}
console.log(`PASS: both public legal pages preserve approved copy, metadata, ${18 + 16} section links, search/sitemap entries, and policy footer links on ${pages.length} routes.`);
