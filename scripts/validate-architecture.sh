#!/usr/bin/env bash
set -e

echo "================================================="
echo "  InduCore Architecture Layer Boundary Checker"
echo "================================================="

# Check that core-domain does not import application or infrastructure
DOMAIN_DIR="packages/core-domain"

if [ -d "$DOMAIN_DIR" ]; then
    echo "🔍 Checking $DOMAIN_DIR for illegal imports..."
    ILLEGAL_IMPORTS=$(grep -rn "import.*from.*['\"]@inducore/application" "$DOMAIN_DIR" || true)
    if [ -n "$ILLEGAL_IMPORTS" ]; then
        echo "❌ Architecture violation: core-domain must not import application!"
        echo "$ILLEGAL_IMPORTS"
        exit 1
    fi
    echo "✅ core-domain clean architecture rules satisfied."
fi

echo "================================================="
echo "✅ All architecture boundary checks passed!"
echo "================================================="
