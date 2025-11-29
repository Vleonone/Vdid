/**
 * Web3 Wallet Routes - 钱包认证 API
 * 
 * 端点：
 * - POST /api/wallet/nonce - 获取 SIWE nonce
 * - POST /api/wallet/verify - 验证签名并登录
 * - POST /api/wallet/bind - 绑定钱包到现有账户
 * - DELETE /api/wallet/unbind - 解除钱包绑定
 * - GET /api/wallet/identities - 获取用户的 Web3 身份
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  generateSIWENonce,
  createSIWEMessage,
  getOrCreateNonce,
  walletAuth,
  bindWallet,
  getUserWeb3Identities,
  unbindWallet,
  isValidEthereumAddress,
} from '../services/wallet.service';
import { walletRateLimit, strictRateLimit } from '../middleware/rate-limit';

const router = Router();

// 认证中间件类型 - 使用全局声明的 Express.Request 类型
type AuthRequest = Request;

// 获取 SIWE Nonce
router.post('/nonce', walletRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, chainId = 1 } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    if (!isValidEthereumAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    const { nonce, expiresAt } = await getOrCreateNonce(address);
    
    // 创建 SIWE 消息
    const domain = req.get('host') || 'vdid.velon.io';
    const uri = `https://${domain}`;
    
    const message = createSIWEMessage({
      address,
      chainId,
      nonce,
      domain,
      uri,
    });
    
    res.json({
      nonce,
      message,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 验证签名并登录/注册
router.post('/verify', strictRateLimit, walletRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, signature, message, chainId = 1, ensName } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({
        error: 'Address, signature, and message are required',
      });
    }
    
    if (!isValidEthereumAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    const result = await walletAuth({
      address,
      signature,
      message,
      chainId,
      ensName,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // 设置 HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({
      user: {
        id: result.user.id,
        vid: result.user.vid,
        did: result.user.did,
        email: result.user.email,
        displayName: result.user.displayName,
        walletAddress: result.user.walletAddress,
        ensName: result.user.ensName,
        vscoreTotal: result.user.vscoreTotal,
        vscoreLevel: result.user.vscoreLevel,
      },
      accessToken: result.tokens.accessToken,
      isNewUser: result.isNewUser,
    });
  } catch (error) {
    next(error);
  }
});

// 绑定钱包到现有账户 (需要认证)
router.post('/bind', walletRateLimit, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { address, signature, message, chainId = 1, ensName } = req.body;
    
    if (!address || !signature || !message) {
      return res.status(400).json({
        error: 'Address, signature, and message are required',
      });
    }
    
    const result = await bindWallet({
      userId: req.user.id,
      address,
      signature,
      message,
      chainId,
      ensName,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 解除钱包绑定 (需要认证)
router.delete('/unbind', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    await unbindWallet(req.user.id, address);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 获取用户的 Web3 身份 (需要认证)
router.get('/identities', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const identities = await getUserWeb3Identities(req.user.id);
    
    res.json({ identities });
  } catch (error) {
    next(error);
  }
});

// 支持的链列表
router.get('/chains', (_req: Request, res: Response) => {
  const chains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'ETH' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
    { id: 56, name: 'BNB Chain', symbol: 'BNB' },
  ];
  
  res.json({ chains });
});

export default router;
