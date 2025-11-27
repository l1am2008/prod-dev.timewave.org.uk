#!/bin/bash

echo "🔄 Updating Timewave Radio..."

# Navigate to project directory
cd /root/prod-dev.timewave.org.uk

# Stash any local changes (like .env.local)
echo "📦 Stashing local changes..."
git stash

# Pull latest changes from main branch
echo "⬇️ Pulling latest changes..."
git pull origin main

# Restore local changes
echo "📂 Restoring local configuration..."
git stash pop

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
