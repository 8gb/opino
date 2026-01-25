import { NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/api-utils';

export const runtime = 'edge';

export async function GET(request, { params }) {
  const { id } = await params;
  const origin = request.headers.get('origin');
  
  return new NextResponse(id, { status: 200, headers: getCorsHeaders(origin) });
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
