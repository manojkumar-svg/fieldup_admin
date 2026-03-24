import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gymSchema, gymStatusSchema } from '@/lib/validations/entities';
import { getGymById, updateGym, updateGymStatus, deleteGym } from '@/lib/services/gyms';
import { createAuditLog } from '@/lib/services/audit';

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
    const gym = await getGymById(params.id);
    if (!gym) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Gym not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ gym });
  } catch (error) {
    console.error('Get gym error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch gym' } },
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
    const existing = await getGymById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Gym not found' } },
        { status: 404 }
      );
    }

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

    const gym = await updateGym(params.id, parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'GYM', entityId: params.id, action: 'UPDATE', changes: parsed.data });
    return NextResponse.json({ gym });
  } catch (error) {
    console.error('Update gym error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update gym' } },
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
    const existing = await getGymById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Gym not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = gymStatusSchema.safeParse(body);

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

    const gym = await updateGymStatus(params.id, parsed.data.status);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'GYM', entityId: params.id, action: 'STATUS_CHANGE', changes: { status: parsed.data.status } });
    return NextResponse.json({ gym });
  } catch (error) {
    console.error('Update gym status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update gym status' } },
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
    const existing = await getGymById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Gym not found' } },
        { status: 404 }
      );
    }

    await deleteGym(params.id);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'GYM', entityId: params.id, action: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete gym error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete gym' } },
      { status: 500 }
    );
  }
}
