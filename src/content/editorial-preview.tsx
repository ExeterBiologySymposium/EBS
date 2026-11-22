import { lazy, Suspense, useState, type FormEvent, type MouseEvent } from 'react';
import { AuthContext, initialAuth, type AuthState } from '../auth';
import { EditorialPreview } from './page-copy';
import type { EditorialPage } from './pages';

const readers = {
  index: lazy(() => import('../site').then(module => ({ default: module.Home }))),
  about: lazy(() => import('../pages/about')),
  team: lazy(() => import('../pages/team')),
  schedule: lazy(() => import('../pages/schedule')),
  faq: lazy(() => import('../pages/faq')),
  contact: lazy(() => import('../pages/contact')),
  register: lazy(() => import('../pages/register')),
  'student-signup': lazy(() => import('../pages/student-signup')),
  schools: lazy(() => import('../pages/schools')),
  judges: lazy(() => import('../pages/judges')),
  projects: lazy(() => import('../pages/projects')),
  events: lazy(() => import('./readers/events')),
  opensource: lazy(() => import('./readers/opensource')),
  datasets: lazy(() => import('./readers/datasets')),
  account: lazy(() => import('../pages/account')),
  'accept-invitation': lazy(() => import('../pages/accept-invitation')),
  admin: lazy(() => import('../pages/admin')),
  terms: lazy(() => import('../pages/terms')),
  privacy: lazy(() => import('../pages/privacy')),
};

export function EditorialPreviewView({ page, content, label }: { page: EditorialPage; content: object; label: string }) {
  const [state, setState] = useState('visitor');
  const [workspace, setWorkspace] = useState('participants');
  const accountPreview = page === 'account' || page === 'student-signup';
  const signedIn = (accountPreview && state !== 'visitor') || ['admin', 'events', 'opensource', 'datasets'].includes(page);
  const auth: AuthState = { ...initialAuth, status: signedIn ? 'signed-in' : 'signed-out',
    access: signedIn ? accountPreview && (page === 'student-signup' || state === 'pending') ? 'pending' : 'accepted' : null };
  const Reader = readers[page];
  function stopLink(event: MouseEvent) {
    if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
  }
  function stopForm(event: FormEvent) { event.preventDefault(); event.stopPropagation(); }
  return <div className="content-preview-frame">
    <p className="content-preview-banner">{label}</p>
    {page === 'account' && <div className="content-field"><label htmlFor="account-preview-state">Preview as</label>
      <select id="account-preview-state" value={state} onChange={event => setState(event.target.value)}>
        <option value="visitor">Signed-out visitor</option><option value="pending">Pending participant</option><option value="accepted">Accepted participant</option>
      </select></div>}
    {page === 'student-signup' && <div className="content-field"><label htmlFor="student-preview-state">Preview as</label>
      <select id="student-preview-state" value={state} onChange={event => setState(event.target.value)}>
        <option value="visitor">Signed-out visitor</option><option value="pending">Signed-in student</option>
      </select></div>}
    {page === 'admin' && <div className="content-field"><label htmlFor="admin-preview-workspace">Preview workspace</label>
      <select id="admin-preview-workspace" value={workspace} onChange={event => setWorkspace(event.target.value)}>
        <option value="participants">Participants</option><option value="content">Website content</option><option value="settings">Team organization settings</option>
      </select></div>}
    <div className="content-preview" onClick={stopLink} onAuxClick={stopLink} onSubmitCapture={stopForm}>
      <AuthContext.Provider value={auth}>
        <EditorialPreview page={page} content={content} workspace={workspace}><Suspense fallback={<p role="status">Loading preview…</p>}><Reader /></Suspense></EditorialPreview>
      </AuthContext.Provider>
    </div>
    <p className="content-hint">Links and submissions are disabled in previews.</p>
  </div>;
}
