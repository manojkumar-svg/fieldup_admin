import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gymSchema } from '@/lib/validations/entities';
import { listGyms, createGym } from '@/lib/services/gyms';
import { createAuditLog } from '@/lib/services/audit';
import type { EntityStatus } from '@/types/database';

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
    const result = await listGyms({
      search: searchParams.get('search') ?? undefined,
      status: (searchParams.get('status') as EntityStatus) ?? undefined,
      city: searchParams.get('city') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('List gyms error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch gyms' } },
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
    const parsed = gymSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid gym data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const gym = await createGym(parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'GYM', entityId: gym.id, action: 'CREATE', changes: parsed.data });
    return NextResponse.json({ gym }, { status: 201 });
  } catch (error) {
    console.error('Create gym error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create gym' } },
      { status: 500 }
    );
  }
}
