import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { venueSchema } from '@/lib/validations/entities';
import { listVenues, createVenue } from '@/lib/services/venues';
import { createAuditLog } from '@/lib/services/audit';
import type { SportType, EntityStatus } from '@/types/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const result = await listVenues({
      search: searchParams.get('search') ?? undefined,
      sportType: (searchParams.get('sportType') as SportType) ?? undefined,
      status: (searchParams.get('status') as EntityStatus) ?? undefined,
      city: searchParams.get('city') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('List venues error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch venues' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = venueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid venue data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const venue = await createVenue(parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'VENUE', entityId: venue.id, action: 'CREATE', changes: parsed.data });
    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    console.error('Create venue error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create venue' } },
      { status: 500 }
    );
  }
}
