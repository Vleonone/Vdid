import { useState } from "react";
import { Link } from "wouter";
import { 
  Book, 
  Layers, 
  Rocket, 
  FileCode, 
  Award, 
  BarChart3, 
  Shield, 
  Lock, 
  Code, 
  Terminal, 
  FileText, 
  AlertTriangle,
  Globe,
  HelpCircle,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Navigation sections
const sections = [
  { id: "overview", title: "Overview", icon: Book },
  { id: "architecture", title: "Architecture", icon: Layers },
  { id: "quick-start", title: "Quick Start", icon: Rocket },
  { id: "did-specification", title: "DID Specification", icon: FileCode },
  { id: "credentials", title: "Verifiable Credentials", icon: Award },
  { id: "vscore", title: "V-Score System", icon: BarChart3 },
  { id: "authentication", title: "Authentication", icon: Shield },
  { id: "privacy", title: "Privacy & ZKP", icon: Lock },
  { id: "api", title: "API Reference", icon: Code },
  { id: "sdk", title: "SDK & Libraries", icon: Terminal },
  { id: "contracts", title: "Smart Contracts", icon: FileText },
  { id: "security", title: "Security", icon: AlertTriangle },
  { id: "ecosystem", title: "Velon Ecosystem", icon: Globe },
  { id: "faq", title: "FAQ", icon: HelpCircle },
];

// Code block component with copy functionality
function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-zinc-300">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-400" />
        )}
      </button>
    </div>
  );
}

// Section header component
function SectionHeader({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="scroll-mt-20 mb-8">
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-zinc-400 text-lg">{description}</p>
    </div>
  );
}

// Subsection header
function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Info card
function InfoCard({ title, children, variant = "default" }: { title: string; children: React.ReactNode; variant?: "default" | "warning" | "success" }) {
  const variants = {
    default: "border-zinc-800 bg-zinc-900/50",
    warning: "border-yellow-900 bg-yellow-950/30",
    success: "border-green-900 bg-green-950/30",
  };

  return (
    <div className={cn("border rounded-lg p-4 mb-4", variants[variant])}>
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <div className="text-zinc-400 text-sm">{children}</div>
    </div>
  );
}

