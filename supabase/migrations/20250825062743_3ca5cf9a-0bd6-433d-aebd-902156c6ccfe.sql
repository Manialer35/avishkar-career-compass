-- Add phone_number column to user_roles if it doesn't exist
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS phone_number text UNIQUE;

-- Add admin phone numbers for edge function verification without linking to auth.users
INSERT INTO public.user_roles (user_id, role, phone_number) 
VALUES 
  (NULL, 'admin', '+918888769281'),
  (NULL, 'admin', '+918484843232')
ON CONFLICT (phone_number) DO UPDATE SET role = 'admin';