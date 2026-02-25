/**
 * CSRF Token Generation and Validation
 * Implements double-submit cookie pattern
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

// Lazy load crypto to avoid Edge Runtime issues
function getCrypto() {
  // @ts-ignore
  return require('crypto');
}

/**
 * Generiše CSRF token
 */
export function generateCsrfToken(): string {
  const { randomBytes } = getCrypto();
  const token = randomBytes(32).toString('hex');
  return token;
}

/**
 * Kreira hash od tokena za validaciju
 */
export function hashCsrfToken(token: string): string {
  const { createHash } = getCrypto();
  return createHash('sha256')
    .update(`${token}${CSRF_SECRET}`)
    .digest('hex');
}

/**
 * Validira CSRF token
 */
export function validateCsrfToken(token: string, hashedToken: string): boolean {
  if (!token || !hashedToken) {
    return false;
  }

  const expectedHash = hashCsrfToken(token);
  return expectedHash === hashedToken;
}

/**
 * Proveri da li je metoda state-changing (zahteva CSRF zaštitu)
 */
export function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}
