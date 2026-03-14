import { describe, it, expect } from 'vitest';
import {
  venueSchema,
  venueSportSchema,
  academySchema,
  trainerSchema,
  venueStatusSchema,
  academyStatusSchema,
  trainerStatusSchema,
} from '@/lib/validations/entities';

const validSport = {
  sportType: 'CRICKET',
  numberOfCourts: 2,
  pricePerHour: 500,
  openTime: '06:00',
  closeTime: '22:00',
  availableDays: ['MON', 'TUE', 'WED'],
  rules: '',
  amenities: [],
};

describe('Venue Validation Schema', () => {
  const validVenue = {
    name: 'Test Venue',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    sports: [validSport],
  };

  it('accepts valid venue data', () => {
    const result = venueSchema.safeParse(validVenue);
    expect(result.success).toBe(true);
  });

  it('requires a name', () => {
    const result = venueSchema.safeParse({ ...validVenue, name: '' });
    expect(result.success).toBe(false);
  });

  it('validates pincode format (6 digits)', () => {
    const result = venueSchema.safeParse({ ...validVenue, pincode: '1234' });
    expect(result.success).toBe(false);

    const valid = venueSchema.safeParse({ ...validVenue, pincode: '123456' });
    expect(valid.success).toBe(true);
  });

  it('requires at least one sport', () => {
    const result = venueSchema.safeParse({ ...validVenue, sports: [] });
    expect(result.success).toBe(false);
  });

  it('allows optional description', () => {
    const result = venueSchema.safeParse({ ...validVenue, description: '' });
    expect(result.success).toBe(true);

    const withDesc = venueSchema.safeParse({ ...validVenue, description: 'A nice venue' });
    expect(withDesc.success).toBe(true);
  });

  it('allows optional latitude and longitude', () => {
    const result = venueSchema.safeParse({ ...validVenue, latitude: 19.076, longitude: 72.877 });
    expect(result.success).toBe(true);
  });

  it('validates latitude range', () => {
    const result = venueSchema.safeParse({ ...validVenue, latitude: 91 });
    expect(result.success).toBe(false);
  });

  it('defaults amenities to empty array', () => {
    const result = venueSchema.safeParse(validVenue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amenities).toEqual([]);
    }
  });
});

describe('VenueSport Validation Schema', () => {
  it('accepts valid sport data', () => {
    const result = venueSportSchema.safeParse(validSport);
    expect(result.success).toBe(true);
  });

  it('requires a valid sport type', () => {
    const result = venueSportSchema.safeParse({ ...validSport, sportType: 'RUGBY' });
    expect(result.success).toBe(false);
  });

  it('requires numberOfCourts >= 1', () => {
    const result = venueSportSchema.safeParse({ ...validSport, numberOfCourts: 0 });
    expect(result.success).toBe(false);
  });

  it('requires price >= 0', () => {
    const result = venueSportSchema.safeParse({ ...validSport, pricePerHour: -1 });
    expect(result.success).toBe(false);
  });

  it('validates time format HH:MM', () => {
    const result = venueSportSchema.safeParse({ ...validSport, openTime: 'invalid' });
    expect(result.success).toBe(false);

    const valid = venueSportSchema.safeParse({ ...validSport, openTime: '06:30' });
    expect(valid.success).toBe(true);
  });

  it('requires at least one available day', () => {
    const result = venueSportSchema.safeParse({ ...validSport, availableDays: [] });
    expect(result.success).toBe(false);
  });
});

