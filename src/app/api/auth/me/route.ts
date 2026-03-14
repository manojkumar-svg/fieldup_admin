import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  });
}
