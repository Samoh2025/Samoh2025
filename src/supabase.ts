import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connection for the live, multi-user build.
 *
 * The two values below come from your Supabase project
 * (Project Settings → API). They are provided at build time as public env
 * vars so they get baked into the web bundle:
 *
 *   EXPO_PUBLIC_SUPABASE_URL       e.g. https://abcd1234.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY  the "anon / public" API key
 *
 * The anon key is designed to be shipped to the browser — your data is
 * protected by Row Level Security in the database, not by hiding this key.
 *
 * Set them locally in a `.env` file (see .env.example) and in CI as GitHub
 * Actions secrets (see .github/workflows/deploy.yml and SETUP.md).
 */
// Connected project's public values. These are safe to commit — the publishable
// key is designed to be shipped in the browser and your data is protected by Row
// Level Security. Environment variables (e.g. GitHub Actions secrets) still take
// precedence, so you can override these without editing code.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oxazdqpjkwjebmomtzhp.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_lfbqVMAZCnT9RB-gqzDd0A_QnkKOP7A';

/** True once both connection values are present. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * The shared client, or `null` until the project is connected. Everything that
 * touches the backend checks `isSupabaseConfigured` (or handles null) so the
 * app shows a friendly "connect your backend" screen instead of crashing.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        // Web keeps the session in localStorage automatically; native uses
        // AsyncStorage so a signed-in rep stays signed in on their phone.
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        // Needed on web so email-confirmation links complete the sign-in.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
