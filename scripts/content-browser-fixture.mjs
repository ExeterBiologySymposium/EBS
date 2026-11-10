import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Explicit localhost-only QA process for the website content editor. It uses fake identities and an
// in-memory PostgreSQL database, so it cannot reach Clerk or the hosted database or publish real content.
const root = resolve(import.meta.dirname, '..');
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); }
catch { console.error('This fixture needs a local PostgreSQL runtime: npm install --no-save @electric-sql/pglite'); process.exit(1); }

const qa = { actor: 'user_team', team: true, accepted: true, failNextWrite: false };
const pages = ['admin.html', 'account.html', 'researchers.html', 'resources.html', 'datascience.html', 'python.html', 'rstudio.html', 'faq.html', 'schedule.html'];
let handler, store, initialContent;
const vite = await createServer({
  root, configLoader: 'runner', cacheDir: resolve(root, '.vite-qa'),
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-runtime', 'motion/react', 'lucide-react', '@vercel/analytics/react'] },
  resolve: { dedupe: ['react', 'react-dom'], alias: { '@clerk/react': resolve(root, 'scripts/org-clerk-fixture.tsx') } },
  server: { host: '127.0.0.1', port: 4181, strictPort: true, hmr: false, ws: false },
  plugins: [{ name: 'content-qa-only', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const path = request.url.split(/[?#]/)[0];
      if (path === '/__content-qa') {
        let source = ''; for await (const chunk of request) source += chunk;
        const value = source ? JSON.parse(source) : {};
        for (const key of ['actor', 'team', 'accepted', 'failNextWrite']) if (key in value) qa[key] = value[key];
        if (value.external) {
          // Another Team member saves the page, so an open editor holds a stale revision.
          const current = await store.read(value.external);
          const draft = structuredClone(current?.draft ?? initialContent[value.external]);
          draft.title = draft.title + ' (edited elsewhere)';
          await store.saveDraft(value.external, current?.revision ?? 0, draft, { id: 'user_other', name: 'Grace Hopper (QA)' });
        }
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(qa));
      }
      if (path === '/api/page-content') {
        let body = ''; for await (const chunk of request) body += chunk;
        const result = await handler(new Request('http://127.0.0.1:4181' + request.url, { method: request.method, headers: request.headers, ...(body ? { body } : {}) }));
        if (request.method === 'POST' && qa.failNextWrite) {
          // The write completed, but the browser never learns the outcome.
          qa.failNextWrite = false;
          response.statusCode = 504; response.setHeader('Content-Type', 'text/html');
          return response.end('<h1>Gateway timeout</h1>');
        }
        response.statusCode = result.status;
        result.headers.forEach((value, key) => response.setHeader(key, value));
        return response.end(await result.text());
      }
      const page = path === '/' ? 'researchers.html' : path.slice(1);
      if (pages.includes(page)) {
        const html = await server.transformIndexHtml('/content-qa.html', `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EBS content QA</title></head><body data-react-page="${page}"><div id="root"></div><script type="module" src="/scripts/content-browser-entry.tsx"></script></body></html>`);
        response.setHeader('Content-Type', 'text/html');
        return response.end(html);
      }
      next();
    });
  } }],
});
const { createContentHandlers } = await vite.ssrLoadModule('/server/content/handlers.ts');
const { createContentStore } = await vite.ssrLoadModule('/server/content/store.ts');
({ initialContent } = await vite.ssrLoadModule('/server/content/defaults.ts'));
const database = new PGlite();
await database.exec(await readFile(resolve(root, 'scripts/sql/page-content.sql'), 'utf8'));
store = createContentStore(async (text, params) => (await database.query(text, params)).rows, 'ins_qa');
handler = createContentHandlers({
  enabled: true,
  authenticate: async () => qa.actor,
  isTeam: async user => qa.team && user === qa.actor,
  isAccepted: async user => qa.accepted && user === qa.actor,
  editorName: async user => user === 'user_team' ? 'Ada Lovelace (QA)' : '',
  store: () => store,
  initial: page => initialContent[page],
});
await vite.listen();
console.log('Fake-provider content fixture: http://127.0.0.1:4181/admin.html?view=content');
