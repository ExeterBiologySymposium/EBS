import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { fixture } from './org-fixture.mjs';
const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let createOrganizationService;
try { ({ createOrganizationService } = await vite.ssrLoadModule('/server/orgs/service.ts')); } finally { await vite.close(); }
const addStudent = fix => fix.service.add('user_student', 'student@example.test', 'accepted', 'user_staff');
const member = (userId, joinedAt = 1) => ({ userId, identifier: `${userId}@example.test`, name: userId, joinedAt, role: 'org:member' });

test('20 members and outstanding invitations fill a pool; both destinations roll over at seat 21', async () => {
  for (const destination of ['pending', 'accepted']) {
    const fix = fixture(createOrganizationService), org = fix.organizations.get('org_' + destination);
    org.members = Array.from({ length: 19 }, (_, i) => member('user_' + i));
    org.invitations.push({ id: 'inv_first', email: 'waiting@example.test', metadata: {}, createdAt: 1, expiresAt: Date.now() + 999999 });
    const result = await fix.service.add('user_student', 'student@example.test', destination, 'user_staff');
    assert.equal(result.state, 'added');
    assert.equal(org.members.length + org.invitations.length, 20);
    assert.deepEqual(fix.calls.filter(([action]) => action === 'create'), [['create', destination]]);
    assert.equal(await fix.service.membership('user_student'), destination);
  }
});
test('oldest open organization is reused before provisioning; existing Accepted roles never change or downgrade', async () => {
  const fix = fixture(createOrganizationService);
  await addStudent(fix);
  fix.organizations.get('org_accepted').members[0].role = 'org:admin';
  assert.equal((await addStudent(fix)).state, 'already-member');
  assert.equal((await fix.service.add('user_student', 'student@example.test', 'pending', 'user_staff')).state, 'already-accepted');
  assert.equal(fix.organizations.get('org_accepted').members[0].role, 'org:admin');
  assert.equal(fix.calls.filter(([kind]) => kind === 'create' || kind === 'add').length, 1);
});
test('only registered Accepted IDs grant access; active organization and names are irrelevant', async () => {
  const fix = fixture(createOrganizationService);
  fix.organizations.set('org_forged', { id: 'org_forged', name: 'Accepted', members: [member('user_student')], invitations: [], metadata: {}, limit: 20 });
  assert.equal(await fix.service.membership('user_student'), 'unassigned');
  await addStudent(fix);
  assert.equal(await fix.service.membership('user_student'), 'accepted');
});
test('direct add requires the exact currently verified email; invitations can target either status', async () => {
  const fix = fixture(createOrganizationService);
  assert.equal((await fix.service.lookup('student@example.test')).mode, 'add');
  assert.equal((await fix.service.lookup('new@example.test')).mode, 'invite');
  await assert.rejects(() => fix.service.add('user_student', 'someone@example.test', 'accepted', 'user_staff'), error => error.state === 'lookup-changed');
  for (const destination of ['pending', 'accepted']) {
    const email = `new-${destination}@example.test`;
    assert.equal((await fix.service.invite(email, destination, 'user_staff')).state, 'invited');
    assert.equal(fix.organizations.get('org_' + destination).invitations.at(-1).email, email);
  }
  assert.equal(await fix.service.membership('user_student'), 'unassigned');
});
test('outstanding invitations are deduplicated across destinations and email case', async () => {
  const fix = fixture(createOrganizationService);
  await fix.service.invite('new@example.test', 'pending', 'user_staff');
  const result = await fix.service.invite('NEW@example.test', 'accepted', 'user_staff');
  assert.equal(result.state, 'already-invited');
  assert.equal(result.destination, 'pending');
  assert.equal(fix.calls.filter(([kind]) => kind === 'invite').length, 1);
});
test('concurrent submissions are serialized and retries do not duplicate membership', async () => {
  const fix = fixture(createOrganizationService);
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => addStudent(fix)));
  assert(results.some(value => value.status === 'fulfilled'));
  await addStudent(fix);
  assert.equal(fix.calls.filter(([kind]) => kind === 'add').length, 1);
});
test('acceptance adds before cleanup; failure keeps Pending; partial cleanup is retryable', async () => {
  const fix = fixture(createOrganizationService);
  fix.organizations.get('org_pending').members.push(member('user_student'));
  const add = fix.gateway.addMember;
  fix.gateway.addMember = async () => { throw Object.assign(Error('forbidden'), { status: 403 }); };
  await assert.rejects(() => fix.service.accept('user_student', 'user_staff'));
  assert.equal(await fix.service.membership('user_student'), 'pending');
  fix.gateway.addMember = add;
  const remove = fix.gateway.removeMember;
  fix.gateway.removeMember = async () => { throw Error('temporary'); };
  assert.equal((await fix.service.accept('user_student', 'user_staff')).state, 'cleanup-needed');
  assert.equal(await fix.service.membership('user_student'), 'accepted');
  fix.gateway.removeMember = remove;
  assert.equal((await fix.service.accept('user_student', 'user_staff')).state, 'added');
  assert.deepEqual(fix.calls.map(([kind]) => kind), ['add', 'remove']);
});
test('an uncertain successful invitation is reconciled without another email', async () => {
  const fix = fixture(createOrganizationService), original = fix.gateway.invite;
  fix.gateway.invite = async (...args) => { await original(...args); throw Error('response lost'); };
  await fix.service.invite('new@example.test', 'accepted', 'user_staff');
  await fix.service.invite('new@example.test', 'accepted', 'user_staff');
  assert.equal(fix.calls.filter(([kind]) => kind === 'invite').length, 1);
});
test('unknown invitation outcomes stay needs-review and cannot resend blindly', async () => {
  const fix = fixture(createOrganizationService);
  let attempts = 0;
  fix.gateway.invite = async () => { attempts++; throw Error('connection lost'); };
  for (let i = 0; i < 2; i++) await assert.rejects(() => fix.service.invite('new@example.test', 'pending', 'user_staff'), error => error.state === 'needs-review');
  assert.equal(attempts, 1);
});
test('unknown organization creation is reconciled by operation metadata without another create', async () => {
  const fix = fixture(createOrganizationService);
  fix.organizations.get('org_accepted').members = Array.from({ length: 20 }, (_, i) => member('user_' + i));
  const create = fix.gateway.createOrganization;
  fix.gateway.createOrganization = async (...args) => { await create(...args); throw Error('response lost'); };
  await assert.rejects(addStudent.bind(null, fix), error => error.state === 'needs-review');
  assert.equal((await addStudent(fix)).state, 'added');
  assert.equal(fix.calls.filter(([kind]) => kind === 'create').length, 1);
});
test('the ceiling counts unrelated organizations; free seats still work at 100 and disabled rollover preserves access', async () => {
  const fix = fixture(createOrganizationService);
  for (let i = 0; i < 97; i++) fix.organizations.set('org_other' + i, { id: 'org_other' + i, members: [], invitations: [], metadata: {}, limit: 20 });
  fix.organizations.get('org_accepted').members = Array.from({ length: 20 }, (_, i) => member('user_' + i));
  assert.equal((await fix.service.availability()).accepted, 'capacity-reached');
  await assert.rejects(addStudent.bind(null, fix), error => error.state === 'capacity');
  fix.organizations.get('org_accepted').members.pop();
  fix.config.rollover = false;
  assert.equal((await addStudent(fix)).state, 'added');
  assert.equal(await fix.service.membership('user_student'), 'accepted');
});
test('Development, wrong-instance and revoked Team callers cannot mutate production pools', async () => {
  for (const instance of [{ id: 'ins_production', environmentType: 'development' }, { id: 'ins_other', environmentType: 'production' }]) {
    const fix = fixture(createOrganizationService); fix.gateway.instance = async () => instance;
    await assert.rejects(addStudent.bind(null, fix), error => error.state === 'configuration');
    assert.equal(fix.calls.length, 0);
  }
  const fix = fixture(createOrganizationService);
  assert(await fix.service.isTeam('user_staff'));
  fix.organizations.get('org_team').members = [];
  assert.equal(await fix.service.isTeam('user_staff'), false);
  await assert.rejects(addStudent.bind(null, fix), error => error.state === 'forbidden');
});
test('unified participant and invitation pages deduplicate, sort and use scoped opaque cursors', async () => {
  const fix = fixture(createOrganizationService);
  fix.organizations.get('org_pending').members = Array.from({ length: 26 }, (_, i) => member('user_' + i, i));
  const page = await fix.service.listMembers('pending');
  assert.equal(page.data.length, 25); assert.equal(page.totalCount, 26); assert(page.nextCursor);
  assert.equal((await fix.service.listMembers('pending', page.nextCursor)).data.length, 1);
  await assert.rejects(() => fix.service.listMembers('accepted', page.nextCursor), error => error.state === 'invalid-request');
});

