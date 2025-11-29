import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2, Wallet, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";

export default function Register() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('accessToken', data.accessToken);
      setLocation("/dashboard?welcome=true");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSuccess = (data: { user: any; accessToken: string; isNewUser: boolean }) => {
    setLocation("/dashboard?welcome=true");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">VELON ID</span>
          </div>
          <h1 className="text-3xl font-bold">Create Your V-ID</h1>
          <p className="text-muted-foreground text-sm">Your universal identity for Velon ecosystem</p>
        </div>

        <Card className="border-secondary bg-card animate-in fade-in zoom-in-95 duration-500 delay-100">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold">Registration</h2>
            <p className="text-xs text-muted-foreground">Choose how to create your identity</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary">
                <TabsTrigger value="wallet" className="gap-1.5">
                  <Wallet className="h-3.5 w-3.5" />
                  Wallet
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="wallet">
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-xs text-primary font-medium mb-1">✨ Web3 Native</p>
                    <p className="text-xs text-muted-foreground">
                      Connect your wallet to create a decentralized identity. 
                      No password needed!
                    </p>
                  </div>
                  
                  <WalletConnect 
                    onSuccess={handleWalletSuccess}
                    onError={(err) => setError(err.message)}
                  />
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms-wallet" required defaultChecked />
                    <label htmlFor="terms-wallet" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                      I agree to Terms of Service and Privacy Policy
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="email">
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs">Display Name</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Your name"
                      className="bg-input border-secondary"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">Email</Label>
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
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      className="bg-input border-secondary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Min 8 chars, 1 special character</p>
                  </div>
                  
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox id="terms" required />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                      I agree to Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-4" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating V-ID...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t border-secondary pt-4">
            <p className="text-xs text-muted-foreground w-full text-center">
              Already have V-ID? <Link href="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-xs text-center text-muted-foreground">
          Powered by <span className="text-primary">SIWE</span> • <span className="text-primary">ENS</span> • <span className="text-primary">Lens</span>
        </p>
      </div>
    </div>
  );
}
