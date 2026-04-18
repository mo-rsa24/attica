import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("send-booking-email sends confirmation", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/send-booking-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      patient_name: "Test Patient",
      patient_email: "ngimolefe@yahoo.com",
      appointment_date: "2026-03-02",
      start_time: "10:00",
      duration_minutes: 60,
      service_type: "Individual Therapy",
    }),
  });

  const body = await response.json();
  console.log("Response:", response.status, body);
  assertEquals(response.status, 200);
  assertEquals(body.success, true);
});
