import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Court, CourtWithVenue, EntityStatus, SportType } from '@/types/database';
import type { CourtInput } from '@/lib/validations/entities';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface CourtListParams {
  search?: string;
  sportType?: SportType;
  surfaceType?: string;
  status?: EntityStatus;
  venueId?: string;
  page?: number;
  limit?: number;
}

export async function listCourts(params: CourtListParams): Promise<{
  courts: CourtWithVenue[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('courts')
    .select('*, venues:venueId(id, name, city)', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%`
    );
  }
  if (params.sportType) query = query.eq('sportType', params.sportType);
  if (params.surfaceType) query = query.eq('surfaceType', params.surfaceType);
  if (params.status) query = query.eq('status', params.status);
  if (params.venueId) query = query.eq('venueId', params.venueId);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    courts: (data ?? []) as CourtWithVenue[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCourtById(id: string): Promise<CourtWithVenue | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('courts')
    .select('*, venues:venueId(id, name, city)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as CourtWithVenue;
}

export async function createCourt(input: CourtInput): Promise<Court> {
  const supabase = createServerSupabaseClient();
  const { data: court, error } = await supabase
    .from('courts')
    .insert({
      venueId: input.venueId,
      name: input.name,
      sportType: input.sportType,
      surfaceType: input.surfaceType,
      indoor: input.indoor,
      pricePerHour: input.pricePerHour,
      maxPlayers: input.maxPlayers,
      images: input.images ?? [],
      status: 'ACTIVE' as EntityStatus,
    })
    .select()
    .single();

  if (error) throw error;
  return court as Court;
}

export async function updateCourt(id: string, input: CourtInput): Promise<Court> {
  const supabase = createServerSupabaseClient();
  const { data: court, error } = await supabase
    .from('courts')
    .update({
      venueId: input.venueId,
      name: input.name,
      sportType: input.sportType,
      surfaceType: input.surfaceType,
      indoor: input.indoor,
      pricePerHour: input.pricePerHour,
      maxPlayers: input.maxPlayers,
      images: input.images ?? [],
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return court as Court;
}

export async function updateCourtStatus(id: string, status: EntityStatus): Promise<Court> {
  const supabase = createServerSupabaseClient();
  const { data: court, error } = await supabase
    .from('courts')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return court as Court;
}

export async function deleteCourt(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('courts').delete().eq('id', id);
  if (error) throw error;
}
