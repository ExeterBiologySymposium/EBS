import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseDocument, DomUtils as D } from 'htmlparser2';
const baseline=JSON.parse(readFileSync('docs/content-baseline.json','utf8'));
const all=(doc,test)=>D.findAll(test,doc.children);
const txt=n=>D.textContent(n).replace(/\s+/g,' ').trim();
const textNodes=n=>n.type==='text'?[n.data.trim()].filter(Boolean):(n.children??[]).flatMap(textNodes);
const docs=()=>Object.fromEntries(['index.html',...Object.keys(baseline)].map(route=>[route,parseDocument(readFileSync(`dist/${route}`,'utf8'))]));
const mode=process.argv[2];
if(mode==='crawl'){
  const result=JSON.parse(readFileSync('.firecrawl/hosted-crawl.json','utf8'));
  assert.equal(result.status,'completed');assert.equal(result.completed,result.total);assert.equal(result.data.length,result.completed);
  const urls=result.data.map(page=>page.metadata.sourceURL||page.metadata.url);
  for(const route of ['/faq','/courses','/about'])assert(urls.some(url=>url.endsWith(route)));
  assert(result.data.every(page=>page.html&&page.markdown));
  console.log(`CRAWL_VERIFIED ${result.data.length} pages saved from ${result.id}`);
} else if(mode==='routes'||mode==='build'){
  const pages=docs();let links=0,codes=0,anchors=0;
  function checkCode(actual,expected){assert.deepEqual(actual,expected);}
  assert.throws(()=>checkCode(['altered'],['preserved']),'Negative control must reject changed lesson code');
  for(const[route,doc]of Object.entries(pages)){
    assert.equal(all(doc,n=>n.name==='h1').length,1,`${route}: one heading`);
    const ids=all(doc,n=>Boolean(n.attribs.id)).map(n=>n.attribs.id);assert.equal(ids.length,new Set(ids).size,`${route}: duplicate ids`);
    if(baseline[route]){
      for(const id of baseline[route].ids){assert(ids.includes(id),`${route}: missing ${id}`);anchors++;}
      const actual=all(doc,n=>n.name==='pre').map(n=>D.textContent(n));checkCode(actual,baseline[route].codes);codes+=actual.length;
    }
    for(const node of all(doc,n=>n.name==='a'||n.name==='img'||n.name==='source'||n.name==='script'||n.name==='link')){
      const value=node.attribs.href||node.attribs.src||node.attribs.srcset;if(!value||/^(https?:|mailto:|data:)/.test(value))continue;
      const url=new URL(value,`https://ebs.local/${route}`);if(url.origin!=='https://ebs.local')continue;
      const path=decodeURIComponent(url.pathname).slice(1)||route;
      assert(existsSync(resolve('dist',path)),`${route}: missing file ${value}`);
      if(url.hash&&pages[path])assert(all(pages[path],n=>n.attribs.id===decodeURIComponent(url.hash.slice(1))).length,`${route}: broken anchor ${value}`);
      links++;
    }
  }
  const faq=pages['faq.html'];assert.equal(all(faq,n=>n.name==='aside').length,0,'FAQ must not reserve a sidebar');
  assert(all(faq,n=>n.name==='details').length>=20,'Full FAQ retained');
  const fixtures=JSON.parse(readFileSync('tests/content-contract.json','utf8'));
  for(const[name,expected]of Object.entries(fixtures))assert.deepEqual(all(pages[name+'.html'],n=>n.name==='table').map(n=>textNodes(n).join(' ').replace(/\s+/g,' ').trim()),expected.tables.map(t=>t.replace(/\s+/g,' ').trim()),`${name}: teaching tables`);
  const home=readFileSync('dist/index.html','utf8');for(const image of ['adrian-chan.jpeg','reya-satam.jpeg','luke-wang.jpg','ebs-team-broad-institute.jpg','EBS Cover Photo.png'])assert(home.includes(image),`Missing subject ${image}`);
  for(const name of ['Jaiden Kim','Dr. Summer Morrill'])assert(txt(pages['team.html']).includes(name));
  const csv=readFileSync('dist/enzyme_activity.csv','utf8').trim();assert.equal(csv,fixtures.python.code.find(code=>code.startsWith('sample_id,')).trim());
  const stats={routes:Object.keys(pages).length,anchors,codes,links};writeFileSync('docs/route-verification.json',JSON.stringify(stats,null,2));
  console.log(`${mode==='build'?'BUILD_VERIFIED':'ROUTES_VERIFIED'} ${JSON.stringify(stats)}`);
} else if(mode==='browser'){
  const result=spawnSync(process.execPath,['scripts/browser-qa.cjs'],{stdio:'inherit',env:process.env});process.exit(result.status??1);
} else throw new Error('Use crawl, routes, build, or browser');
