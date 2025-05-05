
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
    // Get environment variables
    const EMAIL_USERNAME = Deno.env.get("EMAIL_USERNAME") || "";
    const EMAIL_PASSWORD = Deno.env.get("EMAIL_PASSWORD") || "";
    
    if (!EMAIL_USERNAME || !EMAIL_PASSWORD) {
      throw new Error("Missing email configuration");
    }

    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: EMAIL_USERNAME,
      password: EMAIL_PASSWORD,
    });

    // Parse request body
    const { name, email, phone, message } = await req.json();
    
    if (!name || !email || !phone || !message) {
      throw new Error("Missing required fields");
    }

    // Send email to all recipients
    const recipients = ["khot.md@gmail.com", "atulhmadkar@gmail.com"];
    
    for (const recipient of recipients) {
      await client.send({
        from: EMAIL_USERNAME,
        to: recipient,
        subject: `New Enquiry from ${name}`,
        content: `
          Name: ${name}
          Email: ${email}
          Phone: ${phone}
          
          Message:
          ${message}
        `,
      });
      
      console.log(`Email sent successfully to ${recipient}`);
    }

    await client.close();
    
    return new Response(JSON.stringify({ success: true }), { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email" 
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
