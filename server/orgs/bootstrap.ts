import { OrganizationProblem, type OrganizationGateway, type OrganizationStore, type PoolConfiguration } from './types.js';

export function createOrganizationBootstrap({ gateway, store, config }: { gateway: OrganizationGateway; store: OrganizationStore; config: PoolConfiguration }) {
  async function report() {
    const instance = await gateway.instance();
    if (instance.environmentType !== 'production' || instance.id !== config.instanceId) throw new OrganizationProblem('configuration');
    const [team, pending, accepted, organizations] = await Promise.all([gateway.organization(config.teamId), gateway.organization(config.pendingId), gateway.organization(config.acceptedId), gateway.organizations()]);
    if (new Set([team.id, pending.id, accepted.id]).size !== 3) throw new OrganizationProblem('configuration');
    let registry = null;
    try { registry = await store.list(); }
    catch (error) { if ((error as { code?: string }).code !== '42P01') throw error; }
    const seeds = await Promise.all([pending, accepted].map(async org => { const usage = await gateway.seatUsage(org.id); return { id: org.id, name: org.name, currentLimit: usage.limit, suggestedLimit: 20, members: usage.members, invitations: usage.invitations }; }));
    return { instanceId: instance.id, environment: instance.environmentType, team: { id: team.id, name: team.name }, seeds, organizationCount: organizations.length, ceiling: 100, schemaReady: registry !== null, registry, changesApplied: false };
  }
  return {
    report,
    async apply(confirmation: string) {
      const preview = await report();
      if (confirmation !== preview.instanceId || !preview.schemaReady) throw new OrganizationProblem('configuration');
      const token = await store.acquire();
      if (!token) throw new OrganizationProblem('processing', 202);
      try {
        await store.seed([
          { kind: 'pending', ordinal: 1, operationId: 'seed-pending', organizationId: config.pendingId, state: 'ready' },
          { kind: 'accepted', ordinal: 1, operationId: 'seed-accepted', organizationId: config.acceptedId, state: 'ready' },
        ], token);
        return { ...preview, changesApplied: true };
      } finally { await store.release(token); }
    },
  };
}
