import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      productId, 
      userId 
    } = await req.json();

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from request body (Firebase user ID)
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    console.log("Verifying payment for user:", userId);

    // Verify payment signature
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpaySecret) {
      throw new Error("Razorpay secret not configured");
    }

    const expectedSignature = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpaySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ).then(key => 
      crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)
      )
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // Get material details for expiry calculation
    const { data: material, error: materialError } = await supabase
      .from('study_materials')
      .select('duration_months, duration_type, price')
      .eq('id', productId)
      .single();

    if (materialError) {
      throw materialError;
    }

    // Calculate expiry date
    let expiryDate: string | null = null;
    if (material.duration_type === 'lifetime') {
      expiryDate = null; // No expiry for lifetime access
    } else {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + (material.duration_months || 12));
      expiryDate = expiry.toISOString();
    }

    // Update payment order status
    const { error: updateOrderError } = await supabase
      .from("payment_orders")
      .update({
        payment_id: razorpay_payment_id,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id);

    if (updateOrderError) {
      console.error("Error updating order:", updateOrderError);
    }

    // Record purchase in user_purchases table
    const { error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_id: userId, // Use Firebase user ID
        material_id: productId,
        payment_id: razorpay_payment_id,
        amount: material.price,
        expires_at: expiryDate,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError);
      throw new Error("Failed to record purchase");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and access granted",
        expiryDate: expiryDate 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Payment verification error:", {
      error: error.message,
      stack: error.stack,
      userId,
      productId,
      razorpay_order_id,
      razorpay_payment_id
    });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Payment verification failed"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});