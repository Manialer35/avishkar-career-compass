-- Grant admin access to neerajmadkar35@gmail.com (currently logged in user)
-- This user has Firebase ID: mGpb2FNlDQN7jBAOU4xty5wOir03
INSERT INTO public.user_roles (user_id, role)
VALUES ('mGpb2FNlDQN7jBAOU4xty5wOir03', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', updated_at = now();

-- Also ensure khot.md@gmail.com gets admin when they sign in
-- Add to pending_admin_emails if not already there
INSERT INTO public.pending_admin_emails (email)
VALUES ('khot.md@gmail.com')
ON CONFLICT (email) DO NOTHING;