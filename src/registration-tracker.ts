// The private registration tracker link shown to the EBS Team in EBS administration → Participants.
// Shared by the server (api/team-admin.ts) and the browser (src/pages/admin.tsx), so it must not
// import server code. Only an editable Google Sheets URL is accepted; Google sharing controls access.
export const registrationTrackerMaxLength = 2048;

export function validRegistrationTrackerUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > registrationTrackerMaxLength || /[\s\x00-\x1f\x7f\\"<>`]/u.test(text)) return null;
  let url: URL;
  try { url = new URL(text); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.port || url.username || url.password) return null;
  // /spreadsheets/d/<id>[/edit…]; published copies (/spreadsheets/d/e/…) are public and never accepted.
  if (!/^\/spreadsheets\/d\/[A-Za-z0-9_-]{20,}(?:\/[A-Za-z0-9_-]+)*\/?$/.test(url.pathname) || url.pathname.startsWith('/spreadsheets/d/e/')) return null;
  return url.href;
}
