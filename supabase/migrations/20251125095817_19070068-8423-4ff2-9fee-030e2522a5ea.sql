-- Drop and recreate get_users_with_roles function to include email
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  id text, 
  full_name text, 
  phone_number text,
  email text,
  role text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id::text,
    p.full_name,
    ur.phone_number,
    au.email,
    COALESCE(ur.role::text, 'user') as role,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  LEFT JOIN auth.users au ON p.id = au.id::text
  ORDER BY p.created_at DESC;
$$;

-- Grant admin access to khot.md@gmail.com
DO $$
DECLARE
    target_user_id text;
BEGIN
    -- Find user with this email
    SELECT id::text INTO target_user_id 
    FROM auth.users 
    WHERE email = 'khot.md@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        -- Make them admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();
        
        RAISE NOTICE 'Admin access granted to khot.md@gmail.com';
    ELSE
        RAISE NOTICE 'User with email khot.md@gmail.com not found in auth.users';
    END IF;
END $$;