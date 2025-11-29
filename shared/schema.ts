import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// Users table - 核心用户表
// ============================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  vid: text("vid").notNull().unique(),
  did: text("did"),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),

  // 账户状态
  status: text("status").default("active"), // active, suspended, deleted

  // 钱包相关
  primaryWallet: text("primary_wallet"),
  walletAddress: text("wallet_address"),
  walletVerified: boolean("wallet_verified").default(false),
  walletSignature: text("wallet_signature"),
  walletConnectedAt: timestamp("wallet_connected_at"),
  ensName: text("ens_name"),
  chainId: integer("chain_id"),

  // SIWE (Sign-In with Ethereum)
  siweNonce: text("siwe_nonce"),
  siweNonceExpires: timestamp("siwe_nonce_expires"),

  // 安全设置
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),

  // 邮箱验证
  emailVerified: boolean("email_verified").default(false),
  emailVerifyToken: text("email_verify_token"),
  emailVerifyExpires: timestamp("email_verify_expires"),

  // 密码重置
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),

  // V-Score 组件分数 (0-1000)
  vscoreActivity: integer("vscore_activity").default(0),
  vscoreFinancial: integer("vscore_financial").default(0),
  vscoreSocial: integer("vscore_social").default(0),
  vscoreTrust: integer("vscore_trust").default(50),
  vscoreTotal: integer("vscore_total").default(0),
  vscoreLevel: text("vscore_level").default("Newcomer"),

  // 登录统计
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: text("last_login_ip"),
  loginCount: integer("login_count").default(0),

  // 时间戳
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  vidIdx: index("users_vid_idx").on(table.vid),
  walletIdx: index("users_wallet_idx").on(table.walletAddress),
}));

// ============================================
// Web3 Identities table - Web3身份表 (钱包、ENS等)
// ============================================
export const web3Identities = pgTable("web3_identities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // 钱包地址信息
  walletAddress: text("wallet_address").notNull(),
  address: text("address"), // 备用地址字段 (兼容)
  addressChecksum: text("address_checksum"),

  // 链信息
  chainId: integer("chain_id").default(1),
  chainName: text("chain_name"),

  // 标识信息
  isPrimary: boolean("is_primary").default(false),
  ensName: text("ens_name"),
  label: text("label"),

  // 验证信息
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  signature: text("signature"),

  // SIWE 相关
  siweMessage: text("siwe_message"),
  siweIssuedAt: timestamp("siwe_issued_at"),

  // 使用记录
  lastUsed: timestamp("last_used"),

  // 时间戳
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  walletIdx: index("wallet_address_idx").on(table.walletAddress),
  userIdIdx: index("web3_identities_user_id_idx").on(table.userId),
}));

// ============================================
// Refresh tokens table - 刷新令牌表
// ============================================
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// Sessions table - 会话表
// ============================================
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),

  // 刷新令牌
  refreshToken: text("refresh_token"),
  refreshTokenExpires: timestamp("refresh_token_expires"),

  // 设备信息
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"), // web, mobile, desktop

  // 状态
  isActive: boolean("is_active").default(true),
  lastActivityAt: timestamp("last_activity_at"),

  // 时间戳
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
  tokenIdx: index("sessions_token_idx").on(table.token),
}));

// ============================================
// Passkeys table - WebAuthn 凭证表
// ============================================
export const passkeys = pgTable("passkeys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").default(0),
  deviceType: text("device_type"),
  transports: text("transports"),
  name: text("name"), // 用户自定义名称
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Activity logs table - 活动日志表
// ============================================
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  category: text("category"), // auth, security, wallet, vscore, etc.
  details: jsonb("details"),

  // 请求信息
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  // 状态
  status: text("status").default("success"), // success, failure
  errorMessage: text("error_message"),

  // V-Score 影响
  vscoreImpact: integer("vscore_impact"),
  vscoreCategory: text("vscore_category"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("activity_logs_user_id_idx").on(table.userId),
  actionIdx: index("activity_logs_action_idx").on(table.action),
  createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
}));

