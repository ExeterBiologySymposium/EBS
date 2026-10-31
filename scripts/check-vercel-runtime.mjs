import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(pkg.type, 'module', 'Vercel Node functions must load the emitted ES modules.');
for (const file of ['middleware.ts', 'api/access.ts', 'api/participant-folder.ts', 'server/access.ts', 'server/clerk.ts', 'server/participant-folders.ts', 'server/drive/google.ts', 'server/drive/oauth.ts', 'server/drive/config.ts', 'server/drive/store.ts']) {
  const source = await readFile(new URL(file, root), 'utf8');
  for (const match of source.matchAll(/from ['"]([.][^'"]+)['"]/g)) {
    assert(match[1].endsWith('.js'), `${file}: Node ESM imports must resolve emitted JavaScript.`);
  }
}
console.log('PASS: Vercel Node ESM configuration and server import extensions.');
