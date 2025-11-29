/**
 * VDID Backend Server
 * 主应用入口文件
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// 路由
import authRoutes from './routes/auth.routes';
import vscoreRoutes from './routes/vscore.routes';
import walletRoutes from './routes/wallet.routes';
import passkeysRoutes from './routes/passkeys.routes';
import lensRoutes from './routes/lens.routes';

// 数据库
import { checkDatabaseConnection } from './db';

// ============================================
// App Configuration
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Middleware
// ============================================

// 安全头
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://vdid.io', 'https://www.vdid.io', 'https://vdid-production-d371.up.railway.app']
    : true,
  credentials: true,
}));

// 压缩
app.use(compression());

// 请求日志
if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// JSON 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制 (开发阶段放宽)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000, // 每个 IP 最多 1000 请求
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 对 API 路由应用速率限制
app.use('/api/', limiter);

// 登录限制 (开发阶段放宽)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 100, // 每小时最多 100 次登录尝试
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// Routes
// ============================================

// 健康检查
app.get('/health', async (req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();
  
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// API 版本信息
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'VDID API',
    version: '2.0.0',
    description: 'Velon Decentralized Identity API',
    endpoints: {
      auth: '/api/auth',
      vscore: '/api/vscore',
      wallet: '/api/wallet',
      passkeys: '/api/passkeys',
      lens: '/api/lens',
    },
    features: {
      emailAuth: true,
      walletAuth: true,
      siwe: true,
      passkeys: true,
      ens: true,
      lens: 'preview',
    },
    documentation: 'https://docs.vdid.io',
  });
});

// 认证路由
app.use('/api/auth', authRoutes);

// V-Score 路由
app.use('/api/vscore', vscoreRoutes);

// Web3 钱包路由
app.use('/api/wallet', walletRoutes);

// Passkeys/WebAuthn 路由
app.use('/api/passkeys', passkeysRoutes);

// Lens Protocol 路由
app.use('/api/lens', lensRoutes);

// ============================================
// Static Files (for SPA)
// ============================================

// 在生产环境中，服务静态文件
if (NODE_ENV === 'production') {
  app.use(express.static('dist/public'));
  
  // SPA fallback
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // 如果是 API 请求，跳过
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile('index.html', { root: 'dist/public' });
  });
}

// ============================================
// Error Handling
// ============================================

// 404 处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
  });
});

// 全局错误处理
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);

  // Zod 验证错误
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err,
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // 默认错误响应
  res.status(500).json({
    success: false,
    error: NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
  });
});

// ============================================
// Server Startup
// ============================================

async function startServer() {
  try {
    // 检查数据库连接
    console.log('Checking database connection...');
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    
    console.log('Database connected successfully');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   VDID Backend Server                                     ║
║   ────────────────────────────────────────────────────   ║
║                                                           ║
║   Environment: ${NODE_ENV.padEnd(40)}║
║   Port: ${String(PORT).padEnd(47)}║
║   Time: ${new Date().toISOString().padEnd(47)}║
║                                                           ║
║   API: http://localhost:${PORT}/api${''.padEnd(30)}║
║   Health: http://localhost:${PORT}/health${''.padEnd(24)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// 启动服务器
startServer();

export default app;
