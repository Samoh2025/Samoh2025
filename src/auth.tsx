import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { rowToRep } from './mappers';
import { Rep } from './types';

/**
 * Real accounts, backed by Supabase Auth.
 *
 * Anyone can create an account at the site and it works on every device. The
 * configured admin email (or the very first account) becomes the Admin; everyone
 * else is a Sales Rep. Each account is linked to a row on the team roster
 * (`team_members`) by a database trigger, which we read back here as the
 * signed-in person's profile.
 */
export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type SignUpInput = { name: string; email: string; password: string; company?: string };
export type Result = { ok: boolean; error?: string; needsConfirmation?: boolean };

type Auth = {
  status: AuthStatus;
  session: Session | null;
  /** The signed-in person's team-roster profile (name, role, etc.). */
  user: Rep | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (input: SignUpInput) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

/** Read the signed-in user's roster row. Retries briefly because the row is
 *  created by a trigger that may land a moment after sign-up. */
async function fetchProfile(userId: string): Promise<Rep | null> {
  if (!supabase) return null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) return rowToRep(data);
    await new Promise((r) => setTimeout(r, 400));
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Rep | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) {
      setStatus('signedOut');
      return;
    }

    // Load any existing session, then keep in sync with auth changes.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      applySession(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return;
      applySession(next);
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function applySession(next: Session | null) {
    setSession(next);
    if (!next?.user) {
      setUser(null);
      setStatus('signedOut');
      return;
    }
    const profile = await fetchProfile(next.user.id);
    if (!mounted.current) return;
    // Fall back to a minimal profile from the auth record if the roster row
    // hasn't materialized yet, so the app never gets stuck on a blank screen.
    setUser(
      profile ?? {
        id: next.user.id,
        name: (next.user.user_metadata?.name as string) || next.user.email || 'Member',
        title: 'Sales Consultant',
        email: next.user.email || '',
        phone: '',
        initials: ((next.user.email || 'M')[0] || 'M').toUpperCase(),
        color: '#111111',
        role: 'rep',
        userId: next.user.id,
      },
    );
    setStatus('signedIn');
  }

  const value = useMemo<Auth>(
    () => ({
      status,
      session,
      user,
      isAdmin: user?.role === 'admin',
      signIn: async (email, password) => {
        if (!supabase) return { ok: false, error: 'Backend not connected yet.' };
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) return { ok: false, error: friendly(error.message) };
        return { ok: true };
      },
      signUp: async ({ name, email, password }) => {
        if (!supabase) return { ok: false, error: 'Backend not connected yet.' };
        const clean = email.trim();
        if (!name.trim()) return { ok: false, error: 'Please enter your name.' };
        if (!clean.includes('@')) return { ok: false, error: 'Please enter a valid email.' };
        if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
        const { data, error } = await supabase.auth.signUp({
          email: clean,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) return { ok: false, error: friendly(error.message) };
        // If email confirmation is ON, there's no session yet — tell the user.
        if (!data.session) return { ok: true, needsConfirmation: true };
        return { ok: true };
      },
      signOut: async () => {
        await supabase?.auth.signOut();
        setUser(null);
        setSession(null);
        setStatus('signedOut');
      },
    }),
    [status, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Turn a few common Supabase error strings into plain language. */
function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password.';
  if (m.includes('already registered')) return 'An account with that email already exists — try signing in.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first (check your inbox).';
  return msg;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
