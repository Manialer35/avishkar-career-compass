
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/@resend/node@0.0.3";

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
    
    // Initialize Resend with API key
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (!resend) {
      throw new Error("Email client configuration failed");
    }
    
    // Format the email with enquiry details
    const emailContent = `
      <h2>New Enquiry from Avishkar Academy Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>
      <h3>Message:</h3>
      <p>${message}</p>
    `;
    
    // Send email to both recipients
    const { data, error: sendError } = await resend.emails.send({
      from: "Avishkar Academy <no-reply@resend.dev>",
      to: ["khot.md@gmail.com", "neerajmadkar35@gmail.com"],
      subject: `New Enquiry: ${subject || 'General Enquiry'}`,
      html: emailContent,
      reply_to: email
    });
    
    if (sendError) {
      console.error("Email sending failed:", sendError);
      throw new Error("Failed to send email notification");
    }
    
    console.log("Email sent successfully:", data);
    
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
