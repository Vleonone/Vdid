import { db } from "../db";
import { web3Identities, users, activityLogs } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { ethers } from "ethers";

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  8453: { name: "BASE", symbol: "ETH", explorer: "https://basescan.org" },
  1: { name: "Ethereum", symbol: "ETH", explorer: "https://etherscan.io" },
  137: { name: "Polygon", symbol: "MATIC", explorer: "https://polygonscan.com" },
  42161: { name: "Arbitrum", symbol: "ETH", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", symbol: "ETH", explorer: "https://optimistic.etherscan.io" },
} as const;

export type ChainId = keyof typeof SUPPORTED_CHAINS;

export interface WalletInfo {
  id: number;
  walletAddress: string;
  chainId: number;
  chainName: string;
  isPrimary: boolean;
  label: string | null;
  ensName: string | null;
  lastUsed: Date | null;
  verifiedAt: Date | null;
  createdAt: Date | null;
}

export interface AddWalletParams {
  userId: number;
  walletAddress: string;
  chainId?: number;
  signature: string;
  message: string;
  label?: string;
}

export interface UpdateWalletParams {
  walletId: number;
  userId: number;
  label?: string;
  isPrimary?: boolean;
}

class MultiWalletService {
  /**
   * Get all wallets for a user
   */
  async getUserWallets(userId: number): Promise<WalletInfo[]> {
    const wallets = await db
      .select()
      .from(web3Identities)
      .where(eq(web3Identities.userId, userId))
      .orderBy(desc(web3Identities.isPrimary), desc(web3Identities.createdAt));

    return wallets.map(w => ({
      id: w.id,
      walletAddress: w.walletAddress,
      chainId: w.chainId,
      chainName: w.chainName,
      isPrimary: w.isPrimary ?? false,
      label: w.label,
      ensName: w.ensName,
      lastUsed: w.lastUsed,
      verifiedAt: w.verifiedAt,
      createdAt: w.createdAt,
    }));
  }

