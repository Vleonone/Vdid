/**
 * Multi-Wallet Routes Integration Tests
 * 测试多钱包管理 API 端点
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Mock the db module
vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => Promise.resolve([])),
          limit: vi.fn(() => Promise.resolve([])),
        })),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 1,
          walletAddress: '0x1234567890123456789012345678901234567890',
          chainId: 8453,
          chainName: 'BASE',
          isPrimary: true,
          label: 'Main Wallet',
          ensName: null,
          lastUsed: new Date(),
          verifiedAt: new Date(),
          createdAt: new Date(),
        }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{
            id: 1,
            walletAddress: '0x1234567890123456789012345678901234567890',
            chainId: 8453,
            chainName: 'BASE',
            isPrimary: true,
            label: 'Updated Label',
            ensName: null,
            lastUsed: new Date(),
            verifiedAt: new Date(),
            createdAt: new Date(),
          }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock ethers for signature verification
vi.mock('ethers', () => ({
  ethers: {
    verifyMessage: vi.fn(() => '0x1234567890123456789012345678901234567890'),
    JsonRpcProvider: vi.fn(() => ({
      lookupAddress: vi.fn(() => Promise.resolve(null)),
    })),
  },
}));

import multiWalletRoutes from '../routes/multi-wallet.routes';

// Create test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());

  // Mock authentication middleware - attach user to request
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

  app.use('/api/wallets', multiWalletRoutes);

  return app;
}

describe('Multi-Wallet Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('GET /api/wallets', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/wallets');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return empty wallets list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.wallets).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('POST /api/wallets', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .send({
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
          message: 'test-message',
        });

      expect(response.status).toBe(401);
    });

    it('should validate wallet address format', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', 'Bearer valid-token')
        .send({
          walletAddress: 'invalid-address',
          signature: 'test-signature',
          message: 'test-message',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require signature', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', 'Bearer valid-token')
        .send({
          walletAddress: '0x1234567890123456789012345678901234567890',
          message: 'test-message',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require message', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', 'Bearer valid-token')
        .send({
          walletAddress: '0x1234567890123456789012345678901234567890',
          signature: 'test-signature',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /api/wallets/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/wallets/1')
        .send({ label: 'New Label' });

      expect(response.status).toBe(401);
    });

    it('should validate wallet ID format', async () => {
      const response = await request(app)
        .patch('/api/wallets/invalid')
        .set('Authorization', 'Bearer valid-token')
        .send({ label: 'New Label' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet ID');
    });

    it('should validate label length', async () => {
      const response = await request(app)
        .patch('/api/wallets/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ label: 'a'.repeat(100) });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/wallets/:id', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/wallets/1');

      expect(response.status).toBe(401);
    });

    it('should validate wallet ID format', async () => {
      const response = await request(app)
        .delete('/api/wallets/invalid')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet ID');
    });
  });

  describe('POST /api/wallets/:id/primary', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/wallets/1/primary');

      expect(response.status).toBe(401);
    });

    it('should validate wallet ID format', async () => {
      const response = await request(app)
        .post('/api/wallets/invalid/primary')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid wallet ID');
    });
  });

  describe('GET /api/wallets/chains', () => {
    it('should return supported chains without auth', async () => {
      const response = await request(app)
        .get('/api/wallets/chains');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.chains).toBeDefined();
      expect(Array.isArray(response.body.chains)).toBe(true);
    });

    it('should include expected chains', async () => {
      const response = await request(app)
        .get('/api/wallets/chains');

      expect(response.status).toBe(200);

      const chainIds = response.body.chains.map((c: any) => c.chainId);
      expect(chainIds).toContain(8453); // BASE
      expect(chainIds).toContain(1);    // Ethereum
      expect(chainIds).toContain(137);  // Polygon
      expect(chainIds).toContain(42161); // Arbitrum
      expect(chainIds).toContain(10);   // Optimism
    });

    it('should include chain details', async () => {
      const response = await request(app)
        .get('/api/wallets/chains');

      expect(response.status).toBe(200);

      const baseChain = response.body.chains.find((c: any) => c.chainId === 8453);
      expect(baseChain).toBeDefined();
      expect(baseChain.name).toBe('BASE');
      expect(baseChain.symbol).toBe('ETH');
      expect(baseChain.explorer).toContain('basescan');
    });
  });
});

describe('Multi-Wallet Service Logic', () => {
  describe('Address Normalization', () => {
    it('should treat addresses as case-insensitive', () => {
      const address1 = '0xAbCdEf1234567890123456789012345678901234';
      const address2 = '0xabcdef1234567890123456789012345678901234';

      expect(address1.toLowerCase()).toBe(address2.toLowerCase());
    });
  });

  describe('Supported Chains', () => {
    it('should have BASE as primary chain', async () => {
      const app = createTestApp();
      const response = await request(app).get('/api/wallets/chains');

      const chains = response.body.chains;
      const baseChain = chains.find((c: any) => c.chainId === 8453);

      expect(baseChain).toBeDefined();
      expect(baseChain.name).toBe('BASE');
    });
  });
});
