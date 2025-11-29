/**
 * Passkeys Service - WebAuthn 无密码认证服务
 * 
 * 功能：
 * - Passkey 注册（注册仪式）
 * - Passkey 认证（认证仪式）
 * - 多设备管理
 * - 凭证验证
 */

import { db } from '../db/index.js';
import { users, passkeys, sessions, activityLogs } from '@shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { signTokens, generateSessionToken } from '../lib/jwt.js';
import crypto from 'crypto';

// WebAuthn 配置
const RP_NAME = 'VDID - Velon Decentralized Identity';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:5000';

// Challenge 存储 (生产环境应使用 Redis)
const challengeStore = new Map<string, { challenge: string; expiresAt: Date }>();

// 生成随机 Challenge
function generateChallenge(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// 存储 Challenge
function storeChallenge(userId: string, challenge: string): void {
  challengeStore.set(userId, {
    challenge,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });
}

// 验证并消费 Challenge
function verifyAndConsumeChallenge(userId: string, challenge: string): boolean {
  const stored = challengeStore.get(userId);
  if (!stored) return false;
  if (stored.expiresAt < new Date()) {
    challengeStore.delete(userId);
    return false;
  }
  if (stored.challenge !== challenge) return false;
  challengeStore.delete(userId);
  return true;
}

// 生成注册选项
export async function generateRegistrationOptions(userId: string): Promise<{
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ type: string; alg: number }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment?: string;
    residentKey: string;
    userVerification: string;
  };
  excludeCredentials: Array<{ id: string; type: string }>;
}> {
  // 获取用户信息
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(rows => rows[0]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // 获取用户现有的 passkeys
  const existingPasskeys = await db.select()
    .from(passkeys)
    .where(eq(passkeys.userId, userId));
  
  // 生成 challenge
  const challenge = generateChallenge();
  storeChallenge(userId, challenge);
  
  return {
    challenge,
    rp: {
      name: RP_NAME,
      id: RP_ID,
    },
    user: {
      id: Buffer.from(userId).toString('base64url'),
      name: user.email,
      displayName: user.displayName || user.vid,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    timeout: 60000, // 60 seconds
    attestation: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    excludeCredentials: existingPasskeys.map(pk => ({
      id: pk.credentialId,
      type: 'public-key',
    })),
  };
}

// 验证注册响应并保存 Passkey
export async function verifyRegistration(params: {
  userId: string;
  credentialId: string;
  publicKey: string;
  challenge: string;
  aaguid?: string;
  deviceName?: string;
  transports?: string[];
}): Promise<{ success: boolean; passkeyId: string }> {
  // 验证 challenge
  if (!verifyAndConsumeChallenge(params.userId, params.challenge)) {
    throw new Error('Invalid or expired challenge');
  }
  
  // 检查 credentialId 是否已存在
  const existing = await db.select()
    .from(passkeys)
    .where(eq(passkeys.credentialId, params.credentialId))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error('Credential already registered');
  }
  
  // 保存 Passkey
  const [newPasskey] = await db.insert(passkeys)
    .values({
      userId: params.userId,
      credentialId: params.credentialId,
      publicKey: params.publicKey,
      counter: 0,
      aaguid: params.aaguid,
      deviceName: params.deviceName || 'Unknown Device',
      deviceType: 'platform', // TODO: 从 attestation 解析
      transports: params.transports,
      isActive: true,
    })
    .returning();
  
  // 更新用户 passkey 状态
  await db.update(users)
    .set({
      passkeyEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, params.userId));
  
  // 记录活动日志
  await db.insert(activityLogs)
    .values({
      userId: params.userId,
      action: 'passkey_register',
      category: 'security',
      details: {
        deviceName: params.deviceName,
        aaguid: params.aaguid,
      },
      status: 'success',
      vscoreImpact: 20,
      vscoreCategory: 'trust',
    });
  
  return { success: true, passkeyId: newPasskey.id };
}

// 生成认证选项
export async function generateAuthenticationOptions(params?: {
  userId?: string;
  email?: string;
}): Promise<{
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{ id: string; type: string; transports?: string[] }>;
  userVerification: string;
}> {
  let allowCredentials: Array<{ id: string; type: string; transports?: string[] }> = [];
  let userId = params?.userId;
  
  // 如果提供了 email，查找用户
  if (params?.email && !userId) {
    const user = await db.select()
      .from(users)
      .where(eq(users.email, params.email))
      .limit(1)
      .then(rows => rows[0]);
    
    if (user) {
      userId = user.id;
    }
  }
  
  // 如果有 userId，获取用户的 passkeys
  if (userId) {
    const userPasskeys = await db.select()
      .from(passkeys)
      .where(and(
        eq(passkeys.userId, userId),
        eq(passkeys.isActive, true)
      ));
    
    allowCredentials = userPasskeys.map(pk => ({
      id: pk.credentialId,
      type: 'public-key' as const,
      transports: pk.transports as string[] | undefined,
    }));
  }
  
  // 生成 challenge
  const challenge = generateChallenge();
  const tempId = userId || crypto.randomBytes(16).toString('hex');
  storeChallenge(tempId, challenge);
  
  return {
    challenge,
    timeout: 60000,
    rpId: RP_ID,
    allowCredentials,
    userVerification: 'preferred',
  };
}

// 验证认证响应
export async function verifyAuthentication(params: {
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  challenge: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  user: any;
  tokens: { accessToken: string; refreshToken: string };
}> {
  // 查找 Passkey
  const passkey = await db.select()
    .from(passkeys)
    .where(and(
      eq(passkeys.credentialId, params.credentialId),
      eq(passkeys.isActive, true)
    ))
    .limit(1)
    .then(rows => rows[0]);
  
  if (!passkey) {
    throw new Error('Passkey not found or inactive');
  }
  
  // 验证 challenge
  if (!verifyAndConsumeChallenge(passkey.userId, params.challenge)) {
    throw new Error('Invalid or expired challenge');
  }
  
  // TODO: 实际的 WebAuthn 签名验证
  // 生产环境应使用 @simplewebauthn/server
  
  // 更新 counter
  await db.update(passkeys)
    .set({
      counter: passkey.counter + 1,
      lastUsedAt: new Date(),
      useCount: passkey.useCount + 1,
    })
    .where(eq(passkeys.id, passkey.id));
  
  // 获取用户
  const user = await db.select()
    .from(users)
    .where(eq(users.id, passkey.userId))
    .limit(1)
    .then(rows => rows[0]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // 更新用户登录信息
  await db.update(users)
    .set({
      lastLoginAt: new Date(),
      lastLoginIp: params.ipAddress,
      loginCount: (user.loginCount || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  
  // 生成 tokens
  const sessionToken = generateSessionToken();
  const tokens = signTokens({
    userId: user.id,
    vid: user.vid,
    sessionToken,
  });
  
  // 创建 session
  await db.insert(sessions)
    .values({
      userId: user.id,
      token: sessionToken,
      refreshToken: tokens.refreshToken.slice(0, 64),
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceType: 'web',
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  
  // 记录登录日志
  await db.insert(activityLogs)
    .values({
      userId: user.id,
      action: 'passkey_login',
      category: 'auth',
      details: {
        passkeyId: passkey.id,
        deviceName: passkey.deviceName,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: 'success',
      vscoreImpact: 5,
      vscoreCategory: 'activity',
    });
  
  return { user, tokens };
}

// 获取用户的所有 Passkeys
export async function getUserPasskeys(userId: string) {
  return db.select({
    id: passkeys.id,
    deviceName: passkeys.deviceName,
    deviceType: passkeys.deviceType,
    lastUsedAt: passkeys.lastUsedAt,
    useCount: passkeys.useCount,
    createdAt: passkeys.createdAt,
    isActive: passkeys.isActive,
  })
    .from(passkeys)
    .where(eq(passkeys.userId, userId));
}

// 删除 Passkey
export async function deletePasskey(userId: string, passkeyId: string): Promise<void> {
  // 验证 passkey 属于该用户
  const passkey = await db.select()
    .from(passkeys)
    .where(and(
      eq(passkeys.id, passkeyId),
      eq(passkeys.userId, userId)
    ))
    .limit(1)
    .then(rows => rows[0]);
  
  if (!passkey) {
    throw new Error('Passkey not found');
  }
  
  // 检查是否是唯一的认证方式
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(rows => rows[0]);
  
  const remainingPasskeys = await db.select()
    .from(passkeys)
    .where(and(
      eq(passkeys.userId, userId),
      eq(passkeys.isActive, true)
    ));
  
  if (
    remainingPasskeys.length === 1 &&
    user?.passwordHash === 'WALLET_AUTH_NO_PASSWORD' &&
    !user?.walletVerified
  ) {
    throw new Error('Cannot delete the only authentication method');
  }
  
  // 删除 passkey
  await db.delete(passkeys)
    .where(eq(passkeys.id, passkeyId));
  
  // 如果没有剩余的 passkeys，更新用户状态
  if (remainingPasskeys.length === 1) {
    await db.update(users)
      .set({
        passkeyEnabled: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
  
  // 记录日志
  await db.insert(activityLogs)
    .values({
      userId,
      action: 'passkey_delete',
      category: 'security',
      details: { deviceName: passkey.deviceName },
      status: 'success',
    });
}

// 重命名 Passkey
export async function renamePasskey(userId: string, passkeyId: string, newName: string): Promise<void> {
  await db.update(passkeys)
    .set({ deviceName: newName })
    .where(and(
      eq(passkeys.id, passkeyId),
      eq(passkeys.userId, userId)
    ));
}
