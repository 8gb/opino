import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/get-user';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch sites first
    let query = supabaseAdmin.from('sites').select('*');
    query = query.eq('uid', user.uid);
    const { data: sites, error } = await query.order('_created_at', { ascending: false });

    if (error) throw error;

    // 2. Fetch comment counts for each site in parallel
    const sitesWithCounts = await Promise.all(sites.map(async (site) => {
        const { count, error: countError } = await supabaseAdmin
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('sitename', site.id);
        
        return {
            ...site,
            comments: [{ count: count || 0 }]
        };
    }));

    return NextResponse.json(sitesWithCounts);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const newSite = {
      id: crypto.randomUUID(),
      uid: user.uid,
      domain,
    };

    const { data, error } = await supabaseAdmin.from('sites').insert([newSite]).select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
