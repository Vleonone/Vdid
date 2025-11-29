import { Navbar } from "@/components/layout/navbar";
import { useState } from "react";
import { 
  Shield, Key, Wallet, Globe, Fingerprint, Users, Zap, 
  Database, Lock, Code, Terminal, BookOpen, Layers, 
  CheckCircle, ArrowRight, Copy, ExternalLink, Network,
  Cpu, FileCode, GitBranch, Box, Activity, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DocSection = 'overview' | 'quickstart' | 'authentication' | 'api' | 'vscore' | 'security' | 'sdk';

export default function Docs() {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-64px)] sticky top-16 border-r border-secondary/50 overflow-y-auto">
          <nav className="p-6 space-y-8">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Getting Started</h4>
              <div className="space-y-1">
                <NavItem 
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Overview" 
                  active={activeSection === 'overview'} 
                  onClick={() => setActiveSection('overview')} 
                />
                <NavItem 
                  icon={<Zap className="w-4 h-4" />}
                  label="Quick Start" 
                  active={activeSection === 'quickstart'} 
                  onClick={() => setActiveSection('quickstart')} 
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Core Concepts</h4>
              <div className="space-y-1">
                <NavItem 
                  icon={<Key className="w-4 h-4" />}
                  label="Authentication" 
                  active={activeSection === 'authentication'} 
                  onClick={() => setActiveSection('authentication')} 
                />
                <NavItem 
                  icon={<Activity className="w-4 h-4" />}
                  label="V-Score System" 
                  active={activeSection === 'vscore'} 
                  onClick={() => setActiveSection('vscore')} 
                />
                <NavItem 
                  icon={<Shield className="w-4 h-4" />}
                  label="Security" 
                  active={activeSection === 'security'} 
                  onClick={() => setActiveSection('security')} 
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Developers</h4>
              <div className="space-y-1">
                <NavItem 
                  icon={<Terminal className="w-4 h-4" />}
                  label="API Reference" 
                  active={activeSection === 'api'} 
                  onClick={() => setActiveSection('api')} 
                />
                <NavItem 
                  icon={<Box className="w-4 h-4" />}
                  label="SDK & Libraries" 
                  active={activeSection === 'sdk'} 
                  onClick={() => setActiveSection('sdk')} 
                />
              </div>
            </div>

            {/* Resources Box */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-secondary/50">
              <h4 className="font-medium text-sm mb-2">Need Help?</h4>
              <p className="text-xs text-muted-foreground mb-3">Join our community for support and updates.</p>
              <a href="https://discord.gg/velon" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Join Discord
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'quickstart' && <QuickStartSection />}
            {activeSection === 'authentication' && <AuthenticationSection />}
            {activeSection === 'api' && <APISection />}
            {activeSection === 'vscore' && <VScoreSection />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'sdk' && <SDKSection />}
          </div>
        </main>

        {/* Right Sidebar - On This Page */}
        <aside className="hidden xl:block w-56 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <div className="p-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On This Page</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-white transition-colors">Introduction</a>
              <a href="#" className="block text-muted-foreground hover:text-white transition-colors">Key Features</a>
              <a href="#" className="block text-muted-foreground hover:text-white transition-colors">Architecture</a>
              <a href="#" className="block text-muted-foreground hover:text-white transition-colors">Next Steps</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-white hover:bg-secondary/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <BookOpen className="w-3 h-3" />
          Documentation
        </div>
        <h1 className="text-4xl font-bold tracking-tight">VDID Overview</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          VDID is a decentralized identity protocol that enables secure, 
          user-controlled authentication across the Velon ecosystem and beyond.
        </p>
      </div>

      {/* What is VDID */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          What is VDID?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          VDID (Velon Decentralized ID) provides a unified identity layer that connects 
          users to multiple applications with a single, verifiable credential. Unlike 
          traditional identity systems, VDID puts users in control of their data while 
          enabling seamless authentication across Web3 and Web2 platforms.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Wallet className="w-5 h-5" />}
            title="Wallet-Native"
            description="Authenticate with any EVM-compatible wallet using SIWE standard"
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="Non-Custodial"
            description="You own your identity. No central authority controls your data"
          />
          <FeatureCard
            icon={<Fingerprint className="w-5 h-5" />}
            title="Passkey Support"
            description="Biometric authentication for the highest security level"
          />
          <FeatureCard
            icon={<Network className="w-5 h-5" />}
            title="Multi-Chain"
            description="Works across Ethereum, Polygon, Arbitrum, Base, and more"
          />
        </div>
      </div>

      {/* Architecture */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-accent" />
          </div>
          Architecture
        </h2>
        
        <div className="p-6 rounded-xl bg-secondary/30 border border-secondary/50 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <ArchBlock 
              title="Identity Layer"
              items={["V-ID Generation", "DID Registry", "Credential Storage"]}
            />
            <ArchBlock 
              title="Auth Layer"
              items={["SIWE Protocol", "OAuth 2.0 / OIDC", "Passkeys / WebAuthn"]}
            />
            <ArchBlock 
              title="Integration Layer"
              items={["REST API", "SDK Libraries", "Webhook Events"]}
            />
          </div>
        </div>
      </div>

      {/* Ecosystem */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-green-500" />
          </div>
          Velon Ecosystem Integration
        </h2>
        
        <p className="text-muted-foreground leading-relaxed">
          VDID serves as the identity backbone for all Velon products, enabling seamless 
          user experiences across the entire ecosystem.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <EcosystemCard 
            name="Velgoo"
            description="Access the Velon super-app with your V-ID"
            status="Live"
          />
          <EcosystemCard 
            name="RTPX"
            description="Behavior-to-value protocol integration"
            status="Live"
          />
          <EcosystemCard 
            name="FlowID"
            description="Next-gen decentralized identity"
            status="Coming Soon"
          />
        </div>
      </div>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Zap className="w-3 h-3" />
          Quick Start
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Get Started in Minutes</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Integrate VDID into your application and start authenticating users in under 10 minutes.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        <StepBlock
          step="Install the SDK"
          description="Add VDID to your project using npm or yarn"
          code="npm install @velon/vdid-sdk"
        />
        
        <StepBlock
          step="Initialize Client"
          description="Configure the VDID client with your application credentials"
          code={`import { VDIDClient } from '@velon/vdid-sdk';

const vdid = new VDIDClient({
  appId: 'your-app-id',
  redirectUri: 'https://yourapp.com/callback'
});`}
        />

        <StepBlock
          step="Authenticate Users"
          description="Trigger the authentication flow with a single method call"
          code={`const result = await vdid.authenticate({
  methods: ['wallet', 'email', 'passkey']
});

console.log(result.user.vid); // VID-XXXX-XXXX-XXXX`}
        />
      </div>

      {/* Next Steps */}
      <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
        <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <NextStepLink icon={<Key />} title="Authentication Methods" description="Learn about SIWE, Passkeys, and more" />
          <NextStepLink icon={<Terminal />} title="API Reference" description="Explore the full API documentation" />
          <NextStepLink icon={<Activity />} title="V-Score Integration" description="Implement reputation scoring" />
          <NextStepLink icon={<Shield />} title="Security Best Practices" description="Secure your integration" />
        </div>
      </div>
    </div>
  );
}

