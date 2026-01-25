import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/get-user';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
}
