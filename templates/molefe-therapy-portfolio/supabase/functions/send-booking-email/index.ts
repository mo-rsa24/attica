import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { patient_name, patient_email, appointment_date, start_time, duration_minutes, service_type, manage_url } = await req.json();

    // Format time for display
    const [h, m] = start_time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeDisplay = `${displayHour}:${m} ${ampm}`;

    // Format date
    const dateObj = new Date(appointment_date + 'T00:00:00');
    const dateDisplay = dateObj.toLocaleDateString('en-ZA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const firstName = patient_name.split(' ')[0];

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f0eb; font-family: 'Source Sans 3', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0eb;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(58, 46, 36, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3d6b5e, #4a7d6e); padding: 40px 32px; text-align: center;">
              <h1 style="color: #f5f0eb; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600; letter-spacing: 0.5px;">Dr. Matilda Molefe</h1>
              <p style="color: rgba(245, 240, 235, 0.7); margin: 8px 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Clinical Psychologist</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 24px;">
              <h2 style="color: #3a2e24; margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600;">Appointment Requested</h2>
              <p style="color: #6b5d50; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Dear ${firstName},</p>
              <p style="color: #6b5d50; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Your appointment request has been received. You'll receive a confirmation once it's approved. Here are the details:</p>
            </td>
          </tr>

          <!-- Details Card -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f5f0eb; border-radius: 10px; border: 1px solid #e8e0d4;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b5d50; font-size: 13px; padding: 8px 0; vertical-align: top; width: 90px;">Service</td>
                        <td style="color: #3a2e24; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${service_type}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: 1px solid #e8e0d4;"></td>
                      </tr>
                      <tr>
                        <td style="color: #6b5d50; font-size: 13px; padding: 8px 0; vertical-align: top; width: 90px;">Date</td>
                        <td style="color: #3a2e24; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${dateDisplay}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: 1px solid #e8e0d4;"></td>
                      </tr>
                      <tr>
                        <td style="color: #6b5d50; font-size: 13px; padding: 8px 0; vertical-align: top; width: 90px;">Time</td>
                        <td style="color: #3a2e24; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${timeDisplay}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-bottom: 1px solid #e8e0d4;"></td>
                      </tr>
                      <tr>
                        <td style="color: #6b5d50; font-size: 13px; padding: 8px 0; vertical-align: top; width: 90px;">Duration</td>
                        <td style="color: #3a2e24; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${duration_minutes} minutes</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Location -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="color: #6b5d50; font-size: 14px; line-height: 1.6; margin: 0;">
                📍 <strong style="color: #3a2e24;">Location:</strong> 52 Lutyens St. CE 2, Vanderbijlpark
              </p>
            </td>
          </tr>

          ${manage_url ? `
          <!-- Manage Button -->
          <tr>
            <td style="padding: 0 32px 28px; text-align: center;">
              <a href="${manage_url}" style="display: inline-block; background: linear-gradient(135deg, #3d6b5e, #4a7d6e); color: #f5f0eb; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(61, 107, 94, 0.3);">Manage Your Appointment</a>
              <p style="color: #9b8d80; font-size: 12px; margin: 12px 0 0; line-height: 1.5;">View, reschedule, or cancel your appointment online.</p>
            </td>
          </tr>
          ` : ''}

          <!-- Contact -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <p style="color: #6b5d50; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                Need help? Contact us at <a href="tel:+27169312961" style="color: #3d6b5e; text-decoration: none; font-weight: 500;">016 931 2961</a> or <a href="mailto:ngimolefe@yahoo.com" style="color: #3d6b5e; text-decoration: none; font-weight: 500;">ngimolefe@yahoo.com</a>.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding: 0 32px 36px;">
              <p style="color: #6b5d50; font-size: 14px; line-height: 1.6; margin: 0 0 4px;">We look forward to seeing you.</p>
              <p style="color: #3a2e24; font-size: 14px; margin: 16px 0 0; font-family: 'Playfair Display', Georgia, serif;">
                Warm regards,<br/><strong>Dr. Matilda Molefe</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #3a2e24; padding: 20px 32px; text-align: center;">
              <p style="color: rgba(245, 240, 235, 0.5); font-size: 11px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} Dr. Matilda Molefe · Clinical Psychologist<br/>
                52 Lutyens St. CE 2, Vanderbijlpark
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send to patient via Resend
    const patientRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dr. Matilda Molefe <onboarding@resend.dev>',
        to: [patient_email],
        subject: `Appointment Request — ${dateDisplay} at ${timeDisplay}`,
        html: emailHtml,
      }),
    });

    if (!patientRes.ok) {
      const errBody = await patientRes.text();
      throw new Error(`Resend error [${patientRes.status}]: ${errBody}`);
    }

    // Send notification to doctor
    const doctorHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 20px; background: #ffffff; font-family: 'Source Sans 3', sans-serif;">
  <div style="max-width: 480px; margin: 0 auto;">
    <h2 style="color: #3a2e24; margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px;">New Appointment Request</h2>
    <div style="background: #f5f0eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 4px 0; font-size: 14px;"><strong>Patient:</strong> ${patient_name} (${patient_email})</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Service:</strong> ${service_type}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${dateDisplay}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>Time:</strong> ${timeDisplay} (${duration_minutes} min)</p>
    </div>
    <p style="color: #6b5d50; font-size: 13px;">Log in to the admin dashboard to confirm or manage this booking.</p>
  </div>
</body>
</html>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Booking System <onboarding@resend.dev>',
        to: ['ngimolefe@yahoo.com'],
        subject: `New Request: ${patient_name} — ${dateDisplay}`,
        html: doctorHtml,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
