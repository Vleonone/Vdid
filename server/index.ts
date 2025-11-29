import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Load and validate config first
import { config, printConfigSummary, isProd } from './config';

// Rate limiting
import { globalRateLimit } from './middleware/rate-limit';

// Error handling
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/error-handler';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.routes";
import walletRoutes from "./routes/wallet.routes";
import multiWalletRoutes from "./routes/multi-wallet.routes";
import passkeyRoutes from "./routes/passkeys.routes";
import vscoreRoutes from "./routes/vscore.routes";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        vid: string;
        email?: string;
        displayName?: string;
        primaryWallet?: string;
      };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production for now
    : ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
}));

// Request ID for tracking
app.use(requestIdMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting (last line of defense)
app.use('/api', globalRateLimit);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/wallets", multiWalletRoutes);
app.use("/api/passkeys", passkeyRoutes);
app.use("/api/vscore", vscoreRoutes);

// Health check with detailed status
app.get("/api/health", async (req, res) => {
  const startTime = Date.now();

  // Check database connection
  let dbStatus = 'unknown';
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    // Simple query to check DB connection
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
    console.error('Health check - DB error:', error);
  }

  const health = {
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.NODE_ENV,
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      api: {
        status: 'operational',
        latencyMs: Date.now() - startTime,
      },
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Try multiple possible paths for the built client
  const possiblePaths = [
    path.join(__dirname, "../client/dist"),      // /app/server/../client/dist = /app/client/dist
    path.join(__dirname, "../dist"),             // /app/server/../dist = /app/dist
    path.join(__dirname, "../../client/dist"),   // In case of different structure
    path.join(__dirname, "../../dist"),          // /app/dist from different location
    "/app/client/dist",                          // Absolute path
    "/app/dist",                                 // Absolute path alternative
  ];
  
  let clientPath = "";
  
  for (const p of possiblePaths) {
    const indexPath = path.join(p, "index.html");
    console.log(`Checking path: ${p}`);
    if (fs.existsSync(indexPath)) {
      clientPath = p;
      console.log(`✓ Found client build at: ${clientPath}`);
      break;
    }
  }
  
  if (!clientPath) {
    console.error("ERROR: Could not find client build!");
    console.log("Searched paths:", possiblePaths);
    console.log("Current __dirname:", __dirname);
    
    // List directory contents for debugging
    try {
      console.log("\n/app contents:", fs.readdirSync("/app"));
      if (fs.existsSync("/app/client")) {
        console.log("/app/client contents:", fs.readdirSync("/app/client"));
      }
      if (fs.existsSync("/app/dist")) {
        console.log("/app/dist contents:", fs.readdirSync("/app/dist"));
      }
    } catch (e) {
      console.log("Could not list directories:", e);
    }
  } else {
    app.use(express.static(clientPath));
    
    // SPA fallback - must be after API routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(clientPath, "index.html"));
    });
  }
}

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Start server
const port = parseInt(config.PORT, 10);
app.listen(port, () => {
  printConfigSummary();
  console.log(`🚀 Server running on port ${port}`);
});

export default app;
