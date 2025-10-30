-- Add admin phone numbers to user_roles table for edge function verification
INSERT INTO public.user_roles (user_id, role, phone_number) 
VALUES 
  (gen_random_uuid(), 'admin', '+918888769281'),
  (gen_random_uuid(), 'admin', '+918484843232')
ON CONFLICT (phone_number) DO UPDATE SET role = 'admin';