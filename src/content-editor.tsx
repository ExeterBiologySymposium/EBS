import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { ContentRequestError, contentRequest } from './content/api';
import { EditorContext, ErrorSummary, LessonForm, ResearchForm, setIn, type EditorState, type Path } from './content/editor-fields';
import { contentIssues, contentPages, isPageKey, pageKeys, sameContent, validatePageContent, type ContentIssue, type PageContent, type PageKey } from './content/model';
import { PageView } from './content/view';

type EditRecord = {
  page: PageKey; revision: number; draft: PageContent; live: PageContent; liveSource: 'initial' | 'published';
  editedAt: string | null; editedBy: string | null; publishedRevision: number | null; publishedAt: string | null; publishedBy: string | null;
};
type VersionSummary = { revision: number; publishedAt: string; publishedBy: string };
type WriteAction = 'save' | 'publish' | 'restore';
type Notice =
  | { kind: 'success' | 'info' | 'error'; message: string }
  | { kind: 'conflict' }
  | { kind: 'uncertain'; action: WriteAction; sent: PageContent; version?: number; stillOffline?: boolean };

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }) + ' ET' : '';
const verbs: Record<WriteAction, string> = { save: 'save', publish: 'publication', restore: 'restoration' };
function checked(page: PageKey, value: EditRecord): EditRecord {
  return { ...value, draft: validatePageContent(page, value.draft), live: validatePageContent(page, value.live) };
}
function useMounted() {
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return mounted;
}

function Preview({ page, content, label }: { page: PageKey; content: PageContent; label: string }) {
  // Links are inert here so a click cannot leave the editor.
  const stop = (event: ReactMouseEvent) => { if (event.target instanceof Element && event.target.closest('a')) event.preventDefault(); };
  return <div className="content-preview-frame">
    <p className="content-preview-banner">{label}</p>
    <div className="content-preview" onClick={stop}><div className={`page-layout layout-${page}`}><PageView page={page} content={content} /></div></div>
    <p className="content-hint">Links are disabled in previews.</p>
  </div>;
}

