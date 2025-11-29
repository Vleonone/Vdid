/**
 * Wallet Service - Web3 钱包认证服务
 * 
 * 功能：
 * - SIWE (Sign-In with Ethereum) 认证
 * - 钱包连接和验证
 * - ENS 域名解析
 * - 多链地址管理
 */

import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { generateVID } from '../lib/vid-generator';
import { signTokens, generateSessionToken } from '../lib/jwt';
import { ethers } from 'ethers';
import crypto from 'crypto';

const { users, web3Identities, sessions, activityLogs } = schema;

// 支持的链配置
const SUPPORTED_CHAINS: Record<number, { name: string; symbol: string }> = {
  1: { name: 'Ethereum', symbol: 'ETH' },
  137: { name: 'Polygon', symbol: 'MATIC' },
  42161: { name: 'Arbitrum', symbol: 'ETH' },
  10: { name: 'Optimism', symbol: 'ETH' },
  8453: { name: 'Base', symbol: 'ETH' },
  56: { name: 'BNB Chain', symbol: 'BNB' },
};

// SIWE 消息格式
interface SIWEMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
}

// 生成 SIWE Nonce
export function generateSIWENonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

// 创建 SIWE 消息
export function createSIWEMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  domain: string;
  uri: string;
}): string {
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  
  const message = `${params.domain} wants you to sign in with your Ethereum account:
${params.address}

Sign in to VDID - Velon Decentralized Identity

URI: ${params.uri}
Version: 1
Chain ID: ${params.chainId}
Nonce: ${params.nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;

  return message;
}

// 验证以太坊地址格式
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// 规范化地址 (checksum)
export function checksumAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch {
    // 如果地址无效，返回小写版本
    return address.toLowerCase();
  }
}

// 获取或创建 SIWE Nonce
export async function getOrCreateNonce(address: string): Promise<{ nonce: string; expiresAt: Date }> {
  const normalizedAddress = checksumAddress(address);
  const nonce = generateSIWENonce();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 检查用户是否存在 - 只选择必要的列以避免缺失列错误
  const existingUser = await db.select({
    id: users.id,
    walletAddress: users.walletAddress,
  })
    .from(users)
    .where(eq(users.walletAddress, normalizedAddress))
    .limit(1);

  if (existingUser.length > 0) {
    // 更新现有用户的 nonce
    await db.update(users)
      .set({
        siweNonce: nonce,
        siweNonceExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, existingUser[0].id));
  }

  return { nonce, expiresAt };
}

// 验证 SIWE 签名
export async function verifySIWESignature(params: {
  message: string;
  signature: string;
  address: string;
}): Promise<boolean> {
  try {
    // 基础格式验证
    if (!params.signature || !params.signature.startsWith('0x')) {
      console.error('SIWE: Invalid signature format - missing 0x prefix');
      return false;
    }

    if (params.signature.length !== 132) { // 0x + 130 hex chars
      console.error('SIWE: Invalid signature length');
      return false;
    }

    if (!params.message || params.message.length === 0) {
      console.error('SIWE: Empty message');
      return false;
    }

    // 使用 ethers.js 恢复签名者地址
    const recoveredAddress = ethers.verifyMessage(params.message, params.signature);

    // 比较恢复的地址与声明的地址（不区分大小写）
    const isValid = recoveredAddress.toLowerCase() === params.address.toLowerCase();

    if (!isValid) {
      console.error(`SIWE: Address mismatch - expected ${params.address}, recovered ${recoveredAddress}`);
    }

    return isValid;
  } catch (error) {
    console.error('SIWE signature verification failed:', error);
    return false;
  }
}

// 钱包登录/注册
export async function walletAuth(params: {
  address: string;
  signature: string;
  message: string;
  chainId: number;
  ensName?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  user: any;
  tokens: { accessToken: string; refreshToken: string };
  isNewUser: boolean;
}> {
  const normalizedAddress = checksumAddress(params.address);
  
  // 验证地址格式
  if (!isValidEthereumAddress(params.address)) {
    throw new Error('Invalid Ethereum address');
  }
  
  // 验证签名
  const isValidSignature = await verifySIWESignature({
    message: params.message,
    signature: params.signature,
    address: params.address,
  });
  
  if (!isValidSignature) {
    throw new Error('Invalid signature');
  }
  
  // 查找现有用户 - 只选择必要的列以避免缺失列错误
  let user = await db.select({
    id: users.id,
    vid: users.vid,
    did: users.did,
    email: users.email,
    displayName: users.displayName,
    walletAddress: users.walletAddress,
    ensName: users.ensName,
    vscoreTotal: users.vscoreTotal,
    vscoreLevel: users.vscoreLevel,
    loginCount: users.loginCount,
    passwordHash: users.passwordHash,
  })
    .from(users)
    .where(eq(users.walletAddress, normalizedAddress))
    .limit(1)
    .then(rows => rows[0]);
  
  let isNewUser = false;
  
  if (!user) {
    // 创建新用户
    isNewUser = true;
    const vid = generateVID();
    const did = `did:vdid:eth:${normalizedAddress}`;
    
    // 创建带有钱包的用户（无密码）
    const [newUser] = await db.insert(users)
      .values({
        vid,
        did,
        email: `${normalizedAddress.slice(0, 10)}@wallet.vdid`, // 临时邮箱
        passwordHash: 'WALLET_AUTH_NO_PASSWORD', // 标记为钱包认证
        walletAddress: normalizedAddress,
        walletVerified: true,
        walletSignature: params.signature,
        walletConnectedAt: new Date(),
        ensName: params.ensName,
        chainId: params.chainId,
        displayName: params.ensName || `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`,
        vscoreTotal: 50, // 钱包注册奖励
        vscoreActivity: 50,
        lastLoginAt: new Date(),
        lastLoginIp: params.ipAddress,
        loginCount: 1,
      })
      .returning({
        id: users.id,
        vid: users.vid,
        did: users.did,
        email: users.email,
        displayName: users.displayName,
        walletAddress: users.walletAddress,
        ensName: users.ensName,
        vscoreTotal: users.vscoreTotal,
        vscoreLevel: users.vscoreLevel,
        loginCount: users.loginCount,
      });

    user = newUser;
    
    // 添加到 Web3 身份表
    await db.insert(web3Identities)
      .values({
        userId: user.id,
        walletAddress: normalizedAddress,
        address: normalizedAddress,
        chainId: params.chainId,
        chainName: SUPPORTED_CHAINS[params.chainId as keyof typeof SUPPORTED_CHAINS]?.name || 'Unknown',
        addressChecksum: normalizedAddress,
        isVerified: true,
        verifiedAt: new Date(),
        signature: params.signature,
        siweMessage: params.message,
        siweIssuedAt: new Date(),
        ensName: params.ensName,
        isPrimary: true,
      });
    
    // 记录活动日志
    await db.insert(activityLogs)
      .values({
        userId: user.id,
        action: 'wallet_register',
        category: 'auth',
        details: {
          method: 'siwe',
          chainId: params.chainId,
          address: normalizedAddress,
          ensName: params.ensName,
        },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: 'success',
        vscoreImpact: 50,
        vscoreCategory: 'activity',
      });
  } else {
    // 更新现有用户
    await db.update(users)
      .set({
        walletSignature: params.signature,
        walletConnectedAt: new Date(),
        lastLoginAt: new Date(),
        lastLoginIp: params.ipAddress,
        loginCount: (user.loginCount || 0) + 1,
        siweNonce: null,
        siweNonceExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    
    // 记录登录日志
    await db.insert(activityLogs)
      .values({
        userId: user.id,
        action: 'wallet_login',
        category: 'auth',
        details: {
          method: 'siwe',
          chainId: params.chainId,
          address: normalizedAddress,
        },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: 'success',
        vscoreImpact: 5,
        vscoreCategory: 'activity',
      });
  }
  
  // 生成 JWT tokens
  const sessionToken = generateSessionToken();
  const tokens = signTokens({
    userId: user.id,
    vid: user.vid,
    sessionToken,
  });
  
  // 创建 session (使用 sessionToken 作为唯一标识)
  await db.insert(sessions)
    .values({
      userId: user.id,
      token: sessionToken,
      refreshToken: sessionToken, // 使用唯一的 sessionToken
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceType: 'web',
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
  
  return { user, tokens, isNewUser };
}

// 绑定钱包到现有账户
export async function bindWallet(params: {
  userId: number;
  address: string;
  signature: string;
  message: string;
  chainId: number;
  ensName?: string;
}): Promise<{ success: boolean }> {
  const normalizedAddress = checksumAddress(params.address);
  
  // 检查地址是否已被其他用户使用 - 只选择必要的列
  const existingUser = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.walletAddress, normalizedAddress))
    .limit(1);

  if (existingUser.length > 0 && existingUser[0].id !== params.userId) {
    throw new Error('This wallet is already linked to another account');
  }
  
  // 验证签名
  const isValid = await verifySIWESignature({
    message: params.message,
    signature: params.signature,
    address: params.address,
  });
  
  if (!isValid) {
    throw new Error('Invalid signature');
  }
  
  // 更新用户钱包信息
  await db.update(users)
    .set({
      walletAddress: normalizedAddress,
      walletVerified: true,
      walletSignature: params.signature,
      walletConnectedAt: new Date(),
      ensName: params.ensName,
      chainId: params.chainId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, params.userId));
  
  // 添加到 Web3 身份表
  await db.insert(web3Identities)
    .values({
      userId: params.userId,
      walletAddress: normalizedAddress,
      address: normalizedAddress,
      chainId: params.chainId,
      chainName: SUPPORTED_CHAINS[params.chainId as keyof typeof SUPPORTED_CHAINS]?.name || 'Unknown',
      addressChecksum: normalizedAddress,
      isVerified: true,
      verifiedAt: new Date(),
      signature: params.signature,
      siweMessage: params.message,
      siweIssuedAt: new Date(),
      ensName: params.ensName,
      isPrimary: true,
    });
  
  return { success: true };
}

// 获取用户的所有 Web3 身份
export async function getUserWeb3Identities(userId: number) {
  return db.select()
    .from(web3Identities)
    .where(eq(web3Identities.userId, userId));
}

// 解除钱包绑定
export async function unbindWallet(userId: number, address: string): Promise<void> {
  const normalizedAddress = checksumAddress(address);
  
  // 删除 Web3 身份记录
  await db.delete(web3Identities)
    .where(and(
      eq(web3Identities.userId, userId),
      eq(web3Identities.address, normalizedAddress)
    ));
  
  // 检查用户是否还有其他身份验证方式 - 只选择必要的列
  const user = await db.select({
    id: users.id,
    walletAddress: users.walletAddress,
    passwordHash: users.passwordHash,
  })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(rows => rows[0]);

  if (user && user.walletAddress === normalizedAddress) {
    // 如果是主钱包，检查是否有邮箱登录
    if (user.passwordHash === 'WALLET_AUTH_NO_PASSWORD') {
      throw new Error('Cannot unbind primary wallet without email login enabled');
    }
    
    // 清除主钱包信息
    await db.update(users)
      .set({
        walletAddress: null,
        walletVerified: false,
        walletSignature: null,
        walletConnectedAt: null,
        ensName: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
