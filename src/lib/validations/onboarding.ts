import { z } from 'zod';

const partnerTypeEnum = z.enum(['VENUE', 'COACH', 'ACADEMY']);

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

const surfaceTypeEnum = z.enum(['SYNTHETIC', 'WOODEN', 'CLAY', 'TURF', 'CONCRETE']);
const slotDurationEnum = z.enum(['THIRTY_MINS', 'SIXTY_MINS', 'NINETY_MINS']);
const dayOfWeekEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
const onboardingStatusEnum = z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']);

// Section 1: Basic Details
const basicDetailsSchema = z.object({
  partnerType: partnerTypeEnum,
  businessName: z.string().min(1, 'Business/Individual name is required').max(200),
  contactPerson: z.string().min(1, 'Contact person is required').max(200),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  email: z.string().email('Valid email is required'),
  city: z.string().min(1, 'City is required').max(100),
  fullAddress: z.string().min(1, 'Full address is required').max(1000),
  googleMapsLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

// Section 2: Sports & Services
const sportsServicesSchema = z.object({
  sportsOffered: z.array(sportTypeEnum).min(1, 'Select at least one sport'),
  experienceYears: z.coerce.number().int().min(0).max(60).optional().nullable(),
  certifications: z.array(z.string()).optional().default([]),
  shortBio: z.string().max(2000).optional().or(z.literal('')),
});

// Section 3: Facility Details (for venues)
const facilityDetailsSchema = z.object({
  numberOfCourts: z.coerce.number().int().min(1).optional().nullable(),
  surfaceType: surfaceTypeEnum.optional().nullable(),
  facilities: z.array(z.string()).optional().default([]),
});

// Section 3: Training Details (for coaches)
const trainingDetailsSchema = z.object({
  sessionTypes: z.array(z.string()).optional().default([]),
  maxStudents: z.coerce.number().int().min(1).max(200).optional().nullable(),
});

// Section 4: Availability
const availabilitySchema = z.object({
  availableDays: z.array(dayOfWeekEnum).min(1, 'Select at least one day'),
  operatingHours: z.string().min(1, 'Operating hours are required').max(100),
  slotDuration: slotDurationEnum,
});

// Section 5: Pricing
const pricingSchema = z.object({
  pricePerSlot: z.coerce.number().min(0, 'Price must be non-negative'),
  weekendPricingDiff: z.boolean().default(false),
  cancellationAllowed: z.boolean().default(false),
});

// Section 6: Payment & Legal
const paymentLegalSchema = z.object({
  acceptsCash: z.boolean().default(false),
  bankAccountName: z.string().max(200).optional().or(z.literal('')),
  bankAccountNumber: z.string().max(30).optional().or(z.literal('')),
  ifscCode: z.string().max(20).optional().or(z.literal('')),
  gstNumber: z.string().max(20).optional().or(z.literal('')),
  idProofUrls: z.array(z.string()).optional().default([]),
  profilePhotoUrls: z.array(z.string()).optional().default([]),
});

// Section 7: Agreement
const agreementSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to proceed' }),
  }),
});

// Full onboarding form schema
export const onboardingSchema = basicDetailsSchema
  .merge(sportsServicesSchema)
  .merge(facilityDetailsSchema)
  .merge(trainingDetailsSchema)
  .merge(availabilitySchema)
  .merge(pricingSchema)
  .merge(paymentLegalSchema)
  .merge(agreementSchema);

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// Admin status update schema
export const onboardingStatusUpdateSchema = z.object({
  status: onboardingStatusEnum,
  rejectionReason: z.string().max(1000).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type OnboardingStatusUpdate = z.infer<typeof onboardingStatusUpdateSchema>;

// Re-export individual section schemas for step-by-step validation
export {
  basicDetailsSchema,
  sportsServicesSchema,
  facilityDetailsSchema,
  trainingDetailsSchema,
  availabilitySchema,
  pricingSchema,
  paymentLegalSchema,
  agreementSchema,
};
