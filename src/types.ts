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

export type PropertyCategory = 'residential' | 'commercial';

export const PROPERTY_CATEGORIES: { key: PropertyCategory; label: string }[] = [
  { key: 'residential', label: 'Residential' },
  { key: 'commercial', label: 'Commercial' },
];

export type ListingStatus = 'none' | 'for_sale' | 'for_lease' | 'under_contract' | 'pending';

export const LISTING_STATUSES: { key: ListingStatus; label: string }[] = [
  { key: 'none', label: 'No listing' },
  { key: 'for_sale', label: 'For Sale' },
  { key: 'for_lease', label: 'For Lease' },
  { key: 'under_contract', label: 'Under Contract' },
  { key: 'pending', label: 'Pending Offer' },
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
  lat?: number; // map position (door-knocking)
  lng?: number;
  knockStatus?: KnockStatus; // door-knocking outcome
  category?: PropertyCategory; // residential vs commercial
  listingStatus?: ListingStatus; // for sale / lease / under contract / pending
  dnc?: boolean; // do-not-call flag
};

/** A timestamped field note logged at a door — shared with the whole team. */
export type LeadNote = {
  id: string;
  leadId: string;
  authorId?: string | null;
  authorName: string;
  text: string;
  outcome?: KnockStatus | null;
  createdAt: string;
};

export type KnockStatus = 'not_knocked' | 'no_answer' | 'callback' | 'interested' | 'not_interested';

export const KNOCK_STATUSES: { key: KnockStatus; label: string }[] = [
  { key: 'not_knocked', label: 'Not knocked' },
  { key: 'no_answer', label: 'No answer' },
  { key: 'callback', label: 'Call back' },
  { key: 'interested', label: 'Interested' },
  { key: 'not_interested', label: 'Not interested' },
];

export type Role = 'admin' | 'rep';

export type Rep = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  initials: string;
  color: string;
  /** 'admin' (Sam) or 'rep'. */
  role?: Role;
  /** Login account id once this person has signed up; null while "invited". */
  userId?: string | null;
  /** Approx. last-known location for the door-knocker map. */
  lat?: number;
  lng?: number;
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
  notes: LeadNote[];
  /** Normalized (digits-only) do-not-call numbers imported by the admin. */
  dnc: string[];
};
