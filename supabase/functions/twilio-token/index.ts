// Supabase Edge Function: mints a short-lived Twilio Voice access token for the
// signed-in user so the browser dialer can place calls.
//
// The Supabase gateway verifies the caller's login (verify_jwt stays ON for this
// function), so only signed-in team members can get a token.
//
// Required function secrets (set with `supabase secrets set ...` or in the
// dashboard → Edge Functions → Secrets):
//   TWILIO_ACCOUNT_SID     ACxxxx…      (Twilio Console home)
//   TWILIO_API_KEY_SID     SKxxxx…      (Console → Account → API keys)
//   TWILIO_API_KEY_SECRET  the secret shown once when you create the API key
//   TWILIO_TWIML_APP_SID   APxxxx…      (Console → Voice → TwiML Apps)
import twilio from 'npm:twilio@5';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

/** Best-effort read of the user id from the (already-verified) JWT. */
function userIdFromAuth(req: Request): string | null {
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const apiKeySid = Deno.env.get('TWILIO_API_KEY_SID');
  const apiKeySecret = Deno.env.get('TWILIO_API_KEY_SECRET');
  const twimlAppSid = Deno.env.get('TWILIO_TWIML_APP_SID');

  if (!accountSid || !apiKeySid || !apiKeySecret || !twimlAppSid) {
    return new Response(JSON.stringify({ error: 'twilio-not-configured' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const uid = userIdFromAuth(req);
  const identity = 'ohh-' + (uid ? uid.slice(0, 8) : crypto.randomUUID().slice(0, 8));

  const AccessToken = (twilio as any).jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity, ttl: 3600 });
  token.addGrant(new VoiceGrant({ outgoingApplicationSid: twimlAppSid, incomingAllow: false }));

  return new Response(JSON.stringify({ token: token.toJwt(), identity }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
