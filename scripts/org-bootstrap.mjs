import { createServer } from 'vite';
import { resolve } from 'node:path';

// Read-only by default. This script never creates a Clerk organization or sends email.
const root = resolve(import.meta.dirname, '..');
const vite = await createServer({ root, configFile: false, cacheDir: resolve(root, '.vite-cache'), server: { middlewareMode: true, hmr: false, ws: false } });
try {
  const { clerkConfiguration } = await vite.ssrLoadModule('/server/clerk-config.ts');
  const { createClerkOrganizationGateway } = await vite.ssrLoadModule('/server/orgs/clerk.ts');
  const { productionPoolConfiguration } = await vite.ssrLoadModule('/server/orgs/runtime.ts');
  const { neonOrganizationStore } = await vite.ssrLoadModule('/server/orgs/store.ts');
  const { createOrganizationBootstrap } = await vite.ssrLoadModule('/server/orgs/bootstrap.ts');
  const { client, origins, publishableKey } = clerkConfiguration();
  const origin = new URL(origins[0]);
  if (origin.protocol !== 'https:' || origin.origin !== origins[0]) throw Error('configuration');
  const gateway = createClerkOrganizationGateway(client, new URL('/accept-invitation.html', origin).href, publishableKey);
  const instance = await gateway.instance();
  const config = productionPoolConfiguration(process.env, process.env.EBS_ORG_INSTANCE_ID || instance.id);
  const connection = process.env.EBS_ORG_DATABASE_URL || process.env.EBS_DRIVE_DATABASE_URL;
  if (!connection) throw Error('configuration');
  const bootstrap = createOrganizationBootstrap({ gateway, config, store: neonOrganizationStore(connection, config.instanceId) });
  const apply = process.argv.includes('--apply');
  const confirmation = process.argv.find(arg => arg.startsWith('--confirm-instance='))?.split('=', 2)[1];
  const report = apply ? await bootstrap.apply(confirmation || '') : await bootstrap.report();
  console.log(JSON.stringify(report, null, 2));
} catch {
  console.error('Bootstrap unavailable: verify Production live keys, the replacement Team ID, seed IDs, trusted HTTPS origin, and private database access. No Clerk accounts, organizations, or invitations were changed.');
  process.exitCode = 1;
} finally { await vite.close(); }
