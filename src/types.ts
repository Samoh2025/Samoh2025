export type LeadStage =
  | 'new'
  | 'contacted'
  | 'appointment'
  | 'quoted'
  | 'won'
  | 'lost';

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'appointment', label: 'Appointment' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
];

export type ProjectType =
  | 'Kitchen Remodel'
  | 'Bathroom Remodel'
  | 'Whole-Home Renovation'
  | 'Addition'
  | 'New Construction'
  | 'Basement Finish'
  | 'Roofing & Exterior';

export const PROJECT_TYPES: ProjectType[] = [
  'Kitchen Remodel',
  'Bathroom Remodel',
  'Whole-Home Renovation',
  'Addition',
  'New Construction',
  'Basement Finish',
  'Roofing & Exterior',
];

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: ProjectType;
  value: number; // estimated project value in USD
  stage: LeadStage;
  source: string;
  repId: string; // assigned sales rep
  createdAt: string; // ISO date
  note?: string;
};

export type Rep = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  initials: string;
  color: string;
};

export type ProjectStatus =
  | 'Estimating'
  | 'Proposal Sent'
  | 'Contract Signed'
  | 'In Progress'
  | 'Completed';

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Estimating',
  'Proposal Sent',
  'Contract Signed',
  'In Progress',
  'Completed',
];

export type Project = {
  id: string;
  client: string;
  type: ProjectType;
  address: string;
  value: number;
  status: ProjectStatus;
  repId: string;
  start: string; // ISO date
};

export type Appointment = {
  id: string;
  title: string;
  client: string;
  address: string;
  date: string; // ISO datetime
  repId: string;
  kind: 'Consultation' | 'Site Visit' | 'Walkthrough' | 'Closing';
  done: boolean;
};

export type Activity = {
  id: string;
  text: string;
  at: string; // ISO datetime
  kind: 'lead' | 'win' | 'appointment' | 'project' | 'team';
};

export type AppData = {
  leads: Lead[];
  team: Rep[];
  projects: Project[];
  appointments: Appointment[];
  activity: Activity[];
};
