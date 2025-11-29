/**
 * Passkeys Routes - WebAuthn API
 * 
 * 端点：
 * - POST /api/passkeys/register/options - 获取注册选项
 * - POST /api/passkeys/register/verify - 验证注册
 * - POST /api/passkeys/authenticate/options - 获取认证选项
 * - POST /api/passkeys/authenticate/verify - 验证认证
 * - GET /api/passkeys - 获取用户的 passkeys
 * - DELETE /api/passkeys/:id - 删除 passkey
 * - PATCH /api/passkeys/:id - 重命名 passkey
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  getUserPasskeys,
  deletePasskey,
  renamePasskey,
} from '../services/passkeys.service';

const router = Router();

// 认证中间件类型
interface AuthRequest extends Request {
  user?: { id: string; vid: string };
}

// ============================================
// 注册流程
// ============================================

// 获取注册选项 (需要认证)
router.post('/register/options', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const options = await generateRegistrationOptions(req.user.id);
    
    res.json(options);
  } catch (error) {
    next(error);
  }
});

// 验证注册 (需要认证)
router.post('/register/verify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { credentialId, publicKey, challenge, aaguid, deviceName, transports } = req.body;
    
    if (!credentialId || !publicKey || !challenge) {
      return res.status(400).json({
        error: 'credentialId, publicKey, and challenge are required',
      });
    }
    
    const result = await verifyRegistration({
      userId: req.user.id,
      credentialId,
      publicKey,
      challenge,
      aaguid,
      deviceName,
      transports,
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// 认证流程
// ============================================

// 获取认证选项 (公开)
router.post('/authenticate/options', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, userId } = req.body;
    
    const options = await generateAuthenticationOptions({ email, userId });
    
    res.json(options);
  } catch (error) {
    next(error);
  }
});

// 验证认证 (公开)
router.post('/authenticate/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      credentialId,
      authenticatorData,
      clientDataJSON,
      signature,
      challenge,
    } = req.body;
    
    if (!credentialId || !authenticatorData || !clientDataJSON || !signature || !challenge) {
      return res.status(400).json({
        error: 'Missing required authentication data',
      });
    }
    
    const result = await verifyAuthentication({
      credentialId,
      authenticatorData,
      clientDataJSON,
      signature,
      challenge,
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
        vscoreTotal: result.user.vscoreTotal,
        vscoreLevel: result.user.vscoreLevel,
      },
      accessToken: result.tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Passkey 管理
// ============================================

// 获取用户的所有 Passkeys (需要认证)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const passkeys = await getUserPasskeys(req.user.id);
    
    res.json({ passkeys });
  } catch (error) {
    next(error);
  }
});

// 删除 Passkey (需要认证)
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { id } = req.params;
    
    await deletePasskey(req.user.id, id);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 重命名 Passkey (需要认证)
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { id } = req.params;
    const { deviceName } = req.body;
    
    if (!deviceName || typeof deviceName !== 'string') {
      return res.status(400).json({ error: 'deviceName is required' });
    }
    
    await renamePasskey(req.user.id, id, deviceName);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
