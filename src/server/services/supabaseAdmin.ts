
import { createClient } from '@supabase/supabase-js';

// Use environment variables when available, or fallback to the regular client values
const supabaseUrl = process.env.SUPABASE_URL || 'https://iflffrqsbsklyhfuskxt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
