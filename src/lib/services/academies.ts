import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Academy, EntityStatus, SportType } from '@/types/database';
import type { AcademyInput } from '@/lib/validations/entities';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface AcademyListParams {
  search?: string;
  sportType?: SportType;
  status?: EntityStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export async function listAcademies(params: AcademyListParams): Promise<{
  academies: Academy[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('academies').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,city.ilike.%${params.search}%,address.ilike.%${params.search}%`
    );
  }
  if (params.sportType) query = query.contains('sportsOffered', [params.sportType]);
  if (params.status) query = query.eq('status', params.status);
  if (params.city) query = query.ilike('city', `%${params.city}%`);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    academies: (data ?? []) as Academy[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAcademyById(id: string): Promise<Academy | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('academies').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Academy;
}

export async function createAcademy(data: AcademyInput): Promise<Academy> {
  const supabase = createServerSupabaseClient();
  const { data: academy, error } = await supabase
    .from('academies')
    .insert({
      name: data.name,
      description: data.description || null,
      sportsOffered: data.sportsOffered,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail || null,
      website: data.website || null,
      images: data.images ?? [],
      documents: data.documents ?? [],
      establishedYear: data.establishedYear ?? null,
      status: 'ACTIVE' as EntityStatus,
    })
    .select()
    .single();

  if (error) throw error;
  return academy as Academy;
}

export async function updateAcademy(id: string, data: Partial<AcademyInput>): Promise<Academy> {
  const supabase = createServerSupabaseClient();
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.sportsOffered !== undefined) updateData.sportsOffered = data.sportsOffered;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.pincode !== undefined) updateData.pincode = data.pincode;
  if (data.latitude !== undefined) updateData.latitude = data.latitude ?? null;
  if (data.longitude !== undefined) updateData.longitude = data.longitude ?? null;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail || null;
  if (data.website !== undefined) updateData.website = data.website || null;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.documents !== undefined) updateData.documents = data.documents;
  if (data.establishedYear !== undefined) updateData.establishedYear = data.establishedYear ?? null;

  const { data: academy, error } = await supabase
    .from('academies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return academy as Academy;
}

export async function updateAcademyStatus(id: string, status: EntityStatus): Promise<Academy> {
  const supabase = createServerSupabaseClient();
  const { data: academy, error } = await supabase
    .from('academies')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return academy as Academy;
}

export async function deleteAcademy(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('academies').delete().eq('id', id);
  if (error) throw error;
}
