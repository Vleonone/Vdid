/**
 * Lens Protocol Routes Integration Tests
 * 测试 Lens 协议集成 API 端点
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../middleware/error-handler';

// Mock the lens service
vi.mock('../services/lens.service', () => ({
  linkLensProfile: vi.fn(() => Promise.resolve({
    success: true,
    profile: {
      id: 'lens-profile-1',
      handle: 'testuser.lens',
      walletAddress: '0x1234567890123456789012345678901234567890',
    },
  })),
  unlinkLensProfile: vi.fn(() => Promise.resolve()),
  getUserLensProfiles: vi.fn(() => Promise.resolve([])),
  setPrimaryLensProfile: vi.fn(() => Promise.resolve()),
  getLensProfiles: vi.fn(() => Promise.resolve([
    {
      id: 'lens-profile-1',
      handle: 'testuser.lens',
      metadata: {},
    },
  ])),
}));

import lensRoutes from '../routes/lens.routes';

// Create test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());

  // Mock authentication middleware
  app.use((req, _res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
      (req as any).user = {
        id: 1,
        vid: 'VID001',
        email: 'test@example.com',
      };
    }
    next();
  });

  app.use('/api/lens', lensRoutes);
  app.use(errorHandler);

  return app;
}

describe('Lens Protocol Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('GET /api/lens/profiles', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/lens/profiles');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return user profiles when authenticated', async () => {
      const response = await request(app)
        .get('/api/lens/profiles')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.profiles).toBeDefined();
      expect(Array.isArray(response.body.profiles)).toBe(true);
    });
  });

  describe('POST /api/lens/link', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .send({
          profileId: 'lens-profile-1',
          handle: 'testuser.lens',
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should require profileId', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .set('Authorization', 'Bearer valid-token')
        .send({
          handle: 'testuser.lens',
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should require handle', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .set('Authorization', 'Bearer valid-token')
        .send({
          profileId: 'lens-profile-1',
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should require walletAddress', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .set('Authorization', 'Bearer valid-token')
        .send({
          profileId: 'lens-profile-1',
          handle: 'testuser.lens',
          signature: 'test-signature',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should require signature', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .set('Authorization', 'Bearer valid-token')
        .send({
          profileId: 'lens-profile-1',
          handle: 'testuser.lens',
          walletAddress: '0x1234567890123456789012345678901234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should link profile with valid data', async () => {
      const response = await request(app)
        .post('/api/lens/link')
        .set('Authorization', 'Bearer valid-token')
        .send({
          profileId: 'lens-profile-1',
          handle: 'testuser.lens',
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/lens/unlink/:profileId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/lens/unlink/lens-profile-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should unlink profile when authenticated', async () => {
      const response = await request(app)
        .delete('/api/lens/unlink/lens-profile-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/lens/primary/:profileId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/lens/primary/lens-profile-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should set primary profile when authenticated', async () => {
      const response = await request(app)
        .patch('/api/lens/primary/lens-profile-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/lens/lookup/:address', () => {
    it('should validate Ethereum address format', async () => {
      const response = await request(app)
        .get('/api/lens/lookup/invalid-address');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid Ethereum address');
    });

    it('should accept valid checksummed address', async () => {
      const response = await request(app)
        .get('/api/lens/lookup/0x1234567890123456789012345678901234567890');

      expect(response.status).toBe(200);
      expect(response.body.profiles).toBeDefined();
    });

    it('should accept lowercase address', async () => {
      const response = await request(app)
        .get('/api/lens/lookup/0xabcdef1234567890123456789012345678901234');

      expect(response.status).toBe(200);
      expect(response.body.profiles).toBeDefined();
    });

    it('should return profiles for address', async () => {
      const response = await request(app)
        .get('/api/lens/lookup/0x1234567890123456789012345678901234567890');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.profiles)).toBe(true);
      expect(response.body.profiles.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/lens/status', () => {
    it('should return protocol status without auth', async () => {
      const response = await request(app)
        .get('/api/lens/status');

      expect(response.status).toBe(200);
      expect(response.body.enabled).toBe(true);
      expect(response.body.status).toBeDefined();
      expect(response.body.chainId).toBe(137); // Polygon
    });

    it('should include feature flags', async () => {
      const response = await request(app)
        .get('/api/lens/status');

      expect(response.status).toBe(200);
      expect(response.body.features).toBeDefined();
      expect(typeof response.body.features.authentication).toBe('boolean');
      expect(typeof response.body.features.profileLinking).toBe('boolean');
      expect(typeof response.body.features.socialGraph).toBe('boolean');
    });

    it('should indicate preview status', async () => {
      const response = await request(app)
        .get('/api/lens/status');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('preview');
      expect(response.body.message).toContain('preview');
    });
  });
});

describe('Lens Address Validation', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should reject address without 0x prefix', async () => {
    const response = await request(app)
      .get('/api/lens/lookup/1234567890123456789012345678901234567890');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid Ethereum address');
  });

  it('should reject address that is too short', async () => {
    const response = await request(app)
      .get('/api/lens/lookup/0x123456789012345678901234567890');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid Ethereum address');
  });

  it('should reject address that is too long', async () => {
    const response = await request(app)
      .get('/api/lens/lookup/0x12345678901234567890123456789012345678901234');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid Ethereum address');
  });

  it('should reject address with invalid characters', async () => {
    const response = await request(app)
      .get('/api/lens/lookup/0xGGGG567890123456789012345678901234567890');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid Ethereum address');
  });
});
