-- Apply to the existing private Neon database only after reviewing bootstrap output.
-- No public/browser database role may read or mutate these tables.
CREATE TABLE IF NOT EXISTS ebs_org_allocator_leases (
  instance_id text PRIMARY KEY,
  token uuid NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS ebs_org_registry (
  instance_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pending','accepted')),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  operation_id text NOT NULL,
  organization_id text,
  state text NOT NULL CHECK (state IN ('creating','ready','needs-review','failed')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (instance_id,kind,ordinal),
  UNIQUE (instance_id,operation_id),
  UNIQUE (instance_id,organization_id),
  CHECK (state <> 'ready' OR organization_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS ebs_org_operations (
  instance_id text NOT NULL,
  subject_key text NOT NULL,
  operation_id text NOT NULL,
  body jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (instance_id,subject_key),
  UNIQUE (instance_id,operation_id),
  CHECK (body->>'phase' IN ('planned','submitted','needs-review','complete'))
);
REVOKE ALL ON ebs_org_registry, ebs_org_operations, ebs_org_allocator_leases FROM PUBLIC;
