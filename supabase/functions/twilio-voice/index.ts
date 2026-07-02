// Supabase Edge Function: the TwiML that Twilio requests when the browser dialer
// places a call. It tells Twilio to dial the requested number, showing your
// Twilio number as the caller ID.
//
// Twilio itself calls this (there's no logged-in user), so this function must be
// deployed with JWT verification OFF — see supabase/config.toml, or toggle
// "Verify JWT" off for this function in the dashboard.
//
// Point your TwiML App's Voice "Request URL" at this function's URL:
//   https://<your-project-ref>.functions.supabase.co/twilio-voice
//
// Required function secret:
//   TWILIO_CALLER_ID   your Twilio phone number in E.164, e.g. +19735551234

function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string),
  );
}

Deno.serve(async (req) => {
  const callerId = Deno.env.get('TWILIO_CALLER_ID') ?? '';

  let to = '';
  try {
    const body = await req.text();
    to = new URLSearchParams(body).get('To') ?? '';
  } catch {
    /* ignore */
  }

  const twiml = to
    ? `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response><Dial callerId="${xmlEscape(callerId)}"><Number>${xmlEscape(to)}</Number></Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say>No number was provided.</Say></Response>`;

  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
});
