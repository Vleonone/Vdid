/**
 * V-Score Routes Integration Tests
 * 测试 V-Score API 端点
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler, requestIdMiddleware } from '../middleware/error-handler';

// Mock V-Score data
const mockVScoreData = {
  total: 250,
  activity: 80,
  financial: 70,
  social: 50,
  trust: 50,
  level: 'Active',
  nextLevel: { level: 'Established', pointsNeeded: 150 },
};

const mockHistoryData = [
  {
    id: 1,
    action: 'EMAIL_VERIFIED',
    category: 'trust',
    change: 50,
    previousTotal: 200,
    newTotal: 250,
    reason: 'Email verified',
    createdAt: new Date(),
  },
  {
    id: 2,
    action: 'DAILY_LOGIN',
    category: 'activity',
    change: 5,
    previousTotal: 195,
    newTotal: 200,
    reason: 'Daily login bonus',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Create mock V-Score routes app
function createVScoreTestApp(mockUser?: { id: number }) {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Auth middleware mock
  app.use((req, _res, next) => {
    if (mockUser) {
      (req as any).user = mockUser;
    }
    next();
  });

  // Auth check middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  // GET /api/vscore - Get user's V-Score
  app.get('/api/vscore', requireAuth, (req, res) => {
    res.json({
      success: true,
      vscore: mockVScoreData,
    });
  });

  // GET /api/vscore/history - Get history
  app.get('/api/vscore/history', requireAuth, (req, res) => {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const offset = parseInt(req.query.offset as string) || 0;

    const paginatedHistory = mockHistoryData.slice(offset, offset + limit);

    res.json({
      success: true,
      history: paginatedHistory,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < mockHistoryData.length,
      },
    });
  });

  // GET /api/vscore/levels - Get levels info
  app.get('/api/vscore/levels', requireAuth, (_req, res) => {
    res.json({
      success: true,
      levels: [
        { name: 'Newcomer', min: 0, max: 199, benefits: ['Basic features access'] },
        { name: 'Active', min: 200, max: 399, benefits: ['Reduced transaction fees', 'Priority support'] },
        { name: 'Established', min: 400, max: 599, benefits: ['Higher limits', 'Exclusive features'] },
        { name: 'Trusted', min: 600, max: 799, benefits: ['VIP support', 'Beta features access'] },
        { name: 'Elite', min: 800, max: 1000, benefits: ['Maximum limits', 'Governance voting', 'Revenue sharing'] },
      ],
    });
  });

  // GET /api/vscore/weights - Get weights
  app.get('/api/vscore/weights', requireAuth, (_req, res) => {
    res.json({
      success: true,
      weights: {
        activity: { weight: 0.30, description: 'User activity and engagement' },
        financial: { weight: 0.35, description: 'Transaction history and financial behavior' },
        social: { weight: 0.20, description: 'Social interactions and referrals' },
        trust: { weight: 0.15, description: 'Identity verification and security' },
      },
    });
  });

  // GET /api/vscore/actions - Get available actions
  app.get('/api/vscore/actions', requireAuth, (_req, res) => {
    res.json({
      success: true,
      actions: [
        { action: 'DAILY_LOGIN', category: 'activity', points: 5, description: 'Daily login bonus' },
        { action: 'EMAIL_VERIFIED', category: 'trust', points: 50, description: 'Email verified' },
        { action: 'PASSKEY_ADDED', category: 'trust', points: 30, description: 'Passkey added' },
        { action: 'PROFILE_COMPLETED', category: 'activity', points: 20, description: 'Profile completed' },
        { action: 'REFERRAL', category: 'social', points: 30, description: 'User referral bonus' },
      ],
    });
  });

  // POST /api/vscore/claim/:action - Claim action
  app.post('/api/vscore/claim/:action', requireAuth, (req, res) => {
    const { action } = req.params;

    const validActions = ['DAILY_LOGIN', 'PROFILE_COMPLETED', 'REFERRAL'];
    const restrictedActions = ['KYC_COMPLETE', 'FIRST_TRANSACTION', 'TRANSACTION'];

    if (restrictedActions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: 'This action can only be claimed by the system',
      });
    }

    if (!validActions.includes(action) && !['EMAIL_VERIFIED', 'PASSKEY_ADDED'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action',
      });
    }

    const points = action === 'DAILY_LOGIN' ? 5 : action === 'PROFILE_COMPLETED' ? 20 : 30;

    res.json({
      success: true,
      message: `Claimed ${points} points for ${action}`,
      vscore: {
        ...mockVScoreData,
        total: mockVScoreData.total + points,
      },
    });
  });

  // GET /api/vscore/summary - Get summary
  app.get('/api/vscore/summary', requireAuth, (_req, res) => {
    res.json({
      success: true,
      summary: {
        current: mockVScoreData,
        weeklyChange: 55,
        recentHistory: mockHistoryData.slice(0, 5),
        tips: [
          'Enable 2FA to earn 40 Trust points and secure your account',
          'Invite friends to earn 30 Social points per referral',
          'Reach Established level (400 points) for higher transaction limits',
        ],
      },
    });
  });

  app.use(errorHandler);

  return app;
}

describe('V-Score Routes', () => {
  describe('Authentication', () => {
    const app = createVScoreTestApp();

    it('should reject unauthenticated request to GET /api/vscore', async () => {
      const response = await request(app)
        .get('/api/vscore')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject unauthenticated request to GET /api/vscore/history', async () => {
      const response = await request(app)
        .get('/api/vscore/history')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/vscore', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return user V-Score', async () => {
      const response = await request(app)
        .get('/api/vscore')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.vscore).toBeDefined();
      expect(response.body.vscore.total).toBeDefined();
      expect(response.body.vscore.level).toBeDefined();
    });

    it('should include all score categories', async () => {
      const response = await request(app)
        .get('/api/vscore')
        .expect(200);

      const vscore = response.body.vscore;
      expect(vscore).toHaveProperty('activity');
      expect(vscore).toHaveProperty('financial');
      expect(vscore).toHaveProperty('social');
      expect(vscore).toHaveProperty('trust');
    });

    it('should include next level info', async () => {
      const response = await request(app)
        .get('/api/vscore')
        .expect(200);

      expect(response.body.vscore.nextLevel).toBeDefined();
      expect(response.body.vscore.nextLevel.level).toBeDefined();
      expect(response.body.vscore.nextLevel.pointsNeeded).toBeDefined();
    });
  });

  describe('GET /api/vscore/history', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return history with pagination', async () => {
      const response = await request(app)
        .get('/api/vscore/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBeDefined();
      expect(response.body.pagination.offset).toBeDefined();
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/vscore/history?limit=1')
        .expect(200);

      expect(response.body.pagination.limit).toBe(1);
    });

    it('should enforce max limit of 50', async () => {
      const response = await request(app)
        .get('/api/vscore/history?limit=100')
        .expect(200);

      expect(response.body.pagination.limit).toBe(50);
    });

    it('should support offset parameter', async () => {
      const response = await request(app)
        .get('/api/vscore/history?offset=1')
        .expect(200);

      expect(response.body.pagination.offset).toBe(1);
    });
  });

  describe('GET /api/vscore/levels', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return all level definitions', async () => {
      const response = await request(app)
        .get('/api/vscore/levels')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.levels).toBeInstanceOf(Array);
      expect(response.body.levels.length).toBe(5);
    });

    it('should include level details', async () => {
      const response = await request(app)
        .get('/api/vscore/levels')
        .expect(200);

      const level = response.body.levels[0];
      expect(level).toHaveProperty('name');
      expect(level).toHaveProperty('min');
      expect(level).toHaveProperty('max');
      expect(level).toHaveProperty('benefits');
    });

    it('should have ordered levels from Newcomer to Elite', async () => {
      const response = await request(app)
        .get('/api/vscore/levels')
        .expect(200);

      const levelNames = response.body.levels.map((l: any) => l.name);
      expect(levelNames).toEqual(['Newcomer', 'Active', 'Established', 'Trusted', 'Elite']);
    });
  });

  describe('GET /api/vscore/weights', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return weight configuration', async () => {
      const response = await request(app)
        .get('/api/vscore/weights')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.weights).toBeDefined();
    });

    it('should include all weight categories', async () => {
      const response = await request(app)
        .get('/api/vscore/weights')
        .expect(200);

      const weights = response.body.weights;
      expect(weights).toHaveProperty('activity');
      expect(weights).toHaveProperty('financial');
      expect(weights).toHaveProperty('social');
      expect(weights).toHaveProperty('trust');
    });

    it('should include weight values and descriptions', async () => {
      const response = await request(app)
        .get('/api/vscore/weights')
        .expect(200);

      const activity = response.body.weights.activity;
      expect(activity.weight).toBe(0.30);
      expect(activity.description).toBeDefined();
    });
  });

  describe('GET /api/vscore/actions', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return available actions', async () => {
      const response = await request(app)
        .get('/api/vscore/actions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.actions).toBeInstanceOf(Array);
      expect(response.body.actions.length).toBeGreaterThan(0);
    });

    it('should include action details', async () => {
      const response = await request(app)
        .get('/api/vscore/actions')
        .expect(200);

      const action = response.body.actions[0];
      expect(action).toHaveProperty('action');
      expect(action).toHaveProperty('category');
      expect(action).toHaveProperty('points');
      expect(action).toHaveProperty('description');
    });
  });

  describe('POST /api/vscore/claim/:action', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should reject unauthenticated claim', async () => {
      const unauthApp = createVScoreTestApp();

      const response = await request(unauthApp)
        .post('/api/vscore/claim/DAILY_LOGIN')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should claim valid action', async () => {
      const response = await request(app)
        .post('/api/vscore/claim/DAILY_LOGIN')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('DAILY_LOGIN');
      expect(response.body.vscore).toBeDefined();
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .post('/api/vscore/claim/INVALID_ACTION')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid action');
    });

    it('should reject restricted actions', async () => {
      const response = await request(app)
        .post('/api/vscore/claim/KYC_COMPLETE')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('only be claimed by the system');
    });

    it('should reject FIRST_TRANSACTION action', async () => {
      const response = await request(app)
        .post('/api/vscore/claim/FIRST_TRANSACTION')
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vscore/summary', () => {
    const app = createVScoreTestApp({ id: 1 });

    it('should return summary with all components', async () => {
      const response = await request(app)
        .get('/api/vscore/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.current).toBeDefined();
      expect(response.body.summary.weeklyChange).toBeDefined();
      expect(response.body.summary.recentHistory).toBeDefined();
      expect(response.body.summary.tips).toBeDefined();
    });

    it('should include tips for improvement', async () => {
      const response = await request(app)
        .get('/api/vscore/summary')
        .expect(200);

      expect(response.body.summary.tips).toBeInstanceOf(Array);
      expect(response.body.summary.tips.length).toBeGreaterThan(0);
      expect(response.body.summary.tips.length).toBeLessThanOrEqual(3);
    });

    it('should include recent history', async () => {
      const response = await request(app)
        .get('/api/vscore/summary')
        .expect(200);

      const recentHistory = response.body.summary.recentHistory;
      expect(recentHistory).toBeInstanceOf(Array);
      expect(recentHistory.length).toBeLessThanOrEqual(5);
    });
  });
});

describe('V-Score Business Logic', () => {
  const app = createVScoreTestApp({ id: 1 });

  describe('Level Boundaries', () => {
    it('should have correct Newcomer range (0-199)', async () => {
      const response = await request(app)
        .get('/api/vscore/levels')
        .expect(200);

      const newcomer = response.body.levels.find((l: any) => l.name === 'Newcomer');
      expect(newcomer.min).toBe(0);
      expect(newcomer.max).toBe(199);
    });

    it('should have correct Elite range (800-1000)', async () => {
      const response = await request(app)
        .get('/api/vscore/levels')
        .expect(200);

      const elite = response.body.levels.find((l: any) => l.name === 'Elite');
      expect(elite.min).toBe(800);
      expect(elite.max).toBe(1000);
    });
  });

  describe('Weight Validation', () => {
    it('should have weights that sum to 1', async () => {
      const response = await request(app)
        .get('/api/vscore/weights')
        .expect(200);

      const weights = response.body.weights;
      const total =
        weights.activity.weight +
        weights.financial.weight +
        weights.social.weight +
        weights.trust.weight;

      expect(total).toBeCloseTo(1, 10);
    });

    it('should have financial as highest weight', async () => {
      const response = await request(app)
        .get('/api/vscore/weights')
        .expect(200);

      const weights = response.body.weights;
      expect(weights.financial.weight).toBe(0.35);
      expect(weights.financial.weight).toBeGreaterThan(weights.activity.weight);
      expect(weights.financial.weight).toBeGreaterThan(weights.social.weight);
      expect(weights.financial.weight).toBeGreaterThan(weights.trust.weight);
    });
  });
});
