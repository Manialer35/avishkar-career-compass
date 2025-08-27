-- Fix security issues for production readiness

-- 1. Add missing RLS policies for tables that have RLS enabled but no policies
-- Check which tables need policies by looking at the linter results

-- Add policy for purchases table (users can view their own purchases)
CREATE POLICY "Users can view their own purchases" ON public.purchases
FOR SELECT USING (user_id = auth.uid());

-- Add policy for class_registrations table (admins can view all registrations)
CREATE POLICY "Admins can view class registrations" ON public.class_registrations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (auth.uid())::text 
    AND role = 'admin'
  )
);

-- Add policy for class_enrollments table (admins can view all enrollments)
CREATE POLICY "Admins can view class enrollments" ON public.class_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (auth.uid())::text 
    AND role = 'admin'
  )
);

-- Add policy for material_purchases table (service role can manage)
CREATE POLICY "Service role can manage material purchases" ON public.material_purchases
FOR ALL USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text OR 
  auth.role() = 'service_role'::text
);

-- Add policy for admin_audit_log table (admins can view)
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (auth.uid())::text 
    AND role = 'admin'
  )
);

-- 2. Fix database functions with missing search_path (security definer functions)
-- Update functions to have proper search_path settings

CREATE OR REPLACE FUNCTION public.check_user_is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id::text 
    AND role = 'admin'::user_role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(id uuid, full_name text, phone_number text, role text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id::uuid,
    p.full_name,
    ur.phone_number,
    ur.role::text,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (auth.uid())::text AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_by_phone(phone_num text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE phone_number = phone_num AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_is_admin_by_phone(user_phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_phone IN ('+918888769281', '+918484843232');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_phone(phone_num text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT phone_num IN ('+918888769281', '+918484843232');
$$;