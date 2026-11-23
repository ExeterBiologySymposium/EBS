import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { fixture } from './org-fixture.mjs';
import { participantDriveFixture } from './participant-drive-fixture.mjs';
const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let createAdminHandlers, createOrganizationService, productionPoolConfiguration, createClerkOrganizationGateway, createOrganizationBootstrap, driveConfiguration, createFolderHandlers;
try {
  ({ driveConfiguration } = await vite.ssrLoadModule('/server/drive/config.ts'));
  ({ createFolderHandlers } = await vite.ssrLoadModule('/server/participant-folders.ts'));
  ({ createOrganizationBootstrap } = await vite.ssrLoadModule('/server/orgs/bootstrap.ts'));
  ({ createAdminHandlers } = await vite.ssrLoadModule('/server/orgs/handlers.ts'));
  ({ createOrganizationService } = await vite.ssrLoadModule('/server/orgs/service.ts'));
  ({ createClerkOrganizationGateway } = await vite.ssrLoadModule('/server/orgs/clerk.ts'));
  ({ productionPoolConfiguration } = await vite.ssrLoadModule('/server/orgs/runtime.ts'));
} finally { await vite.close(); }
const get = query => new Request('https://ebs.test/api/team-admin?' + query);
const post = body => new Request('https://ebs.test/api/team-admin', { method: 'POST', headers: { Origin: 'https://ebs.test', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const noFolderLinks = { get: assert.fail, set: assert.fail };

test('the bulk folder roster includes all Accepted pools across pages and deduplicates accounts', async () => {
  const fix = fixture(createOrganizationService);
  const members = Array.from({ length: 28 }, (_, i) => ({ userId: 'user_student' + i, name: `Student ${i}`, identifier: `student${i}@example.test`, joinedAt: 100 - i }));
  fix.organizations.get('org_accepted').members.push(...members.slice(0, 20));
  fix.organizations.get('org_pending').members.push({ userId: 'user_pending', name: 'Pending', identifier: 'pending@example.test', joinedAt: 1 });
  fix.organizations.set('org_accepted2', { id: 'org_accepted2', members: [members[0], ...members.slice(20)] });
  fix.pools.push({ kind: 'accepted', ordinal: 2, operationId: 'second', organizationId: 'org_accepted2', state: 'ready' });
  let actor = 'user_staff';
  const handler = createAdminHandlers({ authenticate: async () => actor, service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks });
  const roster = () => handler.fetch(get('action=folder-roster'));
  const response = await roster();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.deepEqual((await response.json()).participants, members.map(({ userId, identifier }) => ({ userId, identifier })));
  assert.equal((await handler.fetch(get('action=folder-roster&group=pending'))).status, 400);
  fix.organizations.get('org_accepted').members = [];
  fix.organizations.get('org_accepted2').members = [];
  assert.deepEqual(await (await roster()).json(), { participants: [] });
  actor = null;
  assert.equal((await roster()).status, 401);
  actor = 'user_student0';
  assert.equal((await roster()).status, 403);
});

test('only fresh Team requests can provision folders for current Accepted participants', async () => {
  let actor = null;
  let membership = 'accepted';
  const service = { isTeam: async id => id === 'user_staff', membership: async () => membership };
  const researchFolders = { participant: assert.fail, googleFolder: assert.fail };
  const handler = createAdminHandlers({ authenticate: async () => actor, service, teamId: 'org_team', folderLinks: noFolderLinks, researchFolders });
  const create = () => post({ action: 'create-folder', userId: 'user_student' });
  assert.equal((await handler.fetch(create())).status, 401);
  actor = 'user_student';
  assert.equal((await handler.fetch(create())).status, 403);
  actor = 'user_staff';
  const crossOrigin = create();
  crossOrigin.headers.set('origin', 'https://other.test');
  assert.equal((await handler.fetch(crossOrigin)).status, 403);
  assert.equal((await handler.fetch(post({ action: 'create-folder', userId: 'user_student', email: 'override@example.test' }))).status, 400);
  membership = 'pending';
  const removed = await handler.fetch(create());
  assert.equal(removed.status, 409);
  assert.deepEqual(await removed.json(), { state: 'not-accepted' });
});

test('bulk provisioning skips custom and unlinked accounts and uses the Account folder record and claim', async () => {
  const { drive, store, records, shared } = participantDriveFixture();
  let beginCopy, finishCopy;
  const copyStarted = new Promise(resolve => { beginCopy = resolve; });
  const copyMayFinish = new Promise(resolve => { finishCopy = resolve; });
  const copy = drive.copyDocument;
  let copyCalls = 0;
  drive.copyDocument = async () => { copyCalls++; beginCopy(); await copyMayFinish; return copy(); };
  const participant = async id => ({
    customUrl: id === 'user_custom' ? 'https://example.test/custom' : null,
    googleEmail: id === 'user_unlinked' ? null : 'linked@example.test',
  });
  let driveRequests = 0;
  const researchFolders = { participant, googleFolder: () => { driveRequests++; return { drive, store }; } };
  const membership = async () => 'accepted';
  const handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: { isTeam: async () => true, membership }, teamId: 'org_team', folderLinks: noFolderLinks, researchFolders });
  const account = createFolderHandlers({ authenticate: async () => 'user_student', membership, ...researchFolders });
  const create = id => handler.fetch(post({ action: 'create-folder', userId: id }));
  const accountRequest = method => account.fetch(new Request('https://ebs.test/api/participant-folder', { method, headers: { Origin: 'https://ebs.test' } }));
  for (const [id, status, state] of [['user_custom', 200, 'custom'], ['user_unlinked', 409, 'link-google']]) {
    const skipped = await create(id);
    assert.equal(skipped.status, status);
    assert.deepEqual(await skipped.json(), { state });
  }
  assert.equal(driveRequests, 0);
  const firstAttempt = create('user_student');
  const result = await Promise.race([copyStarted.then(() => null), firstAttempt]);
  assert.equal(result, null, 'Admin should start the starter document copy');
  try {
    assert.equal((await accountRequest('POST')).status, 202);
    assert.deepEqual(await (await create('user_student')).json(), { state: 'processing' });
  } finally { finishCopy(); }
  assert.deepEqual(await (await firstAttempt).json(), { state: 'ready' });
  assert.deepEqual(await (await create('user_student')).json(), { state: 'ready' });
  assert.deepEqual(await (await accountRequest('GET')).json(), {
    state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/fixture-folder-1', documentUrl: 'https://docs.google.com/document/d/fixture-document-1/edit',
  });
  assert.equal(records.size, 1);
  assert.equal(copyCalls, 1);
  assert.deepEqual(shared, [{ folderId: 'fixture-folder-1', email: 'linked@example.test' }]);
  records.get('user_student').email = 'previous@example.test';
  assert.deepEqual(await (await create('user_student')).json(), { state: 'identity-changed' });
  assert.equal(shared.length, 1);
});

test('participant admin rejects the retired registration tracker action even for Team members', async () => {
  const service = fixture(createOrganizationService).service;
  const handler = createAdminHandlers({ authenticate: async () => 'user_staff', service, teamId: 'org_team', folderLinks: noFolderLinks, researchFolders: { participant: assert.fail, googleFolder: assert.fail } });
  const response = await handler.fetch(get('action=registration-tracker'));
  assert.equal(response.status, 400);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.deepEqual(await response.json(), { state: 'invalid-request' });
});

test('website approval provisions the Account folder after Accepted membership and reuses it on retry', async () => {
  const fix = fixture(createOrganizationService);
  await fix.service.enroll('user_student');
  const { drive, store, records, shared } = participantDriveFixture();
  const participants = [];
  const researchFolders = {
    async participant(userId) {
      assert.equal(await fix.service.membership(userId), 'accepted');
      participants.push(userId);
      return { customUrl: null, googleEmail: 'linked@example.test' };
    },
    googleFolder: () => ({ drive, store }),
  };
  const handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks, researchFolders });
  const accept = () => handler.fetch(post({ action: 'accept', userId: 'user_student' }));
  const response = await accept();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { state: 'added', destination: 'accepted', folderState: 'ready' });
  assert.deepEqual(await (await accept()).json(), { state: 'already-member', destination: 'accepted', folderState: 'ready' });
  assert.deepEqual(participants, ['user_student', 'user_student']);
  assert.equal(records.size, 1);
  assert.deepEqual(shared, [{ folderId: 'fixture-folder-1', email: 'linked@example.test' }]);

  const account = createFolderHandlers({ authenticate: async () => 'user_student', membership: fix.service.membership, ...researchFolders });
  const folder = await account.fetch(new Request('https://ebs.test/api/participant-folder'));
  assert.equal(folder.status, 200);
  assert.deepEqual(await folder.json(), {
    state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/fixture-folder-1', documentUrl: 'https://docs.google.com/document/d/fixture-document-1/edit',
  });
});

