export type RouteKey =
  | 'dashboard'
  | 'leads'
  | 'team'
  | 'projects'
  | 'appointments'
  | 'settings';

export const ROUTES: { key: RouteKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'leads', label: 'Leads & Pipeline', icon: '🧲' },
  { key: 'team', label: 'Sales Team', icon: '👥' },
  { key: 'projects', label: 'Projects', icon: '🏗️' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];
