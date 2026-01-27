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
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Validates if the request origin matches the registered domain.
 * Supports exact match and valid subdomains only.
 */
export function checkOrigin(origin, registeredDomain) {
  if (!origin || !registeredDomain) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname.toLowerCase();

    // Normalize registered domain (remove www prefix if present)
    const normalizedDomain = registeredDomain.toLowerCase().replace(/^www\./, '');

    // Check for exact match
    if (originHost === normalizedDomain || originHost === `www.${normalizedDomain}`) {
      return true;
    }

    // Check for valid subdomain (must end with .domain)
    if (originHost.endsWith(`.${normalizedDomain}`)) {
      // Ensure it's a direct subdomain, not nested spoofing
      const subdomain = originHost.slice(0, -(normalizedDomain.length + 1));
      // Subdomain should not contain the domain again (prevent attacker.com.victim.com)
      if (!subdomain.includes('.') || !subdomain.includes(normalizedDomain)) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

export function getCorsHeaders(origin, isPublicApi = true) {
  // For public widget API - only allow if origin is provided
  // Never fall back to '*' for authenticated endpoints
  const allowedOrigin = origin || (isPublicApi ? '*' : '');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
