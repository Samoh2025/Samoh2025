import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppData, Lead, LeadStage, Rep, Project, ProjectStatus, Appointment } from './types';
import { seedData } from './data';
import { CONFIG } from './config';

const STORAGE_KEY = `ohh:${CONFIG.site.slug}:v1`;

/** Tiny cross-platform persistence using web localStorage when available. */
const persist = {
  load(): AppData | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppData) : null;
    } catch {
      return null;
    }
  },
  save(data: AppData) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },
};

let _seq = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

const nowISO = () => new Date().toISOString();

type Store = {
  data: AppData;
  addLead: (l: Omit<Lead, 'id' | 'createdAt' | 'stage'> & { stage?: LeadStage }) => void;
  setLeadStage: (id: string, stage: LeadStage) => void;
  deleteLead: (id: string) => void;
  addRep: (r: Omit<Rep, 'id' | 'initials' | 'color'>) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  toggleAppointment: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

const PALETTE = ['#2D7FB8', '#1F9D6B', '#C2592E', '#7A4FB5', '#D6453E', '#0F8A8A'];

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => persist.load() ?? seedData());

  useEffect(() => {
    persist.save(data);
  }, [data]);

  const value = useMemo<Store>(() => {
    const logActivity = (text: string, kind: AppData['activity'][number]['kind']) => ({
      id: uid('ac'),
      text,
      at: nowISO(),
      kind,
    });

    return {
      data,
      addLead: (l) =>
        setData((d) => {
          const lead: Lead = {
            ...l,
            stage: l.stage ?? 'new',
            id: uid('l'),
            createdAt: nowISO(),
          };
          return {
            ...d,
            leads: [lead, ...d.leads],
            activity: [logActivity(`New lead: ${lead.name} — ${lead.type}`, 'lead'), ...d.activity],
          };
        }),
      setLeadStage: (id, stage) =>
        setData((d) => {
          const lead = d.leads.find((x) => x.id === id);
          const extra =
            lead && stage === 'won'
              ? [logActivity(`${lead.name} moved to Won — $${lead.value.toLocaleString()} ${lead.type}`, 'win')]
              : [];
          return {
            ...d,
            leads: d.leads.map((x) => (x.id === id ? { ...x, stage } : x)),
            activity: [...extra, ...d.activity],
          };
        }),
      deleteLead: (id) => setData((d) => ({ ...d, leads: d.leads.filter((x) => x.id !== id) })),
      addRep: (r) =>
        setData((d) => {
          const rep: Rep = {
            ...r,
            id: uid('r'),
            initials: initialsFrom(r.name),
            color: PALETTE[d.team.length % PALETTE.length],
          };
          return {
            ...d,
            team: [...d.team, rep],
            activity: [logActivity(`${rep.name} joined the sales team`, 'team'), ...d.activity],
          };
        }),
      setProjectStatus: (id, status) =>
        setData((d) => ({
          ...d,
          projects: d.projects.map((p) => (p.id === id ? { ...p, status } : p)),
        })),
      toggleAppointment: (id) =>
        setData((d) => ({
          ...d,
          appointments: d.appointments.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
        })),
      resetDemo: () => {
        persist.clear();
        setData(seedData());
      },
    };
  }, [data]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Convenience selectors. */
export function repById(team: Rep[], id: string) {
  return team.find((r) => r.id === id);
}
