import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    status: hasSupabaseUrl && hasAnonKey ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? 'set' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnonKey ? 'set' : 'MISSING',
    },
  });
}
