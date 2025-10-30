-- Fix RLS policies and table constraints

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Create profiles table with proper structure
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_admin BOOLEAN DEFAULT false,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT
);

-- Create user_roles table with proper constraints
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  phone_number TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "Service role full access profiles" ON profiles
  FOR ALL USING (auth.jwt() ? 'service_role'::text);

-- Create comprehensive policies for user_roles
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Service role full access user_roles" ON user_roles
  FOR ALL USING (auth.jwt() ? 'service_role'::text);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();