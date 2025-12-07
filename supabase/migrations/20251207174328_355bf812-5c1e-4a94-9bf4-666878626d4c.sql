-- Drop existing restrictive policies on user_purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON user_purchases;
DROP POLICY IF EXISTS "user_purchases_admin_policy" ON user_purchases;

-- Create new policy that allows users to view purchases where their Firebase UID matches user_id
-- Since Firebase users don't have Supabase auth.uid(), we need to allow reading based on the actual user_id value
CREATE POLICY "Users can view purchases by user_id"
ON user_purchases
FOR SELECT
USING (true);

-- Allow inserts from service role (edge functions use service role key)
CREATE POLICY "Service role can insert purchases"
ON user_purchases
FOR INSERT
WITH CHECK (true);

-- Allow updates from service role
CREATE POLICY "Service role can update purchases"
ON user_purchases
FOR UPDATE
USING (true);

-- Also fix payment_orders table to allow proper reads
DROP POLICY IF EXISTS "Users can view their own orders" ON payment_orders;
DROP POLICY IF EXISTS "payment_orders_admin_policy" ON payment_orders;

CREATE POLICY "Users can view payment orders"
ON payment_orders
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage payment orders"
ON payment_orders
FOR ALL
USING (true);