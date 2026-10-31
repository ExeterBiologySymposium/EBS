import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'node:crypto';
import type { FolderRecord, FolderStore } from '../participant-folders.js';

type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
export function createFolderStore(query: Query, namespace: string): FolderStore {
  const run = (text: string, params: unknown[]) => query(text, [namespace, ...params]);
  async function checked(text: string, params: unknown[]) {
    if (!(await run(text, params)).length) throw new Error('Provisioning claim lost');
  }
  return {
    async get(userId) {
      const [row] = await run('SELECT * FROM ebs_participant_folders WHERE namespace=$1 AND user_id=$2', [userId]);
      return row ? { userId: String(row.user_id), email: String(row.email), folderId: String(row.folder_id), documentId: row.document_id === null ? null : String(row.document_id), copyStarted: row.copy_started === true, ready: row.ready === true } satisfies FolderRecord : null;
    },
    async ensure(userId, email, folderId) {
      await run('INSERT INTO ebs_participant_folders (namespace,user_id,email,folder_id) VALUES ($1,$2,$3,$4) ON CONFLICT (namespace,user_id) DO NOTHING', [userId, email, folderId]);
    },
    async claim(userId) {
      const token = randomUUID();
      const rows = await run("UPDATE ebs_participant_folders SET claim_token=$3, claim_until=now()+interval '120 seconds', updated_at=now() WHERE namespace=$1 AND user_id=$2 AND (claim_until IS NULL OR claim_until<now()) AND NOT ready RETURNING user_id", [userId, token]);
      return rows.length ? token : null;
    },
    async release(userId, token) {
      await run('UPDATE ebs_participant_folders SET claim_token=NULL, claim_until=NULL, updated_at=now() WHERE namespace=$1 AND user_id=$2 AND claim_token=$3', [userId, token]);
    },
    async startCopy(userId, token) {
      const rows = await run('UPDATE ebs_participant_folders SET copy_started=true, updated_at=now() WHERE namespace=$1 AND user_id=$2 AND claim_token=$3 AND claim_until>now() AND NOT copy_started RETURNING user_id', [userId, token]);
      return rows.length > 0;
    },
    async document(userId, token, documentId) {
      await checked('UPDATE ebs_participant_folders SET document_id=$4, updated_at=now() WHERE namespace=$1 AND user_id=$2 AND claim_token=$3 AND claim_until>now() RETURNING user_id', [userId, token, documentId]);
    },
    async complete(userId, token) {
      await checked('UPDATE ebs_participant_folders SET ready=true, updated_at=now() WHERE namespace=$1 AND user_id=$2 AND claim_token=$3 AND claim_until>now() AND document_id IS NOT NULL RETURNING user_id', [userId, token]);
    },
  };
}
export function neonFolderStore(connection: string, namespace: string): FolderStore {
  const sql = neon(connection);
  return createFolderStore((text, params) => sql.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(10_000) } }), namespace);
}
