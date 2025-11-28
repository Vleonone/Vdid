/**
 * Authentication API Routes
 * 处理用户认证相关的 HTTP 请求
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { extractTokenFromHeader } from '../lib/jwt';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================
// Middleware
// ============================================

/**
 * 验证请求体
 */
function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

/**
 * 认证中间件
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  const user = await authService.verifyToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }

  // 将用户信息添加到请求对象
  (req as any).user = user;
  next();
}

/**
 * 可选认证中间件 (不强制要求登录)
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const user = await authService.verifyToken(token);
    if (user) {
      (req as any).user = user;
    }
  }

  next();
}

// ============================================
// Routes
// ============================================

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    const result = await authService.register({
      email,
      password,
      displayName,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: result.user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await authService.login({
      email,
      password,
      userAgent,
      ipAddress,
    });

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
    });
  }
});

/**
 * POST /api/auth/refresh
 * 刷新访问令牌
 */
router.post('/refresh', validateBody(refreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed. Please login again.',
    });
  }
});

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      // 从 token 中获取 sessionId 并登出
      const payload = await authService.verifyToken(token);
      if (payload) {
        // 这里需要从 JWT 中获取 sessionId，简化处理
        await authService.logoutAll((req as any).user.id);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * POST /api/auth/logout-all
 * 登出所有设备
 */
router.post('/logout-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await authService.logoutAll(user.id);

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
    });
  }
});

/**
 * GET /api/auth/verify-email/:token
 * 验证邮箱
 */
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const success = await authService.verifyEmail(token);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * 请求密码重置
 */
router.post('/forgot-password', validateBody(resetPasswordRequestSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const token = await authService.requestPasswordReset(email);

    // 无论是否找到用户，都返回成功 (防止邮箱枚举攻击)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    // TODO: 在实际应用中，这里应该发送重置邮件
    if (token) {
      console.log(`Password reset token for ${email}: ${token}`);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset request failed',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * 重置密码
 */
router.post('/reset-password', validateBody(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const success = await authService.resetPassword(token, password);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed',
    });
  }
});

/**
 * GET /api/auth/check-vid/:vid
 * 检查 V-ID 是否存在
 */
router.get('/check-vid/:vid', async (req: Request, res: Response) => {
  try {
    const { vid } = req.params;

    const user = await authService.getUserByVID(vid);

    res.json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error('Check VID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check V-ID',
    });
  }
});

export default router;
