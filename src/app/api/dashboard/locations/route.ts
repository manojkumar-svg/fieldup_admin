import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface MapLocation {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer' | 'Gym' | 'Yoga Studio' | 'Zumba Studio';
  latitude: number;
  longitude: number;
  city: string;
  status: string;
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const supabase = createServerSupabaseClient();
    const locations: MapLocation[] = [];

    const [
      { data: venues },
      { data: academies },
      { data: trainers },
      { data: gyms },
      { data: yogaStudios },
      { data: zumbaStudios },
    ] = await Promise.all([
      supabase.from('venues').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
      supabase.from('academies').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
      supabase.from('trainers').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
      supabase.from('gyms').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
      supabase.from('yoga_studios').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
      supabase.from('zumba_studios').select('id, name, latitude, longitude, city, status').not('latitude', 'is', null).not('longitude', 'is', null),
    ]);

    for (const v of venues ?? []) {
      locations.push({ id: v.id, name: v.name, type: 'Venue', latitude: v.latitude, longitude: v.longitude, city: v.city ?? '', status: v.status });
    }
    for (const a of academies ?? []) {
      locations.push({ id: a.id, name: a.name, type: 'Academy', latitude: a.latitude, longitude: a.longitude, city: a.city ?? '', status: a.status });
    }
    for (const t of trainers ?? []) {
      locations.push({ id: t.id, name: t.name, type: 'Trainer', latitude: t.latitude, longitude: t.longitude, city: t.city ?? '', status: t.status });
    }
    for (const g of gyms ?? []) {
      locations.push({ id: g.id, name: g.name, type: 'Gym', latitude: g.latitude, longitude: g.longitude, city: g.city ?? '', status: g.status });
    }
    for (const y of yogaStudios ?? []) {
      locations.push({ id: y.id, name: y.name, type: 'Yoga Studio', latitude: y.latitude, longitude: y.longitude, city: y.city ?? '', status: y.status });
    }
    for (const z of zumbaStudios ?? []) {
      locations.push({ id: z.id, name: z.name, type: 'Zumba Studio', latitude: z.latitude, longitude: z.longitude, city: z.city ?? '', status: z.status });
    }

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Fetch map locations error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch locations' } },
      { status: 500 }
    );
  }
}
