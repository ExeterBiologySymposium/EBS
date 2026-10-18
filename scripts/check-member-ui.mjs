import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
  const {AuthContext,initialAuth,AccessNotice}=await vite.ssrLoadModule('/src/auth.tsx');
  const {App}=await vite.ssrLoadModule('/src/site.tsx');
  for(const access of ['checking','pending','unavailable',null]) {
    const state={...initialAuth,status:access===null?'signed-out':'signed-in',access,refreshAccess(){}};
    const html=renderToString(h(AuthContext.Provider,{value:state},h(App,{page:'index.html'})));
    assert(!/href="(?:\/?)(?:resources|datascience|python|rstudio|opensource)\.html/.test(html),`${access} navigation leaked a learning destination`);
    const notice=renderToString(h(AuthContext.Provider,{value:state},h(AccessNotice)));
    assert(notice.length>0);
  }
  const accepted=renderToString(h(AuthContext.Provider,{value:{...initialAuth,status:'signed-in',access:'accepted',refreshAccess(){}}},h(App,{page:'index.html'})));
  assert(accepted.includes('href="resources.html"'));
  assert(accepted.includes('href="datascience.html"'));
  for(const page of ['resources','datascience','python','rstudio','opensource']) {
    const html=renderToString(h(App,{page:page+'.html'}));
    assert(!html.includes('article-body'),`${page} prerenders protected content`);
    assert(!html.includes('project-embed'),`${page} prerenders an external tool`);
  }
  console.log('PASS: Accepted-only navigation, membership notices, and no protected prerendered bodies.');
} finally {await vite.close();}
