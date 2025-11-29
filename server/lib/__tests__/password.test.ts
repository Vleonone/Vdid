/**
 * Password Utility Tests
 * 测试密码哈希和验证功能
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../password';

describe('Password Utility', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$argon2')).toBe(true);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept a strong password', () => {
      const result = validatePasswordStrength('StrongP@ss123!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a password that is too short', () => {
      const result = validatePasswordStrength('Abc1!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('8'))).toBe(true);
    });

    it('should reject a password without uppercase', () => {
      const result = validatePasswordStrength('lowercase123!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('uppercase'))).toBe(true);
    });

    it('should reject a password without lowercase', () => {
      const result = validatePasswordStrength('UPPERCASE123!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('lowercase'))).toBe(true);
    });

    it('should reject a password without numbers', () => {
      const result = validatePasswordStrength('NoNumbers!!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('number'))).toBe(true);
    });

    it('should reject a password without special characters', () => {
      const result = validatePasswordStrength('NoSpecial123');

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.toLowerCase().includes('special'))).toBe(true);
    });
  });
});
