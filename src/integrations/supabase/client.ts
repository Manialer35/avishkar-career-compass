// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iflffrqsbsklyhfuskxt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGZmcnFzYnNrbHloZnVza3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzk2MDIsImV4cCI6MjA2MDc1NTYwMn0.0qVYCEOZ4eOmRNMkBlKr7DtMbAL9fdbelKzKi0C9m24";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);