export type { UserRole, EntityStatus, SportType, PartnerType, OnboardingStatus, SurfaceType, SlotDuration, DayOfWeek } from '@/types/database';
export type { Venue, VenueSport, VenueWithSports, Academy, Trainer, Court, CourtWithVenue, Gym, YogaStudio, ZumbaStudio, VenueImage, OnboardingApplication, Database } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalVenues: number;
  totalAcademies: number;
  totalTrainers: number;
  totalCourts: number;
  totalGyms: number;
  totalYogaStudios: number;
  totalZumbaStudios: number;
  activeVenues: number;
  activeAcademies: number;
  activeTrainers: number;
  activeCourts: number;
  activeGyms: number;
  activeYogaStudios: number;
  activeZumbaStudios: number;
  pendingApprovals: number;
  recentlyAdded: RecentEntity[];
  incompleteProfiles: IncompleteProfile[];
  onboarding: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
}

export interface IncompleteProfile {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer' | 'Gym' | 'Yoga Studio' | 'Zumba Studio';
  missingFields: string[];
}

export interface RecentEntity {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer' | 'Gym' | 'Yoga Studio' | 'Zumba Studio';
  createdAt: string;
  status: string;
  photo?: string | null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
