import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({ configLoader: 'runner', cacheDir: '.vite-cache', server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
let data, match, page, site, auth, navigation, policy;
try {
  data = await vite.ssrLoadModule('/src/cohorts/projects.ts');
  match = await vite.ssrLoadModule('/src/cohorts/match.ts');
  page = await vite.ssrLoadModule('/src/pages/projects.tsx');
  site = await vite.ssrLoadModule('/src/site.tsx');
  auth = await vite.ssrLoadModule('/src/auth.tsx');
  navigation = await vite.ssrLoadModule('/src/navigation.ts');
  policy = await vite.ssrLoadModule('/src/access-policy.ts');
} finally { await vite.close(); }

const answers = (extra = {}) => ({ ...match.emptyAnswers, ...extra });
const top = extra => match.recommend(answers(extra));
const names = result => [result.first?.project.key ?? null, result.second?.project.key ?? null];

test('cohort data: three platforms, two complete projects each, no internal notes', () => {
  assert.deepEqual(data.platforms.map(platform => platform.key), ['galaxy', 'idep', 'biblioshiny']);
  for (const platform of data.platforms) assert.equal(data.projects.filter(project => project.platform === platform.key).length, 2, platform.key);
  assert.equal(new Set(data.projects.map(project => project.key)).size, 6);
  assert.equal(new Set(data.projects.map(project => project.hook)).size, 6, 'every curiosity question is distinct');
  assert.equal(data.researchFields.length, 14);
  for (const project of data.projects) {
    assert.equal(project.weeks.length, 6, `${project.key} has a six-week plan`);
    assert.ok(project.finishWith.length >= 4, `${project.key} lists what students make`);
    for (const field of Object.keys(project.fields)) assert.ok(data.isFieldKey(field), `${project.key} uses known field ${field}`);
    assert.ok(project.guideUrl === '' || /^https:\/\//.test(project.guideUrl), `${project.key} guide link is empty or https`);
  }
  // Guides in Drive carry mentor notes and placeholders that must never reach students.
  const text = JSON.stringify({ projects: data.projects, platforms: data.platforms, fields: data.researchFields });
  assert.doesNotMatch(text, /MENTOR|\[[A-Z ]+:|delete before sharing|Built around \w+'s/i);
  // Every field leads somewhere: each one is used (affinity 2+) by at least one project.
  for (const field of data.researchFields) assert.ok(data.projects.some(project => (project.fields[field.key] ?? 0) >= 2), field.key);
});

test('each research field on its own points to a sensible project', () => {
  const expected = {
    'systems-biology': 'old-age-or-alzheimers', evolution: 'virus-under-pressure', microbiome: 'itch-germ', cancer: 'tumor-on-the-move',
    epidemiology: 'virus-under-pressure', biostatistics: 'tumor-on-the-move', 'math-biology': 'virus-under-pressure', ecology: 'virus-under-pressure',
    neuroscience: 'old-age-or-alzheimers', pharmacology: 'serotonin-storm', 'health-informatics': 'machines-vs-memory-loss',
    'machine-learning': 'machines-vs-memory-loss', bibliometrics: 'serotonin-storm', 'meta-research': 'machines-vs-memory-loss',
  };
  for (const [field, project] of Object.entries(expected)) assert.equal(top({ fields: [field] }).first.project.key, project, field);
  // Every project can be someone's best match.
  assert.deepEqual(new Set(Object.values(expected)), new Set(data.projects.map(project => project.key)));
});

test('matching combines questions, data, challenge and computer', () => {
  assert.equal(top({}).first, null, 'no answers, no match');
  assert.deepEqual(names(top({ hooks: ['itch-germ'], challenge: 'easier' })), ['itch-germ', 'virus-under-pressure']);
  assert.deepEqual(names(top({ data: 'idep', challenge: 'harder' })), ['tumor-on-the-move', 'old-age-or-alzheimers']);
  assert.equal(top({ data: 'idep', challenge: 'easier' }).first.project.key, 'old-age-or-alzheimers');
  assert.deepEqual(names(top({ fields: ['pharmacology', 'bibliometrics'], data: 'biblioshiny', computer: 'install' })), ['serotonin-storm', 'machines-vs-memory-loss']);
  // A picked question outweighs any single field, but a field plus a matching data choice outweighs a question.
  assert.equal(top({ hooks: ['tumor-on-the-move'], fields: ['neuroscience'] }).first.project.key, 'tumor-on-the-move');
  assert.equal(top({ hooks: ['itch-germ'], fields: ['neuroscience'], data: 'idep' }).first.project.key, 'old-age-or-alzheimers');
  // Ticking every field cannot drown out the rest of the answers.
  assert.equal(top({ fields: data.researchFields.map(field => field.key), data: 'galaxy' }).first.project.platform, 'galaxy');
  const reasons = top({ hooks: ['virus-under-pressure'], fields: ['math-biology'], data: 'galaxy' }).first.reasons;
  assert.equal(reasons.length, 3);
  assert.match(reasons[0], /Why did COVID vaccines need updating/);
  assert.match(reasons[1], /Mathematical biology/);
  assert.match(reasons[2], /Galaxy cohort/);
});

test('Biblioshiny is never recommended without a computer that allows installs', () => {
  for (const computer of ['locked', 'mobile']) {
    const result = top({ hooks: ['machines-vs-memory-loss', 'serotonin-storm'], fields: ['bibliometrics', 'machine-learning'], data: 'biblioshiny', computer });
    for (const pick of [result.first, result.second]) assert.notEqual(pick.project.platform, 'biblioshiny', computer);
    assert.deepEqual(result.ruledOut.map(entry => entry.project.key).sort(), ['machines-vs-memory-loss', 'serotonin-storm'], 'explains what was ruled out');
    assert.ok(result.ranked.filter(entry => entry.blocked).every(entry => entry.project.platform === 'biblioshiny'));
  }
  assert.ok(top({ computer: 'mobile' }).notes.some(note => /full-size screen/.test(note)));
  assert.match(top({ hooks: ['serotonin-storm'], computer: 'unsure' }).first.caution, /install programs/);
  assert.ok(top({ hooks: ['itch-germ'], computer: 'locked' }).first.reasons.some(reason => /Chromebook works/.test(reason)));
  assert.ok(top({ fields: ['ecology'] }).notes.some(note => /None of this round’s projects is an ecology project/.test(note)), 'honest about ecology');
  assert.ok(top({ computer: 'install' }).notes.some(note => /what interests you/.test(note)), 'asks for interests when only the computer is known');
});

test('sign-up message, email link and optional pre-filled form', () => {
  const choices = { first: 'itch-germ', second: 'tumor-on-the-move', computer: 'locked', partner: 'partner' };
  const summary = match.signupSummary(choices);
  assert.equal(summary, [
    'EBS research cohort sign-up', 'Name: ', 'First choice: The Itch Germ (Galaxy)', 'Second choice: Tumor on the Move (iDEP)',
    'Computer: Chromebook or locked school laptop', 'Working: With a partner', 'Partner’s name, if you have one: ',
  ].join('\n'));
  const mail = new URL(match.signupMailto(choices));
  assert.equal(mail.protocol, 'mailto:');
  assert.equal(mail.pathname, 'exeterbiologysymposium@gmail.com');
  assert.equal(mail.searchParams.get('subject'), 'Research cohort sign-up: The Itch Germ');
  assert.equal(mail.searchParams.get('body'), summary + '\n');
  assert.match(match.signupSummary({ first: null, second: null, computer: null, partner: null }), /First choice: Not chosen yet/);

  assert.equal(match.signupFormLink(choices), null, 'no form configured yet');
  const config = { ...data.cohortSignup, formUrl: 'https://docs.google.com/forms/d/e/FORM/viewform', prefill: { firstChoice: 'entry.111', secondChoice: 'entry.222', computer: 'bad id', partner: '' } };
  const form = new URL(match.signupFormLink(choices, config));
  assert.equal(form.searchParams.get('usp'), 'pp_url');
  assert.equal(form.searchParams.get('entry.111'), 'The Itch Germ (Galaxy)');
  assert.equal(form.searchParams.get('entry.222'), 'Tumor on the Move (iDEP)');
  assert.equal([...form.searchParams.keys()].length, 3, 'invalid entry IDs are ignored');
  assert.equal(match.signupFormLink(choices, { ...config, formUrl: 'http://example.com/form' }), null, 'insecure form links are refused');
  assert.equal(match.signupFormLink(choices, { ...config, prefill: { firstChoice: '', secondChoice: '', computer: '', partner: '' } }), config.formUrl);
});

test('saved answers are read defensively', () => {
  assert.equal(match.parseSaved(null), null);
  assert.equal(match.parseSaved('not json'), null);
  assert.equal(match.parseSaved('[1,2]'), null);
  const saved = match.parseSaved(JSON.stringify({
    answers: { hooks: ['itch-germ', 'itch-germ', 'made-up'], fields: ['ecology', 7], data: 'galaxy', challenge: 'impossible', computer: 'locked' },
    first: 'tumor-on-the-move', second: '<script>', partner: 'solo',
  }));
  assert.deepEqual(saved, {
    answers: { hooks: ['itch-germ'], fields: ['ecology'], data: 'galaxy', challenge: null, computer: 'locked' },
    first: 'tumor-on-the-move', second: null, partner: 'solo',
  });
});

test('the page prerenders every question, project and the sign-up, and is a public route', async () => {
  const html = renderToStaticMarkup(h(auth.AuthContext.Provider, { value: { ...auth.initialAuth, status: 'signed-out' } }, h(site.App, { page: 'projects.html' })));
  assert.equal(html.match(/<h1>/g).length, 1);
  assert.ok(html.includes('<h1>Find your research project.</h1>'));
  for (const project of data.projects) {
    assert.ok(html.includes(`id="project-${project.key}"`), project.key);
    assert.ok(html.includes(`id="${project.key}-plan"`), `${project.key} plan anchor`);
  }
  // 6 questions + 14 fields + 4 data + 3 challenge + 4 computer + 3 partner choices, each labelled.
  const markup = renderToStaticMarkup(h(page.default));
  assert.equal(markup.match(/<input /g).length, 34);
  assert.equal(markup.match(/<label class="finder-choice">/g).length, 31);
  assert.ok(markup.includes('Your match appears here.'));
  assert.ok(markup.includes('href="mailto:exeterbiologysymposium@gmail.com?subject='));
  assert.doesNotMatch(markup, /MENTOR/);

  assert.equal(navigation.pageForUrl(new URL('https://ebs.test/projects.html')), 'projects.html');
  assert.equal(policy.isProtectedPath('/projects.html'), false);
  const search = JSON.parse(await readFile(new URL('../src/search-data.json', import.meta.url), 'utf8'));
  assert.ok(search.some(entry => entry.url === 'projects.html'));
  assert.ok((await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8')).includes('/projects.html</loc>'));
  const source = await readFile(new URL('../projects.html', import.meta.url), 'utf8');
  assert.ok(source.includes('<meta name="robots" content="index,follow">'));
  // Linked from the header on every page, and from the homepage FAQ.
  assert.ok(renderToStaticMarkup(h(site.App, { page: 'faq.html' })).includes('href="projects.html"'));
  assert.ok(renderToStaticMarkup(h(site.App, { page: 'index.html' })).includes('<a href="projects.html">Find your project</a>'));
});
