import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { Writable } from 'node:stream';
import { createElement } from 'react';
import { renderToPipeableStream, renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

const server = await createServer({ configFile: false, plugins: [react()], server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' });
const baselinePath = new URL('../.planning/specs/faq-baseline-2026-10-31.json', import.meta.url);
const answers = html => [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map(([, body]) => body.replace(/<summary>[\s\S]*?<\/summary>/, ''));
const words = html => html.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ').trim().split(/\s+/).filter(Boolean).length;
try {
  const { default: Faq } = await server.ssrLoadModule('/src/pages/faq.tsx');
  const faq = renderToStaticMarkup(createElement(Faq));
  if (process.argv.includes('--baseline')) {
    const baseline = { questions: answers(faq).length, answerWords: words(answers(faq).join(' ')) };
    await writeFile(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
    console.log('Recorded original FAQ:', baseline);
  } else {
    const { default: Account } = await server.ssrLoadModule('/src/pages/account.tsx');
    const { AuthContext, initialAuth } = await server.ssrLoadModule('/src/auth.tsx');
    const renderAccount = (status, access) => new Promise((resolve, reject) => {
      let html = '';
      const output = new Writable({ write(chunk, _encoding, done) { html += chunk.toString(); done(); } });
      output.on('finish', () => resolve(html));
      output.on('error', reject);
      const stream = renderToPipeableStream(createElement(AuthContext.Provider, { value: { ...initialAuth, status, access } }, createElement(Account)), {
        onAllReady() { stream.pipe(output); }, onError: reject,
      });
    });
    const pending = await renderAccount('signed-in', 'pending');
    assert.match(pending, /While you wait/, 'Pending members need help with their application and approval');
    assert.equal(answers(pending).length, 3, 'Pending has three concise questions');
    assert.match(pending, /href="student-signup.html"/, 'Pending researchers can still submit their application');
    assert.match(pending, /Check approval status/);
    assert.doesNotMatch(pending, /Participant questions|Create my research folder|href="(?:events|resources|datascience)\.html"/);
    assert.match(await renderAccount('signed-in', null), /While you wait/);
    const accepted = await renderAccount('signed-in', 'accepted');
    assert.match(accepted, /Participant questions/, 'Accepted members need contextual research and presentation help');
    assert.equal(answers(accepted).length, 7, 'Accepted has seven concise questions');
    assert.match(accepted, /Create my research folder/);
    assert.match(accepted, /Your research folder/);
    assert.match(accepted, /Coding lessons are coming soon/);
    assert.doesNotMatch(accepted, /While you wait/);
    for (const [status, access] of [['signed-out', null], ['loading', null], ['signed-in', 'checking'], ['signed-in', 'unavailable'], ['unavailable', null]]) {
      const html = await renderAccount(status, access);
      assert.doesNotMatch(html, /While you wait|Participant questions/, `${status}/${access} must not show membership-specific guidance`);
    }
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    assert.equal(answers(faq).length, 12);
    const answerWords = words(answers(faq).join(' '));
    assert.ok(answerWords <= baseline.answerWords / 2, `${answerWords} answer words must be at most half the original ${baseline.answerWords}`);
    for (const [page, expected] of [['schools', 5], ['judges', 3]]) {
      const { default: Page } = await server.ssrLoadModule(`/src/pages/${page}.tsx`);
      assert.equal(answers(renderToStaticMarkup(createElement(Page))).length, expected, `${page} question count`);
    }
    console.log(`Passed account-state checks and FAQ structure: ${baseline.questions} → 12 questions; ${baseline.answerWords} → ${answerWords} answer words (${Math.round(100 * (1 - answerWords / baseline.answerWords))}% shorter). Schools: 5; Judges: 3.`);
  }
} finally {
  await server.close();
}
