import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(resolve(root, 'seo.config.json'), 'utf8'));
if (typeof config.siteUrl !== 'string' || new URL(config.siteUrl).protocol !== 'https:' || new URL(config.siteUrl).origin !== config.siteUrl) {
  throw new Error('siteUrl must be an HTTPS origin without a trailing slash or path.');
}
if (typeof config.siteName !== 'string' || !config.siteName.trim()) throw new Error('siteName must be nonempty.');
if (typeof config.defaultImage !== 'string' || !/^\/(?!\/)/.test(config.defaultImage)) throw new Error('defaultImage must be a root-relative path.');
if (typeof config.googleSiteVerification !== 'string' || !/^[A-Za-z0-9_-]+$/.test(config.googleSiteVerification)) {
  throw new Error('Google site verification token must be a nonempty token.');
}
if (!config.pages || typeof config.pages !== 'object' || Array.isArray(config.pages) || !config.pages['index.html']) {
  throw new Error('pages must define the homepage and existing routes.');
}
const routes = Object.keys(config.pages);
if (!Array.isArray(config.selectedTerms) || !Array.isArray(config.excludedTerms)) throw new Error('SEO terms must be arrays.');
const selected = [...new Set(config.selectedTerms)];
if (!selected.length || selected.some((term) => typeof term !== 'string' || !term.trim())) {
  throw new Error('Selected SEO terms must be nonempty strings.');
}
const excluded = new Set(config.excludedTerms);
const assigned = new Set();
for (const [route, page] of Object.entries(config.pages)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(route)) throw new Error(`Invalid route: ${route}`);
  if (!page || typeof page.title !== 'string' || !page.title.trim() || typeof page.description !== 'string' || !page.description.trim() || !Array.isArray(page.terms)) {
    throw new Error(`Invalid page metadata for ${route}.`);
  }
  if (page.noindex !== undefined && typeof page.noindex !== 'boolean') throw new Error(`Invalid noindex value for ${route}.`);
  const modified = new Date(`${page.lastmod}T00:00:00.000Z`);
  if (typeof page.lastmod !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(page.lastmod) || !Number.isFinite(modified.getTime()) || modified.toISOString().slice(0, 10) !== page.lastmod) {
    throw new Error(`Invalid lastmod for ${route}: use a real YYYY-MM-DD date.`);
  }
  for (const term of page.terms) {
    if (!selected.includes(term) || excluded.has(term)) throw new Error(`Invalid SEO term for ${route}: ${term}`);
    assigned.add(term);
  }
}
if (selected.some((term) => excluded.has(term) || !assigned.has(term))) {
  throw new Error('Every selected term must be allowed and assigned to a page.');
}
const outputs = new Map();

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pageUrl = (route) => `${config.siteUrl}/${route === 'index.html' ? '' : route}`;
const schema = (page, url) => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: page.title,
  url,
  inLanguage: 'en-US',
  description: page.description,
  dateModified: page.lastmod,
  keywords: page.terms.join(', '),
  isPartOf: { '@type': 'WebSite', name: config.siteName, url: config.siteUrl },
  publisher: { '@type': 'Organization', name: config.siteName, url: config.siteUrl }
}).replace(/</g, '\\u003c');

for (const route of routes) {
  const page = config.pages[route];
  const url = pageUrl(route);
  const head = `<!doctype html><html lang="en"><head><meta charset="UTF-8">${route === 'index.html' ? `<meta name="google-site-verification" content="${esc(config.googleSiteVerification)}" />` : ''}<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="${esc(page.description)}"><meta name="robots" content="${page.noindex ? 'noindex,nofollow' : 'index,follow'}"><meta name="theme-color" content="#17191b"><link rel="canonical" href="${esc(url)}"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(config.siteName)}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(`${config.siteUrl}${config.defaultImage}`)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title)}"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${esc(`${config.siteUrl}${config.defaultImage}`)}"><link rel="icon" href="/favicon.svg"><title>${esc(page.title)}</title><script type="application/ld+json">${schema(page, url)}</script></head><body><div id="root"></div></body></html>`;
  outputs.set(route, `${head}\n`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(route => !config.pages[route].noindex).map((route) => `  <url>\n    <loc>${esc(pageUrl(route))}</loc>\n    <lastmod>${config.pages[route].lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
outputs.set('sitemap.xml', sitemap);
outputs.set('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /protected-assets/\nDisallow: /guides/\nDisallow: /enzyme_activity.csv\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
for (const [file, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(resolve(root, file), 'utf8') !== content) throw new Error(`SEO output is stale: ${file}`);
  } else {
    await writeFile(resolve(root, file), content);
  }
}
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Updated'} ${routes.length} route heads, sitemap.xml, and robots.txt with ${selected.length} selected terms.`);
