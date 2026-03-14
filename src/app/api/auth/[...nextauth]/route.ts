// Auth is now handled by Supabase Auth
// This file is kept for backward compatibility but the route is no longer used
// Sign in/out is done via /api/auth/login and /api/auth/logout

import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Auth is handled by Supabase' });
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Auth is handled by Supabase' });
}
