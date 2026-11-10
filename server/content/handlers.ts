import { privateHeaders } from '../access.js';
import {
  CONTENT_SCHEMA_VERSION, ContentValidationError, MAX_CONTENT_BYTES, contentPages, isPageKey, sameContent, validatePageContent,
  type PageContent, type PageKey,
} from '../../src/content/model.js';
import type { Actor, ContentStore, StoredPage } from './store.js';

export class ContentProblem extends Error {
  constructor(public readonly state: string, public readonly status = 503, public readonly detail: Record<string, unknown> = {}) { super(state); }
}
export type ContentDependencies = {
  /** False until the private tables exist and EBS_CONTENT_ENABLED=true: readers then get the initial content. */
  enabled: boolean;
  authenticate(request: Request): Promise<string | null>;
  /** Fresh server-side checks on every request; never cached or taken from the client. */
  isTeam(userId: string): Promise<boolean>;
  isAccepted(userId: string): Promise<boolean>;
  editorName(userId: string): Promise<string>;
  store(): ContentStore;
  initial(page: PageKey): unknown;
};

const messages: Record<string, string> = {
  'signed-out': 'Sign in to continue.',
  forbidden: 'Your account does not have access to this content.',
  'not-configured': 'Website editing has not been set up yet. Ask the site owner to complete the setup in docs/website-content.md.',
  conflict: 'Someone else saved this page after you opened it.',
  'no-changes': 'These changes are already live.',
  'not-found': 'That published version is not available.',
  'old-version': 'That version uses an older format and cannot be restored.',
  'too-large': 'This page is too large to save. Shorten it or remove some sections.',
  'invalid-request': 'This request was not valid. Reload the page and try again.',
  'blocked-origin': 'This request was blocked. Reload the page and try again.',
  configuration: 'Website content storage is not configured correctly. Contact the site owner.',
  unavailable: 'Website content is unavailable right now. Try again in a moment.',
};
function respond(status: number, value: object) {
  return Response.json(value, { status, headers: { ...privateHeaders, 'X-Content-Type-Options': 'nosniff' } });
}
const problem = (state: string, status: number, detail: Record<string, unknown> = {}) => new ContentProblem(state, status, detail);
const readActions = ['read', 'edit', 'history', 'version'];
const writeActions = { save: 'content,revision', publish: 'revision', restore: 'revision,version' } as const;
type WriteAction = keyof typeof writeActions;
const revisionValue = (value: unknown, minimum: number): value is number => Number.isSafeInteger(value) && (value as number) >= minimum && (value as number) < 2 ** 31;

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length')) > MAX_CONTENT_BYTES + 4096) throw problem('too-large', 413);
  const reader = request.body?.getReader();
  if (!reader) throw problem('invalid-request', 400);
  const decoder = new TextDecoder();
  let text = '', size = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > MAX_CONTENT_BYTES + 4096) { await reader.cancel(); throw problem('too-large', 413); }
      text += decoder.decode(next.value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw problem('invalid-request', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw problem('invalid-request', 400);
  return body as Record<string, unknown>;
}

export function createContentHandlers(deps: ContentDependencies) {
  const initial = new Map<PageKey, PageContent>();
  // A broken built-in default is a deployment bug; fail closed rather than render it.
  const initialFor = (page: PageKey) => {
    if (!initial.has(page)) initial.set(page, validatePageContent(page, deps.initial(page)));
    return initial.get(page)!;
  };
  const stored = (page: PageKey, value: unknown, schemaVersion: number) => {
    if (schemaVersion !== CONTENT_SCHEMA_VERSION) throw problem('unavailable', 503);
    try { return validatePageContent(page, value); } catch { throw problem('unavailable', 503); }
  };
  function editView(page: PageKey, row: StoredPage | null) {
    return {
      page,
      revision: row?.revision ?? 0,
      draft: row ? stored(page, row.draft, row.schemaVersion) : initialFor(page),
      live: row?.published ? stored(page, row.published, row.schemaVersion) : initialFor(page),
      liveSource: row?.published ? 'published' : 'initial',
      editedAt: row?.editedAt ?? null,
      editedBy: row ? row.editedByName || 'An EBS Team member' : null,
      publishedRevision: row?.publishedRevision ?? null,
      publishedAt: row?.publishedAt ?? null,
      publishedBy: row?.published ? row.publishedByName || 'An EBS Team member' : null,
    };
  }
  async function actor(id: string): Promise<Actor> {
    try { return { id, name: (await deps.editorName(id)).slice(0, 200) }; } catch { return { id, name: '' }; }
  }

  async function handle(request: Request): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'POST') return respond(405, { error: 'Method not allowed.', state: 'method-not-allowed' });
    const url = new URL(request.url);
    const query = url.searchParams;
    const page = query.get('page');
    const action = query.get('action') ?? 'read';
    if ([...query.keys()].some(key => !['page', 'action', 'version'].includes(key)) || new Set(query.keys()).size !== [...query.keys()].length) throw problem('invalid-request', 400);
    if (!isPageKey(page)) return respond(400, { error: 'Unknown page.', state: 'unknown-page' });
    const write = request.method === 'POST';
    if (write ? !Object.hasOwn(writeActions, action) : !readActions.includes(action)) throw problem('invalid-request', 400);
    if (query.has('version') !== (action === 'version')) throw problem('invalid-request', 400);
    if (write) {
      if (request.headers.get('origin') !== url.origin) throw problem('blocked-origin', 403);
      if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw problem('invalid-request', 415);
    }

    // Public readers need no account. Everything else is authorized freshly, server-side.
    const publicRead = action === 'read' && contentPages[page].audience === 'public';
    const userId = publicRead ? null : await deps.authenticate(request);
    if (!publicRead) {
      if (!userId) throw problem('signed-out', 401);
      if (!(action === 'read' ? await deps.isAccepted(userId) : await deps.isTeam(userId))) throw problem('forbidden', 403);
    }
    if (action === 'read') {
      // Readers only ever receive published (or initial) content, never drafts.
      if (!deps.enabled) return respond(200, { content: initialFor(page) });
      const row = await deps.store().read(page);
      return respond(200, { content: row?.published ? stored(page, row.published, row.schemaVersion) : initialFor(page) });
    }
    if (!deps.enabled) throw problem('not-configured', 503);
    const store = deps.store();
    if (action === 'edit') return respond(200, editView(page, await store.read(page)));
    if (action === 'history') {
      const versions = await store.versions(page, 50);
      return respond(200, { versions: versions.map(entry => ({ revision: entry.revision, publishedAt: entry.publishedAt, publishedBy: entry.publishedByName || 'An EBS Team member' })) });
    }
    if (action === 'version') {
      const requested = Number(query.get('version'));
      if (!/^[1-9]\d{0,9}$/.test(query.get('version') || '') || !revisionValue(requested, 1)) throw problem('invalid-request', 400);
      const entry = await store.version(page, requested);
      if (!entry) throw problem('not-found', 404);
      if (entry.schemaVersion !== CONTENT_SCHEMA_VERSION) throw problem('old-version', 409);
      return respond(200, { revision: entry.revision, publishedAt: entry.publishedAt, publishedBy: entry.publishedByName || 'An EBS Team member', content: stored(page, entry.content, entry.schemaVersion) });
    }

    const body = await readJson(request);
    if (Object.keys(body).sort().join(',') !== writeActions[action as WriteAction]) throw problem('invalid-request', 400);
    const expected = body.revision;
    if (!revisionValue(expected, action === 'save' ? 0 : 1)) throw problem('invalid-request', 400);
    const conflict = async () => problem('conflict', 409, { revision: (await store.read(page))?.revision ?? 0 });
    if (action === 'save') {
      const content = validatePageContent(page, body.content);
      const row = await store.saveDraft(page, expected, content, await actor(userId!));
      if (!row) throw await conflict();
      return respond(200, editView(page, row));
    }
    if (action === 'publish') {
      const current = await store.read(page);
      if (!current || current.revision !== expected) throw await conflict();
      const draft = stored(page, current.draft, current.schemaVersion);
      if (sameContent(draft, current.published ? stored(page, current.published, current.schemaVersion) : initialFor(page))) throw problem('no-changes', 409);
      const row = await store.publish(page, expected, await actor(userId!));
      if (!row) throw await conflict();
      return respond(200, editView(page, row));
    }
    // Restoring copies a publication into the draft. It never publishes by itself.
    if (!revisionValue(body.version, 1)) throw problem('invalid-request', 400);
    const entry = await store.version(page, body.version);
    if (!entry) throw problem('not-found', 404);
    if (entry.schemaVersion !== CONTENT_SCHEMA_VERSION) throw problem('old-version', 409);
    let content: PageContent;
    try { content = validatePageContent(page, entry.content); } catch { throw problem('old-version', 409); }
    const row = await store.saveDraft(page, expected, content, await actor(userId!));
    if (!row) throw await conflict();
    return respond(200, editView(page, row));
  }

  return async function contentHandler(request: Request): Promise<Response> {
    try { return await handle(request); }
    catch (error) {
      if (error instanceof ContentValidationError) return respond(400, { error: error.message, state: 'invalid', issues: error.issues.slice(0, 25) });
      if (error instanceof ContentProblem) return respond(error.status, { error: messages[error.state] || messages.unavailable, state: error.state, ...error.detail });
      return respond(503, { error: messages.unavailable, state: 'unavailable' });
    }
  };
}
