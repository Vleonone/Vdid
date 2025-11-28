import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Key, Lock, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <div className="text-muted-foreground divider-ascii">// IDENTITY HUB //</div>
              <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                One Identity.<br />
                <span className="text-primary">Universal Access</span>
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Secure, unified identity for the Velon ecosystem. 
              Access Velgoo, RTPX, and FlowID with a single verified V-ID.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Create V-ID
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 border-secondary hover:bg-secondary text-white font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-secondary">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground divider-ascii tracking-[0.3em]">
            // BUILD WITH SECURITY //
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Bank-Grade Security"
              description="Argon2id hashing, 2FA, and enterprise encryption protect your identity."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Ecosystem Access"
              description="One V-ID connects you to Velgoo, RTPX, FlowID, and beyond."
            />
            <FeatureCard 
              icon={<Key className="w-6 h-6 text-primary" />}
              title="Your Control"
              description="Fine-grained permissions. Apps get only what you explicitly allow."
            />
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-24 border-t border-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-muted-foreground divider-ascii mb-2">// TECHNICAL SPECS //</div>
            <h2 className="text-3xl font-bold">Enterprise-Grade Infrastructure</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 font-mono text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold mb-1">OAuth 2.0 + OIDC</h3>
                  <p className="text-sm text-muted-foreground">Industry-standard authentication protocol for secure cross-app access.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 font-mono text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold mb-1">JWT Tokens</h3>
                  <p className="text-sm text-muted-foreground">Stateless, tamper-proof identity verification with RS256 signing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 font-mono text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Multi-Auth Support</h3>
                  <p className="text-sm text-muted-foreground">Email, wallet signatures, social login, and biometric keys.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 font-mono text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Session Management</h3>
                  <p className="text-sm text-muted-foreground">Redis-backed sessions with device tracking and revocation.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 font-mono text-sm font-bold">5</div>
                <div>
                  <h3 className="font-semibold mb-1">Rate Limiting</h3>
                  <p className="text-sm text-muted-foreground">Protects against brute-force attacks and abuse.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 font-mono text-sm font-bold">6</div>
                <div>
                  <h3 className="font-semibold mb-1">Audit Logs</h3>
                  <p className="text-sm text-muted-foreground">Full transparency on authentication events and access patterns.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-secondary">
        <div className="container mx-auto px-6 text-center">
          <div className="text-muted-foreground divider-ascii text-xs">
            © 2025 VELON IDENTITY HUB
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-lg bg-card border border-secondary hover:border-primary/50 transition-colors">
      <div className="mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
