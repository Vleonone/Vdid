/**
 * V-Score API Routes
 * 处理 V-Score 相关的 HTTP 请求
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { vscoreService, VSCORE_ACTIONS } from '../services/vscore.service';
import { authMiddleware } from './auth.routes';

const router = Router();

// 所有 V-Score 路由都需要认证
router.use(authMiddleware);

// ============================================
// Routes
// ============================================

/**
 * GET /api/vscore
 * 获取当前用户的 V-Score
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const vscore = await vscoreService.getVScore(user.id);

    if (!vscore) {
      return res.status(404).json({
        success: false,
        error: 'V-Score not found',
      });
    }

    res.json({
      success: true,
      vscore,
    });
  } catch (error) {
    console.error('Get V-Score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get V-Score',
    });
  }
});

/**
 * GET /api/vscore/history
 * 获取 V-Score 历史记录
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await vscoreService.getHistory(user.id, limit, offset);

    res.json({
      success: true,
      history,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit,
      },
    });
  } catch (error) {
    console.error('Get V-Score history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get V-Score history',
    });
  }
});

/**
 * GET /api/vscore/levels
 * 获取所有等级信息
 */
router.get('/levels', async (req: Request, res: Response) => {
  try {
    const levels = [
      { name: 'Newcomer', min: 0, max: 199, benefits: ['Basic features access'] },
      { name: 'Active', min: 200, max: 399, benefits: ['Reduced transaction fees', 'Priority support'] },
      { name: 'Established', min: 400, max: 599, benefits: ['Higher limits', 'Exclusive features'] },
      { name: 'Trusted', min: 600, max: 799, benefits: ['VIP support', 'Beta features access'] },
      { name: 'Elite', min: 800, max: 1000, benefits: ['Maximum limits', 'Governance voting', 'Revenue sharing'] },
    ];

    res.json({
      success: true,
      levels,
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get level information',
    });
  }
});

/**
 * GET /api/vscore/weights
 * 获取 V-Score 权重配置
 */
router.get('/weights', async (req: Request, res: Response) => {
  try {
    const weights = vscoreService.getWeights();

    res.json({
      success: true,
      weights: {
        activity: { weight: weights.activity, description: 'User activity and engagement' },
        financial: { weight: weights.financial, description: 'Transaction history and financial behavior' },
        social: { weight: weights.social, description: 'Social interactions and referrals' },
        trust: { weight: weights.trust, description: 'Identity verification and security' },
      },
    });
  } catch (error) {
    console.error('Get weights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weight configuration',
    });
  }
});

/**
 * GET /api/vscore/actions
 * 获取可用的 V-Score 动作
 */
router.get('/actions', async (req: Request, res: Response) => {
  try {
    const actions = Object.entries(VSCORE_ACTIONS).map(([key, value]) => ({
      action: key,
      category: value.category,
      points: value.points,
      description: value.reason,
    }));

    res.json({
      success: true,
      actions,
    });
  } catch (error) {
    console.error('Get actions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available actions',
    });
  }
});

/**
 * POST /api/vscore/claim/:action
 * 领取特定动作的 V-Score (用于前端触发)
 */
router.post('/claim/:action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { action } = req.params;

    // 验证动作是否存在
    if (!(action in VSCORE_ACTIONS)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
      });
    }

    // 某些动作可能需要额外验证
    const restrictedActions = ['KYC_COMPLETE', 'FIRST_TRANSACTION', 'TRANSACTION'];
    if (restrictedActions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: 'This action can only be claimed by the system',
      });
    }

    const vscore = await vscoreService.applyAction(
      user.id,
      action as keyof typeof VSCORE_ACTIONS
    );

    if (!vscore) {
      return res.status(500).json({
        success: false,
        error: 'Failed to apply V-Score action',
      });
    }

    res.json({
      success: true,
      message: `Claimed ${VSCORE_ACTIONS[action as keyof typeof VSCORE_ACTIONS].points} points for ${action}`,
      vscore,
    });
  } catch (error) {
    console.error('Claim V-Score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim V-Score',
    });
  }
});

/**
 * GET /api/vscore/summary
 * 获取 V-Score 摘要 (用于 Dashboard)
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const vscore = await vscoreService.getVScore(user.id);
    const history = await vscoreService.getHistory(user.id, 5, 0);

    if (!vscore) {
      return res.status(404).json({
        success: false,
        error: 'V-Score not found',
      });
    }

    // 计算过去7天的变化
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentChanges = history.filter(h => h.createdAt > weekAgo);
    const weeklyChange = recentChanges.reduce((sum, h) => sum + (h.change ?? 0), 0);

    res.json({
      success: true,
      summary: {
        current: vscore,
        weeklyChange,
        recentHistory: history,
        tips: generateTips(vscore),
      },
    });
  } catch (error) {
    console.error('Get V-Score summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get V-Score summary',
    });
  }
});

// ============================================
// Helper Functions
// ============================================

/**
 * 生成提升 V-Score 的建议
 */
function generateTips(vscore: any): string[] {
  const tips: string[] = [];

  if (vscore.trust < 100) {
    tips.push('Verify your email to earn 50 Trust points');
  }

  if (vscore.trust < 200) {
    tips.push('Enable 2FA to earn 40 Trust points and secure your account');
  }

  if (vscore.activity < 100) {
    tips.push('Login daily to earn 5 Activity points');
  }

  if (vscore.social < 50) {
    tips.push('Invite friends to earn 30 Social points per referral');
  }

  if (vscore.financial < 50) {
    tips.push('Complete your first transaction to earn 50 Financial points');
  }

  // 根据等级给出建议
  if (vscore.level === 'Newcomer') {
    tips.push('Reach Active level (200 points) to unlock reduced transaction fees');
  } else if (vscore.level === 'Active') {
    tips.push('Reach Established level (400 points) for higher transaction limits');
  }

  return tips.slice(0, 3); // 最多返回3条建议
}

export default router;
