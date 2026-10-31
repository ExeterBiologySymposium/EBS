export const learningPages = ['resources.html', 'datascience.html', 'python.html', 'rstudio.html', 'opensource.html'] as const;

export const memberPages = [...learningPages, 'events.html'] as const;

export function normalizedPath(path: string): string {
  let value = path.split(/[?#]/, 1)[0];
  try { for (let i = 0; i < 3; i++) { const decoded = decodeURIComponent(value); if (decoded === value) break; value = decoded; } }
  catch { return '/protected-assets/invalid-path'; }
  return ('/' + value.replace(/\\/g, '/')).replace(/\/{2,}/g, '/').toLowerCase();
}
export function isProtectedPath(path: string): boolean {
  const value = normalizedPath(path);
  return /^\/(resources|datascience|python|rstudio|opensource|events)(?:[/.;]|$)/.test(value)
    || /^\/(protected-assets|guides)(?:\/|$)/.test(value)
    || /^\/enzyme_activity\.csv(?:[/.;]|$)/.test(value);
}
export function isLearningPage(page: string): boolean {
  return (learningPages as readonly string[]).includes(page);
}
export function isMemberPage(page: string): boolean {
  return (memberPages as readonly string[]).includes(page);
}
export function isAccountPath(path: string): boolean {
  return /^\/(account|register|admin|accept-invitation)(?:[/.;]|$)/.test(normalizedPath(path));
}
export function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return null;
  try { const url = new URL(value, 'https://ebs.invalid'); return url.origin === 'https://ebs.invalid' && isMemberPage(url.pathname.slice(1)) ? url.pathname + url.hash : null; }
  catch { return null; }
}
