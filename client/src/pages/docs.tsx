import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Shield, Search, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

const FULL_TECHNICAL_CONTENT = `# VDID Technical Whitepaper
## Developer Documentation & Protocol Specification

**Version 1.0 | November 2025**
**vdid.io | docs.vdid.io**

---

## Table of Contents

1. Introduction
2. Architecture Overview
3. DID Specification
4. Smart Contracts
5. Verifiable Credentials
6. V-Score System
7. Privacy & Cryptography
8. SDK Reference
9. API Reference
10. Integration Guide
11. Security Model
12. Appendix

---

# Chapter 1: Introduction

## 1.1 Purpose of This Document

This technical whitepaper provides comprehensive documentation for developers integrating with the VDID (Velon Decentralized Identity) protocol. It covers:

- Protocol architecture and design decisions
- DID method specification (did:vdid)
- Smart contract interfaces and ABIs
- Verifiable credentials implementation
- V-Score calculation methodology
- Privacy-preserving features (ZKP)
- SDK and API references
- Security considerations

## 1.2 Target Audience

This document is intended for:

- **Smart Contract Developers** building on VDID
- **Backend Engineers** integrating VDID authentication
- **Frontend Developers** implementing VDID login flows
- **Security Auditors** reviewing VDID implementations
- **Protocol Researchers** studying decentralized identity

## 1.3 Prerequisites

Readers should be familiar with:

- Ethereum/EVM smart contract development
- Cryptographic primitives (ECDSA, hashing)
- W3C DID and Verifiable Credentials standards
- RESTful API design
- JavaScript/TypeScript (for SDK examples)

---

# Chapter 2: Architecture Overview

## 2.1 System Architecture

VDID operates as a four-layer architecture:

**APPLICATION LAYER** - Velgoo, DApps, and third-party integrations
**SERVICE LAYER** - SDK, REST API Gateway, Resolver Service
**PROTOCOL LAYER** - DID Registry, Credential Vault, V-Score Engine, Privacy Layer
**BLOCKCHAIN LAYER** - BASE (Primary), Ethereum, Polygon, Arbitrum

## 2.2 Component Overview

### 2.2.1 DID Registry
The core smart contract managing DID creation, updates, and resolution.

| Function | Description |
|----------|-------------|
| \`createDID()\` | Creates a new VDID |
| \`updateDID()\` | Updates DID document |
| \`resolveDID()\` | Returns DID document |
| \`deactivateDID()\` | Deactivates a DID |
| \`transferController()\` | Changes DID controller |

### 2.2.2 Credential Vault
Manages verifiable credentials issuance, storage, and verification.

| Function | Description |
|----------|-------------|
| \`issueCredential()\` | Issues new credential |
| \`verifyCredential()\` | Verifies credential signature |
| \`revokeCredential()\` | Revokes issued credential |
| \`getCredentials()\` | Lists user credentials |

### 2.2.3 V-Score Engine
Calculates and maintains behavioral reputation scores.

| Function | Description |
|----------|-------------|
| \`calculateScore()\` | Computes V-Score |
| \`getScore()\` | Returns current V-Score |
| \`updateFactors()\` | Updates score factors |
| \`getHistory()\` | Returns score history |

## 2.3 Design Principles

### 2.3.1 User Sovereignty
- Users control their private keys
- No centralized key custody
- Self-custodial by default

### 2.3.2 Privacy by Design
- Minimal on-chain data
- Off-chain encrypted storage
- Zero-knowledge proofs for verification

### 2.3.3 Interoperability
- W3C DID Core compliance
- W3C Verifiable Credentials support
- EIP-712 typed data signing

### 2.3.4 Progressive Decentralization
- Phase 1: Hybrid (some centralized services)
- Phase 2: Federated (multiple operators)
- Phase 3: Fully decentralized (DAO governed)

## 2.4 Technology Stack

| Layer | Technology |
|-------|------------|
| Primary Chain | BASE (Ethereum L2) |
| Smart Contracts | Solidity 0.8.x |
| Storage | IPFS + Ceramic |
| Indexing | The Graph |
| SDK | TypeScript |
| API | REST + GraphQL |
| Cryptography | secp256k1, BLS12-381 |
| ZKP | Circom + snarkjs |

---

# Chapter 3: DID Specification

## 3.1 DID Method: did:vdid

VDID implements the W3C DID Core specification with the \`did:vdid\` method.

### 3.1.1 DID Syntax

\`\`\`
did:vdid:<network>:<identifier>

Examples:
- did:vdid:base:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
- did:vdid:ethereum:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
- did:vdid:polygon:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
\`\`\`

### 3.1.2 Network Identifiers

| Network | Identifier | Chain ID |
|---------|------------|----------|
| BASE Mainnet | \`base\` | 8453 |
| Ethereum Mainnet | \`ethereum\` | 1 |
| Polygon Mainnet | \`polygon\` | 137 |
| Arbitrum One | \`arbitrum\` | 42161 |

## 3.2 DID Document Structure

Every VDID has an associated DID Document following W3C standards containing:
- Verification methods (public keys)
- Authentication endpoints
- Service endpoints
- V-Score and credential information
- Cross-chain addresses

## 3.3 DID Operations

### 3.3.1 Create (Register)
\`\`\`typescript
import { VDID } from '@vdid/sdk';
const vdid = new VDID({ network: 'base' });
const identity = await vdid.create();
console.log(identity.did);
// did:vdid:base:0x8a7b3c4d5e6f7890abcdef1234567890abcdef12
\`\`\`

### 3.3.2 Resolve (Read)
\`\`\`typescript
const document = await vdid.resolve('did:vdid:base:0x8a7b...');
console.log(document.verificationMethod);
console.log(document['vdid:vscore']);
\`\`\`

### 3.3.3 Update
\`\`\`typescript
await vdid.update({
  did: 'did:vdid:base:0x8a7b...',
  updates: {
    service: [{
      id: '#new-service',
      type: 'LinkedDomains',
      serviceEndpoint: 'https://example.com'
    }]
  },
  signer: wallet
});
\`\`\`

## 3.4 Key Derivation

### 3.4.1 BIP-44 Derivation Path

VDID uses BIP-44 compliant key derivation:

\`\`\`
m / purpose' / coin_type' / account' / change / address_index

VDID paths:
- Ethereum/BASE/L2: m/44'/60'/0'/0/0
- Solana (future): m/44'/501'/0'/0'
\`\`\`

### 3.4.2 Multi-Chain Key Generation

\`\`\`typescript
import { VDID } from '@vdid/sdk';
import { HDKey } from '@vdid/crypto';

const mnemonic = 'abandon abandon abandon ... about';
const hdKey = HDKey.fromMnemonic(mnemonic);

const keys = {
  ethereum: hdKey.derive("m/44'/60'/0'/0/0"),
  base: hdKey.derive("m/44'/60'/0'/0/0"),
  polygon: hdKey.derive("m/44'/60'/0'/0/0")
};
\`\`\`

---

# Chapter 4: Smart Contracts

## 4.1 Contract Architecture

VDID uses upgradeable smart contracts through TransparentUpgradeableProxy pattern:

- **VDIDRegistry**: Core DID management (createDID, updateDID, resolveDID, deactivateDID)
- **VDIDCredentials**: Credential issuance and verification (issue, verify, revoke, list)
- **VDIDVScore**: Behavioral score calculation (calculate, update, query)
- **VDIDStorage**: Shared storage layer

## 4.2 Contract Interfaces

### VDIDRegistry Interface

\`\`\`solidity
interface IVDIDRegistry {
  function createDID(
    bytes calldata publicKey,
    string calldata initialDocument
  ) external returns (bytes32 didIdentifier);
  
  function updateDID(
    bytes32 didIdentifier,
    string calldata newDocument,
    bytes calldata signature
  ) external;
  
  function resolveDID(
    bytes32 didIdentifier
  ) external view returns (string memory document);
  
  function deactivateDID(
    bytes32 didIdentifier,
    bytes calldata signature
  ) external;
}
\`\`\`

### VDIDCredentials Interface

\`\`\`solidity
interface IVDIDCredentials {
  function issueCredential(
    bytes32 subject,
    bytes32 credentialType,
    bytes calldata credentialData,
    uint256 expiresAt
  ) external returns (bytes32 credentialId);
  
  function verifyCredential(
    bytes32 credentialId,
    bytes calldata proof
  ) external view returns (bool valid);
  
  function revokeCredential(
    bytes32 credentialId
  ) external;
}
\`\`\`

---

# Chapter 5: Verifiable Credentials

## 5.1 Credential Types

### 5.1.1 Standard Credential Types

| Type | Description | Issuer |
|------|-------------|--------|
| \`ProofOfHumanity\` | Proves user is human | Approved verifier |
| \`KYCVerified\` | KYC completion proof | Licensed KYC provider |
| \`AgeVerification\` | Age threshold proof | ID verifier |
| \`EducationCredential\` | Education verification | Institution |
| \`DeFiReputation\` | DeFi protocol reputation | DeFi protocol |

## 5.2 Credential Structure

VDID uses W3C Verifiable Credential format with:
- Issuer information (DID and name)
- Subject identifier
- Credential claims
- Issuance and expiration dates
- Cryptographic proof (signature)
- Revocation status

## 5.3 Credential Operations

### 5.3.1 Issue Credential
\`\`\`typescript
const credential = await vdid.credentials.issue({
  subject: 'did:vdid:base:0xSubject...',
  type: 'ProofOfHumanity',
  claims: {
    humanityVerified: true,
    verificationMethod: 'biometric'
  },
  expiresAt: new Date('2026-11-26').toISOString(),
  signer: issuerWallet
});
\`\`\`

### 5.3.2 Verify Credential
\`\`\`typescript
const result = await vdid.credentials.verify(credentialId);
console.log({
  valid: result.valid,
  checks: {
    signature: true,
    notExpired: true,
    notRevoked: true,
    issuerActive: true
  }
});
\`\`\`

---

# Chapter 6: V-Score System

## 6.1 Overview

V-Score is VDID's portable reputation system aggregating on-chain behavior:

**Total Score: 0-1000**
- Activity Score (30%): 0-300 points
- Financial Score (35%): 0-350 points
- Social Score (20%): 0-200 points
- Trust Score (15%): 0-150 points

## 6.2 Score Components

### 6.2.1 Activity Score (30%)

Measures on-chain interaction patterns:
- Transaction count and frequency
- Protocol diversity
- Consistent activity over time
- Transaction volume (log scale)
- Recent activity bonus

### 6.2.2 Financial Score (35%)

Evaluates financial responsibility:
- Loan repayment history (on-time)
- Collateral health and ratios
- Asset stability and diversification
- No/few liquidations
- Healthy credit utilization

### 6.2.3 Social Score (20%)

Assesses community participation:
- DAO participation and voting
- Forum contributions and proposals
- Peer endorsements/attestations
- Verified social connections

### 6.2.4 Trust Score (15%)

Reflects account credibility:
- Account age (time since DID creation)
- Verification level (KYC/credentials)
- Security practices (2FA, key rotation)
- No security incidents

## 6.3 Score Levels

| Range | Level | Description |
|-------|-------|-------------|
| 0-199 | Newcomer | New or minimal activity |
| 200-399 | Active | Regular participant |
| 400-599 | Established | Consistent positive history |
| 600-799 | Trusted | Strong reputation |
| 800-1000 | Elite | Exceptional track record |

## 6.4 V-Score API

### 6.4.1 Get V-Score
\`\`\`typescript
const score = await vdid.vscore.get('did:vdid:base:0x...');
console.log({
  current: 720,
  level: 'Trusted',
  components: {
    activity: 245,
    financial: 280,
    social: 120,
    trust: 110
  },
  percentile: 85
});
\`\`\`

### 6.4.2 Verify V-Score Threshold
\`\`\`typescript
const meets = await vdid.vscore.verify({
  did: 'did:vdid:base:0x...',
  minScore: 500
});
// Returns proof without revealing exact score
\`\`\`

---

# Chapter 7: Privacy & Cryptography

## 7.1 Cryptographic Primitives

### 7.1.1 Key Types

| Algorithm | Use Case | Standard |
|-----------|----------|----------|
| secp256k1 | Primary signing | Bitcoin/Ethereum |
| Ed25519 | High-performance signing | SSH, Signal |
| X25519 | Key agreement (ECDH) | TLS, Signal |
| BLS12-381 | Threshold signatures | Ethereum 2.0 |
| Poseidon | ZK-friendly hashing | Circom |

## 7.2 Privacy Features

### 7.2.1 Zero-Knowledge Proofs

Prove attributes without revealing underlying data:

| Want to Prove | What's Revealed | What Stays Private |
|---------------|-----------------|-------------------|
| Age ≥ 18 | "Yes, over 18" | Actual birthdate |
| V-Score ≥ 500 | "Yes, qualifies" | Exact score |
| KYC completed | "Yes, verified" | Personal documents |

### 7.2.2 Selective Disclosure

Users can selectively share credentials:
- Reveal specific claims
- Derive new claims without revealing source
- Generate ZK proofs for conditions
- Never reveal unnecessary information

## 7.3 Security Model

### 7.3.1 Threat Model and Mitigations

| Threat | Mitigation |
|--------|-----------|
| Private key compromise | MPC key storage, hardware wallets |
| Credential forgery | Cryptographic signatures |
| Sybil attacks | V-Score requirement, proof-of-humanity |
| Data breach | Encryption, selective disclosure |

### 7.3.2 Smart Contract Security

- Upgradeable contracts with time locks
- Multi-sig admin controls
- Formal verification for critical functions
- Third-party audits

---

# Chapter 8: SDK Reference

## 8.1 Installation

\`\`\`bash
npm install @vdid/sdk
\`\`\`

## 8.2 Initialization

\`\`\`typescript
import { VDID } from '@vdid/sdk';

const vdid = new VDID({
  network: 'base',
  rpcUrl: 'https://mainnet.base.org',
  resolverUrl: 'https://resolver.vdid.io'
});
\`\`\`

## 8.3 Core Methods

### Identity Management
- \`vdid.create()\` - Create new DID
- \`vdid.resolve(did)\` - Resolve DID document
- \`vdid.update(did, updates)\` - Update DID
- \`vdid.deactivate(did)\` - Deactivate DID

### Credentials
- \`vdid.credentials.issue(subject, type, claims)\` - Issue credential
- \`vdid.credentials.verify(id)\` - Verify credential
- \`vdid.credentials.list(did)\` - List credentials
- \`vdid.credentials.revoke(id)\` - Revoke credential

### V-Score
- \`vdid.vscore.get(did)\` - Get current V-Score
- \`vdid.vscore.verify(did, minScore)\` - Verify score threshold
- \`vdid.vscore.history(did, from, to)\` - Get score history

---

# Chapter 9: API Reference

## 9.1 REST API Endpoints

### Create DID
\`\`\`
POST /v1/identities/create
{
  "publicKey": "0x...",
  "network": "base"
}
\`\`\`

### Resolve DID
\`\`\`
GET /v1/identities/{did}
\`\`\`

### Get V-Score
\`\`\`
GET /v1/identities/{did}/vscore
\`\`\`

### Issue Credential
\`\`\`
POST /v1/credentials/issue
{
  "subject": "did:vdid:base:0x...",
  "type": "ProofOfHumanity",
  "claims": { ... }
}
\`\`\`

---

# Chapter 10: Integration Guide

## 10.1 For DApps

### Step 1: Install SDK
\`\`\`bash
npm install @vdid/sdk
\`\`\`

### Step 2: Initialize
\`\`\`typescript
const vdid = new VDID({ network: 'base' });
\`\`\`

### Step 3: Authenticate Users
\`\`\`typescript
const auth = await vdid.authenticate({
  message: 'Sign to authenticate',
  signer: window.ethereum
});
\`\`\`

## 10.2 For Protocols

### Reputation-Based Access
\`\`\`typescript
const qualifies = await vdid.verify({
  did: userDID,
  requirements: {
    minVScore: 500,
    credentials: ['kyc-verified']
  }
});

if (qualifies.valid) {
  enablePremiumFeatures(user);
}
\`\`\`

---

# Chapter 11: Security Model

## 11.1 Security Principles

1. **User Sovereignty** - Users maintain control of private keys
2. **Minimal Trust** - Cryptographic verification preferred over trust
3. **Defense in Depth** - Multiple security layers
4. **Transparency** - Open, auditable implementation

## 11.2 Best Practices

- Always verify signatures before accepting claims
- Use hardware wallets for high-value operations
- Rotate keys regularly
- Monitor account activity
- Enable 2FA where available
- Keep recovery phrases secure and offline

---

# Chapter 12: Appendix

## A. Glossary

- **DID**: Decentralized Identifier - globally unique, user-controlled identifier
- **DID Document**: Machine-readable document containing DID metadata
- **Credential**: Verifiable claim issued by one party about another
- **V-Score**: Portable reputation score aggregating on-chain behavior
- **ZKP**: Zero-Knowledge Proof - cryptographic proof without revealing underlying data
- **EVM**: Ethereum Virtual Machine
- **Smart Contract**: Self-executing code on blockchain

## B. Related Standards

- W3C DID Core: https://www.w3.org/TR/did-core/
- W3C Verifiable Credentials: https://www.w3.org/TR/vc-data-model/
- BIP-32/44: Hierarchical Deterministic Wallets
- EIP-712: Typed structured data signing

## C. Resources

- VDID Documentation: https://docs.vdid.io
- GitHub Repository: https://github.com/velon-network/vdid
- Community Discord: https://discord.gg/velon
- Security Contact: security@vdid.io`;

