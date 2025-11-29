/**
 * JWT Utility Tests
 * 测试 JWT 令牌生成和验证功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  generateSessionId,
  isTokenExpiringSoon,
} from '../jwt';

// Mock the config module
vi.mock('../../config', () => ({
  config: {
    JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
    JWT_ISSUER: 'vdid-test',
  },
}));

describe('JWT Utility', () => {
  const mockUserId = 123;
  const mockVid = 'VID-TEST-123';
  const mockEmail = 'test@example.com';
  const mockSessionId = 'session-id-123';

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken({
        userId: mockUserId,
        vid: mockVid,
        email: mockEmail,
        sessionId: mockSessionId,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken({
        userId: mockUserId,
        sessionId: mockSessionId,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const result = generateTokenPair(mockUserId, mockVid, mockEmail, mockSessionId);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessTokenExpires).toBeInstanceOf(Date);
      expect(result.refreshTokenExpires).toBeInstanceOf(Date);
    });

    it('should set correct expiration times', () => {
      const now = Date.now();
      const result = generateTokenPair(mockUserId, mockVid, mockEmail, mockSessionId);

      // Access token expires in 15 minutes
      const accessExpiresMs = result.accessTokenExpires.getTime();
      expect(accessExpiresMs).toBeGreaterThan(now);
      expect(accessExpiresMs).toBeLessThanOrEqual(now + 16 * 60 * 1000);

      // Refresh token expires in 7 days
      const refreshExpiresMs = result.refreshTokenExpires.getTime();
      expect(refreshExpiresMs).toBeGreaterThan(now);
      expect(refreshExpiresMs).toBeLessThanOrEqual(now + 8 * 24 * 60 * 60 * 1000);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken({
        userId: mockUserId,
        vid: mockVid,
        email: mockEmail,
        sessionId: mockSessionId,
      });

      const payload = verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUserId);
      expect(payload?.vid).toBe(mockVid);
      expect(payload?.email).toBe(mockEmail);
      expect(payload?.sessionId).toBe(mockSessionId);
      expect(payload?.type).toBe('access');
    });

    it('should return null for an invalid token', () => {
      const payload = verifyAccessToken('invalid-token');

      expect(payload).toBeNull();
    });

    it('should return null for a refresh token', () => {
      const refreshToken = generateRefreshToken({
        userId: mockUserId,
        sessionId: mockSessionId,
      });

      const payload = verifyAccessToken(refreshToken);

      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken({
        userId: mockUserId,
        sessionId: mockSessionId,
      });

      const payload = verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUserId);
      expect(payload?.sessionId).toBe(mockSessionId);
      expect(payload?.type).toBe('refresh');
    });

    it('should return null for an access token', () => {
      const accessToken = generateAccessToken({
        userId: mockUserId,
        vid: mockVid,
        email: mockEmail,
        sessionId: mockSessionId,
      });

      const payload = verifyRefreshToken(accessToken);

      expect(payload).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = extractTokenFromHeader('Bearer my-token-123');

      expect(token).toBe('my-token-123');
    });

    it('should return null for missing header', () => {
      const token = extractTokenFromHeader(undefined);

      expect(token).toBeNull();
    });

    it('should return null for invalid format', () => {
      expect(extractTokenFromHeader('my-token-123')).toBeNull();
      expect(extractTokenFromHeader('Basic my-token-123')).toBeNull();
      expect(extractTokenFromHeader('Bearer')).toBeNull();
    });
  });

  describe('generateSessionId', () => {
    it('should generate a unique session ID', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate a string of appropriate length', () => {
      const id = generateSessionId();

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return true for an invalid token', () => {
      const result = isTokenExpiringSoon('invalid-token');

      expect(result).toBe(true);
    });

    it('should return false for a fresh token', () => {
      const token = generateAccessToken({
        userId: mockUserId,
        vid: mockVid,
        email: mockEmail,
        sessionId: mockSessionId,
      });

      const result = isTokenExpiringSoon(token, 5);

      expect(result).toBe(false);
    });
  });
});
