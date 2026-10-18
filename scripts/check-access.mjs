import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
try {
  const { isProtectedPath, safeReturnTo } = await vite.ssrLoadModule('/src/access-policy.ts');
  const { createAccessHandlers } = await vite.ssrLoadModule('/server/access.ts');
  for (const path of ['/resources.html','/resources','/python/','/%72esources.html','//rstudio.html','/protected-assets/learning-123.js','/enzyme_activity.csv','/guides/file.pdf','/opensource.html','/datascience.html']) assert(isProtectedPath(path), path);
  for (const path of ['/','/index.html','/register.html','/about.html','/assets/main.js','/images/team/photo.jpg']) assert(!isProtectedPath(path), path);
  assert.equal(safeReturnTo('//evil.example'), null);
  assert.equal(safeReturnTo('https://evil.example/python.html'), null);
  assert.equal(safeReturnTo('/python.html#practice'), '/python.html#practice');
  for (const membership of ['pending','unassigned','other']) {
    const handlers = createAccessHandlers({ authenticate: async()=> 'user_a', membership:async()=>membership, enrollPending:async()=>{} });
    const denied=await handlers.protect(new Request('https://www.exeterbiosymposium.page/protected-assets/learning.js'));
    assert.equal(denied.status,403);
    assert.match(denied.headers.get('cache-control'),/no-store/);
    const page=await handlers.protect(new Request('https://www.exeterbiosymposium.page/python.html'));
    assert.equal(page.status,303);
    assert.match(page.headers.get('location'),/^\/register.html\?/);
  }
  const accepted=createAccessHandlers({authenticate:async()=> 'user_a',membership:async()=> 'accepted',enrollPending:async()=>{throw Error('must not enroll accepted');}});
  assert.equal(await accepted.protect(new Request('https://www.exeterbiosymposium.page/resources.html')),null);
  assert.equal((await accepted.enroll(new Request('https://www.exeterbiosymposium.page/api/enroll',{method:'POST',headers:{Origin:'https://www.exeterbiosymposium.page'}}))).status,200);
  const anonymous=createAccessHandlers({authenticate:async()=>null,membership:async()=>{throw Error('must not inspect unauthenticated user');},enrollPending:async()=>{throw Error('must not enroll');}});
  assert.equal((await anonymous.protect(new Request('https://www.exeterbiosymposium.page/enzyme_activity.csv'))).status,401);
  assert.equal(await anonymous.protect(new Request('https://www.exeterbiosymposium.page/about.html')),null);
  let enrolled=[];
  let state='unassigned';
  const pending=createAccessHandlers({authenticate:async()=> 'self_user',membership:async()=>state,enrollPending:async(id)=>{enrolled.push(id);state='pending';}});
  const request=()=>new Request('https://www.exeterbiosymposium.page/api/enroll',{method:'POST',headers:{Origin:'https://www.exeterbiosymposium.page'},body:JSON.stringify({userId:'victim',status:'accepted'})});
  assert.equal((await pending.enroll(request())).status,200);
  assert.equal((await pending.enroll(request())).status,200);
  assert.deepEqual(enrolled,['self_user']);
  assert.equal((await pending.enroll(new Request('https://www.exeterbiosymposium.page/api/enroll',{method:'POST',headers:{Origin:'https://evil.example'}}))).status,403);
  assert.equal((await pending.enroll(new Request('https://www.exeterbiosymposium.page/api/enroll'))).status,405);
  const failed=createAccessHandlers({authenticate:async()=>{throw Error('bad token or configuration');},membership:async()=> 'accepted',enrollPending:async()=>{}});
  assert.equal((await failed.protect(new Request('https://www.exeterbiosymposium.page/protected-assets/a.js'))).status,503);
  console.log('PASS: route normalization, Accepted-only server access, private responses, safe redirects, and self-only idempotent enrollment.');
} finally { await vite.close(); }
