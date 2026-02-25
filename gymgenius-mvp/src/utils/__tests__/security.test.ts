import {
  sanitizeString,
  sanitizeUrl,
  isSecureInput,
  escapeHtml,
} from '../validation';

// Mock DOMPurify to avoid Node.js environment issues
jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((input: string) => {
      // Simple sanitization: remove all HTML tags
      return input.replace(/<[^>]*>/g, '').trim();
    }),
  },
}));

describe('Security - XSS Protection', () => {
  describe('sanitizeUrl', () => {
    it('should allow valid HTTPS URLs', () => {
      const url = 'https://example.com/page';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should block javascript: protocol', () => {
      const malicious = 'javascript:alert(1)';
      expect(sanitizeUrl(malicious)).toBe('');
    });

    it('should block data: protocol', () => {
      const malicious = 'data:text/html,<script>alert(1)</script>';
      expect(sanitizeUrl(malicious)).toBe('');
    });
  });

  describe('isSecureInput', () => {
    it('should detect SQL injection attempts', () => {
      expect(isSecureInput("'; DROP TABLE users--")).toBe(false);
      expect(isSecureInput("SELECT * FROM users")).toBe(false);
      expect(isSecureInput("INSERT INTO users VALUES")).toBe(false);
    });

    it('should detect XSS attempts', () => {
      expect(isSecureInput('<script>alert(1)</script>')).toBe(false);
      expect(isSecureInput('javascript:alert(1)')).toBe(false);
      expect(isSecureInput('<img onerror="alert(1)">')).toBe(false);
    });

    it('should allow safe input', () => {
      expect(isSecureInput('John Doe')).toBe(true);
      expect(isSecureInput('test@example.com')).toBe(true);
      expect(isSecureInput('Hello World 123')).toBe(true);
    });
  });

  describe('escapeHtml', () => {
    it('should escape special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });
  });
});

describe('Security - CSRF Protection', () => {
  it('should generate CSRF token', async () => {
    const { generateCsrfToken } = await import('@/lib/csrf');
    const token = generateCsrfToken();

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should validate CSRF token', async () => {
    const { generateCsrfToken, hashCsrfToken, validateCsrfToken } = await import('@/lib/csrf');

    const token = generateCsrfToken();
    const hash = hashCsrfToken(token);

    expect(validateCsrfToken(token, hash)).toBe(true);
    expect(validateCsrfToken('wrong-token', hash)).toBe(false);
  });
});
