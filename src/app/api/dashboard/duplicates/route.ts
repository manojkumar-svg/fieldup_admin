import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { detectDuplicates } from '@/lib/services/duplicates';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const duplicates = await detectDuplicates();
    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to detect duplicates' } },
      { status: 500 }
    );
  }
}
