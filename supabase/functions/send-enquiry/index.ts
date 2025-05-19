
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Format the email body
    const emailBody = `
      New Enquiry from Avishkar Academy Website

      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Subject: ${subject || 'No subject provided'}
      
      Message:
      ${message}
    `;
    
    // Instead of using Resend, we'll use a simple fetch to an email service
    // In a production environment, you would integrate with your email service API
    console.log("Would send email with content:", emailBody);
    
    // Send the data to the recipient emails using Supabase database for now
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Record the enquiry in the database for reference
    const response = await fetch(`${supabaseUrl}/rest/v1/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject: subject || 'General Enquiry',
        message,
        created_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to record enquiry: ${await response.text()}`);
    }
    
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
