import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { trainerSchema, trainerStatusSchema } from '@/lib/validations/entities';
import { getTrainerById, updateTrainer, updateTrainerStatus, deleteTrainer } from '@/lib/services/trainers';
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
    const trainer = await getTrainerById(params.id);
    if (!trainer) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trainer not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ trainer });
  } catch (error) {
    console.error('Get trainer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trainer' } },
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
    const existing = await getTrainerById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trainer not found' } },
        { status: 404 }
      );
    }

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

    const trainer = await updateTrainer(params.id, parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'TRAINER', entityId: params.id, action: 'UPDATE', changes: parsed.data });
    return NextResponse.json({ trainer });
  } catch (error) {
    console.error('Update trainer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update trainer' } },
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
    const existing = await getTrainerById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trainer not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = trainerStatusSchema.safeParse(body);

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

    const trainer = await updateTrainerStatus(params.id, parsed.data.status);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'TRAINER', entityId: params.id, action: 'STATUS_CHANGE', changes: { status: parsed.data.status } });
    return NextResponse.json({ trainer });
  } catch (error) {
    console.error('Update trainer status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update trainer status' } },
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
    const existing = await getTrainerById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trainer not found' } },
        { status: 404 }
      );
    }

    await deleteTrainer(params.id);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'TRAINER', entityId: params.id, action: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete trainer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete trainer' } },
      { status: 500 }
    );
  }
}
