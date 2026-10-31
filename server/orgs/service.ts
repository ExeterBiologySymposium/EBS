import { randomUUID } from 'node:crypto';
import { OrganizationProblem, type Destination, type OrganizationGateway, type OrganizationStore, type Pool, type PoolConfiguration, type Operation, type Result, type Page } from './types.js';

const normalize = (email: string) => email.trim().toLowerCase();
const errorStatus = (error: unknown) => Number((error as { status?: number })?.status || 0);
function quota(error: unknown): boolean {
  const value = error as { code?: string; errors?: { code?: string }[] };
  return [value?.code, ...value?.errors?.map(item => item.code) || []].includes('organization_membership_quota_exceeded');
}
function providerProblem(error: unknown): OrganizationProblem {
  return new OrganizationProblem(errorStatus(error) === 429 ? 'rate-limited' : 'unavailable', errorStatus(error) === 429 ? 429 : 503);
}
async function parallel<T, U>(values: T[], action: (value: T) => Promise<U>): Promise<U[]> {
  const result: U[] = [];
  for (let i = 0; i < values.length; i += 4) result.push(...await Promise.all(values.slice(i, i + 4).map(action)));
  return result;
}
function paginate<T>(data: T[], context: string, cursor?: string | null): Page<T> {
  let offset = 0;
  if (cursor) {
    try {
      if (cursor.length > 200) throw Error();
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
      if (decoded.context !== context || !Number.isSafeInteger(decoded.offset) || decoded.offset < 0 || decoded.offset > 1_000_000) throw Error();
      offset = decoded.offset;
    } catch { throw new OrganizationProblem('invalid-request', 400); }
  }
  if (offset >= data.length) offset = Math.max(0, Math.floor((data.length - 1) / 25) * 25);
  const encode = (value: number) => Buffer.from(JSON.stringify({ context, offset: value })).toString('base64url');
  return { data: data.slice(offset, offset + 25), totalCount: data.length, offset, nextCursor: offset + 25 < data.length ? encode(offset + 25) : null, previousCursor: offset ? encode(Math.max(0, offset - 25)) : null };
}

