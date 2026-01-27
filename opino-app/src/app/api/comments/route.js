import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const siteFilter = searchParams.get('siteId');

  try {
    let query = supabaseAdmin.from('comments').select('*');

    query = query.eq('uid', user.uid);

    if (siteFilter && siteFilter !== 'all') {
        query = query.eq('sitename', siteFilter);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
