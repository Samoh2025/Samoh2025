import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';

/**
 * Lightweight account system for the standalone build.
 *
 * Accounts are stored in this browser (localStorage). Sam is the admin; anyone
 * he adds is a sales rep. This makes "create an account" and sign-in real on a
 * single device. Logging in from *other* devices (each rep on their own phone)
 * and live cross-device sync require the backend step described in the README.
 */
export type Role = 'admin' | 'rep';

export type Account = {
  email: string;
  password: string;
  name: string;
  company: string;
  role: Role;
};

const ACC_KEY = `ohh:${CONFIG.site.slug}:accounts:v1`;
const SESSION_KEY = `ohh:${CONFIG.site.slug}:session:v1`;

function loadAccounts(): Account[] {
  try {
    if (typeof localStorage === 'undefined') return seedAccounts();
    const raw = localStorage.getItem(ACC_KEY);
    if (!raw) return seedAccounts();
    return JSON.parse(raw) as Account[];
  } catch {
    return seedAccounts();
  }
}

function saveAccounts(list: Account[]) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(ACC_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function seedAccounts(): Account[] {
  // Pre-create Sam's admin account so the workspace is ready out of the box.
  return [
    {
      email: CONFIG.admin.email,
      password: 'horizon',
      name: CONFIG.admin.fullName,
      company: CONFIG.brand,
      role: 'admin',
    },
  ];
}

type Auth = {
  user: Account | null;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (input: { name: string; email: string; password: string; company?: string }) => { ok: boolean; error?: string };
  signOut: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => saveAccounts(accounts), [accounts]);
  useEffect(() => {
    try {
      if (typeof localStorage === 'undefined') return;
      if (email) localStorage.setItem(SESSION_KEY, email);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [email]);

  const value = useMemo<Auth>(() => {
    const user = accounts.find((a) => a.email === email) ?? null;
    return {
      user,
      signIn: (e, p) => {
        const acc = accounts.find((a) => a.email.toLowerCase() === e.trim().toLowerCase());
        if (!acc) return { ok: false, error: 'No account found for that email.' };
        if (acc.password !== p) return { ok: false, error: 'Incorrect password.' };
        setEmail(acc.email);
        return { ok: true };
      },
      signUp: ({ name, email: e, password, company }) => {
        const clean = e.trim().toLowerCase();
        if (!name.trim()) return { ok: false, error: 'Please enter your name.' };
        if (!clean || !clean.includes('@')) return { ok: false, error: 'Please enter a valid email.' };
        if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
        if (accounts.some((a) => a.email.toLowerCase() === clean))
          return { ok: false, error: 'An account with that email already exists — try signing in.' };
        const acc: Account = {
          email: e.trim(),
          password,
          name: name.trim(),
          company: company?.trim() || CONFIG.brand,
          role: 'admin',
        };
        setAccounts((list) => [...list, acc]);
        setEmail(acc.email);
        return { ok: true };
      },
      signOut: () => setEmail(null),
    };
  }, [accounts, email]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