describe('Academy Validation Schema', () => {
  const validAcademy = {
    name: 'Test Academy',
    sportsOffered: ['CRICKET', 'FOOTBALL'],
    address: '456 Academy Lane',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    contactPhone: '9876543210',
  };

  it('accepts valid academy data', () => {
    const result = academySchema.safeParse(validAcademy);
    expect(result.success).toBe(true);
  });

  it('requires at least one sport', () => {
    const result = academySchema.safeParse({ ...validAcademy, sportsOffered: [] });
    expect(result.success).toBe(false);
  });

  it('validates sport type values', () => {
    const result = academySchema.safeParse({ ...validAcademy, sportsOffered: ['INVALID'] });
    expect(result.success).toBe(false);
  });

  it('requires name', () => {
    const result = academySchema.safeParse({ ...validAcademy, name: '' });
    expect(result.success).toBe(false);
  });

  it('requires contact phone', () => {
    const result = academySchema.safeParse({ ...validAcademy, contactPhone: '' });
    expect(result.success).toBe(false);
  });

  it('validates email format when provided', () => {
    const result = academySchema.safeParse({ ...validAcademy, contactEmail: 'not-email' });
    expect(result.success).toBe(false);

    const valid = academySchema.safeParse({ ...validAcademy, contactEmail: 'test@example.com' });
    expect(valid.success).toBe(true);
  });

  it('validates website URL when provided', () => {
    const result = academySchema.safeParse({ ...validAcademy, website: 'not-a-url' });
    expect(result.success).toBe(false);

    const valid = academySchema.safeParse({ ...validAcademy, website: 'https://example.com' });
    expect(valid.success).toBe(true);
  });

  it('validates established year range', () => {
    const result = academySchema.safeParse({ ...validAcademy, establishedYear: 1899 });
    expect(result.success).toBe(false);

    const currentYear = new Date().getFullYear();
    const future = academySchema.safeParse({ ...validAcademy, establishedYear: currentYear + 1 });
    expect(future.success).toBe(false);

    const valid = academySchema.safeParse({ ...validAcademy, establishedYear: 2020 });
    expect(valid.success).toBe(true);
  });
});

describe('Trainer Validation Schema', () => {
  const validTrainer = {
    name: 'John Doe',
    phone: '9876543210',
    sportSpecialization: 'TENNIS',
    experience: 5,
    hourlyRate: 1000,
    city: 'Bangalore',
    state: 'Karnataka',
  };

  it('accepts valid trainer data', () => {
    const result = trainerSchema.safeParse(validTrainer);
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, name: '' });
    expect(result.success).toBe(false);
  });

  it('requires phone', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: '' });
    expect(result.success).toBe(false);
  });

  it('requires valid sport specialization', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, sportSpecialization: 'RUGBY' });
    expect(result.success).toBe(false);
  });

  it('requires experience >= 0', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, experience: -1 });
    expect(result.success).toBe(false);
  });

  it('limits experience to 60 years', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, experience: 61 });
    expect(result.success).toBe(false);
  });

  it('requires hourly rate >= 0', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, hourlyRate: -50 });
    expect(result.success).toBe(false);
  });

  it('allows optional email', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, email: '' });
    expect(result.success).toBe(true);

    const withEmail = trainerSchema.safeParse({ ...validTrainer, email: 'john@example.com' });
    expect(withEmail.success).toBe(true);
  });

  it('validates email format when provided', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('defaults certifications to empty array', () => {
    const result = trainerSchema.safeParse(validTrainer);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certifications).toEqual([]);
    }
  });

  it('accepts certifications', () => {
    const result = trainerSchema.safeParse({
      ...validTrainer,
      certifications: ['Level 1 Coach', 'First Aid'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certifications).toEqual(['Level 1 Coach', 'First Aid']);
    }
  });
});

describe('Status Schemas', () => {
  it('venue status accepts ACTIVE', () => {
    expect(venueStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
  });

  it('venue status accepts INACTIVE', () => {
    expect(venueStatusSchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });

  it('venue status rejects invalid values', () => {
    expect(venueStatusSchema.safeParse({ status: 'UNKNOWN' }).success).toBe(false);
  });

  it('academy status accepts ACTIVE/INACTIVE', () => {
    expect(academyStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(academyStatusSchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });

  it('trainer status accepts ACTIVE/INACTIVE', () => {
    expect(trainerStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(trainerStatusSchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });
});
