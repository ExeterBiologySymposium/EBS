import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PenLine } from 'lucide-react';
import { AuthContext } from '../auth';
import { ContentRequestError, contentRequest } from './api';
import { initialFields, type Field, type Value } from './fields';
import { urlProblem, type UrlPurpose } from './urls';
import { editorialPages, type EditorialPage } from './pages';

type CopyState = { page: EditorialPage; content: Record<string, unknown>; published: boolean; preview: boolean; workspace?: string };
const CopyContext = createContext<CopyState | null>(null);
const defaults = new WeakMap<Field, object>();

export function usePageCopy<F extends Extract<Field, { type: 'record' }>>(page: EditorialPage, definition: F): Value<F> {
  const state = useContext(CopyContext);
  const content = state?.page === page ? state.content : undefined;
  let initial = defaults.get(definition);
  if (!initial) {
    initial = initialFields(definition) as object;
    defaults.set(definition, initial);
  }
  return (content ? { ...initial, ...content } : initial) as Value<F>;
}

export function useEditorialContent<T>(page: EditorialPage): T {
  const state = useContext(CopyContext);
  if (state?.page !== page) throw new Error('Missing reader content for ' + page);
  return state.content as T;
}

export function EditorialDefaults({ page, content, children }: { page: EditorialPage; content: object; children: ReactNode }) {
  const state = useContext(CopyContext);
  if (state?.page === page && Object.keys(content).every(key => Object.hasOwn(state.content, key))) return children;
  if (state?.page === page) return <CopyContext.Provider value={{ ...state, content: { ...content, ...state.content } }}>{children}</CopyContext.Provider>;
  return <CopyContext.Provider value={{ page, content: content as Record<string, unknown>, published: false, preview: false }}>{children}</CopyContext.Provider>;
}

export function usePageCopyState() { return useContext(CopyContext); }

export function EditorialPreview({ page, content, workspace, children }: { page: EditorialPage; content: object; workspace: string; children: ReactNode }) {
  return <CopyContext.Provider value={{ page, content: content as Record<string, unknown>, published: true, preview: true, workspace }}>{children}</CopyContext.Provider>;
}

/** Values passed to DOM URL attributes always go through the same policy as an editor save. */
export function safeCopyUrl(value: string, purpose: UrlPurpose = 'link') {
  return urlProblem(value, purpose) ? undefined : value;
}

type ReaderCopy = Pick<CopyState, 'content' | 'published'>;

export function EditorialPageCopy({ page, children }: { page: EditorialPage; children: ReactNode }) {
  const { status, access, teamAccess, refreshAccess } = useContext(AuthContext);
  const audience = editorialPages[page].audience;
  const state = audience === 'account' ? (status === 'signed-out' ? 'visitor' : status === 'signed-in' && access === 'accepted' ? 'accepted' :
    status === 'signed-in' && (access === 'pending' || access === null) ? 'pending' : '') + ':' + (teamAccess ?? '') : audience;
  const accountReady = audience !== 'account' || !state.startsWith(':');
  const allowed = accountReady && (audience !== 'accepted' || access === 'accepted') && (audience !== 'team' || teamAccess === 'allowed');
  const [response, setResponse] = useState<ReaderCopy & { state: string }>();
  const [failure, setFailure] = useState<{ state: string; denied: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!allowed) return;
    let at = 0;
    let controller: AbortController | undefined;
    function refresh() {
      if (document.visibilityState === 'hidden' && controller) return;
      if (Date.now() - at < 15000) return;
      at = Date.now();
      controller?.abort();
      const request = controller = new AbortController();
      contentRequest<ReaderCopy>({ page }, { signal: request.signal }).then(result => {
        if (!request.signal.aborted) { setResponse({ ...result, state }); setFailure(null); }
      }).catch(error => {
        if (request.signal.aborted) return;
        const denied = error instanceof ContentRequestError && error.denied;
        if (denied) { setResponse(undefined); refreshAccess(); }
        setFailure({ state, denied });
      });
    }
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [page, allowed, state, attempt, refreshAccess]);
  const failed = allowed && failure?.state === state;
  const denied = failed && failure.denied && audience === 'accepted';
  const current = allowed && response?.state === state ? response : null;
  return <CopyContext.Provider value={current ? { ...current, page, preview: false } : null}>
    {teamAccess === 'allowed' && !(page === 'admin' && new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('view') === 'content') && (audience !== 'accepted' || allowed) && <p className="content-edit-link content-edit-link--overlay">
      <a href={`admin.html?view=content&page=${page}`}><PenLine size={16} aria-hidden="true" />Edit this page</a>
    </p>}
    {failed && allowed && <div className="shell content-notice" role="status">
      <p>{denied ? 'Your account does not have access to this page.' : 'The latest version could not be loaded. You may be seeing older content.'}</p>
      <button className="button secondary" type="button" onClick={() => { setFailure(null); setAttempt(value => value + 1); }}>Try again</button>
    </div>}
    {!denied && children}
  </CopyContext.Provider>;
}
