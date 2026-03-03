import { generateCsrfToken, hashCsrfToken, validateCsrfToken, isStateChangingMethod } from '../csrf';

describe('CSRF Protection Tests', () => {
  describe('generateCsrfToken', () => {
    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
    });

    it('should generate hex string', () => {
      const token = generateCsrfToken();
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  describe('hashCsrfToken', () => {
    it('should generate consistent hash for same token', async () => {
      const token = 'test-token-123';
      const hash1 = await hashCsrfToken(token);
      const hash2 = await hashCsrfToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different tokens', async () => {
      const hash1 = await hashCsrfToken('token1');
      const hash2 = await hashCsrfToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate correct token-hash pair', async () => {
      const token = generateCsrfToken();
      const hash = await hashCsrfToken(token);

      expect(await validateCsrfToken(token, hash)).toBe(true);
    });

    it('should reject incorrect token', async () => {
      const token = generateCsrfToken();
      const hash = await hashCsrfToken(token);
      const wrongToken = generateCsrfToken();

      expect(await validateCsrfToken(wrongToken, hash)).toBe(false);
    });

    it('should reject empty token', async () => {
      const hash = await hashCsrfToken('some-token');

      expect(await validateCsrfToken('', hash)).toBe(false);
    });

    it('should reject empty hash', async () => {
      const token = generateCsrfToken();

      expect(await validateCsrfToken(token, '')).toBe(false);
    });
  });

  describe('isStateChangingMethod', () => {
    it('should identify state-changing methods', () => {
      expect(isStateChangingMethod('POST')).toBe(true);
      expect(isStateChangingMethod('PUT')).toBe(true);
      expect(isStateChangingMethod('DELETE')).toBe(true);
      expect(isStateChangingMethod('PATCH')).toBe(true);
    });

    it('should identify safe methods', () => {
      expect(isStateChangingMethod('GET')).toBe(false);
      expect(isStateChangingMethod('HEAD')).toBe(false);
      expect(isStateChangingMethod('OPTIONS')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isStateChangingMethod('post')).toBe(true);
      expect(isStateChangingMethod('Post')).toBe(true);
      expect(isStateChangingMethod('get')).toBe(false);
    });
  });
});
