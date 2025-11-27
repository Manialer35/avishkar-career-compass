-- Fix 1: Add unique constraint on user_purchases for upsert to work
ALTER TABLE public.user_purchases 
ADD CONSTRAINT user_purchases_user_material_unique 
UNIQUE (user_id, material_id);

-- Fix 2: Create trigger to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id::text,
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix 3: Update and attach trigger for admin role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Fix 4: Also check pending_admin_emails in the role assignment function
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user role based on email or pending admin status
    BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (
            NEW.id::text,
            CASE 
                WHEN NEW.email = 'khot.md@gmail.com' THEN 'admin'
                WHEN EXISTS (SELECT 1 FROM public.pending_admin_emails WHERE email = NEW.email) THEN 'admin'
                ELSE 'user'
            END
        )
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        -- Remove from pending admins if found
        DELETE FROM public.pending_admin_emails WHERE email = NEW.email;
        
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error creating user role: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;