-- Fix the last remaining functions

CREATE OR REPLACE FUNCTION public.increment_material_downloads(material_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.study_materials
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = material_id
  RETURNING download_count INTO new_count;
  
  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id::text,
    LOWER(SPLIT_PART(NEW.email, '@', 1)), -- Generate username from email
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)) -- Use full_name from meta or fallback to email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_roles_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user_roles table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    -- Create the user_roles table
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id text NOT NULL UNIQUE,
      role text NOT NULL CHECK (role IN ('admin', 'user')),
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_unique ON user_roles (user_id);
    
    -- Add RLS policies
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their own role"
      ON public.user_roles FOR SELECT
      USING ((auth.uid())::text = user_id);
      
    CREATE POLICY "Service role can manage all roles"
      ON public.user_roles
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;