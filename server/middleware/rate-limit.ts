/**
 * Rate Limiting Middleware
 * 保护 API 免受暴力攻击和滥用
 */

import rateLimit from 'express-rate-limit';
import { config, isProd } from '../config';

// ============================================
// Rate Limit Configurations
// ============================================

/**
 * 严格限制 - 用于登录、注册等敏感端点
 * 防止暴力破解攻击
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口
  max: isProd ? 5 : 100, // 生产环境: 15分钟内最多5次, 开发环境: 100次
  message: {
    success: false,
    error: 'Too many attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true, // 返回 RateLimit-* headers
  legacyHeaders: false,
  // 使用 IP 作为标识符
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // 在测试环境跳过限制
    return config.NODE_ENV === 'test';
  },
});

/**
 * 认证端点限制 - 用于登录和注册
 * 更严格的限制，针对账户安全
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时窗口
  max: isProd ? 10 : 200, // 生产环境: 1小时内最多10次, 开发环境: 200次
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 结合 IP 和 email (如果有)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email?.toLowerCase() || '';
    return `${ip}:${email}`;
  },
  skip: (req) => {
    return config.NODE_ENV === 'test';
  },
});

/**
 * 密码重置限制 - 防止邮箱轰炸
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时窗口
  max: isProd ? 3 : 50, // 生产环境: 1小时内最多3次
  message: {
    success: false,
    error: 'Too many password reset attempts. Please try again in an hour.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    return config.NODE_ENV === 'test';
  },
});

/**
 * 标准 API 限制 - 用于一般 API 端点
 */
export const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口
  max: isProd ? 100 : 1000, // 生产环境: 15分钟内最多100次
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    return config.NODE_ENV === 'test';
  },
});

/**
 * 宽松限制 - 用于只读端点
 */
export const relaxedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口
  max: isProd ? 300 : 3000, // 生产环境: 15分钟内最多300次
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    return config.NODE_ENV === 'test';
  },
});

/**
 * 钱包操作限制 - 用于 SIWE 和钱包相关端点
 */
export const walletRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口
  max: isProd ? 20 : 200, // 生产环境: 15分钟内最多20次
  message: {
    success: false,
    error: 'Too many wallet operations. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    return config.NODE_ENV === 'test';
  },
});

/**
 * 全局 API 限制 - 作为最后防线
 */
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 分钟窗口
  max: isProd ? 60 : 600, // 生产环境: 每分钟最多60次
  message: {
    success: false,
    error: 'Rate limit exceeded. Please try again later.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // 跳过健康检查
    return req.path === '/api/health' || config.NODE_ENV === 'test';
  },
});
