import { getUserFromRequest } from './get-user';
import { NextResponse } from 'next/server';

/**
 * Authentication middleware wrapper for API routes
 * Ensures user is authenticated before allowing access
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with authentication check
 *
 * @example
 * export const GET = withAuth(async (request, { user, params }) => {
 *   // user is guaranteed to exist here
 *   return NextResponse.json({ data: 'protected data' });
 * });
 */
export function withAuth(handler) {
  return async (request, context) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Attach user to context for handler access
    const enhancedContext = {
      ...context,
      user,
    };

    return handler(request, enhancedContext);
  };
}

/**
 * Optional authentication middleware wrapper
 * Attaches user to context if authenticated, but doesn't require it
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with optional authentication
 *
 * @example
 * export const GET = withOptionalAuth(async (request, { user, params }) => {
 *   // user may be null if not authenticated
 *   return NextResponse.json({ data: 'public data' });
 * });
 */
export function withOptionalAuth(handler) {
  return async (request, context) => {
    const user = await getUserFromRequest(request);

    const enhancedContext = {
      ...context,
      user: user || null,
    };

    return handler(request, enhancedContext);
  };
}
