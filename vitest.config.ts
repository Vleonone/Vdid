import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',

    // 全局设置
    globals: true,

    // 测试文件匹配模式
    include: [
      'server/**/*.test.ts',
      'server/**/*.spec.ts',
      'shared/**/*.test.ts',
      'shared/**/*.spec.ts',
    ],

    // 排除目录
    exclude: [
      'node_modules',
      'dist',
      'client',
    ],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'server/**/*.ts',
        'shared/**/*.ts',
      ],
      exclude: [
        'server/**/*.test.ts',
        'server/**/*.spec.ts',
        '**/*.d.ts',
      ],
    },

    // 测试超时 (毫秒)
    testTimeout: 10000,

    // 钩子超时
    hookTimeout: 10000,

    // 在 watch 模式下隔离测试
    isolate: true,

    // 设置环境变量
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
      JWT_ISSUER: 'vdid-test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/vdid_test',
    },

    // 模块别名
    alias: {
      '@': path.resolve(__dirname, './'),
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
