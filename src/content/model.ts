export const pages = {researchers:'Student research',resources:'Resources',datascience:'Coding',python:'Python',rstudio:'R / RStudio'} as const;
export type PageKey = keyof typeof pages;
export type ContentNode = string | {tag:string;props:Record<string,string>;children:ContentNode[]};
export function pageKey(value:unknown): value is PageKey { return typeof value==='string' && Object.hasOwn(pages,value); }
const tags=new Set(['section','div','p','h1','h2','h3','h4','strong','em','span','ul','ol','li','figure','figcaption','img','a','RegistrationLink','LearningLink','CodeBlock']);
export function safeUrl(value:string,image=false){
 if(/[\u0000-\u0020\\]/.test(value.replaceAll(' ','%20'))||value.startsWith('//'))return false;
 if(value.startsWith('/')||/^[a-z][a-z0-9-]*\.html(?:[?#].*)?$/i.test(value)||value.startsWith('images/'))return !value.includes('..');
 try {const u=new URL(value);return !u.username&&!u.password&&(u.protocol==='https:'||!image&&u.protocol==='mailto:');}catch{return false;}
}
export function validateContent(value:unknown):ContentNode[]{
 let count=0;
 function node(n:unknown,depth:number):ContentNode{
 if(++count>2000||depth>18)throw Error('Content is too large.');
 if(typeof n==='string'){if(n.length>30000)throw Error('Text is too long.');return n;}
 if(!n||typeof n!=='object'||Array.isArray(n))throw Error('Invalid content.');
 const v=n as Record<string,unknown>;
 if(Object.keys(v).sort().join(',')!=='children,props,tag'||typeof v.tag!=='string'||!tags.has(v.tag)||!v.props||typeof v.props!=='object'||Array.isArray(v.props)||!Array.isArray(v.children))throw Error('Invalid content block.');
 const props:Record<string,string>={};
 for(const [key,val]of Object.entries(v.props)){if(!['className','href','src','alt','loading','text','title'].includes(key)||typeof val!=='string'||val.length>30000)throw Error('Invalid field.');if((key==='href'||key==='src')&&!safeUrl(val,key==='src'))throw Error('Use a site link or HTTPS URL.');if(key==='className'&&!/^[a-zA-Z0-9 _-]*$/.test(val))throw Error('Invalid style.');props[key]=val;}
 if(v.tag==='img'&&(!props.src||!props.alt?.trim()))throw Error('Images need a URL and descriptive alt text.');
 return {tag:v.tag,props,children:v.children.map(x=>node(x,depth+1))};
 }
 if(!Array.isArray(value))throw Error('Invalid page.');return value.map(n=>node(n,0));
}
