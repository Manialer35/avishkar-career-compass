-- Temporarily disable RLS to avoid policy conflicts
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all policies from all tables that might reference user_id
DROP POLICY IF EXISTS "Only admins can view class registrations" ON class_registrations;
DROP POLICY IF EXISTS "Admins can view all class registrations" ON class_registrations;
DROP POLICY IF EXISTS "Admins can delete class registrations" ON class_registrations;

-- Now change column types
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create service role policies for payment system functionality
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

CREATE POLICY "Service role can manage user roles" ON user_roles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

-- Recreate class registrations policy without user_id dependency
CREATE POLICY "Authenticated users can register for classes" ON class_registrations
  FOR INSERT
  WITH CHECK (true);