-- Check if neerajmadkar35@gmail.com exists and add admin role if email user exists
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'neerajmadkar35@gmail.com'
    LIMIT 1;
    
    -- If user exists, insert admin role if not already exists
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        SELECT target_user_id, 'admin'::user_role
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = target_user_id AND role = 'admin'::user_role
        );
    END IF;
END $$;