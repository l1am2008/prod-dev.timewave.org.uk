#!/bin/bash

# Quick update without rebuilding (for small changes)
echo "🔄 Quick update..."

cd /root/prod-dev.timewave.org.uk

git pull origin main
pm2 restart timewave-radio

echo "✅ Done!"
