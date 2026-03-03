/**
 * CSRF Token Generation and Validation
 * Implements double-submit cookie pattern
 * Uses Web Crypto API for Edge Runtime compatibility
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

/**
 * Generiše CSRF token koristeći Web Crypto API (Edge Runtime kompatibilno)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Kreira hash od tokena za validaciju koristeći Web Crypto API
 */
export async function hashCsrfToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${token}${CSRF_SECRET}`);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validira CSRF token
 */
export async function validateCsrfToken(token: string, hashedToken: string): Promise<boolean> {
  if (!token || !hashedToken) {
    return false;
  }

  const expectedHash = await hashCsrfToken(token);
  return expectedHash === hashedToken;
}

/**
 * Proveri da li je metoda state-changing (zahteva CSRF zaštitu)
 */
export function isStateChangingMethod(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
}
