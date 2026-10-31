import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';
import { OrganizationProblem, type Operation, type OrganizationStore, type Pool } from './types.js';

type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
export function createOrganizationStore(query: Query, instanceId: string): OrganizationStore {
  const run = (text: string, params: unknown[] = []) => query(text, [instanceId, ...params]);
  async function mutation(text: string, params: unknown[], token: string) {
    // Every mutation is fenced in the same SQL statement, even after a worker's lease expires.
    const condition = `EXISTS (SELECT 1 FROM ebs_org_allocator_leases WHERE instance_id=$1 AND token=$${params.length + 2}::uuid AND expires_at>now())`;
    if (!(await run(text.replace('/* lease */', condition), [...params, token])).length) throw new OrganizationProblem('processing', 202);
  }
  const store: OrganizationStore = {
    async list() {
      const rows = await run('SELECT * FROM ebs_org_registry WHERE instance_id=$1 ORDER BY kind,ordinal');
      return rows.map(row => ({ kind: row.kind, ordinal: Number(row.ordinal), operationId: row.operation_id, organizationId: row.organization_id, state: row.state }) as Pool);
    },
    async acquire() {
      const token = randomUUID();
      const rows = await run("INSERT INTO ebs_org_allocator_leases (instance_id,token,expires_at) VALUES ($1,$2::uuid,now()+interval '120 seconds') ON CONFLICT (instance_id) DO UPDATE SET token=EXCLUDED.token,expires_at=EXCLUDED.expires_at WHERE ebs_org_allocator_leases.expires_at<now() RETURNING token", [token]);
      return rows.length ? token : null;
    },
    async fence(token) {
      if (!(await run("UPDATE ebs_org_allocator_leases SET expires_at=now()+interval '120 seconds' WHERE instance_id=$1 AND token=$2::uuid AND expires_at>now() RETURNING token", [token])).length) throw new OrganizationProblem('processing', 202);
    },
    async release(token) { await run("UPDATE ebs_org_allocator_leases SET expires_at=now()-interval '1 second' WHERE instance_id=$1 AND token=$2::uuid", [token]); },
    async savePool(row, token) {
      await mutation(`INSERT INTO ebs_org_registry (instance_id,kind,ordinal,operation_id,organization_id,state)
        SELECT $1,$2,$3,$4,$5,$6 WHERE /* lease */
        ON CONFLICT (instance_id,kind,ordinal) DO UPDATE SET organization_id=EXCLUDED.organization_id,state=EXCLUDED.state,updated_at=now()
        WHERE ebs_org_registry.operation_id=EXCLUDED.operation_id
        AND (ebs_org_registry.organization_id IS NULL OR ebs_org_registry.organization_id=EXCLUDED.organization_id)
        AND (ebs_org_registry.state<>'ready' OR EXCLUDED.state='ready') RETURNING operation_id`, [row.kind, row.ordinal, row.operationId, row.organizationId, row.state], token);
    },
    async getOperation(key) {
      const [row] = await run('SELECT body FROM ebs_org_operations WHERE instance_id=$1 AND subject_key=$2', [key]);
      return row ? row.body as Operation : null;
    },
    async saveOperation(key, operation, token) {
      await mutation(`INSERT INTO ebs_org_operations (instance_id,subject_key,operation_id,body)
        SELECT $1,$2,$3,$4::jsonb WHERE /* lease */
        ON CONFLICT (instance_id,subject_key) DO UPDATE SET operation_id=EXCLUDED.operation_id,body=EXCLUDED.body,updated_at=now() RETURNING operation_id`, [key, operation.id, JSON.stringify(operation)], token);
    },
    async seed(rows, token) { for (const row of rows) await store.savePool(row, token); },
  };
  return store;
}
export function neonOrganizationStore(connection: string, instanceId: string): OrganizationStore {
  const sql = neon(connection);
  return createOrganizationStore((text, params) => sql.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(10000) } }), instanceId);
}
