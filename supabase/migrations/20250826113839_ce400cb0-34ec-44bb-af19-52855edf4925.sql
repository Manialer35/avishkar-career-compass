-- Fix profiles table to handle Firebase UIDs as TEXT
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

-- Drop foreign key constraints for profiles if they exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Change profiles id column to TEXT
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Fix user_roles table to handle Firebase UIDs as TEXT
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles safe" ON user_roles;
DROP POLICY IF EXISTS "Users can update their own role info" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON user_roles;

-- Drop foreign key constraints for user_roles if they exist
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Change user_roles user_id column to TEXT
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Recreate policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (id = auth.uid()::text);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
  USING (id = auth.uid()::text);

-- Recreate policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage user roles" ON user_roles
  FOR ALL
  USING (auth.jwt() ? 'service_role'::text);