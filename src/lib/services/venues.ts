import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Venue, VenueSport, VenueWithSports, EntityStatus, SportType } from '@/types/database';
import type { VenueInput } from '@/lib/validations/entities';
import { ITEMS_PER_PAGE } from '@/lib/utils';

interface VenueListParams {
  search?: string;
  sportType?: SportType;
  status?: EntityStatus;
  city?: string;
  page?: number;
  limit?: number;
}

export async function listVenues(params: VenueListParams): Promise<{
  venues: VenueWithSports[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = createServerSupabaseClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? ITEMS_PER_PAGE;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('venues').select('*, venue_sports(*)', { count: 'exact' });

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,city.ilike.%${params.search}%,address.ilike.%${params.search}%`
    );
  }
  if (params.status) query = query.eq('status', params.status);
  if (params.city) query = query.ilike('city', `%${params.city}%`);

  query = query.order('createdAt', { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  let venues = (data ?? []) as VenueWithSports[];

  // Filter by sportType on the client side (join filter)
  if (params.sportType) {
    venues = venues.filter((v) =>
      v.venue_sports.some((s) => s.sportType === params.sportType)
    );
  }

  const total = params.sportType ? venues.length : (count ?? 0);
  return {
    venues,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVenueById(id: string): Promise<VenueWithSports | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_sports(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as VenueWithSports;
}

export async function createVenue(input: VenueInput): Promise<VenueWithSports> {
  const supabase = createServerSupabaseClient();

  // Insert venue
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .insert({
      name: input.name,
      description: input.description || null,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      amenities: input.amenities ?? [],
      images: input.images ?? [],
      documents: input.documents ?? [],
      contactPhone: input.contactPhone || null,
      contactEmail: input.contactEmail || null,
      status: 'ACTIVE' as EntityStatus,
    })
    .select()
    .single();

  if (venueError) throw venueError;
  const v = venue as Venue;

  // Insert sports
  const sportsData = input.sports.map((s) => ({
    venueId: v.id,
    sportType: s.sportType,
    numberOfCourts: s.numberOfCourts,
    pricePerHour: s.pricePerHour,
    openTime: s.openTime,
    closeTime: s.closeTime,
    availableDays: s.availableDays,
    rules: s.rules || null,
    amenities: s.amenities ?? [],
  }));

  const { data: sports, error: sportsError } = await supabase
    .from('venue_sports')
    .insert(sportsData)
    .select();

  if (sportsError) throw sportsError;

  return { ...v, venue_sports: (sports ?? []) as VenueSport[] };
}

export async function updateVenue(id: string, input: VenueInput): Promise<VenueWithSports> {
  const supabase = createServerSupabaseClient();

  // Update venue
  const updateData: Record<string, unknown> = {};
  const directFields = ['name', 'address', 'city', 'state', 'pincode', 'amenities', 'images', 'documents'] as const;
  for (const field of directFields) {
    if (input[field] !== undefined) updateData[field] = input[field];
  }
  const nullableStringFields = ['description', 'contactPhone', 'contactEmail'] as const;
  for (const field of nullableStringFields) {
    if (input[field] !== undefined) updateData[field] = input[field] || null;
  }
  const nullableNumberFields = ['latitude', 'longitude'] as const;
  for (const field of nullableNumberFields) {
    if (input[field] !== undefined) updateData[field] = input[field] ?? null;
  }

  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (venueError) throw venueError;
  const v = venue as Venue;

  // Replace sports: delete old, insert new
  const { error: deleteError } = await supabase
    .from('venue_sports')
    .delete()
    .eq('venueId', id);

  if (deleteError) throw deleteError;

  const sportsData = input.sports.map((s) => ({
    venueId: id,
    sportType: s.sportType,
    numberOfCourts: s.numberOfCourts,
    pricePerHour: s.pricePerHour,
    openTime: s.openTime,
    closeTime: s.closeTime,
    availableDays: s.availableDays,
    rules: s.rules || null,
    amenities: s.amenities ?? [],
  }));

  const { data: sports, error: sportsError } = await supabase
    .from('venue_sports')
    .insert(sportsData)
    .select();

  if (sportsError) throw sportsError;

  return { ...v, venue_sports: (sports ?? []) as VenueSport[] };
}

export async function updateVenueStatus(id: string, status: EntityStatus): Promise<Venue> {
  const supabase = createServerSupabaseClient();
  const { data: venue, error } = await supabase
    .from('venues')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return venue as Venue;
}

export async function deleteVenue(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('venues').delete().eq('id', id);
  if (error) throw error;
}
