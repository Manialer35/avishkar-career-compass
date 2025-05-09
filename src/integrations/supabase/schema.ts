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
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      issues.push(`Could not check tables: ${tablesError.message}`);
    } else {
      const tableNames = tables?.map(t => t.table_name) || [];
      
      // Check for user_roles table
      if (!tableNames.includes('user_roles')) {
        issues.push("Missing 'user_roles' table");
        console.error("Missing required table: user_roles");
      } else {
        // Check user_roles columns
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'user_roles')
          .eq('table_schema', 'public');
          
        if (columnsError) {
          console.error("Error checking user_roles columns:", columnsError);
          issues.push(`Could not check user_roles columns: ${columnsError.message}`);
        } else {
          const columnNames = columns?.map(c => c.column_name) || [];
          if (!columnNames.includes('user_id')) {
            issues.push("Missing 'user_id' column in user_roles table");
          }
          if (!columnNames.includes('role')) {
            issues.push("Missing 'role' column in user_roles table");
          }
        }
      }
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
  } catch (error) {
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
    // Create user_roles table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('create_user_roles_if_not_exists', {});
    
    if (createTableError) {
      console.error("Error creating user_roles table:", createTableError);
      return { success: false, error: createTableError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception during schema initialization:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};
