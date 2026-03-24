import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { zumbaStudioSchema, zumbaStudioStatusSchema } from '@/lib/validations/entities';
import { getZumbaStudioById, updateZumbaStudio, updateZumbaStudioStatus, deleteZumbaStudio } from '@/lib/services/zumba-studios';
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
    const zumbaStudio = await getZumbaStudioById(params.id);
    if (!zumbaStudio) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Zumba studio not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ zumbaStudio });
  } catch (error) {
    console.error('Get zumba studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch zumba studio' } },
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
    const existing = await getZumbaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Zumba studio not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = zumbaStudioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid zumba studio data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const zumbaStudio = await updateZumbaStudio(params.id, parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ZUMBA_STUDIO', entityId: params.id, action: 'UPDATE', changes: parsed.data });
    return NextResponse.json({ zumbaStudio });
  } catch (error) {
    console.error('Update zumba studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update zumba studio' } },
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
    const existing = await getZumbaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Zumba studio not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = zumbaStudioStatusSchema.safeParse(body);

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

    const zumbaStudio = await updateZumbaStudioStatus(params.id, parsed.data.status);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ZUMBA_STUDIO', entityId: params.id, action: 'STATUS_CHANGE', changes: { status: parsed.data.status } });
    return NextResponse.json({ zumbaStudio });
  } catch (error) {
    console.error('Update zumba studio status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update zumba studio status' } },
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
    const existing = await getZumbaStudioById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Zumba studio not found' } },
        { status: 404 }
      );
    }

    await deleteZumbaStudio(params.id);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ZUMBA_STUDIO', entityId: params.id, action: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete zumba studio error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete zumba studio' } },
      { status: 500 }
    );
  }
}
