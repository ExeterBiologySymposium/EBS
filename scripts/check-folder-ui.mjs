import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { ResearchFolderView, folderResponse } = await vite.ssrLoadModule('/src/research-folder.tsx');
  for (const state of ['loading', 'empty', 'processing', 'needs-review', 'identity-changed', 'link-google', 'unavailable', 'signed-out', 'forbidden']) {
    const html = renderToStaticMarkup(h(ResearchFolderView, { value: { state }, busy: false, onAction() {}, onAccount() {} }));
    assert(html.includes('role="status"'), state);
    assert(!html.includes('href="https://drive.google.com'), state + ' must not expose links');
    if (['needs-review', 'identity-changed'].includes(state)) assert(!html.includes('<button'), 'uncertain operations require staff review');
    if (state === 'link-google') assert(html.includes('Link Google account') && html.includes('Check again'));
  }
  const busy = renderToStaticMarkup(h(ResearchFolderView, { value: { state: 'empty' }, busy: true, onAction() {}, onAccount() {} }));
  assert(busy.includes('disabled=""') && busy.includes('aria-busy="true"'));
  assert.equal(folderResponse({ state: 'ready', folderUrl: 'javascript:alert(1)', documentUrl: 'https://docs.google.com/document/d/doc/edit' }).state, 'unavailable');
  assert.equal(folderResponse({ state: 'ready', folderUrl: 'https://drive.google.com.evil.test/drive/folders/folder', documentUrl: 'https://docs.google.com/document/d/doc/edit' }).state, 'unavailable');
  assert.equal(folderResponse({ state: 'surprise' }).state, 'unavailable');
  const ready = folderResponse({ state: 'ready', folderUrl: 'https://drive.google.com/drive/folders/folder', documentUrl: 'https://docs.google.com/document/d/doc/edit' });
  const html = renderToStaticMarkup(h(ResearchFolderView, { value: ready, busy: false, onAction() {}, onAccount() {} }));
  assert(html.includes('Open my folder') && html.includes('Open research document'));
  assert(html.includes('noopener noreferrer'));
  console.log('PASS: accessible folder states, disabled submission, account-link guidance, staff review, and Google link validation.');
} finally { await vite.close(); }
