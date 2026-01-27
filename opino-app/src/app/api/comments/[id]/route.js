import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-server';
import { withAuth } from '@/lib/auth-middleware';

export const DELETE = withAuth(async (request, { user, params }) => {
  const { id } = await params;

  try {
    // Verify ownership
    let checkQuery = supabaseAdmin.from('comments').select('id').eq('id', id);
    checkQuery = checkQuery.eq('uid', user.uid);
    const { data: existing } = await checkQuery.single();

    if (!existing) {
        return NextResponse.json({ error: 'Comment not found or permission denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from('comments').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
