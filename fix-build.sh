#!/bin/bash

# Script to fix Next.js build issues
echo "🔧 Fixing Next.js build configuration..."

# Remove pnpm artifacts
echo "Removing pnpm lock file..."
rm -f pnpm-lock.yaml

# Ensure package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "Generating package-lock.json..."
    npm install
fi

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Rebuild
echo "Building application..."
npm run build

echo "✅ Build fix complete!"
