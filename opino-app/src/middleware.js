import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request) {
  const hostname = request.headers.get('host');
  const url = request.nextUrl;

  // Define the API domain
  // Since we don't know the user's specific domain, we use an env var.
  // Example: api.opino.com
  const apiDomain = process.env.API_DOMAIN;

  // Check if the hostname matches the API domain
  if (apiDomain && hostname === apiDomain) {
    // If path doesn't start with /api, rewrite it to /api
    // This allows api.opino.com/thread to map to /api/thread
    if (!url.pathname.startsWith('/api')) {
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}
