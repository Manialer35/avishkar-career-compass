-- Complete fix for all authentication and RLS issues

-- First, disable RLS temporarily to reset everything cleanly
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies and functions that might cause recursion
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON profiles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "user_roles_service_role" ON user_roles;

-- Drop problematic functions
DROP FUNCTION IF EXISTS public.get_current_user_role_safe();
DROP FUNCTION IF EXISTS public.is_current_user_admin_safe();
DROP FUNCTION IF EXISTS public.is_current_user_admin_secure();

-- Create simple, non-recursive functions
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

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for profiles
CREATE POLICY "profiles_allow_own_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid()::text);

CREATE POLICY "profiles_allow_own_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_allow_own_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "profiles_allow_service_role" ON public.profiles
  FOR ALL TO service_role
  USING (true);

-- Create simple, working policies for user_roles
CREATE POLICY "user_roles_allow_own_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "user_roles_allow_own_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "user_roles_allow_service_role" ON public.user_roles
  FOR ALL TO service_role
  USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated;