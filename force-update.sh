#!/bin/bash

echo "⚠️  FORCE UPDATE - This will overwrite ALL local changes except .env.local"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

cd /root/prod-dev.timewave.org.uk

# Backup .env.local
echo "💾 Backing up .env.local..."
cp .env.local .env.local.backup 2>/dev/null || true

# Remove ALL local changes and untracked files
echo "🧹 Removing all local changes..."
git clean -fdx
git reset --hard HEAD

# Pull latest changes
echo "⬇️ Pulling latest changes..."
git pull origin main

# Restore .env.local
echo "📂 Restoring .env.local..."
mv .env.local.backup .env.local 2>/dev/null || true

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Rebuild
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart timewave-radio

echo "✅ Force update complete!"
