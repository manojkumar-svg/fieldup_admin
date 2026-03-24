import { describe, it, expect } from 'vitest';
import {
  venueSchema,
  venueSportSchema,
  academySchema,
  trainerSchema,
  courtSchema,
  gymSchema,
  venueStatusSchema,
  academyStatusSchema,
  trainerStatusSchema,
  courtStatusSchema,
  gymStatusSchema,
} from '@/lib/validations/entities';

const validSport = {
  sportType: 'CRICKET_NET',
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
    sportsOffered: ['CRICKET_NET', 'FOOTBALL'],
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

  it('rejects invalid phone number (letters)', () => {
    const result = academySchema.safeParse({ ...validAcademy, contactPhone: 'abcdefghij' });
    expect(result.success).toBe(false);
  });

  it('rejects phone starting with low digits', () => {
    const result = academySchema.safeParse({ ...validAcademy, contactPhone: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('accepts +91 prefixed phone', () => {
    const result = academySchema.safeParse({ ...validAcademy, contactPhone: '+919876543210' });
    expect(result.success).toBe(true);
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

  it('rejects invalid phone number (letters)', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: 'abcdefghij' });
    expect(result.success).toBe(false);
  });

  it('rejects phone with less than 10 digits', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: '98765' });
    expect(result.success).toBe(false);
  });

  it('rejects phone starting with digits below 6', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('accepts phone with +91 prefix', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: '+919876543210' });
    expect(result.success).toBe(true);
  });

  it('accepts valid 10-digit Indian phone', () => {
    const result = trainerSchema.safeParse({ ...validTrainer, phone: '6234567890' });
    expect(result.success).toBe(true);
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

  it('court status accepts ACTIVE/INACTIVE', () => {
    expect(courtStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(courtStatusSchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });

  it('gym status accepts ACTIVE/INACTIVE', () => {
    expect(gymStatusSchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(gymStatusSchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });
});

describe('Court Validation Schema', () => {
  const validCourt = {
    venueId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Court 1',
    sportType: 'TENNIS',
    surfaceType: 'CLAY',
    indoor: false,
    pricePerHour: 500,
    maxPlayers: 4,
  };

  it('accepts valid court data', () => {
    const result = courtSchema.safeParse(validCourt);
    expect(result.success).toBe(true);
  });

  it('requires a name', () => {
    const result = courtSchema.safeParse({ ...validCourt, name: '' });
    expect(result.success).toBe(false);
  });

  it('requires a valid UUID for venueId', () => {
    const result = courtSchema.safeParse({ ...validCourt, venueId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('requires valid sport type', () => {
    const result = courtSchema.safeParse({ ...validCourt, sportType: 'RUGBY' });
    expect(result.success).toBe(false);
  });

  it('requires valid surface type', () => {
    const result = courtSchema.safeParse({ ...validCourt, surfaceType: 'GLASS' });
    expect(result.success).toBe(false);
  });

  it('requires price >= 0', () => {
    const result = courtSchema.safeParse({ ...validCourt, pricePerHour: -1 });
    expect(result.success).toBe(false);
  });

  it('requires maxPlayers >= 1', () => {
    const result = courtSchema.safeParse({ ...validCourt, maxPlayers: 0 });
    expect(result.success).toBe(false);
  });

  it('limits maxPlayers to 200', () => {
    const result = courtSchema.safeParse({ ...validCourt, maxPlayers: 201 });
    expect(result.success).toBe(false);
  });

  it('defaults images to empty array', () => {
    const result = courtSchema.safeParse(validCourt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.images).toEqual([]);
    }
  });

  it('accepts SWIMMING and BOXING as sport types', () => {
    const swimming = courtSchema.safeParse({ ...validCourt, sportType: 'SWIMMING' });
    expect(swimming.success).toBe(true);
    const boxing = courtSchema.safeParse({ ...validCourt, sportType: 'BOXING' });
    expect(boxing.success).toBe(true);
  });
});

describe('Gym Validation Schema', () => {
  const validGym = {
    name: 'FitZone Gym',
    address: '789 Gym Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    contactPhone: '9876543210',
  };

  it('accepts valid gym data', () => {
    const result = gymSchema.safeParse(validGym);
    expect(result.success).toBe(true);
  });

  it('requires a name', () => {
    const result = gymSchema.safeParse({ ...validGym, name: '' });
    expect(result.success).toBe(false);
  });

  it('requires an address', () => {
    const result = gymSchema.safeParse({ ...validGym, address: '' });
    expect(result.success).toBe(false);
  });

  it('validates pincode format (6 digits)', () => {
    const result = gymSchema.safeParse({ ...validGym, pincode: '1234' });
    expect(result.success).toBe(false);

    const valid = gymSchema.safeParse({ ...validGym, pincode: '123456' });
    expect(valid.success).toBe(true);
  });

  it('requires contact phone', () => {
    const result = gymSchema.safeParse({ ...validGym, contactPhone: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gym phone (letters)', () => {
    const result = gymSchema.safeParse({ ...validGym, contactPhone: 'call-us-now' });
    expect(result.success).toBe(false);
  });

  it('rejects gym phone starting with 0-5', () => {
    const result = gymSchema.safeParse({ ...validGym, contactPhone: '5234567890' });
    expect(result.success).toBe(false);
  });

  it('accepts +91 phone for gym', () => {
    const result = gymSchema.safeParse({ ...validGym, contactPhone: '+917654321098' });
    expect(result.success).toBe(true);
  });

  it('validates email format when provided', () => {
    const result = gymSchema.safeParse({ ...validGym, contactEmail: 'not-email' });
    expect(result.success).toBe(false);

    const valid = gymSchema.safeParse({ ...validGym, contactEmail: 'gym@example.com' });
    expect(valid.success).toBe(true);
  });

  it('validates website URL when provided', () => {
    const result = gymSchema.safeParse({ ...validGym, website: 'not-a-url' });
    expect(result.success).toBe(false);

    const valid = gymSchema.safeParse({ ...validGym, website: 'https://fitzone.com' });
    expect(valid.success).toBe(true);
  });

  it('validates time format for openTime/closeTime', () => {
    const result = gymSchema.safeParse({ ...validGym, openTime: 'invalid' });
    expect(result.success).toBe(false);

    const valid = gymSchema.safeParse({ ...validGym, openTime: '06:00', closeTime: '22:00' });
    expect(valid.success).toBe(true);
  });

  it('requires monthly fee >= 0', () => {
    const result = gymSchema.safeParse({ ...validGym, monthlyFee: -100 });
    expect(result.success).toBe(false);

    const valid = gymSchema.safeParse({ ...validGym, monthlyFee: 2000 });
    expect(valid.success).toBe(true);
  });

  it('defaults arrays to empty', () => {
    const result = gymSchema.safeParse(validGym);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amenities).toEqual([]);
      expect(result.data.images).toEqual([]);
      expect(result.data.documents).toEqual([]);
      expect(result.data.imageTitles).toEqual([]);
      expect(result.data.documentTitles).toEqual([]);
    }
  });

  it('allows optional description', () => {
    const result = gymSchema.safeParse({ ...validGym, description: '' });
    expect(result.success).toBe(true);

    const withDesc = gymSchema.safeParse({ ...validGym, description: 'A great gym' });
    expect(withDesc.success).toBe(true);
  });
});

describe('Trainer Schema — SWIMMING and BOXING specializations', () => {
  const baseTrainer = {
    name: 'Jane Doe',
    phone: '9876543210',
    experience: 3,
    hourlyRate: 800,
    city: 'Pune',
    state: 'Maharashtra',
  };

  it('accepts SWIMMING as sport specialization', () => {
    const result = trainerSchema.safeParse({ ...baseTrainer, sportSpecialization: 'SWIMMING' });
    expect(result.success).toBe(true);
  });

  it('accepts BOXING as sport specialization', () => {
    const result = trainerSchema.safeParse({ ...baseTrainer, sportSpecialization: 'BOXING' });
    expect(result.success).toBe(true);
  });

  it('defaults imageTitles and documentTitles to empty arrays', () => {
    const result = trainerSchema.safeParse({ ...baseTrainer, sportSpecialization: 'TENNIS' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageTitles).toEqual([]);
      expect(result.data.documentTitles).toEqual([]);
    }
  });

  it('accepts photo URL', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      sportSpecialization: 'TENNIS',
      photo: 'https://example.com/photo.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('allows empty photo', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      sportSpecialization: 'TENNIS',
      photo: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('Trainer Schema — Session Configuration', () => {
  const baseTrainer = {
    name: 'Coach Mike',
    phone: '9876543210',
    sportSpecialization: 'TENNIS',
    experience: 5,
    hourlyRate: 1000,
    city: 'Bangalore',
    state: 'Karnataka',
  };

  it('defaults cancellationAvailable to false', () => {
    const result = trainerSchema.safeParse(baseTrainer);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cancellationAvailable).toBe(false);
    }
  });

  it('accepts cancellationAvailable toggle', () => {
    const result = trainerSchema.safeParse({ ...baseTrainer, cancellationAvailable: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cancellationAvailable).toBe(true);
    }
  });

  it('defaults session type flags to false', () => {
    const result = trainerSchema.safeParse(baseTrainer);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kidsTraining).toBe(false);
      expect(result.data.groupSessions).toBe(false);
      expect(result.data.oneOnOneCoaching).toBe(false);
    }
  });

  it('accepts session type flags as true', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      kidsTraining: true,
      groupSessions: true,
      oneOnOneCoaching: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kidsTraining).toBe(true);
      expect(result.data.groupSessions).toBe(true);
      expect(result.data.oneOnOneCoaching).toBe(true);
    }
  });

  it('defaults sessionConfig to empty object', () => {
    const result = trainerSchema.safeParse(baseTrainer);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionConfig).toEqual({});
    }
  });

  it('accepts full sessionConfig with kids, group, and 1:1 details', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      kidsTraining: true,
      groupSessions: true,
      oneOnOneCoaching: true,
      sessionConfig: {
        kids: { timings: 'Mon-Fri 4PM-6PM', fee: 500, maxCapacity: 20, ageMin: 5, ageMax: 15 },
        group: { timings: 'Sat-Sun 8AM-10AM', fee: 300, maxCapacity: 30, ageMin: 10, ageMax: 60 },
        oneOnOne: { timings: 'By appointment', fee: 1500, maxCapacity: 1 },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionConfig?.kids?.fee).toBe(500);
      expect(result.data.sessionConfig?.group?.maxCapacity).toBe(30);
      expect(result.data.sessionConfig?.oneOnOne?.fee).toBe(1500);
    }
  });

  it('rejects negative session fee', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      sessionConfig: {
        kids: { timings: 'Mon-Fri', fee: -100, maxCapacity: 10 },
      },
    });
    expect(result.success).toBe(false);
  });

  it('accepts address and pincode for trainer location', () => {
    const result = trainerSchema.safeParse({
      ...baseTrainer,
      address: '123 Main Street',
      pincode: '560001',
      latitude: 12.97,
      longitude: 77.59,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.address).toBe('123 Main Street');
      expect(result.data.latitude).toBe(12.97);
    }
  });
});

