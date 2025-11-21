-- Create new tables with TEXT user_id columns
CREATE TABLE IF NOT EXISTS profiles_new (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_admin BOOLEAN,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS user_roles_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  role USER-DEFINED DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT now(),
  phone_number TEXT
);

-- Enable RLS on new tables
ALTER TABLE profiles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles_new ENABLE ROW LEVEL SECURITY;

-- Create service role policies for the new tables
CREATE POLICY "Service role can manage profiles" ON profiles_new
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

CREATE POLICY "Service role can manage user roles" ON user_roles_new
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

-- Copy data from old tables to new tables
INSERT INTO profiles_new (id, created_at, updated_at, is_admin, username, full_name, avatar_url)
SELECT id::text, created_at, updated_at, is_admin, username, full_name, avatar_url 
FROM profiles ON CONFLICT DO NOTHING;

INSERT INTO user_roles_new (id, user_id, role, created_at, phone_number)
SELECT id, user_id::text, role, created_at, phone_number 
FROM user_roles ON CONFLICT DO NOTHING;

-- Drop old tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Rename new tables
ALTER TABLE profiles_new RENAME TO profiles;
ALTER TABLE user_roles_new RENAME TO user_roles;