-- Website content editor storage (docs/website-content.md).
-- Additive and safe to re-run: creates two private tables and an append-only trigger. It does not
-- modify organization registry or research-folder tables. Apply with a private server database role.

BEGIN;

-- One row per page: the current draft and the publication readers see.
CREATE TABLE IF NOT EXISTS ebs_content_pages (
  instance_id text NOT NULL CHECK (instance_id ~ '^ins_[A-Za-z0-9]+$'),
  page_key text NOT NULL,
  schema_version integer NOT NULL CHECK (schema_version > 0),
  -- Increases on every save, publication and restoration; writes must name the revision they read.
  revision integer NOT NULL CHECK (revision > 0),
  draft jsonb NOT NULL CHECK (jsonb_typeof(draft) = 'object'),
  edited_at timestamptz NOT NULL DEFAULT now(),
  edited_by text NOT NULL,
  edited_by_name text NOT NULL DEFAULT '',
  published jsonb CHECK (jsonb_typeof(published) = 'object'),
  published_schema_version integer CHECK (published_schema_version > 0),
  published_revision integer,
  published_at timestamptz,
  published_by text,
  published_by_name text,
  PRIMARY KEY (instance_id, page_key),
  CONSTRAINT ebs_content_pages_publication CHECK (
    (published IS NULL AND published_schema_version IS NULL AND published_revision IS NULL AND published_at IS NULL AND published_by IS NULL)
    OR (published IS NOT NULL AND published_schema_version IS NOT NULL AND published_revision BETWEEN 1 AND revision
      AND published_at IS NOT NULL AND published_by IS NOT NULL)
  )
);

-- Replace the original five-page constraint in place. Existing rows and their history stay intact.
ALTER TABLE ebs_content_pages
  DROP CONSTRAINT IF EXISTS ebs_content_pages_page_key_check,
  ADD CONSTRAINT ebs_content_pages_page_key_check CHECK (page_key IN (
    'index', 'about', 'team', 'schedule', 'faq', 'contact',
    'register', 'student-signup', 'schools', 'judges', 'researchers', 'projects',
    'events', 'resources', 'datascience', 'python', 'rstudio', 'opensource', 'datasets',
    'account', 'accept-invitation', 'admin', 'terms', 'privacy'
  ));

-- Every publication, recorded in the same statement that makes it live.
CREATE TABLE IF NOT EXISTS ebs_content_versions (
  instance_id text NOT NULL,
  page_key text NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  schema_version integer NOT NULL CHECK (schema_version > 0),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  published_at timestamptz NOT NULL,
  published_by text NOT NULL,
  published_by_name text NOT NULL DEFAULT '',
  PRIMARY KEY (instance_id, page_key, revision),
  FOREIGN KEY (instance_id, page_key) REFERENCES ebs_content_pages (instance_id, page_key)
);

CREATE OR REPLACE FUNCTION ebs_content_versions_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Published content versions cannot be changed or deleted.';
END;
$$;
CREATE OR REPLACE TRIGGER ebs_content_versions_append_only
  BEFORE UPDATE OR DELETE ON ebs_content_versions
  FOR EACH ROW EXECUTE FUNCTION ebs_content_versions_append_only();
CREATE OR REPLACE TRIGGER ebs_content_versions_no_truncate
  BEFORE TRUNCATE ON ebs_content_versions
  FOR EACH STATEMENT EXECUTE FUNCTION ebs_content_versions_append_only();

REVOKE ALL ON ebs_content_pages, ebs_content_versions FROM PUBLIC;

COMMIT;
