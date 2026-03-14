import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const status = 'healthy';
  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
}
