import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const ITEMS_PER_PAGE = 10;

export const SPORT_TYPE_LABELS: Record<string, string> = {
  CRICKET: 'Cricket',
  FOOTBALL: 'Football',
  BASKETBALL: 'Basketball',
  TENNIS: 'Tennis',
  BADMINTON: 'Badminton',
  SWIMMING: 'Swimming',
  HOCKEY: 'Hockey',
  VOLLEYBALL: 'Volleyball',
  TABLE_TENNIS: 'Table Tennis',
  SQUASH: 'Squash',
  AQUATICS: 'Aquatics',
  ARCHERY: 'Archery',
  ATHLETICS: 'Athletics',
  BEACH_VOLLEYBALL: 'Beach Volleyball',
  BOXING: 'Boxing',
  BREAKING: 'Breaking',
  CANOEING: 'Canoeing',
  CYCLING: 'Cycling',
  EQUESTRIAN: 'Equestrian',
  FENCING: 'Fencing',
  GOLF: 'Golf',
  GYMNASTICS: 'Gymnastics',
  HANDBALL: 'Handball',
  JUDO: 'Judo',
  KARATE: 'Karate',
  MMA: 'MMA',
  MODERN_PENTATHLON: 'Modern Pentathlon',
  PICKLEBALL: 'Pickleball',
  ROWING: 'Rowing',
  RUGBY_SEVENS: 'Rugby Sevens',
  SAILING: 'Sailing',
  SHOOTING: 'Shooting',
  SKATEBOARDING: 'Skateboarding',
  SPORT_CLIMBING: 'Sport Climbing',
  SURFING: 'Surfing',
  TAEKWONDO: 'Taekwondo',
  TRIATHLON: 'Triathlon',
  UFC: 'UFC',
  WEIGHTLIFTING: 'Weightlifting',
  WRESTLING: 'Wrestling',
  OTHER: 'Other',
};

export const PARTNER_TYPE_LABELS: Record<string, string> = {
  VENUE: 'Venue / Court',
  COACH: 'Coach / Trainer',
  ACADEMY: 'Academy',
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
