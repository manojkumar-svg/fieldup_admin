import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { yogaStudioSchema } from '@/lib/validations/entities';
import { listYogaStudios, createYogaStudio } from '@/lib/services/yoga-studios';
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
    const result = await listYogaStudios({
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
    console.error('List yoga studios error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch yoga studios' } },
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
    const parsed = yogaStudioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid yoga studio data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const yogaStudio = await createYogaStudio(parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'YOGA_STUDIO', entityId: yogaStudio.id, action: 'CREATE', changes: parsed.data });
    return NextResponse.json({ yogaStudio }, { status: 201 });
  } catch (error) {
    console.error('Create yoga studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create yoga studio' } },
      { status: 500 }
    );
  }
}
