import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface DuplicateGroup {
  name: string;
  city: string;
  entityType: string;
  ids: string[];
  count: number;
}

export async function detectDuplicates(): Promise<DuplicateGroup[]> {
  const supabase = createServerSupabaseClient();
  const duplicates: DuplicateGroup[] = [];

  const [
    { data: venues },
    { data: trainers },
    { data: academies },
    { data: gyms },
    { data: yogaStudios },
    { data: zumbaStudios },
  ] = await Promise.all([
    supabase.from('venues').select('id, name, city'),
    supabase.from('trainers').select('id, name, city'),
    supabase.from('academies').select('id, name, city'),
    supabase.from('gyms').select('id, name, city'),
    supabase.from('yoga_studios').select('id, name, city'),
    supabase.from('zumba_studios').select('id, name, city'),
  ]);

  const findDuplicatesInList = (
    items: Array<{ id: string; name: string; city: string | null }>,
    entityType: string,
  ) => {
    const grouped = new Map<string, string[]>();
    for (const item of items) {
      const key = `${item.name.toLowerCase().trim()}|${(item.city ?? '').toLowerCase().trim()}`;
      const ids = grouped.get(key) ?? [];
      ids.push(item.id);
      grouped.set(key, ids);
    }
    grouped.forEach((ids, key) => {
      if (ids.length > 1) {
        const [name, city] = key.split('|');
        duplicates.push({ name, city, entityType, ids, count: ids.length });
      }
    });
  };

  findDuplicatesInList(venues ?? [], 'Venue');
  findDuplicatesInList(trainers ?? [], 'Trainer');
  findDuplicatesInList(academies ?? [], 'Academy');
  findDuplicatesInList(gyms ?? [], 'Gym');
  findDuplicatesInList(yogaStudios ?? [], 'Yoga Studio');
  findDuplicatesInList(zumbaStudios ?? [], 'Zumba Studio');

  return duplicates.sort((a, b) => b.count - a.count);
}