export default function ContentEditor({ onDenied }: { onDenied(): void }) {
  const [page, setPage] = useState<PageKey>(() => {
    const requested = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('page');
    return isPageKey(requested) ? requested : 'researchers';
  });
  const [record, setRecord] = useState<EditRecord | null>(null);
  const [draft, setDraft] = useState<PageContent | null>(null);
  const [loadError, setLoadError] = useState('');
  const [setupMessage, setSetupMessage] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview' | 'history'>('edit');
  const [busy, setBusy] = useState<WriteAction | 'check' | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [serverIssues, setServerIssues] = useState<ContentIssue[]>([]);
  const [undo, setUndo] = useState<{ message: string; draft: PageContent } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [reload, setReload] = useState(0);
  const [versions, setVersions] = useState<VersionSummary[] | null>(null);
  const [versionsError, setVersionsError] = useState('');
  const [versionsReload, setVersionsReload] = useState(0);
  const [versionPreview, setVersionPreview] = useState<(VersionSummary & { content: PageContent }) | 'loading' | null>(null);
  const busyRef = useRef(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const recordRef = useRef(record);
  recordRef.current = record;
  const summaryRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const info = contentPages[page];

  const dirty = !!record && !!draft && !sameContent(draft, record.draft);
  const unpublished = !!record && !sameContent(record.draft, record.live);
  const localIssues = useMemo(() => draft ? contentIssues(page, draft) : [], [page, draft]);
  const issues = localIssues.length ? localIssues : serverIssues;
  const issueMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const issue of issues) if (!map.has(issue.path)) map.set(issue.path, issue.message);
    return map;
  }, [issues]);

  // Lost Team access closes the whole administration workspace, including any open draft.
  const denied = useCallback((error: unknown) => {
    if (error instanceof ContentRequestError && error.denied) { onDenied(); return true; }
    return false;
  }, [onDenied]);
  useEffect(() => {
    const controller = new AbortController();
    setRecord(null); setDraft(null); setLoadError(''); setNotice(null); setUndo(null); setShowAll(false); setServerIssues([]); setVersions(null); setVersionPreview(null);
    contentRequest<EditRecord>({ page, action: 'edit' }, { signal: controller.signal })
      .then(value => { const loaded = checked(page, value); setRecord(loaded); setDraft(loaded.draft); })
      .catch(error => {
        if (controller.signal.aborted || denied(error)) return;
        if (error instanceof ContentRequestError && error.detail.state === 'not-configured') setSetupMessage(error.message);
        else setLoadError(error instanceof ContentRequestError ? error.message : 'This page could not be opened for editing.');
      });
    return () => controller.abort();
  }, [page, reload, denied]);

  // Protect unsaved edits from reloads, the site's in-page navigation and Back/Forward.
  useEffect(() => {
    if (!dirty) return;
    const question = 'You have unsaved changes. Leave without saving them?';
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.closest('.content-preview') || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      if (!window.confirm(question)) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const pop = (event: Event) => { if (!window.confirm(question)) event.preventDefault(); };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', click, true);
    window.addEventListener('ebs:before-pop-navigation', pop);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', click, true); window.removeEventListener('ebs:before-pop-navigation', pop); };
  }, [dirty]);

  // Keep keyboard focus from landing underneath the sticky action bar.
  useEffect(() => {
    const reveal = (event: FocusEvent) => {
      const bar = document.querySelector('.content-actionbar');
      if (!bar || !(event.target instanceof Element) || bar.contains(event.target)) return;
      const box = event.target.getBoundingClientRect(), covered = bar.getBoundingClientRect();
      if (box.bottom > covered.top && box.top < covered.bottom) window.scrollBy({ top: box.bottom - covered.top + 24, behavior: 'instant' });
    };
    document.addEventListener('focusin', reveal);
    return () => document.removeEventListener('focusin', reveal);
  }, []);

  useEffect(() => {
    if (mode !== 'history' || !record) return;
    const controller = new AbortController();
    setVersionsError('');
    contentRequest<{ versions: VersionSummary[] }>({ page, action: 'history' }, { signal: controller.signal })
      .then(value => setVersions(value.versions))
      .catch(error => { if (!controller.signal.aborted && !denied(error)) setVersionsError(error instanceof ContentRequestError ? error.message : 'Published versions could not be loaded.'); });
    return () => controller.abort();
  }, [mode, page, !!record, record?.publishedRevision, versionsReload, denied]);

  const change = useCallback<EditorState['change']>((path: Path, next, options) => {
    if (options?.removed && draftRef.current) {
      setUndo({ message: `Removed ${options.removed}.`, draft: draftRef.current });
      setAnnouncement(`Removed ${options.removed}. Select Undo to restore it.`);
    } else setUndo(null);
    setServerIssues([]);
    setDraft(current => current && setIn(current, path, next));
  }, []);
  const editor = useMemo<EditorState>(() => ({ value: draft, change, issues: issueMap, showAll, announce: setAnnouncement }), [draft, change, issueMap, showAll]);

  async function latest() { return checked(page, await contentRequest<EditRecord>({ page, action: 'edit' })); }
  /** Accepts the server's record, keeping any edits typed while the request was in flight. */
  function accept(value: EditRecord, sent: PageContent) {
    setRecord(value);
    setDraft(local => local && sameContent(local, sent) ? value.draft : local);
  }
  function failed(error: unknown, action: WriteAction, sent: PageContent, version?: number) {
    if (denied(error)) return;
    if (!(error instanceof ContentRequestError)) { setNotice({ kind: 'error', message: 'Something went wrong. Your edits are still here.' }); return; }
    const state = error.detail.state;
    if (state === 'not-configured') { setSetupMessage(error.message); return; }
    if (state === 'conflict') { setNotice({ kind: 'conflict' }); return; }
    if (state === 'no-changes') {
      setNotice({ kind: 'info', message: 'These changes are already live.' });
      latest().then(value => { if (mounted.current) accept(value, sent); }).catch(() => {});
      return;
    }
    if (state === 'invalid' && Array.isArray(error.detail.issues)) { setServerIssues(error.detail.issues as ContentIssue[]); setShowAll(true); }
    // Without a definite answer the write may have happened: check before anything is retried.
    if (error.uncertain) { setNotice({ kind: 'uncertain', action, sent, version }); return; }
    setNotice({ kind: 'error', message: error.message });
  }
  async function run(action: WriteAction | 'check', task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(action);
    try { await task(); }
    finally { busyRef.current = false; if (mounted.current) setBusy(null); }
  }

  function save(revision?: number) {
    const current = recordRef.current, sent = draftRef.current;
    if (!current || !sent) return;
    const problems = contentIssues(page, sent);
    if (problems.length) {
      setShowAll(true); setNotice(null);
      requestAnimationFrame(() => requestAnimationFrame(() => summaryRef.current?.focus()));
      return;
    }
    return run('save', async () => {
      setNotice(null);
      try {
        const value = checked(page, await contentRequest<EditRecord>({ page, action: 'save' }, { body: { revision: revision ?? current.revision, content: sent } }));
        if (!mounted.current) return;
        accept(value, sent); setUndo(null); setShowAll(false);
        setNotice({ kind: 'success', message: `Draft saved ${when(value.editedAt)}. Readers will not see it until you publish.` });
      } catch (error) { if (mounted.current) failed(error, 'save', sent); }
    });
  }
  function publish() {
    const current = recordRef.current;
    if (!current || dirty || !unpublished) return;
    return run('publish', async () => {
      setNotice(null);
      try {
        const value = checked(page, await contentRequest<EditRecord>({ page, action: 'publish' }, { body: { revision: current.revision } }));
        if (!mounted.current) return;
        accept(value, current.draft);
        setNotice({ kind: 'success', message: `Published ${when(value.publishedAt)}. Readers see this version the next time they open ${info.label}.` });
      } catch (error) { if (mounted.current) failed(error, 'publish', current.draft); }
    });
  }
  function restore(version: VersionSummary) {
    const current = recordRef.current;
    if (!current || busyRef.current) return;
    if (dirty && !window.confirm('Replace your unsaved edits with this published version?')) return;
    return run('restore', async () => {
      setNotice(null);
      try {
        const value = checked(page, await contentRequest<EditRecord>({ page, action: 'restore' }, { body: { revision: current.revision, version: version.revision } }));
        if (!mounted.current) return;
        setRecord(value); setDraft(value.draft); setUndo(null); setVersionPreview(null); setMode('preview');
        setNotice({ kind: 'info', message: `The version published ${when(version.publishedAt)} is now your draft. Review it below, then select Publish to make it live.` });
      } catch (error) { if (mounted.current) failed(error, 'restore', current.draft, version.revision); }
    });
  }
  /** Reconciles an unconfirmed write with the server instead of repeating it blindly. */
  function check(pending: Extract<Notice, { kind: 'uncertain' }>) {
    const before = recordRef.current;
    if (!before) return;
    return run('check', async () => {
      try {
        const server = await latest();
        const target = pending.action === 'restore' && pending.version
          ? validatePageContent(page, (await contentRequest<{ content: unknown }>({ page, action: 'version', version: String(pending.version) })).content)
          : pending.sent;
        if (!mounted.current) return;
        if (pending.action === 'publish') {
          setRecord(server);
          if (server.liveSource === 'published' && sameContent(server.live, target)) setNotice({ kind: 'success', message: `Your changes were published ${when(server.publishedAt)}.` });
          else if (server.revision === before.revision) setNotice({ kind: 'info', message: 'Your changes were not published. Select Publish to try again.' });
          else { setDraft(local => local && sameContent(local, before.draft) ? server.draft : local); setNotice({ kind: 'info', message: 'This page changed while you were publishing. Review the latest saved version before publishing.' }); }
        } else if (sameContent(server.draft, target)) {
          setRecord(server);
          if (pending.action === 'restore') { setDraft(server.draft); setMode('preview'); setNotice({ kind: 'success', message: 'The version was restored as your draft. Review it, then select Publish to make it live.' }); }
          else { setDraft(local => local && sameContent(local, pending.sent) ? server.draft : local); setNotice({ kind: 'success', message: `Your draft was saved ${when(server.editedAt)}.` }); }
        } else if (server.revision === before.revision) {
          setNotice({ kind: 'info', message: pending.action === 'save' ? 'Your draft was not saved. Your edits are still here; select Save draft to try again.' : 'The version was not restored. Try again.' });
        } else setNotice({ kind: 'conflict' });
      } catch (error) {
        // Keep the check available: repeating the write itself could duplicate or overwrite it.
        if (mounted.current && !denied(error)) setNotice({ ...pending, stillOffline: true });
      }
    });
  }
  async function overwrite() {
    let server: EditRecord | null = null;
    await run('check', async () => {
      try { server = await latest(); }
      catch (error) { if (mounted.current && !denied(error)) setNotice({ kind: 'error', message: error instanceof ContentRequestError ? error.message : 'The latest version could not be loaded.' }); }
    });
    if (!server || !mounted.current) return;
    const latestRecord: EditRecord = server;
    setRecord(latestRecord);
    await save(latestRecord.revision);
  }
  function discardChanges() {
    if (!record || !window.confirm('Discard your unsaved changes? This cannot be undone.')) return;
    setDraft(record.draft); setUndo(null); setShowAll(false); setServerIssues([]); setNotice(null);
    setAnnouncement('Unsaved changes discarded.');
  }
  function choosePage(next: PageKey) {
    if (next === page) return;
    if (dirty && !window.confirm(`You have unsaved changes to ${info.label}. Discard them and open ${contentPages[next].label}?`)) return;
    setMode('edit'); setPage(next);
  }
  function previewVersion(version: VersionSummary) {
    setVersionPreview('loading');
    contentRequest<{ content: unknown }>({ page, action: 'version', version: String(version.revision) })
      .then(value => { if (mounted.current) setVersionPreview({ ...version, content: validatePageContent(page, value.content) }); })
      .catch(error => { if (mounted.current && !denied(error)) { setVersionPreview(null); setVersionsError(error instanceof ContentRequestError ? error.message : 'That version could not be previewed.'); } });
  }

  if (setupMessage) return <section className="section content-editor"><div className="shell content-workspace">
    <h2>Website content</h2><p className="content-notice-panel" role="status">{setupMessage}</p>
  </div></section>;

  const status = busy === 'save' ? 'Saving draft…' : busy === 'publish' ? 'Publishing…' : busy === 'restore' ? 'Restoring version…' : busy === 'check' ? 'Checking the saved version…'
    : dirty ? 'Unsaved changes' : unpublished ? 'Draft saved — not published yet' : 'No unpublished changes';
  const publishHint = dirty ? 'Save your draft before publishing.' : !unpublished ? 'There are no unpublished changes.' : 'Publishing replaces the live page for every reader.';
  return <section className="section content-editor" aria-labelledby="content-editor-title"><div className="shell content-workspace">
    <div className="content-head">
      <h2 id="content-editor-title">Website content</h2>
      <p className="content-intro">Edit Student research, Resources and the Coding pages without changing code. Drafts stay private to the EBS Team until you publish them.</p>
      <div className="content-field content-picker">
        <label htmlFor="content-page-select">Page</label>
        <select id="content-page-select" value={page} disabled={!!busy} onChange={event => choosePage(event.target.value as PageKey)}>
          {pageKeys.map(key => <option key={key} value={key}>{contentPages[key].label}</option>)}
        </select>
      </div>
      <p className="content-meta"><strong>Audience:</strong> {info.audience === 'public' ? 'Public — anyone can view this page.' : 'Accepted members — only approved participants can view this page.'}{' '}
        <a href={info.route} target="_blank" rel="noopener noreferrer">View the live page<span className="sr-only"> (opens in a new tab)</span></a></p>
      {record && <p className="content-meta">
        {record.liveSource === 'published' ? `Live version published ${when(record.publishedAt)} by ${record.publishedBy}.` : 'Readers currently see the original site content; this page has not been published from the editor yet.'}
        {record.revision > 0 && ` Draft last saved ${when(record.editedAt)} by ${record.editedBy}.`}
      </p>}
    </div>

    {!record ? loadError ? <div className="content-notice-panel" role="alert"><p>{loadError}</p><button className="button secondary" type="button" onClick={() => setReload(value => value + 1)}>Try again</button></div>
      : <p role="status" className="content-loading">Loading {info.label}…</p> : draft && <>
      <div className="content-tabs" role="group" aria-label="Editor view">
        {(['edit', 'preview', 'history'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>
          {{ edit: 'Edit', preview: 'Preview draft', history: 'Published versions' }[value]}
        </button>)}
      </div>

      {notice && (notice.kind === 'conflict' ? <div className="content-notice-panel" role="alert">
        <p><strong>Someone else saved this page after you opened it.</strong> Your edits have not been saved, and they are still shown here.</p>
        <div className="actions">
          <button className="button secondary" type="button" disabled={!!busy} onClick={() => { if (window.confirm('Discard your edits and load the latest saved version?')) setReload(value => value + 1); }}>Discard my edits and load the latest version</button>
          <button className="button secondary" type="button" disabled={!!busy} onClick={() => void overwrite()}>Save my edits over the latest version</button>
        </div>
      </div> : notice.kind === 'uncertain' ? <div className="content-notice-panel" role="alert">
        <p><strong>We could not confirm whether your {verbs[notice.action]} finished.</strong> Your edits are still here. Check what was saved before trying again.{notice.stillOffline && ' The website still could not be reached; try again in a moment.'}</p>
        <button className="button secondary" type="button" disabled={!!busy} onClick={() => void check(notice)}>{busy === 'check' ? 'Checking…' : 'Check what was saved'}</button>
      </div> : <div className={`content-notice-panel is-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
        <p>{notice.message}</p>
        <button className="content-dismiss" type="button" onClick={() => setNotice(null)}>Dismiss<span className="sr-only"> message</span></button>
      </div>)}

      {mode === 'edit' && <div id="content-form" className="content-form" tabIndex={-1}>
        {showAll && issues.length > 0 && <ErrorSummary ref={summaryRef} template={info.template} issues={issues} />}
        <EditorContext.Provider value={editor}>{info.template === 'research' ? <ResearchForm /> : <LessonForm />}</EditorContext.Provider>
      </div>}
      {mode === 'preview' && <Preview page={page} content={draft} label={dirty ? 'Draft preview — includes unsaved changes, not published' : 'Draft preview — not published'} />}
      {mode === 'history' && <div className="content-history-panel">
        <h3>Published versions</h3>
        <p className="content-hint">Restoring copies a version into your draft. Readers see no change until you publish it.</p>
        {versionsError ? <div role="alert"><p>{versionsError}</p><button className="button secondary" type="button" onClick={() => setVersionsReload(value => value + 1)}>Try again</button></div>
          : !versions ? <p role="status">Loading published versions…</p>
          : !versions.length ? <p>{info.label} has not been published from the editor yet. Readers see the original site content.</p>
          : <ol className="content-history">{versions.map(version => <li key={version.revision}>
            <div><strong>{when(version.publishedAt)}</strong>{record.publishedRevision === version.revision && <span className="content-badge">Live now</span>}<p className="content-hint">Published by {version.publishedBy}</p></div>
            <div className="actions">
              <button className="button secondary" type="button" onClick={() => previewVersion(version)} aria-label={`Preview the version published ${when(version.publishedAt)}`}>Preview</button>
              <button className="button secondary" type="button" disabled={!!busy} onClick={() => void restore(version)} aria-label={`Restore the version published ${when(version.publishedAt)} to your draft`}>Restore to draft</button>
            </div>
          </li>)}</ol>}
        {versionPreview === 'loading' ? <p role="status">Loading version…</p> : versionPreview && <Preview page={page} content={versionPreview.content} label={`Version published ${when(versionPreview.publishedAt)} — preview`} />}
      </div>}

      <div className="content-actionbar" role="group" aria-label="Draft actions">
        <p className="content-status" role="status" aria-live="polite">{status}</p>
        {undo && <span className="content-undo">{undo.message} <button type="button" onClick={() => { setDraft(undo.draft); setUndo(null); setAnnouncement('Restored.'); }}>Undo</button></span>}
        {dirty && <button className="button secondary" type="button" disabled={!!busy} onClick={discardChanges}>Discard changes</button>}
        <button className="button" type="button" disabled={!dirty || !!busy} onClick={() => void save()}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
        <button className="button" type="button" disabled={dirty || !unpublished || !!busy} aria-describedby="content-publish-hint" onClick={() => void publish()}>{busy === 'publish' ? 'Publishing…' : 'Publish'}</button>
        <p className="content-hint content-publish-hint" id="content-publish-hint">{publishHint}</p>
      </div>
    </>}
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
  </div></section>;
}