export function createOrganizationService({ store, gateway, config }: { store: OrganizationStore; gateway: OrganizationGateway; config: PoolConfiguration }) {
  async function production() {
    const instance = await gateway.instance();
    if (instance.environmentType !== 'production' || instance.id !== config.instanceId || new Set([config.teamId, config.pendingId, config.acceptedId]).size !== 3) throw new OrganizationProblem('configuration');
  }
  async function pools() {
    const rows = await store.list();
    if (!rows.some(row => row.kind === 'pending' && row.organizationId === config.pendingId && row.state === 'ready') || !rows.some(row => row.kind === 'accepted' && row.organizationId === config.acceptedId && row.state === 'ready') || rows.some(row => row.organizationId === config.teamId)) throw new OrganizationProblem('configuration');
    return rows;
  }
  async function isTeam(userId: string) { await production(); return (await gateway.userMemberships(userId)).includes(config.teamId); }
  async function write<T>(actor: string | null, action: (token: string) => Promise<T>): Promise<T> {
    await production();
    if (actor && !await isTeam(actor)) throw new OrganizationProblem('forbidden', 403);
    await pools();
    const token = await store.acquire();
    if (!token) throw new OrganizationProblem('processing', 202);
    try { return await action(token); }
    finally { await store.release(token); }
  }
  async function memberships(userId: string) {
    const [rows, ids] = await Promise.all([pools(), gateway.userMemberships(userId)]);
    return rows.filter(row => row.state === 'ready' && row.organizationId && ids.includes(row.organizationId));
  }
  async function occupancy(row: Pool) {
    const usage = await gateway.seatUsage(row.organizationId!);
    const limit = usage.limit === 0 ? 20 : Math.min(20, usage.limit);
    return usage.members + usage.invitations < limit;
  }
  async function allInvitations() {
    const rows = (await pools()).filter(row => row.state === 'ready');
    return (await parallel(rows, async row => (await gateway.invitations(row.organizationId!)).map(invite => ({ ...invite, organizationId: row.organizationId!, destination: row.kind })))).flat();
  }
  async function recoverPools(token: string) {
    const unresolved = (await pools()).filter(row => row.state === 'creating' || row.state === 'needs-review');
    if (!unresolved.length) return;
    const organizations = await gateway.organizations();
    for (const row of unresolved) {
      const matches = organizations.filter(org => org.metadata.ebsOperationId === row.operationId && org.metadata.ebsInstanceId === config.instanceId && org.metadata.ebsDestination === row.kind);
      if (matches.length === 1 && matches[0].limit === 20 && matches[0].id !== config.teamId) await store.savePool({ ...row, state: 'ready', organizationId: matches[0].id }, token);
    }
  }
  async function destination(kind: Destination, excluded: Set<string>, token: string) {
    await recoverPools(token);
    const rows = await pools();
    for (const row of rows.filter(row => row.state === 'ready' && row.kind === kind).sort((a, b) => a.ordinal - b.ordinal)) {
      if (!excluded.has(row.organizationId!) && await occupancy(row)) return row.organizationId!;
    }
    if (!config.rollover) throw new OrganizationProblem('capacity', 409);
    if (rows.some(row => row.kind === kind && ['creating', 'needs-review'].includes(row.state))) throw new OrganizationProblem('needs-review', 202);
    const organizations = await gateway.organizations();
    const reservations = rows.filter(row => ['creating', 'needs-review'].includes(row.state) && !organizations.some(org => org.metadata.ebsOperationId === row.operationId)).length;
    if (organizations.length + reservations >= 100) throw new OrganizationProblem('capacity', 409);
    const row: Pool = { kind, ordinal: Math.max(...rows.filter(row => row.kind === kind).map(row => row.ordinal)) + 1, operationId: randomUUID(), organizationId: null, state: 'creating' };
    await store.savePool(row, token);
    await store.fence(token);
    try {
      const id = await gateway.createOrganization(kind, row.ordinal, { ebsInstanceId: config.instanceId, ebsDestination: kind, ebsOperationId: row.operationId });
      await store.savePool({ ...row, organizationId: id, state: 'ready' }, token);
      return id;
    } catch (error) {
      if (error instanceof OrganizationProblem) throw error;
      const definitive = errorStatus(error) >= 400 && errorStatus(error) < 500;
      await store.savePool({ ...row, state: definitive ? 'failed' : 'needs-review' }, token);
      if (definitive) throw providerProblem(error);
      throw new OrganizationProblem('needs-review', 202);
    }
  }
  async function proved(operation: Operation) {
    if (!operation.organizationId) return false;
    return operation.kind === 'member' ? (await gateway.userMemberships(operation.userId!)).includes(operation.organizationId) : (await gateway.invitations(operation.organizationId)).some(invite => invite.metadata.ebsOperationId === operation.id && normalize(invite.email) === operation.email);
  }
  async function assign(kind: 'member' | 'invitation', group: Destination, subject: string, fields: { userId?: string; email?: string }, actor: string | null, token: string) {
    const old = await store.getOperation(subject);
    if (old && ['submitted', 'needs-review'].includes(old.phase)) {
      if (!await proved(old)) throw new OrganizationProblem('needs-review', 202);
      await store.saveOperation(subject, { ...old, phase: 'complete' }, token);
      if (old.destination === group) return;
    }
    const operation: Operation = { id: randomUUID(), kind, destination: group, organizationId: null, phase: 'planned', ...fields };
    const excluded = new Set<string>();
    for (let attempt = 0; attempt < 3; attempt++) {
      const organizationId = await destination(group, excluded, token);
      operation.organizationId = organizationId; operation.phase = 'submitted';
      await store.saveOperation(subject, operation, token);
      await store.fence(token);
      try {
        if (kind === 'member') await gateway.addMember(organizationId, fields.userId!);
        else await gateway.invite(organizationId, fields.email!, { ebsOperationId: operation.id, ebsInvitedBy: actor });
      } catch (error) {
        if (quota(error)) {
          excluded.add(organizationId); operation.phase = 'planned'; operation.organizationId = null;
          await store.saveOperation(subject, operation, token); continue;
        }
        if (!await proved(operation)) {
          const definitive = errorStatus(error) >= 400 && errorStatus(error) < 500;
          await store.saveOperation(subject, { ...operation, phase: definitive ? 'complete' : 'needs-review' }, token);
          if (definitive) throw providerProblem(error);
          throw new OrganizationProblem('needs-review', 202);
        }
      }
      await store.saveOperation(subject, { ...operation, phase: 'complete' }, token);
      return;
    }
    throw new OrganizationProblem('processing', 202);
  }
  async function cleanup(userId: string, token: string): Promise<boolean> {
    // Actual Accepted membership is the prerequisite for every destructive cleanup.
    if (!(await memberships(userId)).some(row => row.kind === 'accepted')) throw new OrganizationProblem('unavailable');
    try {
      for (const row of (await memberships(userId)).filter(row => row.kind === 'pending')) {
        await store.fence(token); await gateway.removeMember(row.organizationId!, userId);
      }
      const emails = (await gateway.user(userId)).verifiedEmails.map(normalize);
      for (const invite of (await allInvitations()).filter(invite => invite.destination === 'pending' && emails.includes(normalize(invite.email)))) {
        await store.fence(token); await gateway.revokeInvitation(invite.organizationId, invite.id);
      }
      return true;
    } catch {
      // A delete/revoke response can be lost after success. Reconcile the actual state.
      try {
        const current = await memberships(userId);
        const emails = (await gateway.user(userId)).verifiedEmails.map(normalize);
        return current.some(row => row.kind === 'accepted') && !current.some(row => row.kind === 'pending') && !(await allInvitations()).some(invite => invite.destination === 'pending' && emails.includes(normalize(invite.email)));
      } catch { return false; }
    }
  }
  async function add(userId: string, email: string | null, group: Destination, actor: string | null, pendingRequired = false): Promise<Result> {
    return write(actor, async token => {
      const user = await gateway.user(userId);
      if (email && !user.verifiedEmails.map(normalize).includes(normalize(email))) throw new OrganizationProblem('lookup-changed', 409);
      const current = await memberships(userId);
      const prior = await store.getOperation('user:' + userId);
      if (prior && ['submitted', 'needs-review'].includes(prior.phase) && current.some(row => row.organizationId === prior.organizationId)) await store.saveOperation('user:' + userId, { ...prior, phase: 'complete' }, token);
      if (current.some(row => row.kind === 'accepted')) {
        if (group === 'pending') return { state: 'already-accepted', destination: 'accepted' };
        const needed = current.some(row => row.kind === 'pending');
        return { state: await cleanup(userId, token) ? needed ? 'added' : 'already-member' : 'cleanup-needed', destination: group };
      }
      if (current.length && group === 'pending') return { state: 'already-member', destination: group };
      if (pendingRequired && !current.some(row => row.kind === 'pending')) throw new OrganizationProblem('not-pending', 409);
      await assign('member', group, 'user:' + userId, { userId }, actor, token);
      return { state: group === 'accepted' && !await cleanup(userId, token) ? 'cleanup-needed' : 'added', destination: group };
    });
  }
  return {
    isTeam,
    async membership(userId: string) { const rows = await memberships(userId); return rows.some(row => row.kind === 'accepted') ? 'accepted' as const : rows.length ? 'pending' as const : 'unassigned' as const; },
    async lookup(email: string) { const user = await gateway.findUser(normalize(email)); return user ? { mode: 'add' as const, userId: user.id, name: user.name, email: normalize(email) } : { mode: 'invite' as const, email: normalize(email) }; },
    add: (userId: string, email: string, group: Destination, actor: string) => add(userId, email, group, actor),
    accept: (userId: string, actor: string) => add(userId, null, 'accepted', actor, true),
    enroll: (userId: string) => add(userId, null, 'pending', null),
    async invite(email: string, group: Destination, actor: string): Promise<Result> {
      email = normalize(email);
      return write(actor, async token => {
        const duplicate = (await allInvitations()).find(invite => normalize(invite.email) === email);
        if (duplicate) {
          const prior = await store.getOperation('email:' + email);
          if (prior && duplicate.metadata.ebsOperationId === prior.id && duplicate.organizationId === prior.organizationId) await store.saveOperation('email:' + email, { ...prior, phase: 'complete' }, token);
          return { state: 'already-invited', destination: duplicate.destination };
        }
        const user = await gateway.findUser(email);
        if (user) throw new OrganizationProblem('lookup-changed', 409);
        await assign('invitation', group, 'email:' + email, { email }, actor, token);
        return { state: 'invited', destination: group };
      });
    },
    async availability() {
      const rows = await pools();
      const organizations = await gateway.organizations();
      const reservations = rows.filter(row => ['creating', 'needs-review'].includes(row.state) && !organizations.some(org => org.metadata.ebsOperationId === row.operationId)).length;
      const result = {} as Record<Destination, 'space-available' | 'will-create' | 'capacity-reached' | 'needs-review'>;
      for (const kind of ['pending', 'accepted'] as const) {
        const open = (await parallel(rows.filter(row => row.state === 'ready' && row.kind === kind), occupancy)).some(Boolean);
        result[kind] = open ? 'space-available' : rows.some(row => row.kind === kind && ['creating', 'needs-review'].includes(row.state)) ? 'needs-review' : config.rollover && organizations.length + reservations < 100 ? 'will-create' : 'capacity-reached';
      }
      return result;
    },
    async listMembers(group: Destination, cursor?: string | null) {
      const rows = (await pools()).filter(row => row.state === 'ready');
      const groups = await parallel(rows, async row => ({ row, members: await gateway.members(row.organizationId!) }));
      const users = new Map<string, { userId: string; name: string; identifier: string; joinedAt: number; pending: boolean; accepted: boolean }>();
      for (const { row, members: list } of groups) for (const member of list) {
        const value = users.get(member.userId) || { userId: member.userId, name: member.name, identifier: member.identifier, joinedAt: 0, pending: false, accepted: false };
        value[row.kind] = true;
        if (row.kind === group) value.joinedAt = Math.max(value.joinedAt, member.joinedAt);
        users.set(member.userId, value);
      }
      return paginate([...users.values()].filter(user => user[group]).sort((a, b) => b.joinedAt - a.joinedAt || a.userId.localeCompare(b.userId)), 'members:' + group, cursor);
    },
    async listInvitations(cursor?: string | null) {
      const map = new Map<string, { id: string; email: string; destination: Destination; createdAt: number; expiresAt: number }>();
      for (const invitation of (await allInvitations()).sort((a, b) => a.destination === b.destination ? b.createdAt - a.createdAt : a.destination === 'accepted' ? -1 : 1)) {
        const email = normalize(invitation.email);
        if (!map.has(email)) map.set(email, { id: invitation.id, email, destination: invitation.destination, createdAt: invitation.createdAt, expiresAt: invitation.expiresAt });
      }
      return paginate([...map.values()].sort((a, b) => b.createdAt - a.createdAt || a.email.localeCompare(b.email)), 'invitations', cursor);
    },
  };
}
export type OrganizationService = ReturnType<typeof createOrganizationService>;
