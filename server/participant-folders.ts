import { privateHeaders, type AccessDependencies } from './access.js';

export interface FolderRecord {
  userId: string;
  email: string;
  folderId: string;
  documentId: string | null;
  copyStarted: boolean;
  ready: boolean;
}
export interface FolderStore {
  get(userId: string): Promise<FolderRecord | null>;
  ensure(userId: string, email: string, folderId: string): Promise<void>;
  claim(userId: string): Promise<string | null>;
  release(userId: string, claim: string): Promise<void>;
  startCopy(userId: string, claim: string): Promise<boolean>;
  document(userId: string, claim: string, documentId: string): Promise<void>;
  complete(userId: string, claim: string): Promise<void>;
}
export interface ParticipantDrive {
  preflight(): Promise<void>;
  generateFolderId(): Promise<string>;
  ensureFolder(id: string, userId: string, email: string): Promise<void>;
  findDocument(folderId: string): Promise<string | null>;
  copyDocument(folderId: string): Promise<string>;
  validateDocument(folderId: string, documentId: string): Promise<void>;
  shareFolder(folderId: string, email: string): Promise<void>;
}
export type FolderResult = {
  state: 'empty' | 'processing' | 'ready' | 'needs-review' | 'identity-changed' | 'link-google' | 'unavailable' | 'signed-out' | 'forbidden';
  folderUrl?: string;
  documentUrl?: string;
};

export function googleRecipient(user: { externalAccounts: { provider: string; emailAddress: string; verification: { status: string } | null }[] }): string | null {
  const emails = [...new Set(user.externalAccounts
    .filter(account => ['google', 'oauth_google'].includes(account.provider) && account.verification?.status === 'verified')
    .map(account => account.emailAddress.trim().toLowerCase())
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
  // Multiple Google accounts need staff review rather than guessing a recipient.
  return emails.length === 1 ? emails[0] : null;
}
function result(row: FolderRecord | null, email: string): FolderResult {
  if (!row) return { state: 'empty' };
  if (row.email !== email) return { state: 'identity-changed' };
  if (!row.ready || !row.documentId) return { state: 'processing' };
  return { state: 'ready', folderUrl: `https://drive.google.com/drive/folders/${encodeURIComponent(row.folderId)}`, documentUrl: `https://docs.google.com/document/d/${encodeURIComponent(row.documentId)}/edit` };
}
export async function provisionFolder(userId: string, email: string, store: FolderStore, drive: ParticipantDrive): Promise<FolderResult> {
  let row = await store.get(userId);
  if (row && (row.email !== email || row.ready)) return result(row, email);
  await drive.preflight();
  if (!row) {
    // Persist a Google-generated folder ID before creation: folder creation can be retried safely.
    await store.ensure(userId, email, await drive.generateFolderId());
    row = await store.get(userId);
  }
  if (!row) throw new Error('Folder record unavailable');
  if (row.email !== email || row.ready) return result(row, email);
  const claim = await store.claim(userId);
  if (!claim) return { state: 'processing' };
  try {
    row = (await store.get(userId))!;
    await drive.ensureFolder(row.folderId, userId, email);
    if (!row.documentId) {
      let documentId = await drive.findDocument(row.folderId);
      if (!documentId) {
        // Google Docs cannot use pre-generated IDs. Commit intent exactly once; never
        // repeat an uncertain copy, even after a lease expires or the process crashes.
        if (!await store.startCopy(userId, claim)) return { state: 'needs-review' };
        documentId = await drive.copyDocument(row.folderId);
      }
      await store.document(userId, claim, documentId);
      row.documentId = documentId;
    }
    await drive.validateDocument(row.folderId, row.documentId);
    await drive.shareFolder(row.folderId, email);
    await store.complete(userId, claim);
    return result({ ...row, ready: true }, email);
  } finally {
    await store.release(userId, claim);
  }
}
export function createFolderHandlers(dependencies: Pick<AccessDependencies, 'authenticate' | 'membership'> & {
  recipient(userId: string): Promise<string | null>;
  store: FolderStore;
  drive: ParticipantDrive;
}) {
  return { async fetch(request: Request): Promise<Response> {
    const respond = (status: number, value: FolderResult) => Response.json(value, { status, headers: privateHeaders });
    if (!['GET', 'POST'].includes(request.method)) return respond(405, { state: 'unavailable' });
    if (request.method === 'POST' && request.headers.get('origin') !== new URL(request.url).origin) return respond(403, { state: 'forbidden' });
    try {
      const userId = await dependencies.authenticate(request);
      if (!userId) return respond(401, { state: 'signed-out' });
      if (await dependencies.membership(userId) !== 'accepted') return respond(403, { state: 'forbidden' });
      const email = await dependencies.recipient(userId);
      if (!email) return respond(409, { state: 'link-google' });
      const value = request.method === 'GET'
        ? result(await dependencies.store.get(userId), email)
        : await provisionFolder(userId, email, dependencies.store, dependencies.drive);
      return respond(value.state === 'processing' ? 202 : value.state === 'needs-review' || value.state === 'identity-changed' ? 409 : 200, value);
    } catch {
      // Upstream errors can contain tokens, SQL, email addresses, or private file IDs.
      return respond(503, { state: 'unavailable' });
    }
  } };
}
