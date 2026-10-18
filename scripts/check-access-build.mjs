import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..','dist');
const chunks=await readdir(resolve(root,'protected-assets'));
assert(chunks.some(name=>/^learning-.*\.js$/.test(name)));
const publicJs=(await Promise.all((await readdir(resolve(root,'assets'))).filter(name=>name.endsWith('.js')).map(name=>readFile(resolve(root,'assets',name),'utf8')))).join('\n');
assert(!publicJs.includes('No institutional login required for most resources.'));
assert(!publicJs.includes('df.to_csv('));
assert(!/\bimport\s*[^;]*?\bfrom\s*["'][^"']*protected-assets/.test(publicJs), 'Public JavaScript must not statically import protected modules.');
assert(!/sk_(?:live|test)_[A-Za-z0-9]{16,}/.test(publicJs));
for (const file of (await readdir(root)).filter(name=>name.endsWith('.html'))) {
  const html=await readFile(resolve(root,file),'utf8');
  assert(!/<script[^>]+src=["'][^"']*protected-assets/.test(html), file + ': no protected startup scripts');
  assert(!/<link[^>]+(?:modulepreload|preload)[^>]+protected-assets/.test(html));
}
for(const page of ['resources','datascience','python','rstudio','opensource']) {
  const html=await readFile(resolve(root,page+'.html'),'utf8');
  assert(!html.includes('class="article-body"'));
  assert(!html.includes('project-embed'));
  assert(!/<link[^>]+modulepreload[^>]+protected-assets/.test(html));
}
assert(!chunks.some(name=>name.endsWith('.map')));
console.log('PASS: protected lesson chunks are separate, public JS/HTML excludes lesson bodies, no protected preloads/maps or secret keys.');
