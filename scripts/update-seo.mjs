import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(resolve(root, 'seo.config.json'), 'utf8'));
const routes = Object.keys(config.pages);
const selected = [...new Set(config.selectedTerms)];
if (!selected.length || selected.some((term) => typeof term !== 'string' || !term.trim())) {
  throw new Error('Selected SEO terms must be nonempty strings.');
}
const excluded = new Set(config.excludedTerms);
const assigned = new Set();
for (const [route, page] of Object.entries(config.pages)) {
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
  keywords: page.terms.join(', '),
  isPartOf: { '@type': 'WebSite', name: config.siteName, url: config.siteUrl },
  publisher: { '@type': 'Organization', name: config.siteName, url: config.siteUrl }
}).replace(/</g, '\\u003c');

for (const route of routes) {
  const page = config.pages[route];
  const url = pageUrl(route);
  const head = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="${esc(page.description)}"><meta name="robots" content="index,follow"><meta name="theme-color" content="#17191b"><link rel="canonical" href="${esc(url)}"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(config.siteName)}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(`${config.siteUrl}${config.defaultImage}`)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title)}"><meta name="twitter:description" content="${esc(page.description)}"><meta name="twitter:image" content="${esc(`${config.siteUrl}${config.defaultImage}`)}"><link rel="icon" href="/favicon.svg"><title>${esc(page.title)}</title><script type="application/ld+json">${schema(page, url)}</script></head><body><div id="root"></div></body></html>`;
  outputs.set(route, `${head}\n`);
}

const lastmod = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url>\n    <loc>${pageUrl(route)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`;
outputs.set('sitemap.xml', sitemap);
outputs.set('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
for (const [file, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(resolve(root, file), 'utf8') !== content) throw new Error(`SEO output is stale: ${file}`);
  } else {
    await writeFile(resolve(root, file), content);
  }
}
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Updated'} ${routes.length} route heads, sitemap.xml, and robots.txt with ${selected.length} selected terms.`);
