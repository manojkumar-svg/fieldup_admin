import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { yogaStudioSchema, yogaStudioStatusSchema } from '@/lib/validations/entities';
import { getYogaStudioById, updateYogaStudio, updateYogaStudioStatus, deleteYogaStudio } from '@/lib/services/yoga-studios';
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
    const yogaStudio = await getYogaStudioById(params.id);
    if (!yogaStudio) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Yoga studio not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ yogaStudio });
  } catch (error) {
    console.error('Get yoga studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch yoga studio' } },
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
    const existing = await getYogaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Yoga studio not found' } },
        { status: 404 }
      );
    }

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

    const yogaStudio = await updateYogaStudio(params.id, parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'YOGA_STUDIO', entityId: params.id, action: 'UPDATE', changes: parsed.data });
    return NextResponse.json({ yogaStudio });
  } catch (error) {
    console.error('Update yoga studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update yoga studio' } },
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
    const existing = await getYogaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Yoga studio not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = yogaStudioStatusSchema.safeParse(body);

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

    const yogaStudio = await updateYogaStudioStatus(params.id, parsed.data.status);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'YOGA_STUDIO', entityId: params.id, action: 'STATUS_CHANGE', changes: { status: parsed.data.status } });
    return NextResponse.json({ yogaStudio });
  } catch (error) {
    console.error('Update yoga studio status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update yoga studio status' } },
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
    const existing = await getYogaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Yoga studio not found' } },
        { status: 404 }
      );
    }

    await deleteYogaStudio(params.id);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'YOGA_STUDIO', entityId: params.id, action: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete yoga studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete yoga studio' } },
      { status: 500 }
    );
  }
}
