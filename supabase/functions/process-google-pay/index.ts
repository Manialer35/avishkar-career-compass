
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract payment data from request body
    const { paymentData, productId, amount, customerEmail } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract payment token and details
    const { token } = paymentData.paymentMethodData;
    
    console.log('Processing test payment with token:', token);
    console.log('This is a TEST environment payment - no actual charges are made');

    // Record the transaction in the database
    const { data, error } = await supabase
      .from('material_purchases')
      .insert([
        {
          material_id: productId,
          user_email: customerEmail,
          amount: amount,
          payment_id: `google-pay-test-${Date.now()}`, // Test payment ID
          payment_status: 'test_completed',
          user_name: customerEmail?.split('@')[0] || 'Customer'
        }
      ]);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test payment processed successfully",
        transactionId: `google-pay-test-${Date.now()}`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Error processing payment"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
