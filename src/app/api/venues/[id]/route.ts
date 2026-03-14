import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { venueSchema, venueStatusSchema } from '@/lib/validations/entities';
import { getVenueById, updateVenue, updateVenueStatus, deleteVenue } from '@/lib/services/venues';

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
    const venue = await getVenueById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Venue not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Get venue error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch venue' } },
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
    const existing = await getVenueById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Venue not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = venueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid venue data',
            details: parsed.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const venue = await updateVenue(params.id, parsed.data);
    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Update venue error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update venue' } },
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
    const existing = await getVenueById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Venue not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = venueStatusSchema.safeParse(body);

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

    const venue = await updateVenueStatus(params.id, parsed.data.status);
    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Update venue status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update venue status' } },
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
    const existing = await getVenueById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Venue not found' } },
        { status: 404 }
      );
    }

    await deleteVenue(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete venue error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete venue' } },
      { status: 500 }
    );
  }
}
