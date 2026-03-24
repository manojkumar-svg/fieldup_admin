import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { academySchema, academyStatusSchema } from '@/lib/validations/entities';
import { getAcademyById, updateAcademy, updateAcademyStatus, deleteAcademy } from '@/lib/services/academies';
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
    const academy = await getAcademyById(params.id);
    if (!academy) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Academy not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ academy });
  } catch (error) {
    console.error('Get academy error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch academy' } },
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
    const existing = await getAcademyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Academy not found' } },
        { status: 404 }
      );
    }

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

    const academy = await updateAcademy(params.id, parsed.data);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ACADEMY', entityId: params.id, action: 'UPDATE', changes: parsed.data });
    return NextResponse.json({ academy });
  } catch (error) {
    console.error('Update academy error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update academy' } },
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
    const existing = await getAcademyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Academy not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = academyStatusSchema.safeParse(body);

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

    const academy = await updateAcademyStatus(params.id, parsed.data.status);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ACADEMY', entityId: params.id, action: 'STATUS_CHANGE', changes: { status: parsed.data.status } });
    return NextResponse.json({ academy });
  } catch (error) {
    console.error('Update academy status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update academy status' } },
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
    const existing = await getAcademyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Academy not found' } },
        { status: 404 }
      );
    }

    await deleteAcademy(params.id);
    await createAuditLog({ userId: session.user.id, userEmail: session.user.email, entityType: 'ACADEMY', entityId: params.id, action: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete academy error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete academy' } },
      { status: 500 }
    );
  }
}