// ============================================
// V-Score History table - V-Score 历史记录表
// ============================================
export const vscoreHistory = pgTable("vscore_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  // 分数变化
  previousTotal: integer("previous_total").default(0),
  newTotal: integer("new_total").default(0),
  change: integer("change").default(0),

  // 各组件分数快照
  activityScore: integer("activity_score").default(0),
  financialScore: integer("financial_score").default(0),
  socialScore: integer("social_score").default(0),
  trustScore: integer("trust_score").default(0),

  // 变化原因
  reason: text("reason"),
  sourceAction: text("source_action"), // register, login, wallet_connect, etc.

  // 等级变化
  previousLevel: text("previous_level"),
  newLevel: text("new_level"),
  levelChanged: boolean("level_changed").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("vscore_history_user_id_idx").on(table.userId),
  createdAtIdx: index("vscore_history_created_at_idx").on(table.createdAt),
}));

// ============================================
// OAuth Apps table - OAuth 应用表
// ============================================
export const oauthApps = pgTable("oauth_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  redirectUris: text("redirect_uris").notNull(),
  scopes: text("scopes").default("openid profile"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// OAuth Codes table - OAuth 授权码表
// ============================================
export const oauthCodes = pgTable("oauth_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  clientId: text("client_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  scopes: text("scopes").notNull(),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// OAuth Tokens table - OAuth 访问令牌表
// ============================================
export const oauthTokens = pgTable("oauth_tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull().unique(),
  refreshToken: text("refresh_token").unique(),
  clientId: text("client_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scopes: text("scopes").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Lens Profiles table - Lens Protocol 社交身份表
// ============================================
export const lensProfiles = pgTable("lens_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profileId: text("profile_id").notNull().unique(), // Lens Profile ID (e.g., "0x01")
  handle: text("handle").notNull(), // Lens handle (e.g., "alice.lens")
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  ownedBy: text("owned_by").notNull(), // Wallet address that owns the profile
  isPrimary: boolean("is_primary").default(false),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("lens_profiles_user_id_idx").on(table.userId),
  profileIdIdx: index("lens_profiles_profile_id_idx").on(table.profileId),
}));

// ============================================
// Relations
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  web3Identities: many(web3Identities),
  sessions: many(sessions),
  passkeys: many(passkeys),
  activityLogs: many(activityLogs),
  vscoreHistory: many(vscoreHistory),
  oauthApps: many(oauthApps),
  lensProfiles: many(lensProfiles),
}));

export const lensProfilesRelations = relations(lensProfiles, ({ one }) => ({
  user: one(users, {
    fields: [lensProfiles.userId],
    references: [users.id],
  }),
}));

