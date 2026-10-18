import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { AuthContext, RegistrationLink, AccountControls } = await server.ssrLoadModule('/src/auth.tsx');
  const href = 'https://forms.gle/example';
  const render = (status, child) => renderToStaticMarkup(h(AuthContext.Provider, {
    value: { status, signIn() {}, signUp() {}, account: h('button', null, 'Account') },
  }, child));
  for (const status of ['loading', 'unavailable', 'signed-out']) {
    const html = render(status, h(RegistrationLink, { href }, 'Open application'));
    assert(!html.includes(href), `${status} must not reveal the form URL`);
    assert(!html.includes('<a '), `${status} must not offer a bypass link`);
    assert(html.includes('<button'), `${status} provides an action or status`);
    if (status !== 'signed-out') assert(html.includes('disabled'), `${status} fails closed`);
    else assert(html.includes('Sign in to'), 'Signed-out action explains sign-in requirement');
  }
  const signedIn = render('signed-in', h(RegistrationLink, { href }, 'Open application'));
  assert(signedIn.includes(`href="${href}"`));
  assert(signedIn.includes('rel="noopener noreferrer"'));
  assert(signedIn.includes('target="_blank"'));
  const nav = render('signed-out', h(AccountControls));
  assert(nav.includes('Sign in') && nav.includes('Sign up'));
  assert(render('signed-in', h(AccountControls)).includes('Account'));
  for (const file of ['student-signup', 'schools', 'judges', 'researchers']) {
    const source = await readFile(new URL(`../src/pages/${file}.tsx`, import.meta.url), 'utf8');
    assert(!/<a\b[^>]*href=\{?"https:\/\/(?:forms\.gle|docs\.google\.com\/forms)/.test(source), `${file} contains an ungated form link`);
    assert(source.includes('<RegistrationLink'), `${file} uses the shared registration gate`);
  }
  const { render: prerender } = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const page of ['index', 'register', 'student-signup', 'schools', 'judges', 'researchers']) {
    const html = prerender(`${page}.html`);
    assert(!/href="https:\/\/(?:forms\.gle|docs\.google\.com\/forms)/.test(html), `${page} must not prerender form URLs`);
    assert(html.includes('Loading account'), `${page} starts with hydration-safe account controls`);
  }
  console.log('PASS: registration gates for all auth states, navigation, and every form entry point.');
} finally {
  await server.close();
}
