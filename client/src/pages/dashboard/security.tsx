import { useState, useEffect } from "react";
import { 
  Shield, 
  Wallet, 
  Key, 
  Smartphone, 
  Mail, 
  Clock, 
  Globe, 
  Plus,
  Trash2,
  Star,
  StarOff,
  Edit2,
  Check,
  X,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Types
interface WalletInfo {
  id: number;
  walletAddress: string;
  chainId: number;
  chainName: string;
  isPrimary: boolean;
  label: string | null;
  ensName: string | null;
  lastUsed: string | null;
  verifiedAt: string | null;
  createdAt: string | null;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface Chain {
  chainId: number;
  name: string;
  symbol: string;
  explorer: string;
}

// Chain icons/colors mapping
const chainColors: Record<number, string> = {
  8453: "bg-blue-500",     // BASE
  1: "bg-gray-500",        // Ethereum
  137: "bg-purple-500",    // Polygon
  42161: "bg-blue-400",    // Arbitrum
  10: "bg-red-500",        // Optimism
};

export default function SecurityPage() {
  const { toast } = useToast();
  
  // State
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [addWalletOpen, setAddWalletOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletInfo | null>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [selectedChain, setSelectedChain] = useState<number>(8453);
  const [connecting, setConnecting] = useState(false);
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Fetch wallets on mount
  useEffect(() => {
    fetchWallets();
    fetchChains();
    fetchSessions();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/wallets", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets);
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const res = await fetch("/api/wallets/chains");
      const data = await res.json();
      if (data.success) {
        setChains(data.chains);
      }
    } catch (error) {
      console.error("Failed to fetch chains:", error);
    }
  };

  const fetchSessions = async () => {
    // Mock sessions data for now
    setSessions([
      {
        id: "1",
        device: "Chrome on MacOS",
        location: "Singapore",
        lastActive: "Active now",
        isCurrent: true,
      },
      {
        id: "2",
        device: "Safari on iPhone",
        location: "Singapore",
        lastActive: "2 hours ago",
        isCurrent: false,
      },
    ]);
  };

  // Add new wallet
  const handleAddWallet = async () => {
    if (!(window as any).ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const ethereum = (window as any).ethereum;
      
      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];

      // Create signature message
      const message = `Link wallet to VDID\n\nWallet: ${walletAddress}\nChain: ${selectedChain}\nTimestamp: ${Date.now()}`;

      // Request signature
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      // Send to backend
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          walletAddress,
          chainId: selectedChain,
          signature,
          message,
          label: newLabel || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setWallets([...wallets, data.wallet]);
        setAddWalletOpen(false);
        setNewLabel("");
        toast({
          title: "Wallet added",
          description: "Your wallet has been linked successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Add wallet error:", error);
      toast({
        title: "Failed to add wallet",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  // Update wallet label
  const handleUpdateLabel = async () => {
    if (!editingWallet) return;

    try {
      const res = await fetch(`/api/wallets/${editingWallet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: newLabel }),
      });

      const data = await res.json();

      if (data.success) {
        setWallets(wallets.map(w => 
          w.id === editingWallet.id ? { ...w, label: newLabel } : w
        ));
        setEditingWallet(null);
        setNewLabel("");
        toast({
          title: "Label updated",
          description: "Wallet label has been updated",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Set primary wallet
  const handleSetPrimary = async (walletId: number) => {
    try {
      const res = await fetch(`/api/wallets/${walletId}/primary`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setWallets(wallets.map(w => ({
          ...w,
          isPrimary: w.id === walletId,
        })));
        toast({
          title: "Primary wallet updated",
          description: "This wallet is now your primary wallet",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Delete wallet
  const handleDeleteWallet = async () => {
    if (!deleteWalletId) return;

    try {
      const res = await fetch(`/api/wallets/${deleteWalletId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setWallets(wallets.filter(w => w.id !== deleteWalletId));
        setDeleteWalletId(null);
        toast({
          title: "Wallet removed",
          description: "The wallet has been unlinked from your account",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to remove",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Copy address
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  // Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Revoke session
  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({
      title: "Session revoked",
      description: "The session has been terminated",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Security</h1>
          <p className="text-zinc-400">Manage your wallets, authentication methods, and security settings</p>
        </div>

        {/* Connected Wallets Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-[#5865F2]" />
                Connected Wallets
              </CardTitle>
              <CardDescription>
                Manage your linked Web3 wallets across different chains
              </CardDescription>
            </div>
            <Button 
              onClick={() => setAddWalletOpen(true)}
              className="bg-[#5865F2] hover:bg-[#4752C4]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No wallets connected</p>
                <p className="text-zinc-500 text-sm">Add your first wallet to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                  >
                    <div className="flex items-center gap-4">
                      {/* Chain indicator */}
                      <div className={`w-10 h-10 rounded-full ${chainColors[wallet.chainId] || 'bg-zinc-600'} flex items-center justify-center`}>
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* Wallet info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {wallet.label || wallet.ensName || formatAddress(wallet.walletAddress)}
                          </span>
                          {wallet.isPrimary && (
                            <Badge className="bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <span>{wallet.chainName}</span>
                          <span>â€?/span>
                          <span className="font-mono">{formatAddress(wallet.walletAddress)}</span>
                          <button
                            onClick={() => copyAddress(wallet.walletAddress)}
                            className="hover:text-white transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        {wallet.ensName && wallet.label && (
                          <p className="text-xs text-zinc-500">{wallet.ensName}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!wallet.isPrimary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrimary(wallet.id)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <StarOff className="h-4 w-4 mr-1" />
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingWallet(wallet);
                          setNewLabel(wallet.label || "");
                        }}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteWalletId(wallet.id)}
                        className="text-zinc-400 hover:text-red-400"
                        disabled={wallets.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Methods */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-[#5865F2]" />
              Authentication Methods
            </CardTitle>
            <CardDescription>
              Configure how you sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Wallet Auth */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-[#5865F2]" />
                </div>
                <div>
                  <p className="font-medium text-white">Wallet (SIWE)</p>
                  <p className="text-sm text-zinc-400">Sign in with your Web3 wallet</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            </div>

            {/* Email Auth */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Email & Password</p>
                  <p className="text-sm text-zinc-400">Traditional email authentication</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Set Up
              </Button>
            </div>

            {/* Passkeys */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Passkeys</p>
                  <p className="text-sm text-zinc-400">Biometric authentication with WebAuthn</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Set Up
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#5865F2]" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Authenticator App</p>
                <p className="text-sm text-zinc-400">
                  Use an app like Google Authenticator or Authy
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-zinc-400">
                  Receive alerts for new sign-ins
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#5865F2]" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{session.device}</p>
                      {session.isCurrent && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">
                      {session.location} â€?{session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add Wallet Dialog */}
        <Dialog open={addWalletOpen} onOpenChange={setAddWalletOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Wallet</DialogTitle>
              <DialogDescription>
                Connect a new wallet to your VDID account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Select Chain</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {chains.find(c => c.chainId === selectedChain)?.name || "Select chain"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-zinc-900 border-zinc-800">
                    {chains.map((chain) => (
                      <DropdownMenuItem
                        key={chain.chainId}
                        onClick={() => setSelectedChain(chain.chainId)}
                        className="cursor-pointer"
                      >
                        <div className={`w-3 h-3 rounded-full ${chainColors[chain.chainId] || 'bg-zinc-600'} mr-2`} />
                        {chain.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Label (Optional)</label>
                <Input
                  placeholder="e.g., Trading Wallet"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddWalletOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddWallet}
                disabled={connecting}
                className="bg-[#5865F2] hover:bg-[#4752C4]"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Label Dialog */}
        <Dialog open={!!editingWallet} onOpenChange={() => setEditingWallet(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Wallet Label</DialogTitle>
              <DialogDescription>
                Give this wallet a friendly name
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="e.g., Main Wallet"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingWallet(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateLabel}
                className="bg-[#5865F2] hover:bg-[#4752C4]"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteWalletId} onOpenChange={() => setDeleteWalletId(null)}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Remove Wallet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unlink this wallet from your account? 
                You can always add it back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWallet}
                className="bg-red-500 hover:bg-red-600"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
