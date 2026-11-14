import { authenticateClerk, clerkConfiguration } from './clerk-config.js';
import { organizationRuntime } from './orgs/runtime.js';
import type { AccessDependencies, Membership } from './access.js';
import { googleRecipient } from './participant-folders.js';
import { validFolderLink } from '../src/folder-link.js';

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

const folderLinkKey = 'ebsResearchFolderUrl';

async function folderUser(userId: string) {
  const { client } = clerkConfiguration();
  return client.users.getUser(userId);
}

export const participantFolderLinks = {
  async get(userId: string) {
    return validFolderLink((await folderUser(userId)).privateMetadata?.[folderLinkKey]);
  },
  async set(userId: string, folderUrl: string | null) {
    const { client } = clerkConfiguration();
    await client.users.updateUserMetadata(userId, { privateMetadata: { [folderLinkKey]: folderUrl } });
  },
};

export async function participantFolderSettings(userId: string) {
  const user = await folderUser(userId);
  const customUrl = validFolderLink(user.privateMetadata?.[folderLinkKey]);
  return { customUrl, googleEmail: customUrl ? null : googleRecipient(user) };
}
