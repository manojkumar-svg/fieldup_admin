import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardStats, RecentEntity } from '@/types';
import { getOnboardingStats } from '@/lib/services/onboarding';

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient();

  const [
    { count: totalVenues },
    { count: totalAcademies },
    { count: totalTrainers },
    { count: totalCourts },
    { count: activeVenues },
    { count: activeAcademies },
    { count: activeTrainers },
    { count: activeCourts },
  ] = await Promise.all([
    supabase.from('venues').select('*', { count: 'exact', head: true }),
    supabase.from('academies').select('*', { count: 'exact', head: true }),
    supabase.from('trainers').select('*', { count: 'exact', head: true }),
    supabase.from('courts').select('*', { count: 'exact', head: true }),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('academies').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('trainers').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('courts').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
  ]);

  const [
    { data: recentVenues },
    { data: recentAcademies },
    { data: recentTrainers },
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
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const onboarding = await getOnboardingStats();

  return {
    totalVenues: totalVenues ?? 0,
    totalAcademies: totalAcademies ?? 0,
    totalTrainers: totalTrainers ?? 0,
    totalCourts: totalCourts ?? 0,
    activeVenues: activeVenues ?? 0,
    activeAcademies: activeAcademies ?? 0,
    activeTrainers: activeTrainers ?? 0,
    activeCourts: activeCourts ?? 0,
    pendingApprovals: onboarding.pending,
    recentlyAdded,
    onboarding,
  };
}
