import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, otpCode } = await req.json()

    if (!phoneNumber || !otpCode) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP code are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get OTP record
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from('phone_otps')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number or OTP expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin
        .from('phone_otps')
        .delete()
        .eq('phone_number', phoneNumber)

      return new Response(
        JSON.stringify({ error: 'OTP has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      await supabaseAdmin
        .from('phone_otps')
        .delete()
        .eq('phone_number', phoneNumber)

      return new Response(
        JSON.stringify({ error: 'Too many incorrect attempts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verify OTP
    if (otpRecord.otp_code !== otpCode) {
      // Increment attempts
      await supabaseAdmin
        .from('phone_otps')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('phone_number', phoneNumber)

      return new Response(
        JSON.stringify({ error: 'Invalid OTP code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // OTP is valid - create/get user profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    let userId = existingProfile?.id
    
    if (!existingProfile) {
      // Create new user profile
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          username: `user_${phoneNumber.slice(-8)}`,
          phone_number: phoneNumber,
          full_name: null,
          avatar_url: null
        })
        .select('id')
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      userId = newProfile.id
    }

    // Check admin status
    const adminPhones = ['+918888769281', '+91 8888769281', '8888769281']
    const cleanPhone = phoneNumber.replace(/\s/g, '')
    const isAdmin = adminPhones.some(phone => {
      const cleanAdminPhone = phone.replace(/\s/g, '')
      return cleanPhone === cleanAdminPhone || cleanPhone.endsWith(cleanAdminPhone.replace('+91', ''))
    })

    // Generate session token (simple JWT-like token for demo)
    const sessionToken = btoa(JSON.stringify({
      userId,
      phoneNumber,
      isAdmin,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }))

    // Clean up OTP record
    await supabaseAdmin
      .from('phone_otps')
      .delete()
      .eq('phone_number', phoneNumber)

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: userId,
          phoneNumber,
          isAdmin
        },
        sessionToken
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})