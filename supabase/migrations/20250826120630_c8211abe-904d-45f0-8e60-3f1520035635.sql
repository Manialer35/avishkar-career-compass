-- Fix profile and role creation issues by adding proper service role policies

-- Ensure the functions exist and work properly
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(role::text, 'user') 
  FROM user_roles 
  WHERE user_id = user_id_param 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id_param text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id_param 
    AND role = 'admin'
  );
$$;

-- Drop and recreate all policies to ensure they work correctly
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "profiles_allow_own_select" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_own_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_service_role" ON profiles;
DROP POLICY IF EXISTS "user_roles_allow_own_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_allow_own_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_allow_service_role" ON user_roles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT 
  USING (
    id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  )
  WITH CHECK (
    id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

-- Create comprehensive policies for user_roles
CREATE POLICY "user_roles_select_policy" ON public.user_roles
  FOR SELECT 
  USING (
    user_id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "user_roles_insert_policy" ON public.user_roles
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

CREATE POLICY "user_roles_update_policy" ON public.user_roles
  FOR UPDATE
  USING (
    user_id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  )
  WITH CHECK (
    user_id = auth.uid()::text OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role'
  );

-- Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON public.profiles TO authenticated, anon, service_role;
GRANT ALL ON public.user_roles TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated, anon, service_role;