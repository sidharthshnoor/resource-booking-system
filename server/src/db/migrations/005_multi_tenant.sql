BEGIN;

-- 1. Create organization_status type
CREATE TYPE organization_status AS ENUM ('ACTIVE', 'DEACTIVATED');

-- 2. Create organizations table
CREATE TABLE organizations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo TEXT,
  status organization_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add SUPER_ADMIN to user_role
ALTER TYPE user_role ADD VALUE 'SUPER_ADMIN';

-- 4. Insert Default Organization
INSERT INTO organizations (name, slug, status) 
VALUES ('Default Organization', 'default', 'ACTIVE');

-- 5. Add nullable organization_id columns
ALTER TABLE users ADD COLUMN organization_id BIGINT;
ALTER TABLE resources ADD COLUMN organization_id BIGINT;
ALTER TABLE bookings ADD COLUMN organization_id BIGINT;
ALTER TABLE auth_tokens ADD COLUMN organization_id BIGINT;

-- 6. Backfill existing data with the Default Organization ID
DO $$
DECLARE
  default_org_id BIGINT;
BEGIN
  SELECT id INTO default_org_id FROM organizations WHERE slug = 'default';
  
  UPDATE users SET organization_id = default_org_id;
  UPDATE resources SET organization_id = default_org_id;
  UPDATE bookings SET organization_id = default_org_id;
  UPDATE auth_tokens SET organization_id = default_org_id;
END $$;

-- 7. Apply NOT NULL constraints and Foreign Keys
ALTER TABLE users 
  ALTER COLUMN organization_id SET NOT NULL,
  ADD CONSTRAINT fk_users_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;

ALTER TABLE resources 
  ALTER COLUMN organization_id SET NOT NULL,
  ADD CONSTRAINT fk_resources_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;

ALTER TABLE bookings 
  ALTER COLUMN organization_id SET NOT NULL,
  ADD CONSTRAINT fk_bookings_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;

ALTER TABLE auth_tokens 
  ALTER COLUMN organization_id SET NOT NULL,
  ADD CONSTRAINT fk_auth_tokens_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE;

-- 8. Add Indexes
CREATE INDEX users_organization_id_idx ON users (organization_id);
CREATE INDEX resources_organization_id_idx ON resources (organization_id);
CREATE INDEX bookings_organization_id_idx ON bookings (organization_id);
CREATE INDEX auth_tokens_organization_id_idx ON auth_tokens (organization_id);

-- 9. Add set_updated_at trigger for organizations
CREATE TRIGGER organizations_set_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
