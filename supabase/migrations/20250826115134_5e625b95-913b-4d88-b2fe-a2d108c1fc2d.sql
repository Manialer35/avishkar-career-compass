-- Fix infinite recursion in RLS policies by using security definer functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;

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

-- Update profiles policies to use the safe function
CREATE POLICY "Admins can view all profiles safe" ON profiles
  FOR SELECT USING (public.is_current_user_admin_secure() = true);

-- Create a simpler policy for user_roles that doesn't cause recursion
CREATE POLICY "Service role and admins can view user roles" ON user_roles
  FOR SELECT USING (
    auth.jwt() ? 'service_role'::text OR 
    user_id = auth.uid()::text OR
    auth.uid()::text IN (
      SELECT ur.user_id FROM user_roles ur 
      WHERE ur.role = 'admin' AND ur.user_id = auth.uid()::text
    )
  );

-- Add policies that allow users to view their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update own profile" ON profiles  
  FOR UPDATE USING (id = auth.uid()::text);

-- Add a simple policy for user roles
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid()::text);