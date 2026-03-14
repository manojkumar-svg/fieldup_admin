import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { trainerSchema } from '@/lib/validations/entities';
import { listTrainers, createTrainer } from '@/lib/services/trainers';
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
    const result = await listTrainers({
      search: searchParams.get('search') ?? undefined,
      sportType: (searchParams.get('sportType') as SportType) ?? undefined,
      status: (searchParams.get('status') as EntityStatus) ?? undefined,
      city: searchParams.get('city') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('List trainers error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trainers' } },
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
    const parsed = trainerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid trainer data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const trainer = await createTrainer(parsed.data);
    return NextResponse.json({ trainer }, { status: 201 });
  } catch (error) {
    console.error('Create trainer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create trainer' } },
      { status: 500 }
    );
  }
}
