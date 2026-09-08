BEGIN;

-- Add organization_id to auth_tokens
ALTER TABLE auth_tokens ADD COLUMN IF NOT EXISTS organization_id BIGINT;

-- Backfill auth_tokens with the Default Organization ID
DO $$
DECLARE
  default_org_id BIGINT;
BEGIN
  SELECT id INTO default_org_id FROM organizations WHERE slug = 'default';
  
  UPDATE auth_tokens SET organization_id = default_org_id WHERE organization_id IS NULL;
END $$;

-- Apply NOT NULL constraint and Foreign Key
ALTER TABLE auth_tokens 
  ALTER COLUMN organization_id SET NOT NULL;

-- Cannot add constraint IF NOT EXISTS easily without DO block, but since we just added it, it's safe.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_auth_tokens_organization'
  ) THEN
    ALTER TABLE auth_tokens ADD CONSTRAINT fk_auth_tokens_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add Index
CREATE INDEX IF NOT EXISTS auth_tokens_organization_id_idx ON auth_tokens (organization_id);

COMMIT;
