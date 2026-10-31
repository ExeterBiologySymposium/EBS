import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { isProtectedPath, safeReturnTo } = await vite.ssrLoadModule('/src/access-policy.ts');
  for (const path of ['/events.html', '/events', '/%65vents.html', '/EVENTS.HTML', '/events/extra', '/protected-assets/events/kate-adamala.png']) assert(isProtectedPath(path), path);
  assert.equal(safeReturnTo('/events.html'), '/events.html');
  const { createAccessHandlers } = await vite.ssrLoadModule('/server/access.ts');
  const deps = access => ({ authenticate: async () => access === null ? null : 'self', membership: async () => access, enrollPending: async () => {} });
  for (const access of [null, 'pending', 'accepted']) {
    const handler = createAccessHandlers(deps(access));
    const register = await handler.protect(new Request('https://ebs.test/register.html?returnTo=%2Fevents.html'));
    if (access === null) assert.equal(register, null);
    else { assert.equal(register.status, 303); assert.equal(register.headers.get('location'), '/account.html?returnTo=%2Fevents.html'); }
    const page = await handler.protect(new Request('https://ebs.test/events.html'));
    const asset = await handler.protect(new Request('https://ebs.test/protected-assets/events/kate-adamala.png'));
    if (access === 'accepted') { assert.equal(page, null); assert.equal(asset, null); }
    else { assert.equal(page.status, 303); assert.equal(asset.status, access === null ? 401 : 403); assert.match(page.headers.get('location'), access === null ? /^\/register.html/ : /^\/account.html/); }
  }
  const unsafe = await createAccessHandlers(deps('accepted')).protect(new Request('https://ebs.test/register.html?returnTo=https%3A%2F%2Fevil.test'));
  assert.equal(unsafe.headers.get('location'), '/account.html');
  const { AuthContext, initialAuth } = await vite.ssrLoadModule('/src/auth.tsx');
  const { App } = await vite.ssrLoadModule('/src/site.tsx');
  const render = (status, access, page) => renderToString(h(AuthContext.Provider, { value: { ...initialAuth, status, access } }, h(App, { page })));
  for (const access of ['pending', null, 'checking', 'unavailable', 'accepted']) {
    const html = render('signed-in', access, 'account.html');
    assert(html.includes('<h1>Account</h1>'), access);
    assert(!/href="\/?(?:register|student-signup)\.html/.test(html), `${access} account exposes registration`);
    assert(!html.includes('registration-routes'));
    assert(html.includes('contact.html'));
    if (access !== 'accepted') { assert(!html.includes('href="events.html"')); assert(!html.includes('Your research folder')); }
    else { assert(html.includes('href="events.html"')); }
    const old = render('signed-in', access, 'register.html');
    assert(old.includes('<h1>Account</h1>'));
    assert(!old.includes('registration-routes'));
  }
  for (const access of [null, 'pending', 'accepted']) {
    const html = render(access === null ? 'signed-out' : 'signed-in', access, 'events.html');
    if (access !== 'accepted') assert(!html.includes('Kate Adamala'));
  }
  assert(render('signed-out', null, 'register.html').includes('registration-routes'));
  assert(!render('loading', null, 'register.html').includes('registration-routes'), 'loading must not flash registration options');
  const contact = render('signed-out', null, 'contact.html');
  assert(contact.includes('id="contact-form"') && contact.includes('mailto:exeterbiologysymposium@gmail.com'));
  for (const page of ['account.html', 'contact.html', 'events.html']) {
    const html = render('loading', null, page);
    assert(html.includes('https://www.instagram.com/ebs_2027/'));
    assert(html.includes('https://www.linkedin.com/company/exeter-biology-symposium/'));
  }
  const { pageForUrl } = await vite.ssrLoadModule('/src/navigation.ts');
  for (const page of ['account.html', 'contact.html', 'events.html']) assert.equal(pageForUrl(new URL('https://ebs.test/' + page)), page);
  console.log('PASS: member Account states, Register redirects, safe return paths, accepted Events/assets, public Contact, member navigation, and social links.');
} finally { await vite.close(); }
