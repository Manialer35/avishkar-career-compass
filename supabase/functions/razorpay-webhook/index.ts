
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    
    if (!signature) {
      throw new Error("Missing webhook signature");
    }

    // Verify webhook signature
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValidSignature = signature === expectedSignatureHex;

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      throw new Error("Invalid webhook signature");
    }

    const webhookData = JSON.parse(body);
    const event = webhookData.event;
    const paymentEntity = webhookData.payload?.payment?.entity;

    console.log(`Received webhook event: ${event}`);

    if (event === 'payment.captured' && paymentEntity) {
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const amount = paymentEntity.amount;
      const status = paymentEntity.status;

      console.log(`Payment captured: ${paymentId}, Order: ${orderId}, Amount: ${amount}`);

      // Update payment order status
      const { error: updateError } = await supabase
        .from('payment_orders')
        .update({
          status: 'captured',
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Error updating payment order:', updateError);
      }

      // Update user purchase amount
      const { error: purchaseUpdateError } = await supabase
        .from('user_purchases')
        .update({
          amount: amount / 100, // Convert paise to rupees
        })
        .eq('payment_id', paymentId);

      if (purchaseUpdateError) {
        console.error('Error updating user purchase amount:', purchaseUpdateError);
      }

      // Update material purchase amount
      const { error: materialUpdateError } = await supabase
        .from('material_purchases')
        .update({
          amount: amount / 100, // Convert paise to rupees
        })
        .eq('payment_id', paymentId);

      if (materialUpdateError) {
        console.error('Error updating material purchase amount:', materialUpdateError);
      }

      console.log(`Payment processing completed for: ${paymentId}`);
    }

    return new Response(
      JSON.stringify({ status: "success" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Error processing webhook"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
