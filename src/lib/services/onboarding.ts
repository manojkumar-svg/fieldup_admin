import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { OnboardingApplication, OnboardingStatus, PartnerType } from '@/types/database';
import type { OnboardingInput, OnboardingStatusUpdate } from '@/lib/validations/onboarding';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface OnboardingListParams {
  search?: string;
  status?: OnboardingStatus;
  partnerType?: PartnerType;
  city?: string;
  page?: number;
  limit?: number;
}

export async function listOnboardingApplications(params: OnboardingListParams): Promise<{
  applications: OnboardingApplication[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('onboarding_applications').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `businessName.ilike.%${params.search}%,contactPerson.ilike.%${params.search}%,email.ilike.%${params.search}%,city.ilike.%${params.search}%`
    );
  }
  if (params.status) query = query.eq('status', params.status);
  if (params.partnerType) query = query.eq('partnerType', params.partnerType);
  if (params.city) query = query.ilike('city', `%${params.city}%`);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    applications: (data ?? []) as OnboardingApplication[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOnboardingById(id: string): Promise<OnboardingApplication | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('onboarding_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as OnboardingApplication;
}

export async function createOnboardingApplication(data: OnboardingInput): Promise<OnboardingApplication> {
  const supabase = createServerSupabaseClient();
  const { data: application, error } = await supabase
    .from('onboarding_applications')
    .insert({
      partnerType: data.partnerType,
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      city: data.city,
      fullAddress: data.fullAddress,
      googleMapsLink: data.googleMapsLink || null,
      sportsOffered: data.sportsOffered,
      experienceYears: data.experienceYears ?? null,
      certifications: data.certifications ?? [],
      shortBio: data.shortBio || null,
      numberOfCourts: data.numberOfCourts ?? null,
      surfaceType: data.surfaceType ?? null,
      facilities: data.facilities ?? [],
      sessionTypes: data.sessionTypes ?? [],
      maxStudents: data.maxStudents ?? null,
      availableDays: data.availableDays,
      operatingHours: data.operatingHours,
      slotDuration: data.slotDuration,
      pricePerSlot: data.pricePerSlot ?? null,
      weekendPricingDiff: data.weekendPricingDiff ?? false,
      cancellationAllowed: data.cancellationAllowed ?? false,
      acceptsCash: data.acceptsCash ?? false,
      bankAccountName: data.bankAccountName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      ifscCode: data.ifscCode || null,
      gstNumber: data.gstNumber || null,
      idProofUrls: data.idProofUrls ?? [],
      profilePhotoUrls: data.profilePhotoUrls ?? [],
      termsAccepted: data.termsAccepted,
      status: 'PENDING' as OnboardingStatus,
    })
    .select()
    .single();

  if (error) throw error;
  return application as OnboardingApplication;
}

export async function updateOnboardingStatus(
  id: string,
  data: OnboardingStatusUpdate,
  reviewedBy: string
): Promise<OnboardingApplication> {
  const supabase = createServerSupabaseClient();
  const { data: application, error } = await supabase
    .from('onboarding_applications')
    .update({
      status: data.status,
      rejectionReason: data.rejectionReason || null,
      notes: data.notes || null,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return application as OnboardingApplication;
}

export async function getOnboardingStats(): Promise<{
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
}> {
  const supabase = createServerSupabaseClient();

  const { count: total } = await supabase
    .from('onboarding_applications')
    .select('*', { count: 'exact', head: true });

  const { count: pending } = await supabase
    .from('onboarding_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  const { count: underReview } = await supabase
    .from('onboarding_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'UNDER_REVIEW');

  const { count: approved } = await supabase
    .from('onboarding_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'APPROVED');

  const { count: rejected } = await supabase
    .from('onboarding_applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REJECTED');

  return {
    total: total ?? 0,
    pending: pending ?? 0,
    underReview: underReview ?? 0,
    approved: approved ?? 0,
    rejected: rejected ?? 0,
  };
}
