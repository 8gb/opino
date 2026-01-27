import supabaseAdmin from './supabase-server';

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }
  
  return {
    ...user,
    uid: user.id
  };
}
