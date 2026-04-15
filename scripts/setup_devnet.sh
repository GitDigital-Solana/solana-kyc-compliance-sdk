```
/* Author: RickCreator87 | Copyright: GitDigital Solana 2026 */
/ scripts/setup_devnet.sh
```

```bash
#!/bin/bash

# Setup script for Solana Devnet - April 2026
# GitDigital Solana  (In Formation) - Aurora, Colorado

set -e

echo "🚀 GitDigital Solana KYC SDK - Devnet Setup"
echo "=============================================="
echo "Date: April 15, 2026"
echo "Jurisdiction: Colorado Digital Token Act Compliant"
echo ""

# Check prerequisites
command -v solana >/dev/null 2>&1 || { echo "❌ solana-cli not found. Please install Solana 2.0+"; exit 1; }
command -v anchor >/dev/null 2>&1 || { echo "❌ Anchor not found. Please install Anchor 0.30+"; exit 1; }

# Configure Solana CLI for Devnet
echo "📡 Configuring Solana for Devnet..."
solana config set --url https://api.devnet.solana.com
solana config set --commitment confirmed

# Create or use existing keypair
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Creating new wallet keypair..."
    solana-keygen new --no-bip39-passphrase
else
    echo "✅ Using existing wallet keypair"
fi

# Airdrop SOL for deployment
echo "💰 Requesting SOL airdrop..."
solana airdrop 10 || echo "⚠️  Airdrop failed, ensure you have sufficient SOL"

# Build the program
echo "🔨 Building Solana KYC SDK program..."
cd programs/solana-kyc-sdk
cargo build-bpf
cd ../..

# Deploy program
echo "📦 Deploying to Devnet..."
PROGRAM_ID=$(solana program deploy target/deploy/solana_kyc_sdk.so --output json | jq -r '.programId')

echo "✅ Program deployed successfully!"
echo "📋 Program ID: $PROGRAM_ID"

# Initialize registry
echo "🏛️  Initializing compliance registry..."
anchor run init-registry

# Set up Token Extensions with Transfer Hook
echo "🔧 Configuring Token-2022 with Transfer Hook..."
node scripts/configure_token_2022.js $PROGRAM_ID

echo ""
echo "✨ Devnet setup complete!"
echo "=============================================="
echo "Next steps:"
echo "1. Set PROGRAM_ID=$PROGRAM_ID in your .env"
echo "2. Run 'anchor test' to verify deployment"
echo "3. Review COMPLIANCE.md for legal requirements"
echo "=============================================="
```
