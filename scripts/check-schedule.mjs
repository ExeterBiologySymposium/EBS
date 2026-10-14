import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scheduleLocation, symposiumVenue } from '../src/schedule-details.ts';

assert.equal(scheduleLocation('Forum'), 'Grainger');
assert.equal(scheduleLocation('Forum/Online'), 'Grainger/Online');
assert.equal(scheduleLocation('New Dining Hall'), 'Grainger');
assert.equal(scheduleLocation('New Dining Hall/Online'), 'Grainger/Online');
assert.equal(scheduleLocation('Grainger/Online'), 'Grainger/Online');
assert.equal(scheduleLocation('Phelps Lobby/Online'), 'Phelps Lobby/Online');
assert.equal(symposiumVenue, 'Phillips Exeter Academy — Phelps Lobby and Grainger.');
const page = readFileSync(new URL('../src/pages/schedule.tsx', import.meta.url), 'utf8');
assert(!/Forum|New Dining Hall/.test(page));
assert(page.includes('{symposiumVenue}'));
console.log('Schedule locations and venue summary passed.');