export const web3IdentitiesRelations = relations(web3Identities, ({ one }) => ({
  user: one(users, {
    fields: [web3Identities.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ============================================
// Insert schemas
// ============================================
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeb3IdentitySchema = createInsertSchema(web3Identities).omit({
  id: true,
  createdAt: true,
});

export const insertPasskeySchema = createInsertSchema(passkeys).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertVscoreHistorySchema = createInsertSchema(vscoreHistory).omit({
  id: true,
  createdAt: true,
});

// ============================================
// Types
// ============================================
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Web3Identity = typeof web3Identities.$inferSelect;
export type InsertWeb3Identity = z.infer<typeof insertWeb3IdentitySchema>;
export type Passkey = typeof passkeys.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VscoreHistory = typeof vscoreHistory.$inferSelect;
export type OAuthApp = typeof oauthApps.$inferSelect;
export type OAuthCode = typeof oauthCodes.$inferSelect;
export type OAuthToken = typeof oauthTokens.$inferSelect;
export type LensProfile = typeof lensProfiles.$inferSelect;

// SafeUser type (without sensitive fields)
export type SafeUser = Omit<User, 'passwordHash' | 'twoFactorSecret' | 'emailVerifyToken' | 'passwordResetToken'>;

// ============================================
// V-Score constants
// ============================================
export const VSCORE_WEIGHTS = {
  activity: 0.30,
  financial: 0.35,
  social: 0.20,
  trust: 0.15
};

export const VSCORE_LEVELS = {
  ELITE: { min: 800, label: 'Elite' },
  TRUSTED: { min: 600, label: 'Trusted' },
  ESTABLISHED: { min: 400, label: 'Established' },
  ACTIVE: { min: 200, label: 'Active' },
  NEWCOMER: { min: 0, label: 'Newcomer' }
};

// ============================================
// V-Score calculation helpers
// ============================================

/**
 * 计算总 V-Score (支持对象参数和单独参数两种形式)
 */
export function calculateTotalVScore(
  activityOrComponents: number | { activity?: number; financial?: number; social?: number; trust?: number },
  financial?: number,
  social?: number,
  trust?: number
): number {
  let activity: number;
  let fin: number;
  let soc: number;
  let tru: number;

  if (typeof activityOrComponents === 'object') {
    // 对象参数形式
    activity = activityOrComponents.activity || 0;
    fin = activityOrComponents.financial || 0;
    soc = activityOrComponents.social || 0;
    tru = activityOrComponents.trust || 0;
  } else {
    // 单独参数形式
    activity = activityOrComponents;
    fin = financial || 0;
    soc = social || 0;
    tru = trust || 0;
  }

  return Math.round(
    activity * VSCORE_WEIGHTS.activity +
    fin * VSCORE_WEIGHTS.financial +
    soc * VSCORE_WEIGHTS.social +
    tru * VSCORE_WEIGHTS.trust
  );
}

/**
 * 根据分数获取 V-Score 等级
 */
export function getVScoreLevel(score: number): string {
  if (score >= VSCORE_LEVELS.ELITE.min) return VSCORE_LEVELS.ELITE.label;
  if (score >= VSCORE_LEVELS.TRUSTED.min) return VSCORE_LEVELS.TRUSTED.label;
  if (score >= VSCORE_LEVELS.ESTABLISHED.min) return VSCORE_LEVELS.ESTABLISHED.label;
  if (score >= VSCORE_LEVELS.ACTIVE.min) return VSCORE_LEVELS.ACTIVE.label;
  return VSCORE_LEVELS.NEWCOMER.label;
}

/**
 * 获取 V-Score 等级详情
 */
export function getVScoreLevelDetails(score: number): { level: string; min: number; nextLevel?: { level: string; min: number; pointsNeeded: number } } {
  if (score >= VSCORE_LEVELS.ELITE.min) {
    return { level: VSCORE_LEVELS.ELITE.label, min: VSCORE_LEVELS.ELITE.min };
  }
  if (score >= VSCORE_LEVELS.TRUSTED.min) {
    return {
      level: VSCORE_LEVELS.TRUSTED.label,
      min: VSCORE_LEVELS.TRUSTED.min,
      nextLevel: {
        level: VSCORE_LEVELS.ELITE.label,
        min: VSCORE_LEVELS.ELITE.min,
        pointsNeeded: VSCORE_LEVELS.ELITE.min - score,
      },
    };
  }
  if (score >= VSCORE_LEVELS.ESTABLISHED.min) {
    return {
      level: VSCORE_LEVELS.ESTABLISHED.label,
      min: VSCORE_LEVELS.ESTABLISHED.min,
      nextLevel: {
        level: VSCORE_LEVELS.TRUSTED.label,
        min: VSCORE_LEVELS.TRUSTED.min,
        pointsNeeded: VSCORE_LEVELS.TRUSTED.min - score,
      },
    };
  }
  if (score >= VSCORE_LEVELS.ACTIVE.min) {
    return {
      level: VSCORE_LEVELS.ACTIVE.label,
      min: VSCORE_LEVELS.ACTIVE.min,
      nextLevel: {
        level: VSCORE_LEVELS.ESTABLISHED.label,
        min: VSCORE_LEVELS.ESTABLISHED.min,
        pointsNeeded: VSCORE_LEVELS.ESTABLISHED.min - score,
      },
    };
  }
  return {
    level: VSCORE_LEVELS.NEWCOMER.label,
    min: VSCORE_LEVELS.NEWCOMER.min,
    nextLevel: {
      level: VSCORE_LEVELS.ACTIVE.label,
      min: VSCORE_LEVELS.ACTIVE.min,
      pointsNeeded: VSCORE_LEVELS.ACTIVE.min - score,
    },
  };
}
