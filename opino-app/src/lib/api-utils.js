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
  // Return false if either parameter is missing or invalid
  if (!origin || !registeredDomain || typeof origin !== 'string' || typeof registeredDomain !== 'string') {
    return false;
  }

  // Trim whitespace
  origin = origin.trim();
  registeredDomain = registeredDomain.trim();

  if (!origin || !registeredDomain) {
    return false;
  }

  try {
    // Ensure origin is a valid URL (must have protocol)
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      return false;
    }

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

// Allowed origins for dashboard API
const ALLOWED_ORIGINS_FOR_DASHBOARD = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'https://localhost:3000',
].filter(Boolean);

/**
 * Get CORS headers based on API type
 * @param {string} origin - Request origin
 * @param {boolean} isPublicApi - Whether this is a public widget API
 * @returns {Object} CORS headers
 */
export function getCorsHeaders(origin, isPublicApi = true) {
  // For public widget API - allow registered site origins
  if (isPublicApi) {
    return {
      'Access-Control-Allow-Origin': origin || '',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }

  // For dashboard API - strict origin checking
  const allowedOrigin = ALLOWED_ORIGINS_FOR_DASHBOARD.includes(origin) ? origin : '';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}
