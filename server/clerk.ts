import { createClerkClient } from '@clerk/backend';
import type { AccessDependencies, Membership } from './access.js';

function configuration() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const accepted = process.env.CLERK_ACCEPTED_ORG_ID;
  const pending = process.env.CLERK_PENDING_ORG_ID;
  const origins = (process.env.CLERK_AUTHORIZED_PARTIES || '').split(',').map(value => value.trim()).filter(Boolean);
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  if (!secretKey || !publishableKey || !accepted || !pending || accepted === pending || !origins.length) throw new Error('Member access configuration is incomplete.');
  const client = createClerkClient({ secretKey, publishableKey });
  return { client, accepted, pending, origins };
}
async function membership(userId: string): Promise<Membership> {
  const { client, accepted, pending } = configuration();
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
  async authenticate(request) {
    const { client, origins } = configuration();
    const state = await client.authenticateRequest(request, { authorizedParties: origins, acceptsToken: 'session_token' });
    return state.isAuthenticated ? state.toAuth().userId : null;
  },
  membership,
  async enrollPending(userId) {
    const { client, pending } = configuration();
    try { await client.organizations.createOrganizationMembership({ organizationId: pending, userId, role: 'org:member' }); }
    catch (error) {
      // Two tabs may enroll simultaneously; only ignore an already-existing membership.
      if (await membership(userId) === 'unassigned') throw error;
    }
  },
};
