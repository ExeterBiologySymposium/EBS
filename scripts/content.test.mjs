import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let access, model, view, auth, createContentHandlers, createContentStore, initialContent, editorialDefinitions;
try {
  access = await vite.ssrLoadModule('/server/access.ts');
  model = await vite.ssrLoadModule('/src/content/model.ts');
  view = await vite.ssrLoadModule('/src/content/view.tsx');
  auth = await vite.ssrLoadModule('/src/auth.tsx');
  ({ createContentHandlers } = await vite.ssrLoadModule('/server/content/handlers.ts'));
  ({ createContentStore } = await vite.ssrLoadModule('/server/content/store.ts'));
  ({ initialContent, editorialDefinitions } = await vite.ssrLoadModule('/server/content/defaults.ts'));
} finally { await vite.close(); }
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); } catch { /* Optional local PostgreSQL test runtime. */ }

const origin = 'https://ebs.test';
const render = (element, state = { status: 'signed-out' }) => renderToStaticMarkup(h(auth.AuthContext.Provider, { value: { ...auth.initialAuth, ...state } }, element));
const lesson = (sections, extra = {}) => ({ eyebrow: '', title: 'Python', lead: '', sections, ...extra });
const text = (body, links = [], extra = {}) => ({ type: 'text', heading: '', body: { text: body, links }, highlight: false, ...extra });
const issuesFor = (page, value) => model.contentIssues(page, value).map(issue => issue.path);

test('initial content validates and preserves the latest copy, layout and access-aware controls', () => {
  for (const page of model.pageKeys) assert.ok(model.sameContent(model.validatePageContent(page, initialContent[page], editorialDefinitions[page]), initialContent[page]), page);
  const research = initialContent.researchers;
  assert.match(research.overview.body.text, /Wet-lab projects will be accepted for presentation on a case-by-case basis/);
  assert.equal(research.timeline.entries.length, 7);
  assert.equal(research.timeline.entries[3].date, 'Friday, December 18, 2026');
  assert.equal(research.registrationUrl, 'https://forms.gle/vgtVrsBm1UbBhwtv9');
  const signedOut = render(h(view.PublishedPage, { page: 'researchers', initial: research }));
  assert.equal(signedOut.match(/<h1>/g).length, 1);
  for (const link of ['href="faq.html"', 'href="schedule.html"', 'href="account.html"', 'href="mailto:exeterbiosymposium@gmail.com"', 'href="/register.html"']) assert.ok(signedOut.includes(link), link);
  assert.ok(signedOut.includes('href="student-signup.html">Register your interest</a>'));
  assert.equal(signedOut.match(/class="timeline__item"/g).length, 7);
  assert.doesNotMatch(signedOut, /Zoom|orientation/i, 'Student research no longer describes an orientation call');
  const accepted = render(h(view.PublishedPage, { page: 'researchers', initial: research }), { status: 'signed-in', access: 'accepted' });
  assert.ok(accepted.includes('href="student-signup.html">Register your interest</a>'));
  const alternate = render(h(view.PublishedPage, { page: 'researchers', initial: { ...research, registrationUrl: 'https://forms.gle/AlternateForm' } }), { status: 'signed-in', access: 'accepted' });
  assert.ok(alternate.includes('href="https://forms.gle/AlternateForm" target="_blank" rel="noopener noreferrer"'));
  assert.ok(accepted.includes('<a class="button secondary" href="resources.html">Browse Resources</a>'));
  const resources = render(h(view.LessonView, { content: initialContent.resources }));
  assert.equal(resources.match(/<img /g).length, 2);
  assert.ok(resources.includes('alt="Student research poster about fungal enzyme inhibitors"'));
  assert.ok(resources.includes('<figcaption>Reya Satam — circadian clock genes and traumatic brain injury</figcaption>'));
  for (const page of ['datascience', 'python', 'rstudio']) assert.match(render(h(view.LessonView, { content: initialContent[page] })), /Coding lessons are coming soon/);
});

