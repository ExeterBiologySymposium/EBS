import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { EditorialPageCopy } from './content/page-copy';
import { editorialPages, type EditorialPage } from './content/pages';
import { AccessNotice, useMemberAccess } from './auth';
function learningPage(load: () => Promise<{ default: ComponentType }>) {
  return lazy(async () => {
    const module = await load();
    return { default: function LoadedLearningPage() {
      useEffect(() => { window.dispatchEvent(new HashChangeEvent('hashchange')); }, []);
      const Page = module.default;
      return <Page />;
    } };
  });
}
const pages = {
  'events.html': learningPage(() => import('./pages/events')),
  'resources.html': learningPage(() => import('./pages/resources')),
  'datascience.html': learningPage(() => import('./pages/datascience')),
  'python.html': learningPage(() => import('./pages/python')),
  'rstudio.html': learningPage(() => import('./pages/rstudio')),
  'opensource.html': learningPage(() => import('./pages/opensource')),
  'datasets.html': learningPage(() => import('./pages/datasets')),
};
export function ProtectedPage({ page }: { page: string }) {
  const access = useMemberAccess();
  if (access !== 'accepted') return <div className="page-layout shell"><AccessNotice asPage /></div>;
  const Content = pages[page as keyof typeof pages];
  const key = page.replace(/\.html$/, '') as EditorialPage;
  const body = <><nav className="shell member-page-nav" aria-label="Member portal"><a href="account.html">← Account</a></nav><Suspense fallback={<section className="page-heading" role="status">Loading member content…</section>}><Content /></Suspense></>;
  return Object.hasOwn(editorialPages, key) ? <EditorialPageCopy page={key}>{body}</EditorialPageCopy> : body;
}
