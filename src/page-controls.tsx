import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownRight, Check, Copy } from 'lucide-react';

export function CodeBlock({ text }: { text: string }) {
  const pre = useRef<HTMLPreElement>(null);
  const [message, setMessage] = useState('Copy code');
  async function copy() {
    try { await navigator.clipboard.writeText(text); setMessage('Copied'); }
    catch {
      if (pre.current) {
        const range = document.createRange(); range.selectNodeContents(pre.current);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        pre.current.focus();
      }
      setMessage('Code selected. Press ⌘C or Ctrl+C.');
    }
  }
  return <div className="code-block"><div className="code-toolbar"><span>Code example</span><button type="button" onClick={copy}>{message === 'Copied' ? <Check size={15} /> : <Copy size={15} />}<span aria-live="polite">{message}</span></button></div><pre ref={pre} tabIndex={0}><code>{text}</code></pre></div>;
}

export function ContactForm({ action, accessKey }: { action: string; accessKey: string }) {
  const [state, setState] = useState<'idle'|'sending'|'sent'|'failed'>('idle');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (request.current || !form.reportValidity()) return;
    const controller = new AbortController(); request.current = controller; setState('sending');
    const timer = window.setTimeout(() => controller.abort(),15000);
    try {
      const response = await fetch(action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
      if (!response.ok || (await response.json()).success !== true) throw new Error('Message rejected');
      setState('sent');
    } catch { setState('failed'); }
    finally { clearTimeout(timer); request.current = null; }
  }
  return <><form id="contact-form" action={action} method="POST" onSubmit={submit} aria-busy={state==='sending'} hidden={state==='sent'}>
    <input type="hidden" name="access_key" value={accessKey} />
    <div className="form-row"><label htmlFor="c-name">Your name<input id="c-name" name="name" autoComplete="name" required /></label><label htmlFor="c-email">Email<input id="c-email" name="email" type="email" autoComplete="email" required /></label></div>
    <label htmlFor="c-role">I am a…<select id="c-role" name="role" defaultValue=""><option value="">Select (optional)</option>{['Student','Teacher / Educator','Researcher / Volunteer','Potential Judge','Parent / Guardian','Other'].map(role=><option key={role}>{role}</option>)}</select></label>
    <label htmlFor="c-subject">Subject<input id="c-subject" name="subject" required /></label>
    <label htmlFor="c-message">Message<textarea id="c-message" name="message" rows={5} required /></label>
    <button className="button" type="submit" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send message'}<ArrowDownRight size={18}/></button>
  </form><p id="contact-status" role="status">{state==='sent'?'Message sent. Thank you for contacting EBS.':state==='failed'?'We could not send your message. Your text is still here; retry or email us.':''}</p><div id="form-success-msg" hidden={state!=='sent'} tabIndex={-1}><h3>Message sent</h3><p>Your message has been sent to the EBS organizing team.</p></div><p className="contact-email">Prefer email? <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a></p></>;
}

type RemoteRow = Record<string,string>;
function useCollection(name: 'schedule_items'|'session_info') {
  const [rows,setRows] = useState<RemoteRow[]|null>(null);
  useEffect(()=>{
    const controller = new AbortController();
    const fields = name === 'schedule_items' ? ['time','event','location'] : ['title','description'];
    const query = new URLSearchParams();
    query.append('queries[]',JSON.stringify({method:'orderAsc',attribute:'order',values:[]}));
    query.append('queries[]',JSON.stringify({method:'limit',values:[100]}));
    const timer = window.setTimeout(()=>controller.abort(),15000);
    fetch(`https://nyc.cloud.appwrite.io/v1/databases/ebs/collections/${name}/documents?${query}`,{headers:{'X-Appwrite-Project':'6a4ae6460030ea485984'},signal:controller.signal})
      .then(async response=>{ if(!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(data=>{
        if(!Array.isArray(data.documents)||!data.documents.length||data.documents.length>100||data.total!==data.documents.length||!data.documents.every((row:RemoteRow)=>row&&fields.every(field=>typeof row[field]==='string'&&row[field].trim()))) return;
        const valid = name==='session_info' ? data.documents.filter((row:RemoteRow)=>row.title.trim().toLowerCase()!=='date') : data.documents;
        if(valid.length&&!controller.signal.aborted) setRows(valid);
      }).catch(()=>{ /* Keep complete, static fallback on service failure. */ }).finally(()=>clearTimeout(timer));
    return ()=>{ controller.abort();clearTimeout(timer); };
  },[name]);
  return rows;
}
export function RemoteSchedule({children}:{children:ReactNode}) {
  const rows=useCollection('schedule_items');
  return rows ? <tbody id="schedule-body">{rows.map((row,i)=><tr key={i}><td>{row.time}</td><td>{row.event}</td><td>{row.location}</td></tr>)}</tbody> : children;
}
export function RemoteSessions({children}:{children:ReactNode}) {
  const rows=useCollection('session_info');
  return rows ? <div id="session-info-grid" className="session-grid">{rows.map((row,i)=><section key={i}><h3>{row.title}</h3><p>{row.description}</p></section>)}</div> : children;
}
