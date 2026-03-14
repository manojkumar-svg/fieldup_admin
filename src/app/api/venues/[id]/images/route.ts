import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listVenueImages, addVenueImage, deleteVenueImage } from '@/lib/services/venue-images';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const images = await listVenueImages(params.id);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('List venue images error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch images' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file provided' } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' } },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File size exceeds 5MB limit' } },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${params.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('venue-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('venue-images')
      .getPublicUrl(fileName);

    const image = await addVenueImage(params.id, publicUrl, caption ?? undefined);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('Upload venue image error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload image' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Image ID required' } },
        { status: 400 }
      );
    }

    await deleteVenueImage(imageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete venue image error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete image' } },
      { status: 500 }
    );
  }
}