test('direct Accepted additions report folder follow-up without changing the approval result', async () => {
  for (const [customUrl, googleEmail, folderState] of [
    ['https://files.example.test/custom', 'linked@example.test', 'custom'],
    [null, null, 'link-google'],
    [null, 'linked@example.test', 'unavailable'],
  ]) {
    const fix = fixture(createOrganizationService);
    let driveRequests = 0;
    const researchFolders = {
      participant: async () => ({ customUrl, googleEmail }),
      googleFolder: () => { driveRequests++; throw Error('private Drive configuration'); },
    };
    const handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks, researchFolders });
    const add = destination => handler.fetch(post({ action: 'add', destination, userId: 'user_student', email: 'student@example.test' }));
    assert.deepEqual(await (await add('pending')).json(), { state: 'added', destination: 'pending' });
    const invite = await handler.fetch(post({ action: 'invite', destination: 'accepted', email: 'invitee@example.test' }));
    assert.deepEqual(await invite.json(), { state: 'invited', destination: 'accepted' });
    assert.equal(driveRequests, 0);
    const accepted = await add('accepted');
    assert.equal(accepted.status, 200);
    assert.deepEqual(await accepted.json(), { state: 'added', destination: 'accepted', folderState });
    assert.equal(await fix.service.membership('user_student'), 'accepted');
    assert.equal(driveRequests, folderState === 'unavailable' ? 1 : 0);
  }
});

