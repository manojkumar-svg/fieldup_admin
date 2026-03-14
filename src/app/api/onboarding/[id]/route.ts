import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { onboardingStatusUpdateSchema } from '@/lib/validations/onboarding';
import { getOnboardingById, updateOnboardingStatus } from '@/lib/services/onboarding';

// GET — Admin only: get application details
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const application = await getOnboardingById(params.id);
    if (!application) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Get onboarding application error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch application' } },
      { status: 500 }
    );
  }
}

// PATCH — Admin only: update application status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const existing = await getOnboardingById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = onboardingStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid status data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const application = await updateOnboardingStatus(
      params.id,
      parsed.data,
      session.user.id
    );
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Update onboarding status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update application' } },
      { status: 500 }
    );
  }
}
