import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let createOrganizationStore;
try { ({ createOrganizationStore } = await vite.ssrLoadModule('/server/orgs/store.ts')); } finally { await vite.close(); }
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); } catch { /* Optional local PostgreSQL test runtime. */ }
test('PostgreSQL constraints, cross-instance isolation, lease fencing and journal recovery', { skip: !PGlite && 'Install an isolated PostgreSQL-compatible test runtime to run SQL checks.' }, async () => {
  const database = new PGlite();
  try {
    await database.exec(await readFile(new URL('./sql/organization-pools.sql', import.meta.url), 'utf8'));
    const query = async (text, params) => (await database.query(text, params)).rows;
    const a = createOrganizationStore(query, 'ins_a'), b = createOrganizationStore(query, 'ins_b');
    const claims = await Promise.all(Array.from({ length: 6 }, () => a.acquire()));
    assert.equal(claims.filter(Boolean).length, 1);
    const token = claims.find(Boolean), otherToken = await b.acquire();
    const row = { kind: 'accepted', ordinal: 1, operationId: 'op_1', organizationId: 'org_a', state: 'ready' };
    await a.savePool(row, token);
    assert.equal((await a.list()).length, 1); assert.equal((await b.list()).length, 0);
    await assert.rejects(() => a.savePool({ ...row, ordinal: 2 }, token));
    await a.saveOperation('user:one', { id: 'op_member', kind: 'member', destination: 'accepted', organizationId: 'org_a', phase: 'submitted', userId: 'user_one' }, token);
    assert.equal((await a.getOperation('user:one')).phase, 'submitted');
    assert.equal(await b.getOperation('user:one'), null);
    await database.query("UPDATE ebs_org_allocator_leases SET expires_at=now()-interval '1 second' WHERE instance_id=$1", ['ins_a']);
    const replacement = await a.acquire(); assert(replacement); assert.notEqual(replacement, token);
    await assert.rejects(() => a.saveOperation('user:one', { id: 'overwritten' }, token), error => error.state === 'processing');
    await a.release(token); assert.equal(await a.acquire(), null, 'stale release cannot unlock the new lease');
    await assert.rejects(() => a.savePool({ ...row, state: 'needs-review', organizationId: null }, replacement), error => error.state === 'processing');
    await a.fence(replacement);
    await a.release(replacement); assert(await a.acquire());
    await b.release(otherToken);
  } finally { await database.close(); }
});
