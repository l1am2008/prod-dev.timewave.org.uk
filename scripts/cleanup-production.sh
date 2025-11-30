#!/bin/bash
# Production cleanup script - removes debug logs and updates branding

echo "Cleaning up debug logs and updating branding for production..."

# Remove all [v0] console.log statements
find app lib components -type f $$ -name "*.ts" -o -name "*.tsx" $$ -exec sed -i '/console\.log("\[v0\]/d' {} +
find app lib components -type f $$ -name "*.ts" -o -name "*.tsx" $$ -exec sed -i "/console\.log('\[v0\]/d" {} +

# Remove all [v0] console.error statements  
find app lib components -type f $$ -name "*.ts" -o -name "*.tsx" $$ -exec sed -i '/console\.error("\[v0\]/d' {} +
find app lib components -type f $$ -name "*.ts" -o -name "*.tsx" $$ -exec sed -i "/console\.error('\[v0\]/d" {} +

echo "Debug logs removed successfully!"
echo "Please rebuild the application: npm run build && pm2 restart timewave-radio"
