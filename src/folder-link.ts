export const folderLinkMaxLength = 2048;

export function validFolderLink(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  const authority = /^https?:\/\/([^/?#]+)/i.exec(url)?.[1];
  if (!authority || authority.includes('@') || /[\s\x00-\x1f\x7f\\"<>`]/u.test(url)
    || new TextEncoder().encode(url).length > folderLinkMaxLength) return null;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}
