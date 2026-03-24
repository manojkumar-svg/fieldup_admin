import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Gym, EntityStatus } from '@/types/database';
import type { GymInput } from '@/lib/validations/entities';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface GymListParams {
  search?: string;
  status?: EntityStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export async function listGyms(params: GymListParams): Promise<{
  gyms: Gym[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('gyms').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,city.ilike.%${params.search}%`
    );
  }
  if (params.status) query = query.eq('status', params.status);
  if (params.city) query = query.ilike('city', `%${params.city}%`);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    gyms: (data ?? []) as Gym[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getGymById(id: string): Promise<Gym | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('gyms').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Gym;
}

export async function createGym(data: GymInput): Promise<Gym> {
  const supabase = createServerSupabaseClient();
  const { data: gym, error } = await supabase
    .from('gyms')
    .insert({
      name: data.name,
      description: data.description || null,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || null,
      website: data.website || null,
      amenities: data.amenities ?? [],
      images: data.images ?? [],
      documents: data.documents ?? [],
      imageTitles: data.imageTitles ?? [],
      documentTitles: data.documentTitles ?? [],
      openTime: data.openTime || null,
      closeTime: data.closeTime || null,
      monthlyFee: data.monthlyFee ?? null,
      status: 'ACTIVE' as EntityStatus,
    })
    .select()
    .single();

  if (error) throw error;
  return gym as Gym;
}

export async function updateGym(id: string, data: Partial<GymInput>): Promise<Gym> {
  const supabase = createServerSupabaseClient();
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.pincode !== undefined) updateData.pincode = data.pincode;
  if (data.latitude !== undefined) updateData.latitude = data.latitude ?? null;
  if (data.longitude !== undefined) updateData.longitude = data.longitude ?? null;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail || null;
  if (data.website !== undefined) updateData.website = data.website || null;
  if (data.amenities !== undefined) updateData.amenities = data.amenities;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.documents !== undefined) updateData.documents = data.documents;
  if (data.imageTitles !== undefined) updateData.imageTitles = data.imageTitles;
  if (data.documentTitles !== undefined) updateData.documentTitles = data.documentTitles;
  if (data.openTime !== undefined) updateData.openTime = data.openTime || null;
  if (data.closeTime !== undefined) updateData.closeTime = data.closeTime || null;
  if (data.monthlyFee !== undefined) updateData.monthlyFee = data.monthlyFee ?? null;

  const { data: gym, error } = await supabase
    .from('gyms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return gym as Gym;
}

export async function updateGymStatus(id: string, status: EntityStatus): Promise<Gym> {
  const supabase = createServerSupabaseClient();
  const { data: gym, error } = await supabase
    .from('gyms')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return gym as Gym;
}

export async function deleteGym(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('gyms').delete().eq('id', id);
  if (error) throw error;
}
