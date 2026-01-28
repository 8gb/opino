import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';
import { invalidateCache, invalidateCachePattern, cacheKeys } from '@/lib/cache';

export const DELETE = withAuth(async (request, { user, params }) => {
  const { id } = await params;

  try {
    // Get comment details before deleting (for cache invalidation)
    let checkQuery = supabaseAdmin.from('comments').select('*').eq('id', id);
    checkQuery = checkQuery.eq('uid', user.uid);
    const { data: existing } = await checkQuery.single();

    if (!existing) {
        return NextResponse.json({ error: 'Comment not found or permission denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from('comments').delete().eq('id', id);

    if (error) throw error;

    // Invalidate cache for this thread
    if (existing.sitename && existing.pathname) {
      await invalidateCache(cacheKeys.comments(existing.sitename, existing.pathname));
    }
    // Invalidate user's comment list cache, stats, and sites list (for comment counts)
    await invalidateCachePattern(`comments:list:${user.uid}:*`);
    await invalidateCachePattern(`stats:${user.uid}`);
    await invalidateCachePattern(`sites:list:${user.uid}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
