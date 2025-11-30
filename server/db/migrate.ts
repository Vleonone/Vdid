/**
 * Database Migration Script
 * 自动添加缺失的数据库列
 */

import { sql } from 'drizzle-orm';
import { db } from './index';

export async function runMigrations() {
  console.log('🔄 Checking database schema...');

  try {
    // 添加 users 表缺失的列
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_wallet TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_signature TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ens_name TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS chain_id INTEGER;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS siwe_nonce TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS siwe_nonce_expires TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS lens_handle TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS lens_profile_id TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS lens_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS passkey_enabled BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_token TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_activity INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_financial INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_social INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_trust INTEGER DEFAULT 50;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_total INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vscore_level TEXT DEFAULT 'Newcomer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);

    console.log('✅ Database schema verified');
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Don't throw - let the server continue even if migration fails
  }
}
