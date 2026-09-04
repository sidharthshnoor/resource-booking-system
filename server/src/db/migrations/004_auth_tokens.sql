CREATE TYPE auth_token_type AS ENUM ('INVITATION', 'PASSWORD_RESET');

CREATE TABLE auth_tokens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type auth_token_type NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_tokens_token_hash_idx ON auth_tokens (token_hash);
CREATE INDEX auth_tokens_email_idx ON auth_tokens (LOWER(email));
CREATE INDEX auth_tokens_user_id_idx ON auth_tokens (user_id);
