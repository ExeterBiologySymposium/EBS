import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { fixture } from './org-fixture.mjs';

const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let createRegistrationStatusHandler, createOrganizationService, createClerkOrganizationGateway, OrganizationProblem, registrationApi;
try {
  ({ createRegistrationStatusHandler } = await vite.ssrLoadModule('/server/registration-status.ts'));
  ({ createOrganizationService } = await vite.ssrLoadModule('/server/orgs/service.ts'));
  ({ createClerkOrganizationGateway } = await vite.ssrLoadModule('/server/orgs/clerk.ts'));
  ({ OrganizationProblem } = await vite.ssrLoadModule('/server/orgs/types.ts'));
  ({ default: registrationApi } = await vite.ssrLoadModule('/api/registration-status.ts'));
} finally { await vite.close(); }

const TOKEN = 'test-token-0123456789abcdefghijklmnopqrstuv';
const URL_ = 'https://ebs.test/api/registration-status';
const post = (body, { token = TOKEN, contentType = 'application/json', raw } = {}) => new Request(URL_, {
  method: 'POST',
  headers: { ...(token === null ? {} : { Authorization: `Bearer ${token}` }), ...(contentType ? { 'Content-Type': contentType } : {}) },
  body: raw ?? JSON.stringify(body),
});
const handlerFor = (service, ...tokenArgument) => {
  const token = tokenArgument.length ? tokenArgument[0] : TOKEN; // an explicit undefined means "not configured"
  const calls = { factory: 0 };
  const handler = createRegistrationStatusHandler({ token, service: () => { calls.factory++; return service; } });
  return { handler, calls };
};
const json = async response => ({ status: response.status, body: await response.json(), headers: response.headers });

// A fixture with one student in each state. Names are distinctive so leaks are easy to spot.
function people() {
  const fix = fixture(createOrganizationService);
  const add = (id, email, name = 'Quill Avery-Morrow') => fix.users.set(id, { id, name, verifiedEmails: [email] });
  add('user_student', 'student@example.test');
  add('user_pending', 'pending@example.test');
  add('user_nobody', 'nobody@example.test');
  add('user_teamonly', 'teamonly@example.test');
  add('user_fakeorg', 'fakeorg@example.test');
  const member = (org, userId, joinedAt) => fix.organizations.get(org).members.push({ userId, name: 'Quill Avery-Morrow', identifier: userId, joinedAt, role: 'org:member' });
  member('org_accepted', 'user_student', 2_000);
  member('org_pending', 'user_pending', 1_500);
  member('org_team', 'user_teamonly', 1_000);
  fix.organizations.set('org_fake', { id: 'org_fake', name: 'Accepted', limit: 20, metadata: {}, members: [], invitations: [] });
  member('org_fake', 'user_fakeorg', 1_000);
  return { fix, member };
}

test('a missing or short token fails closed before any lookup; a wrong token is 401', async () => {
  const { fix } = people();
  for (const token of [undefined, '', 'short-token']) {
    const { handler, calls } = handlerFor(fix.service, token);
    const response = await json(await handler.fetch(post({ emails: ['student@example.test'] })));
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, { state: 'configuration' });
    assert.equal(calls.factory, 0);
  }
  const { handler, calls } = handlerFor(fix.service);
  for (const request of [post({ emails: ['student@example.test'] }, { token: 'wrong-token-0123456789abcdefghijklmnopqrstu' }), post({ emails: ['student@example.test'] }, { token: null }), new Request(URL_, { method: 'POST', headers: { Authorization: `Basic ${TOKEN}`, 'Content-Type': 'application/json' }, body: '{"emails":["student@example.test"]}' }), post({ emails: ['student@example.test'] }, { token: TOKEN + 'x' })]) {
    const response = await json(await handler.fetch(request));
    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { state: 'unauthorized' });
  }
  assert.equal(calls.factory, 0);
});

test('only bounded JSON POST bodies with 1-10 distinct email strings are accepted', async () => {
  const { fix } = people();
  const { handler, calls } = handlerFor(fix.service);
  const get = await handler.fetch(new Request(URL_, { headers: { Authorization: `Bearer ${TOKEN}` } }));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  assert.equal((await handler.fetch(post({ emails: ['student@example.test'] }, { contentType: 'text/plain' }))).status, 415);
  assert.equal((await handler.fetch(post(null, { raw: JSON.stringify({ emails: ['a'.repeat(5000) + '@example.test'] }) }))).status, 413);
  const bad = [
    null, [], {}, { emails: [] }, { emails: 'student@example.test' }, { emails: [1] }, { emails: [null] },
    { emails: Array.from({ length: 11 }, (_, i) => `s${i}@example.test`) },
    { emails: ['student@example.test'], extra: true },
    { emails: ['x'.repeat(321)] },
    { emails: ['student@example.test', ' STUDENT@example.test '] },
  ];
  for (const body of bad) assert.equal((await handler.fetch(post(body))).status, 400, JSON.stringify(body)?.slice(0, 80));
  assert.equal((await handler.fetch(post(null, { raw: '{not json' }))).status, 400);
  assert.equal(calls.factory, 0);
});

