import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { AppData, Lead, LeadStage, Rep, ProjectStatus, KnockStatus } from './types';
import { TERRITORY_CENTER } from './data';
import { theme } from './theme';
import { supabase } from './supabase';
import {
  rowToLead,
  rowToRep,
  rowToProject,
  rowToAppointment,
  rowToActivity,
  initialsFrom,
} from './mappers';

/**
 * Live, shared data — backed by Supabase.
 *
 * On sign-in we load the team's data from the database, then subscribe to
 * realtime changes so every device (Sam's laptop, each rep's phone) sees new
 * leads, stage moves and door-knock updates as they happen. Every mutation
 * writes to the database; realtime brings the change back to all clients.
 */

type Store = {
  data: AppData;
  loading: boolean;
  addLead: (l: Omit<Lead, 'id' | 'createdAt' | 'stage'> & { stage?: LeadStage }) => Promise<void>;
  setLeadStage: (id: string, stage: LeadStage) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addRep: (r: Omit<Rep, 'id' | 'initials' | 'color'>) => Promise<{ ok: boolean; error?: string }>;
  setProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  toggleAppointment: (id: string) => Promise<void>;
  setKnockStatus: (id: string, status: KnockStatus) => Promise<void>;
  importLeads: (rows: ImportRow[]) => Promise<number>;
};

export type ImportRow = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: Lead['type'];
  value?: number;
  source?: string;
};

const StoreContext = createContext<Store | null>(null);

const EMPTY: AppData = { leads: [], team: [], projects: [], appointments: [], activity: [] };

// Grayscale palette (black & white brand) for rep avatars.
const PALETTE = ['#111111', '#3A3A3A', '#5C5C5C', '#808080', '#262626', '#6E6E6E'];

/** Place a point near the territory center so new/imported leads show on the map. */
function nearTerritory() {
  return {
    lat: TERRITORY_CENTER.lat + (Math.random() - 0.5) * 0.04,
    lng: TERRITORY_CENTER.lng + (Math.random() - 0.5) * 0.05,
  };
}

