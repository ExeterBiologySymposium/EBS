import { neon } from '@neondatabase/serverless';
import { CONTENT_SCHEMA_VERSION, type PageKey } from '../../src/content/model.js';

export type Actor = { id: string; name: string };
export type StoredPage = {
  schemaVersion: number;
  revision: number;
  draft: unknown;
  editedAt: string;
  editedBy: string;
  editedByName: string;
  published: unknown | null;
  /** Format of the publication, which can differ from the draft's after a format change. */
  publishedSchemaVersion: number | null;
  publishedRevision: number | null;
  publishedAt: string | null;
  publishedBy: string | null;
  publishedByName: string | null;
};
export type StoredVersion = { revision: number; schemaVersion: number; publishedAt: string; publishedBy: string; publishedByName: string };
export interface ContentStore {
  read(page: PageKey): Promise<StoredPage | null>;
  /** Saves a draft only if the page is still at expectedRevision (0 = never saved). Null: another write won. */
  saveDraft(page: PageKey, expectedRevision: number, content: unknown, actor: Actor): Promise<StoredPage | null>;
  /** Makes the saved draft live and records its version in the same statement. Null: another write won. */
  publish(page: PageKey, expectedRevision: number, actor: Actor): Promise<StoredPage | null>;
  versions(page: PageKey, limit: number): Promise<StoredVersion[]>;
  version(page: PageKey, revision: number): Promise<(StoredVersion & { content: unknown }) | null>;
}

type Query = (text: string, params: unknown[]) => Promise<Record<string, unknown>[]>;
const columns = 'schema_version, revision, draft, edited_at, edited_by, edited_by_name, published, published_schema_version, published_revision, published_at, published_by, published_by_name';
const time = (value: unknown) => value instanceof Date ? value.toISOString() : String(value);
const optional = <T>(value: unknown, map: (value: unknown) => T) => value === null || value === undefined ? null : map(value);
function page(row: Record<string, unknown> | undefined): StoredPage | null {
  if (!row) return null;
  return {
    schemaVersion: Number(row.schema_version), revision: Number(row.revision), draft: row.draft,
    editedAt: time(row.edited_at), editedBy: String(row.edited_by), editedByName: String(row.edited_by_name ?? ''),
    published: row.published ?? null, publishedSchemaVersion: optional(row.published_schema_version, Number), publishedRevision: optional(row.published_revision, Number),
    publishedAt: optional(row.published_at, time), publishedBy: optional(row.published_by, String), publishedByName: optional(row.published_by_name, String),
  };
}
function version(row: Record<string, unknown>): StoredVersion {
  return { revision: Number(row.revision), schemaVersion: Number(row.schema_version), publishedAt: time(row.published_at), publishedBy: String(row.published_by), publishedByName: String(row.published_by_name ?? '') };
}

export function createContentStore(query: Query, instanceId: string): ContentStore {
  return {
    async read(key) {
      const [row] = await query(`SELECT ${columns} FROM ebs_content_pages WHERE instance_id = $1::text AND page_key = $2::text`, [instanceId, key]);
      return page(row);
    },
    async saveDraft(key, expectedRevision, content, actor) {
      const rows = await query(`WITH inserted AS (
          INSERT INTO ebs_content_pages (instance_id, page_key, schema_version, revision, draft, edited_by, edited_by_name)
          SELECT $1::text, $2::text, $3::integer, 1, $5::jsonb, $6::text, $7::text WHERE $4::integer = 0
          ON CONFLICT (instance_id, page_key) DO NOTHING
          RETURNING ${columns}
        ), updated AS (
          UPDATE ebs_content_pages
          SET schema_version = $3::integer, revision = revision + 1, draft = $5::jsonb, edited_at = now(), edited_by = $6::text, edited_by_name = $7::text
          WHERE instance_id = $1::text AND page_key = $2::text AND revision = $4::integer AND $4::integer > 0
          RETURNING ${columns}
        )
        SELECT * FROM inserted UNION ALL SELECT * FROM updated`,
      [instanceId, key, CONTENT_SCHEMA_VERSION, expectedRevision, JSON.stringify(content), actor.id, actor.name]);
      return page(rows[0]);
    },
    async publish(key, expectedRevision, actor) {
      const rows = await query(`WITH updated AS (
          UPDATE ebs_content_pages
          SET revision = revision + 1, published = draft, published_schema_version = schema_version, published_revision = revision + 1,
            published_at = now(), published_by = $4::text, published_by_name = $5::text
          WHERE instance_id = $1::text AND page_key = $2::text AND revision = $3::integer
          RETURNING instance_id, page_key, ${columns}
        ), recorded AS (
          INSERT INTO ebs_content_versions (instance_id, page_key, revision, schema_version, content, published_at, published_by, published_by_name)
          SELECT instance_id, page_key, published_revision, published_schema_version, published, published_at, published_by, published_by_name FROM updated
          RETURNING revision
        )
        SELECT ${columns} FROM updated`,
      [instanceId, key, expectedRevision, actor.id, actor.name]);
      return page(rows[0]);
    },
    async versions(key, limit) {
      const rows = await query(`SELECT revision, schema_version, published_at, published_by, published_by_name FROM ebs_content_versions
        WHERE instance_id = $1::text AND page_key = $2::text ORDER BY revision DESC LIMIT $3::integer`, [instanceId, key, limit]);
      return rows.map(version);
    },
    async version(key, revision) {
      const [row] = await query(`SELECT revision, schema_version, published_at, published_by, published_by_name, content FROM ebs_content_versions
        WHERE instance_id = $1::text AND page_key = $2::text AND revision = $3::integer`, [instanceId, key, revision]);
      return row ? { ...version(row), content: row.content } : null;
    },
  };
}

export function neonContentStore(connection: string, instanceId: string): ContentStore {
  const sql = neon(connection);
  return createContentStore((text, params) => sql.query(text, params, { fetchOptions: { signal: AbortSignal.timeout(10000) } }), instanceId);
}