test('maps registered Accepted and Pending pools, ignores Team and unregistered organizations, and never folds aliases', async () => {
  const { fix } = people();
  await fix.service.invite('invited@example.test', 'accepted', 'user_staff');
  const { handler } = handlerFor(fix.service);
  const emails = ['  Student@Example.TEST ', 'pending@example.test', 'nobody@example.test', 'teamonly@example.test', 'fakeorg@example.test', 'invited@example.test', 'student+ebs@example.test', 'not-an-email'];
  const response = await json(await handler.fetch(post({ emails })));
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { results: [
    { email: 'student@example.test', account: 'verified', userId: 'user_student', status: 'accepted', acceptedAt: 2_000 },
    { email: 'pending@example.test', account: 'verified', userId: 'user_pending', status: 'pending', acceptedAt: null },
    { email: 'nobody@example.test', account: 'verified', userId: 'user_nobody', status: 'none', acceptedAt: null },
    { email: 'teamonly@example.test', account: 'verified', userId: 'user_teamonly', status: 'none', acceptedAt: null },
    { email: 'fakeorg@example.test', account: 'verified', userId: 'user_fakeorg', status: 'none', acceptedAt: null },
    { email: 'invited@example.test', account: 'none' },
    { email: 'student+ebs@example.test', account: 'none' },
    { email: 'not-an-email', account: 'invalid' },
  ] });
  assert.equal(fix.calls.filter(call => call[0] !== 'invite').length, 0, 'the lookup never changes memberships');
});

test('Accepted wins over Pending, the earliest ready Accepted membership is reported, and unready pools are ignored', async () => {
  const { fix, member } = people();
  member('org_pending', 'user_student', 500);
  fix.pools.push({ kind: 'accepted', ordinal: 2, operationId: 'rollover', organizationId: 'org_accepted_2', state: 'ready' });
  fix.organizations.set('org_accepted_2', { id: 'org_accepted_2', name: 'EBS Accepted 002', limit: 20, metadata: {}, members: [], invitations: [] });
  member('org_accepted_2', 'user_student', 1_200);
  fix.pools.push({ kind: 'accepted', ordinal: 3, operationId: 'review', organizationId: 'org_accepted_3', state: 'needs-review' });
  fix.organizations.set('org_accepted_3', { id: 'org_accepted_3', name: 'EBS Accepted 003', limit: 20, metadata: {}, members: [], invitations: [] });
  member('org_accepted_3', 'user_student', 100);
  member('org_accepted_3', 'user_pending', 100);
  const { handler } = handlerFor(fix.service);
  const { body } = await json(await handler.fetch(post({ emails: ['student@example.test', 'pending@example.test'] })));
  assert.deepEqual(body.results, [
    { email: 'student@example.test', account: 'verified', userId: 'user_student', status: 'accepted', acceptedAt: 1_200 },
    { email: 'pending@example.test', account: 'verified', userId: 'user_pending', status: 'pending', acceptedAt: null },
  ]);
});

test('an ambiguous email is reported per entry while the rest of the batch still resolves', async () => {
  const { fix } = people();
  const findUser = fix.gateway.findUser;
  fix.gateway.findUser = async email => { if (email === 'shared@example.test') throw new OrganizationProblem('ambiguous-account', 409); return findUser(email); };
  const { handler } = handlerFor(fix.service);
  const { status, body } = await json(await handler.fetch(post({ emails: ['shared@example.test', 'student@example.test'] })));
  assert.equal(status, 200);
  assert.deepEqual(body.results.map(result => result.account), ['ambiguous', 'verified']);
  assert.deepEqual(Object.keys(body.results[0]).sort(), ['account', 'email']);
});

test('responses are private, carry no names and no CORS headers, and use exact keys', async () => {
  const { fix } = people();
  const { handler } = handlerFor(fix.service);
  const response = await handler.fetch(post({ emails: ['student@example.test', 'nobody+x@example.test', 'bad'] }));
  const text = await response.clone().text();
  assert.doesNotMatch(text, /Quill|Avery|"name"/);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  const { results } = JSON.parse(text);
  assert.deepEqual(Object.keys(results[0]).sort(), ['acceptedAt', 'account', 'email', 'status', 'userId']);
  assert.deepEqual(Object.keys(results[1]).sort(), ['account', 'email']);
  assert.deepEqual(Object.keys(results[2]).sort(), ['account', 'email']);
});

