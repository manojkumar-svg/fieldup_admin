import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/services/audit';
import { checkRateLimit } from '@/lib/rate-limit';

const bulkStatusSchema = z.object({
  entityType: z.enum(['venues', 'academies', 'trainers', 'courts', 'gyms', 'yoga_studios', 'zumba_studios']),
  ids: z.array(z.string().uuid()).min(1).max(100),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const { allowed } = checkRateLimit(`bulk:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many bulk operations. Please wait a minute.' } },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = bulkStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid bulk operation data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const { entityType, ids, status } = parsed.data;
    const supabase = createServerSupabaseClient();

    const { error, count } = await supabase
      .from(entityType)
      .update({ status, updatedAt: new Date().toISOString() })
      .in('id', ids);

    if (error) throw error;

    const entityTypeLabel = entityType.toUpperCase().slice(0, -1); // 'venues' -> 'VENUE'
    for (const id of ids) {
      await createAuditLog({
        userId: session.user.id,
        userEmail: session.user.email,
        entityType: entityTypeLabel,
        entityId: id,
        action: 'STATUS_CHANGE',
        changes: { status, bulk: true },
      });
    }

    return NextResponse.json({ success: true, updated: count ?? ids.length });
  } catch (error) {
    console.error('Bulk status update error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update entities' } },
      { status: 500 }
    );
  }
}