test('Team can set, replace and clear a custom link for an Accepted participant', async () => {
  const fix = fixture(createOrganizationService);
  await fix.service.add('user_student', 'student@example.test', 'accepted', 'user_staff');
  const links = new Map([['user_other', 'https://files.example.test/other']]);
  const folderLinks = {
    get: async userId => links.get(userId) ?? null,
    set: async (userId, folderUrl) => folderUrl === null ? links.delete(userId) : links.set(userId, folderUrl),
  };
  const handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team', folderLinks });
  const read = () => handler.fetch(get('action=folder-link&userId=user_student'));
  assert.deepEqual(await (await read()).json(), { folderUrl: null });
  for (const folderUrl of [' https://files.example.test/research?a=1#notes ', 'http://example.test/new', null]) {
    const response = await handler.fetch(post({ action: 'folder-link', userId: 'user_student', folderUrl }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(await response.json(), { folderUrl: folderUrl?.trim() ?? null });
    assert.deepEqual(await (await read()).json(), { folderUrl: folderUrl?.trim() ?? null });
  }
  assert.deepEqual([...links], [['user_other', 'https://files.example.test/other']]);
});

test('folder link administration rejects unauthorized targets, unsafe URLs and cross-origin writes', async () => {
  let actor = 'user_staff';
  const service = { isTeam: async userId => userId === 'user_staff', membership: async userId => userId === 'user_student' ? 'accepted' : 'pending' };
  const folderLinks = { get: assert.fail, set: assert.fail };
  const handler = createAdminHandlers({ authenticate: async () => actor, service, teamId: 'org_team', folderLinks });
  const save = (folderUrl, userId = 'user_student') => post({ action: 'folder-link', userId, folderUrl });
  for (const [userId, status] of [[null, 401], ['user_student', 403]]) {
    actor = userId;
    assert.equal((await handler.fetch(get('action=folder-link&userId=user_student'))).status, status);
    assert.equal((await handler.fetch(save('https://example.test'))).status, status);
  }
  actor = 'user_staff';
  assert.equal((await handler.fetch(get('action=folder-link&userId=user_pending'))).status, 409);
  assert.equal((await handler.fetch(save('https://example.test', 'user_pending'))).status, 409);
  for (const url of ['/relative', '//example.test', 'javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.test', 'https://@example.test', 'https:///example.test', 'https://example.test/a b', 'https://example.test/' + 'a'.repeat(2048), {}]) {
    assert.equal((await handler.fetch(save(url))).status, 400, String(url).slice(0, 80));
  }
  const request = save('https://example.test');
  request.headers.set('origin', 'https://other.test');
  assert.equal((await handler.fetch(request)).status, 403);
});

test('Account returns only the signed-in Accepted participant’s assignment and skips Drive setup', async () => {
  let actor = 'user_student';
  let status = 'accepted';
  const readIds = [];
  const handler = createFolderHandlers({
    authenticate: async () => actor,
    membership: async () => status,
    participant: async userId => {
      readIds.push(userId);
      return { customUrl: 'https://files.example.test/research', googleEmail: null };
    },
    googleFolder: assert.fail,
  });
  for (const method of ['GET', 'POST']) {
    const response = await handler.fetch(new Request('https://ebs.test/api/participant-folder?userId=user_other', { method, headers: { Origin: 'https://ebs.test' } }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(await response.json(), { state: 'custom', folderUrl: 'https://files.example.test/research' });
  }
  status = 'pending';
  assert.equal((await handler.fetch(new Request('https://ebs.test/api/participant-folder'))).status, 403);
  actor = null;
  assert.equal((await handler.fetch(new Request('https://ebs.test/api/participant-folder'))).status, 401);
  assert.deepEqual(readIds, ['user_student', 'user_student']);
});

test('all administration endpoints freshly authorize Team and return private sanitized responses', async () => {
  for (const userId of [null, 'user_student', 'user_staff']) {
    const fix = fixture(createOrganizationService);
    if (userId === 'user_staff') fix.organizations.get('org_team').members = [];
    const handler = createAdminHandlers({ authenticate: async () => userId, service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks });
    for (const request of [get('action=status'), get('action=members&group=pending'), get('action=invitations'), get('action=availability'), post({ action: 'lookup', email: 'student@example.test' }), post({ action: 'accept', userId: 'user_student' })]) {
      const response = await handler.fetch(request);
      assert.equal(response.status, userId ? 403 : 401);
      assert.match(response.headers.get('cache-control'), /no-store/);
      const text = JSON.stringify(await response.json());
      assert(!text.includes('student@example.test'));
      assert(!text.includes('docs.google.com'));
    }
    assert.equal(fix.calls.length, 0);
  }
});
test('Team may look up/add/invite to both statuses; exact bodies reject role/org injection and invalid inputs', async () => {
  const fix = fixture(createOrganizationService), handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks });
  assert.equal((await (await handler.fetch(post({ action: 'lookup', email: 'student@example.test' }))).json()).mode, 'add');
  for (const body of [null, [], { action: 'lookup', email: 'bad' }, { action: 'invite', email: 'a@example.test', destination: 'team' }, { action: 'invite', email: 'a@example.test', destination: 'accepted', role: 'org:admin' }, { action: 'invite', email: 'a@example.test', destination: 'pending', organizationId: 'org_team' }, { action: 'accept', userId: '../user_student' }]) assert.equal((await handler.fetch(post(body))).status, 400);
  assert.equal((await handler.fetch(post({ action: 'add', userId: 'user_student', email: 'student@example.test', destination: 'accepted' }))).status, 200);
  assert.equal((await handler.fetch(post({ action: 'invite', email: 'new@example.test', destination: 'accepted' }))).status, 200);
  assert.equal((await handler.fetch(get('action=status'))).status, 200);
  assert.equal((await handler.fetch(get('action=members&group=team'))).status, 400);
});
test('origin, method, content type, malformed JSON and actual streamed body limits are enforced', async () => {
  const fix = fixture(createOrganizationService), handler = createAdminHandlers({ authenticate: async () => 'user_staff', service: fix.service, teamId: 'org_team', folderLinks: noFolderLinks });
  const request = (body, headers = {}) => new Request('https://ebs.test/api/team-admin', { method: 'POST', headers: { Origin: 'https://ebs.test', 'Content-Type': 'application/json', ...headers }, body });
  assert.equal((await handler.fetch(request('{}', { Origin: 'https://evil.test' }))).status, 403);
  assert.equal((await handler.fetch(request('{}', { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await handler.fetch(request('{'))).status, 400);
  assert.equal((await handler.fetch(request(' '.repeat(5000)))).status, 413);
  assert.equal((await handler.fetch(new Request('https://ebs.test/api/team-admin', { method: 'DELETE' }))).status, 405);
  assert.equal(fix.calls.length, 0);
});
test('runtime requires live matching production configuration and an explicit replacement Team identity', () => {
  const env = { VERCEL_ENV: 'production', CLERK_SECRET_KEY: 'sk_live_fake', VITE_CLERK_PUBLISHABLE_KEY: 'pk_live_fake', CLERK_TEAM_ORG_ID: 'org_team', CLERK_PENDING_ORG_ID: 'org_pending', CLERK_ACCEPTED_ORG_ID: 'org_accepted', EBS_ORG_INSTANCE_ID: 'ins_production' };
  assert.equal(productionPoolConfiguration(env).instanceId, 'ins_production');
  for (const override of [{ VERCEL_ENV: 'preview' }, { CLERK_SECRET_KEY: 'sk_test_fake' }, { VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_fake' }, { CLERK_TEAM_ORG_ID: undefined }, { EBS_ORG_INSTANCE_ID: undefined }, { CLERK_TEAM_ORG_ID: 'org_accepted' }]) assert.throws(() => productionPoolConfiguration({ ...env, ...override }));
});

test('production gateway rejects a publishable key from a different instance', async () => {
  const client = { instance: { get: async () => ({ id: 'ins_production', environmentType: 'production' }) }, domains: { list: async () => ({ data: [{ frontendApiUrl: 'https://clerk.ebs.test' }], totalCount: 1 }) } };
  const key = 'pk_live_' + Buffer.from('clerk.other.test$').toString('base64');
  await assert.rejects(() => createClerkOrganizationGateway(client, 'https://ebs.test/accept-invitation.html', key).instance(), error => error.state === 'configuration');
});

test('bootstrap report is read-only; applying requires the exact production confirmation', async () => {
  const fix = fixture(createOrganizationService);
  const bootstrap = createOrganizationBootstrap({gateway:fix.gateway,store:fix.store,config:fix.config});
  const before=structuredClone(fix.pools);
  const report = await bootstrap.report();assert.equal(report.changesApplied,false);assert.equal(report.organizationCount,3);
  assert.deepEqual(fix.pools,before);assert.equal(fix.calls.length,0);
  await assert.rejects(()=>bootstrap.apply('ins_other'), error=>error.state==='configuration');
  assert.deepEqual(fix.pools,before);assert.equal(fix.calls.length,0);
});

test('a later Accepted pool reopens the existing folder in the unchanged legacy namespace',async()=>{
  const fix=fixture(createOrganizationService);
  fix.organizations.get('org_accepted').members=Array.from({length:20},(_,i)=>({userId:'user_'+i}));
  await fix.service.add('user_student','student@example.test','accepted','user_staff');
  const configured=driveConfiguration({VERCEL_ENV:'production',EBS_DRIVE_ENABLED:'true',EBS_DRIVE_DATABASE_URL:'postgresql://unused',GOOGLE_OAUTH_CLIENT_ID:'client',GOOGLE_OAUTH_CLIENT_SECRET:'secret',GOOGLE_OAUTH_REFRESH_TOKEN:'refresh',GOOGLE_DRIVE_OWNER_EMAIL:'owner@example.test',EBS_DRIVE_STAFF_EMAILS:'staff@example.test',CLERK_ACCEPTED_ORG_ID:'org_accepted',EBS_DRIVE_PARENT_ID:'parent',EBS_DRIVE_TEMPLATE_ID:'template'});
  assert.equal(configured.namespace,'org_accepted:parent:template');
  let customUrl = 'https://files.example.test/research';
  const handler = createFolderHandlers({
    authenticate: async () => 'user_student',
    membership: fix.service.membership,
    participant: async () => ({ customUrl, googleEmail: 'student@example.test' }),
    googleFolder: () => ({
      store: { get: async () => ({ userId: 'user_student', email: 'student@example.test', folderId: 'original-folder', documentId: 'original-doc', ready: true, copyStarted: true }) },
      drive: new Proxy({}, { get: assert.fail }),
    }),
  });
  const read = () => handler.fetch(new Request('https://ebs.test/api/participant-folder'));
  assert.deepEqual(await (await read()).json(), { state: 'custom', folderUrl: customUrl });
  customUrl = null;
  const response = await read();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/original-folder', documentUrl: 'https://docs.google.com/document/d/original-doc/edit' });
});

test('Clerk nullable private metadata is normalized before reconciliation',async()=>{
  const client={organizations:{getOrganization:async()=>({id:'org_a',name:'A',maxAllowedMemberships:20,privateMetadata:null})}};
  const gateway=createClerkOrganizationGateway(client,'https://ebs.test/accept-invitation.html','pk_live_fake');
  assert.deepEqual((await gateway.organization('org_a')).metadata,{});
});

test('capacity uses provider totals even when a member has no public profile data',async()=>{
  const client={organizations:{getOrganization:async()=>({id:'org_a',name:'A',maxAllowedMemberships:20,privateMetadata:{}}),getOrganizationMembershipList:async()=>({data:[{publicUserData:null}],totalCount:20}),getOrganizationInvitationList:async()=>({data:[],totalCount:0})}};
  const gateway=createClerkOrganizationGateway(client,'https://ebs.test/accept-invitation.html','pk_live_fake');
  assert.deepEqual(await gateway.seatUsage('org_a'),{limit:20,members:20,invitations:0});
});
