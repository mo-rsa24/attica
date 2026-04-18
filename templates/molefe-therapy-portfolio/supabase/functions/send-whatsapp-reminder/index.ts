import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

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
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || (!TWILIO_WHATSAPP_FROM && !TWILIO_SMS_FROM)) {
    return new Response(JSON.stringify({ error: 'Twilio credentials not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase credentials not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Also get day-of reminders (today)
    const today = new Date().toISOString().split('T')[0];

    // Fetch confirmed bookings for tomorrow (24h reminder)
    const { data: tomorrowBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, patient_name, patient_phone, appointment_date, start_time, duration_minutes, service_type, status')
      .eq('appointment_date', tomorrowStr)
      .eq('status', 'confirmed');

    if (fetchError) {
      throw new Error(`Failed to fetch bookings: ${fetchError.message}`);
    }

    // Fetch confirmed bookings for today (same-day reminder)
    const { data: todayBookings, error: todayError } = await supabase
      .from('bookings')
      .select('id, patient_name, patient_phone, appointment_date, start_time, duration_minutes, service_type, status')
      .eq('appointment_date', today)
      .eq('status', 'confirmed');

    if (todayError) {
      throw new Error(`Failed to fetch today bookings: ${todayError.message}`);
    }

    const allBookings = [
      ...(tomorrowBookings || []).map(b => ({ ...b, reminderType: '24h' })),
      ...(todayBookings || []).map(b => ({ ...b, reminderType: 'same_day' })),
    ];

    const results: { id: string; status: string; error?: string }[] = [];

    for (const booking of allBookings) {
      const phone = booking.patient_phone?.replace(/\s+/g, '');
      if (!phone) {
        results.push({ id: booking.id, status: 'skipped', error: 'No phone number' });
        continue;
      }

      // Format phone for WhatsApp (ensure +27 format for SA numbers)
      let whatsappTo = phone;
      if (whatsappTo.startsWith('0')) {
        whatsappTo = '+27' + whatsappTo.slice(1);
      }
      if (!whatsappTo.startsWith('+')) {
        whatsappTo = '+' + whatsappTo;
      }
      whatsappTo = `whatsapp:${whatsappTo}`;

      // Format time
      const [h, m] = booking.start_time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeDisplay = `${displayHour}:${m} ${ampm}`;

      // Format date
      const dateObj = new Date(booking.appointment_date + 'T00:00:00');
      const dateDisplay = dateObj.toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      const isToday = booking.reminderType === 'same_day';
      const greeting = isToday ? '📋 *Reminder — Today*' : '📅 *Appointment Tomorrow*';

      const message = `${greeting}

Hi ${booking.patient_name.split(' ')[0]} 👋

${isToday ? "Just a friendly reminder about your appointment today" : "This is a reminder about your appointment tomorrow"}:

🕐 *Time:* ${timeDisplay}
📅 *Date:* ${dateDisplay}
💼 *Service:* ${booking.service_type}
📍 *Location:* 52 Lutyens St. CE 2, Vanderbijlpark

If you need to reschedule or cancel, please contact us at 016 931 2961 or reply to this message.

We look forward to seeing you!
— *Dr. Matilda Molefe*`;

      // Send via Twilio - try WhatsApp first, fallback to SMS
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      let sent = false;
      let channel = '';

      // Try WhatsApp
      if (TWILIO_WHATSAPP_FROM) {
        const formData = new URLSearchParams();
        formData.append('From', TWILIO_WHATSAPP_FROM);
        formData.append('To', whatsappTo);
        formData.append('Body', message);

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (twilioRes.ok) {
          sent = true;
          channel = 'whatsapp';
        } else {
          const errText = await twilioRes.text();
          console.warn(`WhatsApp failed for ${whatsappTo}, trying SMS:`, errText);
        }
      }

      // SMS fallback
      if (!sent && TWILIO_SMS_FROM) {
        const smsBody = message.replace(/\*/g, ''); // strip markdown
        const smsTo = whatsappTo.replace('whatsapp:', '');

        const formData = new URLSearchParams();
        formData.append('From', TWILIO_SMS_FROM);
        formData.append('To', smsTo);
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
          console.error(`SMS also failed for ${smsTo}:`, errText);
          results.push({ id: booking.id, status: 'failed', error: `Both channels failed` });
          continue;
        }
      }

      if (sent) {
        results.push({ id: booking.id, status: 'sent' });
      } else {
        results.push({ id: booking.id, status: 'failed', error: 'No messaging channel available' });
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return new Response(JSON.stringify({
      success: true,
      summary: { total: allBookings.length, sent, failed, skipped: results.length - sent - failed },
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('WhatsApp reminder error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
