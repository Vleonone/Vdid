import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Authorize() {
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAllow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // In a real app, this would redirect back to the client app
      // For demo, go to dashboard
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg glass-card animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">R</div>
          </div>
          <h1 className="text-2xl font-bold text-white">RTPX</h1>
          <p className="text-muted-foreground">wants to access your Velon Identity</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span>View your V-ID Profile (Name, Avatar)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                 <Check className="w-3 h-3 text-primary" />
              </div>
              <span>View your Verification Status</span>
            </div>
             <div className="flex items-center gap-3 text-sm text-white">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                 <Check className="w-3 h-3 text-primary" />
              </div>
              <span>Read your Energy Balance</span>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>RTPX will not be able to access your wallet private keys or perform transactions without your explicit signature.</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3 h-3" />
            Secured by Velon Identity Hub
          </div>
        </CardContent>
        
        <CardFooter className="flex-col gap-3">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base" onClick={handleAllow} disabled={isProcessing}>
            {isProcessing ? "Authorizing..." : "Authorize Access"}
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-white" onClick={() => setLocation("/")} disabled={isProcessing}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
