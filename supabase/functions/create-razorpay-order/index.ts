import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, productId, productName, customerId, customerEmail } = await req.json();

    // Create Supabase client using anon key for user verification
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create Supabase client using service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      throw new Error("Authentication required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid user:", userError?.message);
      throw new Error("Invalid authentication");
    }

    // Create Razorpay order using your API key
    const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKey || !razorpaySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const orderData = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `order_${productId}_${Date.now()}`,
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${razorpayKey}:${razorpaySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Razorpay API error:", errorData);
      throw new Error("Failed to create Razorpay order");
    }

    const order = await response.json();

    // Store order in database
    const { error: insertError } = await supabase
      .from("payment_orders")
      .insert({
        order_id: order.id,
        product_id: productId,
        user_id: user.id,
        amount: amount / 100, // Store in rupees
        currency: currency || "INR",
        status: "created",
      });

    if (insertError) {
      console.error("Error storing order:", insertError);
      throw new Error("Failed to store order");
    }

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});