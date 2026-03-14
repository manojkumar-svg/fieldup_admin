import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { courtSchema } from '@/lib/validations/entities';
import { listCourts, createCourt } from '@/lib/services/courts';
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
    const result = await listCourts({
      search: searchParams.get('search') ?? undefined,
      sportType: (searchParams.get('sportType') as SportType) ?? undefined,
      surfaceType: searchParams.get('surfaceType') ?? undefined,
      status: (searchParams.get('status') as EntityStatus) ?? undefined,
      venueId: searchParams.get('venueId') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('List courts error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch courts' } },
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
    const parsed = courtSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid court data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const court = await createCourt(parsed.data);
    return NextResponse.json({ court }, { status: 201 });
  } catch (error) {
    console.error('Create court error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create court' } },
      { status: 500 }
    );
  }
}
