import { learningPages } from './access-policy';

const pages = new Set(['index.html', 'about.html', 'faq.html', 'judges.html', 'register.html', 'researchers.html', 'schedule.html', 'schools.html', 'student-signup.html', 'team.html', ...learningPages]);
export function pageForUrl(url: URL): string | null {
  const page = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  return pages.has(page) ? page : null;
}
export function eligibleLink(event: Pick<MouseEvent, 'button'|'defaultPrevented'|'metaKey'|'ctrlKey'|'shiftKey'|'altKey'>, link: Pick<HTMLAnchorElement, 'href'|'target'|'hasAttribute'>, current: URL): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return false;
  const url = new URL(link.href, current);
  return url.origin === current.origin && pageForUrl(url) !== null && !(url.pathname === current.pathname && url.search === current.search && url.hash);
}
export type Navigation = { page: string; url: URL; scroll: [number, number] | null };
const metadata = 'meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],script[type="application/ld+json"]';

export function installNavigation(commit: (navigation: Navigation) => void): () => void {
  let current = new URL(location.href);
  let pending: AbortController | null = null;
  let revision = 0;
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  const rememberScroll = () => history.replaceState({ ...history.state, ebsScroll: [scrollX, scrollY] }, '', location.href);
  rememberScroll();
  let scrollFrame = 0;
  const trackScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (location.pathname === current.pathname && location.search === current.search) rememberScroll();
    });
  };
  async function navigate(target: URL, pop: boolean) {
    const requestRevision = ++revision;
    pending?.abort();
    const controller = new AbortController();
    pending = controller;
    const timer = window.setTimeout(() => controller.abort(), 15000);
    const scroll = pop && Array.isArray(history.state?.ebsScroll) ? history.state.ebsScroll as [number, number] : null;
    try {
      // Fetch the actual document so server authorization and redirects still run.
      const response = await fetch(target.href, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal, headers: { Accept: 'text/html' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Navigation unavailable');
      const url = new URL(response.url);
      if (!response.redirected) url.hash = target.hash;
      const page = pageForUrl(url);
      if (url.origin !== location.origin || !page) throw new Error('Unknown destination');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (doc.body.dataset.reactPage !== page || !doc.querySelector('#root')) throw new Error('Invalid destination document');
      if (requestRevision !== revision) return;
      if (pop) history.replaceState({ ...history.state, ebsScroll: scroll }, '', url);
      else { rememberScroll(); history.pushState({ ebsScroll: null }, '', url); }
      document.title = doc.title;
      document.head.querySelectorAll(metadata).forEach(node => node.remove());
      doc.head.querySelectorAll(metadata).forEach(node => document.head.appendChild(document.importNode(node, true)));
      document.body.dataset.reactPage = page;
      current = url;
      commit({ page, url, scroll });
    } catch {
      if (requestRevision !== revision) return;
      // Preserve normal browser error/redirect handling instead of rendering a guessed page.
      if (pop) location.replace(target.href); else location.assign(target.href);
    } finally { clearTimeout(timer); if (requestRevision === revision) pending = null; }
  }
  const click = (event: MouseEvent) => {
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = new URL(link.href, location.href);
    if (target.origin === location.origin && target.pathname === current.pathname && target.search === current.search && target.hash) {
      // Native anchors must supersede any pending page transition, too.
      revision++; pending?.abort(); rememberScroll(); return;
    }
    if (!eligibleLink(event, link, new URL(location.href))) return;
    event.preventDefault();
    void navigate(target, false);
  };
  const pop = () => {
    const target = new URL(location.href);
    if (target.pathname === current.pathname && target.search === current.search) {
      revision++; pending?.abort(); current = target;
      commit({ page: pageForUrl(target)!, url: target, scroll: history.state?.ebsScroll ?? null });
    } else void navigate(target, true);
  };
  document.addEventListener('click', click);
  window.addEventListener('popstate', pop);
  window.addEventListener('scroll', trackScroll, { passive: true });
  return () => { revision++; pending?.abort(); document.removeEventListener('click', click); window.removeEventListener('popstate', pop); window.removeEventListener('scroll', trackScroll); cancelAnimationFrame(scrollFrame); history.scrollRestoration = previousRestoration; };
}
