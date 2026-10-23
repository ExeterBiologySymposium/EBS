import assert from 'node:assert/strict';
import {createServer} from 'vite';
const vite=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
try {
 const {pageForUrl,eligibleLink}=await vite.ssrLoadModule('/src/navigation.ts');
 const base=new URL('https://ebs.example/about.html');
 assert.equal(pageForUrl(new URL('/',base)),'index.html');
 assert.equal(pageForUrl(new URL('/python.html',base)),'python.html');
 assert.equal(pageForUrl(new URL('/guides/file.pdf',base)),null);
 const anchor=(href,attrs={})=>({href:new URL(href,base).href,target:'',hasAttribute:name=>name in attrs,...attrs});
 const click={button:0,defaultPrevented:false,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false};
 assert(eligibleLink(click,anchor('/faq.html'),base));
 for(const [event,link] of [[{...click,ctrlKey:true},anchor('/faq.html')],[click,anchor('/faq.html',{target:'_blank'})],[click,anchor('/faq.html',{download:''})],[click,anchor('https://external.example/faq.html')],[click,anchor('/about.html#main')],[click,anchor('/guides/file.pdf')]])assert(!eligibleLink(event,link,base));
 console.log('PASS: known routes and native behavior for hashes, external/download/new-tab/modified links.');
} finally {await vite.close()}
