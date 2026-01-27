import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getSite, checkOrigin, getCorsHeaders } from '@/lib/api-utils';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteName = searchParams.get('siteName');
  const pathName = searchParams.get('pathName');
  const origin = request.headers.get('origin');

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const { success, headers } = await checkRateLimit(rateLimiters?.thread, ip);

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { ...getCorsHeaders(origin), ...headers },
    });
  }

  if (!siteName) {
    return new NextResponse('no siteName', { status: 400, headers: getCorsHeaders(origin) });
  }

  try {
    const site = await getSite(siteName);

    if (!site || (!site.domain && !site.uid)) {
      return new NextResponse('invalid site', { status: 400, headers: getCorsHeaders(origin) });
    }

    const validOrigin = checkOrigin(origin, site.domain);
    if (!validOrigin) {
      return new NextResponse('invalid origin', { status: 400, headers: getCorsHeaders(origin) });
    }

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('sitename', siteName)
      .eq('pathname', pathName);

    if (error) {
      return new NextResponse('Error fetching comments', { status: 500, headers: getCorsHeaders(origin) });
    }

    return NextResponse.json(comments || [], { headers: getCorsHeaders(origin) });

  } catch (e) {
    return new NextResponse('Internal Server Error', { status: 500, headers: getCorsHeaders(origin) });
  }
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
