import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { createFolderHandlers, provisionFolder, googleRecipient } = await vite.ssrLoadModule('/server/participant-folders.ts');
  const google = email => ({ provider: 'google', emailAddress: email, verification: { status: 'verified' } });
  assert.equal(googleRecipient({ externalAccounts: [google('student@example.com')] }), 'student@example.com');
  assert.equal(googleRecipient({ externalAccounts: [{ ...google('student@example.com'), verification: null }] }), null);
  assert.equal(googleRecipient({ externalAccounts: [google('one@example.com'), google('two@example.com')] }), null);
  assert.equal(googleRecipient({ externalAccounts: [{ ...google('student@example.com'), provider: 'github' }] }), null);
  let mutations = 0;
  const dep = { authenticate: async () => 'self', membership: async () => 'accepted', recipient: async () => 'student@example.com', store: {}, drive: {} };
  const req = (method = 'POST', origin = 'https://ebs.test') => new Request('https://ebs.test/api/participant-folder', { method, headers: { origin }, ...(method === 'POST' ? { body: JSON.stringify({ userId: 'victim', email: 'attacker@example.com', parent: 'evil' }) } : {}) });
  for (const [overrides, status] of [[{ authenticate: async () => null }, 401], [{ membership: async () => 'pending' }, 403], [{ recipient: async () => null }, 409]]) {
    const response = await createFolderHandlers({ ...dep, ...overrides }).fetch(req());
    assert.equal(response.status, status);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  assert.equal((await createFolderHandlers(dep).fetch(req('POST', 'https://evil.test'))).status, 403);
  assert.equal((await createFolderHandlers(dep).fetch(req('DELETE'))).status, 405);
  assert.equal((await createFolderHandlers({ ...dep, authenticate: async () => { throw Error('secret'); } }).fetch(req())).status, 503);

  function fixture(failAt) {
    let row = null, locked = false, copied = null;
    const calls = [];
    const store = {
      async get() { return row && { ...row }; },
      async ensure(userId, email, folderId) { row ||= { userId, email, folderId, documentId: null, copyStarted: false, ready: false }; },
      async claim() { if (locked) return null; locked = true; return 'claim'; },
      async release() { locked = false; },
      async startCopy() { if (row.copyStarted) return false; row.copyStarted = true; return true; },
      async document(_user, _claim, id) { row.documentId = id; },
      async complete() { row.ready = true; },
    };
    const drive = {
      async preflight() { calls.push('preflight'); if (failAt === 'preflight') throw Error('no access'); },
      async generateFolderId() { return 'folder-1'; },
      async ensureFolder(id) { calls.push('folder'); assert.equal(id, 'folder-1'); if (failAt === 'folder') throw Error('temporary'); },
      async findDocument() { calls.push('find'); return copied; },
      async copyDocument() { calls.push('copy'); mutations++; if (failAt === 'copy-before') throw Error('timeout'); copied = 'doc-1'; if (failAt === 'copy-after') throw Error('timeout'); return copied; },
      async shareFolder(_id, email) { calls.push('share'); assert.equal(email, 'student@example.com'); if (failAt === 'share') throw Error('temporary'); },
      async validateDocument() { calls.push('validate'); },
    };
    return { store, drive, calls, recover() { failAt = null; }, row: () => row };
  }
  const success = fixture();
  const provision = f => provisionFolder('self', 'student@example.com', f.store, f.drive);
  const result = await provision(success);
  assert.equal(result.state, 'ready');
  assert.equal(result.folderUrl, 'https://drive.google.com/drive/folders/folder-1');
  assert.equal(result.documentUrl, 'https://docs.google.com/document/d/doc-1/edit');
  assert.equal((await provision(success)).state, 'ready');
  assert.equal(success.calls.filter(x => x === 'copy').length, 1);
  const concurrent = fixture();
  await Promise.all([provision(concurrent), provision(concurrent), provision(concurrent)]);
  assert.equal(concurrent.calls.filter(x => x === 'copy').length, 1);
  for (const step of ['preflight', 'folder', 'copy-after', 'share']) {
    const f = fixture(step);
    await assert.rejects(provision(f));
    f.recover();
    assert.equal((await provision(f)).state, 'ready', step);
    assert.equal(f.calls.filter(x => x === 'copy').length, 1, step);
  }
  const uncertain = fixture('copy-before');
  await assert.rejects(provision(uncertain));
  uncertain.recover();
  assert.equal((await provision(uncertain)).state, 'needs-review');
  assert.equal(uncertain.calls.filter(x => x === 'copy').length, 1);
  const changed = fixture();
  await provision(changed);
  assert.equal((await provisionFolder('self', 'other@example.com', changed.store, changed.drive)).state, 'identity-changed');
  assert.equal(changed.calls.filter(x => x === 'share').length, 1);
  let captured;
  const f = fixture();
  const originalEnsure = f.store.ensure;
  f.store.ensure = async (...args) => { captured = args; return originalEnsure(...args); };
  assert.equal((await createFolderHandlers({ ...dep, ...f }).fetch(req())).status, 200);
  assert.deepEqual(captured.slice(0, 2), ['self', 'student@example.com']);
  const readOnly = fixture();
  const status = await createFolderHandlers({ ...dep, ...readOnly }).fetch(req('GET'));
  assert.deepEqual(await status.json(), { state: 'empty' });
  assert.deepEqual(readOnly.calls, [], 'GET must not create or share Google resources');
  const { default: api } = await vite.ssrLoadModule('/api/participant-folder.ts');
  const enabled = process.env.EBS_DRIVE_ENABLED;
  try {
    process.env.EBS_DRIVE_ENABLED = 'false';
    const disabled = await api.fetch(req());
    assert.equal(disabled.status, 503);
    assert.deepEqual(await disabled.json(), { state: 'unavailable' });
    assert.match(disabled.headers.get('cache-control'), /no-store/);
  } finally {
    if (enabled === undefined) delete process.env.EBS_DRIVE_ENABLED;
    else process.env.EBS_DRIVE_ENABLED = enabled;
  }
  assert(mutations > 0);
  console.log('PASS: participant authorization, Google identity, fixed ownership, concurrency, retry recovery, uncertain-copy protection, and private responses.');
} finally { await vite.close(); }
