import { useEffect, useState } from 'react';
import { App } from './site';
import { installNavigation, type Navigation } from './navigation';

export function NavigationApp({ initialPage }: { initialPage: string }) {
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  useEffect(() => installNavigation(setNavigation), []);
  useEffect(() => {
    if (!navigation) return;
    document.querySelectorAll<HTMLDetailsElement>('.site-menu').forEach(menu => { menu.open = false; });
    document.querySelectorAll<HTMLDialogElement>('.search-dialog[open]').forEach(dialog => dialog.close());
    // Run after the page's own hash-reveal effect, so back/forward scroll wins.
    const frame = requestAnimationFrame(() => {
      if (navigation.scroll) window.scrollTo({ left: navigation.scroll[0], top: navigation.scroll[1], behavior: 'instant' });
      else if (navigation.url.hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
      else window.scrollTo({ top: 0, behavior: 'instant' });
      if (!navigation.url.hash) document.getElementById('main')?.focus({ preventScroll: true });
      window.dispatchEvent(new Event('scroll'));
    });
    return () => cancelAnimationFrame(frame);
  }, [navigation]);
  return <App page={navigation?.page ?? initialPage} />;
}
