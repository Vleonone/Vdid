import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2, Wallet, KeyRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";

export default function Login() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      setLocation("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSuccess = (data: { user: any; accessToken: string; isNewUser: boolean }) => {
    if (data.isNewUser) {
      setLocation("/dashboard?welcome=true");
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">VELON ID</span>
          </div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Verify your identity to continue</p>
        </div>

        <Card className="border-secondary bg-card animate-in fade-in zoom-in-95 duration-500 delay-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Authentication</CardTitle>
            <CardDescription>Choose your verification method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary">
                <TabsTrigger value="wallet" className="gap-1">
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Wallet</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-1">
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="passkey" className="gap-1">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Passkey</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <WalletConnect 
                  onSuccess={handleWalletSuccess}
                  onError={(err) => setError(err.message)}
                />
              </TabsContent>
              
              <TabsContent value="email">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      className="bg-input border-secondary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      className="bg-input border-secondary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="passkey">
                <div className="space-y-4 py-4">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Sign In with Passkey
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Use your device's biometrics or security key
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t border-secondary pt-4">
            <p className="text-xs text-muted-foreground w-full text-center">
              Don't have V-ID? <Link href="/register" className="text-primary font-semibold hover:underline">Create one</Link>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-xs text-center text-muted-foreground">
          Powered by <span className="text-primary">SIWE</span> • Secure • Decentralized
        </p>
      </div>
    </div>
  );
}
