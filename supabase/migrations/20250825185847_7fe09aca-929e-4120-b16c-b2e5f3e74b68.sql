-- Fix security issues and optimize database policies

-- 1. Restrict class_registrations to require authentication for insertion
DROP POLICY IF EXISTS "Anyone can register for classes" ON public.class_registrations;
CREATE POLICY "Authenticated users can register for classes" 
ON public.class_registrations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 2. Restrict class_enrollments to require authentication for insertion  
DROP POLICY IF EXISTS "Anyone can enroll for classes" ON public.class_enrollments;
CREATE POLICY "Authenticated users can enroll for classes" 
ON public.class_enrollments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. Restrict user_roles viewing to only the user's own role
DROP POLICY IF EXISTS "Authenticated users can read roles" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 4. Allow admins to view all user roles for management purposes
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.user_roles (user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id) do update set role = excluded.role, updated_at = now();
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare v_role text;
begin
  select role into v_role from public.user_roles where user_id = p_user_id;
  return coalesce(v_role, 'user');
end;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_expiry_date(duration_months integer, duration_type text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF duration_type = 'lifetime' THEN
    RETURN '9999-12-31 23:59:59'::TIMESTAMP WITH TIME ZONE;
  ELSE
    RETURN NOW() + (duration_months || ' months')::INTERVAL;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id text, p_role text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = p_role;
END;$function$;