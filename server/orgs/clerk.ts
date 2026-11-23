import type { createClerkClient } from '@clerk/backend';
import { OrganizationProblem, type OrganizationGateway, type User } from './types.js';

type Client = ReturnType<typeof createClerkClient>;
async function pages<T>(read: (offset: number) => Promise<{ data: T[]; totalCount: number }>): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await read(offset); result.push(...page.data);
    if (!page.data.length || offset + page.data.length >= page.totalCount) return result;
  }
}
function userData(user: Awaited<ReturnType<Client['users']['getUser']>>): User {
  return { id: user.id, name: [user.firstName, user.lastName].filter(Boolean).join(' '), verifiedEmails: user.emailAddresses.filter(email => email.verification?.status === 'verified').map(email => email.emailAddress.toLowerCase()) };
}
export function createClerkOrganizationGateway(client: Client, redirectUrl: string, publishableKey: string): OrganizationGateway {
  const organizationData = (org: Awaited<ReturnType<Client['organizations']['getOrganization']>>) => ({ id: org.id, name: org.name, limit: org.maxAllowedMemberships, metadata: (org.privateMetadata || {}) as Record<string, unknown> });
  return {
    async instance() {
      const [instance, domains] = await Promise.all([client.instance.get(), client.domains.list()]);
      const host = Buffer.from(publishableKey.replace(/^pk_live_/, ''), 'base64').toString().replace(/\$$/, '');
      if (!publishableKey.startsWith('pk_live_') || !/^[a-zA-Z0-9.-]+$/.test(host) || !domains.data.some(domain => new URL(domain.frontendApiUrl.startsWith('https://') ? domain.frontendApiUrl : 'https://' + domain.frontendApiUrl).hostname === host)) throw new OrganizationProblem('configuration');
      return instance;
    },
    async organization(id) { return organizationData(await client.organizations.getOrganization({ organizationId: id })); },
    async seatUsage(id) {
      const [org, members, invitations] = await Promise.all([
        client.organizations.getOrganization({ organizationId: id }),
        client.organizations.getOrganizationMembershipList({ organizationId: id, limit: 1 }),
        client.organizations.getOrganizationInvitationList({ organizationId: id, status: ['pending'], limit: 1 }),
      ]);
      return { limit: org.maxAllowedMemberships, members: members.totalCount, invitations: invitations.totalCount };
    },
    async organizations() { return (await pages(offset => client.organizations.getOrganizationList({ limit: 100, offset }))).map(organizationData); },
    async members(id) {
      return (await pages(offset => client.organizations.getOrganizationMembershipList({ organizationId: id, limit: 100, offset }))).filter(member => member.publicUserData?.userId).map(member => ({ userId: member.publicUserData!.userId, name: [member.publicUserData!.firstName, member.publicUserData!.lastName].filter(Boolean).join(' '), identifier: member.publicUserData!.identifier, joinedAt: member.createdAt }));
    },
    async invitations(id) {
      return (await pages(offset => client.organizations.getOrganizationInvitationList({ organizationId: id, status: ['pending'], limit: 100, offset }))).map(invite => ({ id: invite.id, email: invite.emailAddress, createdAt: invite.createdAt, expiresAt: invite.expiresAt, metadata: (invite.privateMetadata || {}) as Record<string, unknown> }));
    },
    async user(id) { return userData(await client.users.getUser(id)); },
    async findUser(email) {
      // Exact verified matching after the provider filter; never trust a partial/alias hit.
      const matches = (await pages(offset => client.users.getUserList({ emailAddress: [email], limit: 100, offset }))).map(userData).filter(user => user.verifiedEmails.includes(email.toLowerCase()));
      if (matches.length > 1) throw new OrganizationProblem('ambiguous-account', 409);
      return matches[0] || null;
    },
    async userMemberships(id) { return (await pages(offset => client.users.getOrganizationMembershipList({ userId: id, limit: 100, offset }))).map(member => member.organization.id); },
    async createOrganization(kind, ordinal, privateMetadata) {
      return (await client.organizations.createOrganization({ name: `EBS ${kind === 'pending' ? 'Pending' : 'Accepted'} ${String(ordinal).padStart(3, '0')}`, maxAllowedMemberships: 20, privateMetadata })).id;
    },
    async addMember(organizationId, userId) { await client.organizations.createOrganizationMembership({ organizationId, userId, role: 'org:member' }); },
    async removeMember(organizationId, userId) { await client.organizations.deleteOrganizationMembership({ organizationId, userId }); },
    async invite(organizationId, emailAddress, privateMetadata) {
      // inviterUserId must administer the destination. Team authority is separate;
      // use the optional backend inviter and retain the verified actor privately.
      await client.organizations.createOrganizationInvitation({ organizationId, emailAddress, role: 'org:member', privateMetadata, redirectUrl });
    },
    async revokeInvitation(organizationId, invitationId) { await client.organizations.revokeOrganizationInvitation({ organizationId, invitationId }); },
  };
}
