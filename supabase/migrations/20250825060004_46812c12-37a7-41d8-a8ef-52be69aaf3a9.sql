-- Make user_id nullable for phone-based admin tracking
ALTER TABLE public.user_roles ALTER COLUMN user_id DROP NOT NULL;

-- Add phone_number column  
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;

-- Insert admin user by phone number
INSERT INTO public.user_roles (phone_number, role)
VALUES ('+918888769281', 'admin')
ON CONFLICT (phone_number) DO UPDATE SET role = 'admin';

-- Create function to check admin by phone
CREATE OR REPLACE FUNCTION public.is_admin_by_phone(phone_num TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE phone_number = phone_num AND role = 'admin'
  );
END;
$$;