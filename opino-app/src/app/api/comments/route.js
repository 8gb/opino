import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const siteFilter = searchParams.get('siteId');

  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 per page
  const offset = (page - 1) * limit;

  try {
    // Query with count for pagination metadata
    let query = supabaseAdmin.from('comments').select('*', { count: 'exact' });

    query = query.eq('uid', user.uid);

    if (siteFilter && siteFilter !== 'all') {
      query = query.eq('sitename', siteFilter);
    }

    // Apply pagination and ordering
    const { data, count, error } = await query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Return paginated response
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + (data?.length || 0) < (count || 0),
      }
    });
  } catch (error) {
    logger.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
