import crypto from 'crypto';
/**
 * JWT (JSON Web Token) Utility
 * 用于生成和验证访问令牌
 */

import jwt from 'jsonwebtoken';
import { generateSecureToken } from './vid-generator';

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'vdid-default-secret-change-in-production';
const JWT_ISSUER = process.env.JWT_ISSUER || 'vdid.io';
const JWT_ACCESS_EXPIRES = '15m';  // 访问令牌 15 分钟
const JWT_REFRESH_EXPIRES = '7d';  // 刷新令牌 7 天

// Token 类型
export interface AccessTokenPayload {
  userId: string;
  vid: string;
  email: string;
  sessionId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: Date;
  refreshTokenExpires: Date;
}

/**
 * 生成访问令牌
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRES,
      issuer: JWT_ISSUER,
      subject: payload.userId,
    }
  );
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES,
      issuer: JWT_ISSUER,
      subject: payload.userId,
    }
  );
}

/**
 * 生成令牌对 (访问令牌 + 刷新令牌)
 */
export function generateTokenPair(
  userId: string,
  vid: string,
  email: string,
  sessionId: string
): TokenPair {
  const now = new Date();
  
  const accessToken = generateAccessToken({ userId, vid, email, sessionId });
  const refreshToken = generateRefreshToken({ userId, sessionId });
  
  return {
    accessToken,
    refreshToken,
    accessTokenExpires: new Date(now.getTime() + 15 * 60 * 1000), // 15 分钟
    refreshTokenExpires: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 天
  };
}

/**
 * 验证访问令牌
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as AccessTokenPayload;
    
    if (decoded.type !== 'access') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 验证刷新令牌
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as RefreshTokenPayload;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 解码令牌 (不验证签名)
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.decode(token) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 从 Authorization 头中提取令牌
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * 检查令牌是否即将过期 (用于自动刷新)
 * 
 * @param token - JWT 令牌
 * @param thresholdMinutes - 阈值 (分钟)
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const expiresAt = decoded.exp * 1000;
  const threshold = thresholdMinutes * 60 * 1000;
  
  return expiresAt - Date.now() < threshold;
}

/**
 * 生成 Session ID
 */
export function generateSessionId(): string {
  return generateSecureToken(16);
}
// 生成 Session Token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}