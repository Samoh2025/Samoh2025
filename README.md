# One Horizon Homes — Sam's Sales Team

A **live, multi-user sales-team app** for **Sam**, built as a separate copy of the
One Horizon Homes admin site. Sam and every rep get their **own login** and share the
**same live data** across all their devices. It's branded end-to-end for Sam so his link
is unmistakably his.

## The two links

| Admin | Link | Status |
|-------|------|--------|
| **You (Ali)** | `https://one-horizon-homes.expo.app` | **Unchanged.** This project does not touch it. |
| **Sam** | `https://sam-one-horizon-homes.expo.app` | This project. Sam's name is built into the URL. |

Because Sam's app is a **separate Expo project with its own slug** (`sam-one-horizon-homes`),
deploying it creates a brand-new URL and has **zero effect** on your existing site.

## 🔌 One-time setup to go live

This app runs on a small, free backend (**Supabase**) so real accounts and live sync work.
**Do this once** — it takes about 10 minutes and needs no terminal:

### → Follow [`SETUP.md`](SETUP.md)

In short: create a free Supabase project, run [`supabase/schema.sql`](supabase/schema.sql),
paste two values (`EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`) into GitHub
secrets, and deploy. Until that's done, the live site shows a friendly
“connect the backend” screen instead of crashing.

## What's inside

A complete sales command center for a home-improvement / construction sales team:

- **Real accounts** — Sam and each rep sign up and sign in from their **own phone or
  laptop**. The admin email (`sam@onehorizonhomes.com`) is the **Admin**; everyone else is a
  **Sales Rep**. Adding a rep in *Sales Team* lets them sign up with that email and go live.
- **Live sync** — new leads, stage moves and door-knock outcomes appear on everyone's
  screen in real time (Supabase realtime).
- **Dashboard** — KPIs (open leads, pipeline value, deals won, upcoming visits),
  a pipeline funnel, a team leaderboard, upcoming appointments and a live activity feed.
- **Leads & Pipeline** — add leads, **import contacts** (paste CSV / spreadsheet),
  filter by stage, and move them New → Contacted → Appointment → Quoted → Won / Lost.
- **Door-Knock Map** — a live OpenStreetMap of the territory with a pin per door,
  colored by knock outcome (interested / call back / no answer / not interested / not
  knocked), and a route list reps update in the field — synced to the whole team.
- **Sales Team** — Sam's reps with per-rep stats; add reps (they show **Invited** until
  they create their account, then **Active**).
- **Projects** — jobs from *Estimating* through *Completed*, with values and status.
- **Appointments** — consultations, site visits, walkthroughs and closings; check them off.
- **Settings** — the shareable team link, your profile, company info, and sign-out.

The brand is **black & white** throughout.

> **Data & security:** all data lives in your Supabase project, protected by
> Row Level Security so only signed-in members of the team can read or write it. The
> `EXPO_PUBLIC_SUPABASE_ANON_KEY` is safe to ship to the browser — that's what it's for.

> **Still placeholder:** the brand **logo image** and exact **font** (this build uses a
> monochrome vector mark and a clean system font). Send the real assets to swap them in.
> Screenshots of your real app let us align it screen-for-screen.

## Run it locally

```bash
cp .env.example .env   # paste your two Supabase values (see SETUP.md)
npm install
npm run web            # opens the app in your browser
```

Type-check and production web build:

```bash
npm run typecheck
npm run export:web     # outputs a static site to ./dist
```

## Deploy to `sam-one-horizon-homes.expo.app`

Deploys are automated by GitHub Actions (`.github/workflows/deploy.yml`). Add three repo
secrets once — `EXPO_TOKEN`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
(see [`SETUP.md`](SETUP.md)) — then every push deploys, or run it from the **Actions** tab.

The deployment URL comes from the project **slug** in `app.json` (`sam-one-horizon-homes`),
so the result is `https://sam-one-horizon-homes.expo.app`. Your own
`one-horizon-homes.expo.app` is a different project and stays exactly as it is.

## Make another admin's copy later

Per-admin branding lives in **one file**: [`src/config.ts`](src/config.ts). To spin up a copy
for a different admin, copy this project, point it at its own Supabase project, and change:

```ts
admin:  { name: 'Sam', fullName: 'Sam Horizon', email: 'sam@onehorizonhomes.com', ... },
teamName: "Sam's Sales Team",
site:   { slug: 'sam-one-horizon-homes', url: 'https://sam-one-horizon-homes.expo.app' },
```

Update the matching `slug`/`name` in `app.json` and the `admin_email` in
`supabase/schema.sql`, then deploy.

## Project structure

```
App.tsx                 # root: config gate → auth gate → screen routing
index.ts                # Expo entry point
app.json                # Expo config (name, slug = the .expo.app subdomain, web settings)
eas.json                # EAS build/deploy config
.env.example            # local Supabase connection template
supabase/
  schema.sql            # ← run once in Supabase: tables, security, triggers, realtime
src/
  config.ts             # ← all of Sam's branding lives here
  supabase.ts           # Supabase client (reads EXPO_PUBLIC_SUPABASE_* env vars)
  auth.tsx              # real accounts via Supabase Auth
  store.tsx             # live data + realtime sync + actions
  mappers.ts            # database rows ↔ app types
  theme.ts              # colors, spacing, typography
  types.ts              # data models (Lead, Rep, Project, Appointment…)
  data.ts               # door-knock territory center
  nav.ts                # navigation routes
  ui.tsx                # shared components (Card, Button, Badge, Avatar, Modal…)
  Shell.tsx             # responsive sidebar / top-bar layout
  screens/              # Login, SignUp, SetupNeeded, Dashboard, Leads, DoorKnock,
                        #   Team, Projects, Appointments, Settings
```

Built with Expo (SDK 56) + React Native Web + Supabase.
