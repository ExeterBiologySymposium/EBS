import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite = await createServer({ configLoader:'runner', server:{middlewareMode:true,hmr:false,ws:false} });
let validate, handlers;
try { ({validateContent:validate}=await vite.ssrLoadModule('/src/content/model.ts')); ({createContentHandlers:handlers}=await vite.ssrLoadModule('/server/content/handlers.ts')); } finally { await vite.close(); }
const doc = [{tag:'section',props:{className:'section'},children:[{tag:'h2',props:{},children:['Example']}]}];
test('content rejects executable elements and unsafe URLs',()=>{
 assert.deepEqual(validate(doc),doc);
 for(const value of [[{tag:'script',props:{},children:['alert(1)']}],[{tag:'img',props:{src:'javascript:alert(1)',alt:'x'},children:[]}],[{tag:'p',props:{onClick:'bad'},children:[]}]]) assert.throws(()=>validate(value));
});
test('published audience and Team draft access are enforced independently',async()=>{
 for(const actor of [null,'pending','accepted','team']){
 const api=handlers({authenticate:async()=>actor,isTeam:async u=>u==='team',isAccepted:async u=>u==='accepted',store:{read:async()=>({draft:doc,published:doc,revision:0}),history:async()=>[]},defaults:async()=>doc});
 for(const [page,action,expected] of [['researchers','read',200],['resources','read',actor==='accepted'?200:actor?403:401],['researchers','edit',actor==='team'?200:actor?403:401]]){
 const res=await api(new Request(`https://ebs.test/api/page-content?page=${page}&action=${action}`)); assert.equal(res.status,expected); assert.match(res.headers.get('cache-control'),/no-store/); if(action==='read'&&res.ok) assert.equal('draft' in await res.json(),false);
 }
 }
});
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
const loader=await createServer({configLoader:'runner',server:{middlewareMode:true,hmr:false,ws:false}});
let createStore;try{({createContentStore:createStore}=await loader.ssrLoadModule('/server/content/store.ts'));}finally{await loader.close();}
test('all initial pages validate and retain public/member content',async()=>{
 for(const page of ['researchers','resources','datascience','python','rstudio']){const content=JSON.parse(await readFile(new URL(`../server/content/${page}.json`,import.meta.url),'utf8'));assert.deepEqual(validate(content),content);}
 const research=await readFile(new URL('../server/content/researchers.json',import.meta.url),'utf8');assert.match(research,/Wet-lab projects will be accepted/);assert.match(research,/RegistrationLink/);assert.match(research,/December 18, 2026/);
});
test('SQL draft isolation, concurrent saves, atomic publications, history, cross-instance isolation and API restoration',async()=>{
 const db=new PGlite();try{
 await db.exec(await readFile(new URL('./sql/page-content.sql',import.meta.url),'utf8'));
 const q=async(s,p)=>(await db.query(s,p)).rows;
 const store=createStore(q,'ins_one'),other=createStore(q,'ins_two');
 assert.equal(await store.read('researchers'),null);
 const first=await store.save('researchers',0,doc,'user_one',false);assert.equal(first.revision,1);assert.equal(first.published,null);
 const races=await Promise.all([store.save('researchers',1,doc,'user_two',false),store.save('researchers',1,doc,'user_three',false)]);assert.equal(races.filter(Boolean).length,1);
 assert.equal(await other.read('researchers'),null);
 const publication=await store.save('researchers',2,doc,'user_one',true);assert.equal(publication.revision,3);assert.deepEqual(publication.published,doc);assert.equal((await store.history('researchers')).length,1);
 const edit=[{tag:'p',props:{},children:['Changed']}];await store.save('researchers',3,edit,'user_one',false);assert.deepEqual((await store.read('researchers')).published,doc);
 const api=handlers({authenticate:async()=> 'team',isTeam:async()=>true,isAccepted:async()=>false,store,defaults:async()=>doc});
 const post=(action,body,origin='https://ebs.test')=>api(new Request(`https://ebs.test/api/page-content?page=researchers&action=${action}`,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}));
 assert.equal((await post('save',{revision:3,content:edit})).status,409);
 assert.equal((await post('save',{revision:4,content:edit},'https://evil.test')).status,403);
 assert.equal((await post('save',{revision:4,content:[{tag:'script',props:{},children:[]}]})).status,400);
 const restored=await post('restore',{revision:4,version:3});assert.equal(restored.status,200);assert.deepEqual((await restored.json()).draft,doc);
 assert.equal((await post('publish',{revision:5})).status,200);assert.equal((await store.history('researchers')).length,2);
 }finally{await db.close();}
});
