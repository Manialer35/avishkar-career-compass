
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { name, email, phone, subject, message } = await req.json();
    
    if (!name || !email || !phone || !message) {
      throw new Error("Missing required fields");
    }

    console.log("Received enquiry from:", name, email);
    
    // Instead of using SMTP directly, we'll just log the enquiry for now
    // and return success to prevent errors while you set up proper email credentials
    console.log("Enquiry details:", {
      name,
      email,
      phone,
      subject,
      message
    });
    
    // For now, we'll simulate a successful email sending
    // In production, you should connect this to a proper email service
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Enquiry received successfully. Our team will contact you soon." 
    }), { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });
  } catch (error) {
    console.error("Error processing enquiry:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send enquiry" 
      }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
