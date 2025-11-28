/**
 * Authentication Service
 * 处理用户注册、登录、会话管理等核心认证逻辑
 */

import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db';
import { generateVID, generateDID, generateSecureToken } from '../lib/vid-generator';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password';
import { generateTokenPair, verifyAccessToken, verifyRefreshToken, generateSessionId, TokenPair } from '../lib/jwt';
import { calculateTotalVScore, getVScoreLevel } from '../../shared/schema';

const { users, sessions, activityLogs, vscoreHistory } = schema;

// ============================================
// Types
// ============================================

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResult {
  success: boolean;
  user?: SafeUser;
  tokens?: TokenPair;
  error?: string;
}

export interface SafeUser {
  id: string;
  vid: string;
  did: string | null;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  avatar: string | null;
  vscoreTotal: number;
  vscoreLevel: string;
  twoFactorEnabled: boolean;
  walletAddress: string | null;
  walletVerified: boolean;
  createdAt: Date;
}

// ============================================
// Helper Functions
// ============================================

/**
 * 将数据库用户对象转换为安全的用户对象 (移除敏感信息)
 */
function toSafeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    vid: user.vid,
    did: user.did,
    email: user.email,
    emailVerified: user.emailVerified ?? false,
    displayName: user.displayName,
    avatar: user.avatar,
    vscoreTotal: user.vscoreTotal ?? 0,
    vscoreLevel: user.vscoreLevel ?? 'Newcomer',
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    walletAddress: user.walletAddress,
    walletVerified: user.walletVerified ?? false,
    createdAt: user.createdAt,
  };
}

/**
 * 记录活动日志
 */
