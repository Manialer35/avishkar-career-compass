-- Drop all policies that reference user_id in class_registrations table
DROP POLICY IF EXISTS "Admins can view all class registrations" ON class_registrations;
DROP POLICY IF EXISTS "Only admins can view class registrations" ON class_registrations;
DROP POLICY IF EXISTS "Admins can delete class registrations" ON class_registrations;

-- Drop all policies that reference user_id in user_roles table
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles safe" ON user_roles; 
DROP POLICY IF EXISTS "Users can update their own role info" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON user_roles;

-- Drop all policies that reference user_id in profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles; 
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles safe" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles safe" ON profiles;
DROP POLICY IF EXISTS "Admins can select all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Now alter the columns
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Recreate essential policies only
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid()::text);

CREATE POLICY "Service role can manage user roles" ON user_roles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);

CREATE POLICY "Authenticated users can register for classes" ON class_registrations
  FOR INSERT
  WITH CHECK (true);