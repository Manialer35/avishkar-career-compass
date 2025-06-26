
-- Function to calculate new count value (for use with download counters)
CREATE OR REPLACE FUNCTION calculate_new_count(current_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Simply return current_count + 1, or 1 if null
  RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;
