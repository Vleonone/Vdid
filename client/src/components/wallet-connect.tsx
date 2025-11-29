/**
 * WalletConnect Component
 * 
 * Web3 钱包连接和 SIWE 认证组件
 * 
 * 支持：
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - 其他 EIP-1193 兼容钱包
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

// 类型定义
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletConnectProps {
  onSuccess?: (data: { user: any; accessToken: string; isNewUser: boolean }) => void;
  onError?: (error: Error) => void;
  mode?: 'login' | 'bind';
}

type ConnectionStatus = 'idle' | 'connecting' | 'signing' | 'verifying' | 'success' | 'error';

export function WalletConnect({ onSuccess, onError, mode = 'login' }: WalletConnectProps) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  // 检查是否安装了钱包
  const hasWallet = typeof window !== 'undefined' && !!window.ethereum;

  // 检测账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accts = accounts as string[];
      if (accts.length === 0) {
        setAddress(null);
        setStatus('idle');
      } else {
        setAddress(accts[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);

      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);

      // 获取链 ID
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      const chainId = parseInt(chainIdHex, 16);

      // 获取 SIWE Nonce
      setStatus('signing');
      
      const nonceResponse = await fetch('/api/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, chainId }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json().catch(() => ({}));
        const errorMessage = typeof errorData.error === 'string'
          ? errorData.error
          : errorData.error?.message || 'Failed to get nonce';
        throw new Error(errorMessage);
      }

      const { message } = await nonceResponse.json();

      // 请求签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, userAddress],
      }) as string;

      // 验证签名
      setStatus('verifying');

      const verifyResponse = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: userAddress,
          signature,
          message,
          chainId,
          ensName,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        const errorMessage = typeof errorData.error === 'string'
          ? errorData.error
          : errorData.error?.message || 'Verification failed';
        throw new Error(errorMessage);
      }

      const data = await verifyResponse.json();

      setStatus('success');
      
      // 保存 token
      localStorage.setItem('accessToken', data.accessToken);

      if (onSuccess) {
        onSuccess(data);
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      const error = err as Error;
      setError(error.message || 'Connection failed');
      setStatus('error');
      
      if (onError) {
        onError(error);
      }
    }
  };

  // 断开连接
  const disconnect = () => {
    setAddress(null);
    setEnsName(null);
    setStatus('idle');
    setError(null);
  };

  // 渲染不同状态
  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting Wallet...
          </Button>
        );

      case 'signing':
        return (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sign the message in your wallet...
          </Button>
        );

      case 'verifying':
        return (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying signature...
          </Button>
        );

      case 'success':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <span>Connected successfully!</span>
            </div>
            {address && (
              <p className="text-xs text-center text-muted-foreground font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
            <Button onClick={connectWallet} className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        );

      default:
        if (!hasWallet) {
          return (
            <div className="space-y-3">
              <Button
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Install MetaMask
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You need a Web3 wallet to continue
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <Button 
              onClick={connectWallet} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {mode === 'bind' ? 'Connect Wallet' : 'Sign In with Wallet'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Sign a message to verify wallet ownership
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 py-4">
      {renderContent()}
    </div>
  );
}

// 钱包图标组件
export function WalletIcon({ provider }: { provider?: string }) {
  // 可以根据 provider 返回不同的图标
  return <Wallet className="h-5 w-5" />;
}

// 简化的地址显示
export function AddressDisplay({ address, ensName }: { address: string; ensName?: string | null }) {
  const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  return (
    <span className="font-mono text-sm" title={address}>
      {displayName}
    </span>
  );
}
