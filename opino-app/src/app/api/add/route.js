import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getSite, checkOrigin, getCorsHeaders } from '@/lib/api-utils';
import { CommentSchema, validate } from '@/lib/validation';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { verifyCaptcha } from '@/lib/captcha';

export const runtime = 'edge';

export async function POST(request) {
  // Wrap everything in try-catch to handle any parsing errors
  let querySiteName, origin, ip;

  try {
    const { searchParams } = new URL(request.url);
    querySiteName = searchParams.get('siteName');

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
    rateLimitResult = await checkRateLimit(rateLimiters?.comment, ip);
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

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new NextResponse('Invalid JSON body', { status: 400, headers: getCorsHeaders(origin) });
  }
  
  // body.siteName can override query if logic allows, but here we check consistency
  const siteName = body.siteName || querySiteName;
  // Wait, original logic:
  // req.query.siteName && (siteName = req.query.siteName)
  // req.body.siteName && (siteName = req.body.siteName)
  // So body takes precedence.

  if (!siteName) {
      return new NextResponse('invalid sitename', { status: 400, headers: getCorsHeaders(origin) });
  }

  if (querySiteName && body.siteName && (querySiteName !== body.siteName)) {
    return new NextResponse('query and body sitename is not the same', { status: 400, headers: getCorsHeaders(origin) });
  }

  // Validate input
  const validation = validate(CommentSchema, {
    siteName,
    pathName: body.pathName,
    message: body.message,
    author: body.author,
    parent: body.parent,
  });

  if (!validation.success) {
    return new NextResponse(validation.error, {
      status: 400,
      headers: getCorsHeaders(origin)
    });
  }

  const { pathName, message, author, parent } = validation.data;

  // Verify captcha if token is provided
  if (body.captchaToken) {
    const captchaValid = await verifyCaptcha(body.captchaToken);
    if (!captchaValid) {
      return new NextResponse('Invalid captcha', {
        status: 400,
        headers: getCorsHeaders(origin)
      });
    }
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

    const comment = {
      sitename: siteName,
      message,
      timestamp: Date.now(),
      pathname: pathName,
      author,
      parent: (parent && typeof parent === 'string' && parent.trim().length > 0) ? parent : null,
      uid: site.uid
    };

    const { error } = await supabaseAdmin.from('comments').insert(comment);

    if (error) {
      return new NextResponse('Error adding comment', { status: 500, headers: getCorsHeaders(origin) });
    }

    return new NextResponse(null, { status: 200, headers: getCorsHeaders(origin) });

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
