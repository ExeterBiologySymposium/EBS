import { clerkConfiguration } from '../clerk-config.js';
import { createClerkOrganizationGateway } from './clerk.js';
import { createOrganizationService } from './service.js';
import { neonOrganizationStore } from './store.js';
import { OrganizationProblem, type PoolConfiguration } from './types.js';

export function productionPoolConfiguration(env: Record<string, string | undefined>, expectedInstance = env.EBS_ORG_INSTANCE_ID): PoolConfiguration {
  const publishableKey = env.VITE_CLERK_PUBLISHABLE_KEY || env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const ids = [env.CLERK_TEAM_ORG_ID, env.CLERK_PENDING_ORG_ID, env.CLERK_ACCEPTED_ORG_ID];
  if (env.VERCEL_ENV !== 'production' || !env.CLERK_SECRET_KEY?.startsWith('sk_live_') || !publishableKey?.startsWith('pk_live_') || !expectedInstance?.match(/^ins_[a-zA-Z0-9]+$/) || !ids.every(id => /^org_[a-zA-Z0-9]+$/.test(id || '')) || new Set(ids).size !== 3) throw new OrganizationProblem('configuration');
  return { instanceId: expectedInstance, teamId: ids[0]!, pendingId: ids[1]!, acceptedId: ids[2]!, rollover: env.EBS_ORG_ROLLOVER_ENABLED === 'true' };
}
export function organizationRuntime() {
  if (process.env.EBS_ORG_POOLS_ENABLED !== 'true') throw new OrganizationProblem('configuration');
  const config = productionPoolConfiguration(process.env);
  const { client, origins, publishableKey } = clerkConfiguration();
  const origin = new URL(origins[0]);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.origin !== origins[0]) throw new OrganizationProblem('configuration');
  const connection = process.env.EBS_ORG_DATABASE_URL || process.env.EBS_DRIVE_DATABASE_URL;
  if (!connection) throw new OrganizationProblem('configuration');
  const gateway = createClerkOrganizationGateway(client, new URL('/accept-invitation.html', origin).href, publishableKey);
  const store = neonOrganizationStore(connection, config.instanceId);
  return { config, gateway, store, service: createOrganizationService({ config, gateway, store }) };
}
