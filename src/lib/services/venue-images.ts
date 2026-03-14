import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { VenueImage } from '@/types/database';

export async function listVenueImages(venueId: string): Promise<VenueImage[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('venue_images')
    .select('*')
    .eq('venueId', venueId)
    .order('sortOrder', { ascending: true });

  if (error) throw error;
  return (data ?? []) as VenueImage[];
}

export async function addVenueImage(
  venueId: string,
  imageUrl: string,
  caption?: string
): Promise<VenueImage> {
  const supabase = createServerSupabaseClient();

  // Get next sort order
  const { count } = await supabase
    .from('venue_images')
    .select('*', { count: 'exact', head: true })
    .eq('venueId', venueId);

  const { data, error } = await supabase
    .from('venue_images')
    .insert({
      venueId,
      imageUrl,
      caption: caption || null,
      sortOrder: (count ?? 0),
    })
    .select()
    .single();

  if (error) throw error;
  return data as VenueImage;
}

export async function deleteVenueImage(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('venue_images').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadVenueImageToStorage(
  venueId: string,
  file: File
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${venueId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('venue-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('venue-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
