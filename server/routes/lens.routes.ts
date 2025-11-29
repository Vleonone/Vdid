/**
 * Lens Protocol Routes - 去中心化社交身份 API (预留)
 * 
 * 端点：
 * - GET /api/lens/profiles - 获取用户的 Lens Profiles
 * - POST /api/lens/link - 链接 Lens Profile
 * - DELETE /api/lens/unlink/:profileId - 解除链接
 * - PATCH /api/lens/primary/:profileId - 设置主 Profile
 * - GET /api/lens/lookup/:address - 查找地址的 Lens Profiles
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  linkLensProfile,
  unlinkLensProfile,
  getUserLensProfiles,
  setPrimaryLensProfile,
  getLensProfiles,
} from '../services/lens.service.js';

const router = Router();

// 认证中间件类型
interface AuthRequest extends Request {
  user?: { id: string; vid: string };
}

// 获取用户链接的 Lens Profiles (需要认证)
router.get('/profiles', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const profiles = await getUserLensProfiles(req.user.id);
    
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
});

// 链接 Lens Profile (需要认证)
router.post('/link', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { profileId, handle, walletAddress, signature } = req.body;
    
    if (!profileId || !handle || !walletAddress || !signature) {
      return res.status(400).json({
        error: 'profileId, handle, walletAddress, and signature are required',
      });
    }
    
    const result = await linkLensProfile({
      userId: req.user.id,
      profileId,
      handle,
      walletAddress,
      signature,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 解除 Lens Profile 链接 (需要认证)
router.delete('/unlink/:profileId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { profileId } = req.params;
    
    await unlinkLensProfile(req.user.id, profileId);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 设置主 Lens Profile (需要认证)
router.patch('/primary/:profileId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { profileId } = req.params;
    
    await setPrimaryLensProfile(req.user.id, profileId);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 查找地址的 Lens Profiles (公开)
router.get('/lookup/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    
    const profiles = await getLensProfiles(address);
    
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
});

// Lens Protocol 状态 (公开)
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    enabled: true,
    status: 'preview', // preview, beta, stable
    chainId: 137, // Polygon
    features: {
      authentication: false, // 尚未实现
      profileLinking: true,
      socialGraph: false, // 尚未实现
    },
    message: 'Lens Protocol integration is in preview. Full authentication coming soon.',
  });
});

export default router;
