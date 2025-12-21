import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';

  const now = new Date().toISOString();

  console.log(`[VISIT] ${now} - IP: ${ip} - URL: ${req.nextUrl.pathname}`);

  return NextResponse.next();
}
