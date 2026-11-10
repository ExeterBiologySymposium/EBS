import { privateHeaders } from '../access.js';
import {pageKey,validateContent,type ContentNode,type PageKey} from '../../src/content/model.js';
import type {ContentStore} from './store.js';
export function createContentHandlers(deps:{authenticate(r:Request):Promise<string|null>;isTeam(u:string):Promise<boolean>;isAccepted(u:string):Promise<boolean>;store:ContentStore;defaults(p:PageKey):Promise<ContentNode[]>}){
 const json=(status:number,value:object)=>Response.json(value,{status,headers:{...privateHeaders,'X-Content-Type-Options':'nosniff'}});
 return async(request:Request)=>{
 try{
 const url=new URL(request.url),page=url.searchParams.get('page'),action=url.searchParams.get('action')||'read';
 if(!pageKey(page)||[...url.searchParams.keys()].some(k=>!['page','action'].includes(k)))return json(400,{error:'Unknown page.'});
 if(!['GET','POST'].includes(request.method))return json(405,{error:'Method not allowed.'});
 if(request.method==='POST'&&(request.headers.get('origin')!==url.origin||request.headers.get('content-type')?.split(';')[0]!=='application/json'))return json(403,{error:'Invalid request origin or content type.'});
 if(!(request.method==='GET'&&action==='read'&&page==='researchers')){
 const actor=await deps.authenticate(request);if(!actor)return json(401,{error:'Sign in to continue.'});
 const allowed=action==='read'&&request.method==='GET'?await deps.isAccepted(actor):await deps.isTeam(actor);
 if(!allowed)return json(403,{error:'Your account does not have access.'});
 if(request.method==='POST'){
 if(!['save','publish','restore'].includes(action))return json(400,{error:'Unknown action.'});
 let text='',size=0;const reader=request.body?.getReader();if(!reader)return json(400,{error:'Missing content.'});
 try{const decoder=new TextDecoder();for(;;){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>250000){await reader.cancel();return json(413,{error:'Page is too large.'});}text+=decoder.decode(next.value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
 let body;try{body=JSON.parse(text);}catch{return json(400,{error:'Invalid JSON.'});}
 if(!body||Object.keys(body).sort().join(',')!==(action==='save'?'content,revision':action==='restore'?'revision,version':'revision')||!Number.isSafeInteger(body.revision)||body.revision<0)return json(400,{error:'Invalid revision.'});
 const current=await deps.store.read(page);
 if((current?.revision||0)!==body.revision)return json(409,{error:'Another editor saved this page. Your changes are retained; reload before saving.'});
 let content:ContentNode[];
 try{if(action==='restore'){const version=(await deps.store.history(page)).find(v=>v.revision===body.version);if(!version)throw Error('Version unavailable.');content=validateContent(version.content);}else if(action==='publish'){content=validateContent(current?.draft||await deps.defaults(page));}else content=validateContent(body.content);}catch(e){return json(400,{error:e instanceof Error?e.message:'Invalid content.'});}
 const result=await deps.store.save(page,body.revision,content,actor,action==='publish');return result?json(200,result):json(409,{error:'Another editor saved this page. Reload before saving.'});
 }
 }
 if(!['read','edit','history'].includes(action))return json(400,{error:'Unknown action.'});
 if(action==='history')return json(200,{versions:await deps.store.history(page)});
 const record=await deps.store.read(page);
 if(action==='read')return json(200,{content:validateContent(record?.published||await deps.defaults(page))});
 return json(200,record||{revision:0,draft:await deps.defaults(page),published:null});
 }catch{return json(503,{error:'Content is unavailable. Please retry. Your local edits have been retained.'});}
 };
}
