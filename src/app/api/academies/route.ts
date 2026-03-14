import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { academySchema } from '@/lib/validations/entities';
import { listAcademies, createAcademy } from '@/lib/services/academies';
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
    const result = await listAcademies({
      search: searchParams.get('search') ?? undefined,
      sportType: (searchParams.get('sportType') as SportType) ?? undefined,
      status: (searchParams.get('status') as EntityStatus) ?? undefined,
      city: searchParams.get('city') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('List academies error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch academies' } },
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
    const parsed = academySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid academy data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const academy = await createAcademy(parsed.data);
    return NextResponse.json({ academy }, { status: 201 });
  } catch (error) {
    console.error('Create academy error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create academy' } },
      { status: 500 }
    );
  }
}