test('provider and configuration failures fail closed with generic states', async () => {
  const cases = [
    ['Clerk rate limit on lookup', fix => { fix.gateway.findUser = async () => { throw Object.assign(Error('slow down'), { status: 429 }); }; }, 429, 'rate-limited'],
    ['Clerk outage on lookup', fix => { fix.gateway.findUser = async () => { throw Object.assign(Error('down'), { status: 500 }); }; }, 503, 'unavailable'],
    ['Clerk rate limit on memberships', fix => { fix.gateway.userMembershipTimes = async () => { throw Object.assign(Error('slow down'), { status: 429 }); }; }, 429, 'rate-limited'],
    ['wrong Clerk instance', fix => { fix.gateway.instance = async () => ({ id: 'ins_other', environmentType: 'production' }); }, 503, 'configuration'],
    ['development Clerk instance', fix => { fix.gateway.instance = async () => ({ id: 'ins_production', environmentType: 'development' }); }, 503, 'configuration'],
    ['missing Accepted pool', fix => { fix.pools.splice(fix.pools.findIndex(pool => pool.kind === 'accepted'), 1); }, 503, 'configuration'],
  ];
  for (const [name, breakIt, status, state] of cases) {
    const { fix } = people();
    breakIt(fix);
    const { handler } = handlerFor(fix.service);
    const response = await json(await handler.fetch(post({ emails: ['student@example.test'] })));
    assert.equal(response.status, status, name);
    assert.deepEqual(response.body, { state }, name);
    if (status === 429) assert.equal(response.headers.get('retry-after'), '5', name);
  }
  const off = createRegistrationStatusHandler({ token: TOKEN, service: () => { throw new OrganizationProblem('configuration'); } });
  assert.deepEqual(await (await off.fetch(post({ emails: ['student@example.test'] }))).json(), { state: 'configuration' });
  const broken = createRegistrationStatusHandler({ token: TOKEN, service: () => { throw new Error('boom'); } });
  const response = await broken.fetch(post({ emails: ['student@example.test'] }));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { state: 'unavailable' });
});

test('the real Clerk gateway: duplicate verified owners are ambiguous, unverified addresses never match, memberships page past 100', async () => {
  const user = (id, email, status) => ({ id, firstName: 'Quill', lastName: 'Avery', emailAddresses: [{ emailAddress: email, verification: { status } }] });
  const directory = {
    'twice@example.test': [user('user_a', 'twice@example.test', 'verified'), user('user_b', 'Twice@Example.test', 'verified')],
    'mixed@example.test': [user('user_c', 'mixed@example.test', 'verified'), user('user_d', 'mixed@example.test', 'unverified')],
    'unverified@example.test': [user('user_e', 'unverified@example.test', 'unverified')],
  };
  const membershipCalls = [];
  const memberships = Array.from({ length: 150 }, (_, i) => ({ organization: { id: i === 149 ? 'org_accepted' : `org_other_${i}` }, createdAt: 10_000 + i }));
  const client = { users: {
    getUserList: async ({ emailAddress: [email], limit, offset }) => { const all = directory[email] || []; return { data: all.slice(offset, offset + limit), totalCount: all.length }; },
    getOrganizationMembershipList: async ({ userId, limit, offset }) => { membershipCalls.push([userId, offset]); const all = userId === 'user_c' ? memberships : []; return { data: all.slice(offset, offset + limit), totalCount: all.length }; },
  } };
  const real = createClerkOrganizationGateway(client, 'https://ebs.test/accept-invitation.html', 'pk_live_fake');
  const times = await real.userMembershipTimes('user_c');
  assert.equal(times.length, 150);
  assert.deepEqual(times.at(-1), { organizationId: 'org_accepted', createdAt: 10_149 });
  assert.deepEqual(membershipCalls, [['user_c', 0], ['user_c', 100]]);
  const fix = fixture(createOrganizationService);
  const gateway = { ...real, instance: async () => ({ id: 'ins_production', environmentType: 'production' }) };
  const service = createOrganizationService({ store: fix.store, gateway, config: fix.config });
  const { handler } = handlerFor(service);
  const { status, body } = await json(await handler.fetch(post({ emails: ['twice@example.test', 'mixed@example.test', 'unverified@example.test'] })));
  assert.equal(status, 200);
  assert.deepEqual(body.results, [
    { email: 'twice@example.test', account: 'ambiguous' },
    { email: 'mixed@example.test', account: 'verified', userId: 'user_c', status: 'accepted', acceptedAt: 10_149 },
    { email: 'unverified@example.test', account: 'none' },
  ]);
});

test('the Vercel function reads its token from the environment and fails closed without pools mode', async () => {
  const saved = { token: process.env.EBS_REGISTRATION_STATUS_TOKEN, pools: process.env.EBS_ORG_POOLS_ENABLED };
  try {
    delete process.env.EBS_REGISTRATION_STATUS_TOKEN;
    assert.deepEqual(await (await registrationApi.fetch(post({ emails: ['student@example.test'] }))).json(), { state: 'configuration' });
    process.env.EBS_REGISTRATION_STATUS_TOKEN = TOKEN;
    delete process.env.EBS_ORG_POOLS_ENABLED;
    assert.equal((await registrationApi.fetch(post({ emails: ['student@example.test'] }, { token: 'wrong-token-0123456789abcdefghijklmnopqrstu' }))).status, 401);
    const response = await registrationApi.fetch(post({ emails: ['student@example.test'] }));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { state: 'configuration' });
  } finally {
    if (saved.token === undefined) delete process.env.EBS_REGISTRATION_STATUS_TOKEN; else process.env.EBS_REGISTRATION_STATUS_TOKEN = saved.token;
    if (saved.pools === undefined) delete process.env.EBS_ORG_POOLS_ENABLED; else process.env.EBS_ORG_POOLS_ENABLED = saved.pools;
  }
});
