#!/bin/bash

echo "🔧 Fixing Next.js build lock..."

# Remove the lock file
rm -f .next/lock

# Remove the entire .next directory for a clean build
rm -rf .next

echo "✅ Lock removed, starting fresh build..."

# Build the application
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart timewave-radio
    echo "✅ Application restarted!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi
