-- Enable RLS on pending_admin_emails table to fix security warning
ALTER TABLE public.pending_admin_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage pending admin emails
CREATE POLICY "Only admins can manage pending admin emails"
ON public.pending_admin_emails
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (auth.uid())::text
    AND role = 'admin'
  )
);