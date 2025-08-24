
import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for consistency
const supabaseUrl = 'https://iflffrqsbsklyhfuskxt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGZmcnFzYnNrbHloZnVza3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTQyNzEsImV4cCI6MjA2MzA3MDI3MX0.UUHOofE53yzaLsJ3LdfxnQJScVTPTC5CYY7X-moQ5JQ';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
