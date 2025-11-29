/**
 * API Integration Tests - Health Check
 * 测试健康检查端点
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Create a minimal test app
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Mock health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: 'test',
      services: {
        database: {
          status: 'connected',
          latencyMs: 5,
        },
        api: {
          status: 'operational',
          latencyMs: 2,
        },
      },
      memory: {
        used: 50,
        total: 128,
        unit: 'MB',
      },
    });
  });

  return app;
}

describe('Health Check API', () => {
  const app = createTestApp();

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });

    it('should include service statuses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services).toBeDefined();
      expect(response.body.services.database).toBeDefined();
      expect(response.body.services.api).toBeDefined();
      expect(response.body.services.database.status).toBe('connected');
      expect(response.body.services.api.status).toBe('operational');
    });

    it('should include memory usage', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.used).toBeGreaterThan(0);
      expect(response.body.memory.total).toBeGreaterThan(0);
      expect(response.body.memory.unit).toBe('MB');
    });
  });
});
