ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

-- PostgreSQL fills existing rows with the DEFAULT above; it does not set them
-- to true. New temporary admins explicitly opt into true in application flows.