describe('Court Schema — Cancellation', () => {
  const validCourt = {
    venueId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Court 1',
    sportType: 'TENNIS',
    surfaceType: 'CLAY',
    indoor: false,
    pricePerHour: 500,
    maxPlayers: 4,
  };

  it('defaults cancellationAvailable to false', () => {
    const result = courtSchema.safeParse(validCourt);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cancellationAvailable).toBe(false);
    }
  });

  it('accepts cancellationAvailable as true', () => {
    const result = courtSchema.safeParse({ ...validCourt, cancellationAvailable: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cancellationAvailable).toBe(true);
    }
  });
});

describe('Venue Schema — Courts within Sports', () => {
  const validVenue = {
    name: 'Test Venue',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    sports: [{
      sportType: 'CRICKET_NET',
      numberOfCourts: 2,
      pricePerHour: 500,
      openTime: '06:00',
      closeTime: '22:00',
      availableDays: ['MON', 'TUE', 'WED'],
    }],
  };

  it('defaults sport courts to empty array', () => {
    const result = venueSchema.safeParse(validVenue);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sports[0].courts).toEqual([]);
    }
  });

  it('accepts courts within a sport', () => {
    const result = venueSchema.safeParse({
      ...validVenue,
      sports: [{
        ...validVenue.sports[0],
        courts: [{
          name: 'Court A',
          surfaceType: 'CLAY',
          indoor: false,
        }],
      }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sports[0].courts).toHaveLength(1);
      expect(result.data.sports[0].courts![0].name).toBe('Court A');
    }
  });

  it('rejects sport courts with invalid surface type', () => {
    const result = venueSchema.safeParse({
      ...validVenue,
      sports: [{
        ...validVenue.sports[0],
        courts: [{
          name: 'Court A',
          surfaceType: 'GLASS',
          indoor: false,
        }],
      }],
    });
    expect(result.success).toBe(false);
  });
});