  /**
   * Add a new wallet to user's account
   */
  async addWallet(params: AddWalletParams): Promise<WalletInfo> {
    const { userId, walletAddress, chainId = 8453, signature, message, label } = params;

    // Normalize address
    const normalizedAddress = walletAddress.toLowerCase();

    // Verify signature
    const isValid = await this.verifySignature(normalizedAddress, message, signature);
    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Check if wallet already exists for this user
    const existing = await db
      .select()
      .from(web3Identities)
      .where(
        and(
          eq(web3Identities.userId, userId),
          eq(web3Identities.walletAddress, normalizedAddress),
          eq(web3Identities.chainId, chainId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Wallet already linked to your account");
    }

    // Check if wallet is linked to another user
    const linkedToOther = await db
      .select()
      .from(web3Identities)
      .where(eq(web3Identities.walletAddress, normalizedAddress))
      .limit(1);

    if (linkedToOther.length > 0 && linkedToOther[0].userId !== userId) {
      throw new Error("Wallet is already linked to another account");
    }

    // Check if user has any wallets (to determine if this should be primary)
    const userWallets = await this.getUserWallets(userId);
    const shouldBePrimary = userWallets.length === 0;

    // Get chain info
    const chainInfo = SUPPORTED_CHAINS[chainId as ChainId] || { name: "Unknown", symbol: "ETH", explorer: "" };

    // Try to resolve ENS name (only for Ethereum mainnet compatible addresses)
    let ensName: string | null = null;
    try {
      ensName = await this.resolveENS(normalizedAddress);
    } catch (e) {
      // ENS resolution failed, continue without it
    }

    // Insert new wallet
    const [newWallet] = await db
      .insert(web3Identities)
      .values({
        userId,
        walletAddress: normalizedAddress,
        chainId,
        chainName: chainInfo.name,
        isPrimary: shouldBePrimary,
        label: label || null,
        ensName,
        verifiedAt: new Date(),
        lastUsed: new Date(),
      })
      .returning();

    // Update user's primary wallet if this is the first wallet
    if (shouldBePrimary) {
      await db
        .update(users)
        .set({ primaryWallet: normalizedAddress })
        .where(eq(users.id, userId));
    }

    // Log activity
    await this.logActivity(userId, "wallet_connect", {
      walletAddress: normalizedAddress,
      chainId,
      chainName: chainInfo.name,
    });

    return {
      id: newWallet.id,
      walletAddress: newWallet.walletAddress,
      chainId: newWallet.chainId,
      chainName: newWallet.chainName,
      isPrimary: newWallet.isPrimary ?? false,
      label: newWallet.label,
      ensName: newWallet.ensName,
      lastUsed: newWallet.lastUsed,
      verifiedAt: newWallet.verifiedAt,
      createdAt: newWallet.createdAt,
    };
  }

  /**
   * Update wallet settings
   */
  async updateWallet(params: UpdateWalletParams): Promise<WalletInfo> {
    const { walletId, userId, label, isPrimary } = params;

    // Verify wallet belongs to user
    const [wallet] = await db
      .select()
      .from(web3Identities)
      .where(and(eq(web3Identities.id, walletId), eq(web3Identities.userId, userId)))
      .limit(1);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const updates: Partial<typeof web3Identities.$inferInsert> = {};

    if (label !== undefined) {
      updates.label = label;
    }

    if (isPrimary === true) {
      // First, unset all other wallets as primary
      await db
        .update(web3Identities)
        .set({ isPrimary: false })
        .where(eq(web3Identities.userId, userId));

      updates.isPrimary = true;

      // Update user's primary wallet
      await db
        .update(users)
        .set({ primaryWallet: wallet.walletAddress })
        .where(eq(users.id, userId));
    }

    // Update the wallet
    const [updatedWallet] = await db
      .update(web3Identities)
      .set(updates)
      .where(eq(web3Identities.id, walletId))
      .returning();

    // Log activity
    await this.logActivity(userId, "wallet_update", {
      walletId,
      walletAddress: wallet.walletAddress,
      updates: { label, isPrimary },
    });

    return {
      id: updatedWallet.id,
      walletAddress: updatedWallet.walletAddress,
      chainId: updatedWallet.chainId,
      chainName: updatedWallet.chainName,
      isPrimary: updatedWallet.isPrimary ?? false,
      label: updatedWallet.label,
      ensName: updatedWallet.ensName,
      lastUsed: updatedWallet.lastUsed,
      verifiedAt: updatedWallet.verifiedAt,
      createdAt: updatedWallet.createdAt,
    };
  }

  /**
   * Remove a wallet from user's account
   */
  async removeWallet(walletId: number, userId: number): Promise<void> {
    // Verify wallet belongs to user
    const [wallet] = await db
      .select()
      .from(web3Identities)
      .where(and(eq(web3Identities.id, walletId), eq(web3Identities.userId, userId)))
      .limit(1);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check if this is the only wallet
    const userWallets = await this.getUserWallets(userId);
    if (userWallets.length <= 1) {
      throw new Error("Cannot remove the only wallet. Add another wallet first.");
    }

    // Check if this is primary wallet
    if (wallet.isPrimary) {
      // Set another wallet as primary
      const otherWallet = userWallets.find(w => w.id !== walletId);
      if (otherWallet) {
        await db
          .update(web3Identities)
          .set({ isPrimary: true })
          .where(eq(web3Identities.id, otherWallet.id));

        await db
          .update(users)
          .set({ primaryWallet: otherWallet.walletAddress })
          .where(eq(users.id, userId));
      }
    }

    // Delete the wallet
    await db
      .delete(web3Identities)
      .where(eq(web3Identities.id, walletId));

    // Log activity
    await this.logActivity(userId, "wallet_disconnect", {
      walletId,
      walletAddress: wallet.walletAddress,
      chainId: wallet.chainId,
    });
  }

  /**
   * Set a wallet as primary
   */
  async setPrimaryWallet(walletId: number, userId: number): Promise<void> {
    await this.updateWallet({ walletId, userId, isPrimary: true });
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(walletAddress: string, userId: number): Promise<void> {
    const normalizedAddress = walletAddress.toLowerCase();
    
    await db
      .update(web3Identities)
      .set({ lastUsed: new Date() })
      .where(
        and(
          eq(web3Identities.walletAddress, normalizedAddress),
          eq(web3Identities.userId, userId)
        )
      );
  }

  /**
   * Verify wallet signature
   */
  private async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Resolve ENS name for an address
   */
  private async resolveENS(address: string): Promise<string | null> {
    try {
      // Use a public Ethereum RPC for ENS resolution
      const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
      const ensName = await provider.lookupAddress(address);
      return ensName;
    } catch (error) {
      return null;
    }
  }

  /**
   * Log activity
   */
  private async logActivity(userId: number, action: string, details: Record<string, unknown>): Promise<void> {
    try {
      await db.insert(activityLogs).values({
        userId,
        action,
        details,
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  /**
   * Get supported chains
   */
  getSupportedChains() {
    return Object.entries(SUPPORTED_CHAINS).map(([id, info]) => ({
      chainId: parseInt(id),
      ...info,
    }));
  }
}

export const multiWalletService = new MultiWalletService();
