-- Create trigger to auto-grant admin access to khot.md@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Create user role based on email
    BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (
            NEW.id::text,
            CASE 
                WHEN NEW.email = 'khot.md@gmail.com' THEN 'admin'
                ELSE 'user'
            END
        )
        ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
        
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error creating user role: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_role();