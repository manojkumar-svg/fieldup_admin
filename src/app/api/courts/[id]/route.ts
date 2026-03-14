import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { courtSchema, courtStatusSchema } from '@/lib/validations/entities';
import { getCourtById, updateCourt, updateCourtStatus, deleteCourt } from '@/lib/services/courts';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const court = await getCourtById(params.id);
    if (!court) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Court not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ court });
  } catch (error) {
    console.error('Get court error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch court' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const existing = await getCourtById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Court not found' } },
        { status: 404 }
      );
    }

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

    const court = await updateCourt(params.id, parsed.data);
    return NextResponse.json({ court });
  } catch (error) {
    console.error('Update court error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update court' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const existing = await getCourtById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Court not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = courtStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid status',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const court = await updateCourtStatus(params.id, parsed.data.status);
    return NextResponse.json({ court });
  } catch (error) {
    console.error('Update court status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update court status' } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const existing = await getCourtById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Court not found' } },
        { status: 404 }
      );
    }

    await deleteCourt(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete court error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete court' } },
      { status: 500 }
    );
  }
}
