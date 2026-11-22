export type UrlPurpose = 'link' | 'image' | 'form' | 'google-form';
const sitePage = /^[a-z0-9][a-z0-9-]*\.html(?:[?#]\S*)?$/i;
function urlGuidance(purpose: UrlPurpose) {
  return purpose === 'image' ? 'Use a site image (such as /images/…) or a link that starts with https://.'
    : (purpose === 'form' || purpose === 'google-form') ? 'Use the full form link, starting with https://.'
      : 'Use a site page (such as faq.html), a link that starts with https://, or an email link (mailto:…).';
}
/** Returns a plain-language problem, or null when the link is safe for its purpose. */
export function urlProblem(value: string, purpose: UrlPurpose): string | null {
  if (!value) return purpose === 'image' ? 'Enter an image link.' : 'Enter a link.';
  if (value !== value.trim()) return 'Remove spaces from the start and end of the link.';
  if (value.length > 2000) return 'This link is too long.';
  if (/[\u0000-\u001f\u007f\\<>"`]/.test(value)) return 'This link contains characters that are not allowed.';
  if (value.startsWith('/')) {
    if ((purpose === 'form' || purpose === 'google-form')) return urlGuidance(purpose);
    if (value.startsWith('//')) return 'Start site links with a single /, or use a full https:// link.';
    if (value.split(/[?#]/, 1)[0].split('/').some(part => /^(?:\.|%2e){1,2}$/i.test(part))) return 'Use a direct site path without . or .. folders.';
    return null;
  }
  if (purpose === 'link' && (sitePage.test(value) || /^#[A-Za-z][\w-]*$/.test(value))) return null;
  let url: URL;
  try { url = new URL(value); } catch { return urlGuidance(purpose); }
  if (purpose === 'google-form' && (url.port || !(
    url.hostname === 'forms.gle' && /^\/[A-Za-z0-9]+$/.test(url.pathname)
    || url.hostname === 'docs.google.com' && /^\/forms\/d\/(?:e\/)?[\w-]+\/viewform\/?$/.test(url.pathname)
  ))) return 'Enter a Google Forms application link.';
  if (url.username || url.password) return 'Links cannot include a username or password.';
  if (url.protocol === 'https:') return !/^https:\/\//i.test(value) ? 'Start full links with https://.' : /\s/.test(value) ? 'Remove spaces from the link.' : url.hostname ? null : urlGuidance(purpose);
  if (url.protocol === 'mailto:' && purpose === 'link') return /^mailto:[^\s@?#/]+@[^\s@?#/]+\.[^\s@?#/]+(?:\?\S*)?$/i.test(value) ? null : 'Enter a complete email link, such as mailto:name@example.com.';
  if (url.protocol === 'http:') return 'Use a secure link that starts with https://.';
  return urlGuidance(purpose);
}
// Endings that are web addresses rather than file names (.py, .sh, .md, .zip and .png are both).
const webEndings = new Set(['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'us', 'uk', 'ca']);
/** Friendly completion for common shorthand; never changes a link's scheme or guesses at file names. */
export function suggestUrl(value: string, purpose: UrlPurpose): string {
  const link = value.trim();
  if (purpose === 'link' && /^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/.test(link)) return 'mailto:' + link;
  if (purpose === 'image' && /^images\//i.test(link)) return '/' + link;
  const address = /^(?:[a-z0-9-]+\.)+([a-z]{2,})(?:[/?#]\S*)?$/i.exec(link);
  if (address && (/^www\./i.test(link) || webEndings.has(address[1].toLowerCase()))) return 'https://' + link;
  return link;
}
export function isExternalUrl(value: string) { return /^https:\/\//i.test(value); }

