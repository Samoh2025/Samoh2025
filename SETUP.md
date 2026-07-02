# Go live — connect the backend (about 10 minutes)

This app is now a **real multi-user app**. Sam and every rep get their own login
and everyone shares the same live data. To turn it on, connect it once to a free
Supabase project. You only do this **one time**.

You need two things from Supabase: a **Project URL** and an **anon key**. You'll
paste those into GitHub, and the site goes live.

---

## 1. Create the Supabase project

1. Go to **https://supabase.com** and sign up (free).
2. Click **New project**. Give it any name (e.g. `one-horizon-homes`), pick a
   region near you, and set a database password (save it somewhere).
3. Wait ~2 minutes for it to finish setting up.

## 2. Create the tables

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repo,
   copy **all** of it, paste it into the editor, and click **Run**.
3. You should see “Success. No rows returned.” That's it — the database is ready.

> This creates the team, leads, projects, appointments and activity tables,
> locks them down so only your signed-in team can read/write, and sets it up so
> anyone who creates an account automatically joins the team.

## 3. Get your two connection values

1. Open **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** — looks like `https://abcd1234.supabase.co`.
3. Copy the **anon public** key — a long string under *Project API keys*.

## 4. Make signups instant (recommended)

So reps can sign in immediately without a confirmation email:

- **Authentication** → **Providers** → **Email** → turn **off** “Confirm email”
  → **Save**.

(If you'd rather keep email confirmation on, that's fine — reps just click a link
in their inbox before their first sign-in. If you keep it on, also set
**Authentication → URL Configuration → Site URL** to
`https://sam-one-horizon-homes.expo.app`.)

## 5. Add the values to GitHub, then deploy

1. In this GitHub repo: **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add these three (one at a time):

   | Name | Value |
   |------|-------|
   | `EXPO_TOKEN` | Your Expo token from https://expo.dev/settings/access-tokens |
   | `EXPO_PUBLIC_SUPABASE_URL` | The Project URL from step 3 |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | The anon public key from step 3 |

3. Go to the **Actions** tab → **Deploy Sam's site** → **Run workflow**.
   (It also runs automatically on every push.)

When it finishes, the site is live at **https://sam-one-horizon-homes.expo.app**.

## 6. Create the admin account

1. Open the site and click **Create an account**.
2. **Sam signs up first** using `sam@onehorizonhomes.com` — that email is made the
   **Admin** automatically. (As a safety net, whoever creates the very first
   account also becomes admin.)
3. Sam can now add reps and share the link. Each rep creates their own account
   and signs in from their own phone — everyone shares the same live data.

---

## How adding reps works

- **Sam (admin)** → *Sales Team* → **Add rep**: enter the rep's name/email. They
  show as **Invited**.
- **The rep** opens the link, clicks **Create an account**, and signs up with that
  same email. They flip to **Active** and can log leads and update the
  door-knock map from the field — live for the whole team.

## Change the admin email

The admin email is set in two places and they must match:

- `src/config.ts` → `admin.email`
- `supabase/schema.sql` → the `admin_email` line in `handle_new_user`

If you change it after the database was created, re-run the `handle_new_user`
function block from `schema.sql` in the SQL Editor.

---

# The door-knock map, notes & property tags

No setup needed — this works as soon as the backend (above) is connected:

- **Tap anywhere on the map** to drop a door. The address fills in automatically
  (from OpenStreetMap). The dot is **permanent and shared** — every rep sees it.
- **Tap a dot** to log **notes** ("homeowner interested, call back Saturday"), set
  the **outcome** (interested / call back / no answer / not interested), tag it
  **Residential/Commercial**, and set a **listing status** (For Sale, For Lease,
  Under Contract, Pending Offer). Everything syncs live to the whole team.
- The map covers **Wayne, NJ · Cedar Grove, NJ · Ridgewood, NJ** by default. To
  change the towns or where the map opens, edit `TERRITORY_TOWNS` / `TERRITORY_CENTER`
  in `src/data.ts`.

---

# In-app calling (Twilio)

Calls run through **Twilio**. Until it's connected, the 📞 button falls back to
your phone's own dialer, so nothing breaks. To turn on real in-app calling:

### A. Twilio account & number
1. Create an account at **https://www.twilio.com** and (to call any number, not
   just verified ones) upgrade from trial.
2. **Buy a phone number** with *Voice* capability (Console → Phone Numbers → Buy).
   Note it in E.164 form, e.g. `+19735551234`.
3. Create an **API Key** (Console → Account → API keys & tokens → *Create API key*,
   Standard). Copy the **SID** (`SK…`) and **Secret** (shown once).
4. Create a **TwiML App** (Console → Voice → TwiML → TwiML Apps → *Create*):
   - **Voice → Request URL:** `https://<your-project-ref>.functions.supabase.co/twilio-voice`  (method **POST**)
   - Save and copy its **SID** (`AP…`).

### B. Deploy the two functions (Supabase CLI)
```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

supabase functions deploy twilio-token           # signed-in users get a call token
supabase functions deploy twilio-voice --no-verify-jwt   # Twilio calls this one
```

### C. Set the Twilio secrets
```bash
supabase secrets set \
  TWILIO_ACCOUNT_SID=ACxxxxxxxx \
  TWILIO_API_KEY_SID=SKxxxxxxxx \
  TWILIO_API_KEY_SECRET=your-api-key-secret \
  TWILIO_TWIML_APP_SID=APxxxxxxxx \
  TWILIO_CALLER_ID=+19735551234
```

That's it. Reload the app, open a lead or a door, and tap 📞 — the call connects
inside the app (allow the browser microphone prompt the first time). No Twilio
credentials ever touch the app or the browser; they live only in the function.

---

# Do-Not-Call list

There is **no public "do-not-call list for every town."** The National Registry
is access-gated (you register at telemarketing.donotcall.gov and pull it by area
code) and states keep separate lists. This app gives you the guardrail:

- **Admin → Settings → Do-Not-Call list → Import:** paste numbers (any format).
  The app then **blocks calling** any contact whose number is on the list.
- Reps can also tap **Mark Do Not Call** on any door/lead.
- You remain responsible for TCPA compliance; import the numbers you obtain and
  keep them current.

---

## Local development (optional)

```bash
cp .env.example .env      # then paste your two Supabase values into .env
npm install
npm run web
```

## Troubleshooting

- **Site shows “Almost live — one setup step left.”** The two
  `EXPO_PUBLIC_SUPABASE_*` secrets aren't set (or the deploy hasn't re-run since
  you added them). Re-check step 5 and re-run the deploy.
- **“Only the team admin can add reps.”** You're signed in as a rep. Sign in with
  the admin account (Sam's email).
- **A new rep can't sign in.** If you kept email confirmation on, they need to
  click the confirmation link in their email first (step 4).
- **📞 opens my phone dialer instead of calling in-app.** Twilio isn't connected
  yet (or a secret is missing/typo'd). Re-check the *In-app calling* section; the
  device dialer is the intended fallback until then.
- **Twilio call says "application error" or drops instantly.** Your TwiML App's
  Voice Request URL must point to the `twilio-voice` function and `TWILIO_CALLER_ID`
  must be a Voice-enabled Twilio number you own.
