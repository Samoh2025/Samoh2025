/**
 * This is a live app now — leads, team, projects, appointments and activity all
 * come from the Supabase database (see src/store.tsx), not from sample data.
 *
 * The only thing here is the door-knocking territory: where the map opens and
 * which towns it covers. Reps can click anywhere on the map to drop a door, so
 * this just sets the starting view.
 */

/** Towns this sales team covers. */
export const TERRITORY_TOWNS = ['Wayne, NJ', 'Cedar Grove, NJ', 'Ridgewood, NJ'];

/** Where the map opens — centered to take in Wayne + Cedar Grove + Ridgewood. */
export const TERRITORY_CENTER = { lat: 40.9188, lng: -74.2135 };

/** Initial zoom (lower = wider view across the towns). */
export const TERRITORY_ZOOM = 12;
