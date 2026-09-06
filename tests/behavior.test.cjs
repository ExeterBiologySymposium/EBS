const test = require('node:test');
const assert = require('node:assert/strict');
const { getSearchResults, SEARCH_INDEX, createContactSubmit, createThemeController, openHashDetails } = require('../js/main.js');
const { validCollection, fetchCollection, loadContent } = require('../js/appwrite-content.js');

function contact(fetchImpl, timeoutMs = 100) {
  const button = { disabled: false, textContent: 'Send message' };
  const form = { action: 'https://api.web3forms.com/submit', hidden: false, values: 'retained', valid: true,
    reportValidity() { return this.valid; }, querySelector() { return button; }, setAttribute() {}, removeAttribute() {} };
  const status = { textContent: '' }, success = { hidden: true, focus() {} };
  const submit = createContactSubmit(form, { status, success, fetchImpl, timeoutMs, FormDataImpl: class {} });
  return { form, button, status, success, submit: () => submit({ preventDefault() {} }) };
}

test('page search covers all sixteen routes and preserves relevance ranking', () => {
  assert.equal(new Set(SEARCH_INDEX.map(p => p.url)).size, 16);
  assert.equal(getSearchResults('python')[0].url, 'python.html');
  assert.equal(getSearchResults('schedule')[0].url, 'schedule.html');
  assert.equal(getSearchResults('zzzzunknown').length, 0);
  assert.equal(getSearchResults('   ').length, 6);
});

test('contact validates first, prevents concurrent requests, confirms true service success', async () => {
  let calls = 0, resolve;
  const c = contact(() => { calls++; return new Promise(r => { resolve = r; }); });
  c.form.valid = false;
  await c.submit(); assert.equal(calls, 0);
  c.form.valid = true;
  const pending = c.submit(); await c.submit();
  assert.equal(calls, 1); assert.equal(c.button.disabled, true);
  resolve({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(c.form.hidden, true); assert.equal(c.success.hidden, false);
});

test('HTTP and service rejection preserve input and allow retry', async () => {
  for (const response of [{ ok: false, json: async () => ({ success: true }) }, { ok: true, json: async () => ({ success: false }) }, { ok: true, json: async () => ({ success: 'true' }) }]) {
    let calls = 0;
    const c = contact(async () => { calls++; return response; });
    await c.submit(); await c.submit();
    assert.equal(calls, 2); assert.equal(c.form.values, 'retained');
    assert.equal(c.form.hidden, false); assert.equal(c.button.disabled, false);
    assert.match(c.status.textContent, /could not|unable/i);
  }
});

test('timeout aborts request, reports failure, allows retry', async () => {
  let aborted = false;
  const c = contact((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')); });
  }), 5);
  await c.submit(); assert.equal(aborted, true);
  assert.match(c.status.textContent, /timed out/i); assert.equal(c.button.disabled, false);
  assert.equal(c.form.values, 'retained');
});

test('network and malformed JSON errors never report success', async () => {
  for (const fetchImpl of [async () => { throw Error('offline'); }, async () => ({ ok: true, json: async () => { throw Error('invalid JSON'); } })]) {
    const c = contact(fetchImpl); await c.submit();
    assert.equal(c.success.hidden, true); assert.equal(c.button.disabled, false);
  }
});

test('theme follows OS until user chooses, and survives blocked storage', () => {
  const attrs = {}, root = { setAttribute(k, v) { attrs[k] = v; } };
  let change; const media = { matches: true, addEventListener(name, fn) { change = fn; } };
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  const toggle = createThemeController(root, storage, media);
  assert.equal(attrs['data-theme'], 'dark');
  change({ matches: false }); assert.equal(attrs['data-theme'], 'light');
  toggle(); assert.equal(attrs['data-theme'], 'dark');
  change({ matches: false }); assert.equal(attrs['data-theme'], 'dark');
  createThemeController(root, { getItem: () => 'light' }, media);
  assert.equal(attrs['data-theme'], 'light');
});

test('fragment opens enclosing disclosure and tolerates malformed encoding', () => {
  const details = { open: false, parentElement: null, closest() { return this; } };
  const target = { closest: () => details, scrollIntoView() {} };
  const doc = { getElementById: id => id === 'answer-1' ? target : null };
  openHashDetails('#answer-1', doc); assert.equal(details.open, true);
  assert.doesNotThrow(() => openHashDetails('#%E0%A4%A', doc));
});

const row = { time: '09:00', event: 'Welcome', location: 'Online' };
test('collection requires complete, bounded, nonempty, correctly typed records', () => {
  assert.equal(validCollection({ total: 1, documents: [row] }, ['time', 'event', 'location']), true);
  for (const data of [{}, { total: 0, documents: [] }, { total: 2, documents: [row] }, { total: 1, documents: [{ ...row, time: '' }] }, { total: 1, documents: [{ ...row, event: 12 }] }, { total: 101, documents: Array(101).fill(row) }]) {
    assert.equal(validCollection(data, ['time', 'event', 'location']), false);
  }
});

test('Appwrite uses query limit, preserves configuration, and rejects invalid collection', async () => {
  let request;
  await fetchCollection('schedule_items', async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ total: 1, documents: [row] }) }; });
  const queries = new URL(request.url).searchParams.getAll('queries[]').map(JSON.parse);
  assert(queries.some(q => q.method === 'limit' && q.values[0] === 100));
  assert(queries.some(q => q.method === 'orderAsc' && q.attribute === 'order'));
  assert.equal(request.options.headers['X-Appwrite-Project'], '6a4ae6460030ea485984');
  await assert.rejects(fetchCollection('schedule_items', async () => ({ ok: true, json: async () => ({ total: 2, documents: [row] }) })));
});

test('independent Appwrite sections retain only failing section fallback; date excluded', async () => {
  const rendered = [];
  await loadContent(async id => { if (id === 'schedule_items') throw Error('offline'); return [{ title: 'Date', description: 'Wrong date' }, { title: 'Format', description: 'Hybrid' }]; }, rows => rendered.push(['schedule', rows]), cards => rendered.push(['sessions', cards]));
  assert.deepEqual(rendered, [['sessions', [{ title: 'Format', description: 'Hybrid' }]]]);
});
