export type { UserRole, EntityStatus, SportType, PartnerType, OnboardingStatus, SurfaceType, SlotDuration, DayOfWeek } from '@/types/database';
export type { Venue, VenueSport, VenueWithSports, Academy, Trainer, Court, CourtWithVenue, VenueImage, OnboardingApplication, Database } from '@/types/database';

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
  activeVenues: number;
  activeAcademies: number;
  activeTrainers: number;
  activeCourts: number;
  pendingApprovals: number;
  recentlyAdded: RecentEntity[];
  onboarding: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
  };
}

export interface RecentEntity {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer';
  createdAt: string;
  status: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
