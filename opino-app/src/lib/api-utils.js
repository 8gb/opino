import supabaseAdmin from './supabase-server';

export async function getSite(siteName) {
  if (!siteName) return null;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('id', siteName)
      .single();

    if (error || !data) {
      console.error('getSite error:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error('getSite exception:', e);
    return null;
  }
}

export function checkOrigin(origin, domain) {
  if (!origin) return false;
  // Simple inclusion check as per original code
  if (origin.toString().includes(domain)) {
    return true;
  }
  return false;
}

export function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
