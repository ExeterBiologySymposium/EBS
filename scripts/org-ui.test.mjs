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
  // Student copy: use the EBS account email, then review, Account access and the welcome email.
  const signup = render({ status: 'signed-out' }, 'student-signup.html');
  assert(signup.includes('In the Researcher Email field, enter the email you use to sign in to EBS.'));
  assert(signup.includes('the team sends you a welcome email from exeterbiosymposium@gmail.com with next steps.'));
  assert(!signup.includes('Open student application'));
  const signedInSignup = render({ status: 'signed-in', access: 'pending' }, 'student-signup.html');
  assert(signedInSignup.includes('Open student application'));
  const profile = { fullName: 'Taylor & Avery', verifiedEmail: 'taylor+ebs@example.test' };
  const withProfile = { status: 'signed-in', access: 'pending', registrationProfile: profile };
  const iframeUrl = html => {
    const source = /<iframe[^>]*src="([^"]+)"/.exec(html)?.[1];
    assert.ok(source, 'signed-in registration embeds the form');
    return new URL(source.replaceAll('&amp;', '&'));
  };
  assert.doesNotMatch(signup, /<iframe/);
  const application = render(withProfile, 'student-signup.html');
  const embedded = iframeUrl(application);
  assert.equal(embedded.origin, 'https://docs.google.com');
  assert.equal(embedded.searchParams.get('embedded'), 'true');
  assert.equal(embedded.searchParams.get('entry.327609807'), profile.fullName);
  assert.equal(embedded.searchParams.get('entry.1433419627'), profile.verifiedEmail);
  assert.match(application, /target="_blank" rel="noopener noreferrer">Open student application/);
  assert.equal(iframeUrl(signedInSignup).searchParams.has('entry.1433419627'), false);
  const { default: SignupPage } = await vite.ssrLoadModule('/src/pages/student-signup.tsx');
  const { EditorialDefaults, EditorialPreview } = await vite.ssrLoadModule('/src/content/page-copy.tsx');
  const { definition } = await vite.ssrLoadModule('/src/content/copy/student-signup.ts');
  const { studentApplicationForm, shortStudentApplicationForm } = await vite.ssrLoadModule('/src/content/urls.ts');
  const { initialFields } = await vite.ssrLoadModule('/src/content/fields.ts');
  assert.equal(embedded.origin + embedded.pathname, studentApplicationForm);
  const defaults = initialFields(definition);
  const formWith = href => renderToString(h(AuthContext.Provider, { value: { ...initialAuth, ...withProfile } }, h(EditorialDefaults, {
    page: 'student-signup', content: { ...defaults, beforeApply: { ...defaults.beforeApply, hrefOpenStudentApplication: href } },
  }, h(SignupPage))));
  assert.equal(iframeUrl(formWith(shortStudentApplicationForm)).searchParams.get('entry.1433419627'), profile.verifiedEmail);
  const replacement = formWith('https://forms.gle/futureForm');
  assert.match(replacement, /href="https:\/\/forms\.gle\/futureForm"/);
  assert.doesNotMatch(replacement, /<iframe|entry\.327609807|taylor\+ebs/);
  const preview = renderToString(h(AuthContext.Provider, { value: { ...initialAuth, ...withProfile } }, h(EditorialPreview, {
    page: 'student-signup', content: defaults, workspace: 'participants',
  }, h(SignupPage))));
  assert.doesNotMatch(preview, /<iframe|entry\.327609807|taylor\+ebs/);
  const faqPage = render({ status: 'signed-out' }, 'faq.html');
  assert(faqPage.includes('id="application-process"'));
  assert(faqPage.includes('the team sends you a welcome email from exeterbiosymposium@gmail.com'));
  assert(!/orientation|Zoom/i.test(faqPage.replace(/<dialog[\s\S]*?<\/dialog>/, '')));
  const { isAccountPath } = await vite.ssrLoadModule('/src/access-policy.ts');
  assert(isAccountPath('/admin.html'));
  assert(isAccountPath('/%61dmin.html'));
  assert(isAccountPath('/accept-invitation.html'));
  console.log('PASS: Team-only Account entry, denied/loading admin views, student registration copy, invitation landing route, navigation and private/noindex route policy.');
} finally { await vite.close(); }
