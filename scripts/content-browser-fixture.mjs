import {createServer} from 'vite';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
let handler;
const vite=await createServer({configLoader:'runner',server:{host:'127.0.0.1',port:4181,strictPort:true,hmr:false,ws:false},plugins:[{name:'content-fixture',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(req.url.startsWith('/api/page-content')){let body='';for await(const c of req)body+=c;const result=await handler(new Request('http://127.0.0.1:4181'+req.url,{method:req.method,headers:req.headers,...(body?{body}:{})}));res.statusCode=result.status;result.headers.forEach((v,k)=>res.setHeader(k,v));return res.end(await result.text());}
 if(req.url.startsWith('/admin.html')||req.url.startsWith('/researchers.html')){const html=await server.transformIndexHtml('/fixture.html','<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/scripts/content-browser-entry.tsx"></script></body></html>');res.setHeader('Content-Type','text/html');return res.end(html);}next();});}}]});
const {createContentHandlers}=await vite.ssrLoadModule('/server/content/handlers.ts');const {createContentStore}=await vite.ssrLoadModule('/server/content/store.ts');
const db=new PGlite();await db.exec(await readFile(new URL('./sql/page-content.sql',import.meta.url),'utf8'));
handler=createContentHandlers({authenticate:async()=> 'user_fixture',isTeam:async()=>true,isAccepted:async()=>true,store:createContentStore(async(s,p)=>(await db.query(s,p)).rows,'ins_fixture'),defaults:async page=>JSON.parse(await readFile(new URL(`../server/content/${page}.json`,import.meta.url),'utf8'))});
await vite.listen();console.log('Content fixture at http://127.0.0.1:4181/admin.html?view=content');
