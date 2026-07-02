// Supabase Edge Function: emails a sales rep an invite with a link to join.
//
// Only the team admin can call it (verified below). It sends a branded email via
// Resend (https://resend.com). The rep clicks the link, creates an account with
// the same email, and the database trigger links them to the team automatically.
//
// Required function secrets:
//   RESEND_API_KEY   re_...           (Resend → API Keys)
//   INVITE_FROM      One Horizon Homes <invites@onehorizonhomes.com>
//                    (must be an address on a domain you've verified in Resend)
// Optional:
//   SITE_URL         defaults to https://sam-one-horizon-homes.expo.app
//   BRAND            defaults to "One Horizon Homes"
//
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const INVITE_FROM = Deno.env.get('INVITE_FROM');
  const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://sam-one-horizon-homes.expo.app';
  const BRAND = Deno.env.get('BRAND') ?? 'One Horizon Homes';

  // Only a signed-in admin may send invites.
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: 'not-signed-in' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: me } = await admin.from('team_members').select('role').eq('user_id', user.id).maybeSingle();
  if (me?.role !== 'admin') return json({ error: 'not-admin' }, 403);

  if (!RESEND_API_KEY || !INVITE_FROM) return json({ error: 'not-configured' }, 500);

  let email = '';
  let name = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim();
    name = String(body?.name ?? '').trim();
  } catch {
    /* ignore */
  }
  if (!email.includes('@')) return json({ error: 'bad-email' }, 400);

  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#0A0A0A">
    <h2 style="margin:0 0 8px">${escapeHtml(BRAND)} — Sales Team</h2>
    <p>${greeting}</p>
    <p>You've been added to the ${escapeHtml(BRAND)} sales app. Create your account to start logging
       leads, knocking doors on the map, and calling — all from your phone.</p>
    <p style="margin:24px 0">
      <a href="${SITE_URL}" style="background:#0A0A0A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;display:inline-block">
        Create your account →
      </a>
    </p>
    <p style="color:#555;font-size:13px">
      When you sign up, use this email address (<strong>${escapeHtml(email)}</strong>) so you're linked to the team.
    </p>
    <p style="color:#888;font-size:12px">Or paste this link into your browser: ${SITE_URL}</p>
  </div>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: INVITE_FROM,
      to: [email],
      subject: `You're invited to the ${BRAND} sales team`,
      html,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    // Common case: sending domain not verified in Resend yet.
    return json({ error: 'send-failed', detail }, 502);
  }

  return json({ ok: true });
});