test('validation names the field for unsafe links, missing text and malformed content', () => {
  const research = structuredClone(initialContent.researchers);
  research.registrationUrl = 'javascript:alert(1)';
  research.overview.imageSrc = 'data:image/png;base64,AAAA';
  research.overview.areasNote.links[0].phrase = 'Words that are not in the text';
  research.timeline.entries[1].title = ' ';
  research.support.body.links.push({ phrase: 'office hours', url: '//evil.example' });
  research.registration.secondaryPage = 'admin.html';
  research.formats.entries[0].badge = 'Two\nlines';
  assert.deepEqual(issuesFor('researchers', research), [
    'registrationUrl', 'overview.imageSrc', 'overview.areasNote.links.0.phrase', 'timeline.entries.1.title',
    'formats.entries.0.badge', 'support.body.links.2.url', 'registration.secondaryPage',
  ]);
  const unknown = structuredClone(initialContent.resources);
  unknown.sections.push({ type: 'html', heading: '', html: '<script>alert(1)</script>' });
  assert.deepEqual(issuesFor('resources', unknown), ['sections.1']);
  assert.deepEqual(issuesFor('python', { ...lesson([]), script: 'x' }), ['']);
  assert.deepEqual(issuesFor('python', lesson([{ ...text('Hello'), onclick: 'x' }])), ['sections.0']);
  assert.deepEqual(issuesFor('python', lesson([{ type: 'images', heading: '', intro: '', images: [{ src: '/images/a.png', alt: '', caption: '' }] }])), ['sections.0.images.0.alt']);
  assert.deepEqual(issuesFor('python', lesson([{ type: 'list', heading: 'Steps', intro: '', numbered: true, items: [] }])), ['sections.0.items']);
  assert.deepEqual(issuesFor('python', lesson([text('x\u0000y')])), ['sections.0.body.text']);
  assert.deepEqual(issuesFor('python', lesson([text('x'.repeat(20001))])), ['sections.0.body.text']);
  assert.deepEqual(issuesFor('python', lesson(Array.from({ length: 81 }, () => text('x')))), ['sections']);
  assert.deepEqual(issuesFor('python', lesson(Array.from({ length: 12 }, () => ({ type: 'code', heading: '', intro: '', language: '', code: 'x'.repeat(19000) })))), ['']);
  assert.deepEqual(issuesFor('python', lesson('not a list')), ['sections']);
  assert.deepEqual(issuesFor('python', lesson([{ type: 'text', heading: '', body: { text: 'x' }, highlight: false }])), ['sections.0.body'], 'a malformed section is a field problem, not a crash');
  assert.deepEqual(issuesFor('python', lesson([], { title: 'Python\ud800' })), ['title'], 'lone surrogates cannot be stored as PostgreSQL JSON');
  for (const [url, purpose] of [['http://example.com', 'link'], ['//example.com', 'link'], ['/guides/../admin.html', 'link'], ['/guides/%2E%2E/x', 'link'], ['https://user:pass@example.com', 'link'], ['mailto:nobody', 'link'], ['data:text/html,x', 'link'], ['vbscript:x', 'link'], ['/x\\y', 'link'], ['faq.html', 'image'], ['/images/a.png', 'form'], [' https://example.com', 'link'], ['', 'image']]) {
    assert.ok(model.urlProblem(url, purpose), `${purpose} ${url}`);
  }
  for (const [url, purpose] of [['faq.html#research', 'link'], ['#top', 'link'], ['/images/Poster/Luke Poster.jpeg', 'image'], ['/images/Studying/Screenshot 2026-09-10 at 6.02.51 PM.png', 'image'], ['mailto:exeterbiosymposium@gmail.com', 'link'], ['https://forms.gle/vgtVrsBm1UbBhwtv9', 'form']]) {
    assert.equal(model.urlProblem(url, purpose), null, `${purpose} ${url}`);
  }
  assert.equal(model.suggestUrl('team@example.org', 'link'), 'mailto:team@example.org');
  assert.equal(model.suggestUrl('www.ncbi.nlm.nih.gov/gene', 'link'), 'https://www.ncbi.nlm.nih.gov/gene');
  assert.equal(model.suggestUrl('faq.html', 'link'), 'faq.html');
  assert.equal(model.suggestUrl('http://example.com', 'link'), 'http://example.com');
  assert.equal(model.suggestUrl('colab.research.google.com', 'link'), 'https://colab.research.google.com');
  for (const file of ['hello.py', 'setup.sh', 'README.md', 'slides.zip', 'demo.mov']) assert.equal(model.suggestUrl(file, 'link'), file, 'file names never become web addresses');
  assert.equal(model.suggestUrl('poster.png', 'image'), 'poster.png');
  for (const url of ['https:evil.example', 'https:/evil.example']) assert.ok(model.urlProblem(url, 'link'), url);
});

