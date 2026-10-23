import assert from 'node:assert/strict';
import React from 'react';
import { createServer } from 'vite';

// Exercise the real component's effects, including Strict Mode effect replay.
// The dispatcher is isolated here; no provider network calls or real messages are sent.
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
const previous = internals.H;
const effects = [], refs = [], scripts = [];
let rendered = 0, removed = 0, reset = 0, posted = 0, options;
const originals = Object.fromEntries(['window', 'document', 'fetch', 'FormData'].map(key => [key, globalThis[key]]));
try {
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.document = { createElement: () => ({ remove() {} }), head: { appendChild: script => scripts.push(script) } };
  globalThis.FormData = class extends originals.FormData { constructor() { super(); } };
  globalThis.fetch = async (_url, request) => {
    posted++;
    assert.equal(request.body.get('h-captcha-response'), 'valid-token');
    return { ok: false };
  };
  const { ContactForm } = await vite.ssrLoadModule('/src/page-controls.tsx');
  internals.H = {
    useState: value => [value, () => {}],
    useRef: value => { const ref = { current: value }; refs.push(ref); return ref; },
    useEffect: effect => effects.push(effect),
  };
  const tree = ContactForm({ action: 'https://api.web3forms.com/submit', accessKey: 'fixture' });
  refs[0].current = {};
  effects.map(effect => effect()).forEach(cleanup => cleanup?.());
  let cleanups = effects.map(effect => effect());
  assert.equal(scripts.length, 1, 'Strict Mode must share one pending script');
  scripts[0].onerror();
  await Promise.resolve();
  cleanups.forEach(cleanup => cleanup?.());
  cleanups = effects.map(effect => effect());
  assert.equal(scripts.length, 2, 'Failed script loads must allow a later mount to retry');
  window.hcaptcha = {
    render(_element, config) { rendered++; options = config; return 'widget-1'; },
    remove() { removed++; }, reset() { reset++; },
  };
  window.ebsHCaptchaReady();
  await Promise.resolve();
  assert.equal(rendered, 1, 'Only the active effect may render');
  const submit = tree.props.children[0].props.onSubmit;
  const event = { preventDefault() {}, currentTarget: { reportValidity: () => true } };
  await submit(event);
  assert.equal(posted, 0, 'Missing CAPTCHA must block submission');
  options.callback('expired-token');
  options['expired-callback']();
  await submit(event);
  assert.equal(posted, 0, 'Expired CAPTCHA must block submission');
  options.callback('valid-token');
  await submit(event);
  assert.equal(posted, 1);
  assert.equal(reset, 1, 'A rejected request must reset its single-use token');
  await submit(event);
  assert.equal(posted, 1, 'Retry must require a fresh token');
  cleanups.forEach(cleanup => cleanup?.());
  assert.equal(removed, 1, 'Unmount must remove the provider widget');
  options.callback('late-token');
  assert.equal(refs[1].current, '', 'Late provider callbacks must not revive an unmounted token');
  console.log('PASS: Strict Mode CAPTCHA initialization, expiration, token submission, failure/retry, and widget cleanup.');
} finally {
  internals.H = previous;
  Object.assign(globalThis, originals);
  await vite.close();
}
