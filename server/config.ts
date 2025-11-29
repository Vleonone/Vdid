/**
 * Server Configuration
 * 环境变量验证和配置管理
 *
 * 在服务启动时验证所有必需的环境变量
 */

import { z } from 'zod';

// 环境变量 Schema
const envSchema = z.object({
  // 必需变量
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),

  // 数据库 (生产环境必需)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT (生产环境必需使用非默认值)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ISSUER: z.string().default('vdid.io'),

  // 邮件服务 (可选，但推荐)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@vdid.io'),

  // WebAuthn
  WEBAUTHN_RP_ID: z.string().default('localhost'),
  WEBAUTHN_ORIGIN: z.string().url().optional(),

  // 前端 URL
  CLIENT_URL: z.string().url().default('http://localhost:5000'),
});

// 类型导出
export type EnvConfig = z.infer<typeof envSchema>;

// 验证环境变量
function validateEnv(): EnvConfig {
  const isDev = process.env.NODE_ENV !== 'production';

  // 开发环境允许默认值
  if (isDev) {
    // 设置开发环境默认值
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/vdid_dev';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-at-least-32-characters-long';
  }

  try {
    const config = envSchema.parse(process.env);

    // 生产环境额外检查
    if (config.NODE_ENV === 'production') {
      // 检查 JWT_SECRET 不是默认值
      if (config.JWT_SECRET.includes('default') || config.JWT_SECRET.includes('dev-secret')) {
        throw new Error('JWT_SECRET must not use default value in production');
      }

      // 警告缺少邮件配置
      if (!config.RESEND_API_KEY) {
        console.warn('⚠️  Warning: RESEND_API_KEY not set. Email features will be disabled.');
      }
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
      console.error('\n❌ Environment validation failed:\n' + missing + '\n');
      process.exit(1);
    }
    throw error;
  }
}

// 导出配置单例
export const config = validateEnv();

// 便捷访问
export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// 打印配置摘要 (不包含敏感信息)
export function printConfigSummary(): void {
  console.log('\n📋 Server Configuration:');
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Port: ${config.PORT}`);
  console.log(`  Database: ${config.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`  JWT Issuer: ${config.JWT_ISSUER}`);
  console.log(`  Email: ${config.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`  WebAuthn RP: ${config.WEBAUTHN_RP_ID}`);
  console.log('');
}
