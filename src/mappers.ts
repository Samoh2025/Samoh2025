/**
 * Translators between Supabase rows (snake_case) and the app's types
 * (camelCase). Kept in one place so auth and store never drift apart.
 */
import { Lead, Rep, Project, Appointment, Activity, LeadNote } from './types';

/* ------------------------------- reads -------------------------------- */

export const rowToRep = (r: any): Rep => ({
  id: r.id,
  name: r.name ?? '',
  title: r.title ?? 'Sales Consultant',
  email: r.email ?? '',
  phone: r.phone ?? '',
  initials: r.initials || initialsFrom(r.name ?? r.email ?? ''),
  color: r.color || '#111111',
  role: r.role === 'admin' ? 'admin' : 'rep',
  userId: r.user_id ?? null,
  lat: r.lat ?? undefined,
  lng: r.lng ?? undefined,
});

export const rowToLead = (r: any): Lead => ({
  id: r.id,
  name: r.name ?? '',
  phone: r.phone ?? '',
  email: r.email ?? '',
  address: r.address ?? '',
  type: r.type,
  value: Number(r.value) || 0,
  stage: r.stage,
  source: r.source ?? 'Manual',
  repId: r.rep_id ?? '',
  createdAt: r.created_at,
  note: r.note ?? undefined,
  lat: r.lat ?? undefined,
  lng: r.lng ?? undefined,
  knockStatus: r.knock_status ?? 'not_knocked',
  category: r.category ?? 'residential',
  listingStatus: r.listing_status ?? 'none',
  dnc: !!r.dnc,
});

export const rowToNote = (r: any): LeadNote => ({
  id: r.id,
  leadId: r.lead_id,
  authorId: r.author_id ?? null,
  authorName: r.author_name ?? '',
  text: r.text ?? '',
  outcome: r.outcome ?? null,
  createdAt: r.created_at,
});

export const rowToProject = (r: any): Project => ({
  id: r.id,
  client: r.client ?? '',
  type: r.type,
  address: r.address ?? '',
  value: Number(r.value) || 0,
  status: r.status,
  repId: r.rep_id ?? '',
  start: r.start_date,
});

export const rowToAppointment = (r: any): Appointment => ({
  id: r.id,
  title: r.title ?? '',
  client: r.client ?? '',
  address: r.address ?? '',
  date: r.date,
  repId: r.rep_id ?? '',
  kind: r.kind,
  done: !!r.done,
});

export const rowToActivity = (r: any): Activity => ({
  id: r.id,
  text: r.text ?? '',
  at: r.at,
  kind: r.kind,
});

/* -------------------------------- util -------------------------------- */

export function initialsFrom(name: string) {
  return (name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Reduce a phone number to comparable digits (last 10 for US numbers). */
export function normalizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}
