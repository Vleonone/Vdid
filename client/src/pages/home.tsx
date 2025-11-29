import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { 
  Shield, Key, Globe, ArrowRight, Wallet, Fingerprint, 
  Users, Zap, Lock, CheckCircle, ExternalLink, Layers,
  Database, Network, Cpu
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Powered by Velon Protocol</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Decentralized Identity
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              VDID is the universal identity layer for Web3. 
              Connect your wallet, verify once, access everywhere across the Velon ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25">
                  Create Your V-ID
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-secondary hover:bg-secondary/50 font-medium">
                  View Documentation
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Non-custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>EVM Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-secondary/50 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="10K+" label="Identities Created" />
            <StatItem value="50+" label="Apps Integrated" />
            <StatItem value="6" label="Chains Supported" />
            <StatItem value="99.9%" label="Uptime" />
          </div>
        </div>
      </section>

      {/* Auth Methods */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Multiple Ways to Authenticate
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose how you want to verify your identity. Web3-native or traditional — we support both.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AuthCard 
              icon={<Wallet className="w-8 h-8" />}
              title="Wallet Sign-In"
              description="Connect MetaMask, WalletConnect, or any EVM wallet. Sign a message to prove ownership."
              badge="SIWE"
            />
            <AuthCard 
              icon={<Fingerprint className="w-8 h-8" />}
              title="Passkeys"
              description="Use biometrics or security keys. No passwords, no phishing, maximum security."
              badge="WebAuthn"
            />
            <AuthCard 
              icon={<Globe className="w-8 h-8" />}
              title="Social Identity"
              description="Link your ENS domain or Lens profile for a human-readable Web3 identity."
              badge="ENS + Lens"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Built for the
                <br />
                <span className="text-primary">Velon Ecosystem</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                VDID serves as the unified identity layer connecting all Velon products. 
                One identity, infinite possibilities.
              </p>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<Layers className="w-5 h-5" />}
                  title="Velgoo Integration"
                  description="Seamlessly access the Velon super-app with your V-ID"
                />
                <FeatureItem 
                  icon={<Zap className="w-5 h-5" />}
                  title="RTPX Connected"
                  description="Your behavior-to-value score linked to your identity"
                />
                <FeatureItem 
                  icon={<Network className="w-5 h-5" />}
                  title="FlowID Ready"
                  description="Future-proof with decentralized identity standards"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <MetricCard 
                  icon={<Shield className="w-6 h-6 text-primary" />}
                  title="V-Score"
                  value="850"
                  subtitle="Trust Level: Elite"
                />
                <MetricCard 
                  icon={<Users className="w-6 h-6 text-accent" />}
                  title="Connected Apps"
                  value="12"
                  subtitle="Active Integrations"
                />
              </div>
              <div className="space-y-4 pt-8">
                <MetricCard 
                  icon={<Lock className="w-6 h-6 text-green-500" />}
                  title="Security"
                  value="98%"
                  subtitle="Score"
                />
                <MetricCard 
                  icon={<Database className="w-6 h-6 text-orange-500" />}
                  title="On-Chain"
                  value="3"
                  subtitle="Verified Credentials"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Infrastructure
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with security and scalability at its core. Ready for millions of users.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TechCard 
              icon={<Key className="w-6 h-6" />}
              title="OAuth 2.0 + OIDC"
              description="Industry-standard protocols for secure authorization"
            />
            <TechCard 
              icon={<Cpu className="w-6 h-6" />}
              title="JWT with RS256"
              description="Cryptographically signed, tamper-proof tokens"
            />
            <TechCard 
              icon={<Shield className="w-6 h-6" />}
              title="Argon2id Hashing"
              description="Memory-hard password protection"
            />
            <TechCard 
              icon={<Database className="w-6 h-6" />}
              title="Multi-Chain Support"
              description="Ethereum, Polygon, Arbitrum, Base & more"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-secondary/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Own Your Identity?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of users who have taken control of their digital identity with VDID.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-base bg-primary font-semibold">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="https://github.com/velon/vdid" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-14 px-10 text-base">
                  Star on GitHub
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-secondary/50 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">VD</span>
                <span className="text-primary">ID</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="https://github.com/velon" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://velon.io" className="hover:text-white transition-colors">Velon</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Velon Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function AuthCard({ icon, title, description, badge }: { icon: React.ReactNode; title: string; description: string; badge: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-secondary hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-lg text-white">{title}</h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-secondary rounded text-muted-foreground">{badge}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string; subtitle: string }) {
  return (
    <div className="p-5 rounded-xl bg-card border border-secondary">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </div>
  );
}

function TechCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-secondary hover:border-primary/30 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
