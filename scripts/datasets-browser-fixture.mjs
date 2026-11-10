import { createServer } from 'vite';
import { resolve } from 'node:path';

// Explicit localhost-only QA server for reviewing the Dataset library (and other member pages)
// as a fake Accepted member. It never contacts Clerk, the content API or any database.
// Run: node scripts/datasets-browser-fixture.mjs, then open http://127.0.0.1:4182/datasets.html
const root = resolve(import.meta.dirname, '..');
const pages = ['datasets.html', 'account.html', 'resources.html', 'datascience.html', 'python.html', 'rstudio.html', 'contact.html', 'faq.html'];
const vite = await createServer({
  root, configLoader: 'runner', cacheDir: resolve(root, '.vite-qa'),
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime', 'motion/react', 'lucide-react', '@vercel/analytics/react'] },
  resolve: { dedupe: ['react', 'react-dom'], alias: { '@clerk/react': resolve(root, 'scripts/org-clerk-fixture.tsx') } },
  server: { host: '127.0.0.1', port: 4182, strictPort: true, hmr: false, ws: false },
  plugins: [{ name: 'datasets-qa-only', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const path = request.url.split(/[?#]/)[0];
      const page = path === '/' ? 'datasets.html' : path.slice(1);
      if (!pages.includes(page)) return next();
      const html = await server.transformIndexHtml('/datasets-qa.html', `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EBS dataset library QA</title></head><body data-react-page="${page}"><div id="root"></div><script type="module" src="/scripts/datasets-browser-entry.tsx"></script></body></html>`);
      response.setHeader('Content-Type', 'text/html');
      response.end(html);
    });
  } }],
});
await vite.listen();
console.log('Dataset library QA (fake Accepted member): http://127.0.0.1:4182/datasets.html');
