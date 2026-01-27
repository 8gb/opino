import { checkOrigin, getCorsHeaders, getSite } from '../api-utils';

describe('checkOrigin', () => {
  describe('exact domain matches', () => {
    it('should accept exact domain match', () => {
      expect(checkOrigin('https://example.com', 'example.com')).toBe(true);
    });

    it('should accept exact domain match with http', () => {
      expect(checkOrigin('http://example.com', 'example.com')).toBe(true);
    });

    it('should accept www subdomain', () => {
      expect(checkOrigin('https://www.example.com', 'example.com')).toBe(true);
    });

    it('should accept domain registered with www', () => {
      expect(checkOrigin('https://example.com', 'www.example.com')).toBe(true);
      expect(checkOrigin('https://www.example.com', 'www.example.com')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(checkOrigin('https://EXAMPLE.COM', 'example.com')).toBe(true);
      expect(checkOrigin('https://example.com', 'EXAMPLE.COM')).toBe(true);
    });
  });

  describe('valid subdomains', () => {
    it('should accept valid subdomains', () => {
      expect(checkOrigin('https://blog.example.com', 'example.com')).toBe(true);
      expect(checkOrigin('https://api.example.com', 'example.com')).toBe(true);
      expect(checkOrigin('https://shop.example.com', 'example.com')).toBe(true);
    });

    it('should accept nested subdomains', () => {
      expect(checkOrigin('https://admin.api.example.com', 'example.com')).toBe(true);
    });
  });

  describe('security - domain spoofing attacks', () => {
    it('should reject domain prefix attacks', () => {
      expect(checkOrigin('https://attacker-example.com', 'example.com')).toBe(false);
      expect(checkOrigin('https://example.com-attacker.com', 'example.com')).toBe(false);
    });

    it('should reject domain suffix attacks', () => {
      expect(checkOrigin('https://example.com.attacker.com', 'example.com')).toBe(false);
    });

    it('should reject partial domain matches', () => {
      expect(checkOrigin('https://notexample.com', 'example.com')).toBe(false);
      expect(checkOrigin('https://examplesite.com', 'example.com')).toBe(false);
    });

    it('should reject completely different domains', () => {
      expect(checkOrigin('https://attacker.com', 'example.com')).toBe(false);
      expect(checkOrigin('https://evil.net', 'example.com')).toBe(false);
    });
  });

  describe('input validation', () => {
    it('should reject null/undefined origin', () => {
      expect(checkOrigin(null, 'example.com')).toBe(false);
      expect(checkOrigin(undefined, 'example.com')).toBe(false);
    });

    it('should reject null/undefined domain', () => {
      expect(checkOrigin('https://example.com', null)).toBe(false);
      expect(checkOrigin('https://example.com', undefined)).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(checkOrigin(123, 'example.com')).toBe(false);
      expect(checkOrigin('https://example.com', 456)).toBe(false);
      expect(checkOrigin({}, 'example.com')).toBe(false);
      expect(checkOrigin('https://example.com', [])).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(checkOrigin('', 'example.com')).toBe(false);
      expect(checkOrigin('https://example.com', '')).toBe(false);
    });

    it('should reject whitespace-only strings', () => {
      expect(checkOrigin('   ', 'example.com')).toBe(false);
      expect(checkOrigin('https://example.com', '   ')).toBe(false);
    });

    it('should handle strings with whitespace', () => {
      expect(checkOrigin(' https://example.com ', 'example.com')).toBe(true);
      expect(checkOrigin('https://example.com', ' example.com ')).toBe(true);
    });
  });

  describe('protocol validation', () => {
    it('should require http or https protocol', () => {
      expect(checkOrigin('example.com', 'example.com')).toBe(false);
      expect(checkOrigin('ftp://example.com', 'example.com')).toBe(false);
      expect(checkOrigin('file://example.com', 'example.com')).toBe(false);
      expect(checkOrigin('javascript://example.com', 'example.com')).toBe(false);
    });
  });

  describe('malformed URLs', () => {
    it('should reject invalid URLs', () => {
      expect(checkOrigin('not-a-url', 'example.com')).toBe(false);
      expect(checkOrigin('http://', 'example.com')).toBe(false);
      expect(checkOrigin('https://', 'example.com')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle ports in origin', () => {
      expect(checkOrigin('https://example.com:3000', 'example.com')).toBe(true);
      expect(checkOrigin('http://localhost:3000', 'localhost')).toBe(true);
    });

    it('should handle paths and query strings in origin', () => {
      expect(checkOrigin('https://example.com/path', 'example.com')).toBe(true);
      expect(checkOrigin('https://example.com?query=1', 'example.com')).toBe(true);
    });

    it('should handle single-word domains', () => {
      expect(checkOrigin('http://localhost', 'localhost')).toBe(true);
    });
  });
});

describe('getCorsHeaders', () => {
  describe('public API (isPublicApi = true)', () => {
    it('should allow any provided origin for public API', () => {
      const headers = getCorsHeaders('https://example.com', true);
      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    });

    it('should return empty string for no origin', () => {
      const headers = getCorsHeaders('', true);
      expect(headers['Access-Control-Allow-Origin']).toBe('');
    });

    it('should include appropriate methods for public API', () => {
      const headers = getCorsHeaders('https://example.com', true);
      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
    });

    it('should only allow Content-Type header for public API', () => {
      const headers = getCorsHeaders('https://example.com', true);
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });

    it('should not include credentials for public API', () => {
      const headers = getCorsHeaders('https://example.com', true);
      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });

    it('should include cache control header', () => {
      const headers = getCorsHeaders('https://example.com', true);
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });
  });

  describe('dashboard API (isPublicApi = false)', () => {
    it('should allow whitelisted origins when NEXT_PUBLIC_APP_URL is set', () => {
      // Note: This test depends on the environment variable being set at module load time
      // In real usage, NEXT_PUBLIC_APP_URL should be set in .env files
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl) {
        const headers = getCorsHeaders(appUrl, false);
        expect(headers['Access-Control-Allow-Origin']).toBe(appUrl);
      } else {
        // If not set, just verify it returns empty string
        const headers = getCorsHeaders('https://app.opino.example.com', false);
        expect(headers['Access-Control-Allow-Origin']).toBe('');
      }
    });

    it('should allow localhost origins', () => {
      const headers = getCorsHeaders('http://localhost:3000', false);
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    });

    it('should reject non-whitelisted origins', () => {
      const headers = getCorsHeaders('https://evil.com', false);
      expect(headers['Access-Control-Allow-Origin']).toBe('');
    });

    it('should include full HTTP methods for dashboard API', () => {
      const headers = getCorsHeaders('http://localhost:3000', false);
      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS');
    });

    it('should include Authorization header for dashboard API', () => {
      const headers = getCorsHeaders('http://localhost:3000', false);
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
    });

    it('should include credentials for dashboard API', () => {
      const headers = getCorsHeaders('http://localhost:3000', false);
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should return empty origin for null input', () => {
      const headers = getCorsHeaders(null, false);
      expect(headers['Access-Control-Allow-Origin']).toBe('');
    });
  });

  describe('default parameter', () => {
    it('should default to public API when isPublicApi is not provided', () => {
      const headers = getCorsHeaders('https://example.com');
      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });
});

describe('getSite', () => {
  // Note: This would require mocking supabaseAdmin
  // For now, just test the basic structure
  it('should return null for empty siteName', async () => {
    const result = await getSite('');
    expect(result).toBeNull();
  });

  it('should return null for null siteName', async () => {
    const result = await getSite(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined siteName', async () => {
    const result = await getSite(undefined);
    expect(result).toBeNull();
  });
});
