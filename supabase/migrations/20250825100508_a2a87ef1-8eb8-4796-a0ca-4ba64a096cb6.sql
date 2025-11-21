-- Insert admin role for neerajmadkar35@gmail.com if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'neerajmadkar35@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;