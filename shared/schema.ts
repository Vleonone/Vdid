/**
 * VDID Database Schema
 * 使用 Drizzle ORM 定义数据库结构
 * 
 * 表结构：
 * - users: 用户基本信息和V-Score
 * - sessions: 用户会话管理
 * - oauth_clients: OAuth应用注册
 * - authorizations: OAuth授权记录
 * - credentials: 用户凭证（如2FA）
 * - activity_logs: 活动日志
 */

import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, varchar, real } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// Users 表 - 用户核心信息
// ============================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // V-ID 唯一标识 (格式: VID-xxxx-xxxx-xxxx)
  vid: varchar('vid', { length: 19 }).unique().notNull(),
  
  // DID 去中心化标识 (格式: did:vdid:base:0x...)
  did: varchar('did', { length: 100 }).unique(),
  
  // 基本信息
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').default(false),
  emailVerifyToken: varchar('email_verify_token', { length: 64 }),
  emailVerifyExpires: timestamp('email_verify_expires'),
  
  // 密码重置
  passwordResetToken: varchar('password_reset_token', { length: 64 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  
  // V-Score 分数系统 (0-1000)
  vscoreTotal: integer('vscore_total').default(0),
  vscoreActivity: integer('vscore_activity').default(0),    // 30% 权重
  vscoreFinancial: integer('vscore_financial').default(0),  // 35% 权重
  vscoreSocial: integer('vscore_social').default(0),        // 20% 权重
  vscoreTrust: integer('vscore_trust').default(0),          // 15% 权重
  
  // V-Score 等级
  // Newcomer: 0-199, Active: 200-399, Established: 400-599, Trusted: 600-799, Elite: 800-1000
  vscoreLevel: varchar('vscore_level', { length: 20 }).default('Newcomer'),
  
  // 2FA 双因素认证
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 64 }),
  twoFactorBackupCodes: jsonb('two_factor_backup_codes').$type<string[]>(),
  
  // 钱包绑定
  walletAddress: varchar('wallet_address', { length: 42 }),
  walletVerified: boolean('wallet_verified').default(false),
  walletSignature: text('wallet_signature'),
  
  // 用户资料
  displayName: varchar('display_name', { length: 50 }),
  avatar: text('avatar'),
  bio: varchar('bio', { length: 500 }),
  
  // 元数据
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  
  // 账户状态
  status: varchar('status', { length: 20 }).default('active'), // active, suspended, deleted
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  loginCount: integer('login_count').default(0),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Sessions 表 - 会话管理
// ============================================
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // 会话Token (JWT ID)
  token: varchar('token', { length: 64 }).unique().notNull(),
  
  // 刷新Token
  refreshToken: varchar('refresh_token', { length: 64 }).unique(),
  refreshTokenExpires: timestamp('refresh_token_expires'),
  
  // 设备信息
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  deviceType: varchar('device_type', { length: 20 }), // desktop, mobile, tablet
  deviceName: varchar('device_name', { length: 100 }),
  
  // 地理位置
  country: varchar('country', { length: 2 }),
  city: varchar('city', { length: 100 }),
  
  // 状态
  isActive: boolean('is_active').default(true),
  lastActivityAt: timestamp('last_activity_at').defaultNow(),
  
  // 过期时间
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// OAuth Clients 表 - 第三方应用注册
// ============================================
export const oauthClients = pgTable('oauth_clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 客户端凭证
  clientId: varchar('client_id', { length: 64 }).unique().notNull(),
  clientSecret: varchar('client_secret', { length: 64 }).notNull(),
  
  // 应用信息
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  logo: text('logo'),
  homepage: varchar('homepage', { length: 255 }),
  
  // OAuth 配置
  redirectUris: jsonb('redirect_uris').$type<string[]>().notNull(),
  scopes: jsonb('scopes').$type<string[]>().default([]),
  grantTypes: jsonb('grant_types').$type<string[]>().default(['authorization_code']),
  
  // 应用类型
  type: varchar('type', { length: 20 }).default('web'), // web, native, spa
  isConfidential: boolean('is_confidential').default(true),
  
  // 所有者
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // 状态
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  
  // 统计
  totalAuthorizations: integer('total_authorizations').default(0),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Authorizations 表 - OAuth 授权记录
// ============================================
export const authorizations = pgTable('authorizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => oauthClients.id, { onDelete: 'cascade' }).notNull(),
  
  // 授权范围
  scopes: jsonb('scopes').$type<string[]>().notNull(),
  
  // 授权码 (用于authorization_code流程)
  authorizationCode: varchar('authorization_code', { length: 64 }).unique(),
  codeExpiresAt: timestamp('code_expires_at'),
  codeChallenge: varchar('code_challenge', { length: 128 }), // PKCE
  codeChallengeMethod: varchar('code_challenge_method', { length: 10 }), // S256 or plain
  
  // Access Token
  accessToken: varchar('access_token', { length: 64 }).unique(),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  
  // Refresh Token
  refreshToken: varchar('refresh_token', { length: 64 }).unique(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  
  // 状态
  isRevoked: boolean('is_revoked').default(false),
  revokedAt: timestamp('revoked_at'),
  revokedReason: varchar('revoked_reason', { length: 255 }),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Credentials 表 - 用户凭证 (可验证凭证)
// ============================================
export const credentials = pgTable('credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // 凭证类型
  type: varchar('type', { length: 50 }).notNull(), // email, phone, kyc, social, wallet
  
  // 发行者信息
  issuer: varchar('issuer', { length: 255 }).notNull(),
  issuerDid: varchar('issuer_did', { length: 100 }),
  
  // 凭证数据 (加密存储)
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  dataHash: varchar('data_hash', { length: 64 }), // SHA256 hash for verification
  
  // 验证状态
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  verificationMethod: varchar('verification_method', { length: 50 }),
  
  // 有效期
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  
  // 撤销状态
  isRevoked: boolean('is_revoked').default(false),
  revokedAt: timestamp('revoked_at'),
  revokedReason: varchar('revoked_reason', { length: 255 }),
  
  // 链上记录 (可选)
  onChain: boolean('on_chain').default(false),
  txHash: varchar('tx_hash', { length: 66 }),
  blockNumber: integer('block_number'),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// Activity Logs 表 - 活动日志
// ============================================
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // 活动类型
  action: varchar('action', { length: 50 }).notNull(),
  // 例如: login, logout, register, password_change, 2fa_enable, oauth_authorize, etc.
  
  // 活动分类
  category: varchar('category', { length: 30 }).default('auth'),
  // auth, security, profile, oauth, wallet, vscore
  
  // 详细信息
  details: jsonb('details').$type<Record<string, unknown>>(),
  
  // 请求信息
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // 状态
  status: varchar('status', { length: 20 }).default('success'), // success, failure, pending
  errorMessage: text('error_message'),
  
  // V-Score 影响
  vscoreImpact: integer('vscore_impact').default(0),
  vscoreCategory: varchar('vscore_category', { length: 20 }), // activity, financial, social, trust
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// V-Score History 表 - V-Score 历史记录
// ============================================
export const vscoreHistory = pgTable('vscore_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // 分数变化
  previousTotal: integer('previous_total').notNull(),
  newTotal: integer('new_total').notNull(),
  change: integer('change').notNull(),
  
  // 分类分数
  activityScore: integer('activity_score'),
  financialScore: integer('financial_score'),
  socialScore: integer('social_score'),
  trustScore: integer('trust_score'),
  
  // 变化原因
  reason: varchar('reason', { length: 255 }).notNull(),
  sourceAction: varchar('source_action', { length: 50 }),
  
  // 等级变化
  previousLevel: varchar('previous_level', { length: 20 }),
  newLevel: varchar('new_level', { length: 20 }),
  levelChanged: boolean('level_changed').default(false),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// Zod Schemas for Validation
// ============================================

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email address'),
  vid: z.string().regex(/^VID-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid V-ID format'),
});

export const selectUserSchema = createSelectSchema(users);

// Session schemas
export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);

// OAuth Client schemas
export const insertOAuthClientSchema = createInsertSchema(oauthClients, {
  redirectUris: z.array(z.string().url()),
  scopes: z.array(z.string()),
});
export const selectOAuthClientSchema = createSelectSchema(oauthClients);

// Credential schemas
export const insertCredentialSchema = createInsertSchema(credentials);
export const selectCredentialSchema = createSelectSchema(credentials);

// Activity Log schemas
export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// ============================================
// TypeScript Types
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type OAuthClient = typeof oauthClients.$inferSelect;
export type NewOAuthClient = typeof oauthClients.$inferInsert;

export type Authorization = typeof authorizations.$inferSelect;
export type NewAuthorization = typeof authorizations.$inferInsert;

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type VScoreHistory = typeof vscoreHistory.$inferSelect;
export type NewVScoreHistory = typeof vscoreHistory.$inferInsert;

// ============================================
// V-Score Level Helper
// ============================================

export const VSCORE_LEVELS = {
  NEWCOMER: { min: 0, max: 199, name: 'Newcomer' },
  ACTIVE: { min: 200, max: 399, name: 'Active' },
  ESTABLISHED: { min: 400, max: 599, name: 'Established' },
  TRUSTED: { min: 600, max: 799, name: 'Trusted' },
  ELITE: { min: 800, max: 1000, name: 'Elite' },
} as const;

export function getVScoreLevel(score: number): string {
  if (score >= 800) return 'Elite';
  if (score >= 600) return 'Trusted';
  if (score >= 400) return 'Established';
  if (score >= 200) return 'Active';
  return 'Newcomer';
}

// V-Score 权重配置
export const VSCORE_WEIGHTS = {
  ACTIVITY: 0.30,   // 30%
  FINANCIAL: 0.35,  // 35%
  SOCIAL: 0.20,     // 20%
  TRUST: 0.15,      // 15%
} as const;

export function calculateTotalVScore(
  activity: number,
  financial: number,
  social: number,
  trust: number
): number {
  const total = Math.round(
    activity * VSCORE_WEIGHTS.ACTIVITY +
    financial * VSCORE_WEIGHTS.FINANCIAL +
    social * VSCORE_WEIGHTS.SOCIAL +
    trust * VSCORE_WEIGHTS.TRUST
  );
  return Math.min(1000, Math.max(0, total));
}
