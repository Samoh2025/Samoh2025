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

  /**
   * The admin who owns this deployment.
   *
   * `email` is the address granted the Admin role automatically on sign-up.
   * It must match the same value in `supabase/schema.sql` (handle_new_user).
   * As a fallback, whoever creates the very first account also becomes admin.
   */
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

} as const;

export type AppConfig = typeof CONFIG;
