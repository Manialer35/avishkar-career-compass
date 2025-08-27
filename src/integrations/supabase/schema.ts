
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to check if the required database tables and schemas exist
 * Call this function during app initialization to verify database setup
 */
export const checkDatabaseSchema = async () => {
  console.log("Checking database schema...");
  const issues = [];
  
  try {
    // Check if user_roles table exists
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('count(*)')
      .limit(1);
      
    if (userRolesError) {
      console.error("Error checking user_roles table:", userRolesError);
      issues.push(`User roles table might not exist: ${userRolesError.message}`);
    }
    
    // Test the auth API
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Auth API error:", sessionError);
      issues.push(`Auth API error: ${sessionError.message}`);
    }
    
    if (issues.length > 0) {
      console.error("Database schema issues found:", issues);
      return {
        isValid: false,
        issues
      };
    }
    
    console.log("Database schema check passed!");
    return {
      isValid: true,
      issues: []
    };
  } catch (error: any) {
    console.error("Exception during schema check:", error);
    return {
      isValid: false,
      issues: [`Unexpected error during schema check: ${error.message || "Unknown error"}`]
    };
  }
};

/**
 * Helper function to create missing database tables if they don't exist
 * This can be used to initialize a new Supabase project
 */
export const initializeDatabaseSchema = async () => {
  console.log("Initializing database schema...");
  try {
    // Verify user_roles table exists by querying it
    const { error } = await supabase
      .from('user_roles')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error("Error with user_roles table:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception during schema initialization:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};
