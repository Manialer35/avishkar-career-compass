
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      productId,
      userId 
    } = requestBody;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new Error("Missing payment verification parameters");
    }

    // Verify payment signature
    const razorpayKeySecret = "BKJ9SSdJediRnBru61KFQKsx";
    const payload = razorpay_order_id + "|" + razorpay_payment_id;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValidSignature = expectedSignature === razorpay_signature;

    if (!isValidSignature) {
      console.error('Invalid payment signature');
      throw new Error("Invalid payment signature");
    }

    console.log('Payment signature verified successfully');

    // Get order details first to get the amount
    const { data: orderData, error: orderError } = await supabase
      .from('payment_orders')
      .select('amount, product_id')
      .eq('order_id', razorpay_order_id)
      .single();

    if (orderError) {
      console.error('Error fetching order data:', orderError);
    }

    const orderAmount = orderData?.amount || 0;

    // Update payment status in payment_orders table
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({
        status: 'completed',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', razorpay_order_id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
    }

    // Record user purchase with proper amount
    const { error: purchaseError } = await supabase
      .from('user_purchases')
      .insert({
        user_id: userData.user.id,
        material_id: productId,
        amount: orderAmount / 100, // Convert paise to rupees
        payment_id: razorpay_payment_id,
        purchased_at: new Date().toISOString(),
      });

    if (purchaseError) {
      console.error('Error recording user purchase:', purchaseError);
    }

    // Record material purchase with proper amount and all required fields
    const { error: materialPurchaseError } = await supabase
      .from('material_purchases')
      .insert({
        material_id: productId,
        user_id: userData.user.id,
        user_email: userData.user.email || '',
        user_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'Customer',
        amount: orderAmount / 100, // Convert paise to rupees
        payment_id: razorpay_payment_id,
        payment_status: 'completed',
      });

    if (materialPurchaseError) {
      console.error('Error recording material purchase:', materialPurchaseError);
    }

    // Update class enrollments if this is a class payment
    // First check if there's a class enrollment for this order
    const { data: enrollmentData, error: enrollmentFetchError } = await supabase
      .from('class_enrollments')
      .select('id')
      .eq('payment_id', razorpay_payment_id)
      .maybeSingle();

    if (!enrollmentFetchError && enrollmentData) {
      const { error: enrollmentUpdateError } = await supabase
        .from('class_enrollments')
        .update({
          payment_status: 'completed',
          amount_paid: orderAmount / 100,
          payment_method: 'razorpay'
        })
        .eq('payment_id', razorpay_payment_id);

      if (enrollmentUpdateError) {
        console.error('Error updating class enrollment:', enrollmentUpdateError);
      } else {
        console.log('Class enrollment updated successfully');
      }
    }

    console.log(`Payment verified successfully: ${razorpay_payment_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        transactionId: razorpay_payment_id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Error verifying payment"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
