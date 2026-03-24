import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentAuditLogs, getEntityAuditLogs } from '@/lib/services/audit';

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
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    if (entityType && entityId) {
      const logs = await getEntityAuditLogs(entityType, entityId);
      return NextResponse.json({ logs });
    }

    const logs = await getRecentAuditLogs(limit);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit logs' } },
      { status: 500 }
    );
  }
}
