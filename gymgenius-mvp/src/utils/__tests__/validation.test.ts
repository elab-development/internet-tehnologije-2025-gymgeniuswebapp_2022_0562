import {
  isValidEmail,
  isStrongPassword,
  sanitizeString,
  isPositiveNumber,
} from '../validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should return true for strong passwords', () => {
      expect(isStrongPassword('SecurePass123!')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
      expect(isStrongPassword('Abcd1234!@#$')).toBe(true);
    });

    it('should return false for weak passwords', () => {
      expect(isStrongPassword('short')).toBe(false); // Too short
      expect(isStrongPassword('alllowercase123!')).toBe(false); // No uppercase
      expect(isStrongPassword('ALLUPPERCASE123!')).toBe(false); // No lowercase
      expect(isStrongPassword('NoNumbers!')).toBe(false); // No numbers
      expect(isStrongPassword('NoSpecialChar123')).toBe(false); // No special char
      expect(isStrongPassword('')).toBe(false); // Empty
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags from string', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeString('Hello <b>World</b>')).toBe('Hello World');
      expect(sanitizeString('<p>Test</p> <span>Content</span>')).toBe('Test Content');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  Hello  ')).toBe('Hello');
      expect(sanitizeString('\n\tTest\n')).toBe('Test');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
      expect(isPositiveNumber('42')).toBe(true);
    });

    it('should return false for non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-100.5)).toBe(false);
      expect(isPositiveNumber('abc')).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });
});
