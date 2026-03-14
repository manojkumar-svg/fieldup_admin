export type SportType =
  | 'CRICKET' | 'FOOTBALL' | 'BASKETBALL' | 'TENNIS' | 'BADMINTON'
  | 'SWIMMING' | 'HOCKEY' | 'VOLLEYBALL' | 'TABLE_TENNIS' | 'SQUASH'
  | 'AQUATICS' | 'ARCHERY' | 'ATHLETICS' | 'BEACH_VOLLEYBALL' | 'BOXING'
  | 'BREAKING' | 'CANOEING' | 'CYCLING' | 'EQUESTRIAN' | 'FENCING'
  | 'GOLF' | 'GYMNASTICS' | 'HANDBALL' | 'JUDO' | 'KARATE' | 'MMA'
  | 'MODERN_PENTATHLON' | 'PICKLEBALL' | 'ROWING' | 'RUGBY_SEVENS'
  | 'SAILING' | 'SHOOTING' | 'SKATEBOARDING' | 'SPORT_CLIMBING' | 'SURFING'
  | 'TAEKWONDO' | 'TRIATHLON' | 'UFC' | 'WEIGHTLIFTING' | 'WRESTLING' | 'OTHER';

export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type UserRole = 'SUPER_ADMIN' | 'OPERATIONS_MANAGER';
export type PartnerType = 'VENUE' | 'COACH' | 'ACADEMY';
export type OnboardingStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type SurfaceType = 'SYNTHETIC' | 'WOODEN' | 'CLAY' | 'TURF' | 'CONCRETE';
export type SlotDuration = 'THIRTY_MINS' | 'SIXTY_MINS' | 'NINETY_MINS';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  images: string[];
  documents: string[];
  contactPhone: string | null;
  contactEmail: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VenueSport {
  id: string;
  venueId: string;
  sportType: SportType;
  numberOfCourts: number;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  availableDays: DayOfWeek[];
  rules: string | null;
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VenueWithSports extends Venue {
  venue_sports: VenueSport[];
}

export interface Academy {
  id: string;
  name: string;
  description: string | null;
  sportsOffered: SportType[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  contactEmail: string | null;
  website: string | null;
  images: string[];
  establishedYear: number | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  sportSpecialization: SportType;
  experience: number;
  certifications: string[];
  hourlyRate: number;
  bio: string | null;
  photo: string | null;
  city: string;
  state: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  id: string;
  venueId: string;
  name: string;
  sportType: SportType;
  surfaceType: SurfaceType;
  indoor: boolean;
  pricePerHour: number;
  maxPlayers: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourtWithVenue extends Court {
  venues: { id: string; name: string; city: string } | null;
}

export interface VenueImage {
  id: string;
  venueId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface OnboardingApplication {
  id: string;
  status: OnboardingStatus;
  partnerType: PartnerType;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  fullAddress: string;
  googleMapsLink: string | null;
  sportsOffered: SportType[];
  experienceYears: number | null;
  certifications: string[];
  shortBio: string | null;
  numberOfCourts: number | null;
  surfaceType: SurfaceType | null;
  facilities: string[];
  sessionTypes: string[];
  maxStudents: number | null;
  availableDays: DayOfWeek[];
  operatingHours: string | null;
  slotDuration: SlotDuration | null;
  pricePerSlot: number | null;
  weekendPricingDiff: boolean;
  cancellationAllowed: boolean;
  acceptsCash: boolean;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  gstNumber: string | null;
  idProofUrls: string[];
  profilePhotoUrls: string[];
  termsAccepted: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AcademyTrainerRow {
  id: string;
  academyId: string;
  trainerId: string;
  joinedAt: string;
}

// Supabase Database type - column names match the actual PostgreSQL column names
// from the Prisma migrations (camelCase columns, snake_case table names)
export interface Database {
  public: {
    Tables: {
      venues: {
        Row: Venue;
        Insert: Partial<Venue>;
        Update: Partial<Venue>;
      };
      venue_sports: {
        Row: VenueSport;
        Insert: Partial<VenueSport>;
        Update: Partial<VenueSport>;
      };
      academies: {
        Row: Academy;
        Insert: Partial<Academy>;
        Update: Partial<Academy>;
      };
      trainers: {
        Row: Trainer;
        Insert: Partial<Trainer>;
        Update: Partial<Trainer>;
      };
      onboarding_applications: {
        Row: OnboardingApplication;
        Insert: Partial<OnboardingApplication>;
        Update: Partial<OnboardingApplication>;
      };
      users: {
        Row: UserRow;
        Insert: Partial<UserRow>;
        Update: Partial<UserRow>;
      };
      academy_trainers: {
        Row: AcademyTrainerRow;
        Insert: Partial<AcademyTrainerRow>;
        Update: Partial<AcademyTrainerRow>;
      };
      courts: {
        Row: Court;
        Insert: Partial<Court>;
        Update: Partial<Court>;
      };
      venue_images: {
        Row: VenueImage;
        Insert: Partial<VenueImage>;
        Update: Partial<VenueImage>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      SportType: SportType;
      EntityStatus: EntityStatus;
      UserRole: UserRole;
      PartnerType: PartnerType;
      OnboardingStatus: OnboardingStatus;
      SurfaceType: SurfaceType;
      SlotDuration: SlotDuration;
      DayOfWeek: DayOfWeek;
    };
  };
}
