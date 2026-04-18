import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM');
  const TWILIO_SMS_FROM = Deno.env.get('TWILIO_SMS_FROM');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return new Response(JSON.stringify({ error: 'Twilio credentials not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { patient_name, patient_phone, appointment_date, start_time, service_type, notification_type, new_date, new_time, reason } = await req.json();

    if (!patient_phone || !patient_name) {
      return new Response(JSON.stringify({ error: 'Missing patient details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format phone number
    let phone = patient_phone.replace(/\s+/g, '');
    if (phone.startsWith('0')) phone = '+27' + phone.slice(1);
    if (!phone.startsWith('+')) phone = '+' + phone;

    // Format times for display
    const formatTime = (t: string) => {
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${dh}:${m} ${ampm}`;
    };

    const formatDate = (d: string) => {
      const dateObj = new Date(d + 'T00:00:00');
      return dateObj.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const firstName = patient_name.split(' ')[0];
    let message = '';

    switch (notification_type) {
      case 'rescheduled':
        message = `📅 *Appointment Rescheduled*

Hi ${firstName} 👋

Your appointment has been moved to a new date and time:

🕐 *New Time:* ${formatTime(new_time || start_time)}
📅 *New Date:* ${formatDate(new_date || appointment_date)}
💼 *Service:* ${service_type}
📍 *Location:* 52 Lutyens St. CE 2, Vanderbijlpark

If this doesn't work for you, please contact us at 016 931 2961.

— *Dr. Matilda Molefe*`;
        break;

      case 'cancelled':
        message = `❌ *Appointment Cancelled*

Hi ${firstName} 👋

Your appointment on ${formatDate(appointment_date)} at ${formatTime(start_time)} has been cancelled.${reason ? `\n\n📝 *Reason:* ${reason}` : ''}

To rebook, visit our website or call us at 016 931 2961.

— *Dr. Matilda Molefe*`;
        break;

      case 'confirmed':
        message = `✅ *Appointment Confirmed*

Hi ${firstName} 👋

Your appointment has been confirmed:

🕐 *Time:* ${formatTime(start_time)}
📅 *Date:* ${formatDate(appointment_date)}
💼 *Service:* ${service_type}
📍 *Location:* 52 Lutyens St. CE 2, Vanderbijlpark

We look forward to seeing you!
— *Dr. Matilda Molefe*`;
        break;

      default:
        message = `📋 *Appointment Update*

Hi ${firstName} 👋

There has been an update to your appointment on ${formatDate(appointment_date)} at ${formatTime(start_time)}.

Please contact us at 016 931 2961 if you have any questions.

— *Dr. Matilda Molefe*`;
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    let sent = false;
    let channel = '';
    let error_detail = '';

    // Try WhatsApp first
    if (TWILIO_WHATSAPP_FROM) {
      const formData = new URLSearchParams();
      formData.append('From', TWILIO_WHATSAPP_FROM);
      formData.append('To', `whatsapp:${phone}`);
      formData.append('Body', message);

      const waRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (waRes.ok) {
        sent = true;
        channel = 'whatsapp';
      } else {
        const errText = await waRes.text();
        console.warn('WhatsApp failed, trying SMS fallback:', errText);
        error_detail = `WhatsApp [${waRes.status}]: ${errText}`;
      }
    }

    // SMS fallback
    if (!sent && TWILIO_SMS_FROM) {
      // Strip markdown for SMS
      const smsBody = message.replace(/\*/g, '');

      const formData = new URLSearchParams();
      formData.append('From', TWILIO_SMS_FROM);
      formData.append('To', phone);
      formData.append('Body', smsBody);

      const smsRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (smsRes.ok) {
        sent = true;
        channel = 'sms';
      } else {
        const errText = await smsRes.text();
        console.error('SMS fallback also failed:', errText);
        error_detail += ` | SMS [${smsRes.status}]: ${errText}`;
      }
    }

    if (!sent && !TWILIO_SMS_FROM && !TWILIO_WHATSAPP_FROM) {
      error_detail = 'No messaging channels configured';
    }

    return new Response(JSON.stringify({ sent, channel, error: sent ? undefined : error_detail }), {
      status: sent ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
