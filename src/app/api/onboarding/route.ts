import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { onboardingSchema } from '@/lib/validations/onboarding';
import { listOnboardingApplications, createOnboardingApplication } from '@/lib/services/onboarding';
import type { OnboardingStatus, PartnerType } from '@/types/database';

// GET — Admin only: list applications
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
    const result = await listOnboardingApplications({
      search: searchParams.get('search') ?? undefined,
      status: (searchParams.get('status') as OnboardingStatus) ?? undefined,
      partnerType: (searchParams.get('partnerType') as PartnerType) ?? undefined,
      city: searchParams.get('city') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('List onboarding error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch applications' } },
      { status: 500 }
    );
  }
}

// POST — Public: submit onboarding application
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid application data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const application = await createOnboardingApplication(parsed.data);
    return NextResponse.json(
      { application: { id: application.id, status: application.status } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create onboarding application error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to submit application' } },
      { status: 500 }
    );
  }
}
