-- Fix payment_orders table to handle Firebase UIDs as TEXT instead of UUID
ALTER TABLE payment_orders ALTER COLUMN user_id TYPE TEXT;

-- Fix user_purchases table to handle Firebase UIDs as TEXT instead of UUID  
ALTER TABLE user_purchases ALTER COLUMN user_id TYPE TEXT;

-- Update any existing profiles table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
    END IF;
END $$;

-- Update user_roles table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE user_roles ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;