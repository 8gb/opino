/**
 * Verifies a Cloudflare Turnstile captcha token
 * @param {string} token - The captcha token from the client
 * @returns {Promise<boolean>} - True if captcha is valid
 */
export async function verifyCaptcha(token) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key is configured, skip captcha verification
  // This allows the app to work without captcha during development
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Turnstile secret key not configured. Captcha verification is disabled.');
    }
    return true; // Allow in development/when not configured
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    // In case of error, fail closed (reject the request)
    return false;
  }
}
