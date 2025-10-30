-- Fix remaining security issues

-- Fix the remaining functions that still need search_path
CREATE OR REPLACE FUNCTION public.create_user_roles_if_not_exists(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Check if the user already has a role
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id::text) THEN
        -- Insert new user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (p_user_id::text, p_role);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_storage_object_to_metadata()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Extract title from filename (assumes format: timestamp_title.ext)
  DECLARE
    filename TEXT := NEW.name;
    extracted_title TEXT;
    extracted_category TEXT := COALESCE(NEW.metadata->>'category', 'General');
  BEGIN
    -- Basic title extraction logic
    extracted_title := regexp_replace(
      split_part(filename, '_', 2),
      '\.[^.]*$', -- Remove file extension
      ''
    );
    
    -- If no underscore or extraction failed, use filename without extension
    IF extracted_title IS NULL OR extracted_title = '' THEN
      extracted_title := regexp_replace(filename, '\.[^.]*$', '');
    END IF;
    
    -- Insert metadata record
    INSERT INTO public.image_metadata (
      object_id, 
      title, 
      category, 
      created_by
    ) VALUES (
      NEW.id, 
      extracted_title, 
      extracted_category, 
      auth.uid()
    );
    
    RETURN NEW;
  END;
END;
$$;

-- Add the missing RLS policy for profiles_backup table
DROP POLICY IF EXISTS "Anyone can view profiles backup" ON public.profiles_backup;
CREATE POLICY "Service role can manage profiles backup" ON public.profiles_backup
FOR ALL USING (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text OR 
  auth.role() = 'service_role'::text
);