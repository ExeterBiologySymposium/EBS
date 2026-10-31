import { createServer } from 'vite';
import { resolve } from 'node:path';
import { fixture } from './org-fixture.mjs';

// Explicit localhost-only QA process. This uses fake users and cannot send email.
const root = resolve(import.meta.dirname, '..');
let fix, handlers, cleanupFails = false, ceiling = false;
const vite = await createServer({ root, configLoader: 'runner', cacheDir: resolve(root, '.vite-qa'), optimizeDeps: { include: ['react','react-dom/client','react/jsx-runtime','motion/react','lucide-react','@vercel/analytics/react'] }, resolve: { dedupe: ['react','react-dom'], alias: { '@clerk/react': resolve(root, 'scripts/org-clerk-fixture.tsx') } }, server: { host: '127.0.0.1', port: 4180, strictPort: true, hmr: false, ws: false }, plugins: [{ name: 'org-qa-only', configureServer(server) {
  server.middlewares.use(async (request, response, next) => {
    if (request.url.startsWith('/__org-qa')) {
      let source = ''; for await (const chunk of request) source += chunk;
      const value = source ? JSON.parse(source) : {};
      if ('cleanupFails' in value) cleanupFails = value.cleanupFails;
      if ('revoke' in value) fix.organizations.get('org_team').members = [];
      if ('ceiling' in value) {
        ceiling = value.ceiling;
        if (ceiling) {
          for (let i = fix.organizations.size; i < 100; i++) fix.organizations.set('org_capacity' + i, { id: 'org_capacity' + i, metadata: {}, limit: 20, name: 'Unrelated', members: [], invitations: [] });
          for (const pool of fix.pools.filter(pool => pool.state === 'ready')) {
            const org = fix.organizations.get(pool.organizationId);
            while (org.members.length + org.invitations.length < 20) org.members.push({ userId: 'user_fill' + org.members.length, name: 'Capacity fixture', identifier: 'capacity@example.test', joinedAt: 1 });
          }
        } else {
          for (const [id, org] of fix.organizations) { if (id.startsWith('org_capacity')) fix.organizations.delete(id); else org.members = org.members.filter(member => !member.userId.startsWith('user_fill')); }
        }
      }
      response.setHeader('Content-Type', 'application/json'); return response.end(JSON.stringify({ cleanupFails, ceiling, organizations: fix.organizations.size }));
    }
    if (request.url.startsWith('/api/team-admin')) {
      let body = ''; for await (const chunk of request) body += chunk;
      const result = await handlers.fetch(new Request('http://127.0.0.1:4180' + request.url, { method: request.method, headers: request.headers, ...(body ? { body } : {}) }));
      response.statusCode = result.status; result.headers.forEach((value, key) => response.setHeader(key, value)); return response.end(await result.text());
    }
    if (['/admin.html', '/account.html', '/accept-invitation.html'].includes(request.url.split(/[?#]/)[0])) {
      const page = request.url.slice(1).split(/[?#]/)[0];
      const html = await server.transformIndexHtml('/org-qa.html', `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>EBS administration QA</title></head><body data-react-page="${page}"><div id="root"></div><script type="module" src="/scripts/org-browser-entry.tsx"></script></body></html>`);
      response.setHeader('Content-Type', 'text/html'); return response.end(html);
    }
    next();
  });
} }] });
const { createOrganizationService } = await vite.ssrLoadModule('/server/orgs/service.ts');
const { createAdminHandlers } = await vite.ssrLoadModule('/server/orgs/handlers.ts');
fix = fixture(createOrganizationService);
const records = Array.from({ length: 26 }, (_, i) => ({ userId: 'user_student' + i, name: 'Student ' + i, identifier: `student${i}@example.test`, joinedAt: Date.UTC(2026, 9, 20) - i * 1000 }));
for (const record of records) fix.users.set(record.userId, { id: record.userId, name: record.name, verifiedEmails: [record.identifier] });
fix.organizations.get('org_pending').members.push(...records.slice(0, 20));
fix.organizations.set('org_pending2', { id: 'org_pending2', name: 'EBS Pending 002', limit: 20, metadata: {}, members: records.slice(20), invitations: [] });
fix.pools.push({ kind: 'pending', ordinal: 2, operationId: 'seed-second', organizationId: 'org_pending2', state: 'ready' });
const remove = fix.gateway.removeMember;
fix.gateway.removeMember = async (...args) => { if (cleanupFails) throw Error('fake cleanup failure'); return remove(...args); };
handlers = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team' });
await vite.listen();
console.log('Fake-provider admin fixture: http://127.0.0.1:4180/admin.html');
