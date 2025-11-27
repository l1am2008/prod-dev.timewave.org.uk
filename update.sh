#!/bin/bash

echo "🔄 Updating Timewave Radio..."

# Navigate to project directory
cd /root/prod-dev.timewave.org.uk

echo "💾 Backing up .env.local..."
cp .env.local .env.local.backup 2>/dev/null || true

echo "🧹 Cleaning up conflicting files..."
git clean -fd

echo "🔄 Resetting local changes..."
git reset --hard HEAD

# Pull latest changes from main branch
echo "⬇️ Pulling latest changes..."
git pull origin main

echo "📂 Restoring local configuration..."
mv .env.local.backup .env.local 2>/dev/null || true

# Install any new dependencies
echo "📥 Installing dependencies..."
npm install

# Rebuild the application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart timewave-radio

echo "✅ Update complete! Application restarted."
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs timewave-radio"
