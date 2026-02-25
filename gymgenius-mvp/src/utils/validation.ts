/**
 * Validira email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validira snagu lozinke
 * Minimum 8 karaktera, bar jedno veliko slovo, broj i specijalni karakter
 */
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
}

/**
 * Sanitizuje string (uklanja HTML tagove)
 */
export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validira broj (mora biti pozitivan)
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Sanitizuje HTML da spreči XSS napade
 * Koristi DOMPurify za sigurno čišćenje
 */
export function sanitizeHtml(input: string): string {
  try {
    const DOMPurify = require('isomorphic-dompurify').default;
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Ne dozvoli HTML tagove
      ALLOWED_ATTR: [],
    });
  } catch (error) {
    // Fallback: simple HTML tag removal
    return input.replace(/<[^>]*>/g, '').trim();
  }
}

/**
 * Validira i sanitizuje URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    // Dozvoli samo http i https protokole
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }

    return parsedUrl.toString();
  } catch {
    return '';
  }
}

/**
 * Validira da input ne sadrži potencijalno opasne karaktere
 */
export function isSecureInput(input: string): boolean {
  // Proveri za SQL injection pokušaje
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
  ];

  // Proveri za XSS pokušaje
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
  ];

  const allPatterns = [...sqlPatterns, ...xssPatterns];

  return !allPatterns.some((pattern) => pattern.test(input));
}

/**
 * Escape special characters za bezbedno prikazivanje
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}