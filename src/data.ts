import { AppData, Rep, Lead, Project, Appointment, Activity } from './types';

const days = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

// Grayscale palette (black & white brand)
const team: Rep[] = [
  { id: 'r1', name: 'Maria Lopez', title: 'Senior Sales Consultant', email: 'maria@onehorizonhomes.com', phone: '(201) 555-0142', initials: 'ML', color: '#111111', lat: 40.9803, lng: -74.1182 },
  { id: 'r2', name: 'Derek Cohen', title: 'Sales Consultant', email: 'derek@onehorizonhomes.com', phone: '(201) 555-0173', initials: 'DC', color: '#3A3A3A', lat: 40.9631, lng: -74.1297 },
  { id: 'r3', name: 'Priya Nair', title: 'Sales Consultant', email: 'priya@onehorizonhomes.com', phone: '(201) 555-0198', initials: 'PN', color: '#5C5C5C', lat: 40.9971, lng: -74.1041 },
  { id: 'r4', name: 'Tony Russo', title: 'Junior Sales Rep', email: 'tony@onehorizonhomes.com', phone: '(201) 555-0210', initials: 'TR', color: '#808080', lat: 40.9889, lng: -74.1423 },
];

const leads: Lead[] = [
  { id: 'l1', name: 'Jennifer Walsh', phone: '(201) 555-0301', email: 'jwalsh@email.com', address: '24 Maple Ave, Ridgewood, NJ', type: 'Kitchen Remodel', value: 68000, stage: 'new', source: 'Website', repId: 'r1', createdAt: days(-1), lat: 40.9812, lng: -74.1149, knockStatus: 'interested' },
  { id: 'l2', name: 'Robert & Lisa Chen', phone: '(201) 555-0322', email: 'rchen@email.com', address: '8 Oak Terrace, Glen Rock, NJ', type: 'Whole-Home Renovation', value: 245000, stage: 'appointment', source: 'Referral', repId: 'r1', createdAt: days(-4), lat: 40.9627, lng: -74.1331, knockStatus: 'callback' },
  { id: 'l3', name: 'Mark Sullivan', phone: '(201) 555-0344', email: 'msullivan@email.com', address: '112 Union St, Ridgewood, NJ', type: 'Bathroom Remodel', value: 32000, stage: 'contacted', source: 'Google Ads', repId: 'r2', createdAt: days(-2), lat: 40.9785, lng: -74.1208, knockStatus: 'no_answer' },
  { id: 'l4', name: 'The Petersons', phone: '(201) 555-0366', email: 'peterson@email.com', address: '57 Hillcrest Rd, Ho-Ho-Kus, NJ', type: 'Addition', value: 158000, stage: 'quoted', source: 'Houzz', repId: 'r3', createdAt: days(-7), lat: 40.9988, lng: -74.1009, knockStatus: 'interested' },
  { id: 'l5', name: 'Amanda Reyes', phone: '(201) 555-0388', email: 'areyes@email.com', address: '301 Franklin Ave, Wyckoff, NJ', type: 'Basement Finish', value: 47000, stage: 'won', source: 'Instagram', repId: 'r2', createdAt: days(-12), lat: 40.9962, lng: -74.1701, knockStatus: 'interested' },
  { id: 'l6', name: 'David Okafor', phone: '(201) 555-0390', email: 'dokafor@email.com', address: '19 Sheridan Ave, Ridgewood, NJ', type: 'New Construction', value: 690000, stage: 'appointment', source: 'Referral', repId: 'r1', createdAt: days(-5), lat: 40.9844, lng: -74.1102, knockStatus: 'callback' },
  { id: 'l7', name: 'Grace Kim', phone: '(201) 555-0411', email: 'gkim@email.com', address: '45 Prospect St, Midland Park, NJ', type: 'Kitchen Remodel', value: 54000, stage: 'contacted', source: 'Website', repId: 'r4', createdAt: days(-3), lat: 40.9899, lng: -74.1438, knockStatus: 'no_answer' },
  { id: 'l8', name: 'The Morales Family', phone: '(201) 555-0433', email: 'morales@email.com', address: '88 Dayton St, Ridgewood, NJ', type: 'Roofing & Exterior', value: 41000, stage: 'quoted', source: 'Google Ads', repId: 'r3', createdAt: days(-9), lat: 40.9760, lng: -74.1175, knockStatus: 'interested' },
  { id: 'l9', name: 'Steven Blake', phone: '(201) 555-0455', email: 'sblake@email.com', address: '7 Crest Dr, Ridgewood, NJ', type: 'Bathroom Remodel', value: 28000, stage: 'lost', source: 'Website', repId: 'r4', createdAt: days(-15), lat: 40.9731, lng: -74.1260, knockStatus: 'not_interested' },
  { id: 'l10', name: 'Nicole Brennan', phone: '(201) 555-0477', email: 'nbrennan@email.com', address: '233 Godwin Ave, Ridgewood, NJ', type: 'Whole-Home Renovation', value: 198000, stage: 'won', source: 'Referral', repId: 'r1', createdAt: days(-20), lat: 40.9856, lng: -74.1284, knockStatus: 'interested' },
  { id: 'l11', name: 'Carlos Mendez', phone: '(201) 555-0499', email: 'cmendez@email.com', address: '14 Ackerman Ave, Glen Rock, NJ', type: 'Addition', value: 132000, stage: 'new', source: 'Houzz', repId: 'r2', createdAt: days(0), lat: 40.9609, lng: -74.1268, knockStatus: 'not_knocked' },
  { id: 'l12', name: 'Hannah Wright', phone: '(201) 555-0512', email: 'hwright@email.com', address: '60 Spring Ave, Ridgewood, NJ', type: 'Kitchen Remodel', value: 61000, stage: 'quoted', source: 'Instagram', repId: 'r3', createdAt: days(-6), lat: 40.9821, lng: -74.1226, knockStatus: 'callback' },
];

