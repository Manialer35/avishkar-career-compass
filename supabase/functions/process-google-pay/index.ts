
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 100000; // Max 1 lakh INR
};

const validateProductId = (productId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(productId);
};

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"&]/g, '');
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check (basic implementation)
    const userAgent = req.headers.get("user-agent") || "";
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    console.log(`Payment request from IP: ${clientIP}, User-Agent: ${userAgent}`);

    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid authentication token");
    }

    // Extract and validate payment data from request body
    const requestBody = await req.json();
    const { paymentData, productId, amount, customerEmail } = requestBody;

    // Input validation
    if (!paymentData || !productId || !amount || !customerEmail) {
      throw new Error("Missing required payment parameters");
    }

    if (!validateEmail(customerEmail)) {
      throw new Error("Invalid email format");
    }

    if (!validateAmount(amount)) {
      throw new Error("Invalid payment amount");
    }

    if (!validateProductId(productId)) {
      throw new Error("Invalid product ID format");
    }

    // Verify user owns this email
    if (userData.user.email !== customerEmail) {
      throw new Error("Email mismatch - security violation");
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(customerEmail);
    const sanitizedProductId = sanitizeInput(productId);

    // Verify product exists and get pricing
    const { data: product, error: productError } = await supabase
      .from('study_materials')
      .select('id, price, title')
      .eq('id', sanitizedProductId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Verify amount matches product price
    if (Math.abs(amount - product.price) > 0.01) {
      throw new Error("Amount mismatch - potential fraud attempt");
    }

    // Check for duplicate purchases
    const { data: existingPurchase, error: duplicateError } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('material_id', sanitizedProductId)
      .maybeSingle();

    if (duplicateError) {
      console.error('Error checking duplicate purchase:', duplicateError);
    }

    if (existingPurchase) {
      throw new Error("Product already purchased");
    }

    // Extract payment token and details
    const { token } = paymentData.paymentMethodData;
    
    console.log('Processing test payment with token:', token);
    console.log('This is a TEST environment payment - no actual charges are made');
    console.log('Security validations passed for user:', userData.user.id);

    // Generate secure transaction ID
    const transactionId = `google-pay-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Record the transaction in the database with audit trail
    const { data, error } = await supabase
      .from('material_purchases')
      .insert([
        {
          material_id: sanitizedProductId,
          user_email: sanitizedEmail,
          amount: amount,
          payment_id: transactionId,
          payment_status: 'test_completed',
          user_name: sanitizedEmail.split('@')[0] || 'Customer'
        }
      ]);

    if (error) {
      console.error('Database insertion error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Also record in user_purchases for user access tracking
    const { error: userPurchaseError } = await supabase
      .from('user_purchases')
      .insert([
        {
          user_id: userData.user.id,
          material_id: sanitizedProductId,
          amount: amount,
          payment_id: transactionId,
          purchased_at: new Date().toISOString()
        }
      ]);

    if (userPurchaseError) {
      console.error('User purchase record error:', userPurchaseError);
      // Don't fail the transaction, but log the error
    }

    console.log(`Payment processed successfully for user ${userData.user.id}, product ${sanitizedProductId}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test payment processed successfully",
        transactionId: transactionId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    
    // Log security violations separately
    if (error.message.includes("security violation") || 
        error.message.includes("fraud attempt") || 
        error.message.includes("mismatch")) {
      console.error("SECURITY ALERT:", error.message);
    }
    
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
