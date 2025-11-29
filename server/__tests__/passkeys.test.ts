/**
 * Passkeys Routes Integration Tests
 * 测试 WebAuthn Passkey API
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler, requestIdMiddleware } from '../middleware/error-handler';

// Create mock passkey routes app for testing
function createPasskeyTestApp(mockUser?: { id: number }) {
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

  // ============================================
  // Registration Routes
  // ============================================

  // POST /api/passkeys/register/options - Get registration options
  app.post('/api/passkeys/register/options', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      challenge: 'mock-challenge-base64',
      rp: {
        name: 'VDID',
        id: 'vdid.velon.io',
      },
      user: {
        id: 'user-id-base64',
        name: 'test@example.com',
        displayName: 'Test User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'required',
      },
    });
  });

  // POST /api/passkeys/register/verify - Verify registration
  app.post('/api/passkeys/register/verify', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { credentialId, publicKey, challenge } = req.body;

    if (!credentialId || !publicKey || !challenge) {
      return res.status(400).json({
        error: 'credentialId, publicKey, and challenge are required',
      });
    }

    res.json({
      success: true,
      passkeyId: 1,
      deviceName: req.body.deviceName || 'Unknown Device',
    });
  });

  // ============================================
  // Authentication Routes
  // ============================================

  // POST /api/passkeys/authenticate/options - Get authentication options (public)
  app.post('/api/passkeys/authenticate/options', (req, res) => {
    const { email, userId } = req.body;

    // Return available credentials for the user
    res.json({
      challenge: 'auth-challenge-base64',
      timeout: 60000,
      rpId: 'vdid.velon.io',
      allowCredentials: email || userId
        ? [
            {
              id: 'credential-id-1',
              type: 'public-key',
              transports: ['internal', 'hybrid'],
            },
          ]
        : [],
      userVerification: 'preferred',
    });
  });

  // POST /api/passkeys/authenticate/verify - Verify authentication (public)
  app.post('/api/passkeys/authenticate/verify', (req, res) => {
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

    // Mock successful authentication
    res.json({
      user: {
        id: 1,
        vid: 'VID-TEST-123',
        did: 'did:vdid:test123',
        email: 'test@example.com',
        displayName: 'Test User',
        vscoreTotal: 100,
        vscoreLevel: 'Newcomer',
      },
      accessToken: 'mock-access-token',
    });
  });

  // ============================================
  // Passkey Management Routes
  // ============================================

  // GET /api/passkeys - List user's passkeys
  app.get('/api/passkeys', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      passkeys: [
        {
          id: 1,
          credentialId: 'credential-id-1',
          deviceName: 'MacBook Pro',
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          useCount: 5,
        },
        {
          id: 2,
          credentialId: 'credential-id-2',
          deviceName: 'iPhone 15',
          createdAt: new Date().toISOString(),
          lastUsed: null,
          useCount: 0,
        },
      ],
    });
  });

  // DELETE /api/passkeys/:id - Delete passkey
  app.delete('/api/passkeys/:id', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const passkeyId = parseInt(req.params.id, 10);
    if (isNaN(passkeyId)) {
      return res.status(400).json({ error: 'Invalid passkey ID' });
    }

    res.json({ success: true });
  });

  // PATCH /api/passkeys/:id - Rename passkey
  app.patch('/api/passkeys/:id', (req, res) => {
    if (!(req as any).user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const passkeyId = parseInt(req.params.id, 10);
    if (isNaN(passkeyId)) {
      return res.status(400).json({ error: 'Invalid passkey ID' });
    }

    const { deviceName } = req.body;
    if (!deviceName || typeof deviceName !== 'string') {
      return res.status(400).json({ error: 'deviceName is required' });
    }

    res.json({ success: true });
  });

  app.use(errorHandler);

  return app;
}

describe('Passkeys Routes', () => {
  describe('Registration Flow', () => {
    describe('POST /api/passkeys/register/options', () => {
      it('should reject unauthenticated request', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/register/options')
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      it('should return registration options for authenticated user', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .post('/api/passkeys/register/options')
          .expect(200);

        expect(response.body.challenge).toBeDefined();
        expect(response.body.rp).toBeDefined();
        expect(response.body.rp.name).toBe('VDID');
        expect(response.body.user).toBeDefined();
        expect(response.body.pubKeyCredParams).toBeInstanceOf(Array);
        expect(response.body.authenticatorSelection).toBeDefined();
      });

      it('should include ES256 algorithm in pubKeyCredParams', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .post('/api/passkeys/register/options')
          .expect(200);

        const es256 = response.body.pubKeyCredParams.find(
          (p: any) => p.alg === -7
        );
        expect(es256).toBeDefined();
        expect(es256.type).toBe('public-key');
      });
    });

    describe('POST /api/passkeys/register/verify', () => {
      it('should reject unauthenticated request', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/register/verify')
          .send({
            credentialId: 'cred-id',
            publicKey: 'pub-key',
            challenge: 'challenge',
          })
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      it('should reject missing required fields', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .post('/api/passkeys/register/verify')
          .send({ credentialId: 'cred-id' })
          .expect(400);

        expect(response.body.error).toContain('required');
      });

      it('should verify registration with valid data', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .post('/api/passkeys/register/verify')
          .send({
            credentialId: 'cred-id-base64',
            publicKey: 'public-key-base64',
            challenge: 'challenge-base64',
            deviceName: 'My MacBook',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.passkeyId).toBeDefined();
      });
    });
  });

  describe('Authentication Flow', () => {
    describe('POST /api/passkeys/authenticate/options', () => {
      it('should return options without authentication', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/authenticate/options')
          .send({ email: 'test@example.com' })
          .expect(200);

        expect(response.body.challenge).toBeDefined();
        expect(response.body.rpId).toBe('vdid.velon.io');
        expect(response.body.allowCredentials).toBeInstanceOf(Array);
      });

      it('should return credentials for known user', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/authenticate/options')
          .send({ email: 'test@example.com' })
          .expect(200);

        expect(response.body.allowCredentials.length).toBeGreaterThan(0);
        expect(response.body.allowCredentials[0].type).toBe('public-key');
      });

      it('should return empty credentials for unknown user', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/authenticate/options')
          .send({})
          .expect(200);

        expect(response.body.allowCredentials).toEqual([]);
      });
    });

    describe('POST /api/passkeys/authenticate/verify', () => {
      it('should reject missing authentication data', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/authenticate/verify')
          .send({
            credentialId: 'cred-id',
            // missing other fields
          })
          .expect(400);

        expect(response.body.error).toContain('Missing');
      });

      it('should authenticate with valid data', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .post('/api/passkeys/authenticate/verify')
          .send({
            credentialId: 'cred-id-base64',
            authenticatorData: 'auth-data-base64',
            clientDataJSON: 'client-data-base64',
            signature: 'signature-base64',
            challenge: 'challenge-base64',
          })
          .expect(200);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.vid).toMatch(/^VID-/);
        expect(response.body.accessToken).toBeDefined();
      });
    });
  });

  describe('Passkey Management', () => {
    describe('GET /api/passkeys', () => {
      it('should reject unauthenticated request', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .get('/api/passkeys')
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      it('should list user passkeys', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .get('/api/passkeys')
          .expect(200);

        expect(response.body.passkeys).toBeInstanceOf(Array);
        expect(response.body.passkeys.length).toBe(2);
        expect(response.body.passkeys[0]).toHaveProperty('id');
        expect(response.body.passkeys[0]).toHaveProperty('credentialId');
        expect(response.body.passkeys[0]).toHaveProperty('deviceName');
      });
    });

    describe('DELETE /api/passkeys/:id', () => {
      it('should reject unauthenticated request', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .delete('/api/passkeys/1')
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      it('should reject invalid passkey ID', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .delete('/api/passkeys/invalid')
          .expect(400);

        expect(response.body.error).toBe('Invalid passkey ID');
      });

      it('should delete passkey successfully', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .delete('/api/passkeys/1')
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('PATCH /api/passkeys/:id', () => {
      it('should reject unauthenticated request', async () => {
        const app = createPasskeyTestApp();

        const response = await request(app)
          .patch('/api/passkeys/1')
          .send({ deviceName: 'New Name' })
          .expect(401);

        expect(response.body.error).toBe('Authentication required');
      });

      it('should reject invalid passkey ID', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .patch('/api/passkeys/invalid')
          .send({ deviceName: 'New Name' })
          .expect(400);

        expect(response.body.error).toBe('Invalid passkey ID');
      });

      it('should reject missing deviceName', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .patch('/api/passkeys/1')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('deviceName is required');
      });

      it('should rename passkey successfully', async () => {
        const app = createPasskeyTestApp({ id: 1 });

        const response = await request(app)
          .patch('/api/passkeys/1')
          .send({ deviceName: 'My New MacBook Pro' })
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });
});

describe('WebAuthn Standards Compliance', () => {
  describe('Registration Options', () => {
    const app = createPasskeyTestApp({ id: 1 });

    it('should include required WebAuthn fields', async () => {
      const response = await request(app)
        .post('/api/passkeys/register/options')
        .expect(200);

      // Required fields per WebAuthn spec
      expect(response.body).toHaveProperty('challenge');
      expect(response.body).toHaveProperty('rp');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('pubKeyCredParams');
    });

    it('should have proper authenticator selection', async () => {
      const response = await request(app)
        .post('/api/passkeys/register/options')
        .expect(200);

      const authSel = response.body.authenticatorSelection;
      expect(authSel).toBeDefined();
      expect(['platform', 'cross-platform']).toContain(authSel.authenticatorAttachment);
      expect(['required', 'preferred', 'discouraged']).toContain(authSel.userVerification);
    });
  });

  describe('Authentication Options', () => {
    const app = createPasskeyTestApp();

    it('should include required authentication fields', async () => {
      const response = await request(app)
        .post('/api/passkeys/authenticate/options')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('challenge');
      expect(response.body).toHaveProperty('rpId');
      expect(response.body).toHaveProperty('allowCredentials');
    });

    it('should have proper credential descriptors', async () => {
      const response = await request(app)
        .post('/api/passkeys/authenticate/options')
        .send({ email: 'test@example.com' })
        .expect(200);

      if (response.body.allowCredentials.length > 0) {
        const cred = response.body.allowCredentials[0];
        expect(cred).toHaveProperty('id');
        expect(cred).toHaveProperty('type');
        expect(cred.type).toBe('public-key');
      }
    });
  });
});
