import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Login() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1500);
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
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" required className="bg-input border-secondary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                    </div>
                    <Input id="password" type="password" required className="bg-input border-secondary" />
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
              
              <TabsContent value="wallet">
                <div className="space-y-4 py-4">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => setLocation("/dashboard")}>
                    Connect Wallet
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">Sign a message to verify wallet ownership</p>
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
      </div>
    </div>
  );
}
