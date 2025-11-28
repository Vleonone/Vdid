/**
 * Password Hashing Utility
 * 使用 Argon2id 算法进行密码哈希
 * 
 * Argon2id 是目前最安全的密码哈希算法之一，
 * 结合了 Argon2i (防止侧信道攻击) 和 Argon2d (防止 GPU 暴力破解) 的优点
 */

import argon2 from 'argon2';

// Argon2id 配置 (符合 OWASP 推荐)
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // 3 次迭代
  parallelism: 4,         // 4 并行线程
  hashLength: 32,         // 32 字节输出
};

/**
 * 哈希密码
 * 
 * @param password - 明文密码
 * @returns 哈希后的密码字符串
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password, ARGON2_CONFIG);
    return hash;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * 验证密码
 * 
 * @param password - 明文密码
 * @param hash - 存储的哈希值
 * @returns 密码是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * 检查密码是否需要重新哈希
 * (当配置参数更新时)
 * 
 * @param hash - 现有的哈希值
 * @returns 是否需要重新哈希
 */
export async function needsRehash(hash: string): Promise<boolean> {
  try {
    return argon2.needsRehash(hash, ARGON2_CONFIG);
  } catch (error) {
    return false;
  }
}

/**
 * 验证密码强度
 * 
 * @param password - 要验证的密码
 * @returns 验证结果
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // 最小长度
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // 包含小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  // 包含大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  // 包含数字
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  // 包含特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 15;
  }

  // 检查常见弱密码
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon'
  ];
  
  if (commonPasswords.some(common => 
    password.toLowerCase().includes(common)
  )) {
    errors.push('Password is too common');
    score = Math.max(0, score - 30);
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(100, score),
  };
}
