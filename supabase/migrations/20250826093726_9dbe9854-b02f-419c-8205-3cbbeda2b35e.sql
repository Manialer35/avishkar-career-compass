-- Fix the user_roles table infinite recursion and set up proper admin access

-- First, let's check what enum type exists
DO $$ 
DECLARE
    enum_name text;
BEGIN
    SELECT typname INTO enum_name FROM pg_type WHERE typname IN ('user_role', 'app_role');
    RAISE NOTICE 'Found enum type: %', COALESCE(enum_name, 'none');
END $$;

-- Drop all existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create a simple, secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.check_user_is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'admin'::user_role
  );
$$;

-- Create simple RLS policies that don't cause recursion
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add admin role for the phone number +918888769281
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Find the user with phone +918888769281
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE phone = '+918888769281'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::user_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role added for user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'User with phone +918888769281 not found';
    END IF;
END $$;