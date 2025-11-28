/**
 * Database Connection Configuration
 * 使用 Drizzle ORM 连接 PostgreSQL
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// 检查必需的环境变量
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// 创建 PostgreSQL 连接
const connectionString = process.env.DATABASE_URL;

// 连接配置
const client = postgres(connectionString, {
  max: 10, // 最大连接数
  idle_timeout: 20, // 空闲超时 (秒)
  connect_timeout: 10, // 连接超时 (秒)
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

// 创建 Drizzle 实例
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV !== 'production', // 开发环境启用日志
});

// 导出 schema
export { schema };

// 健康检查函数
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// 关闭连接 (用于优雅关闭)
export async function closeDatabaseConnection(): Promise<void> {
  await client.end();
}
