import {createElement,useEffect,useState,useContext} from 'react';
import {RegistrationLink,LearningLink,AuthContext} from '../auth';
import {CodeBlock} from '../page-controls';
import {validateContent,type ContentNode,type PageKey} from './model';
export function ContentView({content}:{content:ContentNode[]}){
 function render(node:ContentNode,key:number):React.ReactNode{
 if(typeof node==='string')return node;
 const {tag,props,children}=node;
 if(tag==='CodeBlock')return <CodeBlock key={key} text={props.text||''}/>;
 if(tag==='RegistrationLink')return <RegistrationLink key={key} href={props.href} className={props.className}>{children.map(render)}</RegistrationLink>;
 if(tag==='LearningLink')return <LearningLink key={key} {...props}>{children.map(render)}</LearningLink>;
 return createElement(tag,{...props,key,...(tag==='a'?{rel:'noopener noreferrer'}:{})},...(tag==='img'?[]:children.map(render)));
 }return <>{content.map(render)}</>;
}
export async function contentRequest(page:PageKey,action:string,body?:object,signal?:AbortSignal){
 const response=await fetch(`/api/page-content?page=${page}&action=${action}`,{credentials:'same-origin',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000),...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
 const value=await response.json();if(!response.ok)throw Object.assign(new Error(value.error||'Content request failed.'),{status:response.status});return value;
}
export function PublishedPage({page,initial=[]}:{page:PageKey;initial?:ContentNode[]}){
 const [content,setContent]=useState(initial),[error,setError]=useState(''),[revision,setRevision]=useState(0);const {access,status}=useContext(AuthContext);
 useEffect(()=>{const controller=new AbortController();if(page!=='researchers'&&access!=='accepted'){setContent([]);return;}
 contentRequest(page,'read',undefined,controller.signal).then(v=>{if(!controller.signal.aborted){setContent(validateContent(v.content));setError('');}}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[page,revision,access,status]);
 useEffect(()=>{const refresh=()=>setRevision(r=>r+1);window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh);},[]);
 return <div className={`page-layout layout-${page}`}>{error&&<div className="shell" role="alert"><p>{error}</p><button className="button secondary" onClick={()=>setRevision(r=>r+1)}>Retry latest content</button></div>}{content.length?<ContentView content={content}/>:!error&&<p className="shell" role="status">Loading page content…</p>}</div>;
}
