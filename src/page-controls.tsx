import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownRight, Check, Copy } from 'lucide-react';
import { ensureKeynote, scheduleLocation, symposiumVenue, type ScheduleRow } from './schedule-details';

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

type HCaptchaApi = {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
  reset(id: string): void;
};
type CaptchaWindow = Window & { hcaptcha?: HCaptchaApi; ebsHCaptchaReady?: () => void };
let captchaLoad: Promise<HCaptchaApi> | null = null;
function loadCaptcha(): Promise<HCaptchaApi> {
  if (captchaLoad) return captchaLoad;
  const host = window as CaptchaWindow;
  if (host.hcaptcha) return Promise.resolve(host.hcaptcha);
  captchaLoad = new Promise<HCaptchaApi>((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      delete host.ebsHCaptchaReady;
      captchaLoad = null;
      reject(new Error('CAPTCHA unavailable'));
    };
    const timer = window.setTimeout(fail, 15000);
    host.ebsHCaptchaReady = () => {
      if (!host.hcaptcha) { fail(); return; }
      clearTimeout(timer);
      delete host.ebsHCaptchaReady;
      resolve(host.hcaptcha);
    };
    script.src = 'https://js.hcaptcha.com/1/api.js?onload=ebsHCaptchaReady&render=explicit&recaptchacompat=off';
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return captchaLoad;
}

export function ContactForm({ action, accessKey }: { action: string; accessKey: string }) {
  const [state, setState] = useState<'idle'|'sending'|'sent'|'failed'|'captcha'>('idle');
  const [captchaError, setCaptchaError] = useState(false);
  const captcha = useRef<HTMLDivElement>(null);
  const captchaToken = useRef('');
  const widget = useRef<{ api: HCaptchaApi; id: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    let disposed = false;
    loadCaptcha().then(api => {
      if (disposed || !captcha.current) return;
      const id = api.render(captcha.current, {
        // Web3Forms' documented public site key for its free hCaptcha integration.
        sitekey: '50b2fe65-b00b-4b9e-ad62-3ba471098be2',
        callback: (token: string) => {
          if (disposed) return;
          captchaToken.current = token;
          setCaptchaError(false);
          setState(current => current === 'captcha' ? 'idle' : current);
        },
        'expired-callback': () => { if (!disposed) captchaToken.current = ''; },
        'error-callback': () => { if (!disposed) { captchaToken.current = ''; setCaptchaError(true); } },
      });
      widget.current = { api, id };
    }).catch(() => { if (!disposed) setCaptchaError(true); });
    return () => {
      disposed = true;
      captchaToken.current = '';
      if (widget.current) {
        widget.current.api.remove(widget.current.id);
        widget.current = null;
      }
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (request.current || !form.reportValidity()) return;
    if (!captchaToken.current.trim()) { setState('captcha'); return; }
    const controller = new AbortController(); request.current = controller; setState('sending');
    const timer = window.setTimeout(() => controller.abort(),15000);
    const data = new FormData(form);
    data.set('h-captcha-response', captchaToken.current);
    try {
      const response = await fetch(action,{method:'POST',body:data,headers:{Accept:'application/json'},signal:controller.signal});
      if (!response.ok || (await response.json()).success !== true) throw new Error('Message rejected');
      setState('sent');
    } catch {
      setState('failed');
      captchaToken.current = '';
      if (widget.current) widget.current.api.reset(widget.current.id);
    }
    finally { clearTimeout(timer); request.current = null; }
  }
  return <><form id="contact-form" action={action} method="POST" onSubmit={submit} aria-busy={state==='sending'} hidden={state==='sent'}>
    <input type="hidden" name="access_key" value={accessKey} />
    <div className="form-row"><label htmlFor="c-name">Your name<input id="c-name" name="name" autoComplete="name" required /></label><label htmlFor="c-email">Email<input id="c-email" name="email" type="email" autoComplete="email" required /></label></div>
    <label htmlFor="c-role">I am a…<select id="c-role" name="role" defaultValue=""><option value="">Select (optional)</option>{['Student','Teacher / Educator','Researcher / Professional','Potential Judge','Parent / Guardian','Other'].map(role=><option key={role}>{role}</option>)}</select></label>
    <label htmlFor="c-subject">Subject<input id="c-subject" name="subject" required /></label>
    <label htmlFor="c-message">Message<textarea id="c-message" name="message" rows={5} required /></label>
    <div ref={captcha} className="h-captcha" data-sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" />
    <button className="button" type="submit" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send message'}<ArrowDownRight size={18}/></button>
  </form><p id="contact-status" role="status">{captchaError?'The CAPTCHA could not load. Refresh the page or email us instead.':state==='sent'?'Message sent. Thank you for contacting EBS.':state==='failed'?'We could not send your message. Your text is still here; retry or email us.':state==='captcha'?'Please complete the CAPTCHA before sending your message.':''}</p><div id="form-success-msg" hidden={state!=='sent'} tabIndex={-1}><h3>Message sent</h3><p>Your message has been sent to the EBS organizing team.</p></div><p className="contact-email">Prefer email? <a href="mailto:exeterbiologysymposium@gmail.com">exeterbiologysymposium@gmail.com</a></p></>;
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
  const scheduleRows = rows ? ensureKeynote(rows as ScheduleRow[]) : null;
  return scheduleRows ? <tbody id="schedule-body">{scheduleRows.map((row,i)=><tr key={i}><td>{row.time}</td><td>{row.event}</td><td>{scheduleLocation(row.location)}</td></tr>)}</tbody> : children;
}
export function RemoteSessions({children}:{children:ReactNode}) {
  const rows=useCollection('session_info');
  return rows ? <div id="session-info-grid" className="session-grid">{rows.map((row,i)=><section key={i}><h3>{row.title}</h3><p>{row.title.trim().toLowerCase()==='venue'?symposiumVenue:row.description}</p></section>)}</div> : children;
}