const FULL_PUBLIC_CONTENT = `# VDID Public Whitepaper
## The Identity Protocol for Web3

**Version 1.0 | November 2025**
**vdid.io**

---

# Executive Summary

## The Identity Problem in Web3

Web3 promised ownership and sovereignty. Yet the average crypto user manages **4.7 separate wallets**, repeats **KYC processes 12+ times** across platforms, and has **no portable reputation** that follows them across the ecosystem.

Despite blockchain's transparency, users remain fragmented digital identities, starting from zero with every new application.

**VDID changes this.**

VDID (Velon Decentralized Identity) is a unified identity protocol that transforms how users exist in Web3. By combining W3C DID standards with behavioral intelligence and cross-chain interoperability, VDID creates a single, portable, user-controlled identity layer that works across all applications, chains, and services.

## What VDID Offers

**For Users**: Own your identity. One login for all of Web3. Your reputation follows you everywhere.

**For Developers**: Integrate identity in minutes. Access verified users. Build on trust, not assumptions.

**For Applications**: Reduce fraud, streamline onboarding, unlock personalization—all while respecting user privacy.

## The VDID Difference

| Feature | Traditional Web3 | VDID |
|---------|-----------------|------|
| Identity | Per-wallet, fragmented | Unified across all chains |
| Reputation | Non-portable, starts at zero | Portable V-Score follows you |
| KYC | Repeat on every platform | Verify once, use everywhere |
| Privacy | All or nothing | Selective disclosure with ZKP |
| Data Ownership | Platforms own your data | You own and control your data |

---

# Chapter 1: Introduction

## 1.1 The Vision

> *"Your identity should work as seamlessly in Web3 as it does in the physical world."*

When you walk into a bank, a store, or a friend's home, your identity travels with you. Your reputation precedes you. People recognize who you are without requiring proof from scratch each time.

Web3 promised this same experience digitally. Blockchain was supposed to enable portable, sovereign identity. Instead, we got fragmentation, repetition, and anonymity.

VDID exists to fulfill Web3's original promise—building the identity layer that makes users more powerful, applications more useful, and the entire ecosystem more trustworthy.

## 1.2 The Mission

**To become the standard identity infrastructure for Web3, enabling seamless, secure, and user-controlled identity across all applications and chains.**

## 1.3 Core Principles

### User Sovereignty
Users own their identity. No company, government, or protocol can revoke, modify, or access a user's VDID without explicit consent.

### Privacy by Design
Built on minimal disclosure. Users can prove attributes without revealing underlying data through zero-knowledge proofs.

### Interoperability First
Built on W3C DID standards, compatible with major blockchains, designed for both Web3 and traditional systems.

### Progressive Decentralization
Starting with pragmatic UX, progressively decentralizing as the protocol matures.

## 1.4 Position in the Velon Ecosystem

VDID operates as the **Identity Layer** within the Velon ecosystem, deeply integrated with:
- **Velgoo**: Wallet Layer
- **RTPX**: Behavior Value Layer

While integrated with Velon, VDID is designed as an **open protocol** that any Web3 application can integrate.

---

# Chapter 2: The Problem

## 2.1 Wallet Fragmentation

**The average crypto user manages 4.7 different wallets.**

Each wallet is a separate identity:
- Multiple seed phrases to remember
- Assets scattered across wallets
- Separate security practices for each
- Reputation starts at zero in each ecosystem

## 2.2 Repetitive KYC

**Users complete KYC verification 12+ times on average.**

Each exchange, DeFi protocol, and Web3 service demands fresh verification:
- Same documents submitted repeatedly
- Multiple companies storing copies of sensitive data
- User friction at every new platform
- Privacy risks multiplied

## 2.3 Non-Portable Reputation

**Your history on one platform means nothing on another.**

A user with 5 years of perfect payment history on one lending protocol has zero reputation when joining another. Traders with verified track records start anonymous on new DEXs.

## 2.4 Sybil Vulnerability

**Without verified identity, applications cannot distinguish humans from bots.**

- Airdrops captured by farmers
- Governance manipulated by sock puppets
- Community initiatives gamed by bad actors
- Honest users disadvantaged

---

# Chapter 3: The VDID Solution

## 3.1 What is VDID?

VDID (Velon Decentralized Identity) is a unified identity protocol providing:

1. **Decentralized Identifier (DID)** — A globally unique, user-controlled identifier
2. **Verifiable Credentials** — Portable proofs of attributes and achievements
3. **Behavioral Profile (V-Score)** — Aggregated on-chain history as portable reputation
4. **Data Sovereignty** — User-controlled data with optional monetization

## 3.2 The VDID Identifier

Every VDID follows the W3C DID specification:

\`\`\`
did:vdid:base:0x1234567890abcdef...
     │    │    │
     │    │    └── User's unique identifier
     │    └─────── Primary chain
     └──────────── VDID method
\`\`\`

## 3.3 Key Features

### Feature 1: One Identity, All Chains

Create one VDID that works across all supported blockchains:
- Authenticate on Ethereum DApps
- Trade on BASE DEXs
- Participate in Polygon DAOs
- Access Arbitrum lending protocols

All while maintaining a single, unified reputation.

### Feature 2: Verifiable Credentials

Collect credentials from trusted issuers:

| Credential Type | Examples |
|-----------------|----------|
| **Identity** | KYC verification, government ID, proof of humanity |
| **Achievement** | Education, certifications, community contributions |
| **Financial** | Credit history, transaction record, collateral |

Credentials are:
- ✅ Stored under your control
- ✅ Verifiable without contacting the issuer
- ✅ Selectively shareable

### Feature 3: V-Score (Behavioral Profile)

VDID aggregates on-chain activity into a **V-Score** — your portable reputation:

**V-Score Components:**
- Activity Score (30%): Transaction frequency, protocol diversity, consistency
- Financial Score (35%): Loan repayment, collateral management, asset stability
- Social Score (20%): DAO participation, community contributions, peer attestations
- Trust Score (15%): Account age, verification level, security practices

### Feature 4: Data Sovereignty

You fully control your identity data:
- **View**: See exactly what data exists in your profile
- **Manage**: Add, remove, or update credentials
- **Share**: Selectively disclose to specific applications
- **Revoke**: Withdraw access at any time

---

# Chapter 4: How It Works

## 4.1 User Journey: Getting Started

**Step 1: Create Your VDID**
- Download Velgoo wallet
- Tap "Create VDID"
- Securely backup your recovery phrase
- Your VDID is created: did:vdid:base:0x8a7b...

**Step 2: Build Your Profile**
- Use Web3 applications normally
- Your activity automatically builds your V-Score
- Optionally add credentials (KYC, achievements)
- Watch your reputation grow

**Step 3: Use It Everywhere**
- Visit any VDID-integrated application
- Click "Login with VDID"
- Your reputation is instantly recognized
- Enjoy benefits: lower fees, better rates, premium access

## 4.2 User Journey: Proving Attributes

**Traditional Way (without VDID):**
- Upload passport/ID
- Wait for verification
- Your birthdate stored in their database
- Repeat on every platform

**VDID Way:**
- Service requests: "Prove age ≥ 18"
- VDID generates zero-knowledge proof
- Proof confirms: "Yes, user is over 18"
- Your actual birthdate is NEVER revealed
- Verification instant, privacy preserved

## 4.3 Developer Integration

\`\`\`javascript
import { VDID } from '@vdid/sdk';

// Initialize
const vdid = new VDID({ network: 'base' });

// Create new identity
const identity = await vdid.create();
console.log(identity.did);

// Authenticate existing user
const auth = await vdid.authenticate({
  did: 'did:vdid:base:0x...',
  challenge: serverChallenge
});

// Verify user meets requirements
const verified = await vdid.verify({
  did: userDID,
  requirements: {
    minVScore: 200,
    credentials: ['proof-of-humanity']
  }
});

if (verified.valid) {
  grantAccess(user);
}
\`\`\`

---

# Chapter 5: Technology

## 5.1 Standards Compliance

VDID is built on open standards:

| Standard | Purpose |
|----------|---------|
| **W3C DID Core** | Decentralized identifier specification |
| **W3C Verifiable Credentials** | Credential data model |
| **BIP-39/44** | Key derivation and wallet recovery |
| **EIP-712** | Typed structured data signing |

## 5.2 DID Document

Every VDID has an associated DID Document:

\`\`\`json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
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
  "vdid:vscore": 720
}
\`\`\`

## 5.3 Multi-Chain Support

VDID uses deterministic key derivation (BIP-44) to generate addresses across chains:

\`\`\`
Master Seed (Your Recovery Phrase)
    │
    ├── m/44'/60'/0'/0/0  → Ethereum/BASE/Polygon/Arbitrum
    ├── m/44'/501'/0'/0'  → Solana (future)
    └── m/44'/784'/0'/0'  → Sui (future)
\`\`\`

**One recovery phrase = One identity across all chains**

## 5.4 Privacy & Security

### Zero-Knowledge Proofs

Prove attributes without revealing data:

| Want to Prove | What's Revealed | What Stays Private |
|---------------|-----------------|-------------------|
| Age ≥ 18 | "Yes, user is over 18" | Actual birthdate |
| V-Score ≥ 500 | "Yes, score qualifies" | Exact score |
| KYC completed | "Yes, verified by issuer X" | Personal documents |

### Security Measures

| Layer | Protection |
|-------|------------|
| Key Storage | MPC (Multi-Party Computation) |
| Transport | TLS 1.3, Certificate Pinning |
| Authentication | Challenge-Response Protocol |
| Smart Contracts | Third-party Audited |
| User Data | AES-256 Encryption |

---

# Chapter 6: Use Cases

## 6.1 For Users

### DeFi Access
- **Before**: Provide 150% collateral because protocol doesn't know you
- **After**: High V-Score = lower collateral (110%), better rates

### Airdrop Eligibility
- **Before**: Farm with multiple wallets, get flagged as Sybil
- **After**: One verified VDID proves you're a real, active user

### Cross-Platform Reputation
- **Before**: 5 years on Uniswap means nothing on new DEX
- **After**: Your history travels with you, instant recognition

## 6.2 For Developers

### Sybil Resistance
\`\`\`javascript
const isHuman = await vdid.verify({
  did: userDID,
  credentials: ['proof-of-humanity']
});
\`\`\`

### Reputation-Based Features
\`\`\`javascript
const vScore = await vdid.getVScore(userDID);
if (vScore >= 500) {
  enablePremiumFeatures(user);
}
\`\`\`

### Streamlined Onboarding
\`\`\`javascript
const hasKYC = await vdid.hasCredential(userDID, 'kyc-verified');
if (hasKYC) {
  skipKYCFlow(user);
}
\`\`\`

## 6.3 For Applications

| Application Type | VDID Benefit |
|------------------|--------------|
| **Lending Protocols** | Risk-adjusted rates based on V-Score |
| **DAOs** | One-person-one-vote with humanity proof |
| **NFT Marketplaces** | Verified creator badges |
| **Gaming** | Anti-cheat identity verification |
| **Social Platforms** | Bot prevention, reputation systems |

---

# Chapter 7: Roadmap

## Development Timeline

**2026 Q1-Q2: Foundation**
- ✓ VDID Protocol launch on BASE
- ✓ Core smart contracts deployed
- ✓ SDK v1.0 release
- ✓ Velgoo wallet integration
- Target: 50,000 VDIDs

**2026 Q3-Q4: Expansion**
- □ Ethereum mainnet deployment
- □ Polygon deployment
- □ Arbitrum deployment
- □ Cross-chain resolver
- □ ZKP credential verification
- Target: 500,000 VDIDs

**2027: Maturity**
- □ Enterprise integrations
- □ Data marketplace beta
- □ Advanced privacy features
- □ 10+ major app integrations
- Target: 2,000,000 VDIDs

**2028+: Ecosystem Scale**
- □ Full decentralization
- □ 10+ chain support
- □ 100+ app integrations
- □ Industry standard adoption
- Target: 10,000,000+ VDIDs

---

# Chapter 8: Getting Started

## For Users

### Step 1: Get a VDID-Compatible Wallet

Download **Velgoo** at velgoo.cc — the official Velon ecosystem wallet with native VDID support.

### Step 2: Create Your VDID

Open the wallet → Tap "Create VDID" → Backup your recovery phrase → Done!

### Step 3: Start Using It

Visit any VDID-integrated application, click "Login with VDID", and enjoy your portable identity.

## For Developers

### Integration Steps

1. **Install SDK**: \`npm install @vdid/sdk\`
2. **Initialize**: Create VDID instance with your network
3. **Authenticate Users**: Use VDID login flow
4. **Check Reputation**: Query V-Score or credentials
5. **Customize Rules**: Set minimum V-Score, required credentials

---

# Conclusion

VDID represents a fundamental shift in how digital identity works across Web3. By unifying fragmented identities, enabling portable reputation, and preserving user privacy, VDID unlocks a more trustworthy, more inclusive Web3 ecosystem.

For more information, visit **docs.vdid.io** or join our community on Discord.`;

