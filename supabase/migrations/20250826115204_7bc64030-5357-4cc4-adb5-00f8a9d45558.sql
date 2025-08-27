-- Fix infinite recursion by completely rebuilding policies

-- Drop ALL existing policies on both tables
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles safe" ON profiles;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role full access user_roles" ON user_roles;
DROP POLICY IF EXISTS "Service role and admins can view user roles" ON user_roles;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM user_roles WHERE user_id = auth.uid()::text LIMIT 1),
    'user'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_secure()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text 
    AND role = 'admin'::user_role
  );
$$;

-- Create new clean policies for profiles
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_update_own" ON profiles  
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "profiles_service_role" ON profiles
  FOR ALL USING (auth.jwt() ? 'service_role'::text);

-- Create new clean policies for user_roles
CREATE POLICY "user_roles_select_own" ON user_roles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "user_roles_service_role" ON user_roles
  FOR ALL USING (auth.jwt() ? 'service_role'::text);