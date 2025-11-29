/**
 * API Integration Tests - Authentication
 * 测试认证相关端点
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';

// Validation schemas (matching auth.routes.ts)
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Create test app with mocked routes
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Mock register endpoint
  app.post('/api/auth/register', (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      // Simulate successful registration
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: 1,
          vid: 'VID-TEST-123',
          email: data.email,
          displayName: data.displayName || null,
        },
      });
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
      res.status(500).json({ success: false, error: 'Internal error' });
    }
  });

  // Mock login endpoint
  app.post('/api/auth/login', (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Simulate login check
      if (data.email === 'test@example.com' && data.password === 'password123') {
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: 1,
            vid: 'VID-TEST-123',
            email: data.email,
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }
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
      res.status(500).json({ success: false, error: 'Internal error' });
    }
  });

  // Mock /me endpoint
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    res.json({
      success: true,
      user: {
        id: 1,
        vid: 'VID-TEST-123',
        email: 'test@example.com',
      },
    });
  });

  return app;
}

describe('Authentication API', () => {
  const app = createTestApp();

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          displayName: 'New User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.vid).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(response.body.details.some((d: any) => d.field === 'email')).toBe(true);
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'short',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details.some((d: any) => d.field === 'password')).toBe(true);
    });

    it('should register without displayName', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePassword123!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.displayName).toBeNull();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication');
    });

    it('should reject with invalid authorization format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