/** Insert-or-replace a row in an array by id. */
function upsertBy<T extends { id: string }>(arr: T[], row: T, prepend: boolean): T[] {
  const i = arr.findIndex((x) => x.id === row.id);
  if (i >= 0) {
    const copy = arr.slice();
    copy[i] = row;
    return copy;
  }
  return prepend ? [row, ...arr] : [...arr, row];
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  // Fire-and-forget: record something on the activity feed.
  const logActivity = (text: string, kind: AppData['activity'][number]['kind']) => {
    supabase?.from('activity').insert({ text, kind }).then(undefined, () => {});
  };

  useEffect(() => {
    mounted.current = true;
    const sb = supabase;
    if (!sb) {
      setLoading(false);
      return;
    }

    // 1) Initial load of everything the team can see.
    (async () => {
      const [leads, team, projects, appointments, activity] = await Promise.all([
        sb.from('leads').select('*').order('created_at', { ascending: false }),
        sb.from('team_members').select('*').order('created_at', { ascending: true }),
        sb.from('projects').select('*').order('created_at', { ascending: true }),
        sb.from('appointments').select('*').order('date', { ascending: true }),
        sb.from('activity').select('*').order('at', { ascending: false }),
      ]);
      if (!mounted.current) return;
      setData({
        leads: (leads.data ?? []).map(rowToLead),
        team: (team.data ?? []).map(rowToRep),
        projects: (projects.data ?? []).map(rowToProject),
        appointments: (appointments.data ?? []).map(rowToAppointment),
        activity: (activity.data ?? []).map(rowToActivity),
      });
      setLoading(false);
    })();

    // 2) Live updates. One channel, one handler per table.
    const applyChange =
      (
        key: keyof AppData,
        mapper: (r: any) => { id: string },
        prepend: boolean,
      ) =>
      (payload: any) => {
        setData((d) => {
          const arr = d[key] as { id: string }[];
          if (payload.eventType === 'DELETE') {
            return { ...d, [key]: arr.filter((x) => x.id !== payload.old?.id) };
          }
          return { ...d, [key]: upsertBy(arr, mapper(payload.new), prepend) };
        });
      };

    const channel = sb
      .channel('ohh-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, applyChange('leads', rowToLead, true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, applyChange('team', rowToRep, false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, applyChange('projects', rowToProject, false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, applyChange('appointments', rowToAppointment, false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, applyChange('activity', rowToActivity, true))
      .subscribe();

    return () => {
      mounted.current = false;
      sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<Store>(() => {
    return {
      data,
      loading,

      addLead: async (l) => {
        if (!supabase) return;
        const pos = l.lat != null && l.lng != null ? { lat: l.lat, lng: l.lng } : nearTerritory();
        const { data: row } = await supabase
          .from('leads')
          .insert({
            name: l.name,
            phone: l.phone ?? '',
            email: l.email ?? '',
            address: l.address ?? '',
            type: l.type,
            value: l.value ?? 0,
            stage: l.stage ?? 'new',
            source: l.source || 'Manual',
            rep_id: l.repId || null,
            knock_status: l.knockStatus ?? 'not_knocked',
            lat: pos.lat,
            lng: pos.lng,
          })
          .select()
          .single();
        if (row) {
          const lead = rowToLead(row);
          setData((d) => ({ ...d, leads: upsertBy(d.leads, lead, true) }));
          logActivity(`New lead: ${lead.name} — ${lead.type}`, 'lead');
        }
      },

      setLeadStage: async (id, stage) => {
        if (!supabase) return;
        const lead = data.leads.find((x) => x.id === id);
        setData((d) => ({ ...d, leads: d.leads.map((x) => (x.id === id ? { ...x, stage } : x)) }));
        await supabase.from('leads').update({ stage }).eq('id', id);
        if (lead && stage === 'won') {
          logActivity(`${lead.name} moved to Won — $${lead.value.toLocaleString()} ${lead.type}`, 'win');
        }
      },

      deleteLead: async (id) => {
        if (!supabase) return;
        setData((d) => ({ ...d, leads: d.leads.filter((x) => x.id !== id) }));
        await supabase.from('leads').delete().eq('id', id);
      },

      addRep: async (r) => {
        if (!supabase) return { ok: false, error: 'Backend not connected yet.' };
        const color = PALETTE[data.team.length % PALETTE.length];
        const { data: row, error } = await supabase
          .from('team_members')
          .insert({
            name: r.name,
            title: r.title || 'Sales Consultant',
            email: r.email || '',
            phone: r.phone || '',
            role: 'rep',
            initials: initialsFrom(r.name),
            color,
          })
          .select()
          .single();
        if (error) {
          const msg = /row-level security|policy/i.test(error.message)
            ? 'Only the team admin can add reps.'
            : /duplicate|unique/i.test(error.message)
            ? 'Someone with that email is already on the team.'
            : error.message;
          return { ok: false, error: msg };
        }
        if (row) {
          const rep = rowToRep(row);
          setData((d) => ({ ...d, team: upsertBy(d.team, rep, false) }));
          logActivity(`${rep.name} was added to the sales team`, 'team');
        }
        return { ok: true };
      },

      setProjectStatus: async (id, status) => {
        if (!supabase) return;
        setData((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, status } : p)) }));
        await supabase.from('projects').update({ status }).eq('id', id);
      },

      toggleAppointment: async (id) => {
        if (!supabase) return;
        const cur = data.appointments.find((a) => a.id === id);
        const done = !(cur?.done ?? false);
        setData((d) => ({ ...d, appointments: d.appointments.map((a) => (a.id === id ? { ...a, done } : a)) }));
        await supabase.from('appointments').update({ done }).eq('id', id);
      },

      setKnockStatus: async (id, status) => {
        if (!supabase) return;
        setData((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, knockStatus: status } : l)) }));
        await supabase.from('leads').update({ knock_status: status }).eq('id', id);
      },

      importLeads: async (rows) => {
        if (!supabase) return 0;
        const valid = rows.filter((r) => r.name && r.name.trim());
        if (valid.length === 0) return 0;
        const reps = data.team.filter((m) => m.role !== 'admin');
        const payload = valid.map((r, i) => {
          const pos = nearTerritory();
          return {
            name: r.name.trim(),
            phone: r.phone?.trim() ?? '',
            email: r.email?.trim() ?? '',
            address: r.address?.trim() ?? '',
            type: r.type ?? 'Kitchen Remodel',
            value: r.value ?? 0,
            stage: 'new',
            source: r.source?.trim() || 'Imported',
            rep_id: reps.length ? reps[i % reps.length].id : null,
            knock_status: 'not_knocked',
            lat: pos.lat,
            lng: pos.lng,
          };
        });
        const { data: inserted } = await supabase.from('leads').insert(payload).select();
        if (inserted?.length) {
          setData((d) => {
            let next = d.leads;
            for (const row of inserted) next = upsertBy(next, rowToLead(row), true);
            return { ...d, leads: next };
          });
          logActivity(`Imported ${inserted.length} contacts into leads`, 'lead');
        }
        return inserted?.length ?? 0;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.bg, gap: 12 }}>
        <ActivityIndicator size="large" color={theme.color.primary} />
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>Loading your workspace…</Text>
      </View>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Convenience selector used across screens. */
export function repById(team: Rep[], id: string) {
  return team.find((r) => r.id === id);
}
