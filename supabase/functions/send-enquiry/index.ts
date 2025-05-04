
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnquiryRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// List of recipients who should receive enquiry notifications
const recipients = [
  'neerajmadkar35@gmail.com',
  'khot.md@gmail.com',
  'atulhmadkar@gmail.com'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: EnquiryRequest = await req.json();

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const client = new SmtpClient();

    await client.connect({
      hostname: "smtp.gmail.com",
      port: 465,
      username: Deno.env.get("EMAIL_USERNAME"),
      password: Deno.env.get("EMAIL_PASSWORD"),
      tls: true,
    });

    const emailSubject = `New Enquiry from ${name}`;
    const emailBody = `
      <h2>New Enquiry Details</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send email to all recipients
    for (const recipient of recipients) {
      try {
        await client.send({
          from: Deno.env.get("EMAIL_USERNAME"),
          to: recipient,
          subject: emailSubject,
          html: emailBody,
        });
        
        console.log(`Email sent successfully to: ${recipient}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${recipient}:`, emailError);
        // Continue trying to send to other recipients
      }
    }

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Enquiry sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error processing enquiry:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
