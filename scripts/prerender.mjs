import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routes = ['about.html', 'datascience.html', 'faq.html', 'index.html', 'judges.html', 'opensource.html', 'python.html', 'register.html', 'researchers.html', 'resources.html', 'rstudio.html', 'schedule.html', 'schools.html', 'student-signup.html', 'team.html', 'volunteer-signup.html'];
const serverOut = resolve(root, '.vite-ssr');

await build({ root, configFile: false, plugins: [react()], build: { ssr: 'src/entry-server.tsx', outDir: serverOut, emptyOutDir: true } });
const { render } = await import(pathToFileURL(resolve(serverOut, 'entry-server.mjs')).href);

for (const route of routes) {
  const output = resolve(root, 'dist', route);
  if (!existsSync(output)) throw new Error(`Missing built route: ${route}`);
  let html = await readFile(output, 'utf8');
  const markup = render(route);
  if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  } else {
    const body = html.match(/<body([^>]*)>[\s\S]*?<\/body>/i);
    if (!body) throw new Error(`Missing body in built route: ${route}`);
    html = html.replace(body[0], `<body${body[1]} data-react-page="${route}"><div id="root">${markup}</div></body>`);
  }
  html = html.replace(/<script\b[^>]*\bsrc=["'][^"']*js\/(?:main|appwrite-content)\.js[^"']*["'][^>]*><\/script>/gi, '');
  await writeFile(output, html);
}

await rm(serverOut, { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
