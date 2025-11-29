import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  vid: text("vid").notNull().unique(),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  primaryWallet: text("primary_wallet"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  emailVerified: boolean("email_verified").default(false),
  vscoreActivity: integer("vscore_activity").default(0),
  vscoreFinancial: integer("vscore_financial").default(0),
  vscoreSocial: integer("vscore_social").default(0),
  vscoreTrust: integer("vscore_trust").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Web3 Identities table (wallets, ENS, etc.)
export const web3Identities = pgTable("web3_identities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletAddress: text("wallet_address").notNull(),
  chainId: integer("chain_id").default(1),
  isPrimary: boolean("is_primary").default(false),
  ensName: text("ens_name"),
  label: text("label"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
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

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  counter: integer("counter").default(0),
  deviceType: text("device_type"),
  transports: text("transports"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OAuth Apps table
export const oauthApps = pgTable("oauth_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  redirectUris: text("redirect_uris").notNull(),
  scopes: text("scopes").default("openid profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OAuth Codes table
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

// Insert schemas
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
export type Session = typeof sessions.$inferSelect;

// SafeUser type (without sensitive fields)
export type SafeUser = Omit<User, 'passwordHash' | 'twoFactorSecret'>;

// V-Score constants
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

// V-Score calculation helpers
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
  return Math.round(
    activity * VSCORE_WEIGHTS.activity + 
    financial * VSCORE_WEIGHTS.financial + 
    social * VSCORE_WEIGHTS.social + 
    trust * VSCORE_WEIGHTS.trust
  );
}

export function getVScoreLevel(score: number): string {
  if (score >= VSCORE_LEVELS.ELITE.min) return VSCORE_LEVELS.ELITE.label;
  if (score >= VSCORE_LEVELS.TRUSTED.min) return VSCORE_LEVELS.TRUSTED.label;
  if (score >= VSCORE_LEVELS.ESTABLISHED.min) return VSCORE_LEVELS.ESTABLISHED.label;
  if (score >= VSCORE_LEVELS.ACTIVE.min) return VSCORE_LEVELS.ACTIVE.label;
  return VSCORE_LEVELS.NEWCOMER.label;
}