test('readers render editor text, code and links as inert text with safe link attributes', () => {
  const html = render(h(view.LessonView, { content: lesson([
    text('<script>alert(1)</script>\n\nRead the NCBI guide or email us.', [{ phrase: 'NCBI guide', url: 'https://www.ncbi.nlm.nih.gov/' }, { phrase: 'email us', url: 'mailto:team@example.org' }], { heading: 'Start here', highlight: true }),
    { type: 'code', heading: '', intro: 'Run this cell:', language: 'Python', code: '<img src=x onerror=alert(1)>\nprint("hi")' },
    { type: 'list', heading: 'Steps', intro: '', numbered: true, items: ['One', 'Two'] },
    { type: 'links', heading: '', intro: '', links: [{ label: 'FAQ', url: 'faq.html', description: 'Common questions' }] },
  ]) }));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(html.includes('<a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">NCBI guide<span class="sr-only"> (opens in a new tab)</span></a>'));
  assert.ok(html.includes('<a href="mailto:team@example.org">email us</a>'));
  assert.ok(html.includes('<span>Python</span>'));
  assert.ok(html.includes('<div class="callout">'));
  assert.ok(html.includes('<ol class="lesson-list">'));
  // Sections without a heading continue the previous page section.
  assert.equal(html.match(/<section class="section" id="lesson-section-\d+">/g)?.length, 2);
  assert.ok(html.includes('<a href="#lesson-section-1">Start here</a>'));
  assert.ok(html.includes('<a href="#lesson-section-2">Steps</a>'));
  assert.equal(html.match(/<h1>/g).length, 1);
  // Unsaved previews can contain unchecked links; the renderer drops anything unsafe.
  const unsafe = render(h(view.LessonView, { content: lesson([
    text('Click here now.', [{ phrase: 'Click here', url: 'javascript:alert(1)' }]),
    { type: 'images', heading: '', intro: '', images: [{ src: 'data:image/svg+xml,<svg onload=alert(1)>', alt: 'x', caption: 'Unsafe image' }] },
    { type: 'links', heading: '', intro: '', links: [{ label: 'Bad', url: '//evil.example', description: '' }] },
  ]) }));
  assert.ok(!/href="(?:javascript:|\/\/)/.test(unsafe) && !unsafe.includes('<img'));
  assert.ok(unsafe.includes('<p>Click here now.</p>') && unsafe.includes('<figcaption>Unsafe image</figcaption>'));
});

const pages = { public: 'researchers', member: 'resources' };
function memoryStore() {
  const rows = new Map(), history = [];
  return {
    rows,
    async read(page) { return rows.get(page) ?? null; },
    async saveDraft(page, expected, content, actor) {
      const row = rows.get(page);
      if ((row?.revision ?? 0) !== expected) return null;
      const next = { published: null, publishedSchemaVersion: null, publishedRevision: null, publishedAt: null, publishedBy: null, publishedByName: null, ...row, schemaVersion: 1, revision: expected + 1, draft: structuredClone(content), editedAt: new Date().toISOString(), editedBy: actor.id, editedByName: actor.name };
      rows.set(page, next); return next;
    },
    async publish(page, expected, actor) {
      const row = rows.get(page);
      if (!row || row.revision !== expected) return null;
      const publishedAt = new Date().toISOString();
      const next = { ...row, revision: expected + 1, published: structuredClone(row.draft), publishedSchemaVersion: row.schemaVersion, publishedRevision: expected + 1, publishedAt, publishedBy: actor.id, publishedByName: actor.name };
      rows.set(page, next);
      history.push({ page, revision: expected + 1, schemaVersion: 1, publishedAt, publishedBy: actor.id, publishedByName: actor.name, content: structuredClone(row.draft) });
      return next;
    },
    async versions(page, limit) { return history.filter(entry => entry.page === page).sort((a, b) => b.revision - a.revision).slice(0, limit); },
    async version(page, revision) { return history.find(entry => entry.page === page && entry.revision === revision) ?? null; },
  };
}
function api({ actor = null, enabled = true, store = memoryStore(), team = ['user_team'], accepted = ['user_accepted'], initial = page => initialContent[page], name = user => user === 'user_team' ? 'Ada Team' : '', scheduleInitial } = {}) {
  const calls = { authenticate: 0, store: 0 };
  const handler = createContentHandlers({
    enabled,
    authenticate: async () => { calls.authenticate++; return actor; },
    isTeam: async user => team.includes(user),
    isAccepted: async user => accepted.includes(user),
    editorName: async user => name(user),
    store: () => { calls.store++; if (store instanceof Error) throw store; return store; },
    initial, scheduleInitial,
  });
  return { handler, calls, store };
}
const get = (page, action, extra = '') => new Request(`${origin}/api/page-content?page=${page}${action ? '&action=' + action : ''}${extra}`);
const post = (page, action, body, headers = {}) => new Request(`${origin}/api/page-content?page=${page}&action=${action}`, { method: 'POST', headers: { origin, 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
async function call(handler, request) {
  const response = await handler(request);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  return { status: response.status, body: await response.json() };
}

test('every website route has a usable editor and its reader audience is enforced', async () => {
  const { readdir } = await import('node:fs/promises');
  const routes = (await readdir(new URL('..', import.meta.url))).filter(name => name.endsWith('.html')).sort();
  assert.deepEqual(model.pageKeys.map(key => model.contentPages[key].route === '/' ? 'index.html' : model.contentPages[key].route).sort(), routes);
  const anonymous = api().handler;
  const accepted = api({ actor: 'user_accepted' }).handler;
  const team = api({ actor: 'user_team' }).handler;
  const memberRoutes = ['datascience', 'datasets', 'events', 'opensource', 'python', 'resources', 'rstudio'];
  for (const page of model.pageKeys) {
    const editable = await call(team, get(page, 'edit'));
    assert.equal(editable.status, 200, page);
    assert.equal(editable.body.revision, 0, page);
    assert.equal((await call(accepted, get(page, 'edit'))).status, 403, page);
    assert.equal((await call(anonymous, get(page))).status, memberRoutes.includes(page) || page === 'admin' ? 401 : 200, page);
    assert.equal((await call(accepted, get(page))).status, page === 'admin' ? 403 : 200, page);
  }
});

test('Account serves the editorial guidance for the reader’s own state', async () => {
  const copy = structuredClone(initialContent.account);
  copy.visitor.message = 'Visitor copy';
  copy.pendingAccount.whileWait = 'Pending help';
  copy.acceptedAccount.exploreEbs = 'Accepted help';
  copy.team.manageParticipants = 'Team tools';
  for (const [actor, owned] of [[null, ['visitor']], ['user_pending', ['signedIn', 'pendingStatus', 'pendingAccount']],
    ['user_accepted', ['signedIn', 'pendingStatus', 'acceptedStatus', 'acceptedAccount', 'participantHelp']],
    ['user_team', ['signedIn', 'pendingStatus', 'pendingAccount', 'team']]]) {
    const { handler } = api({ actor, enabled: false, initial: () => copy });
    const { status, body } = await call(handler, get('account'));
    assert.equal(status, 200);
    assert.deepEqual(Object.keys(body.content).sort(), ['pageHeading', ...owned].sort(), actor);
  }
});

test('the schedule editor can start from the current feed and publishing supersedes it', async () => {
  const current = structuredClone(initialContent.schedule);
  current.rows[0].event = 'Current remote opening';
  const { handler } = api({ actor: 'user_team', scheduleInitial: async () => ({ content: current, source: 'current-schedule' }) });
  const opened = await call(handler, get('schedule', 'edit'));
  assert.equal(opened.body.initialSource, 'current-schedule');
  assert.equal(opened.body.draft.rows[0].event, 'Current remote opening');
  current.rows[0].event = 'Published opening';
  assert.equal((await call(handler, post('schedule', 'save', { revision: 0, content: current }))).status, 200);
  assert.equal((await call(handler, get('schedule'))).body.published, false);
  // Make the original feed's value differ from the saved draft.
  current.rows[0].event = 'Remote event changed';
  assert.equal((await call(handler, post('schedule', 'publish', { revision: 1 }))).status, 200);
  const { body } = await call(handler, get('schedule'));
  assert.ok(body.published);
  assert.equal(body.content.rows[0].event, 'Published opening');
});

test('only Team members may request the protected event poster for preview', async () => {
  const { createAccessHandlers } = access;
  const poster = '/protected-assets/events/kate-adamala.png';
  const check = (actor, isTeam) => createAccessHandlers({
    authenticate: async () => actor, membership: async () => 'pending', isTeam: async () => isTeam,
    enrollPending: async () => {},
  });
  const preview = new Request(origin + poster + '?preview=1');
  assert.equal((await check(null, false).protect(preview)).status, 401);
  assert.equal((await check('user_pending', false).protect(preview)).status, 403);
  assert.equal((await check('user_team', true).protect(new Request(origin + poster))).status, 403);
  assert.equal(await check('user_team', true).protect(preview), null);
  assert.equal((await check('user_team', true).protect(new Request(origin + '/protected-assets/anything.png?preview=1'))).status, 403);
});

test('page fields reject unsafe images, unsafe registration destinations, and changes to fixed catalog length', () => {
  const home = structuredClone(initialContent.index);
  home.hero.srcEbsStudentsVisitingBroadInstitute = 'data:image/svg+xml,<svg>';
  assert.deepEqual(model.contentIssues('index', home, editorialDefinitions.index).map(issue => issue.path), ['hero.srcEbsStudentsVisitingBroadInstitute']);
  assert.ok(model.urlProblem('https://example.org/collect', 'google-form'));
  assert.ok(model.urlProblem('https://docs.google.com/document/d/abc', 'google-form'));
  assert.equal(model.urlProblem('https://forms.gle/vgtVrsBm1UbBhwtv9', 'google-form'), null);
  const library = structuredClone(initialContent.datasets);
  library.catalog[0].id = library.catalog[1].id;
  assert.deepEqual(model.contentIssues('datasets', library, editorialDefinitions.datasets).map(issue => issue.path), ['catalog.0.id']);
  library.catalog.pop();
  assert.deepEqual(model.contentIssues('datasets', library, editorialDefinitions.datasets).map(issue => issue.path), ['catalog']);
});

test('Student research is public, member pages require Accepted, and editing requires Team', async () => {
  const draft = structuredClone(initialContent.researchers); draft.title = 'Unpublished draft title';
  for (const actor of [null, 'user_pending', 'user_accepted', 'user_team']) {
    const { handler, calls, store } = api({ actor });
    store.rows.set('researchers', { schemaVersion: 1, revision: 1, draft, editedAt: '2026-11-10T00:00:00.000Z', editedBy: 'user_team', editedByName: '', published: null, publishedSchemaVersion: null, publishedRevision: null, publishedAt: null, publishedBy: null, publishedByName: null });
    const publicRead = await call(handler, get(pages.public));
    assert.equal(publicRead.status, 200);
    assert.deepEqual(Object.keys(publicRead.body), ['content']);
    assert.equal(publicRead.body.content.title, 'Student research', 'drafts are never served to readers');
    assert.equal(calls.authenticate, 0, 'public reads do not need an account');
    const expected = (allowed) => actor === null ? 401 : allowed ? 200 : 403;
    const memberRead = await call(handler, get(pages.member));
    assert.equal(memberRead.status, expected(actor === 'user_accepted'));
    if (memberRead.status === 200) assert.deepEqual(Object.keys(memberRead.body), ['content']);
    else assert.ok(!JSON.stringify(memberRead.body).includes('Example posters'));
    const team = actor === 'user_team';
    for (const request of [get(pages.public, 'edit'), get(pages.member, 'edit'), get(pages.public, 'history')]) {
      const result = await call(handler, request);
      assert.equal(result.status, expected(team));
      if (!team) assert.ok(!JSON.stringify(result.body).includes('Unpublished draft title'));
    }
    if (team) assert.equal((await call(handler, post(pages.public, 'save', { revision: 1, content: initialContent.researchers }))).status, 200);
    else {
      for (const request of [post(pages.public, 'save', { revision: 1, content: initialContent.researchers }), post(pages.public, 'publish', { revision: 1 }), post(pages.public, 'restore', { revision: 1, version: 1 })]) {
        assert.equal((await call(handler, request)).status, actor === null ? 401 : 403);
      }
      assert.equal(store.rows.get('researchers').draft.title, 'Unpublished draft title', 'rejected writes change nothing');
    }
  }
});

test('requests are validated before any content is read or written', async () => {
  const { handler, store } = api({ actor: 'user_team' });
  const content = initialContent.researchers;
  const cases = [
    [post(pages.public, 'save', { revision: 0, content }, { origin: 'https://evil.test' }), 403],
    [post(pages.public, 'save', { revision: 0, content }, { 'content-type': 'text/plain' }), 415],
    [new Request(`${origin}/api/page-content?page=researchers&action=save`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }), 403],
    [get('unknown'), 400], [get('researchers', 'read', '&instance=ins_other'), 400], [get('researchers', 'read', '&page=resources'), 400],
    [get('researchers', 'save'), 400], [post('researchers', 'read', {}), 400], [get('researchers', 'version'), 400], [get('researchers', 'version', '&version=0'), 400],
    [new Request(`${origin}/api/page-content?page=researchers`, { method: 'PUT' }), 405],
    [post(pages.public, 'save', { revision: 0, content, page: 'resources' }), 400],
    [post(pages.public, 'save', { revision: -1, content }), 400],
    [post(pages.public, 'publish', { revision: 0 }), 400],
    [post(pages.public, 'save', '{not json'), 400],
    [post(pages.public, 'save', JSON.stringify({ revision: 0, content: { ...content, notes: 'x'.repeat(300000) } })), 413],
  ];
  cases.push([post(pages.public, 'restore', { 'revision,version': 2 }), 400]);
  for (const [request, status] of cases) assert.equal((await call(handler, request)).status, status, `${request.method} ${request.url}`);
  const named = api({ actor: 'user_team', name: () => 'Ada\u0000 Team\ud800' });
  assert.equal((await call(named.handler, post(pages.public, 'save', { revision: 0, content }))).body.editedBy, 'Ada Team\ufffd');
  const invalid = await call(handler, post(pages.public, 'save', { revision: 0, content: { ...content, title: '' } }));
  assert.equal(invalid.status, 400);
  assert.deepEqual(invalid.body.issues, [{ path: 'title', message: 'Enter a page title.' }]);
  assert.equal(store.rows.size, 0);
});

test('before storage is enabled readers get initial content and editing explains setup', async () => {
  const { handler, calls } = api({ actor: 'user_accepted', enabled: false, store: new Error('not configured') });
  assert.deepEqual((await call(handler, get(pages.public))).body.content, initialContent.researchers);
  assert.deepEqual((await call(handler, get(pages.member))).body.content, initialContent.resources);
  assert.equal(calls.store, 0);
  const team = api({ actor: 'user_team', enabled: false, store: new Error('not configured') });
  const edit = await call(team.handler, get(pages.public, 'edit'));
  assert.equal(edit.status, 503);
  assert.equal(edit.body.state, 'not-configured');
  assert.equal((await call(api({ actor: 'user_accepted', enabled: false }).handler, get(pages.public, 'edit'))).status, 403);
});

test('storage failures are explicit and never fall back to initial or draft content', async () => {
  const failing = { read: async () => { throw new Error('database unavailable'); } };
  for (const actor of [null, 'user_accepted']) {
    const { handler } = api({ actor, store: failing });
    const result = await call(handler, get(actor ? pages.member : pages.public));
    assert.equal(result.status, 503);
    assert.equal(result.body.content, undefined);
  }
  const corrupt = memoryStore();
  corrupt.rows.set('researchers', { schemaVersion: 1, revision: 2, draft: initialContent.researchers, published: { title: '<script>' }, publishedSchemaVersion: 1, publishedRevision: 2, publishedAt: 'x', publishedBy: 'user_team', publishedByName: '' });
  assert.equal((await call(api({ store: corrupt }).handler, get(pages.public))).status, 503);
  const future = memoryStore();
  future.rows.set('researchers', { schemaVersion: 2, revision: 2, draft: initialContent.researchers, published: initialContent.researchers, publishedSchemaVersion: 2, publishedRevision: 2, publishedAt: 'x', publishedBy: 'user_team', publishedByName: '' });
  assert.equal((await call(api({ store: future }).handler, get(pages.public))).status, 503);
  // A draft in a newer format does not take the published page down with it.
  const newerDraft = memoryStore();
  newerDraft.rows.set('researchers', { schemaVersion: 2, revision: 3, draft: { future: true }, published: initialContent.researchers, publishedSchemaVersion: 1, publishedRevision: 2, publishedAt: 'x', publishedBy: 'user_team', publishedByName: '' });
  assert.equal((await call(api({ store: newerDraft }).handler, get(pages.public))).status, 200);
  assert.equal((await call(api({ actor: 'user_team', store: newerDraft }).handler, get(pages.public, 'edit'))).status, 503);
  // Broken built-in content fails closed as unavailable, without describing the problem to readers.
  const broken = await call(api({ initial: () => ({ broken: true }) }).handler, get(pages.public));
  assert.equal(broken.status, 503);
  assert.equal(broken.body.issues, undefined);
});

test('drafts, publication, conflicts and restoration follow revisions', async () => {
  const { handler, store } = api({ actor: 'user_team' });
  const first = await call(handler, get(pages.public, 'edit'));
  assert.equal(first.body.revision, 0);
  assert.equal(first.body.liveSource, 'initial');
  assert.deepEqual(first.body.draft, initialContent.researchers);
  assert.equal((await call(handler, post(pages.public, 'publish', { revision: 1 }))).status, 409, 'nothing saved yet');
  const edited = structuredClone(initialContent.researchers); edited.title = 'Student research 2027';
  const saved = await call(handler, post(pages.public, 'save', { revision: 0, content: edited }));
  assert.equal(saved.status, 200);
  assert.equal(saved.body.revision, 1);
  assert.equal(saved.body.editedBy, 'Ada Team');
  assert.equal((await call(handler, get(pages.public))).body.content.title, 'Student research', 'saving a draft leaves the live page unchanged');
  const stale = await call(handler, post(pages.public, 'save', { revision: 0, content: initialContent.researchers }));
  assert.equal(stale.status, 409);
  assert.equal(stale.body.state, 'conflict');
  assert.equal(stale.body.revision, 1);
  assert.equal(store.rows.get('researchers').draft.title, 'Student research 2027', 'a stale save leaves the other version intact');
  const published = await call(handler, post(pages.public, 'publish', { revision: 1 }));
  assert.equal(published.body.revision, 2);
  assert.equal(published.body.liveSource, 'published');
  assert.equal(published.body.publishedBy, 'Ada Team');
  assert.equal((await call(handler, get(pages.public))).body.content.title, 'Student research 2027');
  assert.equal((await call(handler, get(pages.member, 'read'))).status, 403, 'Team members still need Accepted to read member pages');
  assert.equal((await call(handler, post(pages.public, 'publish', { revision: 2 }))).body.state, 'no-changes');
  const again = structuredClone(edited); again.title = 'Third title';
  await call(handler, post(pages.public, 'save', { revision: 2, content: again }));
  await call(handler, post(pages.public, 'publish', { revision: 3 }));
  const history = await call(handler, get(pages.public, 'history'));
  assert.deepEqual(history.body.versions.map(entry => entry.revision), [4, 2]);
  const version = await call(handler, get(pages.public, 'version', '&version=2'));
  assert.equal(version.body.content.title, 'Student research 2027');
  const restored = await call(handler, post(pages.public, 'restore', { revision: 4, version: 2 }));
  assert.equal(restored.body.draft.title, 'Student research 2027');
  assert.equal(restored.body.live.title, 'Third title', 'restoring does not publish');
  assert.equal((await call(handler, get(pages.public))).body.content.title, 'Third title');
  assert.equal((await call(handler, post(pages.public, 'restore', { revision: 5, version: 99 }))).status, 404);
});

test('the schema upgrade preserves saved drafts and publication history', { skip: !PGlite && 'Requires PGlite.' }, async () => {
  const database = new PGlite();
  try {
    const migration = await readFile(new URL('./sql/page-content.sql', import.meta.url), 'utf8');
    const priorSchema = migration.replace(/ADD CONSTRAINT ebs_content_pages_page_key_check CHECK \(page_key IN \([\s\S]*?\)\);/,
      "ADD CONSTRAINT ebs_content_pages_page_key_check CHECK (page_key IN ('researchers', 'resources', 'datascience', 'python', 'rstudio'));");
    assert.notEqual(priorSchema, migration);
    await database.exec(priorSchema);
    const store = createContentStore(async (sql, params) => (await database.query(sql, params)).rows, 'ins_upgrade');
    const actor = { id: 'user_team', name: 'Ada Team' };
    await store.saveDraft('researchers', 0, initialContent.researchers, actor);
    await store.publish('researchers', 1, actor);
    await store.saveDraft('researchers', 2, { ...initialContent.researchers, title: 'Saved draft' }, actor);
    await assert.rejects(() => store.saveDraft('index', 0, initialContent.index, actor), /check constraint/);
    await database.exec(migration);
    await database.exec(migration);
    assert.equal((await store.read('researchers')).draft.title, 'Saved draft');
    assert.equal((await store.read('researchers')).revision, 3);
    assert.equal((await store.version('researchers', 2)).content.title, initialContent.researchers.title);
    for (const page of model.pageKeys.filter(page => page !== 'researchers')) {
      assert.equal((await store.saveDraft(page, 0, initialContent[page], actor)).revision, 1, page);
    }
  } finally { await database.close(); }
});

test('PostgreSQL schema keeps revisions atomic, versions append-only and instances isolated', { skip: !PGlite && 'Install an isolated PostgreSQL-compatible test runtime (@electric-sql/pglite) to run SQL checks.' }, async () => {
  const database = new PGlite();
  try {
    const migration = await readFile(new URL('./sql/page-content.sql', import.meta.url), 'utf8');
    await database.exec(migration);
    await database.exec(migration);
    const query = async (sql, params) => (await database.query(sql, params)).rows;
    const store = createContentStore(query, 'ins_one'), other = createContentStore(query, 'ins_two');
    const actor = { id: 'user_team', name: 'Ada Team' };
    const content = initialContent.researchers;
    assert.equal(await store.read('researchers'), null);
    const first = await store.saveDraft('researchers', 0, content, actor);
    assert.equal(first.revision, 1);
    assert.equal(first.published, null);
    assert.equal(first.editedByName, 'Ada Team');
    assert.equal(await store.saveDraft('researchers', 0, content, actor), null, 'a second first save loses');
    const races = await Promise.all([store.saveDraft('researchers', 1, content, actor), store.saveDraft('researchers', 1, content, { id: 'user_other', name: '' })]);
    assert.equal(races.filter(Boolean).length, 1);
    assert.equal(await other.read('researchers'), null);
    const publishes = await Promise.all([store.publish('researchers', 2, actor), store.publish('researchers', 2, actor)]);
    assert.equal(publishes.filter(Boolean).length, 1);
    const live = publishes.find(Boolean);
    assert.equal(live.revision, 3);
    assert.equal(live.publishedRevision, 3);
    assert.ok(model.sameContent(live.published, content));
    assert.equal((await store.versions('researchers', 50)).length, 1);
    const changed = structuredClone(content); changed.title = 'Changed';
    const draft = await store.saveDraft('researchers', 3, changed, actor);
    assert.equal(draft.published.title, 'Student research');
    assert.equal(draft.publishedRevision, 3);
    await store.publish('researchers', 4, actor);
    assert.deepEqual((await store.versions('researchers', 50)).map(entry => entry.revision), [5, 3]);
    assert.equal((await store.version('researchers', 3)).content.title, 'Student research');
    assert.equal(await store.version('researchers', 4), null);
    assert.equal(await other.version('researchers', 3), null);
    await assert.rejects(() => database.query("UPDATE ebs_content_versions SET content = '{}'::jsonb"), /cannot be changed/);
    await assert.rejects(() => database.query('DELETE FROM ebs_content_versions'), /cannot be changed/);
    await assert.rejects(() => database.query('TRUNCATE ebs_content_versions'), /cannot be changed/);
    assert.equal((await store.read('researchers')).publishedSchemaVersion, 1);
    await assert.rejects(() => database.query('DELETE FROM ebs_content_pages'), /foreign key/);
    await assert.rejects(() => database.query("INSERT INTO ebs_content_pages (instance_id, page_key, schema_version, revision, draft, edited_by) VALUES ('ins_one', 'unknown', 1, 1, '{}', 'x')"), /check constraint/);
    await assert.rejects(() => database.query("INSERT INTO ebs_content_pages (instance_id, page_key, schema_version, revision, draft, edited_by) VALUES ('other', 'python', 1, 1, '{}', 'x')"), /check constraint/);
    await assert.rejects(() => database.query("INSERT INTO ebs_content_pages (instance_id, page_key, schema_version, revision, draft, edited_by, published) VALUES ('ins_one', 'python', 1, 1, '{}', 'x', '{}')"), /check constraint/, 'a publication needs its revision, time and publisher');

    // The API on real storage: Team edits, public reads, restoration and atomic history.
    const { handler } = api({ actor: 'user_team', store: createContentStore(query, 'ins_api') });
    const save = await call(handler, post('python', 'save', { revision: 0, content: lesson([text('Install Python.')]) }));
    assert.equal(save.status, 200);
    assert.equal((await call(handler, post('python', 'publish', { revision: 1 }))).status, 200);
    const later = await call(handler, post('python', 'save', { revision: 2, content: lesson([text('Use Google Colab.')]) }));
    assert.equal(later.body.live.sections[0].body.text, 'Install Python.');
    assert.equal((await call(handler, post('python', 'restore', { revision: 3, version: 2 }))).body.draft.sections[0].body.text, 'Install Python.');
    assert.equal((await call(handler, post('python', 'publish', { revision: 4 }))).body.state, 'no-changes');
  } finally { await database.close(); }
});
