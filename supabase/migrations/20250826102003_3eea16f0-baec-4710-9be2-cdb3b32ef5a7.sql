-- Fix RLS infinite recursion issues and relationship problems

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::user_role
  );
$$;

-- Drop problematic policies and recreate them
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Create safe policies for user_roles
CREATE POLICY "Admins can view all user roles safe" 
ON public.user_roles FOR SELECT 
USING (public.is_current_user_admin_safe() OR user_id = auth.uid());

CREATE POLICY "Service role can manage user roles" 
ON public.user_roles FOR ALL 
USING (auth.jwt() ? 'service_role');

-- Create safe policies for profiles  
CREATE POLICY "Admins can view all profiles safe"
ON public.profiles FOR SELECT
USING (public.is_current_user_admin_safe() OR id = auth.uid());

CREATE POLICY "Admins can manage all profiles safe"
ON public.profiles FOR ALL
USING (public.is_current_user_admin_safe());

-- Fix training_videos policies
DROP POLICY IF EXISTS "Admins can manage training videos" ON public.training_videos;
CREATE POLICY "Admins can manage training videos safe"
ON public.training_videos FOR ALL
USING (public.is_current_user_admin_safe());

-- Create function to get user data with roles safely
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  id uuid,
  full_name text,
  phone_number text,
  role text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.full_name,
    ur.phone_number,
    ur.role::text,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
$$;