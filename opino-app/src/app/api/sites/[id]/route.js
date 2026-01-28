import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';
import { invalidateCachePattern, invalidateCache, cacheKeys } from '@/lib/cache';

export const PUT = withAuth(async (request, { user, params }) => {
  const { id } = await params;

  try {
    const body = await request.json();
    const { domain } = body;

    // Verify ownership
    let checkQuery = supabaseAdmin.from('sites').select('id').eq('id', id);
    checkQuery = checkQuery.eq('uid', user.uid);
    const { data: existing } = await checkQuery.single();

    if (!existing) {
        return NextResponse.json({ error: 'Site not found or permission denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('sites')
      .update({ domain })
      .eq('id', id);

    if (error) throw error;

    // Invalidate cache for sites list and specific site after update
    await invalidateCachePattern(`sites:list:${user.uid}`);
    await invalidateCache(cacheKeys.site(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { user, params }) => {
  const { id } = await params;

  try {
     // Verify ownership
    let checkQuery = supabaseAdmin.from('sites').select('id').eq('id', id);
    checkQuery = checkQuery.eq('uid', user.uid);
    const { data: existing } = await checkQuery.single();

    if (!existing) {
        return NextResponse.json({ error: 'Site not found or permission denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from('sites').delete().eq('id', id);
    if (error) throw error;

    // Invalidate cache for sites list, stats, and all comments for this site after deletion
    await invalidateCachePattern(`sites:list:${user.uid}`);
    await invalidateCachePattern(`stats:${user.uid}`);
    await invalidateCachePattern(`comments:${id}:*`);
    await invalidateCache(cacheKeys.site(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
