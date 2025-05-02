
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnquiryData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const enquiryData: EnquiryData = await req.json();
    const { name, email, phone, subject, message } = enquiryData;
    
    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    console.log("Attempting to send email to admin:", name, email, subject);
    
    // Send email to the admin (updated email address)
    const adminEmailResponse = await resend.emails.send({
      from: "Avishkar Academy <onboarding@resend.dev>",
      to: ["khot.md@gmail.com"], // Ensuring this is the correct email
      subject: `New Enquiry: ${subject}`,
      html: `
        <h2>New Enquiry from ${name}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    });

    console.log("Admin email response:", adminEmailResponse);
    
    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Avishkar Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for your enquiry",
      html: `
        <h2>Thank you for contacting Avishkar Career Academy!</h2>
        <p>Dear ${name},</p>
        <p>We have received your enquiry regarding "${subject}".</p>
        <p>Our team will review your message and get back to you as soon as possible.</p>
        <p>Your message:</p>
        <blockquote style="padding: 10px; border-left: 4px solid #ccc; margin: 15px 0; color: #555;">
          ${message}
        </blockquote>
        <p>Best regards,<br>Avishkar Career Academy Team</p>
      `,
    });

    console.log("User email response:", userEmailResponse);
    console.log("Emails sent successfully:", { adminEmailResponse, userEmailResponse });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Enquiry submitted successfully",
        adminEmail: adminEmailResponse,
        userEmail: userEmailResponse
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-enquiry function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