function AuthenticationSection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Key className="w-3 h-3" />
          Core Concepts
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Authentication</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          VDID supports multiple authentication methods to accommodate different user preferences and security requirements.
        </p>
      </div>

      {/* SIWE */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          Sign-In with Ethereum (SIWE)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          SIWE is the standard for wallet-based authentication. Users sign a message with their 
          private key to prove ownership of their wallet address.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <InfoCard 
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            title="Benefits"
            items={[
              "No password needed",
              "Cryptographically secure",
              "Works with any EVM wallet",
              "User retains key ownership"
            ]}
          />
          <InfoCard 
            icon={<Network className="w-5 h-5 text-primary" />}
            title="Supported Wallets"
            items={[
              "MetaMask",
              "WalletConnect",
              "Coinbase Wallet",
              "Rainbow, Trust, etc."
            ]}
          />
        </div>
      </div>

      {/* Passkeys */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Fingerprint className="w-4 h-4 text-accent" />
          </div>
          Passkeys (WebAuthn)
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Passkeys provide the highest level of security using biometrics or hardware security keys. 
          They're phishing-resistant and eliminate the need for passwords entirely.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <MetricDisplay icon={<Lock />} value="100%" label="Phishing Resistant" />
          <MetricDisplay icon={<Zap />} value="<1s" label="Auth Time" />
          <MetricDisplay icon={<Shield />} value="FIDO2" label="Standard" />
        </div>
      </div>

      {/* OAuth */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-orange-500" />
          </div>
          OAuth 2.0 / OpenID Connect
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          For traditional web applications, VDID acts as an OAuth 2.0 provider with OIDC support, 
          enabling standard SSO integrations.
        </p>

        <CodeBlock code={`// OAuth Authorization URL
GET /oauth/authorize
  ?client_id=your-client-id
  &redirect_uri=https://yourapp.com/callback
  &response_type=code
  &scope=openid profile email
  &state=random-state-value`} />
      </div>
    </div>
  );
}

function VScoreSection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Activity className="w-3 h-3" />
          Core Concepts
        </div>
        <h1 className="text-4xl font-bold tracking-tight">V-Score System</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          V-Score is a dynamic reputation system that quantifies user trustworthiness 
          and engagement across the Velon ecosystem.
        </p>
      </div>

      {/* Score Components */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Score Components</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <ScoreCard 
            icon={<Activity className="w-6 h-6" />}
            title="Activity Score"
            value={250}
            max={300}
            color="primary"
            description="Based on platform usage, transactions, and engagement frequency"
          />
          <ScoreCard 
            icon={<Shield className="w-6 h-6" />}
            title="Trust Score"
            value={180}
            max={200}
            color="green"
            description="Reflects identity verification level and security practices"
          />
          <ScoreCard 
            icon={<Users className="w-6 h-6" />}
            title="Social Score"
            value={120}
            max={200}
            color="blue"
            description="Measures community participation and referral network"
          />
          <ScoreCard 
            icon={<Layers className="w-6 h-6" />}
            title="Ecosystem Score"
            value={280}
            max={300}
            color="purple"
            description="Integration with Velon products and partner applications"
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-accent" />
          </div>
          How V-Score Works
        </h2>
        
        <div className="space-y-4">
          <ProcessStep 
            icon={<Database />}
            title="Data Collection"
            description="User activities across Velon ecosystem are tracked in real-time"
          />
          <ProcessStep 
            icon={<Cpu />}
            title="Score Calculation"
            description="Weighted algorithms compute individual component scores"
          />
          <ProcessStep 
            icon={<Activity />}
            title="Dynamic Updates"
            description="Total V-Score updates continuously based on behavior"
          />
          <ProcessStep 
            icon={<Zap />}
            title="RTPX Integration"
            description="High scores unlock rewards through the behavior-to-value protocol"
          />
        </div>
      </div>

      {/* API Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Retrieve V-Score via API</h2>
        <CodeBlock code={`// Get user's V-Score
GET /api/vscore/:userId

// Response
{
  "totalScore": 830,
  "level": "Elite",
  "components": {
    "activity": 250,
    "trust": 180,
    "social": 120,
    "ecosystem": 280
  },
  "percentile": 94
}`} />
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Shield className="w-3 h-3" />
          Core Concepts
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Security</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          VDID is built with security-first principles, implementing industry best practices 
          and cutting-edge cryptographic standards.
        </p>
      </div>

      {/* Security Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <SecurityCard 
          icon={<Lock />}
          title="Argon2id Password Hashing"
          description="Memory-hard algorithm resistant to GPU attacks"
          badge="OWASP Recommended"
        />
        <SecurityCard 
          icon={<Key />}
          title="JWT with RS256"
          description="Asymmetric signing for tamper-proof tokens"
          badge="RFC 7519"
        />
        <SecurityCard 
          icon={<Shield />}
          title="Rate Limiting"
          description="Protection against brute-force and DDoS attacks"
          badge="Adaptive"
        />
        <SecurityCard 
          icon={<Database />}
          title="Encrypted at Rest"
          description="AES-256 encryption for all sensitive data"
          badge="SOC 2"
        />
      </div>

      {/* Audit & Compliance */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          Audit & Compliance
        </h2>
        
        <div className="p-6 rounded-xl bg-secondary/30 border border-secondary/50">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">Quarterly</div>
              <div className="text-sm text-muted-foreground">Security Audits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">GDPR</div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function APISection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Terminal className="w-3 h-3" />
          Developers
        </div>
        <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Complete REST API documentation for integrating VDID into your applications.
        </p>
      </div>

      {/* Base URL */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Base URL</h2>
        <CodeBlock code="https://api.vdid.io/v1" />
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Endpoints</h2>
        
        <EndpointCard 
          method="POST"
          path="/auth/register"
          description="Create a new V-ID account"
        />
        <EndpointCard 
          method="POST"
          path="/auth/login"
          description="Authenticate with email and password"
        />
        <EndpointCard 
          method="POST"
          path="/wallet/nonce"
          description="Request SIWE nonce for wallet authentication"
        />
        <EndpointCard 
          method="POST"
          path="/wallet/verify"
          description="Verify wallet signature and authenticate"
        />
        <EndpointCard 
          method="GET"
          path="/vscore/:userId"
          description="Retrieve user's V-Score and components"
        />
        <EndpointCard 
          method="GET"
          path="/user/profile"
          description="Get authenticated user's profile"
        />
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <p className="text-muted-foreground">Include the JWT token in the Authorization header:</p>
        <CodeBlock code={`Authorization: Bearer <your-jwt-token>`} />
      </div>
    </div>
  );
}

function SDKSection() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Box className="w-3 h-3" />
          Developers
        </div>
        <h1 className="text-4xl font-bold tracking-tight">SDK & Libraries</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Official SDKs and community libraries for easy VDID integration.
        </p>
      </div>

      {/* Official SDKs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Official SDKs</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <SDKCard 
            icon={<FileCode />}
            name="JavaScript / TypeScript"
            package="@velon/vdid-sdk"
            status="Stable"
          />
          <SDKCard 
            icon={<FileCode />}
            name="React Components"
            package="@velon/vdid-react"
            status="Stable"
          />
          <SDKCard 
            icon={<FileCode />}
            name="Python"
            package="vdid-python"
            status="Beta"
          />
          <SDKCard 
            icon={<FileCode />}
            name="Go"
            package="go-vdid"
            status="Coming Soon"
          />
        </div>
      </div>

      {/* Installation */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Installation</h2>
        <CodeBlock code={`# npm
npm install @velon/vdid-sdk

# yarn
yarn add @velon/vdid-sdk

# pnpm
pnpm add @velon/vdid-sdk`} />
      </div>
    </div>
  );
}

// Reusable Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-secondary/50 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ArchBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-background border border-secondary/50">
      <h4 className="font-medium text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EcosystemCard({ name, description, status }: { name: string; description: string; status: string }) {
  return (
    <div className="p-5 rounded-xl bg-card border border-secondary hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">{name}</h4>
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${status === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepBlock({ step, description, code }: { step: string; description: string; code: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{step}</h3>
      <p className="text-muted-foreground">{description}</p>
      <CodeBlock code={code} />
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative group">
      <pre className="p-4 rounded-lg bg-[#0d1117] border border-secondary/50 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
      <button 
        onClick={copyToClipboard}
        className="absolute top-3 right-3 p-2 rounded-md bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

function NextStepLink({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-white text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="p-5 rounded-xl bg-secondary/20 border border-secondary/50">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="font-medium text-white">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetricDisplay({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/50 text-center">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ScoreCard({ icon, title, value, max, color, description }: { icon: React.ReactNode; title: string; value: number; max: number; color: string; description: string }) {
  const percentage = (value / max) * 100;
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-secondary">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color === 'primary' ? 'primary' : color + '-500'}/10 flex items-center justify-center text-${color === 'primary' ? 'primary' : color + '-500'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-2xl font-bold">{value}<span className="text-sm text-muted-foreground">/{max}</span></p>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-secondary mb-3">
        <div className={`h-full rounded-full ${colorClasses[color]}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ProcessStep({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/20 border border-secondary/50">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SecurityCard({ icon, title, description, badge }: { icon: React.ReactNode; title: string; description: string; badge: string }) {
  return (
    <div className="p-5 rounded-xl bg-card border border-secondary hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
          {icon}
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-secondary rounded text-muted-foreground">{badge}</span>
      </div>
      <h4 className="font-medium text-white mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function EndpointCard({ method, path, description }: { method: string; path: string; description: string }) {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-500/20 text-green-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-orange-500/20 text-orange-400',
    DELETE: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/50 flex items-center gap-4">
      <span className={`px-3 py-1 text-xs font-mono font-medium rounded ${methodColors[method]}`}>{method}</span>
      <code className="text-sm font-mono text-primary">{path}</code>
      <span className="text-sm text-muted-foreground ml-auto hidden md:block">{description}</span>
    </div>
  );
}

function SDKCard({ icon, name, package: pkg, status }: { icon: React.ReactNode; name: string; package: string; status: string }) {
  const statusColors: Record<string, string> = {
    'Stable': 'bg-green-500/20 text-green-400',
    'Beta': 'bg-orange-500/20 text-orange-400',
    'Coming Soon': 'bg-secondary text-muted-foreground'
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-secondary hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[status]}`}>{status}</span>
      </div>
      <h4 className="font-medium text-white mb-1">{name}</h4>
      <code className="text-sm text-muted-foreground">{pkg}</code>
    </div>
  );
}
