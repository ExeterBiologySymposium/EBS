import { authenticateClerk, clerkConfiguration } from './clerk-config.js';
import { organizationRuntime } from './orgs/runtime.js';
import type { AccessDependencies, Membership } from './access.js';
import { googleRecipient } from './participant-folders.js';

async function membership(userId: string): Promise<Membership> {
  if (process.env.EBS_ORG_POOLS_ENABLED === 'true') return organizationRuntime().service.membership(userId);
  const { client, accepted, pending } = clerkConfiguration();
  let hasPending = false;
  for (let offset = 0; ; offset += 100) {
    const page = await client.users.getOrganizationMembershipList({ userId, limit: 100, offset });
    if (page.data.some(member => member.organization.id === accepted)) return 'accepted';
    hasPending ||= page.data.some(member => member.organization.id === pending);
    if (offset + page.data.length >= page.totalCount || page.data.length === 0) break;
  }
  return hasPending ? 'pending' : 'unassigned';
}
export const clerkAccess: AccessDependencies = {
  authenticate: authenticateClerk,
  membership,
  async enrollPending(userId) {
    if (process.env.EBS_ORG_POOLS_ENABLED === 'true') { await organizationRuntime().service.enroll(userId); return; }
    const { client, pending } = clerkConfiguration();
    try { await client.organizations.createOrganizationMembership({ organizationId: pending, userId, role: 'org:member' }); }
    catch (error) {
      // Two tabs may enroll simultaneously; only ignore an already-existing membership.
      if (await membership(userId) === 'unassigned') throw error;
    }
  },
};

export async function participantGoogleEmail(userId: string): Promise<string | null> {
  const { client } = clerkConfiguration();
  return googleRecipient(await client.users.getUser(userId));
}
