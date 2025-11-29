import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";

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
app.set("trust proxy", 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? true  // Allow same origin in production
    : ["http://localhost:5173", "http://localhost:5000"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/wallets", multiWalletRoutes);  // Multi-wallet management
app.use("/api/passkeys", passkeyRoutes);
app.use("/api/vscore", vscoreRoutes);

// API 404 handler
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientPath));
  
  // SPA fallback
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
