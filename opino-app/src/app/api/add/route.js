import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getSite, checkOrigin, getCorsHeaders } from '@/lib/api-utils';
import { CommentSchema, validate } from '@/lib/validation';
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit';
import { verifyCaptcha } from '@/lib/captcha';

export const runtime = 'edge';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const querySiteName = searchParams.get('siteName');
  const origin = request.headers.get('origin');

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const { success, headers } = await checkRateLimit(rateLimiters?.comment, ip);

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

    if (!checkOrigin(origin, site.domain)) {
      return new NextResponse('invalid origin', { status: 400, headers: getCorsHeaders(origin) });
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
