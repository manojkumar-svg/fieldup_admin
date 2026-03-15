import { z } from 'zod';

const sportTypeEnum = z.enum([
  'CRICKET', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'BADMINTON',
  'SWIMMING', 'HOCKEY', 'VOLLEYBALL', 'TABLE_TENNIS', 'SQUASH',
  'AQUATICS', 'ARCHERY', 'ATHLETICS', 'BEACH_VOLLEYBALL', 'BOXING',
  'BREAKING', 'CANOEING', 'CYCLING', 'EQUESTRIAN', 'FENCING',
  'GOLF', 'GYMNASTICS', 'HANDBALL', 'JUDO', 'KARATE', 'MMA',
  'MODERN_PENTATHLON', 'PICKLEBALL', 'ROWING', 'RUGBY_SEVENS',
  'SAILING', 'SHOOTING', 'SKATEBOARDING', 'SPORT_CLIMBING', 'SURFING',
  'TAEKWONDO', 'TRIATHLON', 'UFC', 'WEIGHTLIFTING', 'WRESTLING', 'OTHER',
]);

const entityStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

const dayOfWeekEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

export const venueSportSchema = z.object({
  sportType: sportTypeEnum,
  numberOfCourts: z.coerce.number().int().min(1, 'At least 1 court').max(100),
  pricePerHour: z.coerce.number().min(0, 'Price must be non-negative'),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  availableDays: z.array(dayOfWeekEnum).min(1, 'Select at least one day'),
  rules: z.string().max(5000, 'Rules too long').optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
});

export const venueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  contactPhone: z.string().max(20).optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  sports: z.array(venueSportSchema).min(1, 'Add at least one sport'),
});

export const venueStatusSchema = z.object({
  status: entityStatusEnum,
});

export type VenueSportInput = z.infer<typeof venueSportSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type VenueStatusInput = z.infer<typeof venueStatusSchema>;

export const academySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  sportsOffered: z.array(sportTypeEnum).min(1, 'Select at least one sport'),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  contactPhone: z.string().min(1, 'Contact phone is required').max(20),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  establishedYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
});

export const academyStatusSchema = z.object({
  status: entityStatusEnum,
});

export type AcademyInput = z.infer<typeof academySchema>;
export type AcademyStatusInput = z.infer<typeof academyStatusSchema>;

export const trainerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required').max(20),
  sportSpecialization: sportTypeEnum,
  experience: z.coerce.number().int().min(0, 'Experience must be non-negative').max(60),
  certifications: z.array(z.string()).optional().default([]),
  hourlyRate: z.coerce.number().min(0, 'Rate must be non-negative'),
  bio: z.string().max(2000, 'Bio is too long').optional().or(z.literal('')),
  photo: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
});

export const trainerStatusSchema = z.object({
  status: entityStatusEnum,
});

export type TrainerInput = z.infer<typeof trainerSchema>;
export type TrainerStatusInput = z.infer<typeof trainerStatusSchema>;

// ---- Courts ----

const surfaceTypeEnum = z.enum(['SYNTHETIC', 'WOODEN', 'CLAY', 'TURF', 'CONCRETE']);

export const courtSchema = z.object({
  venueId: z.string().uuid('Invalid venue'),
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  sportType: sportTypeEnum,
  surfaceType: surfaceTypeEnum,
  indoor: z.boolean().default(false),
  pricePerHour: z.coerce.number().min(0, 'Price must be non-negative'),
  maxPlayers: z.coerce.number().int().min(1, 'At least 1 player').max(200, 'Maximum 200 players'),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
});

export const courtStatusSchema = z.object({
  status: entityStatusEnum,
});

export type CourtInput = z.infer<typeof courtSchema>;
export type CourtStatusInput = z.infer<typeof courtStatusSchema>;
