import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Trainer, EntityStatus, SportType } from '@/types/database';
import type { TrainerInput } from '@/lib/validations/entities';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface TrainerListParams {
  search?: string;
  sportType?: SportType;
  status?: EntityStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export async function listTrainers(params: TrainerListParams): Promise<{
  trainers: Trainer[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('trainers').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,city.ilike.%${params.search}%`
    );
  }
  if (params.sportType) query = query.eq('sportSpecialization', params.sportType);
  if (params.status) query = query.eq('status', params.status);
  if (params.city) query = query.ilike('city', `%${params.city}%`);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    trainers: (data ?? []) as Trainer[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTrainerById(id: string): Promise<Trainer | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('trainers').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Trainer;
}

export async function createTrainer(data: TrainerInput): Promise<Trainer> {
  const supabase = createServerSupabaseClient();
  const { data: trainer, error } = await supabase
    .from('trainers')
    .insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      sportSpecialization: data.sportSpecialization,
      experience: data.experience,
      certifications: data.certifications ?? [],
      hourlyRate: data.hourlyRate,
      bio: data.bio || null,
      photo: data.photo || (data.images && data.images.length > 0 ? data.images[0] : null),
      images: data.images ?? [],
      documents: data.documents ?? [],
      imageTitles: data.imageTitles ?? [],
      documentTitles: data.documentTitles ?? [],
      city: data.city,
      state: data.state,
      address: data.address || '',
      pincode: data.pincode || '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      cancellationAvailable: data.cancellationAvailable ?? false,
      kidsTraining: data.kidsTraining ?? false,
      groupSessions: data.groupSessions ?? false,
      oneOnOneCoaching: data.oneOnOneCoaching ?? false,
      sessionConfig: data.sessionConfig ?? {},
      status: 'ACTIVE' as EntityStatus,
    })
    .select()
    .single();

  if (error) throw error;
  return trainer as Trainer;
}

export async function updateTrainer(id: string, data: Partial<TrainerInput>): Promise<Trainer> {
  const supabase = createServerSupabaseClient();
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.sportSpecialization !== undefined) updateData.sportSpecialization = data.sportSpecialization;
  if (data.experience !== undefined) updateData.experience = data.experience;
  if (data.certifications !== undefined) updateData.certifications = data.certifications;
  if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
  if (data.bio !== undefined) updateData.bio = data.bio || null;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.photo !== undefined) {
    updateData.photo = data.photo || (data.images && data.images.length > 0 ? data.images[0] : null);
  } else if (data.images !== undefined && data.images.length > 0) {
    updateData.photo = data.images[0];
  }
  if (data.documents !== undefined) updateData.documents = data.documents;
  if (data.imageTitles !== undefined) updateData.imageTitles = data.imageTitles;
  if (data.documentTitles !== undefined) updateData.documentTitles = data.documentTitles;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.address !== undefined) updateData.address = data.address || '';
  if (data.pincode !== undefined) updateData.pincode = data.pincode || '';
  if (data.latitude !== undefined) updateData.latitude = data.latitude ?? null;
  if (data.longitude !== undefined) updateData.longitude = data.longitude ?? null;
  if (data.cancellationAvailable !== undefined) updateData.cancellationAvailable = data.cancellationAvailable;
  if (data.kidsTraining !== undefined) updateData.kidsTraining = data.kidsTraining;
  if (data.groupSessions !== undefined) updateData.groupSessions = data.groupSessions;
  if (data.oneOnOneCoaching !== undefined) updateData.oneOnOneCoaching = data.oneOnOneCoaching;
  if (data.sessionConfig !== undefined) updateData.sessionConfig = data.sessionConfig;

  const { data: trainer, error } = await supabase
    .from('trainers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return trainer as Trainer;
}

export async function updateTrainerStatus(id: string, status: EntityStatus): Promise<Trainer> {
  const supabase = createServerSupabaseClient();
  const { data: trainer, error } = await supabase
    .from('trainers')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return trainer as Trainer;
}

export async function deleteTrainer(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('trainers').delete().eq('id', id);
  if (error) throw error;
}