const projects: Project[] = [
  { id: 'p1', client: 'Amanda Reyes', type: 'Basement Finish', address: '301 Franklin Ave, Wyckoff, NJ', value: 47000, status: 'In Progress', repId: 'r2', start: days(-8) },
  { id: 'p2', client: 'Nicole Brennan', type: 'Whole-Home Renovation', address: '233 Godwin Ave, Ridgewood, NJ', value: 198000, status: 'Contract Signed', repId: 'r1', start: days(-3) },
  { id: 'p3', client: 'The Petersons', type: 'Addition', address: '57 Hillcrest Rd, Ho-Ho-Kus, NJ', value: 158000, status: 'Proposal Sent', repId: 'r3', start: days(2) },
  { id: 'p4', client: 'Hannah Wright', type: 'Kitchen Remodel', address: '60 Spring Ave, Ridgewood, NJ', value: 61000, status: 'Estimating', repId: 'r3', start: days(5) },
  { id: 'p5', client: 'The Goldbergs', type: 'Bathroom Remodel', address: '11 Walthery Ave, Ridgewood, NJ', value: 36000, status: 'Completed', repId: 'r1', start: days(-40) },
];

const appointments: Appointment[] = [
  { id: 'a1', title: 'In-home consultation', client: 'Robert & Lisa Chen', address: '8 Oak Terrace, Glen Rock, NJ', date: days(1), repId: 'r1', kind: 'Consultation', done: false },
  { id: 'a2', title: 'Site measurement', client: 'David Okafor', address: '19 Sheridan Ave, Ridgewood, NJ', date: days(1), repId: 'r1', kind: 'Site Visit', done: false },
  { id: 'a3', title: 'Design walkthrough', client: 'The Petersons', address: '57 Hillcrest Rd, Ho-Ho-Kus, NJ', date: days(2), repId: 'r3', kind: 'Walkthrough', done: false },
  { id: 'a4', title: 'Contract signing', client: 'Nicole Brennan', address: '233 Godwin Ave, Ridgewood, NJ', date: days(3), repId: 'r1', kind: 'Closing', done: false },
  { id: 'a5', title: 'Follow-up consultation', client: 'Grace Kim', address: '45 Prospect St, Midland Park, NJ', date: days(4), repId: 'r4', kind: 'Consultation', done: false },
  { id: 'a6', title: 'Final walkthrough', client: 'The Goldbergs', address: '11 Walthery Ave, Ridgewood, NJ', date: days(-1), repId: 'r1', kind: 'Walkthrough', done: true },
];

const activity: Activity[] = [
  { id: 'ac1', text: 'Nicole Brennan moved to Won — $198,000 whole-home renovation', at: days(0), kind: 'win' },
  { id: 'ac2', text: 'New lead: Carlos Mendez — Addition in Glen Rock', at: days(0), kind: 'lead' },
  { id: 'ac3', text: 'Quote sent to Hannah Wright — Kitchen Remodel ($61,000)', at: days(-1), kind: 'project' },
  { id: 'ac4', text: 'Appointment booked with Robert & Lisa Chen', at: days(-1), kind: 'appointment' },
  { id: 'ac5', text: 'New lead: Jennifer Walsh — Kitchen Remodel in Ridgewood', at: days(-1), kind: 'lead' },
  { id: 'ac6', text: 'Amanda Reyes project moved to In Progress', at: days(-2), kind: 'project' },
];

export function seedData(): AppData {
  return {
    team,
    leads,
    projects,
    appointments,
    activity,
  };
}

/** Center of the door-knocking territory (Ridgewood, NJ area). */
export const TERRITORY_CENTER = { lat: 40.9793, lng: -74.1165 };
