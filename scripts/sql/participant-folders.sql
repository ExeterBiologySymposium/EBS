-- Apply once to the dedicated Neon database using its SQL editor, before enabling the feature.
CREATE TABLE IF NOT EXISTS ebs_participant_folders (
  namespace text NOT NULL,
  user_id text NOT NULL,
  email text NOT NULL,
  folder_id text NOT NULL,
  document_id text,
  copy_started boolean NOT NULL DEFAULT false,
  ready boolean NOT NULL DEFAULT false,
  claim_token text,
  claim_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (namespace, user_id),
  UNIQUE (namespace, folder_id),
  CHECK (NOT ready OR document_id IS NOT NULL)
);
-- Use a private server database role. No browser/public API access to this table.
