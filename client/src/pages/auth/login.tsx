import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, Fingerprint, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";

type AuthMethod = 'wallet' | 'email' | 'passkey';

export default function Login() {
  const [, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('wallet');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.accessToken);
        setLocation('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSuccess = (data: any) => {
    localStorage.setItem('token', data.accessToken);
    if (data.isNewUser) {
      setLocation('/dashboard?welcome=true');
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="font-bold text-xl">
                <span className="text-white">VD</span>
                <span className="text-primary">ID</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome Back to
            <br />
            <span className="text-primary">Decentralized Identity</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Your V-ID is your universal passport across the Velon ecosystem. 
            Sign in securely with your wallet, email, or passkey.
          </p>
        </div>

        <div className="relative text-sm text-muted-foreground">
          © 2025 Velon Labs. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold text-xl">
              <span className="text-white">VD</span>
              <span className="text-primary">ID</span>
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold">Sign In</h2>
            <p className="text-muted-foreground mt-2">Choose your preferred authentication method</p>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex rounded-xl bg-secondary/30 p-1">
            <AuthTab 
              icon={<Wallet className="w-4 h-4" />}
              label="Wallet"
              active={authMethod === 'wallet'}
              onClick={() => setAuthMethod('wallet')}
            />
            <AuthTab 
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              active={authMethod === 'email'}
              onClick={() => setAuthMethod('email')}
            />
            <AuthTab 
              icon={<Fingerprint className="w-4 h-4" />}
              label="Passkey"
              active={authMethod === 'passkey'}
              onClick={() => setAuthMethod('passkey')}
            />
          </div>

          {/* Wallet Login */}
          {authMethod === 'wallet' && (
            <div className="space-y-6">
              <WalletConnect 
                mode="login"
                onSuccess={handleWalletSuccess}
                onError={(err) => setError(err.message)}
              />
              <p className="text-center text-sm text-muted-foreground">
                Sign a message to verify wallet ownership
              </p>
            </div>
          )}

          {/* Email Login */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary/30 border-secondary"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">Forgot?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-secondary/30 border-secondary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}

          {/* Passkey Login */}
          {authMethod === 'passkey' && (
            <div className="space-y-6">
              <div className="p-8 rounded-xl bg-secondary/20 border border-secondary/50 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Use Your Passkey</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Authenticate using your device's biometrics or security key
                </p>
                <Button className="w-full h-12 bg-primary font-semibold">
                  Continue with Passkey
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Passkeys provide the highest level of security
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New to VDID?</span>
              </div>
            </div>

            <Link href="/register">
              <Button variant="outline" className="w-full h-12 border-secondary hover:bg-secondary/30">
                Create Your V-ID
              </Button>
            </Link>
          </div>

          <Link href="/">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'text-muted-foreground hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
