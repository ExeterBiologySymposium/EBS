import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { fixture } from './org-fixture.mjs';
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
      assert(!JSON.stringify(await response.json()).includes('student@example.test'));
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
