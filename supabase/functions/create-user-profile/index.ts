import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firebaseUserId, username, fullName, avatarUrl, phoneNumber } = await req.json();

    if (!firebaseUserId) {
      throw new Error('Firebase user ID is required');
    }

    // Create Supabase service role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`Creating profile for Firebase user: ${firebaseUserId}`);

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', firebaseUserId)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists, skipping creation');
      return new Response(
        JSON.stringify({ success: true, message: 'Profile already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create profile using service role (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: firebaseUserId,
        username: username || `user_${firebaseUserId.substring(0, 8)}`,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        is_admin: false
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('Profile created successfully');

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', firebaseUserId)
      .maybeSingle();

    if (existingRole) {
      console.log('User role already exists, skipping creation');
      return new Response(
        JSON.stringify({ success: true, message: 'Profile and role already exist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if user should be admin based on phone number
    const adminPhones = ['+918888769281', '+918484843232'];
    const isAdminPhone = phoneNumber && adminPhones.includes(phoneNumber);

    // Create user role using service role (bypasses RLS)
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: firebaseUserId,
        role: isAdminPhone ? 'admin' : 'user',
        phone_number: phoneNumber || null
      });

    if (roleError) {
      console.error('Role creation error:', roleError);
      throw new Error(`Failed to create user role: ${roleError.message}`);
    }

    console.log(`User role created successfully: ${isAdminPhone ? 'admin' : 'user'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile and role created successfully',
        isAdmin: isAdminPhone 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-user-profile function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});