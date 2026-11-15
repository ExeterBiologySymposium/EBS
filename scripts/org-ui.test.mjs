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
  const { ResearchFolderView, folderResponse } = await vite.ssrLoadModule('/src/research-folder.tsx');
  const custom = { state: 'custom', folderUrl: 'https://files.example.test/shared' };
  assert.deepEqual(folderResponse(custom), custom);
  assert.deepEqual(folderResponse({ ...custom, folderUrl: 'javascript:alert(1)' }), { state: 'unavailable' });
  const folder = renderToString(h(ResearchFolderView, { value: custom, busy: false, onAction() {}, onAccount() {} }));
  assert.match(folder, /href="https:\/\/files\.example\.test\/shared"[^>]*>Open my folder/);
  assert.doesNotMatch(folder, /Open research document|Create my research folder|Link Google account/);
  assert(render({ status: 'signed-out' }, 'admin.html').includes('Sign in'));
  assert(render({ status: 'loading' }, 'accept-invitation.html').includes('Accept your EBS invitation'));
  const { pageForUrl } = await vite.ssrLoadModule('/src/navigation.ts');
  for (const route of ['admin.html', 'accept-invitation.html']) {
    assert.equal(pageForUrl(new URL('https://ebs.test/' + route)), route);
    const source = await readFile(new URL('../' + route, import.meta.url), 'utf8');
    assert(source.includes('noindex,nofollow'));
    assert(!(await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8')).includes('/' + route));
  }
  // Team-only registration tracker link: a valid editable Sheets URL only, opened safely in a new tab.
  const { RegistrationTrackerLink } = await vite.ssrLoadModule('/src/pages/admin.tsx');
  const tracker = url => renderToString(h(RegistrationTrackerLink, { url })).replaceAll('<!-- -->', '');
  const sheet = 'https://docs.google.com/spreadsheets/d/' + 'T'.repeat(44) + '/edit#gid=7';
  const trackerLink = tracker(sheet);
  assert(trackerLink.includes(`<a class="button secondary" href="${sheet}" target="_blank" rel="noopener noreferrer" aria-describedby="registration-tracker-hint">Open registration tracker<span class="sr-only"> (opens in a new tab)</span></a>`));
  assert(trackerLink.includes('After accepting a participant, tick Send welcome email for them in the tracker.'));
  for (const url of [null, '', 'javascript:alert(1)', 'http://docs.google.com/spreadsheets/d/' + 'T'.repeat(44), 'https://docs.google.com/spreadsheets/d/e/2PACX-' + 'T'.repeat(40) + '/pubhtml', 'https://docs.google.com.evil.example/spreadsheets/d/' + 'T'.repeat(44), 'https://user:pass@docs.google.com/spreadsheets/d/' + 'T'.repeat(44)]) assert.equal(tracker(url), '', String(url));
  // The link loads only after a fresh Team check in the browser, so no server-rendered state includes it.
  for (const state of [allowed, { status: 'signed-out' }, { status: 'signed-in', access: 'accepted', teamAccess: 'denied' }]) assert(!render(state, 'admin.html').includes('Open registration tracker'));
  // Student copy: use the EBS account email, then review, Account access and the welcome email.
  const signup = render({ status: 'signed-out' }, 'student-signup.html');
  assert(signup.includes('In the Researcher Email field, enter the email you use to sign in to EBS.'));
  assert(signup.includes('the team sends you a welcome email from exeterbiosymposium@gmail.com with next steps.'));
  assert(signup.includes('Open student application'));
  const faqPage = render({ status: 'signed-out' }, 'faq.html');
  assert(faqPage.includes('id="application-process"'));
  assert(faqPage.includes('the team sends you a welcome email from exeterbiosymposium@gmail.com'));
  assert(!/orientation|Zoom/i.test(faqPage.replace(/<dialog[\s\S]*?<\/dialog>/, '')));
  const { isAccountPath } = await vite.ssrLoadModule('/src/access-policy.ts');
  assert(isAccountPath('/admin.html'));
  assert(isAccountPath('/%61dmin.html'));
  assert(isAccountPath('/accept-invitation.html'));
  console.log('PASS: Team-only Account entry, denied/loading admin views, registration tracker link, student registration copy, invitation landing route, navigation and private/noindex route policy.');
} finally { await vite.close(); }
