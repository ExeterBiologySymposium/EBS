import { validatePageContent, type PageContentMap, type PageKey } from './model';

export class ContentRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly detail: Record<string, unknown> = {}) { super(message); }
  /** The request may have reached the server, so a write's outcome is unknown. */
  get uncertain() { return this.status === 0 || this.status >= 500; }
  get denied() { return this.status === 401 || this.status === 403; }
}

export async function contentRequest<T>(query: Record<string, string>, options: { signal?: AbortSignal; body?: object } = {}): Promise<T> {
  const timeout = AbortSignal.timeout(20000);
  let response: Response;
  try {
    response = await fetch('/api/page-content?' + new URLSearchParams(query), {
      credentials: 'same-origin', cache: 'no-store', signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
      ...(options.body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ContentRequestError('We could not reach the website. Check your connection and try again.', 0);
  }
  let value: Record<string, unknown> | null = null;
  try { value = await response.json(); } catch { /* handled below */ }
  if (!value || typeof value !== 'object') {
    throw new ContentRequestError('The website sent an unexpected response. Try again.', response.ok ? 0 : response.status);
  }
  if (!response.ok) throw new ContentRequestError(typeof value.error === 'string' ? value.error : 'The request could not be completed. Try again.', response.status, value);
  return value as T;
}

/** The content readers currently see: the latest publication, or the initial site content. */
export async function readPublishedContent<K extends PageKey>(page: K, signal?: AbortSignal): Promise<PageContentMap[K]> {
  const value = await contentRequest<{ content: unknown }>({ page }, { signal });
  return validatePageContent(page, value.content);
}
