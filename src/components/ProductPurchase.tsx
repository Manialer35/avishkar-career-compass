-- Add any columns that might be missing from the existing table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES study_materials(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'google_pay';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'completed';
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create the index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_user_material'
    ) THEN
        CREATE INDEX idx_purchases_user_material ON purchases (user_id, material_id);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policies (they will fail silently if they already exist with the same name)
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
CREATE POLICY "Users can view their own purchases" ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own purchases" ON purchases;
CREATE POLICY "Users can create their own purchases" ON purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
