-- Create a new auth integration that works with Firebase UIDs
-- Since we can't alter existing tables due to RLS policies, we'll create a compatibility layer

-- Create a function to get Firebase user ID from auth.jwt()
CREATE OR REPLACE FUNCTION auth.firebase_uid() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.uid()::text
  );
$$;

-- Update existing functions to use Firebase UIDs correctly
CREATE OR REPLACE FUNCTION public.is_current_user_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.firebase_uid()
    AND role = 'admin'::user_role
  ) OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid()::text
    AND role = 'admin'::user_role
  );
$$;

-- Create a trigger to automatically create profiles for Firebase users
CREATE OR REPLACE FUNCTION public.create_firebase_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  firebase_id text;
BEGIN
  firebase_id := auth.firebase_uid();
  
  IF firebase_id IS NOT NULL THEN
    -- Create profile if doesn't exist
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
      firebase_id,
      'user_' || substring(firebase_id, 1, 8),
      'Firebase User'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Create user role if doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      firebase_id,
      'user'::user_role
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$;

-- Create a function to check if user exists with Firebase ID format
CREATE OR REPLACE FUNCTION public.ensure_firebase_user_exists(firebase_uid text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile if doesn't exist
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    firebase_uid,
    'user_' || substring(firebase_uid, 1, 8),
    'Firebase User'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user role if doesn't exist
  INSERT INTO public.user_roles (user_id, role, phone_number)
  VALUES (
    firebase_uid,
    CASE 
      WHEN firebase_uid IN (
        SELECT user_id FROM user_roles WHERE phone_number IN ('+918888769281', '+918484843232')
      ) THEN 'admin'::user_role
      ELSE 'user'::user_role
    END,
    NULL
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;