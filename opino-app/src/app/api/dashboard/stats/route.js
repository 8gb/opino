import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, { user }) => {
  try {
    // Helper to apply user filter
    const applyUserFilter = (query) => {
        return query.eq('uid', user.uid);
    };

    // Parallel requests
    const [sitesCountRes, commentsCountRes, recentSitesRes] = await Promise.all([
      applyUserFilter(supabaseAdmin.from('sites').select('*', { count: 'exact', head: true })),
      applyUserFilter(supabaseAdmin.from('comments').select('*', { count: 'exact', head: true })),
      applyUserFilter(supabaseAdmin.from('sites').select('*')).order('_created_at', { ascending: false }).limit(5)
    ]);

    if (sitesCountRes.error) throw sitesCountRes.error;
    if (commentsCountRes.error) throw commentsCountRes.error;
    if (recentSitesRes.error) throw recentSitesRes.error;

    return NextResponse.json({
      stats: {
        sites: sitesCountRes.count || 0,
        comments: commentsCountRes.count || 0,
      },
      recentSites: recentSitesRes.data || []
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
