/**
 * V-Score Service
 * 处理 V-Score 计算、更新和历史记录
 * 
 * V-Score 权重:
 * - Activity: 30%  (用户活跃度)
 * - Financial: 35% (金融行为)
 * - Social: 20%    (社交互动)
 * - Trust: 15%     (信任度)
 * 
 * 等级:
 * - Newcomer: 0-199
 * - Active: 200-399
 * - Established: 400-599
 * - Trusted: 600-799
 * - Elite: 800-1000
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '../db';
import { calculateTotalVScore, getVScoreLevel, VSCORE_WEIGHTS, VSCORE_LEVELS } from '../../shared/schema';

const { users, vscoreHistory, activityLogs } = schema;

// ============================================
// Types
// ============================================

export type VScoreCategory = 'activity' | 'financial' | 'social' | 'trust';

export interface VScoreUpdate {
  userId: number;
  category: VScoreCategory;
  points: number;
  reason: string;
  sourceAction?: string;
}

export interface VScoreInfo {
  total: number;
  level: string;
  activity: number;
  financial: number;
  social: number;
  trust: number;
  percentile?: number;
  nextLevel?: {
    name: string;
    pointsNeeded: number;
  };
}

export interface VScoreHistoryItem {
  id: number;
  previousTotal: number;
  newTotal: number;
  change: number;
  reason: string | null;
  createdAt: Date;
  levelChanged: boolean;
  newLevel: string | null;
}

// ============================================
// V-Score 动作配置
// ============================================

export const VSCORE_ACTIONS = {
  // Activity 类别
  DAILY_LOGIN: { category: 'activity' as VScoreCategory, points: 5, reason: 'Daily login' },
  COMPLETE_PROFILE: { category: 'activity' as VScoreCategory, points: 20, reason: 'Complete profile' },
  USE_FEATURE: { category: 'activity' as VScoreCategory, points: 2, reason: 'Use platform feature' },
  
  // Financial 类别
  FIRST_TRANSACTION: { category: 'financial' as VScoreCategory, points: 50, reason: 'First transaction' },
  TRANSACTION: { category: 'financial' as VScoreCategory, points: 5, reason: 'Complete transaction' },
  HOLD_TOKEN: { category: 'financial' as VScoreCategory, points: 10, reason: 'Hold RTX token' },
  
  // Social 类别
  INVITE_FRIEND: { category: 'social' as VScoreCategory, points: 30, reason: 'Invite friend' },
  FRIEND_JOINED: { category: 'social' as VScoreCategory, points: 20, reason: 'Friend joined' },
  SHARE_CONTENT: { category: 'social' as VScoreCategory, points: 5, reason: 'Share content' },
  
  // Trust 类别
  VERIFY_EMAIL: { category: 'trust' as VScoreCategory, points: 50, reason: 'Verify email' },
  VERIFY_PHONE: { category: 'trust' as VScoreCategory, points: 30, reason: 'Verify phone' },
  ENABLE_2FA: { category: 'trust' as VScoreCategory, points: 40, reason: 'Enable 2FA' },
  VERIFY_WALLET: { category: 'trust' as VScoreCategory, points: 50, reason: 'Verify wallet' },
  KYC_COMPLETE: { category: 'trust' as VScoreCategory, points: 100, reason: 'Complete KYC' },
} as const;

// ============================================
// V-Score Service
// ============================================

export class VScoreService {
  /**
   * 获取用户 V-Score 详情
   */
  async getVScore(userId: number): Promise<VScoreInfo | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    const total = user.vscoreTotal ?? 0;
    const level = user.vscoreLevel ?? 'Newcomer';

    // 计算下一等级信息
    let nextLevel: VScoreInfo['nextLevel'];
    if (total < 200) {
      nextLevel = { name: 'Active', pointsNeeded: 200 - total };
    } else if (total < 400) {
      nextLevel = { name: 'Established', pointsNeeded: 400 - total };
    } else if (total < 600) {
      nextLevel = { name: 'Trusted', pointsNeeded: 600 - total };
    } else if (total < 800) {
      nextLevel = { name: 'Elite', pointsNeeded: 800 - total };
    }

    return {
      total,
      level,
      activity: user.vscoreActivity ?? 0,
      financial: user.vscoreFinancial ?? 0,
      social: user.vscoreSocial ?? 0,
      trust: user.vscoreTrust ?? 0,
      nextLevel,
    };
  }

  /**
   * 更新 V-Score
   */
  async updateVScore(update: VScoreUpdate): Promise<VScoreInfo | null> {
    const { userId, category, points, reason, sourceAction } = update;

    // 获取当前用户
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    // 计算新分数
    const currentScores = {
      activity: user.vscoreActivity ?? 0,
      financial: user.vscoreFinancial ?? 0,
      social: user.vscoreSocial ?? 0,
      trust: user.vscoreTrust ?? 0,
    };

    // 更新对应类别的分数 (确保不超过 1000)
    const newCategoryScore = Math.min(1000, Math.max(0, currentScores[category] + points));
    currentScores[category] = newCategoryScore;

    // 计算新的总分
    const newTotal = calculateTotalVScore(
      currentScores.activity,
      currentScores.financial,
      currentScores.social,
      currentScores.trust
    );
    const newLevel = getVScoreLevel(newTotal);
    const previousTotal = user.vscoreTotal ?? 0;
    const previousLevel = user.vscoreLevel ?? 'Newcomer';
    const levelChanged = newLevel !== previousLevel;

    // 更新用户
    await db.update(users)
      .set({
        vscoreActivity: currentScores.activity,
        vscoreFinancial: currentScores.financial,
        vscoreSocial: currentScores.social,
        vscoreTrust: currentScores.trust,
        vscoreTotal: newTotal,
        vscoreLevel: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 记录历史
    await db.insert(vscoreHistory).values({
      userId,
      previousTotal,
      newTotal,
      change: newTotal - previousTotal,
      activityScore: currentScores.activity,
      financialScore: currentScores.financial,
      socialScore: currentScores.social,
      trustScore: currentScores.trust,
      reason,
      sourceAction,
      previousLevel,
      newLevel,
      levelChanged,
    });

    // 记录活动日志
    await db.insert(activityLogs).values({
      userId,
      action: 'vscore_update',
      category: 'vscore',
      details: {
        category,
        points,
        reason,
        previousTotal,
        newTotal,
        levelChanged,
      },
      vscoreImpact: points,
      vscoreCategory: category,
      status: 'success',
    });

    return this.getVScore(userId);
  }

  /**
   * 应用预定义的 V-Score 动作
   */
  async applyAction(
    userId: number,
    actionKey: keyof typeof VSCORE_ACTIONS
  ): Promise<VScoreInfo | null> {
    const action = VSCORE_ACTIONS[actionKey];
    
    return this.updateVScore({
      userId,
      category: action.category,
      points: action.points,
      reason: action.reason,
      sourceAction: actionKey,
    });
  }

  /**
   * 获取 V-Score 历史
   */
  async getHistory(
    userId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<VScoreHistoryItem[]> {
    const history = await db.query.vscoreHistory.findMany({
      where: eq(vscoreHistory.userId, userId),
      orderBy: (h, { desc }) => [desc(h.createdAt)],
      limit,
      offset,
    });

    return history.map(h => ({
      id: h.id,
      previousTotal: h.previousTotal,
      newTotal: h.newTotal,
      change: h.change,
      reason: h.reason,
      createdAt: h.createdAt,
      levelChanged: h.levelChanged ?? false,
      newLevel: h.newLevel,
    }));
  }

  /**
   * 获取等级信息
   */
  getLevelInfo(level: string): typeof VSCORE_LEVELS[keyof typeof VSCORE_LEVELS] | null {
    const upperLevel = level.toUpperCase() as keyof typeof VSCORE_LEVELS;
    return VSCORE_LEVELS[upperLevel] ?? null;
  }

  /**
   * 获取权重配置
   */
  getWeights() {
    return VSCORE_WEIGHTS;
  }

  /**
   * 批量更新 V-Score (用于系统任务)
   */
  async batchUpdate(updates: VScoreUpdate[]): Promise<number> {
    let successCount = 0;

    for (const update of updates) {
      try {
        await this.updateVScore(update);
        successCount++;
      } catch (error) {
        console.error(`Failed to update V-Score for user ${update.userId}:`, error);
      }
    }

    return successCount;
  }

  /**
   * 重新计算用户总分 (用于修复数据)
   */
  async recalculateTotal(userId: number): Promise<VScoreInfo | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    const newTotal = calculateTotalVScore(
      user.vscoreActivity ?? 0,
      user.vscoreFinancial ?? 0,
      user.vscoreSocial ?? 0,
      user.vscoreTrust ?? 0
    );
    const newLevel = getVScoreLevel(newTotal);

    await db.update(users)
      .set({
        vscoreTotal: newTotal,
        vscoreLevel: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return this.getVScore(userId);
  }
}

// 导出单例
export const vscoreService = new VScoreService();
