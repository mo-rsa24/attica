import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, code, patient_name } = await req.json();

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Dr. Molefe's Practice <onboarding@resend.dev>",
        to: [email],
        subject: "Your Verification Code",
        html: `
          <div style="font-family: 'Source Sans 3', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <h2 style="color: #2d4a3e; font-family: Georgia, serif; margin-bottom: 8px;">Email Verification</h2>
            <p style="color: #6b6b5e; font-size: 15px; line-height: 1.6;">
              Hi ${patient_name || "there"},<br/>
              Please use the following code to verify your email address:
            </p>
            <div style="background: #f5f0eb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2d4a3e;">${code}</span>
            </div>
            <p style="color: #6b6b5e; font-size: 13px;">
              This code expires in 10 minutes. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e8e0d8; margin: 24px 0;" />
            <p style="color: #9b9b8e; font-size: 12px;">Dr. Matilda Molefe · Clinical Psychologist</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.text();
      console.error("Resend error:", errData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
