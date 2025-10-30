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
    // Parse request body first to get user info
    const requestBody = await req.json();
    const { amount, currency, productId, productName, customerId, customerEmail } = requestBody;

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

    // Get user from auth header - REQUIRE authentication for payments
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error("Authentication required for payment");
    }
    
    if (!customerId) {
      console.error("Missing customer ID in request body");
      throw new Error("User ID is required for payment");
    }
    
    console.log("Processing payment for user:", customerId);
    
    // Verify that the product exists in study_materials table
    const { data: material, error: materialError } = await supabase
      .from('study_materials')
      .select('id, name, price')
      .eq('id', productId)
      .single();
      
    if (materialError || !material) {
      console.error("Material not found:", materialError);
      throw new Error("Study material not found");
    }
    
    console.log("Found material:", material.name, "Price:", material.price);

    // Create Razorpay order using your API key
    const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKey || !razorpaySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const orderData = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `ord_${Date.now().toString().slice(-8)}`, // Keep under 40 chars
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

    // Store order in database - user_id is required
    const orderRecord = {
      order_id: order.id,
      product_id: productId,
      user_id: customerId, // Use Firebase user ID
      amount: amount / 100, // Store in rupees
      currency: currency || "INR",
      status: "created",
    };

    console.log("Creating order record:", orderRecord);

    const { error: insertError } = await supabase
      .from("payment_orders")
      .insert(orderRecord);

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