import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, Shield, Zap } from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";

type AuthMethod = 'wallet' | 'email';

export default function Register() {
  const [, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('wallet');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.accessToken);
        setLocation('/dashboard?welcome=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSuccess = (data: any) => {
    localStorage.setItem('token', data.accessToken);
    setLocation('/dashboard?welcome=true');
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

        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            Create Your
            <br />
            <span className="text-primary">Decentralized Identity</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Join thousands of users who have taken control of their digital identity with VDID.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            <BenefitItem 
              icon={<Shield className="w-5 h-5 text-primary" />}
              text="Bank-grade security with Argon2id encryption"
            />
            <BenefitItem 
              icon={<Zap className="w-5 h-5 text-primary" />}
              text="Instant access to the entire Velon ecosystem"
            />
            <BenefitItem 
              icon={<CheckCircle className="w-5 h-5 text-primary" />}
              text="Non-custodial - you own your identity"
            />
          </div>
        </div>

        <div className="relative text-sm text-muted-foreground">
          © 2025 Velon Labs. All rights reserved.
        </div>
      </div>

      {/* Right Side - Register Form */}
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
            <h2 className="text-3xl font-bold">Create Account</h2>
            <p className="text-muted-foreground mt-2">Get your V-ID in seconds</p>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex rounded-xl bg-secondary/30 p-1">
            <AuthTab 
              icon={<Wallet className="w-4 h-4" />}
              label="Wallet"
              sublabel="Web3 Native"
              active={authMethod === 'wallet'}
              onClick={() => setAuthMethod('wallet')}
            />
            <AuthTab 
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              sublabel="Traditional"
              active={authMethod === 'email'}
              onClick={() => setAuthMethod('email')}
            />
          </div>

          {/* Wallet Register */}
          {authMethod === 'wallet' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">No password needed — authenticate with your wallet</span>
              </div>
              
              <WalletConnect 
                mode="login"
                onSuccess={handleWalletSuccess}
                onError={(err) => setError(err.message)}
              />
              
              <p className="text-center text-sm text-muted-foreground">
                Sign a message to create your V-ID instantly
              </p>
            </div>
          )}

          {/* Email Register */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailRegister} className="space-y-5">
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
                <Label htmlFor="password">Password</Label>
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
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-secondary/30 border-secondary"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating V-ID...
                  </>
                ) : (
                  'Create V-ID'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </form>
          )}

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Already have a V-ID?</span>
              </div>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full h-12 border-secondary hover:bg-secondary/30">
                Sign In
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

function AuthTab({ icon, label, sublabel, active, onClick }: { icon: React.ReactNode; label: string; sublabel: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-lg transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'text-muted-foreground hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className={`text-xs ${active ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{sublabel}</span>
    </button>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
