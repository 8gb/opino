import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';
import { SiteSchema, validate } from '@/lib/validation';

export const GET = withAuth(async (request, { user }) => {
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
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();

    // Validate domain
    const validation = validate(SiteSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { domain } = validation.data;

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
});
