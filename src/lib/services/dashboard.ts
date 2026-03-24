import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardStats, RecentEntity, IncompleteProfile } from '@/types';
import { getOnboardingStats } from '@/lib/services/onboarding';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  const [
    { count: totalVenues },
    { count: totalAcademies },
    { count: totalTrainers },
    { count: totalCourts },
    { count: totalGyms },
    { count: totalYogaStudios },
    { count: totalZumbaStudios },
    { count: activeVenues },
    { count: activeAcademies },
    { count: activeTrainers },
    { count: activeCourts },
    { count: activeGyms },
    { count: activeYogaStudios },
    { count: activeZumbaStudios },
  ] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('academies').select('*', { count: 'exact', head: true }),
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('courts').select('*', { count: 'exact', head: true }),
    supabase.from('gyms').select('*', { count: 'exact', head: true }),
    supabase.from('yoga_studios').select('*', { count: 'exact', head: true }),
    supabase.from('zumba_studios').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('academies').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('trainers').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('courts').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('gyms').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('yoga_studios').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('zumba_studios').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
  ]);

  const [
    { data: recentVenues },
    { data: recentAcademies },
    { data: recentTrainers },
    { data: recentGyms },
    { data: recentYogaStudios },
    { data: recentZumbaStudios },
  ] = await Promise.all([
    supabase.from('venues')
      .select('id, name, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
    supabase.from('academies')
      .select('id, name, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
    supabase.from('trainers')
      .select('id, name, photo, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
    supabase.from('gyms')
      .select('id, name, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
    supabase.from('yoga_studios')
      .select('id, name, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
    supabase.from('zumba_studios')
      .select('id, name, createdAt, status')
      .order('createdAt', { ascending: false })
      .limit(3),
  ]);

  const recentlyAdded: RecentEntity[] = [
    ...(recentVenues ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      type: 'Venue' as const,
      createdAt: v.createdAt,
      status: v.status,
    })),
    ...(recentAcademies ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: 'Academy' as const,
      createdAt: a.createdAt,
      status: a.status,
    })),
    ...(recentTrainers ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      type: 'Trainer' as const,
      createdAt: t.createdAt,
      status: t.status,
      photo: t.photo ?? null,
    })),
    ...(recentGyms ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      type: 'Gym' as const,
      createdAt: g.createdAt,
      status: g.status,
    })),
    ...(recentYogaStudios ?? []).map((y) => ({
      id: y.id,
      name: y.name,
      type: 'Yoga Studio' as const,
      createdAt: y.createdAt,
      status: y.status,
    })),
    ...(recentZumbaStudios ?? []).map((z) => ({
      id: z.id,
      name: z.name,
      type: 'Zumba Studio' as const,
      createdAt: z.createdAt,
      status: z.status,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const onboarding = await getOnboardingStats();

  // Detect incomplete profiles (missing images or contact info)
  const [
    { data: incompleteVenues },
    { data: incompleteTrainers },
    { data: incompleteAcademies },
    { data: incompleteGyms },
    { data: incompleteYogaStudios },
    { data: incompleteZumbaStudios },
  ] = await Promise.all([
    supabase.from('venues').select('id, name, images, contactPhone, address').eq('status', 'ACTIVE'),
    supabase.from('trainers').select('id, name, images, phone, city').eq('status', 'ACTIVE'),
    supabase.from('academies').select('id, name, images, contactPhone, address').eq('status', 'ACTIVE'),
    supabase.from('gyms').select('id, name, images, contactPhone, address').eq('status', 'ACTIVE'),
    supabase.from('yoga_studios').select('id, name, images, contactPhone, address').eq('status', 'ACTIVE'),
    supabase.from('zumba_studios').select('id, name, images, contactPhone, address').eq('status', 'ACTIVE'),
  ]);

  const incompleteProfiles: IncompleteProfile[] = [];

  for (const v of incompleteVenues ?? []) {
    const missing: string[] = [];
    if (!v.images || v.images.length === 0) missing.push('Images');
    if (!v.contactPhone) missing.push('Phone');
    if (!v.address) missing.push('Address');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: v.id, name: v.name, type: 'Venue', missingFields: missing });
    }
  }

  for (const t of incompleteTrainers ?? []) {
    const missing: string[] = [];
    if (!t.images || t.images.length === 0) missing.push('Images');
    if (!t.phone) missing.push('Phone');
    if (!t.city) missing.push('City');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: t.id, name: t.name, type: 'Trainer', missingFields: missing });
    }
  }

  for (const a of incompleteAcademies ?? []) {
    const missing: string[] = [];
    if (!a.images || a.images.length === 0) missing.push('Images');
    if (!a.contactPhone) missing.push('Phone');
    if (!a.address) missing.push('Address');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: a.id, name: a.name, type: 'Academy', missingFields: missing });
    }
  }

  for (const g of incompleteGyms ?? []) {
    const missing: string[] = [];
    if (!g.images || g.images.length === 0) missing.push('Images');
    if (!g.contactPhone) missing.push('Phone');
    if (!g.address) missing.push('Address');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: g.id, name: g.name, type: 'Gym', missingFields: missing });
    }
  }

  for (const y of incompleteYogaStudios ?? []) {
    const missing: string[] = [];
    if (!y.images || y.images.length === 0) missing.push('Images');
    if (!y.contactPhone) missing.push('Phone');
    if (!y.address) missing.push('Address');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: y.id, name: y.name, type: 'Yoga Studio', missingFields: missing });
    }
  }

  for (const z of incompleteZumbaStudios ?? []) {
    const missing: string[] = [];
    if (!z.images || z.images.length === 0) missing.push('Images');
    if (!z.contactPhone) missing.push('Phone');
    if (!z.address) missing.push('Address');
    if (missing.length > 0) {
      incompleteProfiles.push({ id: z.id, name: z.name, type: 'Zumba Studio', missingFields: missing });
    }
  }

  return {
    totalVenues: totalVenues ?? 0,
    totalAcademies: totalAcademies ?? 0,
    totalTrainers: totalTrainers ?? 0,
    totalCourts: totalCourts ?? 0,
    totalGyms: totalGyms ?? 0,
    totalYogaStudios: totalYogaStudios ?? 0,
    totalZumbaStudios: totalZumbaStudios ?? 0,
    activeVenues: activeVenues ?? 0,
    activeAcademies: activeAcademies ?? 0,
    activeTrainers: activeTrainers ?? 0,
    activeCourts: activeCourts ?? 0,
    activeGyms: activeGyms ?? 0,
    activeYogaStudios: activeYogaStudios ?? 0,
    activeZumbaStudios: activeZumbaStudios ?? 0,
    pendingApprovals: onboarding.pending,
    recentlyAdded,
    incompleteProfiles: incompleteProfiles.slice(0, 10),
    onboarding,
  };
}
