import assert from 'node:assert/strict';
import test from 'node:test';
import { siteNavigation, registrationDestination } from '../src/site-navigation.ts';
import { readSubmission, saveSubmission } from '../src/application-progress-store.ts';

test('member links stay behind Accepted access and registration has a signed-in destination', () => {
  for (const access of [null, 'checking', 'pending', 'unavailable']) {
    assert.ok(!siteNavigation(access, true).some(group => group.label === 'Member resources'));
  }
  const member = siteNavigation('accepted', true).find(group => group.label === 'Member resources');
  assert.ok(member.links.some(link => link.href === 'events.html'));
  assert.equal(registrationDestination(false), 'register.html');
  assert.equal(registrationDestination(true), 'account.html');
});

test('application self-check persists, reverses, and is scoped to this account and event', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  assert.equal(readSubmission(storage, 'student-a'), false);
  saveSubmission(storage, 'student-a', true);
  assert.equal(readSubmission(storage, 'student-a'), true);
  assert.equal(readSubmission(storage, 'student-b'), false);
  assert.ok([...values.keys()].every(key => key.includes('2027')));
  saveSubmission(storage, 'student-a', false);
  assert.equal(readSubmission(storage, 'student-a'), false);
  assert.equal(values.size, 0);
});
