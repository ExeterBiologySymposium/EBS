CREATE TABLE IF NOT EXISTS ebs_page_content (
 instance_id text NOT NULL, page_key text NOT NULL CHECK(page_key IN ('researchers','resources','datascience','python','rstudio')),
 revision integer NOT NULL DEFAULT 0 CHECK(revision>=0), draft jsonb NOT NULL, published jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(), actor text NOT NULL,
 PRIMARY KEY(instance_id,page_key)
);
CREATE TABLE IF NOT EXISTS ebs_page_publications (
 instance_id text NOT NULL, page_key text NOT NULL, revision integer NOT NULL,
 content jsonb NOT NULL, actor text NOT NULL, published_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(instance_id,page_key,revision),
 FOREIGN KEY(instance_id,page_key) REFERENCES ebs_page_content(instance_id,page_key)
);
REVOKE ALL ON ebs_page_content, ebs_page_publications FROM PUBLIC;
