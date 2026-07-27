#!/usr/bin/env bash
set -e

echo "================================================="
echo "  InduCore Development Environment Setup"
echo "================================================="

# 1. Verify Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v20+."
    exit 1
fi
echo "✅ Node.js $(node -v) detected."

# 2. Verify pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm (npm i -g pnpm)."
    exit 1
fi
echo "✅ pnpm $(pnpm -v) detected."

# 3. Setup .env file
if [ ! -f .env ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created."
else
    echo "ℹ️ .env file already exists."
fi

# 4. Install dependencies
echo "📦 Installing workspace dependencies..."
pnpm install

echo "================================================="
echo "🎉 Setup complete! Run 'pnpm dev' to start local dev."
echo "================================================="
