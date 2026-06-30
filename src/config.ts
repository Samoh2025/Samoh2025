/**
 * App configuration / branding.
 *
 * This single file is what makes each deployment "belong" to one admin.
 * Sam's deployment uses these values; the original (Ali's) deployment is a
 * separate site and is intentionally left untouched.
 *
 * To spin up another admin's copy later, copy this project and change only
 * the values below (name, email, slug) — nothing else needs to change.
 */
export const CONFIG = {
  brand: 'One Horizon Homes',
  tagline: 'Design • Build • Renovate',

  /** The admin who owns this deployment. */
  admin: {
    name: 'Sam',
    fullName: 'Sam Horizon',
    role: 'Sales Team Admin',
    email: 'sam@onehorizonhomes.com',
    initials: 'S',
  },

  /** The name shown across the app for this admin's sales org. */
  teamName: "Sam's Sales Team",

  /** Deployment identity — this is what puts Sam's name in the link. */
  site: {
    slug: 'sam-one-horizon-homes',
    url: 'https://sam-one-horizon-homes.expo.app',
  },

  /** Demo auth: this build runs standalone with no backend. */
  demo: true,
} as const;

export type AppConfig = typeof CONFIG;
