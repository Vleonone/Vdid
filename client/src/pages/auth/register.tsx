import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Register() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 2000);
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
            <p className="text-xs text-muted-foreground">Create your secure identity</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs">First name</Label>
                  <Input id="firstName" required className="bg-input border-secondary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs">Last name</Label>
                  <Input id="lastName" required className="bg-input border-secondary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" required className="bg-input border-secondary" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input id="password" type="password" required className="bg-input border-secondary" />
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
          </CardContent>
          <CardFooter className="border-t border-secondary pt-4">
            <p className="text-xs text-muted-foreground w-full text-center">
              Already have V-ID? <Link href="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
