export function fixture(createService) {
  const pools = [
    { kind: 'pending', ordinal: 1, operationId: 'seed-pending', organizationId: 'org_pending', state: 'ready' },
    { kind: 'accepted', ordinal: 1, operationId: 'seed-accepted', organizationId: 'org_accepted', state: 'ready' },
  ];
  const operations = new Map(); let lease = null;
  const store = {
    list: async () => structuredClone(pools),
    acquire: async () => { if (lease) return null; lease = crypto.randomUUID(); return lease; },
    fence: async token => { if (token !== lease) throw Error('lease lost'); },
    release: async token => { if (token === lease) lease = null; },
    savePool: async (row, token) => { await store.fence(token); const index = pools.findIndex(p => p.operationId === row.operationId); if (index < 0) pools.push(structuredClone(row)); else pools[index] = structuredClone(row); },
    getOperation: async key => structuredClone(operations.get(key) || null),
    saveOperation: async (key, operation, token) => { await store.fence(token); operations.set(key, structuredClone(operation)); },
    seed: async rows => { pools.push(...rows); },
  };
  const organizations = new Map([
    ['org_pending', { id: 'org_pending', name: 'Pending', limit: 20, metadata: {}, members: [], invitations: [] }],
    ['org_accepted', { id: 'org_accepted', name: 'Accepted', limit: 20, metadata: {}, members: [], invitations: [] }],
    ['org_team', { id: 'org_team', name: 'EBS Team', limit: 20, metadata: {}, members: [{ userId: 'user_staff', identifier: 'staff@example.test', name: 'Staff', joinedAt: 1, role: 'org:member' }], invitations: [] }],
  ]);
  const users = new Map([['user_student', { id: 'user_student', name: 'Student', verifiedEmails: ['student@example.test'] }]]);
  const calls = [];
  const gateway = {
    instance: async () => ({ id: 'ins_production', environmentType: 'production' }),
    organizations: async () => [...organizations.values()].map(({ members, invitations, ...org }) => structuredClone(org)),
    organization: async id => { if (!organizations.has(id)) throw Object.assign(Error('not found'), { status: 404 }); const { members, invitations, ...org } = organizations.get(id); return structuredClone(org); },
    seatUsage: async id => { const org = organizations.get(id); return { limit: org.limit, members: org.members.length, invitations: org.invitations.length }; },
    members: async id => structuredClone(organizations.get(id).members),
    invitations: async id => structuredClone(organizations.get(id).invitations),
    user: async id => { if (!users.has(id)) throw Object.assign(Error('not found'), { status: 404 }); return structuredClone(users.get(id)); },
    findUser: async email => [...users.values()].find(user => user.verifiedEmails.includes(email)) || null,
    userMemberships: async id => [...organizations.values()].filter(org => org.members.some(member => member.userId === id)).map(org => org.id),
    createOrganization: async (kind, ordinal, metadata) => { const id = 'org_created' + ordinal + kind; calls.push(['create', kind]); organizations.set(id, { id, name: `EBS ${kind} ${ordinal}`, limit: 20, metadata, members: [], invitations: [] }); return id; },
    addMember: async (organizationId, userId) => { calls.push(['add', organizationId, userId]); const org = organizations.get(organizationId); if (org.members.length + org.invitations.length >= org.limit) throw Object.assign(Error('quota'), { status: 403, code: 'organization_membership_quota_exceeded' }); if (!org.members.some(member => member.userId === userId)) org.members.push({ userId, name: users.get(userId)?.name || '', identifier: users.get(userId)?.verifiedEmails[0] || userId, joinedAt: Date.now(), role: 'org:member' }); },
    removeMember: async (organizationId, userId) => { calls.push(['remove', organizationId, userId]); const org = organizations.get(organizationId); org.members = org.members.filter(member => member.userId !== userId); },
    invite: async (organizationId, email, metadata) => { calls.push(['invite', organizationId, email]); const org = organizations.get(organizationId); if (org.members.length + org.invitations.length >= org.limit) throw Object.assign(Error('quota'), { status: 403, code: 'organization_membership_quota_exceeded' }); org.invitations.push({ id: 'inv_' + crypto.randomUUID(), email, createdAt: Date.now(), expiresAt: Date.now() + 86400000, metadata }); },
    revokeInvitation: async (organizationId, id) => { const org = organizations.get(organizationId); org.invitations = org.invitations.filter(invite => invite.id !== id); },
  };
  const config = { instanceId: 'ins_production', teamId: 'org_team', pendingId: 'org_pending', acceptedId: 'org_accepted', rollover: true };
  const service = createService({ store, gateway, config });
  return { service, gateway, store, config, pools, operations, organizations, users, calls };
}
