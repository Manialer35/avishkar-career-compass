-- Fix remaining database functions with missing search_path

CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(role::text, 'user') 
  FROM user_roles 
  WHERE user_id = user_id_param 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id_param 
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid::text AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id::text, p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = excluded.role, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_expiry_date(duration_months integer, duration_type text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF duration_type = 'lifetime' THEN
    RETURN '9999-12-31 23:59:59'::TIMESTAMP WITH TIME ZONE;
  ELSE
    RETURN NOW() + (duration_months || ' months')::INTERVAL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_role(p_user_id text, p_role text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id) DO UPDATE SET role = p_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_bucket_exists(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = bucket_name
  ) INTO bucket_exists;
  
  RETURN bucket_exists;
END;
$$;