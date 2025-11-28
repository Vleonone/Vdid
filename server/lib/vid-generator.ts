/**
 * V-ID Generator
 * 
 * V-ID 格式: VID-XXXX-XXXX-XXXX
 * - 总长度: 19 字符
 * - 前缀: VID-
 * - 3组4字符，用连字符分隔
 * - 字符集: A-Z, 0-9 (排除易混淆字符: O, I, L, 0, 1)
 * 
 * 生成算法:
 * 1. 时间戳 (毫秒) 编码为第一组
 * 2. 随机数编码为第二组
 * 3. 哈希校验位为第三组
 */

import { createHash, randomBytes } from 'crypto';

// 安全字符集 (排除易混淆字符: O, I, L, 0, 1)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CHARSET_LENGTH = CHARSET.length; // 29

/**
 * 将数字编码为指定长度的字符串
 */
function encodeNumber(num: bigint, length: number): string {
  let result = '';
  let n = num;
  
  for (let i = 0; i < length; i++) {
    result = CHARSET[Number(n % BigInt(CHARSET_LENGTH))] + result;
    n = n / BigInt(CHARSET_LENGTH);
  }
  
  return result;
}

/**
 * 生成随机字符串
 */
function generateRandomSegment(length: number): string {
  const bytes = randomBytes(length * 2);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % CHARSET_LENGTH;
    result += CHARSET[index];
  }
  
  return result;
}

/**
 * 计算校验位
 */
function calculateChecksum(segment1: string, segment2: string): string {
  const data = segment1 + segment2;
  const hash = createHash('sha256').update(data).digest('hex');
  
  // 取哈希前8个字符，转换为数字，然后编码
  const hashNum = BigInt('0x' + hash.substring(0, 8));
  return encodeNumber(hashNum, 4);
}

/**
 * 生成唯一的 V-ID
 * 
 * @returns 格式为 VID-XXXX-XXXX-XXXX 的唯一标识符
 */
export function generateVID(): string {
  // 第一段: 基于时间戳
  const timestamp = BigInt(Date.now());
  const segment1 = encodeNumber(timestamp, 4);
  
  // 第二段: 随机数
  const segment2 = generateRandomSegment(4);
  
  // 第三段: 校验位
  const segment3 = calculateChecksum(segment1, segment2);
  
  return `VID-${segment1}-${segment2}-${segment3}`;
}

/**
 * 验证 V-ID 格式是否正确
 * 
 * @param vid - 要验证的 V-ID
 * @returns 是否有效
 */
export function validateVID(vid: string): boolean {
  // 检查格式
  const regex = /^VID-([A-HJ-NP-Z2-9]{4})-([A-HJ-NP-Z2-9]{4})-([A-HJ-NP-Z2-9]{4})$/;
  const match = vid.match(regex);
  
  if (!match) {
    return false;
  }
  
  const [, segment1, segment2, segment3] = match;
  
  // 验证校验位
  const expectedChecksum = calculateChecksum(segment1, segment2);
  return segment3 === expectedChecksum;
}

/**
 * 生成 DID (去中心化标识符)
 * 
 * @param network - 区块链网络 (base, polygon, arbitrum)
 * @param address - 钱包地址或唯一标识
 * @returns 格式为 did:vdid:network:identifier 的 DID
 */
export function generateDID(network: string = 'base', address?: string): string {
  const identifier = address || generateRandomIdentifier();
  return `did:vdid:${network}:${identifier}`;
}

/**
 * 生成随机标识符 (用于未绑定钱包的用户)
 */
function generateRandomIdentifier(): string {
  const bytes = randomBytes(16);
  return bytes.toString('hex');
}

/**
 * 验证 DID 格式
 * 
 * @param did - 要验证的 DID
 * @returns 是否有效
 */
export function validateDID(did: string): boolean {
  const regex = /^did:vdid:(base|polygon|arbitrum):([a-fA-F0-9]{32,42})$/;
  return regex.test(did);
}

/**
 * 从 DID 中解析网络和标识符
 */
export function parseDID(did: string): { network: string; identifier: string } | null {
  const regex = /^did:vdid:(base|polygon|arbitrum):([a-fA-F0-9]{32,42})$/;
  const match = did.match(regex);
  
  if (!match) {
    return null;
  }
  
  return {
    network: match[1],
    identifier: match[2],
  };
}

/**
 * 生成 API Key
 * 
 * @param prefix - 前缀 (如 'vdid_pk' 用于 public key, 'vdid_sk' 用于 secret key)
 * @returns 格式为 prefix_xxxxxxxxxxxx 的 API Key
 */
export function generateAPIKey(prefix: string = 'vdid'): string {
  const randomPart = randomBytes(24).toString('base64url');
  return `${prefix}_${randomPart}`;
}

/**
 * 生成安全的随机令牌
 * 
 * @param length - 字节长度 (输出为 hex，所以字符长度是字节数的2倍)
 * @returns 随机令牌
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * 生成 OAuth 客户端凭证
 */
export function generateOAuthCredentials(): { clientId: string; clientSecret: string } {
  return {
    clientId: generateSecureToken(16),  // 32 字符
    clientSecret: generateSecureToken(32),  // 64 字符
  };
}

/**
 * 生成 2FA 备份码
 * 
 * @param count - 备份码数量
 * @returns 备份码数组
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // 格式: XXXX-XXXX (8位数字)
    const part1 = Math.random().toString().slice(2, 6);
    const part2 = Math.random().toString().slice(2, 6);
    codes.push(`${part1}-${part2}`);
  }
  
  return codes;
}

// 导出类型
export interface VIDInfo {
  vid: string;
  isValid: boolean;
  createdAt?: Date;
}

export interface DIDInfo {
  did: string;
  network: string;
  identifier: string;
  isValid: boolean;
}
