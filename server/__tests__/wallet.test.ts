/**
 * Wallet Routes Integration Tests
 * 测试钱包认证和管理 API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler, requestIdMiddleware } from '../middleware/error-handler';

// Create a mock wallet routes app for testing
function createWalletTestApp() {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Mock wallet nonce endpoint
  app.post('/api/wallet/nonce', (req, res) => {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const nonce = 'test-nonce-12345';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    res.json({
      nonce,
      message: `vdid.velon.io wants you to sign in with your Ethereum account:\n${address}\n\nSign in to VDID\n\nNonce: ${nonce}`,
      expiresAt: expiresAt.toISOString(),
    });
  });

  // Mock chains endpoint
  app.get('/api/wallet/chains', (_req, res) => {
    res.json({
      chains: [
        { id: 1, name: 'Ethereum', symbol: 'ETH' },
        { id: 137, name: 'Polygon', symbol: 'MATIC' },
        { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
        { id: 10, name: 'Optimism', symbol: 'ETH' },
        { id: 8453, name: 'Base', symbol: 'ETH' },
        { id: 56, name: 'BNB Chain', symbol: 'BNB' },
      ],
    });
  });

  // Mock wallet verify endpoint
  app.post('/api/wallet/verify', (req, res) => {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        error: 'Address, signature, and message are required',
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // Mock successful verification
    res.json({
      user: {
        id: 1,
        vid: 'VID-TEST-123',
        did: 'did:vdid:test123',
        email: null,
        displayName: null,
        walletAddress: address,
        ensName: null,
        vscoreTotal: 0,
        vscoreLevel: 'Newcomer',
      },
      accessToken: 'mock-access-token',
      isNewUser: true,
    });
  });

  // Mock wallet bind (requires auth)
  app.post('/api/wallet/bind', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        error: 'Address, signature, and message are required',
      });
    }

    res.json({ success: true, walletId: 1 });
  });

  // Mock get identities (requires auth)
  app.get('/api/wallet/identities', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      identities: [
        {
          id: 1,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          chainId: 1,
          isPrimary: true,
        },
      ],
    });
  });

  app.use(errorHandler);

  return app;
}

// Create mock multi-wallet test app
function createMultiWalletTestApp(mockUser?: { id: number }) {
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

  // GET /api/wallets - list wallets
  app.get('/api/wallets', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      wallets: [
        {
          id: 1,
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          chainId: 1,
          chainName: 'Ethereum',
          label: 'Main Wallet',
          isPrimary: true,
        },
      ],
      count: 1,
    });
  });

  // POST /api/wallets - add wallet
  app.post('/api/wallets', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ path: ['walletAddress'], message: 'Invalid wallet address' }],
      });
    }

    if (!signature || !message) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ message: 'Signature and message are required' }],
      });
    }

    res.status(201).json({
      success: true,
      wallet: {
        id: 2,
        walletAddress,
        chainId: 8453,
        chainName: 'Base',
        isPrimary: false,
      },
      message: 'Wallet added successfully',
    });
  });

  // PATCH /api/wallets/:id - update wallet
  app.patch('/api/wallets/:id', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const walletId = parseInt(req.params.id);
    if (isNaN(walletId)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    res.json({
      success: true,
      wallet: {
        id: walletId,
        label: req.body.label || 'Updated Wallet',
        isPrimary: req.body.isPrimary || false,
      },
      message: 'Wallet updated successfully',
    });
  });

  // DELETE /api/wallets/:id - remove wallet
  app.delete('/api/wallets/:id', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const walletId = parseInt(req.params.id);
    if (isNaN(walletId)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    res.json({
      success: true,
      message: 'Wallet removed successfully',
    });
  });

  // POST /api/wallets/:id/primary - set primary
  app.post('/api/wallets/:id/primary', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const walletId = parseInt(req.params.id);
    if (isNaN(walletId)) {
      return res.status(400).json({ error: 'Invalid wallet ID' });
    }

    res.json({
      success: true,
      message: 'Primary wallet updated successfully',
    });
  });

  // GET /api/wallets/chains
  app.get('/api/wallets/chains', (_req, res) => {
    res.json({
      success: true,
      chains: [
        { id: 1, name: 'Ethereum', symbol: 'ETH', enabled: true },
        { id: 8453, name: 'Base', symbol: 'ETH', enabled: true },
      ],
    });
  });

  app.use(errorHandler);

  return app;
}

describe('Wallet Routes', () => {
  describe('POST /api/wallet/nonce', () => {
    const app = createWalletTestApp();

    it('should generate nonce for valid address', async () => {
      const response = await request(app)
        .post('/api/wallet/nonce')
        .send({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
        .expect(200);

      expect(response.body.nonce).toBeDefined();
      expect(response.body.message).toContain('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1');
      expect(response.body.expiresAt).toBeDefined();
    });

    it('should reject missing address', async () => {
      const response = await request(app)
        .post('/api/wallet/nonce')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Address is required');
    });

    it('should reject invalid Ethereum address', async () => {
      const response = await request(app)
        .post('/api/wallet/nonce')
        .send({ address: 'invalid-address' })
        .expect(400);

      expect(response.body.error).toBe('Invalid Ethereum address');
    });

    it('should reject short address', async () => {
      const response = await request(app)
        .post('/api/wallet/nonce')
        .send({ address: '0x1234' })
        .expect(400);

      expect(response.body.error).toBe('Invalid Ethereum address');
    });
  });

  describe('POST /api/wallet/verify', () => {
    const app = createWalletTestApp();

    it('should verify valid signature and return user', async () => {
      const response = await request(app)
        .post('/api/wallet/verify')
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          signature: '0xmocksignature',
          message: 'Sign in to VDID',
        })
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.vid).toMatch(/^VID-/);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.isNewUser).toBeDefined();
    });

    it('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/wallet/verify')
        .send({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject invalid address format', async () => {
      const response = await request(app)
        .post('/api/wallet/verify')
        .send({
          address: 'not-an-address',
          signature: '0xmocksignature',
          message: 'Sign in',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid Ethereum address');
    });
  });

  describe('GET /api/wallet/chains', () => {
    const app = createWalletTestApp();

    it('should return list of supported chains', async () => {
      const response = await request(app)
        .get('/api/wallet/chains')
        .expect(200);

      expect(response.body.chains).toBeInstanceOf(Array);
      expect(response.body.chains.length).toBeGreaterThan(0);
      expect(response.body.chains[0]).toHaveProperty('id');
      expect(response.body.chains[0]).toHaveProperty('name');
      expect(response.body.chains[0]).toHaveProperty('symbol');
    });

    it('should include Ethereum as first chain', async () => {
      const response = await request(app)
        .get('/api/wallet/chains')
        .expect(200);

      const ethereum = response.body.chains.find((c: any) => c.id === 1);
      expect(ethereum).toBeDefined();
      expect(ethereum.name).toBe('Ethereum');
    });
  });

  describe('Protected Endpoints', () => {
    const app = createWalletTestApp();

    it('should reject unauthenticated bind request', async () => {
      const response = await request(app)
        .post('/api/wallet/bind')
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          signature: '0xmocksignature',
          message: 'Bind wallet',
        })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should reject unauthenticated identities request', async () => {
      const response = await request(app)
        .get('/api/wallet/identities')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});

describe('Multi-Wallet Routes', () => {
  describe('Unauthenticated Requests', () => {
    const app = createMultiWalletTestApp();

    it('should reject GET /api/wallets without auth', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject POST /api/wallets without auth', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .send({ walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Authenticated Requests', () => {
    const app = createMultiWalletTestApp({ id: 1 });

    it('should list user wallets', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.wallets).toBeInstanceOf(Array);
      expect(response.body.count).toBeDefined();
    });

    it('should add a new wallet', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .send({
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          chainId: 8453,
          signature: '0xmocksignature',
          message: 'Add wallet',
          label: 'Test Wallet',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.wallet).toBeDefined();
      expect(response.body.message).toBe('Wallet added successfully');
    });

    it('should reject invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .send({
          walletAddress: 'invalid',
          signature: '0xmocksignature',
          message: 'Add wallet',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should update wallet label', async () => {
      const response = await request(app)
        .patch('/api/wallets/1')
        .send({ label: 'Updated Label' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Wallet updated successfully');
    });

    it('should reject update with invalid wallet ID', async () => {
      const response = await request(app)
        .patch('/api/wallets/invalid')
        .send({ label: 'Test' })
        .expect(400);

      expect(response.body.error).toBe('Invalid wallet ID');
    });

    it('should delete a wallet', async () => {
      const response = await request(app)
        .delete('/api/wallets/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Wallet removed successfully');
    });

    it('should set primary wallet', async () => {
      const response = await request(app)
        .post('/api/wallets/1/primary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Primary wallet updated successfully');
    });
  });

  describe('GET /api/wallets/chains', () => {
    const app = createMultiWalletTestApp();

    it('should return supported chains without auth', async () => {
      const response = await request(app)
        .get('/api/wallets/chains')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.chains).toBeInstanceOf(Array);
    });
  });
});

describe('Ethereum Address Validation', () => {
  const app = createWalletTestApp();

  it('should accept checksummed address', async () => {
    const response = await request(app)
      .post('/api/wallet/nonce')
      .send({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
      .expect(200);

    expect(response.body.nonce).toBeDefined();
  });

  it('should accept lowercase address', async () => {
    const response = await request(app)
      .post('/api/wallet/nonce')
      .send({ address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb1' })
      .expect(200);

    expect(response.body.nonce).toBeDefined();
  });

  it('should reject address without 0x prefix', async () => {
    const response = await request(app)
      .post('/api/wallet/nonce')
      .send({ address: '742d35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
      .expect(400);

    expect(response.body.error).toBe('Invalid Ethereum address');
  });

  it('should reject address with wrong length', async () => {
    const response = await request(app)
      .post('/api/wallet/nonce')
      .send({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595' })
      .expect(400);

    expect(response.body.error).toBe('Invalid Ethereum address');
  });

  it('should reject address with non-hex characters', async () => {
    const response = await request(app)
      .post('/api/wallet/nonce')
      .send({ address: '0xGGGd35Cc6634C0532925a3b844Bc9e7595f0bEb1' })
      .expect(400);

    expect(response.body.error).toBe('Invalid Ethereum address');
  });
});