test('quota retries are bounded and rate/auth failures never cause organization creation', async () => {
  for (const status of [403,429]) {
    const fix = fixture(createOrganizationService);
    fix.gateway.addMember = async () => { throw Object.assign(Error('provider detail'), {status}); };
    await assert.rejects(addStudent.bind(null,fix), error => error.state === (status === 429 ? 'rate-limited' : 'unavailable'));
    assert.equal(fix.calls.length,0);
  }
  const fix = fixture(createOrganizationService);let attempts=0;
  fix.gateway.addMember = async () => { attempts++;throw Object.assign(Error('quota'), {status:403,code:'organization_membership_quota_exceeded'}); };
  await assert.rejects(addStudent.bind(null,fix), error => error.state === 'processing');
  assert.equal(attempts,3);
});
test('unknown creation without proof blocks another create and is counted as reserved capacity', async () => {
  const fix = fixture(createOrganizationService);let attempts=0;
  fix.organizations.get('org_accepted').members = Array.from({length:20},(_,i)=>member('user_'+i));
  fix.gateway.createOrganization = async () => { attempts++;throw Error('timeout'); };
  for(let i=0;i<2;i++) await assert.rejects(addStudent.bind(null,fix), error => error.state === 'needs-review');
  assert.equal(attempts,1);
  assert.equal((await fix.service.availability()).accepted,'needs-review');
});
test('concurrent last-seat users allocate once and both eventually succeed without duplicates', async () => {
  const fix = fixture(createOrganizationService);
  fix.organizations.get('org_accepted').members = Array.from({length:19},(_,i)=>member('user_'+i));
  fix.users.set('user_second',{id:'user_second',name:'Second',verifiedEmails:['second@example.test']});
  await Promise.allSettled([addStudent(fix),fix.service.add('user_second','second@example.test','accepted','user_staff')]);
  await addStudent(fix);await fix.service.add('user_second','second@example.test','accepted','user_staff');
  assert.equal(fix.calls.filter(([kind])=>kind==='create').length,1);
  assert.equal(fix.calls.filter(([kind])=>kind==='add').length,2);
  assert.equal(await fix.service.membership('user_second'),'accepted');
});

test('membership join dates belong to the requested status, not the other organization', async () => {
  const fix=fixture(createOrganizationService);
  fix.organizations.get('org_pending').members.push(member('user_student',1));
  fix.organizations.get('org_accepted').members.push(member('user_student',50));
  fix.pools.reverse();
  assert.equal((await fix.service.listMembers('pending')).data[0].joinedAt,1);
  assert.equal((await fix.service.listMembers('accepted')).data[0].joinedAt,50);
});
test('cleanup response loss is reconciled as success once Pending is actually absent', async () => {
  const fix=fixture(createOrganizationService),remove=fix.gateway.removeMember;
  fix.organizations.get('org_pending').members.push(member('user_student'));
  fix.gateway.removeMember=async(...args)=>{await remove(...args);throw Error('response lost');};
  assert.equal((await fix.service.accept('user_student','user_staff')).state,'added');
});
