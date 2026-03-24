import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const ITEMS_PER_PAGE = 10;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const SPORT_TYPE_LABELS: Record<string, string> = {
  CRICKET_NET: 'Cricket Net',
  BOX_CRICKET: 'Box Cricket',
  FOOTBALL: 'Football',
  BASKETBALL: 'Basketball',
  PICKLEBALL: 'Pickleball',
  TENNIS: 'Tennis',
  BADMINTON: 'Badminton',
  SWIMMING: 'Swimming',
  HOCKEY: 'Hockey',
  VOLLEYBALL: 'Volleyball',
  TABLE_TENNIS: 'Table Tennis',
  SNOOKER: 'Snooker',
  ARCHERY: 'Archery',
  BOXING: 'Boxing',
  GOLF: 'Golf',
  SHOOTING: 'Shooting',
  SKATEBOARDING: 'Skateboarding',
  TAEKWONDO: 'Taekwondo',
};

export const PARTNER_TYPE_LABELS: Record<string, string> = {
  VENUE: 'Venue / Court',
  COACH: 'Coach / Trainer',
  ACADEMY: 'Academy',
  GYM: 'Gym',
};

export const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const SURFACE_TYPE_LABELS: Record<string, string> = {
  SYNTHETIC: 'Synthetic',
  WOODEN: 'Wooden',
  CLAY: 'Clay',
  TURF: 'Turf',
  CONCRETE: 'Concrete',
};

export const SLOT_DURATION_LABELS: Record<string, string> = {
  THIRTY_MINS: '30 mins',
  SIXTY_MINS: '60 mins',
  NINETY_MINS: '90 mins',
};

export const DAY_LABELS: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

/** Sport-specific terminology for the "unit" (court, pool, mat, ring, etc.) */
export const SPORT_UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
  CRICKET_NET: { singular: 'Net', plural: 'Nets' },
  BOX_CRICKET: { singular: 'Box', plural: 'Boxes' },
  SWIMMING: { singular: 'Pool', plural: 'Pools' },
  BOXING: { singular: 'Ring', plural: 'Rings' },
  TAEKWONDO: { singular: 'Mat', plural: 'Mats' },
  SHOOTING: { singular: 'Lane', plural: 'Lanes' },
  ARCHERY: { singular: 'Lane', plural: 'Lanes' },
  GOLF: { singular: 'Hole', plural: 'Holes' },
  SKATEBOARDING: { singular: 'Ramp', plural: 'Ramps' },
  SNOOKER: { singular: 'Table', plural: 'Tables' },
};

/** Get the sport-specific unit label, defaulting to "Court"/"Courts" */
export function getSportUnitLabel(sportType: string): { singular: string; plural: string } {
  return SPORT_UNIT_LABELS[sportType] ?? { singular: 'Court', plural: 'Courts' };
}

export const CITY_OPTIONS = [
  'Delhi',
  'Gurgaon',
  'Noida',
  'Ghaziabad',
  'Faridabad',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Other',
];

export const FACILITY_OPTIONS = [
  'Parking',
  'Washroom',
  'Lighting',
  'Equipment Rental',
  'Seating Area',
  'Canteen (Food Area)',
  'Referee/Umpires',
];

export const SESSION_TYPE_OPTIONS = [
  '1:1 Coaching',
  'Group Session',
  'Kids Training',
  'Advanced Training',
  'Session Timings',
];

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};
