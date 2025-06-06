
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    const requestBody = await req.json();
    const { amount, currency, productId, productName, customerId, customerEmail } = requestBody;

    if (!amount || !productId || !productName) {
      throw new Error("Missing required parameters");
    }

    // Razorpay API credentials
    const razorpayKeyId = "rzp_live_OCL24jX6vVdT6W";
    const razorpayKeySecret = "BKJ9SSdJediRnBru61KFQKsx";

    // Create Razorpay order
    const orderPayload = {
      amount: amount, // amount in paise
      currency: currency || 'INR',
      receipt: `order_${productId}_${Date.now()}`,
      notes: {
        productId,
        productName,
        customerId: customerId || userData.user.id,
        customerEmail: customerEmail || userData.user.email,
      },
    };

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text();
      console.error('Razorpay API error:', errorData);
      throw new Error('Failed to create Razorpay order');
    }

    const orderData = await razorpayResponse.json();

    // Store order in database
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        order_id: orderData.id,
        product_id: productId,
        user_id: userData.user.id,
        amount: amount / 100, // Convert back to main currency unit
        currency: currency || 'INR',
        status: 'created',
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log(`Order created successfully: ${orderData.id}`);

    return new Response(
      JSON.stringify(orderData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Error creating order"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
