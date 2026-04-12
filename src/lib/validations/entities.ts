import { z } from 'zod';

// Indian phone: 10 digits starting with 6-9, optionally prefixed with +91 or 0, allows spaces/dashes
const phoneRegex = /^(?:(?:\+91|0)[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;
const phoneValidation = z.string()
  .min(10, 'Phone must be at least 10 digits')
  .max(15, 'Phone is too long')
  .regex(phoneRegex, 'Enter a valid Indian phone number (e.g. 9876543210 or +91 9876543210)');

const optionalPhoneValidation = z.string()
  .max(15)
  .regex(phoneRegex, 'Enter a valid phone number (e.g. 9876543210)')
  .optional()
  .or(z.literal(''));

const sportTypeEnum = z.enum([
  'CRICKET_NET', 'BOX_CRICKET', 'FOOTBALL', 'BASKETBALL', 'PICKLEBALL',
  'TENNIS', 'BADMINTON', 'SWIMMING', 'HOCKEY', 'VOLLEYBALL',
  'TABLE_TENNIS', 'SNOOKER', 'ARCHERY', 'BOXING', 'GOLF',
  'SHOOTING', 'SKATEBOARDING', 'TAEKWONDO',
]);

const entityStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

const dayOfWeekEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

const surfaceTypeEnum = z.enum(['SYNTHETIC', 'WOODEN', 'CLAY', 'TURF', 'CONCRETE']);

export const venueSportCourtSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  surfaceType: surfaceTypeEnum,
  indoor: z.boolean().default(false),
});

export const venueSportSchema = z.object({
  sportType: sportTypeEnum,
  numberOfCourts: z.coerce.number().int().min(1, 'At least 1 required').max(100),
  pricePerHour: z.coerce.number().min(0, 'Price must be non-negative'),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  availableDays: z.array(dayOfWeekEnum).min(1, 'Select at least one day'),
  rules: z.string().max(5000, 'Rules too long').optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
  courts: z.array(venueSportCourtSchema).optional().default([]),
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
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  contactPhone: optionalPhoneValidation,
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
  contactPhone: phoneValidation,
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  establishedYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
});

export const academyStatusSchema = z.object({
  status: entityStatusEnum,
});

export type AcademyInput = z.infer<typeof academySchema>;
export type AcademyStatusInput = z.infer<typeof academyStatusSchema>;

const sessionDetailSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  days: z.array(dayOfWeekEnum).optional().default([]),
  fee: z.coerce.number().min(0, 'Fee must be non-negative').optional().default(0),
  maxCapacity: z.coerce.number().int().min(1).max(500).optional().default(1),
  ageMin: z.coerce.number().int().min(1).max(100).optional().nullable(),
  ageMax: z.coerce.number().int().min(1).max(100).optional().nullable(),
});

const sessionConfigSchema = z.object({
  kids: sessionDetailSchema.optional(),
  group: sessionDetailSchema.optional(),
  oneOnOne: sessionDetailSchema.optional(),
});

export const trainerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: phoneValidation,
  sportSpecialization: sportTypeEnum,
  experience: z.coerce.number().int().min(0, 'Experience must be non-negative').max(60),
  certifications: z.array(z.string()).optional().default([]),
  hourlyRate: z.coerce.number().min(0, 'Rate must be non-negative'),
  bio: z.string().max(2000, 'Bio is too long').optional().or(z.literal('')),
  photo: z.string().url('Invalid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  cancellationAvailable: z.boolean().optional().default(false),
  kidsTraining: z.boolean().optional().default(false),
  groupSessions: z.boolean().optional().default(false),
  oneOnOneCoaching: z.boolean().optional().default(false),
  sessionConfig: sessionConfigSchema.optional().default({}),
});

export const trainerStatusSchema = z.object({
  status: entityStatusEnum,
});

export type TrainerInput = z.infer<typeof trainerSchema>;
export type TrainerStatusInput = z.infer<typeof trainerStatusSchema>;

// ---- Courts ----

export const courtSchema = z.object({
  venueId: z.string().uuid('Invalid venue'),
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  sportType: sportTypeEnum,
  surfaceType: surfaceTypeEnum,
  indoor: z.boolean().default(false),
  pricePerHour: z.coerce.number().min(0, 'Price must be non-negative'),
  maxPlayers: z.coerce.number().int().min(1, 'At least 1 player').max(200, 'Maximum 200 players'),
  images: z.array(z.string()).optional().default([]),
  cancellationAvailable: z.boolean().optional().default(false),
});

export const courtStatusSchema = z.object({
  status: entityStatusEnum,
});

export type CourtInput = z.infer<typeof courtSchema>;
export type CourtStatusInput = z.infer<typeof courtStatusSchema>;

// ---- Gyms ----

export const gymSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  contactPhone: phoneValidation,
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  monthlyFee: z.coerce.number().min(0, 'Fee must be non-negative').optional().nullable(),
});

export const gymStatusSchema = z.object({
  status: entityStatusEnum,
});

export type GymInput = z.infer<typeof gymSchema>;
export type GymStatusInput = z.infer<typeof gymStatusSchema>;

// ---- Yoga Studios ----

export const yogaStudioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  contactPhone: phoneValidation,
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  monthlyFee: z.coerce.number().min(0, 'Fee must be non-negative').optional().nullable(),
});

export const yogaStudioStatusSchema = z.object({
  status: entityStatusEnum,
});

export type YogaStudioInput = z.infer<typeof yogaStudioSchema>;

// ---- Zumba Studios ----

export const zumbaStudioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  contactPhone: phoneValidation,
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  imageTitles: z.array(z.string()).optional().default([]),
  documentTitles: z.array(z.string()).optional().default([]),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').optional().or(z.literal('')),
  monthlyFee: z.coerce.number().min(0, 'Fee must be non-negative').optional().nullable(),
});

export const zumbaStudioStatusSchema = z.object({
  status: entityStatusEnum,
});

export type ZumbaStudioInput = z.infer<typeof zumbaStudioSchema>;
