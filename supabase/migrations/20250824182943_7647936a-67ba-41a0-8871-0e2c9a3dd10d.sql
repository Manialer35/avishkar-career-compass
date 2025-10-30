-- Fix critical security issue: Remove public access to profiles table
-- This prevents hackers from stealing customer personal information

-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- The following secure policies will remain intact:
-- 1. "Users can select own profile" - allows users to view their own profile
-- 2. "Users can update own profile" - allows users to edit their own profile  
-- 3. "Admins can select all profiles" - allows admins to view all profiles
-- 4. "Admins can update all profiles" - allows admins to manage all profiles

-- Verify that proper RLS policies are in place for secure access
-- These policies should already exist but let's ensure they're correctly configured

-- Policy for users to view their own profile (should already exist)
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy for users to update their own profile (should already exist)
CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy for admins to view all profiles (should already exist)
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy for admins to manage all profiles (should already exist)
CREATE POLICY IF NOT EXISTS "Admins can manage all profiles" 
ON public.profiles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add audit logging for profile access
INSERT INTO public.admin_audit_log (
  admin_user_id, 
  action, 
  target_table, 
  new_values
) 
SELECT 
  auth.uid(),
  'security_fix_profiles_access',
  'profiles',
  jsonb_build_object(
    'action', 'removed_public_access_policy',
    'description', 'Removed public visibility of user profiles to prevent data theft',
    'affected_table', 'profiles',
    'security_level', 'critical'
  )
WHERE auth.uid() IS NOT NULL;