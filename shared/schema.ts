import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  vid: text("vid").notNull().unique(), // VID-XXXX-XXXX-XXXX format
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  primaryWallet: text("primary_wallet"),
  vscoreTotal: integer("vscore_total").default(0),
  vscoreActivity: integer("vscore_activity").default(0),
  vscoreFinancial: integer("vscore_financial").default(0),
  vscoreSocial: integer("vscore_social").default(0),
  vscoreTrust: integer("vscore_trust").default(0),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Web3 Identities table - for multi-wallet management
export const web3Identities = pgTable("web3_identities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletAddress: text("wallet_address").notNull(),
  chainId: integer("chain_id").notNull().default(8453), // BASE mainnet
  chainName: text("chain_name").notNull().default("BASE"),
  isPrimary: boolean("is_primary").default(false),
  label: text("label"), // User-friendly label like "Main Wallet", "Trading Wallet"
  ensName: text("ens_name"), // ENS domain if available
  lastUsed: timestamp("last_used"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userWalletIdx: uniqueIndex("user_wallet_chain_idx").on(table.userId, table.walletAddress, table.chainId),
  walletIdx: index("wallet_address_idx").on(table.walletAddress),
}));

// Refresh tokens table
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Passkeys table
export const passkeys = pgTable("passkeys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  deviceType: text("device_type"),
  deviceName: text("device_name"),
  transports: jsonb("transports"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // login, logout, wallet_connect, wallet_disconnect, settings_update, etc.
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OAuth applications table (for OAuth provider functionality)
export const oauthApps = pgTable("oauth_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  redirectUris: jsonb("redirect_uris").notNull(),
  scopes: jsonb("scopes").notNull(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// OAuth authorization codes table
export const oauthCodes = pgTable("oauth_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  clientId: text("client_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  scopes: jsonb("scopes").notNull(),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Web3Identity = typeof web3Identities.$inferSelect;
export type InsertWeb3Identity = z.infer<typeof insertWeb3IdentitySchema>;
export type Passkey = typeof passkeys.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;

// Safe user type (without sensitive fields)
export type SafeUser = Omit<User, 'passwordHash' | 'twoFactorSecret'>;// V-Score calculation helpers
export function calculateTotalVScore(components: {
  activity?: number;
  financial?: number;
  social?: number;
  trust?: number;
}): number {
  const activity = components.activity || 0;
  const financial = components.financial || 0;
  const social = components.social || 0;
  const trust = components.trust || 0;
  return Math.round(activity * 0.30 + financial * 0.35 + social * 0.20 + trust * 0.15);
}

export function getVScoreLevel(score: number): string {
  if (score >= 800) return 'Elite';
  if (score >= 600) return 'Trusted';
  if (score >= 400) return 'Established';
  if (score >= 200) return 'Active';
  return 'Newcomer';
}