// Table component
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {headers.map((header, i) => (
              <th key={i} className="text-left py-3 px-4 text-zinc-400 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/50">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <span className="text-xl font-bold">
                <span className="text-white">VD</span>
                <span className="text-[#5865F2]">ID</span>
                <span className="text-zinc-500 text-sm ml-2">Docs</span>
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <a 
                href="https://github.com/vdid" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-zinc-400" />
              ) : (
                <Menu className="h-6 w-6 text-zinc-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)]">
            <ScrollArea className="h-full py-6 pr-4">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                        activeSection === section.id
                          ? "bg-[#5865F2]/10 text-[#5865F2]"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </aside>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-md">
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left",
                          activeSection === section.id
                            ? "bg-[#5865F2]/10 text-[#5865F2]"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 py-8 min-w-0">
            {/* Chapter 1: Overview */}
            <section className="mb-16">
              <SectionHeader
                id="overview"
                title="Overview"
                description="VDID (Velon Decentralized Identity) is a unified identity protocol for Web3"
              />

              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                  VDID creates a single, portable, user-controlled identity layer that works across 
                  all applications, chains, and services. By combining W3C DID standards with behavioral 
                  intelligence and cross-chain interoperability, VDID transforms how users exist in Web3.
                </p>

                <SubSection title="The Problem">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <InfoCard title="Wallet Fragmentation">
                      <p>The average crypto user manages <strong>4.7 separate wallets</strong>, each a separate identity with no connection.</p>
                    </InfoCard>
                    <InfoCard title="Repetitive KYC">
                      <p>Users complete KYC verification <strong>12+ times</strong> on average across platforms.</p>
                    </InfoCard>
                    <InfoCard title="Non-Portable Reputation">
                      <p>5 years of history on one platform means nothing on another. You start from zero everywhere.</p>
                    </InfoCard>
                    <InfoCard title="Sybil Vulnerability">
                      <p>Without verified identity, applications cannot distinguish humans from bots.</p>
                    </InfoCard>
                  </div>
                </SubSection>

                <SubSection title="The VDID Solution">
                  <Table
                    headers={["Feature", "Traditional Web3", "VDID"]}
                    rows={[
                      ["Identity", "Per-wallet, fragmented", "Unified across all chains"],
                      ["Reputation", "Non-portable, starts at zero", "Portable V-Score follows you"],
                      ["KYC", "Repeat on every platform", "Verify once, use everywhere"],
                      ["Privacy", "All or nothing", "Selective disclosure with ZKP"],
                      ["Data Ownership", "Platforms own your data", "You own and control your data"],
                    ]}
                  />
                </SubSection>

                <SubSection title="Core Principles">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-zinc-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">User Sovereignty</h4>
                      <p className="text-zinc-400 text-sm">
                        Users own their identity. No company, government, or protocol can revoke, 
                        modify, or access a user's VDID without explicit consent.
                      </p>
                    </div>
                    <div className="border border-zinc-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Privacy by Design</h4>
                      <p className="text-zinc-400 text-sm">
                        Built on minimal disclosure. Users can prove attributes without revealing 
                        underlying data through zero-knowledge proofs.
                      </p>
                    </div>
                    <div className="border border-zinc-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Interoperability First</h4>
                      <p className="text-zinc-400 text-sm">
                        Built on W3C DID standards, compatible with major blockchains, designed for 
                        both Web3 native apps and traditional systems.
                      </p>
                    </div>
                    <div className="border border-zinc-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Progressive Decentralization</h4>
                      <p className="text-zinc-400 text-sm">
                        Starting with a pragmatic approach for user experience, progressively 
                        decentralizing as the protocol matures.
                      </p>
                    </div>
                  </div>
                </SubSection>

                <SubSection title="Standards Compliance">
                  <Table
                    headers={["Standard", "Status"]}
                    rows={[
                      ["W3C DID Core 1.0", "✅ Compliant"],
                      ["W3C Verifiable Credentials 1.1", "✅ Compliant"],
                      ["DID Resolution 1.0", "✅ Compliant"],
                      ["BIP-39/44", "✅ Compliant"],
                      ["EIP-712", "✅ Supported"],
                      ["EIP-1271", "✅ Supported"],
                    ]}
                  />
                </SubSection>
              </div>
            </section>

            {/* Chapter 2: Architecture */}
            <section className="mb-16">
              <SectionHeader
                id="architecture"
                title="Architecture"
                description="VDID operates as a four-layer architecture balancing decentralization with usability"
              />

              <SubSection title="System Layers">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6 font-mono text-sm">
                  <pre className="text-zinc-300 overflow-x-auto">{`┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│   │  Velgoo   │  │  DApp A   │  │  DApp B   │  │  DApp N   │        │
│   │  Wallet   │  │           │  │           │  │           │        │
│   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │
├─────────┴──────────────┴──────────────┴──────────────┴──────────────┤
│                        SERVICE LAYER                                 │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│   │   VDID SDK    │  │   REST API    │  │   Resolver    │           │
│   │  (JS/TS/Rust) │  │   Gateway     │  │   Service     │           │
│   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │
├───────────┴──────────────────┴──────────────────┴───────────────────┤
│                       PROTOCOL LAYER                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│   │    DID      │  │ Credential  │  │  V-Score    │                 │
│   │  Registry   │  │   Vault     │  │   Engine    │                 │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
├──────────┴────────────────┴────────────────┴────────────────────────┤
│                      BLOCKCHAIN LAYER                                │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │    BASE (Primary)  │  Ethereum  │  Polygon  │  Arbitrum     │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘`}</pre>
                </div>
              </SubSection>

              <SubSection title="Core Components">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">DID Registry</h4>
                    <p className="text-zinc-400 text-sm mb-3">
                      Core smart contract managing DID creation, updates, and resolution.
                    </p>
                    <ul className="text-zinc-500 text-sm space-y-1">
                      <li>• <code className="text-zinc-400">createDID()</code> - Creates a new VDID</li>
                      <li>• <code className="text-zinc-400">updateDID()</code> - Updates DID document</li>
                      <li>• <code className="text-zinc-400">resolveDID()</code> - Returns DID document</li>
                      <li>• <code className="text-zinc-400">deactivateDID()</code> - Deactivates a DID</li>
                    </ul>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Credential Vault</h4>
                    <p className="text-zinc-400 text-sm mb-3">
                      Manages verifiable credentials issuance, storage, and verification.
                    </p>
                    <ul className="text-zinc-500 text-sm space-y-1">
                      <li>• <code className="text-zinc-400">issueCredential()</code> - Issues new credential</li>
                      <li>• <code className="text-zinc-400">verifyCredential()</code> - Verifies signature</li>
                      <li>• <code className="text-zinc-400">revokeCredential()</code> - Revokes credential</li>
                      <li>• <code className="text-zinc-400">getCredentials()</code> - Lists credentials</li>
                    </ul>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">V-Score Engine</h4>
                    <p className="text-zinc-400 text-sm mb-3">
                      Calculates and maintains behavioral reputation scores.
                    </p>
                    <ul className="text-zinc-500 text-sm space-y-1">
                      <li>• <code className="text-zinc-400">calculateScore()</code> - Computes V-Score</li>
                      <li>• <code className="text-zinc-400">getScore()</code> - Returns current score</li>
                      <li>• <code className="text-zinc-400">updateFactors()</code> - Updates factors</li>
                      <li>• <code className="text-zinc-400">getHistory()</code> - Score history</li>
                    </ul>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Key Manager</h4>
                    <p className="text-zinc-400 text-sm mb-3">
                      Handles key derivation, rotation, and recovery.
                    </p>
                    <ul className="text-zinc-500 text-sm space-y-1">
                      <li>• <code className="text-zinc-400">deriveKeys()</code> - Chain-specific keys</li>
                      <li>• <code className="text-zinc-400">rotateKey()</code> - Key rotation</li>
                      <li>• <code className="text-zinc-400">addRecovery()</code> - Recovery method</li>
                      <li>• <code className="text-zinc-400">recover()</code> - Execute recovery</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Multi-Chain Support">
                <Table
                  headers={["Network", "Identifier", "Chain ID", "Status"]}
                  rows={[
                    ["BASE Mainnet", "base", "8453", "✅ Live"],
                    ["Ethereum Mainnet", "ethereum", "1", "Q3 2026"],
                    ["Polygon Mainnet", "polygon", "137", "Q3 2026"],
                    ["Arbitrum One", "arbitrum", "42161", "Q4 2026"],
                    ["Optimism", "optimism", "10", "Q4 2026"],
                  ]}
                />
              </SubSection>
            </section>

            {/* Chapter 3: Quick Start */}
            <section className="mb-16">
              <SectionHeader
                id="quick-start"
                title="Quick Start"
                description="Get started with VDID in minutes"
              />

              <SubSection title="For Users">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-4 p-4 border border-zinc-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Create Your VDID</h4>
                      <p className="text-zinc-400 text-sm">
                        Download Velgoo wallet or connect your existing wallet. Tap "Create VDID" and 
                        securely backup your recovery phrase.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-zinc-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Build Your Profile</h4>
                      <p className="text-zinc-400 text-sm">
                        Use Web3 applications normally. Your activity automatically builds your V-Score. 
                        Optionally add credentials (KYC, achievements).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-zinc-800 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Use It Everywhere</h4>
                      <p className="text-zinc-400 text-sm">
                        Visit any VDID-integrated application, click "Login with VDID". Your reputation 
                        is instantly recognized. Enjoy benefits: lower fees, better rates, premium access.
                      </p>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection title="For Developers">
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Installation</h4>
                  <CodeBlock
                    language="bash"
                    code={`# npm
npm install @vdid/sdk

# yarn
yarn add @vdid/sdk

# pnpm
pnpm add @vdid/sdk`}
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Basic Usage</h4>
                  <CodeBlock
                    language="typescript"
                    code={`import { VDID } from '@vdid/sdk';

// Initialize
const vdid = new VDID({ network: 'base' });

// Create new identity
const identity = await vdid.create();
console.log(identity.did);
// did:vdid:base:0x8a7b3c4d5e6f...

// Resolve existing DID
const document = await vdid.resolve('did:vdid:base:0x...');

// Verify user meets requirements
const verified = await vdid.verify({
  did: userDID,
  requirements: {
    minVScore: 200,
    credentials: ['proof-of-humanity']
  }
});

if (verified.valid) {
  // Grant access with confidence
}`}
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Add VDID Login Button</h4>
                  <CodeBlock
                    language="html"
                    code={`<!-- Include SDK -->
<script src="https://cdn.vdid.io/sdk/v1/vdid.min.js"></script>

<!-- Add login button -->
<div id="vdid-login"></div>

<script>
  VDID.init({
    network: 'base',
    element: '#vdid-login',
    onSuccess: (result) => {
      console.log('Authenticated:', result.did);
      console.log('V-Score:', result.vscore);
    },
    onError: (error) => {
      console.error('Auth failed:', error);
    }
  });
</script>`}
                  />
                </div>
              </SubSection>
            </section>

            {/* Chapter 4: DID Specification */}
            <section className="mb-16">
              <SectionHeader
                id="did-specification"
                title="DID Specification"
                description="Technical specification for the did:vdid method"
              />

              <SubSection title="DID Syntax">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4">
                  <code className="text-[#5865F2]">did:vdid:&lt;network&gt;:&lt;identifier&gt;</code>
                </div>
                <Table
                  headers={["Component", "Description", "Example"]}
                  rows={[
                    ["Scheme", 'Always "did"', "did"],
                    ["Method", 'Always "vdid"', "vdid"],
                    ["Network", "Blockchain network", "base, ethereum, polygon"],
                    ["Identifier", "Unique identifier (address)", "0x8a7b...ef12"],
                  ]}
                />
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Example DIDs</h4>
                  <CodeBlock
                    code={`did:vdid:base:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
did:vdid:ethereum:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
did:vdid:polygon:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12`}
                  />
                </div>
              </SubSection>

              <SubSection title="DID Document Structure">
                <CodeBlock
                  language="json"
                  code={`{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/secp256k1-2019/v1",
    "https://vdid.io/contexts/v1"
  ],
  "id": "did:vdid:base:0x8a7b3c4d5e6f...",
  "controller": "did:vdid:base:0x8a7b3c4d5e6f...",
  "verificationMethod": [{
    "id": "did:vdid:base:0x8a7b...#keys-1",
    "type": "EcdsaSecp256k1VerificationKey2019",
    "controller": "did:vdid:base:0x8a7b...",
    "publicKeyHex": "04a8b9c0d1e2f3..."
  }],
  "authentication": ["did:vdid:base:0x8a7b...#keys-1"],
  "service": [{
    "id": "did:vdid:base:0x8a7b...#profile",
    "type": "VDIDProfile",
    "serviceEndpoint": "https://vdid.io/profile/0x8a7b..."
  }],
  "vdid:addresses": {
    "base": "0x8a7b3c4d5e6f...",
    "ethereum": "0x8a7b3c4d5e6f...",
    "polygon": "0x8a7b3c4d5e6f..."
  },
  "vdid:vscore": {
    "current": 720,
    "level": "Trusted"
  }
}`}
                />
              </SubSection>

              <SubSection title="Key Derivation">
                <p className="text-zinc-400 mb-4">
                  VDID uses BIP-39/BIP-44 compliant key derivation to generate addresses across chains:
                </p>
                <CodeBlock
                  code={`Master Seed (Your Recovery Phrase)
    │
    ├── m/44'/60'/0'/0/0  → Ethereum/BASE/Polygon/Arbitrum
    ├── m/44'/501'/0'/0'  → Solana (future)
    └── m/44'/784'/0'/0'  → Sui (future)

One recovery phrase = One identity across all chains`}
                />
              </SubSection>

              <SubSection title="DID Operations">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Create</h4>
                    <CodeBlock
                      code={`const identity = await vdid.create({
  // Optional: provide existing key
  // privateKey: '0x...'
});`}
                    />
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Resolve</h4>
                    <CodeBlock
                      code={`const doc = await vdid.resolve(
  'did:vdid:base:0x8a7b...'
);`}
                    />
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Update</h4>
                    <CodeBlock
                      code={`await vdid.update({
  did: 'did:vdid:base:0x...',
  updates: { service: [...] },
  signer: wallet
});`}
                    />
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Deactivate</h4>
                    <CodeBlock
                      code={`await vdid.deactivate({
  did: 'did:vdid:base:0x...',
  signer: wallet
});`}
                    />
                  </div>
                </div>
              </SubSection>
            </section>

            {/* Chapter 5: Verifiable Credentials */}
            <section className="mb-16">
              <SectionHeader
                id="credentials"
                title="Verifiable Credentials"
                description="Portable proofs of attributes and achievements"
              />

              <SubSection title="Credential Types">
                <Table
                  headers={["Type", "Description", "Issuer Requirements"]}
                  rows={[
                    ["ProofOfHumanity", "Proves user is human", "Approved humanity verifier"],
                    ["KYCVerified", "KYC completion proof", "Licensed KYC provider"],
                    ["AgeVerification", "Age threshold proof", "Government ID verifier"],
                    ["CreditScore", "Credit score range", "Credit bureau"],
                    ["EducationCredential", "Education verification", "Accredited institution"],
                    ["DeFiReputation", "DeFi protocol reputation", "DeFi protocol"],
                  ]}
                />
              </SubSection>

              <SubSection title="Credential Structure">
                <CodeBlock
                  language="json"
                  code={`{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://vdid.io/credentials/v1"
  ],
  "id": "https://credentials.vdid.io/v1/credentials/abc123",
  "type": ["VerifiableCredential", "ProofOfHumanity"],
  "issuer": {
    "id": "did:vdid:base:0xIssuerAddress...",
    "name": "VDID Humanity Verifier"
  },
  "issuanceDate": "2025-11-26T10:30:00Z",
  "expirationDate": "2026-11-26T10:30:00Z",
  "credentialSubject": {
    "id": "did:vdid:base:0xSubjectAddress...",
    "humanityVerified": true,
    "verificationMethod": "biometric"
  },
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2025-11-26T10:30:00Z",
    "verificationMethod": "did:vdid:base:0xIssuer...#keys-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NksifQ..."
  }
}`}
                />
              </SubSection>

              <SubSection title="Credential Operations">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Issue Credential</h4>
                    <CodeBlock
                      code={`const credential = await vdid.credentials.issue({
  subject: 'did:vdid:base:0xSubject...',
  type: 'ProofOfHumanity',
  claims: {
    humanityVerified: true,
    verificationMethod: 'biometric'
  },
  expiresAt: '2026-11-26',
  signer: issuerWallet
});`}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Verify Credential</h4>
                    <CodeBlock
                      code={`const result = await vdid.credentials.verify(credentialId);

// Result:
// {
//   valid: true,
//   credential: { ... },
//   checks: {
//     signature: true,
//     notExpired: true,
//     notRevoked: true,
//     issuerActive: true
//   }
// }`}
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection title="Selective Disclosure">
                <p className="text-zinc-400 mb-4">
                  Prove specific claims without revealing the entire credential using zero-knowledge proofs.
                </p>
                <CodeBlock
                  code={`// Prove age > 18 without revealing birthdate
const proof = await vdid.credentials.selectiveDisclose({
  credential: fullCredential,
  disclose: {
    country: true,    // Reveal country
    verifiedAt: true  // Reveal verification date
  },
  derive: {
    // Derive these claims without revealing source
    ageOver18: { from: 'dateOfBirth', condition: 'gt', value: 18 },
    ageOver21: { from: 'dateOfBirth', condition: 'gt', value: 21 }
  },
  signer: subjectWallet
});

// Result:
// {
//   disclosed: { country: "USA", verifiedAt: "2025-11-26" },
//   derived: { ageOver18: true, ageOver21: true },
//   proof: "0x..." // ZK proof
// }`}
                />
              </SubSection>
            </section>

            {/* Chapter 6: V-Score System */}
            <section className="mb-16">
              <SectionHeader
                id="vscore"
                title="V-Score System"
                description="Portable reputation that aggregates on-chain behavior"
              />

              <SubSection title="Score Components">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h4 className="font-semibold text-white">Activity Score (30%)</h4>
                      </div>
                      <ul className="text-zinc-400 text-sm space-y-1">
                        <li>• Transaction frequency and consistency</li>
                        <li>• Protocol diversity</li>
                        <li>• Holding patterns</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h4 className="font-semibold text-white">Financial Score (35%)</h4>
                      </div>
                      <ul className="text-zinc-400 text-sm space-y-1">
                        <li>• Loan repayment history</li>
                        <li>• Collateral management</li>
                        <li>• Asset stability</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <h4 className="font-semibold text-white">Social Score (20%)</h4>
                      </div>
                      <ul className="text-zinc-400 text-sm space-y-1">
                        <li>• DAO participation</li>
                        <li>• Community contributions</li>
                        <li>• Peer attestations</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <h4 className="font-semibold text-white">Trust Score (15%)</h4>
                      </div>
                      <ul className="text-zinc-400 text-sm space-y-1">
                        <li>• Account age</li>
                        <li>• Verification level</li>
                        <li>• Security practices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Score Levels">
                <Table
                  headers={["Range", "Level", "Description", "Benefits"]}
                  rows={[
                    ["0-199", "Newcomer", "New or minimal activity", "Basic access"],
                    ["200-399", "Active", "Regular participant", "Reduced fees"],
                    ["400-599", "Established", "Consistent positive history", "Priority features"],
                    ["600-799", "Trusted", "Strong reputation", "Lower collateral requirements"],
                    ["800-1000", "Elite", "Exceptional track record", "Premium access, highest benefits"],
                  ]}
                />
              </SubSection>

              <SubSection title="V-Score API">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Get V-Score</h4>
                    <CodeBlock
                      code={`const score = await vdid.vscore.get('did:vdid:base:0x...');

// Result:
// {
//   current: 720,
//   level: 'Trusted',
//   components: {
//     activity: 245,
//     financial: 280,
//     social: 120,
//     trust: 110
//   },
//   percentile: 85,
//   updated: '2025-11-26T10:30:00Z'
// }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Verify Score Threshold (ZK Proof)</h4>
                    <CodeBlock
                      code={`// Generate ZK proof - proves score >= 500 without revealing actual score
const proof = await vdid.vscore.generateProof({
  did: 'did:vdid:base:0x...',
  threshold: 500,
  signer: wallet
});

// Verifier validates without seeing actual score
const valid = await vdid.vscore.verifyProof(proof);
// true - user has score >= 500
// false - user has score < 500`}
                    />
                  </div>
                </div>
              </SubSection>
            </section>

            {/* Chapter 7: Authentication */}
            <section className="mb-16">
              <SectionHeader
                id="authentication"
                title="Authentication"
                description="Multiple authentication methods for maximum flexibility"
              />

              <SubSection title="Supported Methods">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <Shield className="h-8 w-8 text-[#5865F2] mb-3" />
                    <h4 className="font-semibold text-white mb-2">SIWE</h4>
                    <p className="text-zinc-400 text-sm">
                      Sign-In with Ethereum. Connect your wallet and sign a message to authenticate.
                    </p>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <Lock className="h-8 w-8 text-[#5865F2] mb-3" />
                    <h4 className="font-semibold text-white mb-2">Passkeys</h4>
                    <p className="text-zinc-400 text-sm">
                      WebAuthn-based passwordless authentication using biometrics or security keys.
                    </p>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <Code className="h-8 w-8 text-[#5865F2] mb-3" />
                    <h4 className="font-semibold text-white mb-2">OAuth 2.0</h4>
                    <p className="text-zinc-400 text-sm">
                      Use VDID as an OAuth provider for third-party applications.
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection title="SIWE Authentication Flow">
                <CodeBlock
                  code={`// 1. Server generates challenge
const challenge = \`vdid-auth:\${Date.now()}:\${crypto.randomUUID()}\`;

// 2. Client signs challenge with wallet
const auth = await vdid.authenticate({
  did: 'did:vdid:base:0x...',
  challenge: challenge,
  domain: window.location.origin,
  signer: wallet
});

// 3. Server verifies signature
const valid = await vdid.verify({
  did: auth.did,
  signature: auth.signature,
  message: challenge
});

// 4. Issue session token
if (valid) {
  const session = createSession(auth.did);
}`}
                />
              </SubSection>

              <SubSection title="Challenge-Response Protocol">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 font-mono text-sm">
                  <pre className="text-zinc-300">{`┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  1. Request challenge                 │
    │  ─────────────────────────────────────>
    │                                       │
    │  2. Challenge + nonce                 │
    │  <─────────────────────────────────────
    │                                       │
    │  3. Sign message with wallet          │
    │  ─────────────────────────────────────>
    │                                       │
    │  4. Verify signature + issue token    │
    │  <─────────────────────────────────────
    │                                       │`}</pre>
                </div>
              </SubSection>
            </section>

            {/* Chapter 8: Privacy & ZKP */}
            <section className="mb-16">
              <SectionHeader
                id="privacy"
                title="Privacy & ZKP"
                description="Zero-knowledge proofs for privacy-preserving verification"
              />

              <SubSection title="ZKP Use Cases">
                <Table
                  headers={["Use Case", "What's Proven", "What Stays Private"]}
                  rows={[
                    ["Age verification", "age >= threshold", "Exact birthdate"],
                    ["V-Score threshold", "score >= threshold", "Exact score"],
                    ["Balance check", "balance >= amount", "Exact balance"],
                    ["Credential holding", "Has credential type", "Credential details"],
                    ["Address ownership", "Controls address", "Linking to other addresses"],
                  ]}
                />
              </SubSection>

              <SubSection title="Generating ZK Proofs">
                <CodeBlock
                  code={`// Age verification without revealing birthdate
const proof = await vdid.zkp.generateAgeProof({
  credential: ageCredential,
  minAge: 18,
  signer: wallet
});

// Verify proof (verifier never sees actual birthdate)
const valid = await vdid.zkp.verifyAgeProof({
  proof: proof,
  minAge: 18,
  credentialHash: expectedHash
});`}
                />
              </SubSection>

              <SubSection title="Data Sovereignty">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoCard title="You Control Your Data">
                    <ul className="space-y-1">
                      <li>• <strong>View:</strong> See exactly what data exists</li>
                      <li>• <strong>Manage:</strong> Add, remove, or update credentials</li>
                      <li>• <strong>Share:</strong> Selectively disclose to applications</li>
                      <li>• <strong>Revoke:</strong> Withdraw access at any time</li>
                    </ul>
                  </InfoCard>
                  <InfoCard title="Encryption Layers">
                    <ul className="space-y-1">
                      <li>• <strong>At Rest:</strong> AES-256-GCM encryption</li>
                      <li>• <strong>In Transit:</strong> TLS 1.3 only</li>
                      <li>• <strong>Keys:</strong> User-controlled, never transmitted</li>
                      <li>• <strong>Storage:</strong> Encrypted off-chain data</li>
                    </ul>
                  </InfoCard>
                </div>
              </SubSection>
            </section>

            {/* Chapter 9: API Reference */}
            <section className="mb-16">
              <SectionHeader
                id="api"
                title="API Reference"
                description="REST and GraphQL APIs for VDID integration"
              />

              <SubSection title="Base URLs">
                <Table
                  headers={["Environment", "URL"]}
                  rows={[
                    ["Production", "https://api.vdid.io/v1"],
                    ["Testnet", "https://api.testnet.vdid.io/v1"],
                  ]}
                />
              </SubSection>

              <SubSection title="Authentication">
                <CodeBlock
                  code={`// All API requests require authentication
Authorization: Bearer <api-key>

// Rate limits returned in headers
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1732618800`}
                />
              </SubSection>

              <SubSection title="Endpoints">
                <div className="space-y-4">
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-mono rounded">GET</span>
                      <code className="text-zinc-300">/identifiers/{"{did}"}</code>
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">Resolve a DID to its document</p>
                    <CodeBlock
                      code={`// Response
{
  "didDocument": { ... },
  "didResolutionMetadata": {
    "contentType": "application/did+json",
    "retrieved": "2025-11-26T10:30:00Z"
  }
}`}
                    />
                  </div>

                  <div className="border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-mono rounded">GET</span>
                      <code className="text-zinc-300">/vscore/{"{did}"}</code>
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">Get V-Score for a DID</p>
                    <CodeBlock
                      code={`// Response
{
  "did": "did:vdid:base:0x...",
  "score": 720,
  "level": "Trusted",
  "components": {
    "activity": 245,
    "financial": 280,
    "social": 120,
    "trust": 110
  },
  "updated": "2025-11-26T10:30:00Z"
}`}
                    />
                  </div>

                  <div className="border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs font-mono rounded">POST</span>
                      <code className="text-zinc-300">/credentials/verify</code>
                    </div>
                    <p className="text-zinc-400 text-sm mb-2">Verify a credential</p>
                    <CodeBlock
                      code={`// Request
{
  "credentialId": "abc123"
}

// Response
{
  "valid": true,
  "credential": { ... },
  "checks": {
    "signature": true,
    "notExpired": true,
    "notRevoked": true
  }
}`}
                    />
                  </div>
                </div>
              </SubSection>

              <SubSection title="Rate Limits">
                <Table
                  headers={["Tier", "Requests/min", "Requests/day"]}
                  rows={[
                    ["Free", "60", "1,000"],
                    ["Starter", "300", "10,000"],
                    ["Growth", "1,000", "100,000"],
                    ["Enterprise", "Custom", "Custom"],
                  ]}
                />
              </SubSection>
            </section>

            {/* Chapter 10: SDK & Libraries */}
            <section className="mb-16">
              <SectionHeader
                id="sdk"
                title="SDK & Libraries"
                description="Official SDKs for multiple platforms"
              />

              <SubSection title="Available SDKs">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">JavaScript/TypeScript</h4>
                    <CodeBlock code={`npm install @vdid/sdk`} />
                    <p className="text-zinc-400 text-sm mt-2">
                      Full-featured SDK for Node.js and browsers.
                    </p>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">React</h4>
                    <CodeBlock code={`npm install @vdid/react`} />
                    <p className="text-zinc-400 text-sm mt-2">
                      React hooks and components for easy integration.
                    </p>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Python</h4>
                    <CodeBlock code={`pip install vdid-sdk`} />
                    <p className="text-zinc-400 text-sm mt-2">
                      Python SDK for backend services.
                    </p>
                  </div>
                  <div className="border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Go</h4>
                    <CodeBlock code={`go get github.com/vdid/go-sdk`} />
                    <p className="text-zinc-400 text-sm mt-2">
                      Go SDK for high-performance applications.
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection title="React Integration">
                <CodeBlock
                  code={`import { VDIDProvider, useVDID, LoginButton } from '@vdid/react';

// Wrap app with provider
function App() {
  return (
    <VDIDProvider network="base">
      <MyApp />
    </VDIDProvider>
  );
}

// Use in components
function LoginPage() {
  const { isAuthenticated, user, login, logout } = useVDID();
  
  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.did}</p>
        <p>V-Score: {user.vscore}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
  
  return <LoginButton />;
}`}
                />
              </SubSection>
            </section>

            {/* Chapter 11: Smart Contracts */}
            <section className="mb-16">
              <SectionHeader
                id="contracts"
                title="Smart Contracts"
                description="On-chain contracts for DID management"
              />

              <SubSection title="Contract Addresses">
                <Table
                  headers={["Contract", "BASE", "Ethereum", "Polygon"]}
                  rows={[
                    ["VDIDRegistry", "0x...", "TBD", "TBD"],
                    ["VDIDCredentials", "0x...", "TBD", "TBD"],
                    ["VDIDVScore", "0x...", "TBD", "TBD"],
                  ]}
                />
              </SubSection>

              <SubSection title="VDIDRegistry Interface">
                <CodeBlock
                  language="solidity"
                  code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVDIDRegistry {
    // Events
    event DIDCreated(bytes32 indexed didIdentifier, address indexed controller);
    event DIDUpdated(bytes32 indexed didIdentifier, address indexed updater);
    event DIDDeactivated(bytes32 indexed didIdentifier);
    
    // Functions
    function createDID(bytes calldata publicKey, string calldata documentURI) 
        external returns (bytes32 didIdentifier);
    
    function updateDID(bytes32 didIdentifier, string calldata newDocumentURI, bytes calldata signature) 
        external;
    
    function resolveDID(bytes32 didIdentifier) 
        external view returns (DIDDocument memory);
    
    function deactivateDID(bytes32 didIdentifier, bytes calldata signature) 
        external;
    
    function isActive(bytes32 didIdentifier) 
        external view returns (bool);
}`}
                />
              </SubSection>

              <SubSection title="On-Chain Integration Example">
                <CodeBlock
                  language="solidity"
                  code={`contract MyDApp {
    IVDIDRegistry public vdidRegistry;
    IVDIDVScore public vdidVScore;
    
    uint256 public constant MIN_VSCORE = 500;
    
    modifier minVScore(bytes32 didIdentifier, uint256 minScore) {
        uint256 score = vdidVScore.getScore(didIdentifier);
        require(score >= minScore, "V-Score too low");
        _;
    }
    
    function premiumAction(bytes32 didIdentifier) 
        external 
        minVScore(didIdentifier, MIN_VSCORE) 
    {
        // Perform premium action
    }
    
    function getDiscount(bytes32 didIdentifier) public view returns (uint256) {
        uint256 score = vdidVScore.getScore(didIdentifier);
        
        if (score >= 800) return 20; // 20% discount
        if (score >= 600) return 10; // 10% discount
        if (score >= 400) return 5;  // 5% discount
        return 0;
    }
}`}
                />
              </SubSection>
            </section>

            {/* Chapter 12: Security */}
            <section className="mb-16">
              <SectionHeader
                id="security"
                title="Security"
                description="Security model and best practices"
              />

              <SubSection title="Threat Model">
                <Table
                  headers={["Asset", "Impact if Compromised"]}
                  rows={[
                    ["Private Keys", "Full identity control"],
                    ["DID Document", "Identity manipulation"],
                    ["Credentials", "False attestations"],
                    ["V-Score Data", "Score manipulation"],
                  ]}
                />
              </SubSection>

              <SubSection title="Security Measures">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoCard title="Key Security">
                    <ul className="space-y-1">
                      <li>• CSPRNG for key generation</li>
                      <li>• Device secure enclave storage</li>
                      <li>• MPC key sharding (optional)</li>
                      <li>• Hardware wallet support</li>
                    </ul>
                  </InfoCard>
                  <InfoCard title="Smart Contract Security">
                    <ul className="space-y-1">
                      <li>• Multiple third-party audits</li>
                      <li>• Formal verification</li>
                      <li>• Upgradeable proxy pattern</li>
                      <li>• Reentrancy protection</li>
                    </ul>
                  </InfoCard>
                  <InfoCard title="API Security">
                    <ul className="space-y-1">
                      <li>• API key + JWT authentication</li>
                      <li>• Rate limiting per-key and per-IP</li>
                      <li>• TLS 1.3 only</li>
                      <li>• Strict CORS policy</li>
                    </ul>
                  </InfoCard>
                  <InfoCard title="Data Security">
                    <ul className="space-y-1">
                      <li>• AES-256 encryption at rest</li>
                      <li>• User-controlled encryption keys</li>
                      <li>• Minimal on-chain data</li>
                      <li>• IPFS for off-chain storage</li>
                    </ul>
                  </InfoCard>
                </div>
              </SubSection>

              <SubSection title="Bug Bounty Program">
                <Table
                  headers={["Severity", "Reward", "Examples"]}
                  rows={[
                    ["Critical", "$50,000", "Key extraction, fund theft"],
                    ["High", "$20,000", "DID takeover, credential forgery"],
                    ["Medium", "$5,000", "V-Score manipulation"],
                    ["Low", "$1,000", "Information disclosure"],
                  ]}
                />
                <InfoCard title="Bug Bounty Rules" variant="warning">
                  <ul className="space-y-1">
                    <li>• Responsible disclosure required</li>
                    <li>• No public disclosure before fix</li>
                    <li>• First reporter rewarded</li>
                    <li>• No social engineering</li>
                  </ul>
                </InfoCard>
              </SubSection>
            </section>

            {/* Chapter 13: Velon Ecosystem */}
            <section className="mb-16">
              <SectionHeader
                id="ecosystem"
                title="Velon Ecosystem"
                description="VDID as the identity layer of the Velon ecosystem"
              />

              <SubSection title="Ecosystem Components">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-zinc-800 rounded-lg">
                      <div className="text-2xl mb-2">🆔</div>
                      <h4 className="font-semibold text-white">VDID</h4>
                      <p className="text-zinc-400 text-sm">Identity Layer</p>
                      <p className="text-zinc-500 text-xs mt-1">vdid.io</p>
                    </div>
                    <div className="text-center p-4 border border-zinc-800 rounded-lg">
                      <div className="text-2xl mb-2">💳</div>
                      <h4 className="font-semibold text-white">Velgoo</h4>
                      <p className="text-zinc-400 text-sm">Wallet Layer</p>
                      <p className="text-zinc-500 text-xs mt-1">velgoo.cc</p>
                    </div>
                    <div className="text-center p-4 border border-zinc-800 rounded-lg">
                      <div className="text-2xl mb-2">⚡</div>
                      <h4 className="font-semibold text-white">RTPX</h4>
                      <p className="text-zinc-400 text-sm">Behavior Value</p>
                      <p className="text-zinc-500 text-xs mt-1">rtpx.io</p>
                    </div>
                    <div className="text-center p-4 border border-zinc-800 rounded-lg">
                      <div className="text-2xl mb-2">🌐</div>
                      <h4 className="font-semibold text-white">Velon</h4>
                      <p className="text-zinc-400 text-sm">OS Layer</p>
                      <p className="text-zinc-500 text-xs mt-1">velon.one</p>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Integration Benefits">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoCard title="Velgoo Integration" variant="success">
                    <p>
                      Native VDID support in Velgoo wallet enables single sign-on across the 
                      ecosystem. Create your VDID directly in Velgoo with one tap.
                    </p>
                  </InfoCard>
                  <InfoCard title="RTPX Integration" variant="success">
                    <p>
                      RTPX reads from VDID to calculate behavior-based rewards. Higher V-Score 
                      means better reward multipliers.
                    </p>
                  </InfoCard>
                </div>
              </SubSection>
            </section>

            {/* Chapter 14: FAQ */}
            <section className="mb-16">
              <SectionHeader
                id="faq"
                title="FAQ"
                description="Frequently asked questions"
              />

              <div className="space-y-4">
                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">What is VDID?</h4>
                  <p className="text-zinc-400 text-sm">
                    VDID (Velon Decentralized Identity) is a protocol that gives you a single, 
                    portable identity across all of Web3. Your identity, credentials, and 
                    reputation follow you everywhere.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Is VDID free?</h4>
                  <p className="text-zinc-400 text-sm">
                    Creating a VDID is free. Some advanced features and credentials may have 
                    associated costs.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Which blockchains does VDID support?</h4>
                  <p className="text-zinc-400 text-sm">
                    Launch: BASE. Coming in 2026: Ethereum, Polygon, Arbitrum. More chains will 
                    be added based on community demand.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Who controls my VDID?</h4>
                  <p className="text-zinc-400 text-sm">
                    You do. Only you have the keys to your VDID. No company, including Velon, 
                    can access, modify, or revoke your identity without your permission.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Is my data stored on-chain?</h4>
                  <p className="text-zinc-400 text-sm">
                    Only your DID identifier and public credentials are on-chain. Private data 
                    is encrypted and stored off-chain, controlled entirely by you.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">What happens if I lose my recovery phrase?</h4>
                  <p className="text-zinc-400 text-sm">
                    Your recovery phrase is the master key to your VDID. If lost, your identity 
                    cannot be recovered. We're developing social recovery options for future versions.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">How does V-Score work?</h4>
                  <p className="text-zinc-400 text-sm">
                    V-Score aggregates your on-chain activity across multiple dimensions (activity, 
                    financial behavior, social participation, trust factors) into a single reputation 
                    number. Higher scores unlock benefits across integrated applications.
                  </p>
                </div>

                <div className="border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Can VDID see my personal information?</h4>
                  <p className="text-zinc-400 text-sm">
                    No. Your private data is encrypted with keys only you control. VDID cannot 
                    access your personal information.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-800 pt-8 mt-16">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-white mb-3">Resources</h4>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li>
                      <a href="https://docs.vdid.io" className="hover:text-white flex items-center gap-1">
                        Documentation <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://github.com/vdid" className="hover:text-white flex items-center gap-1">
                        GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://api.vdid.io" className="hover:text-white flex items-center gap-1">
                        API Reference <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Community</h4>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li>
                      <a href="https://discord.gg/vdid" className="hover:text-white flex items-center gap-1">
                        Discord <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://twitter.com/vdid_io" className="hover:text-white flex items-center gap-1">
                        Twitter <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                    <li>
                      <a href="https://t.me/vdid_official" className="hover:text-white flex items-center gap-1">
                        Telegram <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Contact</h4>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li>General: hello@vdid.io</li>
                    <li>Developers: developers@vdid.io</li>
                    <li>Partnerships: partners@vdid.io</li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-zinc-500 text-sm mt-8 pb-8">
                © 2025 Velon Group Limited. All rights reserved.
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
