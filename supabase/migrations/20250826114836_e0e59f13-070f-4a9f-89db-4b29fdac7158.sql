-- Fix critical security issues from linter

-- Add missing policies for profiles table
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- Add missing policies for user_roles table  
CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid()::text AND ur.role = 'admin'
    )
  );

-- Fix function search paths by setting them explicitly
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()::text AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_by_phone(phone_num text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE phone_number = phone_num AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_is_admin(check_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id 
    AND role = 'admin'::user_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_user_is_admin_by_phone(user_phone text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT user_phone IN ('+918888769281', '+918484843232');
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_phone(phone_num text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT phone_num IN ('+918888769281', '+918484843232');
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text
    AND role = 'admin'::user_role
  );
$function$;