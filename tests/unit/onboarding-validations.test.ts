import { describe, it, expect } from 'vitest';
import {
  onboardingSchema,
  basicDetailsSchema,
  availabilitySchema,
  onboardingStatusUpdateSchema,
} from '@/lib/validations/onboarding';

const validBasicDetails = {
  partnerType: 'VENUE' as const,
  businessName: 'Test Venue',
  contactPerson: 'John Doe',
  phone: '9876543210',
  email: 'test@example.com',
  city: 'Delhi',
  fullAddress: '123 Test Street, Delhi',
  googleMapsLink: '',
};

const validFullApplication = {
  ...validBasicDetails,
  sportsOffered: ['CRICKET_NET' as const, 'BADMINTON' as const],
  experienceYears: 5,
  certifications: [],
  shortBio: 'A great venue',
  numberOfCourts: 4,
  surfaceType: 'SYNTHETIC' as const,
  facilities: ['Parking', 'Washroom'],
  sessionTypes: [],
  maxStudents: null,
  availableDays: ['MON' as const, 'TUE' as const, 'WED' as const],
  operatingHours: '6 AM - 10 PM',
  slotDuration: 'SIXTY_MINS' as const,
  pricePerSlot: 500,
  weekendPricingDiff: false,
  cancellationAllowed: true,
  acceptsCash: true,
  bankAccountName: 'Test Account',
  bankAccountNumber: '1234567890',
  ifscCode: 'SBIN0001234',
  gstNumber: '',
  idProofUrls: [],
  profilePhotoUrls: [],
  termsAccepted: true as const,
};

describe('Onboarding Validations', () => {
  describe('basicDetailsSchema', () => {
    it('validates correct basic details', () => {
      const result = basicDetailsSchema.safeParse(validBasicDetails);
      expect(result.success).toBe(true);
    });

    it('rejects missing partner type', () => {
      const result = basicDetailsSchema.safeParse({
        ...validBasicDetails,
        partnerType: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = basicDetailsSchema.safeParse({
        ...validBasicDetails,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short phone number', () => {
      const result = basicDetailsSchema.safeParse({
        ...validBasicDetails,
        phone: '123',
      });
      expect(result.success).toBe(false);
    });

    it('accepts all three partner types', () => {
      for (const type of ['VENUE', 'COACH', 'ACADEMY']) {
        const result = basicDetailsSchema.safeParse({
          ...validBasicDetails,
          partnerType: type,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('availabilitySchema', () => {
    it('validates correct availability', () => {
      const result = availabilitySchema.safeParse({
        availableDays: ['MON', 'WED', 'FRI'],
        operatingHours: '6 AM - 10 PM',
        slotDuration: 'SIXTY_MINS',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty available days', () => {
      const result = availabilitySchema.safeParse({
        availableDays: [],
        operatingHours: '6 AM - 10 PM',
        slotDuration: 'SIXTY_MINS',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid slot duration', () => {
      const result = availabilitySchema.safeParse({
        availableDays: ['MON'],
        operatingHours: '6 AM - 10 PM',
        slotDuration: 'TWO_HOURS',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('onboardingSchema (full)', () => {
    it('validates a complete application', () => {
      const result = onboardingSchema.safeParse(validFullApplication);
      expect(result.success).toBe(true);
    });

    it('rejects without terms accepted', () => {
      const result = onboardingSchema.safeParse({
        ...validFullApplication,
        termsAccepted: false,
      });
      expect(result.success).toBe(false);
    });

    it('rejects without sports offered', () => {
      const result = onboardingSchema.safeParse({
        ...validFullApplication,
        sportsOffered: [],
      });
      expect(result.success).toBe(false);
    });

    it('validates all sport types from the list', () => {
      const allSports = [
        'CRICKET_NET', 'BOX_CRICKET', 'FOOTBALL', 'BASKETBALL', 'PICKLEBALL',
        'TENNIS', 'BADMINTON', 'SWIMMING', 'HOCKEY', 'VOLLEYBALL',
        'TABLE_TENNIS', 'SNOOKER', 'ARCHERY', 'BOXING', 'GOLF',
        'SHOOTING', 'SKATEBOARDING', 'TAEKWONDO',
      ];
      const result = onboardingSchema.safeParse({
        ...validFullApplication,
        sportsOffered: allSports,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('onboardingStatusUpdateSchema', () => {
    it('validates approval', () => {
      const result = onboardingStatusUpdateSchema.safeParse({
        status: 'APPROVED',
      });
      expect(result.success).toBe(true);
    });

    it('validates rejection with reason', () => {
      const result = onboardingStatusUpdateSchema.safeParse({
        status: 'REJECTED',
        rejectionReason: 'Incomplete documents',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = onboardingStatusUpdateSchema.safeParse({
        status: 'INVALID_STATUS',
      });
      expect(result.success).toBe(false);
    });

    it('validates all four statuses', () => {
      for (const status of ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']) {
        const result = onboardingStatusUpdateSchema.safeParse({ status });
        expect(result.success).toBe(true);
      }
    });
  });
});
