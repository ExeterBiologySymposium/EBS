import { lazy, Suspense, useEffect, type ComponentType } from 'react';
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
};
export function ProtectedPage({ page }: { page: string }) {
  const access = useMemberAccess();
  if (access !== 'accepted') return <div className="page-layout shell"><AccessNotice asPage /></div>;
  const Content = pages[page as keyof typeof pages];
  return <Suspense fallback={<section className="page-heading" role="status">Loading member content…</section>}><Content /></Suspense>;
}