export default function Docs() {
  const [activeTab, setActiveTab] = useState("public");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const content = activeTab === "public" ? FULL_PUBLIC_CONTENT : FULL_TECHNICAL_CONTENT;
  
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return content;
    const query = searchQuery.toLowerCase();
    const lines = content.split('\n');
    const matched = lines.filter(line => line.toLowerCase().includes(query));
    return matched.join('\n');
  }, [content, searchQuery, activeTab]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-secondary bg-background/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-sm text-white">VELON<span className="text-primary">ID</span></span>
            </div>
          </Link>
          <span className="text-muted-foreground text-xs">Documentation</span>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search documentation..." 
              className="pl-9 bg-secondary border-secondary text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="link-discord">Discord</a>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-secondary bg-card overflow-y-auto sticky top-16 h-[calc(100vh-64px)]">
          <div className="p-6 space-y-4">
            {/* Tab Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentation</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("public")}
                  className={`text-xs px-3 py-1.5 rounded transition-colors ${
                    activeTab === "public" 
                      ? "bg-primary text-primary-foreground font-semibold" 
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="button-tab-public"
                >
                  Public
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`text-xs px-3 py-1.5 rounded transition-colors ${
                    activeTab === "technical" 
                      ? "bg-primary text-primary-foreground font-semibold" 
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="button-tab-technical"
                >
                  Technical
                </button>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-muted-foreground uppercase">Quick Links</p>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors py-1">📖 Introduction</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors py-1">🏗️ Architecture</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors py-1">🔐 Security</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors py-1">💻 SDK</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors py-1">🚀 Getting Started</a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-4xl px-12 py-12 prose prose-invert max-w-none">
            <div className="space-y-6">
              {filteredContent.split('\n\n').map((section, idx) => {
                if (!section.trim()) return null;
                
                // Handle headers
                if (section.startsWith('# ')) {
                  const title = section.replace(/^# /, '').trim();
                  return (
                    <div key={idx} className="space-y-2">
                      <h1 className="text-3xl font-bold text-white">{title}</h1>
                      <div className="h-1 w-20 bg-primary rounded"></div>
                    </div>
                  );
                }
                if (section.startsWith('## ')) {
                  const title = section.replace(/^## /, '').trim();
                  return <h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">{title}</h2>;
                }
                if (section.startsWith('### ')) {
                  const title = section.replace(/^### /, '').trim();
                  return <h3 key={idx} className="text-lg font-semibold text-white mt-6 mb-3">{title}</h3>;
                }

                // Handle code blocks
                if (section.includes('```')) {
                  const parts = section.split('```');
                  return (
                    <div key={idx} className="space-y-2">
                      {parts.map((part, i) => {
                        if (i % 2 === 0) {
                          return part.trim() ? <p key={i} className="text-muted-foreground text-sm">{part}</p> : null;
                        }
                        return (
                          <div key={i} className="relative">
                            <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground">
                              <code>{part.trim()}</code>
                            </pre>
                            <button
                              onClick={() => copyCode(part.trim())}
                              className="absolute top-2 right-2 p-1.5 bg-primary/20 hover:bg-primary/30 rounded transition-colors"
                              data-testid="button-copy"
                            >
                              {copiedCode === part.trim() ? (
                                <Check className="w-4 h-4 text-primary" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Handle tables
                if (section.includes('|')) {
                  return (
                    <div key={idx} className="overflow-x-auto my-4">
                      <table className="w-full text-xs border-collapse">
                        <tbody>
                          {section.split('\n').map((row, i) => (
                            row.trim().startsWith('|') ? (
                              <tr key={i} className={i === 1 ? "border-b border-secondary" : ""}>
                                {row.split('|').filter(cell => cell.trim()).map((cell, j) => (
                                  <td key={j} className="border border-secondary/30 p-3 text-muted-foreground">
                                    {cell.trim().replace(/^-+$/, '')}
                                  </td>
                                ))}
                              </tr>
                            ) : null
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Handle lists
                if (section.includes('- ')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                      {section.split('\n').map((item, i) => 
                        item.trim().startsWith('- ') ? (
                          <li key={i}>{item.replace(/^- /, '').trim()}</li>
                        ) : null
                      )}
                    </ul>
                  );
                }

                // Regular paragraphs
                return (
                  <p key={idx} className="text-muted-foreground leading-relaxed text-sm">
                    {section.trim()}
                  </p>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
