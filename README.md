# One Horizon Homes — Sam's Sales Team

A self-functioning **sales-team admin app** for **Sam**, built as a separate copy of the
One Horizon Homes admin site. It runs on its own (no backend required) and is branded
end‑to‑end for Sam so his link is unmistakably his.

## The two links

| Admin | Link | Status |
|-------|------|--------|
| **You (Ali)** | `https://one-horizon-homes.expo.app` | **Unchanged.** This project does not touch it. |
| **Sam** | `https://sam-one-horizon-homes.expo.app` | This project. Sam's name is built into the URL. |

Because Sam's app is a **separate Expo project with its own slug** (`sam-one-horizon-homes`),
deploying it creates a brand‑new URL and has **zero effect** on your existing site.

## What's inside

A complete sales command center for a home‑improvement / construction sales team:

- **Login** — branded sign‑in for Sam (demo mode: any password works).
- **Dashboard** — KPIs (open leads, pipeline value, deals won, upcoming visits),
  a pipeline funnel, a team leaderboard, upcoming appointments and a live activity feed.
- **Leads & Pipeline** — add leads, filter by stage, and move them
  New → Contacted → Appointment → Quoted → Won / Lost.
- **Sales Team** — Sam's reps with per‑rep stats; add new reps.
- **Projects** — jobs from *Estimating* through *Completed*, with values and status.
- **Appointments** — consultations, site visits, walkthroughs and closings; check them off.
- **Settings** — shows **Sam's website link** front‑and‑center, plus profile, company info,
  reset‑to‑sample‑data, and sign‑out.

Everything is interactive and persists in the browser (localStorage), so Sam can actually
use it as a working demo without any server.

> **Note on accuracy:** This session was locked down and could not open
> `one-horizon-homes.expo.app` (the network policy blocked it, and the app is login‑protected),
> so this is a faithful **rebuild from scratch**, not a byte‑for‑byte clone. To make it match
> your real app screen‑for‑screen, send screenshots of each screen and the app can be aligned exactly.

## Run it locally

```bash
npm install
npm run web        # opens the app in your browser
```

Type‑check and production web build:

```bash
npm run typecheck
npm run export:web # outputs a static site to ./dist
```

## Deploy it to `sam-one-horizon-homes.expo.app`

This is the only step that needs **your Expo account** (login + publish). It is quick:

```bash
# 1. Install the Expo tools (once)
npm install -g eas-cli

# 2. Sign in to your Expo account
eas login

# 3. Link this folder to a NEW Expo project named "sam-one-horizon-homes"
#    (this is what produces the sam-one-horizon-homes.expo.app subdomain)
eas init --non-interactive --force

# 4. Build the web export and deploy it to EAS Hosting
npm run export:web
eas deploy --prod
```

The deployment URL comes from the project **slug** in `app.json` (`sam-one-horizon-homes`),
so the result is `https://sam-one-horizon-homes.expo.app`. Your own
`one-horizon-homes.expo.app` is a different project and stays exactly as it is.

## Make another admin's copy later

All of the per‑admin branding lives in **one file**: [`src/config.ts`](src/config.ts).
To spin up a copy for a different admin, copy this project and change only:

```ts
admin:  { name: 'Sam', fullName: 'Sam Horizon', email: 'sam@onehorizonhomes.com', ... },
teamName: "Sam's Sales Team",
site:   { slug: 'sam-one-horizon-homes', url: 'https://sam-one-horizon-homes.expo.app' },
```

Update the matching `slug`/`name` in `app.json`, then deploy — nothing else needs to change.

## Project structure

```
App.tsx                 # root: auth gate + screen routing
index.ts                # Expo entry point
app.json                # Expo config (name, slug = the .expo.app subdomain, web settings)
eas.json                # EAS build/deploy config
src/
  config.ts             # ← all of Sam's branding lives here
  theme.ts              # colors, spacing, typography
  types.ts              # data models (Lead, Rep, Project, Appointment…)
  data.ts               # seeded sample data for the demo
  store.tsx             # app state + actions + localStorage persistence
  nav.ts                # navigation routes
  ui.tsx                # shared components (Card, Button, Badge, Avatar, Modal…)
  Shell.tsx             # responsive sidebar / top-bar layout
  screens/              # Login, Dashboard, Leads, Team, Projects, Appointments, Settings
```

Built with Expo (SDK 56) + React Native Web.
