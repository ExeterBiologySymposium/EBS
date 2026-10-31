import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { readFile } from 'node:fs/promises';

const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { AuthContext, initialAuth } = await vite.ssrLoadModule('/src/auth.tsx');
  const { App } = await vite.ssrLoadModule('/src/site.tsx');
  const render = (state, page) => renderToString(h(AuthContext.Provider, { value: { ...initialAuth, ...state } }, h(App, { page }))).replaceAll('<!-- -->', '');
  for (const teamAccess of ['checking', 'denied', 'unavailable', null]) {
    const html = render({ status: 'signed-in', access: 'accepted', teamAccess }, 'admin.html');
    assert(html.includes('<h1>EBS administration</h1>'));
    assert(!html.includes('Look up account'));
    assert(!html.includes('Pending participants'));
    assert(!render({ status: 'signed-in', teamAccess }, 'account.html').includes('Manage participants'));
  }
  const allowed = { status: 'signed-in', access: 'pending', teamAccess: 'allowed', teamOrganizationId: 'org_team' };
  assert(render(allowed, 'account.html').includes('Manage participants'));
  assert(render(allowed, 'admin.html').includes('Pending participants'));
  assert(render(allowed, 'admin.html').includes('Look up account'));
  assert(render(allowed, 'admin.html').includes('Destination'));
  assert(render(allowed, 'admin.html').includes('value="pending" selected'));
  assert(render({ status: 'signed-out' }, 'admin.html').includes('Sign in'));
  assert(render({ status: 'loading' }, 'accept-invitation.html').includes('Accept your EBS invitation'));
  const { pageForUrl } = await vite.ssrLoadModule('/src/navigation.ts');
  for (const route of ['admin.html', 'accept-invitation.html']) {
    assert.equal(pageForUrl(new URL('https://ebs.test/' + route)), route);
    const source = await readFile(new URL('../' + route, import.meta.url), 'utf8');
    assert(source.includes('noindex,nofollow'));
    assert(!(await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8')).includes('/' + route));
  }
  const { isAccountPath } = await vite.ssrLoadModule('/src/access-policy.ts');
  assert(isAccountPath('/admin.html'));
  assert(isAccountPath('/%61dmin.html'));
  assert(isAccountPath('/accept-invitation.html'));
  console.log('PASS: Team-only Account entry, denied/loading admin views, invitation landing route, navigation and private/noindex route policy.');
} finally { await vite.close(); }
