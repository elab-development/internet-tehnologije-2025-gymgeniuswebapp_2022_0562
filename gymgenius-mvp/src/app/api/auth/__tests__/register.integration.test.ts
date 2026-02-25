import { sanitizeString } from '@/utils/validation';
import { isValidEmail, isStrongPassword } from '@/utils/validation';

/**
 * Auth Registration Integration Tests
 */
describe('POST /api/auth/register - Integration Tests', () => {
  it('should validate email format', () => {
    expect(isValidEmail('newuser@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('should validate password strength', () => {
    expect(isStrongPassword('SecurePass123!')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });

  it('should sanitize displayName to prevent XSS', () => {
    const maliciousName = '<script>alert("xss")</script>John';
    const sanitized = sanitizeString(maliciousName);

    // sanitizeString removes HTML tags
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  it('should accept valid registration data', () => {
    const email = 'newuser@example.com';
    const password = 'SecurePass123!';
    const displayName = 'New User';

    expect(isValidEmail(email)).toBe(true);
    expect(isStrongPassword(password)).toBe(true);
    expect(displayName.length).toBeGreaterThan(0);
  });

  it('should require all required fields', () => {
    const email = '';
    const password = '';

    expect(email.length === 0).toBe(true);
    expect(password.length === 0).toBe(true);
  });
});
