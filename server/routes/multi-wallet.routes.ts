import { Router, Request, Response } from "express";
import { multiWalletService } from "../services/multi-wallet.service";
import { z } from "zod";

const router = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Validation schemas
const addWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  chainId: z.number().int().positive().optional().default(8453),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Message is required"),
  label: z.string().max(50).optional(),
});

const updateWalletSchema = z.object({
  label: z.string().max(50).optional(),
  isPrimary: z.boolean().optional(),
});

/**
 * GET /api/wallets
 * Get all wallets for current user
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const wallets = await multiWalletService.getUserWallets(userId);
    
    res.json({
      success: true,
      wallets,
      count: wallets.length,
    });
  } catch (error) {
    console.error("Get wallets error:", error);
    res.status(500).json({ error: "Failed to get wallets" });
  }
});

/**
 * POST /api/wallets
 * Add a new wallet
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validation = addWalletSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { walletAddress, chainId, signature, message, label } = validation.data;

    const wallet = await multiWalletService.addWallet({
      userId,
      walletAddress,
      chainId,
      signature,
      message,
      label,
    });

    res.status(201).json({
      success: true,
      wallet,
      message: "Wallet added successfully",
    });
  } catch (error) {
    console.error("Add wallet error:", error);
    const message = error instanceof Error ? error.message : "Failed to add wallet";
    res.status(400).json({ error: message });
  }
});

/**
 * PATCH /api/wallets/:id
 * Update wallet settings
 */
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const walletId = parseInt(req.params.id);

    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }

    const validation = updateWalletSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const wallet = await multiWalletService.updateWallet({
      walletId,
      userId,
      ...validation.data,
    });

    res.json({
      success: true,
      wallet,
      message: "Wallet updated successfully",
    });
  } catch (error) {
    console.error("Update wallet error:", error);
    const message = error instanceof Error ? error.message : "Failed to update wallet";
    res.status(400).json({ error: message });
  }
});

/**
 * DELETE /api/wallets/:id
 * Remove a wallet
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const walletId = parseInt(req.params.id);

    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }

    await multiWalletService.removeWallet(walletId, userId);

    res.json({
      success: true,
      message: "Wallet removed successfully",
    });
  } catch (error) {
    console.error("Remove wallet error:", error);
    const message = error instanceof Error ? error.message : "Failed to remove wallet";
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/wallets/:id/primary
 * Set wallet as primary
 */
router.post("/:id/primary", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const walletId = parseInt(req.params.id);

    if (isNaN(walletId)) {
      return res.status(400).json({ error: "Invalid wallet ID" });
    }

    await multiWalletService.setPrimaryWallet(walletId, userId);

    res.json({
      success: true,
      message: "Primary wallet updated successfully",
    });
  } catch (error) {
    console.error("Set primary wallet error:", error);
    const message = error instanceof Error ? error.message : "Failed to set primary wallet";
    res.status(400).json({ error: message });
  }
});

/**
 * GET /api/wallets/chains
 * Get supported chains
 */
router.get("/chains", async (req: Request, res: Response) => {
  try {
    const chains = multiWalletService.getSupportedChains();
    res.json({
      success: true,
      chains,
    });
  } catch (error) {
    console.error("Get chains error:", error);
    res.status(500).json({ error: "Failed to get supported chains" });
  }
});

export default router;
