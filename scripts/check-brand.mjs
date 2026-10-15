import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';

const repo=resolve(import.meta.dirname,'..');
const css=await readFile(resolve(repo,'src/styles.css'),'utf8');
const site=await readFile(resolve(repo,'src/site.tsx'),'utf8');
const controls=await readFile(resolve(repo,'src/page-controls.tsx'),'utf8');
for(const color of ['--crimson:#a31f34','--harkness:#6a243b','--muted:#63666a'])assert.ok(css.includes(color),`Missing approved token ${color}`);
assert.doesNotMatch(css,/font-size:\s*(?:[0-9]|1[0-5])px\b/,'Typography must not reintroduce sub-16px fixed text sizes');
assert.match(css,/\.fact-controls \.autoplay-control\{display:none\}/,'Hero Play/Pause must be hidden');
assert.match(css,/\.site-footer\{background:#63666a;color:#fff\}/);
assert.match(css,/\.exeter-footer-mark\{width:300px;max-width:100%;height:auto/);
assert.match(site,/PEA_ExeterMark_White_Lg\.png/);
assert.match(site,/PEA_Seal_LtGray_Lg\.png/);
assert.doesNotMatch(site,/prefers-color-scheme|ebs-theme/,'Do not reactivate unreviewed dark colors');
assert.match(site,/if\(paused\|\|reduced\)return/,'Respect reduced motion');
assert.match(site,/onFocusCapture=\{\(\)=>setPaused\(true\)\}/,'Fact controls pause on keyboard focus');
assert.match(controls,/action=\{action\} method="POST" onSubmit=\{submit\}/,'Real contact submission must remain');
assert.match(controls,/fetch\(`https:\/\/nyc\.cloud\.appwrite\.io/,'Live collections and fallback must remain');
assert.doesNotMatch(site,/\/public\/|dangerouslySetInnerHTML|Design preview/,'No preview rendering shortcuts in production');
console.log('PASS: brand tokens, 16px floor, footer/seal, hidden control, light palette, reduced motion, and production integration guards.');

if(process.argv.includes('--built')){
  const routes=Object.keys(JSON.parse(await readFile(resolve(repo,'seo.config.json'),'utf8')).pages);
  let refs=0;
  for(const route of routes){
    const html=await readFile(resolve(repo,'dist',route),'utf8');
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`${route}: one h1`);
    assert.match(html,/PEA_ExeterMark_White_Lg\.png/);
    assert.doesNotMatch(html,/Design preview: contact messages are not sent|\/public\/images\//);
    if(route==='index.html')assert.match(html,/PEA_Seal_LtGray_Lg\.png/);
    for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
      const url=match[1].replaceAll('&amp;','&');
      if(/^(?:https?:|mailto:|data:|#)/.test(url))continue;
      const path=decodeURIComponent(url.split('#')[0].split('?')[0]);
      await access(resolve(repo,'dist','.'+(path.startsWith('/')?path:'/'+path)));
      refs++;
    }
    for(const match of html.matchAll(/src[Ss]et="([^"]+)"/g)){
      for(const candidate of match[1].split(',')){
        const path=candidate.trim().split(/\s+/)[0];
        await access(resolve(repo,'dist','.'+(path.startsWith('/')?path:'/'+path)));
        refs++;
      }
    }
  }
  console.log(`PASS: ${routes.length} built routes, ${refs} local links/assets including srcsets, and SSR brand markup.`);
}
