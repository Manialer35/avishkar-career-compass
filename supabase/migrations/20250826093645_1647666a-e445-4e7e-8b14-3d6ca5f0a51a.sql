-- Fix the existing user_roles table and resolve infinite recursion issues

-- First, check if the proper enum exists and create the correct one
DO $$ BEGIN
    -- Drop the old enum if it exists with wrong name
    DROP TYPE IF EXISTS user_role CASCADE;
    
    -- Create the correct enum
    CREATE TYPE public.user_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'user_role enum already exists';
END $$;

-- Update the user_roles table to use the correct enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Create simple, non-recursive RLS policies
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage user roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert admin roles for configured phone numbers
INSERT INTO public.user_roles (user_id, role)
SELECT 
    u.id,
    'admin'::user_role
FROM auth.users u
WHERE u.phone IN ('+918888769281', '+918484843232')
ON CONFLICT (user_id, role) DO NOTHING;