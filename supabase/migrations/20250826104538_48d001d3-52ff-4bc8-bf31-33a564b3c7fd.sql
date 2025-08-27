-- Fix Firebase UID compatibility with Supabase
-- Change user ID columns to TEXT to accommodate Firebase UIDs

-- First, update profiles table to use TEXT for Firebase UIDs
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Update user_roles table to use TEXT for Firebase UIDs
ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;

-- Update other tables that reference user IDs
ALTER TABLE user_purchases ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE payment_orders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE material_purchases ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE academy_images ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE image_metadata ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE training_video_folders ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE admin_audit_log ALTER COLUMN admin_user_id TYPE TEXT;
ALTER TABLE classes ALTER COLUMN created_by TYPE TEXT;

-- Update functions that reference user IDs to handle TEXT format
CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.jwt() ->> 'sub'
    AND role = 'admin'::user_role
  );
$$;

-- Update the handle_new_user function to work with Firebase UIDs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile for Firebase user
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id::text,
    LOWER(SPLIT_PART(COALESCE(NEW.email, NEW.phone, 'user'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(COALESCE(NEW.email, NEW.phone, 'user'), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role, phone_number)
  VALUES (
    NEW.id::text,
    CASE 
      WHEN NEW.phone IN ('+918888769281', '+918484843232') THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    NEW.phone
  )
  ON CONFLICT (user_id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    role = CASE 
      WHEN NEW.phone IN ('+918888769281', '+918484843232') THEN 'admin'::user_role
      ELSE user_roles.role  -- Keep existing role if not admin phone
    END;

  RETURN NEW;
END;
$$;

-- Update other admin checking functions
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id_param text DEFAULT (auth.jwt() ->> 'sub'))
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_id_param AND role = 'admin'
  );
END;
$$;

-- Update get_users_with_roles function to work with Firebase UIDs
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(id text, full_name text, phone_number text, role text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.id::text,
    p.full_name,
    ur.phone_number,
    ur.role::text,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
$$;