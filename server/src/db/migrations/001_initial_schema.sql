CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE resource_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_lower_unique_idx ON users (LOWER(email));

CREATE TABLE resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  type VARCHAR(80) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status resource_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX resources_status_idx ON resources (status);

CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  resource_id BIGINT NOT NULL REFERENCES resources (id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_time_order_check CHECK (start_time < end_time)
);

CREATE INDEX bookings_user_id_idx ON bookings (user_id);
CREATE INDEX bookings_resource_id_idx ON bookings (resource_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_time_idx ON bookings (start_time, end_time);
CREATE INDEX bookings_resource_time_idx ON bookings (resource_id, start_time, end_time);

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_pending_or_approved_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status IN ('PENDING', 'APPROVED'));

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER resources_set_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
