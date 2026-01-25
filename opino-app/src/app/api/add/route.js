import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getSite, checkOrigin, getCorsHeaders } from '@/lib/api-utils';

export const runtime = 'edge';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const querySiteName = searchParams.get('siteName');
  const origin = request.headers.get('origin');
  
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
  
  const { pathName, message, author, parent } = body;
  
  if (!siteName) {
      return new NextResponse('invalid sitename', { status: 400, headers: getCorsHeaders(origin) });
  }

  if (querySiteName && body.siteName && (querySiteName !== body.siteName)) {
    return new NextResponse('query and body sitename is not the same', { status: 400, headers: getCorsHeaders(origin) });
  }
  
  if (!message) {
      console.log('no message');
      return new NextResponse(null, { status: 200, headers: getCorsHeaders(origin) });
  }

  try {
    const site = await getSite(siteName);
    
    if (!site || (!site.domain && !site.uid)) {
      return new NextResponse('invalid site', { status: 400, headers: getCorsHeaders(origin) });
    }

    if (!checkOrigin(origin, site.domain)) {
      console.log('INVALID ORIGIN', origin, site.domain);
      return new NextResponse('invalid origin', { status: 400, headers: getCorsHeaders(origin) });
    }

    console.log('Processing comment:', { siteName, message, author, parent });

    const comment = {
      sitename: siteName,
      message,
      timestamp: Date.now(),
      pathname: pathName,
      author,
      parent: (parent && typeof parent === 'string' && parent.trim().length > 0) ? parent : null,
      uid: site.uid
    };

    console.log('Inserting comment:', comment);

    const { error } = await supabaseAdmin.from('comments').insert(comment);

    if (error) {
      console.error('addComment error:', error);
      return new NextResponse('Error adding comment', { status: 500, headers: getCorsHeaders(origin) });
    }

    return new NextResponse(null, { status: 200, headers: getCorsHeaders(origin) });

  } catch (e) {
    console.error('POST /add error:', e);
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
