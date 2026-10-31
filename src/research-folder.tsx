import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './auth';
import type { FolderResult } from '../server/participant-folders';

type ViewState = Omit<FolderResult, 'state'> & { state: FolderResult['state'] | 'loading' };
// Validate links before rendering even though the endpoint constructs them server-side.
export function folderResponse(body: unknown): FolderResult {
  if (!body || typeof body !== 'object' || !('state' in body)) return { state: 'unavailable' };
  const value = body as FolderResult;
  const states = ['empty', 'processing', 'ready', 'needs-review', 'identity-changed', 'link-google', 'unavailable', 'signed-out', 'forbidden'];
  if (!states.includes(value.state)) return { state: 'unavailable' };
  if (value.state === 'ready' && (!/^https:\/\/drive\.google\.com\/drive\/folders\/[\w-]+$/.test(value.folderUrl || '') || !/^https:\/\/docs\.google\.com\/document\/d\/[\w-]+\/edit$/.test(value.documentUrl || ''))) return { state: 'unavailable' };
  return value;
}
export function ResearchFolderView({ value, busy, onAction, onAccount }: {
  value: ViewState; busy: boolean; onAction(): void; onAccount(): void;
}) {
  const message = busy ? 'Please wait while we prepare your research folder.' : {
    loading: 'Checking your research folder…', empty: 'Create your own research folder with a Google Doc to help you get started.',
    processing: 'Your folder is being prepared. Wait a moment, then check again.',
    ready: 'Your research folder and document are ready.',
    'needs-review': 'We could not confirm that your document finished copying. Contact the EBS team so we can check it before you try again.',
    'identity-changed': 'Your linked Google account has changed. Contact the EBS team to update access to your existing folder.',
    'link-google': 'Link one Google account in your account settings, then check again. Your folder will be shared with that Google account.',
    unavailable: 'Research folders are unavailable right now. Try again later, or contact the EBS team.',
    'signed-out': 'Sign in again to access your research folder.', forbidden: 'Your account needs EBS approval to access research folders.',
  }[value.state];
  return <section className="section" aria-labelledby="research-folder-title">
    <div className="shell">
      <h2 id="research-folder-title">Your research folder</h2>
      <p>Keep your research in one place. You and the EBS organizing team can access your folder.</p>
      <p role="status" aria-live="polite">{message}</p>
      <div className="actions" aria-busy={busy}>
        {value.state === 'ready' ? <>
          <a className="button" href={value.folderUrl} target="_blank" rel="noopener noreferrer">Open my folder<span className="sr-only"> (opens in a new tab)</span></a>
          <a className="button secondary" href={value.documentUrl} target="_blank" rel="noopener noreferrer">Open research document<span className="sr-only"> (opens in a new tab)</span></a>
        </> : <>
          {value.state === 'link-google' && <button className="button" type="button" onClick={onAccount}>Link Google account</button>}
          {!['needs-review', 'identity-changed', 'signed-out', 'forbidden'].includes(value.state) && <button className={`button${value.state === 'link-google' ? ' secondary' : ''}`} type="button" disabled={busy || value.state === 'loading'} onClick={onAction}>
            {busy ? 'Preparing folder…' : value.state === 'loading' ? 'Checking folder…' : value.state === 'empty' ? 'Create my research folder' : 'Check again'}
          </button>}
        </>}
      </div>
      <p className="small">Other participants are not given access. <a href="faq.html#contact">Contact the EBS team</a> if you need help.</p>
    </div>
  </section>;
}
export function ResearchFolder() {
  const { manageAccount } = useContext(AuthContext);
  const [value, setValue] = useState<ViewState>({ state: 'loading' });
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const controller = useRef<AbortController | null>(null);
  async function load(method: 'GET' | 'POST') {
    if (running.current) return;
    running.current = true;
    const request = new AbortController();
    controller.current = request;
    setBusy(method === 'POST');
    try {
      const response = await fetch('/api/participant-folder', { method, credentials: 'same-origin', cache: 'no-store', signal: request.signal });
      const body = folderResponse(await response.json());
      if (!request.signal.aborted) setValue(response.ok || [401, 403, 409, 503].includes(response.status) ? body : { state: 'unavailable' });
    } catch { if (!request.signal.aborted) setValue({ state: 'unavailable' }); }
    finally { if (controller.current === request) { running.current = false; if (!request.signal.aborted) setBusy(false); } }
  }
  useEffect(() => {
    void load('GET');
    return () => { controller.current?.abort(); running.current = false; };
  }, []);
  return <ResearchFolderView value={value} busy={busy} onAction={() => { void load(value.state === 'link-google' ? 'GET' : 'POST'); }} onAccount={manageAccount} />;
}
