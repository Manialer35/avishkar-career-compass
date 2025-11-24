-- Fix the get_users_with_roles function to handle text IDs instead of UUID
DROP FUNCTION IF EXISTS public.get_users_with_roles();

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  id text,
  full_name text,
  phone_number text,
  role text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id::text,
    p.full_name,
    ur.phone_number,
    COALESCE(ur.role::text, 'user') as role,
    p.created_at
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
$$;