import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getSite, checkOrigin, getCorsHeaders } from '@/lib/api-utils';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache';

export const runtime = 'edge';

export async function GET(request) {
  // Wrap everything in try-catch to handle any parsing errors
  let siteName, pathName, origin, ip;

  try {
    const { searchParams } = new URL(request.url);
    siteName = searchParams.get('siteName');
    pathName = searchParams.get('pathName');

    // Get and sanitize origin header
    origin = request.headers.get('origin');
    if (origin && typeof origin === 'string') {
      origin = origin.trim();
      // If origin looks malformed, set to null
      if (!origin.match(/^https?:\/\/[a-z0-9.-]+/i) || origin.length > 500) {
        origin = null;
      }
    }

    ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  } catch (e) {
    // Return early if we can't even parse the request
    return new NextResponse('Invalid request format', { status: 400 });
  }

  // Rate limiting (with error handling)
  let rateLimitResult;
  try {
    rateLimitResult = await checkRateLimit(rateLimiters?.thread, ip);
  } catch (e) {
    rateLimitResult = { success: true, headers: {} };
  }

  const { success, headers } = rateLimitResult;

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

    // Check origin if provided and if site has a domain configured
    if (origin && site.domain) {
      const validOrigin = checkOrigin(origin, site.domain);
      if (!validOrigin) {
        return new NextResponse('invalid origin', { status: 400, headers: getCorsHeaders(origin) });
      }
    } else if (!origin && process.env.NODE_ENV !== 'development') {
      // In production, require origin header for security
      return new NextResponse('missing origin header', { status: 400, headers: getCorsHeaders(origin) });
    }

    // Use cache for comments (5 minutes TTL)
    const comments = await getCached(
      cacheKeys.comments(siteName, pathName),
      async () => {
        const { data, error } = await supabaseAdmin
          .from('comments')
          .select('*')
          .eq('sitename', siteName)
          .eq('pathname', pathName)
          .order('timestamp', { ascending: false });

        if (error) {
          throw new Error('Error fetching comments');
        }

        return data || [];
      },
      CACHE_TTL.COMMENTS
    );

    return NextResponse.json(comments, { headers: getCorsHeaders(origin) });

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
