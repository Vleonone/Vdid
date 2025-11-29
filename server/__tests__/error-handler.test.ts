/**
 * Error Handler Middleware Tests
 * 测试错误处理中间件
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ZodError, z } from 'zod';
import {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  asyncHandler,
  successResponse,
} from '../middleware/error-handler';

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Test routes that throw different errors
  app.get('/test/bad-request', (req, res, next) => {
    next(new BadRequestError('Invalid input'));
  });

  app.get('/test/unauthorized', (req, res, next) => {
    next(new UnauthorizedError('Login required'));
  });

  app.get('/test/forbidden', (req, res, next) => {
    next(new ForbiddenError('Access denied'));
  });

  app.get('/test/not-found', (req, res, next) => {
    next(new NotFoundError('Resource not found'));
  });

  app.get('/test/conflict', (req, res, next) => {
    next(new ConflictError('Email already exists'));
  });

  app.get('/test/rate-limit', (req, res, next) => {
    next(new TooManyRequestsError('Too many requests', 'RATE_LIMIT', 60));
  });

  app.get('/test/internal', (req, res, next) => {
    next(new InternalServerError());
  });

  app.get('/test/zod-error', (req, res, next) => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });
    try {
      schema.parse({ email: 'invalid', age: 10 });
    } catch (error) {
      next(error);
    }
  });

  app.get('/test/generic-error', (req, res, next) => {
    next(new Error('Something went wrong'));
  });

  app.get('/test/async-success', asyncHandler(async (req, res) => {
    res.json(successResponse({ message: 'Success' }));
  }));

  app.get('/test/async-error', asyncHandler(async (req, res) => {
    throw new BadRequestError('Async error');
  }));

  // 404 handler
  app.use('/api/*', notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

describe('Error Handler Middleware', () => {
  const app = createTestApp();

  describe('Custom Error Classes', () => {
    it('should handle BadRequestError (400)', async () => {
      const response = await request(app)
        .get('/test/bad-request')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid input');
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should handle UnauthorizedError (401)', async () => {
      const response = await request(app)
        .get('/test/unauthorized')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Login required');
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should handle ForbiddenError (403)', async () => {
      const response = await request(app)
        .get('/test/forbidden')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should handle NotFoundError (404)', async () => {
      const response = await request(app)
        .get('/test/not-found')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle ConflictError (409)', async () => {
      const response = await request(app)
        .get('/test/conflict')
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should handle TooManyRequestsError (429)', async () => {
      const response = await request(app)
        .get('/test/rate-limit')
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RATE_LIMIT');
      expect(response.body.error.details).toEqual({ retryAfter: 60 });
    });

    it('should handle InternalServerError (500)', async () => {
      const response = await request(app)
        .get('/test/internal')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Zod Validation Errors', () => {
    it('should format Zod errors properly', async () => {
      const response = await request(app)
        .get('/test/zod-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeInstanceOf(Array);
      expect(response.body.error.details.length).toBeGreaterThan(0);
      expect(response.body.error.details[0]).toHaveProperty('field');
      expect(response.body.error.details[0]).toHaveProperty('message');
    });
  });

  describe('Generic Errors', () => {
    it('should handle generic errors as 500', async () => {
      const response = await request(app)
        .get('/test/generic-error')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Request ID', () => {
    it('should include request ID in response', async () => {
      const response = await request(app)
        .get('/test/bad-request')
        .expect(400);

      expect(response.body.requestId).toBeDefined();
      expect(response.body.requestId).toMatch(/^req_/);
    });

    it('should include X-Request-Id header', async () => {
      const response = await request(app)
        .get('/test/bad-request')
        .expect(400);

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should use provided X-Request-Id', async () => {
      const customId = 'custom-request-id-123';
      const response = await request(app)
        .get('/test/bad-request')
        .set('X-Request-Id', customId)
        .expect(400);

      expect(response.body.requestId).toBe(customId);
    });
  });

  describe('Async Handler', () => {
    it('should handle successful async routes', async () => {
      const response = await request(app)
        .get('/test/async-success')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Success');
    });

    it('should catch and forward async errors', async () => {
      const response = await request(app)
        .get('/test/async-error')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Async error');
    });
  });

  describe('Not Found Handler', () => {
    it('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
      expect(response.body.error.message).toContain('/api/unknown-route');
    });
  });

  describe('Response Format', () => {
    it('should include timestamp in error response', async () => {
      const response = await request(app)
        .get('/test/bad-request')
        .expect(400);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
    });
  });
});

describe('Success Response Helper', () => {
  it('should create success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const response = successResponse(data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
  });

  it('should include meta when provided', () => {
    const data = [1, 2, 3];
    const meta = { page: 1, limit: 10, total: 100 };
    const response = successResponse(data, meta);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.meta).toEqual(meta);
  });

  it('should not include meta when not provided', () => {
    const response = successResponse({ test: true });

    expect(response.success).toBe(true);
    expect(response.meta).toBeUndefined();
  });
});