async function logActivity(
  userId: string | null,
  action: string,
  category: string,
  details: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string,
  status: 'success' | 'failure' = 'success',
  errorMessage?: string
) {
  try {
    await db.insert(activityLogs).values({
      userId,
      action,
      category,
      details,
      ipAddress,
      userAgent,
      status,
      errorMessage,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// ============================================
// Authentication Service
// ============================================

export class AuthService {
  /**
   * 用户注册
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password, displayName } = input;

    // 1. 验证密码强度
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return {
        success: false,
        error: passwordCheck.errors[0],
      };
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }

    // 3. 生成 V-ID 和 DID
    const vid = generateVID();
    const did = generateDID('base');

    // 4. 哈希密码
    const passwordHash = await hashPassword(password);

    // 5. 生成邮箱验证令牌
    const emailVerifyToken = generateSecureToken(32);
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

    // 6. 创建用户
    const [newUser] = await db.insert(users).values({
      vid,
      did,
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      emailVerifyToken,
      emailVerifyExpires,
      // 初始 V-Score
      vscoreActivity: 0,
      vscoreFinancial: 0,
      vscoreSocial: 0,
      vscoreTrust: 100, // 初始信任分 100
      vscoreTotal: calculateTotalVScore(0, 0, 0, 100),
      vscoreLevel: 'Newcomer',
    }).returning();

    // 7. 记录 V-Score 历史
    await db.insert(vscoreHistory).values({
      userId: newUser.id,
      previousTotal: 0,
      newTotal: newUser.vscoreTotal ?? 0,
      change: newUser.vscoreTotal ?? 0,
      activityScore: 0,
      financialScore: 0,
      socialScore: 0,
      trustScore: 100,
      reason: 'Account registration',
      sourceAction: 'register',
      previousLevel: null,
      newLevel: 'Newcomer',
      levelChanged: true,
    });

    // 8. 记录活动日志
    await logActivity(
      newUser.id,
      'register',
      'auth',
      { email: newUser.email, vid: newUser.vid },
      undefined,
      undefined,
      'success'
    );

    return {
      success: true,
      user: toSafeUser(newUser),
    };
  }

  /**
   * 用户登录
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password, userAgent, ipAddress } = input;

    // 1. 查找用户
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      await logActivity(null, 'login', 'auth', { email }, ipAddress, userAgent, 'failure', 'User not found');
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // 2. 检查账户状态
    if (user.status !== 'active') {
      await logActivity(user.id, 'login', 'auth', { status: user.status }, ipAddress, userAgent, 'failure', 'Account not active');
      return {
        success: false,
        error: 'Account is suspended',
      };
    }

    // 3. 验证密码
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      await logActivity(user.id, 'login', 'auth', {}, ipAddress, userAgent, 'failure', 'Invalid password');
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // 4. 生成会话
    const sessionId = generateSessionId();
    const tokens = generateTokenPair(user.id, user.vid, user.email, sessionId);

    // 5. 保存会话
    await db.insert(sessions).values({
      userId: user.id,
      token: sessionId,
      refreshToken: tokens.refreshToken.substring(0, 64),
      refreshTokenExpires: tokens.refreshTokenExpires,
      userAgent,
      ipAddress,
      expiresAt: tokens.accessTokenExpires,
    });

    // 6. 更新用户登录信息和 V-Score
    const newActivityScore = Math.min(1000, (user.vscoreActivity ?? 0) + 5);
    const newTotal = calculateTotalVScore(
      newActivityScore,
      user.vscoreFinancial ?? 0,
      user.vscoreSocial ?? 0,
      user.vscoreTrust ?? 0
    );
    const newLevel = getVScoreLevel(newTotal);

    await db.update(users)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: (user.loginCount ?? 0) + 1,
        vscoreActivity: newActivityScore,
        vscoreTotal: newTotal,
        vscoreLevel: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 7. 记录 V-Score 变化
    if (newTotal !== user.vscoreTotal) {
      await db.insert(vscoreHistory).values({
        userId: user.id,
        previousTotal: user.vscoreTotal ?? 0,
        newTotal,
        change: newTotal - (user.vscoreTotal ?? 0),
        activityScore: newActivityScore,
        financialScore: user.vscoreFinancial,
        socialScore: user.vscoreSocial,
        trustScore: user.vscoreTrust,
        reason: 'Daily login bonus',
        sourceAction: 'login',
        previousLevel: user.vscoreLevel,
        newLevel,
        levelChanged: newLevel !== user.vscoreLevel,
      });
    }

    // 8. 记录活动日志
    await logActivity(
      user.id,
      'login',
      'auth',
      { vid: user.vid, sessionId },
      ipAddress,
      userAgent,
      'success'
    );

    return {
      success: true,
      user: toSafeUser({ ...user, vscoreTotal: newTotal, vscoreLevel: newLevel }),
      tokens,
    };
  }

  /**
   * 验证访问令牌
   */
  async verifyToken(token: string): Promise<SafeUser | null> {
    const payload = verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    // 检查会话是否有效
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, payload.sessionId),
        eq(sessions.isActive, true)
      ),
    });

    if (!session) {
      return null;
    }

    // 获取用户
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user || user.status !== 'active') {
      return null;
    }

    return toSafeUser(user);
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return {
        success: false,
        error: 'Invalid refresh token',
      };
    }

    // 查找会话
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, payload.sessionId),
        eq(sessions.isActive, true)
      ),
    });

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }

    // 获取用户
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user || user.status !== 'active') {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // 生成新令牌
    const newSessionId = generateSessionId();
    const tokens = generateTokenPair(user.id, user.vid, user.email, newSessionId);

    // 更新会话
    await db.update(sessions)
      .set({
        token: newSessionId,
        refreshToken: tokens.refreshToken.substring(0, 64),
        refreshTokenExpires: tokens.refreshTokenExpires,
        expiresAt: tokens.accessTokenExpires,
        lastActivityAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return {
      success: true,
      user: toSafeUser(user),
      tokens,
    };
  }

  /**
   * 登出
   */
  async logout(sessionId: string): Promise<boolean> {
    try {
      await db.update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.token, sessionId));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 登出所有设备
   */
  async logoutAll(userId: string): Promise<boolean> {
    try {
      await db.update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.userId, userId));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户信息
   */
  async getUser(userId: string): Promise<SafeUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    return toSafeUser(user);
  }

  /**
   * 通过 V-ID 获取用户
   */
  async getUserByVID(vid: string): Promise<SafeUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.vid, vid),
    });

    if (!user) {
      return null;
    }

    return toSafeUser(user);
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.emailVerifyToken, token),
    });

    if (!user) {
      return false;
    }

    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      return false;
    }

    // 更新用户状态和 V-Score
    const newTrustScore = Math.min(1000, (user.vscoreTrust ?? 0) + 50);
    const newTotal = calculateTotalVScore(
      user.vscoreActivity ?? 0,
      user.vscoreFinancial ?? 0,
      user.vscoreSocial ?? 0,
      newTrustScore
    );

    await db.update(users)
      .set({
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
        vscoreTrust: newTrustScore,
        vscoreTotal: newTotal,
        vscoreLevel: getVScoreLevel(newTotal),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await logActivity(user.id, 'email_verify', 'auth', {}, undefined, undefined, 'success');

    return true;
  }

  /**
   * 请求密码重置
   */
  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return null;
    }

    const resetToken = generateSecureToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小时

    await db.update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await logActivity(user.id, 'password_reset_request', 'security', {}, undefined, undefined, 'success');

    return resetToken;
  }

  /**
   * 重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // 验证密码强度
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.isValid) {
      return false;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.passwordResetToken, token),
    });

    if (!user) {
      return false;
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return false;
    }

    const passwordHash = await hashPassword(newPassword);

    await db.update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 登出所有设备
    await this.logoutAll(user.id);

    await logActivity(user.id, 'password_reset', 'security', {}, undefined, undefined, 'success');

    return true;
  }
}

// 导出单例
export const authService = new AuthService();
